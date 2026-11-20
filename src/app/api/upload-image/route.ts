import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const GCS_BUCKET_NAME = process.env.GCS_MEDIA_BUCKET || 'fla10news-media';
const MAX_FILE_SIZE_BYTES = 12 * 1024 * 1024; // 12 MB

function hmacSha256(key: Buffer | string, data: string): Buffer {
  return crypto.createHmac('sha256', key).update(data, 'utf8').digest();
}

function sha256Hex(data: Buffer | string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Faz upload direto para o Cloudflare R2 usando assinatura AWS Signature Version 4 nativa (node:crypto).
 */
async function uploadToCloudflareR2(
  buffer: Buffer,
  objectKey: string,
  contentType: string
): Promise<string | null> {
  const accountId = process.env.R2_ACCOUNT_ID?.trim();
  const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim();
  const bucketName = (process.env.R2_BUCKET_NAME || 'fla10news-media').trim();
  const publicBaseUrl = process.env.R2_PUBLIC_URL?.trim();

  if (!accountId || !accessKeyId || !secretAccessKey || !publicBaseUrl) {
    return null;
  }

  const host = `${accountId}.r2.cloudflarestorage.com`;
  const region = 'auto';
  const service = 's3';
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.slice(0, 8);

  const encodedKey = objectKey
    .split('/')
    .map((part) => encodeURIComponent(part))
    .join('/');
  const canonicalUri = `/${bucketName}/${encodedKey}`;
  const payloadHash = sha256Hex(buffer);
  const cacheControl = 'public, max-age=31536000, immutable';

  const canonicalHeaders =
    `cache-control:${cacheControl}\n` +
    `content-type:${contentType}\n` +
    `host:${host}\n` +
    `x-amz-content-sha256:${payloadHash}\n` +
    `x-amz-date:${amzDate}\n`;

  const signedHeaders = 'cache-control;content-type;host;x-amz-content-sha256;x-amz-date';
  const canonicalRequest = [
    'PUT',
    canonicalUri,
    '',
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join('\n');

  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    sha256Hex(canonicalRequest),
  ].join('\n');

  const kDate = hmacSha256(`AWS4${secretAccessKey}`, dateStamp);
  const kRegion = hmacSha256(kDate, region);
  const kService = hmacSha256(kRegion, service);
  const kSigning = hmacSha256(kService, 'aws4_request');
  const signature = crypto
    .createHmac('sha256', kSigning)
    .update(stringToSign, 'utf8')
    .digest('hex');

  const authorizationHeader =
    `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, ` +
    `SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const endpoint = `https://${host}${canonicalUri}`;
  const response = await fetch(endpoint, {
    method: 'PUT',
    headers: {
      Authorization: authorizationHeader,
      'Cache-Control': cacheControl,
      'Content-Type': contentType,
      'Content-Length': String(buffer.byteLength),
      'x-amz-content-sha256': payloadHash,
      'x-amz-date': amzDate,
    },
    body: new Uint8Array(buffer),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(`R2 upload failed (${response.status}): ${errText}`);
  }

  return `${publicBaseUrl.replace(/\/$/, '')}/${objectKey}`;
}

/**
 * Obtém um token OAuth2 do Google Cloud (via Metadata Server no Cloud Run ou service-account.json local).
 */
async function getGoogleCloudAccessToken(): Promise<string> {
  // 1. Tenta o Metadata Server nativo do Cloud Run / App Hosting
  try {
    const metaRes = await fetch(
      'http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token',
      {
        headers: { 'Metadata-Flavor': 'Google' },
        signal: AbortSignal.timeout(1500),
      }
    );
    if (metaRes.ok) {
      const data = await metaRes.json();
      if (data.access_token) {
        return data.access_token as string;
      }
    }
  } catch {
    // Continua para o fallback local
  }

  // 2. Fallback para desenvolvimento local usando service-account.json
  const saPath = path.join(process.cwd(), 'service-account.json');
  if (fs.existsSync(saPath)) {
    const admin = await import('firebase-admin');
    const sa = JSON.parse(fs.readFileSync(saPath, 'utf8'));
    const cred = admin.default.credential.cert(sa);
    const tokenObj = await cred.getAccessToken();
    if (tokenObj.access_token) {
      return tokenObj.access_token;
    }
  }

  throw new Error('Não foi possível obter credenciais do Google Cloud Storage.');
}

/**
 * Faz upload para o bucket público fla10news-media no Google Cloud / Firebase Storage (Opção 1).
 */
async function uploadToGoogleCloudStorage(
  buffer: Buffer,
  objectKey: string,
  contentType: string
): Promise<string> {
  const token = await getGoogleCloudAccessToken();
  const uploadUrl =
    `https://storage.googleapis.com/upload/storage/v1/b/${encodeURIComponent(GCS_BUCKET_NAME)}/o` +
    `?uploadType=media&name=${encodeURIComponent(objectKey)}`;

  const res = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': contentType,
      'Content-Length': String(buffer.byteLength),
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
    body: new Uint8Array(buffer),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`GCS upload failed (${res.status}): ${errText}`);
  }

  const encodedPath = objectKey
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');

  return `https://storage.googleapis.com/${GCS_BUCKET_NAME}/${encodedPath}`;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const rawFolder = (formData.get('folder') as string) || 'materias';
    const folder = rawFolder.replace(/[^a-zA-Z0-9_-]/g, '') || 'materias';

    if (!file || typeof (file as Blob).arrayBuffer !== 'function') {
      return NextResponse.json(
        { error: 'Nenhum arquivo de imagem enviado.' },
        { status: 400 }
      );
    }

    const blob = file as File;
    const contentType = blob.type || 'image/jpeg';
    if (!contentType.startsWith('image/')) {
      return NextResponse.json(
        { error: 'O arquivo enviado não é uma imagem válida.' },
        { status: 400 }
      );
    }

    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.byteLength === 0 || buffer.byteLength > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: 'Tamanho de imagem inválido (máximo 12 MB).' },
        { status: 400 }
      );
    }

    const ext =
      contentType === 'image/png'
        ? 'png'
        : contentType === 'image/webp'
          ? 'webp'
          : contentType === 'image/gif'
            ? 'gif'
            : 'jpg';

    const now = new Date();
    const yyyy = now.getUTCFullYear();
    const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
    const rand = crypto.randomBytes(4).toString('hex');
    const objectKey = `${folder}/${yyyy}/${mm}/${Date.now()}-${rand}.${ext}`;

    // 1. Tenta primeiro o Cloudflare R2 (Opção 3: 10 GB grátis + tráfego ilimitado gratuito)
    try {
      const r2Url = await uploadToCloudflareR2(buffer, objectKey, contentType);
      if (r2Url) {
        return NextResponse.json({
          url: r2Url,
          provider: 'cloudflare-r2',
          sizeBytes: buffer.byteLength,
        });
      }
    } catch (r2Err) {
      console.warn('Cloudflare R2 indisponível, usando fallback Google Cloud Storage:', r2Err);
    }

    // 2. Fallback automático para o Google Cloud / Firebase Storage (Opção 1: 5 GB grátis, já ativo)
    const gcsUrl = await uploadToGoogleCloudStorage(buffer, objectKey, contentType);
    return NextResponse.json({
      url: gcsUrl,
      provider: 'firebase-gcs',
      sizeBytes: buffer.byteLength,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido no upload';
    console.error('Erro em POST /api/upload-image:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
