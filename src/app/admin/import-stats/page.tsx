"use client";

import { useState } from "react";
import { doc, setDoc, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function ImportStatsPage() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");

  // Firebase Firestore não aceita arrays dentro de arrays.
  // Esta função varre os dados e converte arrays aninhados em objetos.
  const sanitizeData = (data: any): any => {
    if (Array.isArray(data)) {
      // Se for array, verifica se tem algum array dentro
      const hasNestedArray = data.some(item => Array.isArray(item));
      if (hasNestedArray) {
        // Se tiver, converte o array inteiro pra um objeto com chaves numéricas
        const obj: any = {};
        data.forEach((val, i) => {
          obj[i] = sanitizeData(val);
        });
        return obj;
      }
      return data.map(sanitizeData);
    } else if (data !== null && typeof data === 'object') {
      const obj: any = {};
      for (const key in data) {
        if (data[key] !== undefined) {
          obj[key] = sanitizeData(data[key]);
        }
      }
      return obj;
    }
    return data;
  };

  const importData = async () => {
    setLoading(true);
    setProgress("Buscando arquivo JSON (pode demorar alguns segundos)...");
    
    try {
      const res = await fetch("/api/stats");
      if (!res.ok) throw new Error("Erro ao buscar JSON");
      const rawData = await res.json();
      const data = sanitizeData(rawData);
      
      setProgress("JSON carregado! Importando Agenda...");
      
      // Import Agenda (next match usually)
      if (data.agenda) {
        // Just assuming it's an object with keys or a single object.
        // Looking at our structure from before, it's a dict. Let's just save the whole thing as one document for simplicity
        // or loop if it's an array.
        await setDoc(doc(db, "stats_agenda", "current"), data.agenda);
      }

      setProgress("Importando Técnicos...");
      if (data.tecnicosDoFlamengo) {
        // Save the whole object as one doc, or multiple. Usually it's an array or dict. 
        // We'll save it as a single doc "all" to avoid looping if we don't know the exact keys yet.
        await setDoc(doc(db, "stats_tecnicos", "all"), data.tecnicosDoFlamengo);
      }

      setProgress("Importando Campanhas...");
      if (data.resumoPorCompeticaoTemporada && Array.isArray(data.resumoPorCompeticaoTemporada)) {
        // Write in batches
        let batch = writeBatch(db);
        let count = 0;
        
        for (const campanha of data.resumoPorCompeticaoTemporada) {
          // competicao-temporada as ID
          const id = `${campanha.competicao}-${campanha.temporada}`.replace(/[^a-zA-Z0-9]/g, "_");
          batch.set(doc(db, "stats_campanhas", id), campanha);
          count++;
          if (count === 50) {
            await batch.commit();
            batch = writeBatch(db);
            count = 0;
          }
        }
        if (count > 0) await batch.commit();
      }

      setProgress("Importando Partidas (isso vai demorar um pouco)...");
      if (data.partidas && Array.isArray(data.partidas)) {
        let batch = writeBatch(db);
        let count = 0;
        let total = 0;
        
        for (const partida of data.partidas) {
          const id = partida.eventId || `${partida.data}-${partida.adversario?.nome || 'adv'}`.replace(/[^a-zA-Z0-9]/g, "_");
          batch.set(doc(db, "stats_partidas", id), partida);
          count++;
          total++;
          
          if (count === 50) {
            await batch.commit();
            setProgress(`Importando Partidas... (${total}/${data.partidas.length})`);
            batch = writeBatch(db);
            count = 0;
          }
        }
        if (count > 0) {
          await batch.commit();
          setProgress(`Importando Partidas... (${total}/${data.partidas.length})`);
        }
      }

      toast({
        title: "Sucesso!",
        description: "Todos os dados foram importados com sucesso para o Firestore.",
      });
      setProgress("Importação concluída com sucesso!");

    } catch (error: any) {
      console.error(error);
      toast({
        title: "Erro na importação",
        description: error.message,
        variant: "destructive",
      });
      setProgress("Erro durante a importação.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Importar Dados Fla10 Stats</CardTitle>
          <CardDescription>
            Leia o arquivo JSON gigante e importe os dados estruturados para o Firebase Firestore.
            Esse processo vai criar/atualizar as coleções: stats_partidas, stats_agenda, stats_campanhas e stats_tecnicos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Aviso: O Firestore no plano gratuito permite até 20.000 gravações por dia. Esta operação consome gravações proporcionais ao número de jogos no arquivo.
          </p>
          
          <Button onClick={importData} disabled={loading} className="w-full">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Importando..." : "Iniciar Importação"}
          </Button>

          {progress && (
            <div className="p-4 bg-muted rounded-md text-sm font-medium text-center">
              {progress}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
