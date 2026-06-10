import { NextResponse } from 'next/server';
import { z } from 'zod';

// Esquema de validação com Zod
const emailSchema = z.object({
  email: z.string().email('Email inválido').max(100, 'Email muito longo'),
  recaptchaToken: z.string().optional(), // Em produção, isto seria obrigatório
});

// Rate limiting simples em memória (para Vercel/Serverless, prefira Upstash/Redis)
const rateLimit = new Map<string, { count: number; timestamp: number }>();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 1. Validar Rate Limit por IP (se disponível nos headers)
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutos
    
    if (ip !== 'unknown') {
      const record = rateLimit.get(ip);
      if (record && record.timestamp > now - windowMs) {
        if (record.count >= 5) {
          return NextResponse.json(
            { error: 'Muitas tentativas. Tente novamente mais tarde.' },
            { status: 429 }
          );
        }
        record.count++;
      } else {
        rateLimit.set(ip, { count: 1, timestamp: now });
      }
    }

    // 2. Validação estrutural do payload com Zod
    const result = emailSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: result.error.format() },
        { status: 400 }
      );
    }

    const { email, recaptchaToken } = result.data;

    // 3. Validação do reCAPTCHA v3 (Mockado para integração posterior)
    if (process.env.RECAPTCHA_SECRET_KEY && recaptchaToken) {
      const verifyRes = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`, {
        method: 'POST'
      });
      const verifyData = await verifyRes.json();
      
      if (!verifyData.success || verifyData.score < 0.5) {
        return NextResponse.json(
          { error: 'Comportamento suspeito bloqueado pelo reCAPTCHA' },
          { status: 403 }
        );
      }
    }

    // 4. Aqui você integraria com o Firestore ou Mailchimp/Sendgrid
    // Exemplo:
    // await db.collection('newsletter').add({ email, createdAt: new Date() });

    return NextResponse.json(
      { message: 'Inscrição na newsletter realizada com sucesso.' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Newsletter erro:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}
