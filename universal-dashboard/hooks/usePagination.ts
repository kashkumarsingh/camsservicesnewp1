import React from "react";

export const usePagination = (total: number, pageSize: number) => {
  const [page, setPage] = React.useState(1);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const next = () => setPage((previous) => Math.min(totalPages, previous + 1));
  const previous = () =>
    setPage((previous) => Math.max(1, previous - 1));

  const goTo = (nextPage: number) =>
    setPage(Math.min(totalPages, Math.max(1, nextPage)));

  return {
    page,
    totalPages,
    next,
    previous,
    goTo,
  };
};

