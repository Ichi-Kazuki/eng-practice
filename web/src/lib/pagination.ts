export function parsePage(value: string | string[] | undefined): number {
  if (typeof value !== "string" || !/^\d+$/.test(value)) return 1;

  const page = Number(value);
  return Number.isSafeInteger(page) && page > 0 ? Math.min(page, 100_000) : 1;
}

export function getPageCount(total: number, pageSize: number): number {
  return Math.max(1, Math.ceil(total / pageSize));
}

export function getPageSlice<T>(items: T[], page: number, pageSize: number) {
  const pageCount = getPageCount(items.length, pageSize);
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    currentPage,
    pageCount,
    total: items.length,
  };
}
