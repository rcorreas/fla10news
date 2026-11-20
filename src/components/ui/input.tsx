"use client";

import * as React from "react";
import { Upload, Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { compressAndUploadImage } from "@/lib/image-upload-client";

const IMAGE_FIELD_REGEX = /^(image\d*|imageHome|imageUrl|authorImage|columnImage|teamALogo|teamBLogo|logo)$/i;

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, name, id, ...props }, ref) => {
    const internalInputRef = React.useRef<HTMLInputElement | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement | null>(null);
    const [uploading, setUploading] = React.useState(false);
    const [uploadInfo, setUploadInfo] = React.useState<string | null>(null);
    const [uploadError, setUploadError] = React.useState<string | null>(null);

    const setMergedRef = React.useCallback(
      (node: HTMLInputElement | null) => {
        internalInputRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
        }
      },
      [ref]
    );

    const fieldIdentifier = name || id || "";
    const isImageField =
      type !== "file" &&
      type !== "hidden" &&
      type !== "date" &&
      IMAGE_FIELD_REGEX.test(fieldIdentifier);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setUploading(true);
      setUploadError(null);
      setUploadInfo(null);

      try {
        const result = await compressAndUploadImage(file, {
          folder: fieldIdentifier.toLowerCase().includes("tirinha") ? "tirinhas" : "materias",
        });

        const inputEl = internalInputRef.current;
        if (inputEl) {
          const nativeSetter = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype,
            "value"
          )?.set;
          nativeSetter?.call(inputEl, result.url);
          inputEl.dispatchEvent(new Event("input", { bubbles: true }));
          inputEl.dispatchEvent(new Event("change", { bubbles: true }));
        }

        const providerLabel = result.provider === "cloudflare-r2" ? "R2" : "Cloud";
        setUploadInfo(`${result.sizeKB} KB (${providerLabel})`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Erro ao enviar imagem";
        setUploadError(msg);
      } finally {
        setUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    };

    const inputElement = (
      <input
        type={type}
        name={name}
        id={id}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={setMergedRef}
        {...props}
      />
    );

    if (!isImageField) {
      return inputElement;
    }

    return (
      <div className="space-y-1.5 w-full">
        <div className="flex items-center gap-2 w-full">
          {inputElement}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            title="Enviar imagem do computador ou celular (comprime automaticamente para JPEG leve)"
            className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md text-xs font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-3 shrink-0 shadow-sm"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Enviando...</span>
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                <span>Enviar Foto</span>
              </>
            )}
          </button>
        </div>
        {uploadInfo && (
          <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1 font-medium">
            <Check className="h-3.5 w-3.5" />
            Imagem otimizada e enviada com sucesso ({uploadInfo})
          </p>
        )}
        {uploadError && (
          <p className="text-xs text-destructive font-medium">{uploadError}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
