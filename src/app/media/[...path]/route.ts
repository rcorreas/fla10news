import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const R2_PUBLIC_BASE = (
  process.env.R2_PUBLIC_URL || 'https://pub-167c4450682142efad61462f5827f16f.r2.dev'
).replace(/\/$/, '');
const GCS_BUCKET = process.env.GCS_MEDIA_BUCKET || 'fla10news-media';
const TIMEOUT_MS = 8000;

/**
 * Rota pública com caminho limpo terminado em .jpg (sem query strings '?') no próprio domínio fla10.news:
 * - /media/r2/<caminho>      -> busca no Cloudflare R2
 * - /media/gcs/<caminho>     -> busca no Google Cloud Storage (fla10news-media)
 * - /media/imgur/<arquivo>   -> busca no Imgur (via cache DuckDuckGo + fallback direto)
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await context.params;
  if (!segments || segments.length < 2) {
    return new NextResponse('Not Found', { status: 404 });
  }

  const [source, ...rest] = segments;
  const relativePath = rest.map((s) => encodeURIComponent(s)).join('/');
  const headers = {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    Accept: 'image/jpeg,image/png,image/*;q=0.8,*/*;q=0.5',
  };

  try {
    let upstreamRes: Response | null = null;

    if (source === 'r2') {
      const targetUrl = `${R2_PUBLIC_BASE}/${relativePath}`;
      upstreamRes = await fetch(targetUrl, {
        headers,
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
    } else if (source === 'gcs') {
      const targetUrl = `https://storage.googleapis.com/${GCS_BUCKET}/${relativePath}`;
      upstreamRes = await fetch(targetUrl, {
        headers,
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
    } else if (source === 'imgur') {
      const imgurFile = rest[0] || '';
      if (!/^[a-zA-Z0-9]{5,12}\.(?:jpg|jpeg|png|webp)$/i.test(imgurFile)) {
        return new NextResponse('Invalid Imgur ID', { status: 400 });
      }
      const imgurUrl = `https://i.imgur.com/${imgurFile}`;
      try {
        const ddgUrl = `https://external-content.duckduckgo.com/iu/?u=${encodeURIComponent(imgurUrl)}`;
        const ddgRes = await fetch(ddgUrl, {
          headers,
          signal: AbortSignal.timeout(TIMEOUT_MS),
        });
        if (ddgRes.ok && (ddgRes.headers.get('content-type') || '').startsWith('image/')) {
          upstreamRes = ddgRes;
        }
      } catch {
        // fallback para Imgur direto abaixo
      }
      if (!upstreamRes) {
        upstreamRes = await fetch(imgurUrl, {
          headers,
          signal: AbortSignal.timeout(TIMEOUT_MS),
        });
      }
    } else {
      return new NextResponse('Unknown media source', { status: 404 });
    }

    if (!upstreamRes || !upstreamRes.ok) {
      return new NextResponse('Image not found', { status: 404 });
    }

    const contentType = upstreamRes.headers.get('content-type') || 'image/jpeg';
    if (!contentType.startsWith('image/')) {
      return new NextResponse('Invalid image content-type', { status: 415 });
    }

    const buffer = await upstreamRes.arrayBuffer();

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(buffer.byteLength),
        'Cache-Control': 'public, max-age=31536000, s-maxage=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    console.error('Error serving /media/[...path]:', err);
    return new NextResponse('Error fetching media', { status: 502 });
  }
}
