import { AdBanner } from "@/components/ad-banner";
import { Cookie, ShieldAlert, Settings, Info, Calendar } from "lucide-react";

export default function PoliticaDeCookiesPage() {
  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <div className="mb-12">
        <AdBanner width={728} height={90} />
      </div>

      <header className="text-center mb-16">
        <div className="relative mx-auto h-24 w-24 mb-4 flex items-center justify-center bg-primary/10 rounded-full text-primary">
          <Cookie className="h-16 w-16" />
        </div>
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-foreground">Política de Cookies</h1>
        <p className="text-xl text-muted-foreground mt-2">Saiba como e por que utilizamos cookies no portal FLA10 News</p>
        <p className="text-xs text-muted-foreground mt-4 flex items-center justify-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" /> Última atualização: 24/05/2026
        </p>
      </header>

      <main className="prose prose-lg max-w-none text-foreground/90 text-justify space-y-12 
                       [&_h2]:font-headline [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:text-primary 
                       [&_h2]:border-b [&_h2]:pb-2 [&_h2]:mb-4 [&_h2]:flex [&_h2]:items-center [&_h2]:gap-3
                       [&_strong]:font-bold [&_p]:leading-relaxed
                       [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2">

        <section>
          <p>
            O portal <strong>FLA10 News</strong>, de propriedade do grupo <strong>Canal Fla Dez</strong>, utiliza cookies e tecnologias semelhantes para garantir o funcionamento correto de nosso site, entender como você interage com nossos conteúdos e personalizar sua experiência de navegação, inclusive exibindo anúncios mais relevantes.
          </p>
          <p>
            Esta Política de Cookies explica de forma transparente o que são cookies, quais tipos utilizamos, para quais finalidades e como você pode gerenciar suas preferências a qualquer momento.
          </p>
        </section>

        <section>
          <h2><Info />1. O que são Cookies?</h2>
          <p>
            Cookies são pequenos arquivos de texto enviados pelo site e gravados no navegador do seu computador, smartphone ou tablet quando você visita uma página web. Eles servem para registrar informações sobre a sua visita e suas preferências de navegação (como idioma, logins automáticos, interações e cliques), permitindo que o portal reconheça seu dispositivo em acessos futuros.
          </p>
        </section>

        <section>
          <h2><Settings />2. Por que e como utilizamos Cookies?</h2>
          <p>
            Utilizamos cookies para diversas funções essenciais e analíticas. A seguir, detalhamos os tipos de cookies que podem ser configurados em seu navegador ao acessar o FLA10 News:
          </p>
          <ul>
            <li>
              <strong>Cookies Estritamente Necessários:</strong> São indispensáveis para que o site funcione de forma segura e adequada. Eles permitem tarefas básicas, como navegação segura por páginas de login, processamento de enquetes e carregamento rápido de scripts e imagens. Sem estes cookies, o site não funciona corretamente.
            </li>
            <li>
              <strong>Cookies Analíticos e de Desempenho:</strong> Nos ajudam a coletar dados estatísticos anônimos sobre como os usuários navegam pelo site (por exemplo, quais notícias são mais lidas, tempo médio de permanência nas páginas e se ocorrem mensagens de erro). Nós utilizamos o <em>Google Analytics</em> para essa finalidade, visando otimizar a velocidade e a relevância de nosso conteúdo.
            </li>
            <li>
              <strong>Cookies de Funcionalidade:</strong> Servem para lembrar preferências e escolhas feitas por você em visitas anteriores (como manter-se conectado em sua conta de leitor ou salvar configurações visuais).
            </li>
            <li>
              <strong>Cookies de Publicidade e Redes Sociais:</strong> Como solicitamos a monetização através do <em>Google AdSense</em> e integramos recursos de compartilhamento social, cookies de publicidade são usados para exibir anúncios direcionados ao seu perfil e limitar o número de vezes que você vê um mesmo anúncio. O Google e parceiros utilizam cookies para veicular anúncios com base em suas visitas anteriores a este ou a outros sites.
            </li>
          </ul>
        </section>

        <section>
          <h2><ShieldAlert />3. Como Gerenciar ou Bloquear Cookies?</h2>
          <p>
            A maioria dos navegadores de internet está configurada de fábrica para aceitar cookies automaticamente. No entanto, você tem total controle sobre eles e pode alterar as configurações do seu navegador para bloquear novos cookies, apagar os já existentes ou receber alertas quando novos cookies forem enviados ao seu dispositivo.
          </p>
          <p>
            Para gerenciar ou desativar os cookies, clique nas instruções correspondentes ao seu navegador:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 not-prose text-center my-6">
            <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="bg-muted hover:bg-primary/10 border border-border p-4 rounded-lg text-sm font-semibold text-foreground transition-colors hover:text-primary">Google Chrome</a>
            <a href="https://support.mozilla.org/pt-BR/kb/impeca-que-sites-armazenem-cookies-e-dados-no-fir" target="_blank" rel="noopener noreferrer" className="bg-muted hover:bg-primary/10 border border-border p-4 rounded-lg text-sm font-semibold text-foreground transition-colors hover:text-primary">Mozilla Firefox</a>
            <a href="https://support.apple.com/pt-br/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="bg-muted hover:bg-primary/10 border border-border p-4 rounded-lg text-sm font-semibold text-foreground transition-colors hover:text-primary">Apple Safari</a>
            <a href="https://support.microsoft.com/pt-br/microsoft-edge/excluir-cookies-no-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="bg-muted hover:bg-primary/10 border border-border p-4 rounded-lg text-sm font-semibold text-foreground transition-colors hover:text-primary">Microsoft Edge</a>
          </div>
          <p>
            <em>Atenção:</em> A desativação de cookies, em especial os estritamente necessários, pode limitar algumas funcionalidades importantes do portal, como manter-se logado na área de comentários ou interagir em tempo real com as ferramentas interativas.
          </p>
        </section>

        <section>
          <h2><Cookie />4. Cookies de Terceiros e AdSense</h2>
          <p>
            Utilizamos fornecedores terceiros, incluindo o Google, que usam cookies para veicular anúncios baseados em visitas anteriores do usuário ao nosso site ou a outros sites na internet.
          </p>
          <p>
            Com o uso do cookie da DoubleClick, o Google e os parceiros dele podem veicular anúncios para os usuários com base nas visitas a seus sites e/ou a outros sites na internet. Você pode desativar a publicidade personalizada acessando as <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold">Configurações de anúncios do Google</a>.
          </p>
        </section>

        <section>
          <h2><Info />5. Dúvidas e Contato</h2>
          <p>
            Se você tiver qualquer dúvida sobre nossa Política de Cookies ou sobre como protegemos seus dados pessoais de navegação, fique à vontade para entrar em contato conosco pelo e-mail: <strong>fladeznews@gmail.com</strong> ou por meio da nossa página dedicada de <a href="/contato" className="text-primary hover:underline font-bold" target="_blank" rel="noopener noreferrer">Contato</a>.
          </p>
        </section>
      </main>

      <div className="mt-12">
        <AdBanner width={728} height={90} />
      </div>
    </div>
  );
}
