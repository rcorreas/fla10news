
import { AdBanner } from "@/components/ad-banner";
import { FileText, AlertTriangle, Copyright, UserCheck, Mail } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function ResponsabilidadePage() {
  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <div className="mb-12">
        <AdBanner width={728} height={90} />
      </div>

      <header className="text-center mb-16">
        <div className="relative mx-auto h-48 w-48 mb-4">
          <Image
            src="https://i.postimg.cc/fTvyN9vQ/image-removebg-preview-13.png"
            alt="Termo de Responsabilidade Icon"
            fill
            className="object-contain"
          />
        </div>
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-foreground">Termo de Responsabilidade</h1>
        <p className="text-xl text-muted-foreground mt-2">Uso do conteúdo e participação no FLA10 News</p>
      </header>

      <main className="prose prose-lg max-w-none text-foreground/90 text-justify space-y-12 
                       [&_h2]:font-headline [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:text-primary 
                       [&_h2]:border-b [&_h2]:pb-2 [&_h2]:mb-4 [&_h2]:flex [&_h2]:items-center [&_h2]:gap-3
                       [&_strong]:font-bold [&_p]:leading-relaxed
                       [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2">

        <section>
          <p>
            Este Termo de Responsabilidade regula o uso do portal FLA10 News, integrante do grupo Canal Fla Dez, e visa garantir transparência, segurança e respeito entre o portal e seus visitantes, leitores e colaboradores.
          </p>
          <p>
            Ao acessar este site, você concorda com os termos descritos abaixo.
          </p>
        </section>

        <section>
          <h2><FileText />1. Finalidade do Portal</h2>
          <p>
            O FLA10 News é um portal de notícias e entretenimento voltado exclusivamente à cobertura do Clube de Regatas do Flamengo, incluindo futebol profissional, categorias de base, história, torcida, cultura e curiosidades.
          </p>
          <p>
            Todo o conteúdo tem caráter informativo, opinativo e não oficial.
          </p>
        </section>

        <section>
          <h2><AlertTriangle />2. Isenção de Responsabilidade</h2>
          <p>
            O FLA10 News não é afiliado oficialmente ao Clube de Regatas do Flamengo. As informações aqui publicadas não representam declarações oficiais do clube, atletas ou dirigentes.
          </p>
          <p>
            Embora busquemos sempre a veracidade das informações, não nos responsabilizamos por eventuais imprecisões ou mudanças de última hora, como alterações de jogos, escalações ou contratos.
          </p>
          <p>
            O uso de nomes, escudos e imagens do Flamengo ocorre de forma editorial, com fins jornalísticos e de apoio à divulgação do clube, respeitando os direitos de marca.
          </p>
        </section>

        <section>
          <h2><Copyright />3. Direitos Autorais e Uso de Conteúdo</h2>
          <p>
            Todo o conteúdo publicado no portal — textos, artes, imagens editadas, infográficos e vídeos — é de propriedade intelectual do FLA10 News, salvo quando creditado a terceiros.
          </p>
          <p>
            É proibida a reprodução total ou parcial de conteúdos sem autorização prévia, salvo em casos de compartilhamento com os devidos créditos e links para o site original.
          </p>
          <p>
            Conteúdos enviados por leitores (fotos, vídeos, textos ou relatos) serão avaliados pela equipe editorial e, uma vez publicados, poderão ser utilizados pelo portal com os devidos créditos.
          </p>
        </section>
        
        <section>
            <h2><UserCheck />4. Comentários e Interações</h2>
            <p>Comentários ofensivos, discriminatórios, com teor político extremista, spam ou ameaças serão removidos sem aviso prévio.</p>
            <p>O FLA10 News se reserva o direito de bloquear o acesso de usuários que infrinjam as regras de convivência.</p>
        </section>

        <section>
          <h2><Mail />5. Contato e Dúvidas</h2>
          <p>Para qualquer dúvida, correção, sugestão ou questão jurídica relacionada ao conteúdo, entre em contato conosco:</p>
           <div className="text-center bg-muted/50 p-6 rounded-lg">
                <p className="text-2xl font-mono font-bold text-primary break-all">fladeznews@gmail.com</p>
                <p className="text-muted-foreground mt-2">Ou através da nossa página de <Link href="/fale-conosco" className="text-primary hover:underline font-bold">Fale Conosco</Link>.</p>
            </div>
        </section>
        
        <footer className="text-center pt-8 border-t">
          <h2 className="font-headline text-2xl font-bold text-foreground">✅ Aceitação dos termos</h2>
          <p className="mt-4">
            Ao continuar navegando pelo portal FLA10 News, você declara estar ciente e de acordo com este Termo de Responsabilidade, e se compromete a utilizá-lo de forma ética e respeitosa.
          </p>
        </footer>

      </main>

      <div className="mt-12">
        <AdBanner width={728} height={90} />
      </div>
    </div>
  );
}
