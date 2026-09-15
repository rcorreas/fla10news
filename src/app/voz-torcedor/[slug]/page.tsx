import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { getVozTorcedorBySlug, getVozTorcedores } from '@/data/voz-torcedor'
import type { Metadata, ResolvingMetadata } from 'next'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { AdBanner } from '@/components/ad-banner'
import { AdsKeeperWidget } from '@/components/adskeeper-widget'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, Eye, MessageSquare } from 'lucide-react'
import { slugify, formatPublishedTime , getSocialMetaImageUrl } from '@/lib/utils';
import { ShareButton } from '@/components/share-button'
import { ArticleShareButton } from '@/components/article-share-button'
import { JsonLd } from '@/components/json-ld'
import { absoluteUrl, siteName, truncateDescription } from '@/lib/site'

export const revalidate = 3600; // Revalidate at most every hour

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  const voz = await getVozTorcedorBySlug(slug);

  if (!voz) {
    return {
      title: 'Opinião não encontrada',
    }
  }

  const desc = truncateDescription(voz.summary || voz.content || '');
  const imageUrl = 'https://i.imgur.com/ESMmQcc.png';
  const url = absoluteUrl(`/voz-torcedor/${voz.slug}`);
  

  return {
    title: voz.title,
    description: desc,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: voz.title,
      description: desc,
      url,
      images: [getSocialMetaImageUrl(imageUrl)],
      type: 'article',
      publishedTime: voz.publishedAt.toISOString(),
      authors: [voz.authorName],
    },
    twitter: {
      card: 'summary_large_image',
      title: voz.title,
      description: desc,
      images: [getSocialMetaImageUrl(imageUrl)],
    },
  }
}

import { db } from '@/lib/firebase'
import { doc, updateDoc, increment } from 'firebase/firestore'

