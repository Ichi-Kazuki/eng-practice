export default function AdminLoading() {
  return (
    <div className="flex justify-center py-24">
      <div
        className="size-8 animate-spin rounded-full border-2 border-border border-t-primary"
        role="status"
        aria-label="読み込み中"
      />
    </div>
  );
}
