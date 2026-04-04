import { useState } from 'react';

export interface PaginationState {
  page: number;
  pageSize: number;
  offset: number;
  limit: number;
}

export function usePagination(initialPageSize: number = 50) {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const offset = page * pageSize;
  const limit = offset + pageSize - 1;

  const nextPage = () => setPage(p => p + 1);
  const prevPage = () => setPage(p => Math.max(0, p - 1));
  const goToPage = (newPage: number) => setPage(Math.max(0, newPage));
  const resetPage = () => setPage(0);
  const changePageSize = (newSize: number) => {
    setPageSize(newSize);
    setPage(0);
  };

  return {
    page,
    pageSize,
    offset,
    limit,
    nextPage,
    prevPage,
    goToPage,
    resetPage,
    changePageSize,
  };
}
