"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { Upload, ImageIcon, Loader2, X, Check, FolderOpen } from "lucide-react";
import { compressAndUploadImage, type UploadImageResult } from "@/lib/image-upload-client";

interface ImageUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folder?: string;
  withCredit?: boolean;
  title?: string;
  onUploaded: (result: UploadImageResult, credit?: string) => void;
}

export function ImageUploadModal({
  open,
  onOpenChange,
  folder = "materias",
  withCredit = false,
  title = "Enviar Imagem",
  onUploaded,
}: ImageUploadModalProps) {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [uploadedResult, setUploadedResult] = React.useState<UploadImageResult | null>(null);
  const [credit, setCredit] = React.useState("");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Limpa o estado ao abrir/fechar a janela
  React.useEffect(() => {
    if (!open) {
      setIsDragging(false);
      setUploading(false);
      setError(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(null);
      setUploadedResult(null);
      setCredit("");
    }
  }, [open]);

  // Fechar com tecla ESC e permitir colar imagem com Ctrl+V / Cmd+V
  React.useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !uploading) {
        e.stopPropagation();
        onOpenChange(false);
      }
    };

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            processFile(file);
            break;
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("paste", handlePaste);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("paste", handlePaste);
    };
  }, [open, uploading]);

  const processFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Por favor, selecione um arquivo de imagem válido (JPG, PNG, WEBP, GIF).");
      return;
    }

    setError(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);
    setUploading(true);

    try {
      const result = await compressAndUploadImage(file, { folder });
      setUploadedResult(result);

      // Se não precisar de campo de crédito (ex: Foto Principal / Secundária), já preenche e fecha automaticamente
      if (!withCredit) {
        onUploaded(result);
        onOpenChange(false);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao enviar a imagem.";
      setError(msg);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (uploading) return;
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleConfirmWithCredit = () => {
    if (!uploadedResult) return;
    onUploaded(uploadedResult, credit.trim());
    onOpenChange(false);
  };

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150"
      onClick={(e) => {
        e.stopPropagation();
        if (!uploading) onOpenChange(false);
      }}
    >
      <div
        className="relative w-full max-w-lg rounded-xl border border-border bg-background p-6 shadow-2xl space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho da Janela */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold leading-none">{title}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Compressão automática para JPEG HD leve (~120 KB)
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={uploading}
            onClick={() => onOpenChange(false)}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Input de arquivo oculto */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileInput}
        />

        {/* Área de Arrastar e Soltar (Drag and Drop) */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!uploading) setIsDragging(true);
          }}
          onDragEnter={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!uploading) setIsDragging(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);
          }}
          onDrop={handleDrop}
          onClick={() => {
            if (!uploading) fileInputRef.current?.click();
          }}
          className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-all cursor-pointer select-none ${
            isDragging
              ? "border-primary bg-primary/10 scale-[1.01]"
              : "border-muted-foreground/30 bg-muted/30 hover:border-primary/60 hover:bg-muted/50"
          }`}
        >
          {previewUrl ? (
            <div className="space-y-3 w-full flex flex-col items-center">
              <div className="relative max-h-48 w-full overflow-hidden rounded-lg border border-border bg-black/5 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Pré-visualização"
                  className="max-h-48 w-auto object-contain rounded-lg"
                />
                {uploading && (
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="text-xs font-semibold">
                      Otimizando e enviando para o Cloudflare R2...
                    </span>
                  </div>
                )}
              </div>
              {uploadedResult && !uploading && (
                <div className="flex items-center gap-2 text-xs font-semibold text-green-600 dark:text-green-400">
                  <Check className="h-4 w-4" />
                  <span>
                    Imagem pronta ({uploadedResult.sizeKB} KB) — Clique na imagem se quiser trocar
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ImageIcon className="h-7 w-7" />
              </div>
              <div className="space-y-1">
                <p className="text-base font-semibold text-foreground">
                  Arraste e solte a imagem aqui
                </p>
                <p className="text-xs text-muted-foreground">
                  ou clique no botão abaixo para procurar no seu dispositivo (também aceita Ctrl+V)
                </p>
              </div>
              <button
                type="button"
                disabled={uploading}
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="mt-2 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/90 transition-colors"
              >
                <FolderOpen className="h-4 w-4" />
                Procurar Imagem no Computador
              </button>
            </div>
          )}
        </div>

        {/* Campo opcional de crédito/legenda (quando usado no editor de corpo da matéria) */}
        {withCredit && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Crédito / Legenda da Foto (Opcional)
            </label>
            <input
              type="text"
              value={credit}
              onChange={(e) => setCredit(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.stopPropagation();
                  if (uploadedResult && !uploading) {
                    handleConfirmWithCredit();
                  }
                }
              }}
              placeholder="Ex: Gilvan de Souza / Flamengo"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-3 text-xs font-medium text-destructive">
            {error}
          </div>
        )}

        {/* Rodapé da Janela */}
        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            disabled={uploading}
            onClick={() => onOpenChange(false)}
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-xs font-semibold hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          {withCredit && (
            <button
              type="button"
              disabled={!uploadedResult || uploading}
              onClick={handleConfirmWithCredit}
              className="inline-flex items-center justify-center gap-1.5 rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              Inserir Foto no Texto
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
