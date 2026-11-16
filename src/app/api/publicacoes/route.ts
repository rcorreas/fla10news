import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  where,
} from 'firebase/firestore/lite';
import { db, invalidateFirestoreCache } from '@/lib/firebase';
import { absoluteUrl } from '@/lib/site';

/**
 * Recebe matérias aprovadas no pipeline "redação virtual".
 *
 * Contrato: JSON versionado, idempotente por `pautaId` (usado como ID do
 * documento). Reenviar a mesma matéria com o mesmo `checksum` não escreve
 * nada; com checksum diferente, atualiza o mesmo documento.
 *
 * Segurança: exige `Authorization: Bearer <PUBLICACOES_TOKEN>`.
 */

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const SeoSchema = z.object({
  tituloSeo: z.string().default(''),
  metaDescription: z.string().default(''),
  palavraChavePrincipal: z.string().default(''),
  palavrasChaveSecundarias: z.array(z.string()).default([]),
});

const PayloadSchema = z.object({
  versao: z.literal(1),
  destino: z.string().default('fla10'),
  id: z.string().uuid(),
  pautaId: z.string().uuid(),
  status: z.literal('pronto'),
  publicar: z.boolean().optional(),
  slug: z
    .string()
    .min(3)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug inválido.'),
  titulo: z.string().min(5).max(180),
  subtitulo: z.string().min(10).max(400),
  formato: z.string().min(2),
  editoria: z.string().optional(),
  corpoHtml: z.string().min(50),
  resumoParaIa: z.string().optional(),
  seo: SeoSchema,
  fichaTecnica: z.record(z.unknown()).optional(),
  creditos: z.string().default('Redação Fla10'),
  imagemUrl: z.string().url().nullish(),
  imagemCredito: z.string().nullish(),
  dataApuracao: z.string(),
  aprovadoEm: z.string().nullish(),
  publicadoEm: z.string().nullish(),
  urlCanonica: z.string().url(),
  checksum: z.string().min(16),
});

type Payload = z.infer<typeof PayloadSchema>;

const CATEGORIA_POR_ESPORTE: Record<string, string> = {
  Futebol: 'futebol',
  Basquete: 'basquete',
  'Vôlei': 'volei',
  'E-Sports': 'e-sports',
  'Olímpicos': 'olimpicos',
};

/** Imagem local usada quando o pipeline ainda não indicou uma capa. */
const IMAGEM_PADRAO = '/imagem-canal.png';

