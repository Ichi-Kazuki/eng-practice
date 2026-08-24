import Link from "next/link";
import { Button } from "@/components/ui/button";

type PaginationControlsProps = {
  currentPage: number;
  pageCount: number;
  buildHref: (page: number) => string;
  label: string;
};

export function PaginationControls({
  currentPage,
  pageCount,
  buildHref,
  label,
}: PaginationControlsProps) {
  if (pageCount <= 1) return null;

  return (
    <nav
      className="mt-6 flex items-center justify-between gap-3"
      aria-label={`${label}のページ移動`}
    >
      {currentPage > 1 ? (
        <Button
          render={<Link href={buildHref(currentPage - 1)} />}
          nativeButton={false}
          variant="outline"
          size="sm"
        >
          前のページ
        </Button>
      ) : (
        <span aria-hidden="true" className="h-7" />
      )}

      <p className="text-xs text-muted-foreground" aria-live="polite">
        {currentPage} / {pageCount}ページ
      </p>

      {currentPage < pageCount ? (
        <Button
          render={<Link href={buildHref(currentPage + 1)} />}
          nativeButton={false}
          variant="outline"
          size="sm"
        >
          次のページ
        </Button>
      ) : (
        <span aria-hidden="true" className="h-7" />
      )}
    </nav>
  );
}
