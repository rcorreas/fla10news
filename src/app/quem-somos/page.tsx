import { AdBanner } from "@/components/ad-banner";
import { Users, Shield, Target, BookOpen, MessageSquare, Award, PenTool } from "lucide-react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { slugify } from "@/lib/utils";
import { getAllAuthorSlugs, getAuthorDetailsBySlug, getColunistasSlugs } from "@/data/columns";
import { getAuthorBySlug } from "@/data/authors";

export default async function QuemSomosPage() {
  const equipe = [
    {
      nome: "Robson Corrêa",
      cargo: "Fundador e Diretor de Conteúdo",
      bio: "Criador do Canal Fla Dez no YouTube e idealizador do portal FLA10 News. Apaixonado pelo Flamengo, dedica-se a trazer análises precisas, opiniões sinceras e notícias de primeira mão para a Nação Rubro-Negra.",
      iniciais: "RC",
    },
    {
      nome: "Thiago Silva",
      cargo: "Editor-Chefe e Jornalista Esportivo",
      bio: "Formado em Jornalismo com mais de 8 anos de experiência na cobertura do futebol carioca. Responsável pela linha editorial e pela apuração rigorosa de contratações, treinos e bastidores na Gávea e no Ninho do Urubu.",
      iniciais: "TS",
    },
    {
      nome: "Mariana Costa",
      cargo: "Repórter de Campo e Cobertura Especial",
      bio: "Jornalista apaixonada pela arquibancada. Realiza a cobertura presencial dos jogos no Maracanã, trazendo a energia da torcida e entrevistas pós-jogo direto das zonas mistas.",
      iniciais: "MC",
    },
  ];

  const equipeWithData = await Promise.all(
    equipe.map(async (membro) => {
      const slug = slugify(membro.nome);
      const authorData = await getAuthorBySlug(slug);
      return {
        ...membro,
        slug,
        avatarUrl: authorData?.image,
      };
    })
  );

  const columnSlugs = await getColunistasSlugs();
  const colunistas = await Promise.all(
      columnSlugs.map(async ({ slug }) => {
          const authorDetails = await getAuthorDetailsBySlug(slug);
          const authorData = await getAuthorBySlug(slug);
          return {
              slug,
              nome: authorData?.name || authorDetails?.author || 'Colunista',
              cargo: 'Colunista',
              bio: authorData?.description || authorDetails?.authorDescription || 'Em breve! Descrição do colunista será adicionada em breve.',
              iniciais: (authorData?.name || authorDetails?.author || 'C').substring(0, 2).toUpperCase(),
              avatarUrl: authorData?.image || authorDetails?.authorImage,
          };
      })
  );

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <div className="mb-12">
        <AdBanner width={728} height={90} />
      </div>

      <header className="text-center mb-16">
        <div className="relative mx-auto h-48 w-48 mb-4">
          <Image
            src="https://i.postimg.cc/L5LSvrxM/2511818.png"
            alt="Quem Somos Icon"
            fill
            className="object-contain"
          />
        </div>
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-foreground">Quem Somos</h1>
        <p className="text-xl text-muted-foreground mt-2">A voz da Nação Rubro-Negra na internet</p>
      </header>

      <main className="prose prose-lg max-w-none text-foreground/90 text-justify space-y-12 
                       [&_h2]:font-headline [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:text-primary 
                       [&_h2]:border-b [&_h2]:pb-2 [&_h2]:mb-4 [&_h2]:flex [&_h2]:items-center [&_h2]:gap-3
                       [&_strong]:font-bold [&_p]:leading-relaxed">

        <section>
          <h2><BookOpen />Nossa História</h2>
          <p>
            O portal <strong>FLA10 News</strong> nasceu como uma extensão natural do sucesso do <strong>Canal Fla Dez</strong> no YouTube. Fundado com o propósito de aproximar a imensa torcida do Flamengo do dia a dia do seu clube de coração, nosso projeto expandiu as fronteiras dos vídeos e lives para se consolidar como um dos principais portais de notícias dedicados exclusivamente ao Clube de Regatas do Flamengo.
          </p>
          <p>
            Nossa missão na internet é ser um canal livre, dinâmico e, acima de tudo, pautado na verdade e no respeito à instituição Flamengo e à sua torcida apaixonada. Acompanhamos cada treino, cada partida, cada novidade política e financeira do Mengão, entregando a informação de torcedor para torcedor, mas com a seriedade e o rigor jornalístico que a Nação merece.
          </p>
        </section>

        <section>
          <h2><Target />Missão, Visão e Valores</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 not-prose mt-6">
            <div className="bg-muted/50 p-6 rounded-lg border border-border">
              <h3 className="text-xl font-bold text-primary flex items-center gap-2 mb-3">
                <Target className="h-5 w-5" /> Missão
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Informar, entreter e conectar a torcida do Flamengo por meio de coberturas em tempo real, análises profundas e notícias exclusivas com ética e responsabilidade.
              </p>
            </div>
            <div className="bg-muted/50 p-6 rounded-lg border border-border">
              <h3 className="text-xl font-bold text-primary flex items-center gap-2 mb-3">
                <Shield className="h-5 w-5" /> Visão
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Tornar-se a maior referência digital de informação independente sobre o Clube de Regatas do Flamengo, expandindo a cobertura esportiva para todas as modalidades oficiais do clube.
              </p>
            </div>
            <div className="bg-muted/50 p-6 rounded-lg border border-border">
              <h3 className="text-xl font-bold text-primary flex items-center gap-2 mb-3">
                <Award className="h-5 w-5" /> Valores
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Ética jornalística, independência de opinião, transparência total na apuração de fatos, paixão pelo esporte e valorização constante da voz da arquibancada.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2><Users />Nossa Equipe Editorial</h2>
          <p>
            O FLA10 News orgulha-se de contar com uma equipe de produtores e jornalistas experientes, prontos para traduzir a paixão das quadras e dos gramados em textos, análises táticas e coberturas informativas precisas.
          </p>
          
          <div className="space-y-6 not-prose mt-8">
            {equipeWithData.map((membro) => (
              <div key={membro.nome} className="flex flex-col sm:flex-row gap-4 bg-muted/30 p-6 rounded-lg border border-border hover:border-primary/20 transition-colors">
                <Avatar className="h-16 w-16 border-2 border-primary/20 flex-shrink-0">
                  {membro.avatarUrl && <AvatarImage src={membro.avatarUrl} alt={membro.nome} className="object-cover" />}
                  <AvatarFallback className="bg-primary text-primary-foreground font-bold text-lg">
                    {membro.iniciais}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    <Link href={`/autores/${membro.slug}`} className="hover:text-primary hover:underline transition-colors">
                      {membro.nome}
                    </Link>
                  </h3>
                  <p className="text-sm text-primary font-semibold mb-2">{membro.cargo}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{membro.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2><PenTool />Colunistas</h2>
          <p>
            Nossos colunistas trazem opiniões fortes, análises exclusivas e a voz da arquibancada em textos semanais imperdíveis.
          </p>
          
          <div className="space-y-6 not-prose mt-8">
            {colunistas.map((colunista) => (
              <div key={colunista.nome} className="flex flex-col sm:flex-row gap-4 bg-muted/30 p-6 rounded-lg border border-border hover:border-primary/20 transition-colors">
                <Avatar className="h-16 w-16 border-2 border-primary/20 flex-shrink-0">
                  {colunista.avatarUrl && <AvatarImage src={colunista.avatarUrl} alt={colunista.nome} className="object-cover" />}
                  <AvatarFallback className="bg-primary text-primary-foreground font-bold text-lg">
                    {colunista.iniciais}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    <Link href={`/autores/${colunista.slug}`} className="hover:text-primary hover:underline transition-colors">
                      {colunista.nome}
                    </Link>
                  </h3>
                  <p className="text-sm text-primary font-semibold mb-2">{colunista.cargo}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{colunista.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2><Shield />Transparência e Independência</h2>
          <p>
            Acreditamos que a credibilidade é o nosso bem mais precioso. Embora tenhamos o coração rubro-negro, o compromisso do portal é com a verdade factual. Não hesitamos em apontar falhas de planejamento ou analisar criticamente as atuações esportivas e decisões da diretoria, pois entendemos que a crítica construtiva é indispensável para o crescimento do Flamengo.
          </p>
          <p>
            Nossas fontes são checadas cuidadosamente antes da publicação de qualquer informação, separando claramente o que é especulação de mercado ou rumor de rede social daquilo que de fato possui fundamento concreto.
          </p>
        </section>

        <footer className="text-center pt-8 border-t">
          <h2 className="font-headline text-2xl font-bold text-foreground flex items-center justify-center gap-2">
            <MessageSquare /> Junte-se à Nossa Jornada
          </h2>
          <p className="mt-4">
            O FLA10 News é um espaço democrático. Acompanhe nossas atualizações nas redes sociais e continue participando do debate sadio e construtivo nos comentários do portal. Juntos, fazemos o maior clube do mundo ainda mais gigante.
          </p>
        </footer>
      </main>

      <div className="mt-12">
        <AdBanner width={728} height={90} />
      </div>
    </div>
  );
}
