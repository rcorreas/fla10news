'use client';
import * as React from 'react';
import { useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Bold, Italic, Underline, CornerDownRight, ImageIcon } from 'lucide-react';

interface TextareaWithFormattingProps extends React.ComponentProps<typeof Textarea> {}

export const TextareaWithFormatting = React.forwardRef<HTMLTextAreaElement, TextareaWithFormattingProps>(
  (props, forwardedRef) => {
    const internalRef = useRef<HTMLTextAreaElement>(null);
    const textareaRef = (forwardedRef as any) || internalRef;

    const insertText = (before: string, after: string = '') => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;

      const selectedText = text.substring(start, end);
      const newText = text.substring(0, start) + before + selectedText + after + text.substring(end);
      
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value")?.set;
      nativeInputValueSetter?.call(textarea, newText);
      
      const event = new Event('input', { bubbles: true });
      textarea.dispatchEvent(event);

      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + before.length + selectedText.length, start + before.length + selectedText.length);
      }, 0);
    };

    return (
      <div className="space-y-2 w-full relative">
        <div className="flex items-center gap-1 mb-2 p-1 border rounded-md bg-muted/40 w-fit">
          <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              onClick={() => insertText('<b>', '</b>')}
              title="Negrito"
              className="h-8 w-8 p-0"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              onClick={() => insertText('<i>', '</i>')}
              title="Itálico"
              className="h-8 w-8 p-0"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              onClick={() => insertText('<u>', '</u>')}
              title="Sublinhado"
              className="h-8 w-8 p-0"
          >
            <Underline className="h-4 w-4" />
          </Button>
          <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              onClick={() => insertText('<br><br>')}
              title="Quebra de Linha Dupla"
              className="h-8 flex gap-1 px-2"
          >
            <CornerDownRight className="h-4 w-4" />
            <span className="text-xs">Parágrafo</span>
          </Button>
          <div className="w-px h-4 bg-border mx-1" />
          <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                const url = prompt("Digite a URL da imagem:");
                if (url) {
                  const credit = prompt("Créditos da imagem (ou deixe em branco):");
                  if (credit && credit.trim() !== '') {
                    insertText(`[img credit="${credit.trim()}"]${url}[/img]`);
                  } else {
                    insertText(`[img]${url}[/img]`);
                  }
                }
              }}
              title="Inserir Imagem"
              className="h-8 flex gap-1 px-2"
          >
            <ImageIcon className="h-4 w-4" />
            <span className="text-xs">Imagem</span>
          </Button>
        </div>
        <Textarea ref={textareaRef} {...props} />
      </div>
    );
  }
);
TextareaWithFormatting.displayName = 'TextareaWithFormatting';
