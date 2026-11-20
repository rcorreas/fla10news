import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const TIMEOUT_MS = 8000;
const MAX_REDIRECIONAMENTOS = 3;

function ipPrivado(endereco: string): boolean {
  if (isIP(endereco) === 4) {
    const [a, b] = endereco.split('.').map(Number);
    return (
      a === 0 || a === 10 || a === 127 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 100 && b >= 64 && b <= 127)
    );
  }
  if (isIP(endereco) === 6) {
    const normalizado = endereco.toLowerCase();
    return (
      normalizado === '::1' ||
      normalizado === '::' ||
      normalizado.startsWith('fc') ||
      normalizado.startsWith('fd') ||
      normalizado.startsWith('fe80') ||
      normalizado.startsWith('::ffff:')
    );
  }
  return false;
}

/**
 * O proxy é público, então precisa recusar destinos internos (metadata do
 * provedor, localhost, rede privada) e esquemas que não sejam https.
 */
async function urlPermitida(bruto: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(bruto);
  } catch {
    throw new Error('URL inválida.');
  }

  if (url.protocol !== 'https:') throw new Error('Apenas https é permitido.');
  if (url.username || url.password) throw new Error('URL com credenciais não é permitida.');

  const enderecos = isIP(url.hostname.replace(/^\[|\]$/g, ''))
    ? [{ address: url.hostname.replace(/^\[|\]$/g, '') }]
    : await lookup(url.hostname, { all: true });

  if (!enderecos.length) throw new Error('Host não encontrado.');
  if (enderecos.some((item) => ipPrivado(item.address))) {
    throw new Error('Destino não permitido.');
  }

  return url;
}

function otimizarUrlImgurParaJpeg(url: URL): URL {
  if (!url.hostname.toLowerCase().endsWith('imgur.com')) {
    return url;
  }
  const match = url.pathname.match(/^\/([a-zA-Z0-9]{7})\.(?:png|jpg|jpeg|webp)$/i);
  if (match) {
    return new URL(`https://i.imgur.com/${match[1]}h.jpg`);
  }
  return url;
}

async function buscar(url: URL, aceitarJpeg = false): Promise<Response> {
  let atual = aceitarJpeg ? otimizarUrlImgurParaJpeg(url) : url;
  const cabecalhos = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    // AVIF é menor para exibição, mas WhatsApp/Facebook não aceitam bem em
    // og:image. `formato=jpeg` pede a versão compatível ao servidor de origem.
    Accept: aceitarJpeg
      ? 'image/jpeg,image/png,image/*;q=0.8,*/*;q=0.5'
      : 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
  };

  // Imgur frequentemente bloqueia/limita IPs de data centers (Cloud Run) com 403/429.
  // Fazemos a busca server-to-server pelo cache do DuckDuckGo e entregamos no nosso próprio domínio
  // (onde o robots.txt do fla10.news permite todos os crawlers sociais e com Content-Length explícito).
  if (atual.hostname.toLowerCase().endsWith('imgur.com')) {
    try {
      const ddgUrl = new URL(`https://external-content.duckduckgo.com/iu/?u=${encodeURIComponent(atual.toString())}`);
      const ddgResp = await fetch(ddgUrl, {
        signal: AbortSignal.timeout(TIMEOUT_MS),
        headers: cabecalhos,
      });
      if (ddgResp.ok && (ddgResp.headers.get('content-type') || '').startsWith('image/')) {
        return ddgResp;
      }
    } catch {
      // Se falhar, tenta conexão direta ao Imgur abaixo
    }
  }

  for (let salto = 0; salto <= MAX_REDIRECIONAMENTOS; salto++) {
    const resposta = await fetch(atual, {
      redirect: 'manual',
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: cabecalhos,
    });

    const redirecionamento = resposta.headers.get('location');
    if (resposta.status >= 300 && resposta.status < 400 && redirecionamento) {
      atual = await urlPermitida(new URL(redirecionamento, atual).toString());
      continue;
    }

    return resposta;
  }

  throw new Error('Redirecionamentos demais.');
}

export async function GET(request: Request) {
  const parametros = new URL(request.url).searchParams;
  const bruto = parametros.get('url');
  if (!bruto) {
    return new NextResponse('Missing url parameter', { status: 400 });
  }

  try {
    const url = await urlPermitida(bruto);
    const resposta = await buscar(url, parametros.get('formato') === 'jpeg');

    if (!resposta.ok) {
      return new NextResponse('Error fetching image from origin', { status: 502 });
    }

    const tipo = resposta.headers.get('content-type') || '';
    if (!tipo.startsWith('image/')) {
      return new NextResponse('Destino não é uma imagem', { status: 415 });
    }

    const buffer = await resposta.arrayBuffer();

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': tipo,
        'Content-Length': String(buffer.byteLength),
        'Cache-Control': 'public, max-age=31536000, s-maxage=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
        'Content-Security-Policy': "default-src 'none'",
      },
    });
  } catch (erro) {
    const mensagem = erro instanceof Error ? erro.message : 'Erro desconhecido';
    console.error('Error proxying image:', mensagem);
    return new NextResponse('Error fetching image: ' + mensagem, { status: 400 });
  }
}
