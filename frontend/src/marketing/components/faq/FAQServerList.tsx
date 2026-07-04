import type { ReactElement } from 'react';

type FaqEntry = { question: string; answer: string };

type FAQServerListProps = {
  faqs: FaqEntry[];
};

/** Crawlable FAQ list for SSR (Semrush word count). Answers stay in the HTML source. */
export function FAQServerList({ faqs }: FAQServerListProps): ReactElement {
  if (faqs.length === 0) return <></>;

  return (
    <div className="space-y-4">
      {faqs.map((faq) => (
        <details
          key={faq.question}
          className="group rounded-xl border-2 border-gray-200 bg-white open:border-primary-blue open:bg-blue-50/40"
        >
          <summary className="cursor-pointer list-none px-6 py-4 font-bold text-gray-900 marker:content-none [&::-webkit-details-marker]:hidden">
            <span className="text-base sm:text-lg">{faq.question}</span>
          </summary>
          <div className="border-t border-gray-100 px-6 pb-5 pt-3">
            <p className="text-sm leading-relaxed text-gray-700 sm:text-base">{faq.answer}</p>
          </div>
        </details>
      ))}
    </div>
  );
}
