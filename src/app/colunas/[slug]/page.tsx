
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { getColumnBySlug, getAllColumnSlugs, getColumns } from '@/data/columns'
import type { Metadata, ResolvingMetadata } from 'next'
import { format, differenceInMinutes, differenceInHours, differenceInDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { AdBanner } from '@/components/ad-banner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, Eye } from 'lucide-react'
import { slugify, formatPublishedTime } from '@/lib/utils';
import { ShareButton } from '@/components/share-button'
import { ArticleShareButton } from '@/components/article-share-button'

export const revalidate = 3600; // Revalidate at most every hour

// Helper function to generate slugs
function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '');
}

// This generates the routes at build time
export async function generateStaticParams() {
  const columns = await getAllColumnSlugs();
  return columns.map((column) => ({
    slug: column.slug,
  }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  const column = await getColumnBySlug(slug);

  if (!column) {
    return {
      title: 'Coluna não encontrada',
    }
  }

  const desc = column.excerpt || column.content?.substring(0, 160)?.replace(/<[^>]*>?/gm, '') || '';
  const imageUrl = column.columnImage || 'https://placehold.co/1200x675.png'; // default fallback if no image

  return {
    title: column.title,
    description: desc,
    openGraph: {
      title: column.title,
      description: desc,
      images: [imageUrl],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: column.title,
      description: desc,
      images: [imageUrl],
    },
  }
}



import { db } from '@/lib/firebase'
import { doc, updateDoc, increment } from 'firebase/firestore'

export default async function ColumnPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const column = await getColumnBySlug(slug)
  const allColumns = await getColumns(3); 
  
  if (!column) {
    notFound()
  }
  
  // Increment dynamic view count in Firebase asynchronously
  try {
    const columnRef = doc(db, 'columns', column.id);
    updateDoc(columnRef, {
      views: increment(1)
    }).catch(err => console.error("Error updating column views:", err));
  } catch (err) {
    console.error("Error incrementing column views:", err);
  }
  
  const otherColumns = allColumns.filter(c => c.id !== column.id).slice(0, 2);
  const columnDate = format(column.publishedAt, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  const authorSlug = generateSlug(column.author);

  return (
    <div className="container mx-auto max-w-4xl py-12">
      <div className="mb-8">
        <AdBanner width={728} height={90} />
      </div>
      <article>
        <header className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <Badge variant="default">{column.category}</Badge>
            <ArticleShareButton title={column.title} slug={column.slug} type="colunas" />
          </div>
          <div className="relative flex items-center justify-center h-40">
            {column.columnImage ? (
                <div className="absolute left-[-30px] h-40 w-40 flex-shrink-0">
                    <Image src={column.columnImage} alt={`Ilustração da coluna ${column.columnName}`} fill className="object-contain" />
                </div>
            ) : (
                <>
                    {column.columnName === "É Mengão na veia!!!" && (
                        <div className="absolute left-[-30px] h-40 w-40 flex-shrink-0">
                            <Image
                            src="https://i.postimg.cc/YCT3F8nY/Chat-GPT-Image-9-de-jul-de-2025-23-06-12-removebg-preview.png"
                            alt="Ilustração da coluna É Mengão na veia!!!"
                            fill
                            className="object-contain"
                            />
                        </div>
                    )}
                    {column.columnName === "Cesta de Três" && (
                        <div className="absolute left-[-30px] h-52 w-52 flex-shrink-0">
                            <Image
                            src="https://i.postimg.cc/YCBZF1X4/Chat-GPT-Image-9-de-jul-de-2025-23-25-49-removebg-preview.png"
                            alt="Ilustração da coluna Cesta de Três"
                            fill
                            className="object-contain"
                            />
                        </div>
                    )}
                    {column.columnName === "Panorama do Canela" && (
                      <div className="absolute left-[-30px] h-40 w-40 flex-shrink-0">
                        <Image src="https://i.imgur.com/Ivq88KP.png" alt="Panorama do Canela" fill className="object-contain" />
                      </div>
                    )}
                    {column.columnName === "Na Pena do Urubu" && (
                      <div className="absolute left-[-30px] h-40 w-40 flex-shrink-0">
                        <Image src="https://i.imgur.com/ICtiAp0.png" alt="Ilustração da coluna Na Pena do Urubu" fill className="object-contain" />
                      </div>
                    )}
                </>
            )}
<Link href={`/colunas/caderno/${slugify(column.columnName)}`} className="hover:underline transition-all">
    <p className="font-sans text-6xl font-bold text-primary text-center">{column.columnName}</p>
</Link>
          </div>
          <Separator className="my-4" />
          <h1 className="font-headline text-3xl md:text-4xl font-bold leading-tight">{column.title}</h1>
          <div className="flex items-center justify-start gap-4 mt-4">
            <Link href={`/autores/${authorSlug}`}>
              <Avatar className="h-16 w-16">
                <AvatarImage src={column.authorImage} alt={column.author} />
                <AvatarFallback>{column.author.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            </Link>
            <div className="text-sm">
                <p className="font-bold text-base text-foreground">
                    <Link href={`/autores/${authorSlug}`} className="hover:text-primary transition-colors">
                        Por {column.author}
                    </Link>
                </p>
                {column.authorLink && (
                    <a href={column.authorLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline transition-colors text-muted-foreground">
                        @{column.author.toLowerCase().replace(/\s+/g, '')}
                    </a>
                )}
              <div className="flex items-center gap-4 text-muted-foreground mt-1">
                <p>{columnDate}</p>
                <div className="flex items-center gap-1.5">
                    <Eye className="h-4 w-4" />
                    <span>{column.views || 0} acessos</span>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        {column.content && (
          <div 
            className="text-lg space-y-6 [&_h3]:text-2xl [&_h3]:font-headline [&_h3]:font-bold [&_h3]:my-4 [&_strong]:font-bold [&_a]:text-[#ff073a] [&_a]:font-bold [&_a]:hover:underline"
            dangerouslySetInnerHTML={{ __html: column.content }}
          />
        )}

        {column.authorDescription && (
          <div className="mt-12 p-6 bg-muted/30 rounded-lg border border-border">
            <h3 className="text-lg font-bold font-headline mb-2 text-primary">Sobre {column.author}</h3>
            <p className="text-muted-foreground leading-relaxed text-base">
              {column.authorDescription}
            </p>
          </div>
        )}

        <div className="mt-12 pt-8 border-t">
            <AdBanner width={728} height={90} />
        </div>
      </article>

      {otherColumns.length > 0 && (
        <section className="mt-12 pt-8 border-t">
          <h2 className="text-3xl font-headline font-bold mb-6">Outras Colunas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {otherColumns.map((col) => (
                <Card key={col.slug} className="relative flex flex-col group transition-all duration-300 hover:shadow-primary-lg hover:-translate-y-1">
                    <ShareButton title={col.title} slug={col.slug} type="colunas" />
                    <CardHeader>
                        <div className="flex items-center justify-between mb-4">
                            <Badge variant="default">{col.category}</Badge>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>{formatPublishedTime(col.publishedAt)}</span>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <Avatar className="h-12 w-12 border-2 border-primary/20">
                                <AvatarImage src={col.authorImage} alt={col.author} />
                                <AvatarFallback>{col.author.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                                <Link href={`/colunas/caderno/${slugify(col.columnName)}`} className="hover:underline">
                                    <p className="font-bold text-primary">{col.columnName}</p>
                                </Link>
                                <p className="text-sm text-muted-foreground">Por {col.author}</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-2">
                        <CardTitle className="text-xl font-bold font-body leading-tight">
                            <Link href={`/colunas/${col.slug}`} className="hover:text-[#FF073A] transition-colors duration-200">
                            {col.title}
                            </Link>
                        </CardTitle>
                        <p className="text-muted-foreground text-sm line-clamp-3">"{col.excerpt}"</p>
                    </CardContent>
                </Card>
            ))}
          </div>
        </section>
      )}

      <div className="mt-12">
        <AdBanner width={728} height={90} />
      </div>
    </div>
  )
}
