
import Image from "next/image";
import Link from "next/link";
import { AdBanner } from "@/components/ad-banner";
import { HistoryCarousel } from "@/components/home/history-carousel";
import { getHistoryArticles } from "@/data/history";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { format } from "date-fns";

async function ArticleList() {
    const articles = await getHistoryArticles();

    if (articles.length === 0) {
        return null;
    }

    return (
        <section className="mt-16 pt-12 border-t">
            <h2 className="font-headline text-3xl font-bold mb-8 text-primary">Artigos Históricos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {articles.map((article) => (
                    <Card key={article.slug} className="flex flex-col group overflow-hidden transition-all duration-300 hover:shadow-primary-lg hover:-translate-y-1">
                        <Link href={`/flahistoria/${article.slug}`} target="_blank">
                            <CardHeader className="p-0 relative">
                                <Image src={article.image} alt={article.title} width={600} height={400} className="rounded-t-lg object-cover aspect-[3/2] transition-transform duration-300 group-hover:scale-105" data-ai-hint={article.dataAiHint} />
                            </CardHeader>
                        </Link>
                        <CardContent className="flex-grow p-4 space-y-2">
                            <CardTitle className="text-lg font-bold font-body leading-tight">
                                <Link href={`/flahistoria/${article.slug}`} className="hover:text-[#FF073A] transition-colors duration-200" target="_blank">
                                    {article.title}
                                </Link>
                            </CardTitle>
                            <p className="text-sm text-muted-foreground line-clamp-3">{article.subtitle}</p>
                        </CardContent>
                        <CardFooter className="p-4 pt-0 text-xs text-muted-foreground flex justify-between items-center">
                            <div className="flex items-center gap-1.5">
                                <Clock className="h-3 w-3" />
                                <span>{format(article.publishedAt, 'dd/MM/yyyy')}</span>
                            </div>
                            <span>Por {article.author}</span>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </section>
    );
}


export default function HistoriaPage() {
  const getPageTitle = () => "História do Clube de Regatas do Flamengo";

  const historyImages = [
      { src: "https://i.postimg.cc/MTZVM3k6/1896-flamengo.jpg", alt: "Time de remo do Flamengo em 1896" },
      { src: "https://i.postimg.cc/KjRTQKvC/1914-flamengo.jpg", alt: "Equipe de futebol do Flamengo em 1914" },
      { src: "https://i.postimg.cc/D0HXN2S0/4059871.jpg", alt: "Time do Flamengo campeão" },
      { src: "https://i.postimg.cc/xj4M8P6Q/1643399982.webp", alt: "Comemoração de título do Flamengo" },
      { src: "https://i.postimg.cc/15V6qNdq/images-1.jpg", alt: "Zico com a taça do Mundial de 1981" },
      { src: "https://i.postimg.cc/W1RZ61Rf/images.jpg", alt: "Time do Flamengo posado para foto" },
  ];
  
  const footballImages = [
      { src: "https://i.postimg.cc/0QBRKNWV/1914.jpg", alt: "Equipe de futebol do Flamengo em 1914" },
      { src: "https://i.postimg.cc/Znvk8hX4/images.jpg", alt: "Time do Flamengo antigo" },
      { src: "https://i.postimg.cc/YS8wkR1K/flamengo-antiga-23092023-072622.jpg", alt: "Time do Flamengo em preto e branco" },
      { src: "https://i.postimg.cc/C533JQVD/Flamengo-1.jpg", alt: "Time do Flamengo com taça" },
      { src: "https://i.postimg.cc/y6DWQ3HY/images-1.jpg", alt: "Elenco do Flamengo" },
      { src: "https://i.postimg.cc/y62xw61h/flamengo-capa.jpg", alt: "Escudo antigo do Flamengo" },
  ];

  const primeirasGloriasImages = [
    { src: "https://i.postimg.cc/Xqs8YZsv/Flamengo-1930-1.jpg", alt: "Time do Flamengo em 1930" },
    { src: "https://i.postimg.cc/5NP7xrrm/Fla-x-Botafogo-1926-1.jpg", alt: "Jogo Flamengo x Botafogo em 1926" },
    { src: "https://i.postimg.cc/dVLWDBPc/Flamengo-1926.jpg", alt: "Time do Flamengo em 1926" },
    { src: "https://i.postimg.cc/g2QghZmX/Campeao-de-1927-01.jpg", alt: "Time campeão de 1927" },
    { src: "https://i.postimg.cc/qRdQbHtp/Campeao-de-1927-03.jpg", alt: "Time campeão de 1927, outra foto" },
    { src: "https://i.postimg.cc/Twq0BNmg/Flamengo-1930.jpg", alt: "Time do Flamengo em 1930" },
    { src: "https://i.postimg.cc/8cp4GdB3/lossy-page1-250px-Time-de-Futebol-do-Flamengo-1933-tif.jpg", alt: "Time de futebol do Flamengo em 1933" },
  ];

  const seculoXXImages = [
    { src: "https://i.postimg.cc/vTn038h8/flamengo-1987-zico-copa-uniao-560-jpg.jpg", alt: "Flamengo campeão da Copa União 1987 com Zico" },
    { src: "https://i.postimg.cc/nc8RM7VX/flamengo-1983-optimized.jpg", alt: "Time do Flamengo em 1983" },
    { src: "https://i.postimg.cc/W4t65bbR/jornal-flamengo-tetracampeao-1987.jpg", alt: "Jornal noticiando o tetracampeonato do Flamengo em 1987" },
    { src: "https://i.postimg.cc/mDC9nPvn/NVD5-K56-RGZNNHK3-EE6-JWPPCOMI.jpg", alt: "Time do Flamengo posado para foto nos anos 80" },
    { src: "https://i.postimg.cc/cCcnsV4M/zico-bicampeao-78-79-glo-15.webp", alt: "Zico comemorando bicampeonato em 1979" },
    { src: "https://i.postimg.cc/28zWH82H/bebeto-renato-gaucho-optimized.webp", alt: "Bebeto e Renato Gaúcho no Flamengo" },
    { src: "https://i.postimg.cc/MGtNQGPh/Zico-taca-Flamengo-Campeao-Brasileiro-1980.jpg", alt: "Zico levantando a taça do Campeonato Brasileiro de 1980" },
    { src: "https://i.postimg.cc/XvyBZZYv/1983-flamengo-tricampeao-brasileiro-mengo.jpg", alt: "Time do Flamengo tricampeão brasileiro em 1983" },
    { src: "https://i.postimg.cc/G2FBQZYw/5ed3fd54c4f39.webp", alt: "Comemoração do time do Flamengo" },
    { src: "https://i.postimg.cc/901D3ZJL/98984-zico-81-529x378-1.webp", alt: "Zico em ação no Mundial de 1981" },
    { src: "https://i.postimg.cc/V6W6MXQz/44787-2b281364b4dd7e558fb72d0bb81a4b18.jpg", alt: "Time do Flamengo campeão mundial em 1981" },
    { src: "https://i.postimg.cc/8P0Ch13f/44791-leandro-flamengo-1981-jpg.jpg", alt: "Leandro, lateral do Flamengo, em 1981" },
    { src: "https://i.postimg.cc/nh9h2ybR/1992.jpg", alt: "Time do Flamengo campeão brasileiro em 1992" },
    { src: "https://i.postimg.cc/rsp8rbN9/flamengo-campeao-1982.jpg", alt: "Time do Flamengo campeão brasileiro em 1982" },
    { src: "https://i.postimg.cc/j2Cb5fRg/JS-1992-01.jpg", alt: "Júnior e time comemorando o título de 1992" },
    { src: "https://i.postimg.cc/SKmHR9r6/Zico-Fla-campeao-Libertadores-19811-e1499259061200.webp", alt: "Zico com a taça da Libertadores de 1981" },
    { src: "https://i.postimg.cc/Jhb4Vjhj/campeao-1987.webp", alt: "Time do Flamengo campeão em 1987" },
  ];

  const novaEraImages = [
    { src: "https://i.postimg.cc/RhTXjsk2/36093669-es-06-12-2009-rio-de-janeiro-rj-final-do-campeonato-brasileiro-2009-flamengo-x-gremio-no-ma.webp", alt: "Flamengo campeão brasileiro 2009" },
    { src: "https://i.postimg.cc/qBcbhqNQ/15746267275ddae5a78192c-1574626727-3x2-rt.jpg", alt: "Comemoração do título da Libertadores 2019" },
    { src: "https://i.postimg.cc/YqbdRPfW/50980490508-321bfd1ea0-k.webp", alt: "Time do Flamengo campeão brasileiro 2020" },
    { src: "https://i.postimg.cc/VkvDVFDH/50981336233-a16cbbf89d-k-1-1614340538807.jpg", alt: "Jogadores do Flamengo comemoram título" },
    { src: "https://i.postimg.cc/pLSqbnSV/em-2019-o-flamengo-ergueu-a-taca-de-campeao-brasileiro-na-3-jpeg-1200x0-q70-crop-top.webp", alt: "Flamengo levantando a taça do Brasileirão 2019" },
    { src: "https://i.postimg.cc/d3njW7dY/uncropped-flamengo-s-player-angelim-r-celebrates-5e860b031f449191dd000004.webp", alt: "Angelim comemorando gol do título de 2009" },
    { src: "https://i.postimg.cc/TYY9K9MY/Filipe-Luis-campeao-brasileiro-2020.jpg", alt: "Filipe Luís campeão brasileiro 2020" },
    { src: "https://i.postimg.cc/Qx4q1Thg/Pet-Angelim-2009.webp", alt: "Petkovic e Angelim em 2009" },
    { src: "https://i.postimg.cc/dVhjBVVb/flamengo-campeao-brasileiro-2020.webp", alt: "Elenco do Flamengo com a taça do Brasileirão 2020" },
    { src: "https://i.postimg.cc/hGSPnfQw/85843852-Players-of-Brazils-Flamengo-celebrate-on-the-podium-with-the-trophy-after-winning-the-Copa.jpg", alt: "Jogadores do Flamengo comemorando a Copa do Brasil" },
    { src: "https://i.postimg.cc/43B4xsz3/flamengo-campeao-supercopa.webp", alt: "Flamengo campeão da Supercopa" },
    { src: "https://i.postimg.cc/wvr6D248/flamengo-premiacao-libertadores-Easy-Resize-com.jpg", alt: "Premiação da Libertadores" },
    { src: "https://i.postimg.cc/zvRq7h4L/Flamengo-vence-o-Atle-tico-MG-e-conquista-a-Copa-do-Brasil-pela-5a-vez-Metropoles-4-1.jpg", alt: "Flamengo campeão da Copa do Brasil" },
    { src: "https://i.postimg.cc/qBtKS5TK/images.jpg", alt: "Time do Flamengo comemorando título" },
    { src: "https://i.postimg.cc/6p1wkYw7/gettyimages-452315579-1.webp", alt: "Time do Flamengo campeão da Copa do Brasil 2013" },
    { src: "https://i.postimg.cc/RhRxXTXZ/2013112796674.jpg", alt: "Comemoração do título da Copa do Brasil 2013" },
  ];

   const torcidaImages = [
    { src: "https://i.postimg.cc/0yCZjBrQ/180813-torcida-do-flamengo-marca-presenca-no-estadio-mane-garrincha-em-brasilia-para-o-duelo-contra.jpg", alt: "Torcida do Flamengo no Mané Garrincha" },
    { src: "https://i.postimg.cc/XvH8cBf6/4166421346-56ed919a9e-b.jpg", alt: "Torcida do Flamengo com bandeiras" },
    { src: "https://i.postimg.cc/ydDTf6jg/52495505908-446e2515e4-k-e1681121195500.webp", alt: "Festa da torcida do Flamengo" },
    { src: "https://i.postimg.cc/Y0gzHXJt/a8598480-0ee5-11ea-8faa-a5b271d72abe-wp-660x372.jpg", alt: "Torcida do Flamengo no estádio" },
    { src: "https://i.postimg.cc/KcgNBz4C/c05677753aba609214f43085b4052d63.jpg", alt: "Bandeirão da torcida do Flamengo" },
    { src: "https://i.postimg.cc/R0F1FCjs/ee4ee9ab65b0cd5972abf4357682d12a.webp", alt: "Torcida do Flamengo com sinalizadores" },
    { src: "https://i.postimg.cc/CL5wm3py/Capturar-19.webp", alt: "Mosaico da torcida do Flamengo" },
    { src: "https://i.postimg.cc/kGxKZ2b4/gazeta-press-foto-1924304.webp", alt: "Festa da torcida do Flamengo nas arquibancadas" },
    { src: "https://i.postimg.cc/L6pzP3cZ/1-sem-titulo-26707763.jpg", alt: "Torcida do Flamengo em festa" },
    { src: "https://i.postimg.cc/6p6nj55W/images-1.jpg", alt: "Torcida do Flamengo lotando o estádio" },
    { src: "https://i.postimg.cc/5yqQgDhQ/images-2.jpg", alt: "Vista aérea da torcida do Flamengo" },
    { src: "https://i.postimg.cc/DZ1Sftyp/images-3.jpg", alt: "Detalhe da torcida do Flamengo" },
    { src: "https://i.postimg.cc/8cDj7t7p/images.jpg", alt: "Torcida do Flamengo com bandeiras e fumaça" },
    { src: "https://i.postimg.cc/D0By8FV6/mosaico-da-torcida-do-flamengo.jpg", alt: "Outro mosaico da torcida do Flamengo" },
    { src: "https://i.postimg.cc/FHfss2Tb/n1390581708.webp", alt: "Torcida do Flamengo vibrando" },
    { src: "https://i.postimg.cc/Jn81xtMK/torcida-nac-a-o-rubro-negra-20231102050623.jpg", alt: "Nação Rubro-Negra em 2023" },
    { src: "https://i.postimg.cc/cC4dqjKn/x1080.jpg", alt: "Torcida do Flamengo com bandeirão" },
    { src: "https://i.postimg.cc/NGpg8gV7/age20210221033.jpg", alt: "Torcida do Flamengo comemora título" },
    { src: "https://i.postimg.cc/XYzMXqrX/image-placeholder-1-aspect-ratio-512-320-180.webp", alt: "Torcida do Flamengo no estádio" },
  ];

  const maracanaImages = [
    { src: "https://i.postimg.cc/P5rhP0KV/maracana-1100562.jpg", alt: "Vista panorâmica do Maracanã" },
    { src: "https://i.postimg.cc/SKHp1R4H/flamengo-x-Botafogo-site.jpg", alt: "Jogo do Flamengo no Maracanã" },
    { src: "https://i.postimg.cc/MTRJCwKH/maracana-1.jpg", alt: "Fachada do Estádio do Maracanã" },
    { src: "https://i.postimg.cc/3NTQ7qdB/flamengo-torcida-maracana.webp", alt: "Torcida do Flamengo no Maracanã" },
    { src: "https://i.postimg.cc/cCByJc3N/flamengo-maracana-tour-riobycariocas-01.png", alt: "Tour do Maracanã com as cores do Flamengo" },
    { src: "https://i.postimg.cc/h4LqMK53/download.jpg", alt: "Gramado do Maracanã" },
    { src: "https://i.postimg.cc/L6mFbrd4/download-1.jpg", alt: "Vista interna do Maracanã" },
    { src: "https://i.postimg.cc/fT5QnBZc/622f1358d18-31a9-444e-a93c-882ccf0e1e23-reproducao-00113621-0.jpg", alt: "Maracanã em dia de jogo do Flamengo" },
  ];

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <div className="mb-12">
        <AdBanner width={728} height={90} />
      </div>
      
      <header className="text-center mb-16">
        <div className="relative mx-auto h-48 w-48 mb-4">
          <Image
              src="https://i.postimg.cc/RF5TbLnK/image-removebg-preview-8.png"
              alt="Flamengo CRF Logo"
              fill
              className="object-contain"
          />
        </div>
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-foreground">{getPageTitle()}</h1>
        <p className="text-xl text-muted-foreground mt-2">🔴⚫ O Mais Querido do Brasil</p>
      </header>

      <main className="prose prose-lg max-w-none text-foreground/90 text-justify space-y-12 
                       [&_h2]:font-headline [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:text-primary 
                       [&_h2]:border-b [&_h2]:pb-2 [&_h2]:mb-4
                       [&_strong]:font-bold [&_p]:leading-relaxed
                       [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2">
        
        <p className="text-xl !leading-loose">
          Fundado em 17 de novembro de 1895, o Clube de Regatas do Flamengo nasceu às margens da Baía de Guanabara, no bairro do Flamengo, no Rio de Janeiro. Inicialmente voltado para o remo, esporte muito popular na época, o clube logo expandiu seus horizontes e se transformou em uma das maiores potências do esporte brasileiro e mundial, principalmente no futebol.
        </p>

        <section>
          <h2>⚓ Raízes no Remo</h2>
          <p>
            O Flamengo começou como um grupo de jovens apaixonados por esportes náuticos, que sonhavam em formar uma equipe de regatas competitiva. A primeira vitória no remo veio em 1898, e foi comemorada com grande festa — tradição que o clube leva até hoje: celebrar com paixão cada conquista.
          </p>
          <HistoryCarousel images={historyImages} autoplay={true} />
        </section>

        <div className="my-12">
            <AdBanner width={728} height={90} />
        </div>
        
        <section>
          <h2>⚽ A Chegada do Futebol</h2>
          <p>
            O futebol chegou ao clube em 1911, após uma dissidência de atletas do Fluminense, que migraram para o Flamengo. Em pouco tempo, o novo departamento começou a se destacar nos campos cariocas, e a torcida cresceu de forma impressionante.
          </p>
          <p>
              Em 1912, o Flamengo disputou sua primeira partida oficial de futebol e venceu o Mangueira por 16 a 2, naquela que ainda é a maior goleada da história do clube.
          </p>
          <HistoryCarousel images={footballImages} autoplay={true} />
        </section>
        
        <div className="my-12">
            <AdBanner width={728} height={90} />
        </div>

        <section>
          <h2>🏆 As Primeiras Glórias</h2>
          <p>
            O Rubro-Negro começou a colecionar títulos já nas primeiras décadas do século XX. No futebol carioca, se tornou referência com times competitivos e uma torcida apaixonada, ganhando os primeiros Campeonatos Cariocas nas décadas de 1910 e 1920.
          </p>
          <HistoryCarousel images={primeirasGloriasImages} autoplay={true} />
        </section>
        
        <div className="my-12">
            <AdBanner width={728} height={90} />
        </div>
        
        <section>
          <h2>🌎 O Flamengo no Século XX</h2>
           <p>
              Ao longo do século XX, o Flamengo se consolidou como um dos clubes mais populares do Brasil. Mas foi na década de 1980 que o time viveu sua fase mais gloriosa.
           </p>
           <p>
              Comandado por nomes lendários como Zico, Júnior, Leandro, Nunes e Adílio, o Flamengo conquistou:
           </p>
          <ul>
            <li>Campeonato Brasileiro (1980, 1982, 1983)</li>
            <li>Copa Libertadores da América (1981)</li>
            <li>Mundial Interclubes (1981), com a histórica vitória por 3 a 0 sobre o Liverpool.</li>
          </ul>
           <p>
              Essa geração ficou eternizada como uma das mais vitoriosas da história do futebol brasileiro.
          </p>
          <HistoryCarousel images={seculoXXImages} autoplay={true} />
        </section>
        
        <div className="my-12">
            <AdBanner width={728} height={90} />
        </div>

        <section>
          <h2>🔥 A Maior Torcida do Mundo</h2>
          <p>
            Com uma torcida estimada em mais de 40 milhões de torcedores, o Flamengo se orgulha de ser o clube mais popular do Brasil. O lema "Uma vez Flamengo, sempre Flamengo" representa a ligação emocional e cultural entre o time e sua Nação Rubro-Negra.
          </p>
          <HistoryCarousel images={torcidaImages} autoplay={true} />
        </section>
        
        <div className="my-12">
            <AdBanner width={728} height={90} />
        </div>
        
        <section>
          <h2>⚽ A Nova Era: Glórias Recentes</h2>
          <p>
            O século XXI trouxe desafios e grandes conquistas. Sob a liderança de jogadores como Petkovic, Adriano, Gabigol, Arrascaeta, Bruno Henrique e Filipe Luís, o clube voltou ao topo:
          </p>
          <ul>
            <li>Campeonato Brasileiro (2009, 2019, 2020)</li>
            <li>Copa Libertadores (2019, 2022)</li>
            <li>Recopa Sul-Americana (2020)</li>
            <li>Copa do Brasil (2006, 2013, 2022)</li>
          </ul>
          <p>
              O ano de 2019 foi um capítulo histórico, com as conquistas da Libertadores e do Brasileirão no mesmo final de semana, sob o comando do técnico Jorge Jesus.
          </p>
          <HistoryCarousel images={novaEraImages} autoplay={true} />
        </section>
        
        <div className="my-12">
            <AdBanner width={728} height={90} />
        </div>
        
         <section>
          <h2>🏟️ Maracanã: A Casa do Flamengo</h2>
          <p>
           O Estádio do Maracanã é mais do que um palco de jogos: é um templo sagrado para a torcida rubro-negra. Ali, o Flamengo viveu suas maiores emoções e consolidou sua identidade como clube de massa e conquistas.
          </p>
          <HistoryCarousel images={maracanaImages} autoplay={true} />
        </section>
        
        <div className="my-12">
            <AdBanner width={728} height={90} />
        </div>

        <section>
          <h2>❤️ Flamengo é Religião</h2>
          <p>
            Mais do que um clube de futebol, o Flamengo é parte da cultura popular brasileira. Ele está presente nas músicas, nas ruas, nas bandeiras, nas favelas e nos corações. É sinônimo de paixão, raça e amor incondicional.
          </p>
        </section>

        <div className="my-12">
            <AdBanner width={728} height={90} />
        </div>

         <ArticleList />

        <div className="my-12">
            <AdBanner width={728} height={90} />
        </div>
        
         <footer className="text-center pt-8 border-t">
              <p className="font-headline text-2xl font-bold text-foreground">📣 Viva a História. Viva o Flamengo.</p>
              <p className="mt-4">
                  No FLA10 News, celebramos diariamente essa trajetória gloriosa, trazendo notícias, análises e conteúdos que honram o passado e vibram com o presente.
              </p>
              <p className="mt-2">
                  Porque o Flamengo é eterno.
                  <br />
                  Porque o Flamengo é religião!
                  <br />
                  Porque ser Flamengo é um estado de espírito.
              </p>
         </footer>
      </main>
      
      <div className="mt-12">
        <AdBanner width={728} height={90} />
      </div>
    </div>
  );
}
