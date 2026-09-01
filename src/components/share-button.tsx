'use client'

import React from 'react'
import { useToast } from "@/hooks/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "./ui/button"
import { Facebook, Twitter, Linkedin, Link as LinkIcon, Share2, Instagram, MessageCircle, Send } from 'lucide-react'

export function ShareButton({ title, slug, type = 'noticias' }: { title: string, slug: string, type?: 'noticias' | 'colunas' | 'videos' | 'flahistoria' | 'voz-torcedor' | 'galeria' | 'raio-x' | 'tirinhas' }) {
    const { toast } = useToast()
    
    const getTypeText = () => {
        switch (type) {
            case 'colunas': return 'da coluna';
            case 'videos': return 'do vídeo';
            case 'flahistoria': return 'da matéria';
            case 'voz-torcedor': return 'da publicação';
            case 'galeria': return 'da imagem';
            case 'tirinhas': return 'da tirinha';
            default: return 'da notícia';
        }
    }
    
    const handleCopyLink = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        const url = `${window.location.origin}/${type}/${slug}`
        navigator.clipboard.writeText(url).then(() => {
            toast({
                title: "Link Copiado!",
                description: `O link ${getTypeText()} foi copiado para a sua área de transferência.`,
            })
        }).catch(err => {
            console.error('Failed to copy: ', err)
            toast({
                title: "Erro",
                description: "Não foi possível copiar o link.",
                variant: "destructive"
            })
        })
    }

    const handleShare = (e: React.MouseEvent, platform: 'twitter' | 'facebook' | 'linkedin' | 'instagram' | 'whatsapp' | 'telegram') => {
        e.preventDefault()
        e.stopPropagation()
        const url = `${window.location.origin}/${type}/${slug}`
        let shareUrl = ''
        switch(platform) {
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
                break
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
                break
            case 'linkedin':
                shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}`
                break
            case 'whatsapp':
                shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(title + " - " + url)}`
                break
            case 'telegram':
                shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
                break
            case 'instagram':
                navigator.clipboard.writeText(url).then(() => {
                    toast({
                        title: "Link Copiado!",
                        description: "Para compartilhar no Instagram, cole o link no seu story ou na bio.",
                    });
                }).catch(err => {
                    console.error('Failed to copy: ', err);
                    toast({
                        title: "Erro",
                        description: "Não foi possível copiar o link.",
                        variant: "destructive"
                    });
                });
                return;
        }
        window.open(shareUrl, '_blank', 'noopener,noreferrer')
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-1 right-1 h-8 w-8 bg-black/30 hover:bg-black/50 text-white rounded-full z-10" 
                    onClick={(e) => {e.preventDefault(); e.stopPropagation();}}
                    aria-label="Compartilhar"
                >
                    <Share2 className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => {e.preventDefault(); e.stopPropagation();}}>
                <DropdownMenuItem onClick={(e) => handleShare(e, 'twitter')}>
                    <Twitter className="mr-2 h-4 w-4" />
                    <span>Twitter / X</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => handleShare(e, 'facebook')}>
                    <Facebook className="mr-2 h-4 w-4" />
                    <span>Facebook</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => handleShare(e, 'instagram')}>
                    <Instagram className="mr-2 h-4 w-4" />
                    <span>Instagram</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => handleShare(e, 'whatsapp')}>
                    <MessageCircle className="mr-2 h-4 w-4" />
                    <span>WhatsApp</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => handleShare(e, 'telegram')}>
                    <Send className="mr-2 h-4 w-4" />
                    <span>Telegram</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => handleShare(e, 'linkedin')}>
                    <Linkedin className="mr-2 h-4 w-4" />
                    <span>LinkedIn</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopyLink}>
                    <LinkIcon className="mr-2 h-4 w-4" />
                    <span>Copiar Link</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
