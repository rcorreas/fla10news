import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET() {
  try {
    const filePath = join(process.cwd(), 'Arquivos', 'flamengo-rj-2026-09-13.json');
    const fileContents = readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContents);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error reading stats file:", error);
    return NextResponse.json({ error: 'Failed to read stats file' }, { status: 500 });
  }
}
