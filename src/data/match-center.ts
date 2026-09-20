import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';

export async function getMatchById(eventId: string) {
  try {
    const q = query(
      collection(db, 'stats_partidas'), 
      where('eventId', '==', eventId), 
      limit(1)
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return null;
    }
    
    return snapshot.docs[0].data();
  } catch (error) {
    console.error(`Erro ao buscar partida ${eventId}:`, error);
    return null;
  }
}

export async function getRecentMatches(limitNum: number = 3) {
  try {
    // Busca partidas ordenadas por data decrescente
    const q = query(
      collection(db, 'stats_partidas'),
      orderBy('data', 'desc'),
      limit(20) // busca mais para poder filtrar apenas as encerradas
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return [];
    }
    
    // Filtra apenas partidas que já ocorreram (tem data anterior a agora ou tem resultado)
    const now = new Date();
    const partidas = snapshot.docs.map(doc => doc.data());
    const finalizadas = partidas.filter(p => {
      const temResultado = !!p.derivado?.resultado || !!p.derivado?.gols;
      const dataPassada = p.data ? new Date(p.data) < now : false;
      return temResultado || dataPassada;
    });
    
    return finalizadas.slice(0, limitNum);
  } catch (error) {
    console.error('Erro ao buscar últimos jogos:', error);
    return [];
  }
}

export async function getHeadToHead(adversarioId: string) {
  if (!adversarioId) return null;
  
  try {
    // Busca até as últimas 50 partidas contra este adversário
    const q = query(
      collection(db, 'stats_partidas'),
      where('adversario.idFlashscore', '==', adversarioId),
      orderBy('data', 'desc'),
      limit(50)
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return null;
    }
    
    let vitorias = 0;
    let empates = 0;
    let derrotas = 0;
    let golsPro = 0;
    let golsSofridos = 0;
    
    snapshot.forEach(doc => {
      const partida = doc.data();
      const resultado = partida.derivado?.resultado;
      const golsFla = partida.derivado?.gols?.flamengo || 0;
      const golsAdv = partida.derivado?.gols?.adversario || 0;
      
      if (resultado === 'V') vitorias++;
      else if (resultado === 'E') empates++;
      else if (resultado === 'D') derrotas++;
      
      golsPro += golsFla;
      golsSofridos += golsAdv;
    });
    
    return {
      jogos: snapshot.size,
      vitorias,
      empates,
      derrotas,
      golsPro,
      golsSofridos,
      ultimosJogos: snapshot.docs.slice(0, 5).map(doc => doc.data())
    };
  } catch (error) {
    console.error(`Erro ao buscar histórico contra ${adversarioId}:`, error);
    return null;
  }
}
