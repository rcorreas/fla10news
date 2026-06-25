
import { AdBanner } from "@/components/ad-banner";
import { BrainCircuit, Briefcase, Mail, Mic, Handshake } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function AssessoriaPage() {
  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <div className="mb-12">
        <AdBanner width={728} height={90} />
      </div>

      <header className="text-center mb-16">
        <div className="relative mx-auto h-48 w-48 mb-4">
            <Image
                src="https://i.postimg.cc/rmzFGZ68/image-removebg-preview-12.png"
                alt="Assessoria Icon"
                fill
                className="object-contain"
            />
        </div>
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-foreground">Assessoria</h1>
        <p className="text-xl text-muted-foreground mt-2">Atendimento profissional à imprensa, parceiros e convidados</p>
      </header>

      <main className="prose prose-lg max-w-none text-foreground/90 text-justify space-y-12 
                       [&_h2]:font-headline [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:text-primary 
                       [&_h2]:border-b [&_h2]:pb-2 [&_h2]:mb-4 [&_h2]:flex [&_h2]:items-center [&_h2]:gap-3
                       [&_strong]:font-bold [&_p]:leading-relaxed
                       [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2">

        <section>
          <p>
            O FLA10 News é um portal de notícias independente, integrante do grupo Canal Fla Dez, focado na cobertura editorial do Clube de Regatas do Flamengo em diversas frentes: futebol profissional, categorias de base, cultura rubro-negra, torcida, história, mídia e entretenimento.
          </p>
        </section>

        <section>
          <h2><Mic />Nossos Serviços</h2>
           <p>
            Nossa assessoria está disponível para atender imprensa, veículos parceiros, influenciadores, marcas e instituições interessadas em:
          </p>
          <ul>
            <li>Solicitações de entrevista com membros da equipe editorial</li>
            <li>Participação do FLA10 News em projetos especiais ou coletivas</li>
            <li>Propostas de parcerias comerciais ou editoriais</li>
            <li>Pedidos de autorização para uso de conteúdo</li>
            <li>Cobertura de eventos ligados ao Flamengo (futebol, cultura, torcida)</li>
            <li>Solicitação de press kits, releases ou dados de audiência</li>
          </ul>
        </section>
        
        <section>
            <h2><BrainCircuit />Estrutura Editorial</h2>
            <p>
                Nosso trabalho se baseia em apuração responsável, respeito à imagem do clube, e compromisso com a torcida. Atuamos com uma equipe de redatores, designers, colaboradores locais e parceiros de mídia que contribuem para manter o conteúdo sempre atualizado, criativo e engajado com a Nação Rubro-Negra.
            </p>
        </section>

        <section>
            <h2><Mail />Contato da Assessoria</h2>
             <p>Entre em contato com a nossa equipe de forma direta e profissional:</p>
            <div className="text-center bg-muted/50 p-6 rounded-lg">
                <p className="text-2xl font-mono font-bold text-primary break-all">fladeznews@gmail.com</p>
                <p className="text-muted-foreground mt-2">Atendimento de segunda a sexta-feira, das 9h às 18h.</p>
            </div>
            <p className="mt-4 text-sm text-center">
                Em casos urgentes ou com prazos editoriais apertados, utilize o campo <Link href="/fale-conosco" className="text-primary hover:underline font-bold">Fale Conosco</Link> para agilizar o primeiro contato.
            </p>
        </section>
        
        <section>
            <h2><Handshake />Parcerias</h2>
            <p>
                O FLA10 News está aberto a parcerias com:
            </p>
            <ul>
                <li>Portais de mídia esportiva</li>
                <li>Podcasts e canais no YouTube</li>
                <li>Marcas com perfil esportivo, juvenil ou popular</li>
                <li>Projetos educacionais e de memória esportiva</li>
                <li>Cobertura de eventos ligados ao Flamengo e à torcida</li>
            </ul>
            <p>
                Se você ou sua empresa deseja se conectar com a Nação, o FLA10 News é o canal certo.
            </p>
        </section>

        <footer className="text-center pt-8 border-t">
          <h2 className="font-headline text-2xl font-bold text-foreground">🔴⚫ A Nação tem voz, e nós ajudamos a amplificá-la.</h2>
          <p className="mt-4">
            Para mais informações, entre em contato com a nossa equipe de assessoria. Estamos prontos para ouvir, colaborar e fortalecer a cultura rubro-negra onde for preciso.
          </p>
        </footer>

      </main>

      <div className="mt-12">
        <AdBanner width={728} height={90} />
      </div>
    </div>
  );
}
