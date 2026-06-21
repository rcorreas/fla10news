"use client";

import { AdBanner } from "@/components/ad-banner";
import { Mail, MessageCircle, Send, CheckCircle, Clock, MapPin, Phone } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";

export default function ContatoPage() {
  const [formState, setFormState] = useState({ nome: "", email: "", assunto: "", mensagem: "" });
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simula envio de contato
    setEnviado(true);
    setTimeout(() => {
      setEnviado(false);
      setFormState({ nome: "", email: "", assunto: "", mensagem: "" });
    }, 5000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <div className="mb-12">
        <AdBanner width={728} height={90} />
      </div>

      <header className="text-center mb-16">
        <div className="relative mx-auto h-48 w-48 mb-4">
          <Image
            src="https://i.postimg.cc/L5LSvrxM/2511818.png"
            alt="Contato Icon"
            fill
            className="object-contain"
          />
        </div>
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-foreground">Contato</h1>
        <p className="text-xl text-muted-foreground mt-2">Dúvidas, parcerias, sugestões ou elogios? Fale com o FLA10 News.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="bg-muted/30 p-6 rounded-lg border border-border text-center flex flex-col items-center">
          <div className="bg-primary/10 p-3 rounded-full text-primary mb-4">
            <Mail className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-lg mb-2">E-mail Comercial</h3>
          <p className="text-sm text-muted-foreground break-all">fladeznews@gmail.com</p>
          <p className="text-xs text-muted-foreground/80 mt-2">Ideal para anúncios, press releases e parcerias.</p>
        </div>

        <div className="bg-muted/30 p-6 rounded-lg border border-border text-center flex flex-col items-center">
          <div className="bg-primary/10 p-3 rounded-full text-primary mb-4">
            <Clock className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-lg mb-2">Atendimento</h3>
          <p className="text-sm text-muted-foreground">Segunda a Sexta-Feira</p>
          <p className="text-sm text-muted-foreground">Das 09h às 18h</p>
          <p className="text-xs text-muted-foreground/80 mt-2">Retornamos em até 72 horas úteis.</p>
        </div>

        <div className="bg-muted/30 p-6 rounded-lg border border-border text-center flex flex-col items-center">
          <div className="bg-primary/10 p-3 rounded-full text-primary mb-4">
            <MessageCircle className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-lg mb-2">Redes Sociais</h3>
          <p className="text-sm text-muted-foreground">@canalfla10</p>
          <p className="text-xs text-muted-foreground/80 mt-2">Instagram, Twitter, YouTube e TikTok.</p>
        </div>
      </div>

      <main className="grid grid-cols-1 md:grid-cols-1 gap-12">
        <section className="bg-muted/20 p-8 rounded-xl border border-border">
          <h2 className="text-2xl font-headline font-bold mb-6 text-foreground flex items-center gap-3">
            <Send className="text-primary h-6 w-6" /> Envie-nos uma Mensagem
          </h2>

          {enviado ? (
            <div className="bg-green-500/10 border border-green-500/30 text-green-500 p-6 rounded-lg text-center flex flex-col items-center">
              <CheckCircle className="h-12 w-12 mb-3 text-green-500" />
              <h3 className="font-bold text-lg">Mensagem enviada com sucesso!</h3>
              <p className="text-sm mt-1">Agradecemos o seu contato. Nossa equipe retornará o mais breve possível.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="nome" className="text-sm font-semibold text-foreground">Seu Nome</label>
                  <input
                    type="text"
                    id="nome"
                    name="nome"
                    required
                    value={formState.nome}
                    onChange={handleInputChange}
                    className="w-full bg-background border border-border rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                    placeholder="Nome completo"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-semibold text-foreground">Seu E-mail</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formState.email}
                    onChange={handleInputChange}
                    className="w-full bg-background border border-border rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                    placeholder="exemplo@email.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="assunto" className="text-sm font-semibold text-foreground">Assunto</label>
                <input
                  type="text"
                  id="assunto"
                  name="assunto"
                  required
                  value={formState.assunto}
                  onChange={handleInputChange}
                  className="w-full bg-background border border-border rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                  placeholder="Qual o motivo do contato?"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="mensagem" className="text-sm font-semibold text-foreground">Mensagem</label>
                <textarea
                  id="mensagem"
                  name="mensagem"
                  rows={5}
                  required
                  value={formState.mensagem}
                  onChange={handleInputChange}
                  className="w-full bg-background border border-border rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow resize-none"
                  placeholder="Escreva sua mensagem detalhadamente..."
                />
              </div>

              <Button type="submit" className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-bold py-3 transition-colors flex items-center justify-center gap-2">
                <Send className="h-4 w-4" /> Enviar Mensagem
              </Button>
            </form>
          )}
        </section>

        <section className="prose prose-lg max-w-none text-foreground/90 mt-8">
          <h2 className="font-headline text-2xl font-bold mb-4 text-primary">📣 Outros Canais de Atendimento</h2>
          <p className="text-justify leading-relaxed">
            Se você for assessor de imprensa, atleta, patrocinador ou representante comercial e deseja tratar de pautas comerciais específicas, coberturas no local ou credenciamento de imprensa, recomendamos o envio de mensagem direta para o e-mail comercial do portal: <strong>fladeznews@gmail.com</strong>.
          </p>
          <p className="text-justify leading-relaxed">
            Para reclamações de direitos autorais ou solicitação de correções de fatos apurados, por favor consulte as diretrizes expostas na nossa página de <a href="/responsabilidade" className="text-primary hover:underline font-bold" target="_blank" rel="noopener noreferrer">Responsabilidade</a>, e envie todas as comprovações anexadas por e-mail para que possamos atuar em tempo hábil.
          </p>
        </section>
      </main>

      <div className="mt-12">
        <AdBanner width={728} height={90} />
      </div>
    </div>
  );
}
