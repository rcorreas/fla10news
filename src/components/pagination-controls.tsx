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

  return (
    <div className="flex items-center justify-center gap-4 mt-8">
      <Button
        variant="outline"
        size="icon"
        asChild
        disabled={currentPage <= 1}
        className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
      >
        <Link href={`${basePath}?page=${currentPage - 1}`}>
          <ChevronLeft className="h-4 w-4" />
        </Link>
      </Button>

      <div className="text-sm font-medium text-muted-foreground">
        Página {currentPage} de {totalPages}
      </div>

      <Button
        variant="outline"
        size="icon"
        asChild
        disabled={currentPage >= totalPages}
        className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
      >
        <Link href={`${basePath}?page=${currentPage + 1}`}>
          <ChevronRight className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}
