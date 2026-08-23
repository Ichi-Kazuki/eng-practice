import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border py-4">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-4 gap-y-1 px-6 text-xs text-muted-foreground">
        <Link href="/privacy" className="hover:text-foreground hover:underline">
          プライバシーポリシー
        </Link>
        <Link href="/terms" className="hover:text-foreground hover:underline">
          利用規約
        </Link>
      </div>
    </footer>
  );
}
