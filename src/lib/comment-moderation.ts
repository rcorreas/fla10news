export const MAX_COMMENT_LENGTH = 300;
export const MIN_COMMENT_LENGTH = 2;

const URL_OR_CONTACT_RE =
  /(https?:\/\/|www\.|[a-z0-9-]+\.(?:com|com\.br|net|org|bet|br|io|app|xyz|me|ly|tv|gg)(?:\/|\b)|t\.me\/|wa\.me\/|bit\.ly|youtu\.be|\b(?:\+?55\s?)?(?:\(?\d{2}\)?\s?)?\d{4,5}[-\s.]?\d{4}\b)/i;

const SPAM_PHRASES = [
  'ganhe dinheiro',
  'renda extra',
  'compre agora',
  'chama no zap',
  'chama no whatsapp',
  'chama no pv',
  'chama no direct',
  'link na bio',
  'acesse meu perfil',
  'tigrinho',
  'fortune tiger',
  'bet365',
  'blaze',
  'casa de aposta',
  'grupo vip',
  'sinais gratis',
  'mande um pix',
  'chave pix',
  'crypto',
  'bitcoin gratis',
  'seguidores gratis',
];

// Termos de discurso de ódio, ameaças, racismo, homofobia e ofensas graves.
// A checagem é feita após normalização de acentos e substituições (leetspeak).
const BLOCKED_TERMS = [
  'macaco',
  'macaca',
  'crioulo',
  'crioula',
  'preto imundo',
  'preto sujo',
  'negro imundo',
  'nazista',
  'hitler',
  'viado',
  'veado',
  'bicha',
  'boiola',
  'sapatona',
  'traveco',
  'retardado',
  'retardada',
  'mongoloide',
  'aleijado',
  'filho da puta',
  'filha da puta',
  'fdp',
  'arrombado',
  'arrombada',
  'desgracado',
  'desgracada',
  'vagabundo',
  'vagabunda',
  'piranha',
  'prostituta',
  'vadia',
  'corno',
  'otario',
  'babaca',
  'imbecil',
  'idiota',
  'lixo humano',
  'verme',
  'tomar no cu',
  'vai se foder',
  'vai se fuder',
  'vsf',
  'tnc',
  'pau no cu',
  'pnc',
  'caralho',
  'krl',
  'porra',
  'buceta',
  'xoxota',
  'cuzão',
  'cuzao',
  'merda',
  'bosta',
  'vai morrer',
  'tomara que morra',
  'tem que morrer',
  'vou te matar',
  'matar voce',
  'estupro',
  'estuprar',
  'pedofilo',
  'pedofilia',
];

function normalizeForModeration(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/0/g, 'o')
    .replace(/1/g, 'i')
    .replace(/3/g, 'e')
    .replace(/4/g, 'a')
    .replace(/5/g, 's')
    .replace(/7/g, 't')
    .replace(/@/g, 'a')
    .replace(/\$/g, 's')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export type ModerationResult =
  | { ok: true; text: string }
  | { ok: false; reason: string };

export function validateAndModerateComment(rawText: string): ModerationResult {
  const cleaned = rawText.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();

  if (cleaned.length < MIN_COMMENT_LENGTH) {
    return { ok: false, reason: 'Escreva um comentário antes de enviar.' };
  }

  if (cleaned.length > MAX_COMMENT_LENGTH) {
    return {
      ok: false,
      reason: `O comentário deve ter no máximo ${MAX_COMMENT_LENGTH} caracteres.`,
    };
  }

  if (URL_OR_CONTACT_RE.test(cleaned)) {
    return {
      ok: false,
      reason: 'Não é permitido publicar links, telefones ou divulgação de terceiros.',
    };
  }

  // Bloqueia repetição exagerada de caracteres (flood visual tipo "aaaaaaaaaa" ou "kkkkkkkkkk")
  if (/(.)\1{7,}/i.test(cleaned)) {
    return {
      ok: false,
      reason: 'Evite repetir o mesmo caractere várias vezes.',
    };
  }

  // Bloqueia gritaria / CAPS LOCK excessivo em frases maiores
  const letters = cleaned.replace(/[^a-zA-ZÀ-ÿ]/g, '');
  if (letters.length >= 15) {
    const upperCount = (letters.match(/[A-ZÀ-Ý]/g) || []).length;
    if (upperCount / letters.length > 0.75) {
      return {
        ok: false,
        reason: 'Evite escrever o comentário inteiro em letras maiúsculas.',
      };
    }
  }

  const normalized = normalizeForModeration(cleaned);
  const padded = ` ${normalized} `;

  for (const phrase of SPAM_PHRASES) {
    if (padded.includes(` ${normalizeForModeration(phrase)} `) || normalized.includes(normalizeForModeration(phrase))) {
      return {
        ok: false,
        reason: 'Seu comentário foi bloqueado pelo filtro anti-spam/propaganda.',
      };
    }
  }

  for (const term of BLOCKED_TERMS) {
    const normTerm = normalizeForModeration(term);
    // Palavras curtas (3-4 letras) exigem fronteira de palavra para evitar falso positivo
    if (normTerm.length <= 4) {
      if (padded.includes(` ${normTerm} `)) {
        return {
          ok: false,
          reason:
            'Comentário não publicado: o Fla10 News não permite ofensas, discurso de ódio ou ataques pessoais.',
        };
      }
    } else if (padded.includes(` ${normTerm} `) || normalized.includes(normTerm)) {
      return {
        ok: false,
        reason:
          'Comentário não publicado: o Fla10 News não permite ofensas, discurso de ódio ou ataques pessoais.',
      };
    }
  }

  return { ok: true, text: cleaned };
}
