'use client';

import { useEffect, useState } from "react";
import type { PublicPageDTO } from "@/core/application/publicPages/dto/PublicPageDTO";
import { ListPublicPagesUseCase } from "@/core/application/publicPages/useCases/ListPublicPagesUseCase";
import { publicPagesRepository } from "@/infrastructure/persistence/publicPages";
import type { PublicPageFilterOptions } from "@/core/application/publicPages/ports/IPublicPagesRepository";

export function useAdminPublicPages(options?: PublicPageFilterOptions) {
  const [pages, setPages] = useState<PublicPageDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const listPages = async () => {
      try {
        setLoading(true);
        setError(null);

        const useCase = new ListPublicPagesUseCase(publicPagesRepository);
        const result = await useCase.execute(options);
        setPages(result);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load public pages";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    listPages();
  }, [options?.type, options?.published]);

  return { pages, loading, error };
}

