'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Shield, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export function NextMatchWidget({ nextMatch }: { nextMatch: any }) {
// ...
}

export function CampaignWidget({ campaignList }: { campaignList: any[] }) {
  const [activeTab, setActiveTab] = useState<'brasileirao' | 'libertadores'>('brasileirao');

  if (!campaignList || campaignList.length === 0) return null;

  const brasileirao = campaignList.find(c => c.competicao.toLowerCase().includes('brasileir'));
  const libertadores = campaignList.find(c => c.competicao.toLowerCase().includes('libertadores'));

  // Se não achar a libertadores no JSON, não tem problema, o botão não faz sentido, mas vamos assumir que tem.
  const campaign = activeTab === 'brasileirao' ? (brasileirao || campaignList[0]) : (libertadores || campaignList[0]);

  if (!campaign) return null;

  const isLibertadores = activeTab === 'libertadores';

  return (
    <Card 
      className="text-white shadow-lg border-2 border-white/10 overflow-hidden relative transition-all duration-300 hover:shadow-primary/20 hover:-translate-y-1"
      style={{ 
        backgroundColor: isLibertadores ? 'rgba(80, 80, 80, 0.65)' : 'rgba(0, 0, 0, 0.65)', 
        backdropFilter: 'blur(12px)' 
      }}
    >
      <CardHeader className="pb-3 border-b border-white/10 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <div className="mb-2">
              <Image 
                src="/fla10-stats-logo.png" 
                alt="Fla10 Stats" 
                width={200} 
                height={80} 
                className="h-10 w-auto object-contain"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            </div>
            <CardTitle className="text-xl font-bold flex items-center gap-2 text-white">
              Campanha {campaign.temporada}
            </CardTitle>
          </div>
          <div className="flex flex-col gap-1 items-end">
            <Badge 
              variant="outline"
              className={`cursor-pointer font-bold border-none shadow-sm transition-colors ${
                !isLibertadores ? 'bg-primary text-white hover:bg-primary/90' : 'bg-black text-white hover:bg-zinc-800'
              }`}
              onClick={() => setActiveTab('brasileirao')}
            >
              <Trophy className="h-3 w-3 mr-1" /> Brasileirão
            </Badge>
            {libertadores && (
              <Badge 
                variant="outline"
                className={`cursor-pointer font-bold border-none shadow-sm transition-colors ${
                  isLibertadores ? 'bg-primary text-white hover:bg-primary/90' : 'bg-black text-white hover:bg-zinc-800'
                }`}
                onClick={() => setActiveTab('libertadores')}
              >
                <Trophy className="h-3 w-3 mr-1" /> Libertadores
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-5">
        <div className="grid grid-cols-3 gap-3 text-center mb-6">
          <div className="p-3 rounded-lg border border-white/10 transition-colors hover:border-green-500/50" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
            <p className="text-3xl font-black text-green-500">{campaign.V || 0}</p>
            <p className="text-[10px] font-bold text-white uppercase tracking-wider mt-1">Vitórias</p>
          </div>
          <div className="p-3 rounded-lg border border-white/10 transition-colors hover:border-slate-500/50" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
            <p className="text-3xl font-black text-zinc-300">{campaign.E || 0}</p>
            <p className="text-[10px] font-bold text-white uppercase tracking-wider mt-1">Empates</p>
          </div>
          <div className="p-3 rounded-lg border border-white/10 transition-colors hover:border-red-500/50" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
            <p className="text-3xl font-black text-red-500">{campaign.D || 0}</p>
            <p className="text-[10px] font-bold text-white uppercase tracking-wider mt-1">Derrotas</p>
          </div>
        </div>

        <div className="flex justify-between items-center text-sm p-3 rounded-lg border border-white/10" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
          <div className="flex flex-col items-center flex-1">
            <span className="font-bold text-white text-lg">{campaign.golsPro || 0}</span>
            <span className="text-[10px] text-white font-semibold uppercase">⚽ Gols Pró</span>
          </div>
          <div className="w-px h-8 bg-white/10"></div>
          <div className="flex flex-col items-center flex-1">
            <span className="font-bold text-white text-lg">{campaign.golsContra || 0}</span>
            <span className="text-[10px] text-white font-semibold uppercase">🥅 Sofridos</span>
          </div>
          <div className="w-px h-8 bg-white/10"></div>
          <div className="flex flex-col items-center flex-1">
            <span className="font-bold text-white text-lg">{campaign.escanteiosPro90 || 0}</span>
            <span className="text-[10px] text-white font-semibold uppercase">🚩 Esc/J</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
