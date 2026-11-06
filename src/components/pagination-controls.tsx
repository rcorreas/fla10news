import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
}

export function PaginationControls({ currentPage, totalPages, basePath }: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= totalPages;
  const prevHref = currentPage - 1 <= 1 ? basePath : `${basePath}?page=${currentPage - 1}`;
  const nextHref = `${basePath}?page=${currentPage + 1}`;

  return (
    <div className="flex items-center justify-center gap-4 mt-8">
      {isFirstPage ? (
        <Button
          variant="outline"
          size="icon"
          disabled
          aria-label="Página anterior"
          className="pointer-events-none opacity-50"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      ) : (
        <Button
          variant="outline"
          size="icon"
          asChild
        >
          <Link href={prevHref} aria-label="Página anterior">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
      )}

      <div className="text-sm font-medium text-muted-foreground">
        Página {currentPage} de {totalPages}
      </div>

      {isLastPage ? (
        <Button
          variant="outline"
          size="icon"
          disabled
          aria-label="Próxima página"
          className="pointer-events-none opacity-50"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      ) : (
        <Button
          variant="outline"
          size="icon"
          asChild
        >
          <Link href={nextHref} aria-label="Próxima página">
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      )}
    </div>
  );
}