export default async function VozTorcedorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const voz = await getVozTorcedorBySlug(slug)
  const allVoz = await getVozTorcedores(3); 
  
  if (!voz) {
    notFound()
  }
  
  // Increment dynamic view count in Firebase asynchronously
  try {
    const docRef = doc(db, 'voz_torcedor', voz.id);
    updateDoc(docRef, {
      views: increment(1)
    }).catch(err => console.error("Error updating views:", err));
  } catch (err) {
    console.error("Error incrementing views:", err);
  }
  
  const otherVoz = allVoz.filter(v => v.id !== voz.id).slice(0, 2);
  const dataPublicacao = format(voz.publishedAt, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  const vozUrl = absoluteUrl(`/voz-torcedor/${voz.slug}`);
  const vozDescription = truncateDescription(voz.summary || voz.content || '');

  return (
    <div className="container mx-auto max-w-4xl py-12">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: voz.title,
          description: vozDescription,
          image: [voz.image || 'https://i.imgur.com/ESMmQcc.png'],
          datePublished: voz.publishedAt.toISOString(),
          dateModified: voz.publishedAt.toISOString(),
          author: {
            '@type': 'Person',
            name: voz.authorName,
          },
          publisher: {
            '@type': 'Organization',
            name: siteName,
            logo: {
              '@type': 'ImageObject',
              url: absoluteUrl('/icon.png'),
            },
          },
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': vozUrl,
          },
        }}
      />
      <div className="mb-8 flex justify-center px-4">
        <a href="https://meli.la/1yUshX3" target="_blank" rel="noopener noreferrer" className="block w-full max-w-[728px] hover:opacity-90 transition-opacity">
          <Image src="https://i.imgur.com/JzHwtHD.jpeg" alt="Publicidade" width={728} height={90} className="w-full h-auto rounded-lg shadow-md border border-border" />
        </a>
      </div>
      <article>
        <header className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <Badge variant="default" className="flex items-center gap-2"><MessageSquare className="w-4 h-4"/> A Voz do Torcedor</Badge>
            <ArticleShareButton title={voz.title} slug={voz.slug} type="voz-torcedor" />
          </div>
          <div className="relative flex items-center justify-center h-40">
            <div className="absolute left-[-10px] md:left-[-30px] h-32 w-32 md:h-40 md:w-40 flex-shrink-0">
              <Image src="https://i.imgur.com/ESMmQcc.png" alt="A Voz do Torcedor" fill className="object-contain" />
            </div>
            <p className="font-sans text-5xl md:text-6xl font-bold text-primary text-center">A Voz do Torcedor</p>
          </div>
          <Separator className="my-4" />
          <h1 className="font-headline text-3xl md:text-4xl font-bold leading-tight">{voz.title}</h1>
          <div className="flex items-center justify-start gap-4 mt-4">
            <div className="text-sm">
                <p className="font-bold text-base text-foreground">
                    Por {voz.authorName}
                </p>
              <div className="flex items-center gap-4 text-muted-foreground mt-1">
                <p>{dataPublicacao}</p>
                <div className="flex items-center gap-1.5">
                    <Eye className="h-4 w-4" />
                    <span>{voz.views || 0} acessos</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {voz.image && (
          <div className="relative w-full aspect-video mb-8 rounded-xl overflow-hidden shadow-lg border border-border">
            <Image 
                src={voz.image} 
                alt={`Imagem da opinião de ${voz.authorName}`} 
                fill 
                className="object-contain bg-muted" 
            />
          </div>
        )}
        
        {voz.content && (
          <div 
            className="text-lg space-y-6 [&_h3]:text-2xl [&_h3]:font-headline [&_h3]:font-bold [&_h3]:my-4 [&_strong]:font-bold [&_a]:text-[#ff073a] [&_a]:font-bold [&_a]:hover:underline"
            dangerouslySetInnerHTML={{ __html: voz.content }}
          />
        )}

        <div className="mt-12 p-6 bg-muted/30 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground italic mb-4">
                *As opiniões expressadas aqui são de inteiro conteúdo do autor e não refletem a opinião editorial deste portal.
            </p>
            <p className="text-sm text-foreground font-bold">
                Se você quiser mandar seu recado para esta seção, o envie para o e-mail: <a href="mailto:fladeznews@gmail.com" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">fladeznews@gmail.com</a>
            </p>
        </div>

        <AdsKeeperWidget widgetId="2046582" />

        <div className="mt-12 pt-8 border-t flex flex-col items-center gap-6">
            <AdBanner width={728} height={90} />
            <AdsKeeperWidget widgetId="2046585" />
        </div>
      </article>

      {otherVoz.length > 0 && (
        <section className="mt-12 pt-8 border-t">
          <h2 className="text-3xl font-headline font-bold mb-6">Mais Opiniões</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {otherVoz.map((vozItem) => (
                <Card key={vozItem.slug} className="relative flex flex-col group transition-all duration-300 hover:shadow-primary-lg hover:-translate-y-1">
                    <ShareButton title={vozItem.title} slug={vozItem.slug} type="voz-torcedor" />
                    <CardHeader>
                        <div className="flex items-center justify-between mb-4">
                            <Badge variant="secondary">Torcedor</Badge>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>{formatPublishedTime(vozItem.publishedAt)}</span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-2">
                        <CardTitle className="text-xl font-bold font-body leading-tight">
                            <Link href={`/voz-torcedor/${vozItem.slug}`} className="hover:text-[#FF073A] transition-colors duration-200">
                            {vozItem.title}
                            </Link>
                        </CardTitle>
                        <p className="text-muted-foreground text-sm line-clamp-3">"{vozItem.summary}"</p>
                    </CardContent>
                </Card>
            ))}
          </div>
        </section>
      )}

      <div className="mt-12 flex justify-center px-4">
        <a href="https://amzn.to/4pm8HFl" target="_blank" rel="noopener noreferrer" className="block w-full max-w-[728px] hover:opacity-90 transition-opacity">
          <Image src="https://i.imgur.com/xZYv2gr.png" alt="Publicidade" width={728} height={90} className="w-full h-auto rounded-lg shadow-md border border-border" />
        </a>
      </div>
    </div>
  )
}