function normalizar(valor: string): string {
  return valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/** Converte a editoria livre do pipeline ("Futebol Feminino") nas taxonomias do site. */
function mapearEditoria(editoria: string | undefined, titulo: string): {
  mainCategory: string;
  category: string;
} {
  const bruto = (editoria ?? '').trim();
  const alvo = normalizar(`${bruto} ${titulo}`);

  const mainCategory = alvo.includes('basquete')
    ? 'Basquete'
    : alvo.includes('volei')
      ? 'Vôlei'
      : alvo.includes('e-sports') || alvo.includes('esports')
        ? 'E-Sports'
        : alvo.includes('olimpic')
          ? 'Olímpicos'
          : 'Futebol';

  const partes = bruto
    .replace(/futebol/gi, '')
    .replace(/basquete/gi, '')
    .replace(/v[óo]lei/gi, '')
    .replace(/e-?sports?/gi, '')
    .replace(/ol[íi]mpic[oa]s?/gi, '')
    .replace(/^\s*(e|de|da|do|das|dos)\s+/i, '')
    .replace(/\s+(e|de|da|do|das|dos)\s*$/i, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  const category = (partes || (mainCategory === 'Futebol' ? 'Clube' : mainCategory)).slice(0, 40);

  return { mainCategory, category };
}

function autorizado(request: Request): boolean {
  const esperado = process.env.PUBLICACOES_TOKEN;
  if (!esperado) return false;

  const cabecalho = request.headers.get('authorization') ?? '';
  const recebido = cabecalho.startsWith('Bearer ') ? cabecalho.slice(7).trim() : '';
  if (!recebido) return false;

  const a = Buffer.from(recebido, 'utf8');
  const b = Buffer.from(esperado, 'utf8');
  return a.length === b.length && timingSafeEqual(a, b);
}

function dataPublicacao(payload: Payload): Date {
  const bruto = payload.publicadoEm ?? payload.aprovadoEm ?? null;
  if (bruto) {
    const data = new Date(bruto);
    if (!Number.isNaN(data.getTime())) return data;
  }
  return new Date();
}

function revalidar(slug: string, mainCategory: string): void {
  invalidateFirestoreCache();
  revalidatePath('/');
  revalidatePath('/noticias');
  revalidatePath(`/noticias/${slug}`);
  const categoria = CATEGORIA_POR_ESPORTE[mainCategory];
  if (categoria) revalidatePath(`/${categoria}`);
}

export async function GET(request: Request) {
  if (!autorizado(request)) {
    return NextResponse.json({ erro: 'Não autorizado.' }, { status: 401 });
  }
  return NextResponse.json({ ok: true, servico: 'publicacoes', versao: 1 });
}

export async function POST(request: Request) {
  if (!process.env.PUBLICACOES_TOKEN) {
    return NextResponse.json(
      { erro: 'PUBLICACOES_TOKEN não configurado no servidor.' },
      { status: 503 },
    );
  }
  if (!autorizado(request)) {
    return NextResponse.json({ erro: 'Não autorizado.' }, { status: 401 });
  }

  let corpo: unknown;
  try {
    corpo = await request.json();
  } catch {
    return NextResponse.json({ erro: 'JSON inválido.' }, { status: 400 });
  }

  const validado = PayloadSchema.safeParse(corpo);
  if (!validado.success) {
    const campos = validado.error.flatten().fieldErrors;
    return NextResponse.json({ erro: 'Payload inválido.', campos }, { status: 422 });
  }

  const payload = validado.data;
  if (payload.id !== payload.pautaId) {
    return NextResponse.json({ erro: '`id` e `pautaId` devem ser iguais.' }, { status: 422 });
  }

  try {
    const referencia = doc(db, 'news', payload.pautaId);
    const atual = await getDoc(referencia);
    const dadosAtuais = atual.exists() ? atual.data() : null;

    // Reenvio idempotente: mesmo texto, nada a escrever.
    if (
      dadosAtuais?.pipelineChecksum === payload.checksum &&
      dadosAtuais?.slug === payload.slug &&
      (dadosAtuais?.status === 'draft') === (payload.publicar === false)
    ) {
      return NextResponse.json({
        ok: true,
        acao: 'inalterada',
        id: referencia.id,
        slug: payload.slug,
        url: absoluteUrl(`/noticias/${payload.slug}`),
      });
    }

    // O slug é a URL pública: não pode colidir com outra matéria.
    const conflito = await getDocs(
      query(collection(db, 'news'), where('slug', '==', payload.slug), limit(1)),
    );
    if (!conflito.empty && conflito.docs[0].id !== referencia.id) {
      return NextResponse.json(
        {
          erro: `Já existe outra matéria com o slug "${payload.slug}" (${conflito.docs[0].id}).`,
        },
        { status: 409 },
      );
    }

    const { mainCategory, category } = mapearEditoria(payload.editoria, payload.titulo);
    const rascunho = payload.publicar === false;
    const imagem = payload.imagemUrl?.trim() || IMAGEM_PADRAO;
    const palavrasSecundarias = payload.seo.palavrasChaveSecundarias
      .map((p) => p.trim())
      .filter(Boolean)
      .join(', ');

    const dados: Record<string, unknown> = {
      mainCategory,
      category,
      title: payload.titulo,
      excerpt: payload.subtitulo,
      content: payload.corpoHtml,
      image: imagem,
      imageCredit: payload.imagemCredito?.trim() ?? '',
      dataAiHint: payload.seo.palavraChavePrincipal || 'flamengo',
      slug: payload.slug,
      publishedAt: Timestamp.fromDate(dataPublicacao(payload)),
      author: payload.creditos.trim() || 'Redação Fla10',
      metaTitle: payload.seo.tituloSeo || payload.titulo,
      metaDescription: payload.seo.metaDescription,
      focusKeyword: payload.seo.palavraChavePrincipal,
      secondaryKeywords: palavrasSecundarias,
      status: rascunho ? 'draft' : 'published',
      // Rastreabilidade do pipeline (não é exibido no site).
      pipelineId: payload.pautaId,
      pipelineVersao: payload.versao,
      pipelineChecksum: payload.checksum,
      pipelineFormato: payload.formato,
      pipelineEditoria: payload.editoria ?? '',
      pipelineResumoIa: payload.resumoParaIa ?? '',
      pipelineAtualizadoEm: serverTimestamp(),
    };

    if (!atual.exists()) {
      dados.views = 0;
      dados.createdAt = serverTimestamp();
    }

    await setDoc(referencia, dados, { merge: true });
    if (!rascunho) revalidar(payload.slug, mainCategory);

    return NextResponse.json(
      {
        ok: true,
        acao: atual.exists() ? 'atualizada' : 'criada',
        id: referencia.id,
        slug: payload.slug,
        url: absoluteUrl(`/noticias/${payload.slug}`),
      },
      { status: atual.exists() ? 200 : 201 },
    );
  } catch (err) {
    console.error('[api/publicacoes] falha ao gravar:', err);
    return NextResponse.json(
      { erro: err instanceof Error ? err.message : 'Falha ao gravar a publicação.' },
      { status: 500 },
    );
  }
}
