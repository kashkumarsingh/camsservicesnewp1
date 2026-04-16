import type { PackageFaqItem } from "@/marketing/mock/intervention-packages";

export type FaqApiItem = {
  category?: string;
  title?: string;
  content?: string;
};

export function mapPackageFaqs(
  apiFaqs: readonly FaqApiItem[],
  fallbackFaqs: readonly PackageFaqItem[]
): readonly PackageFaqItem[] {
  const mapped = apiFaqs
    .filter((faq) => String(faq.category ?? "").toLowerCase() === "packages")
    .map((faq) => ({
      q: String(faq.title ?? ""),
      a: String(faq.content ?? "")
    }))
    .filter((faq) => faq.q.trim().length > 0 && faq.a.trim().length > 0);

  return mapped.length > 0 ? mapped : fallbackFaqs;
}
