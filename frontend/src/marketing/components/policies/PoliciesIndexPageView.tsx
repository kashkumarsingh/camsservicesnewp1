import type { ReactElement } from 'react';
import Link from 'next/link';
import { FileText } from 'lucide-react';
import Section from '@/components/layout/Section';
import type { PageDTO } from '@/core/application/pages/dto/PageDTO';

type PoliciesIndexPageViewProps = {
  policies: PageDTO[];
  heroTitle: string;
  heroSubtitle: string;
  introHeading?: string;
  introBody?: string;
  policiesBySlug: (slug: string) => string;
  emptyMessage: string;
  emptyContact: string;
  emptyContactSuffix: string;
  contactMailTo: string;
  contactEmail: string;
};

export function PoliciesIndexPageView({
  policies,
  heroTitle,
  heroSubtitle,
  introHeading,
  introBody,
  policiesBySlug,
  emptyMessage,
  emptyContact,
  emptyContactSuffix,
  contactMailTo,
  contactEmail,
}: PoliciesIndexPageViewProps): ReactElement {
  return (
    <div>
      <Section className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8 text-white overflow-hidden bg-gradient-to-br from-primary-blue to-navy-blue">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('/svgs/geometric-pattern.svg')", backgroundRepeat: 'repeat' }} />
        <div className="relative max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-heading font-extrabold leading-tight tracking-tight">{heroTitle}</h1>
          <p className="mt-6 text-lg md:text-xl max-w-2xl mx-auto font-sans font-light text-white/90">{heroSubtitle}</p>
        </div>
      </Section>

      <div className="py-20 bg-gradient-to-br from-blue-50 to-white">
        <Section>
          <div className="max-w-2xl mx-auto">
            {(introHeading || introBody) && (
              <div className="mb-10 text-center">
                {introHeading && <h2 className="text-2xl font-heading font-semibold text-navy-blue">{introHeading}</h2>}
                {introBody && <p className="mt-3 text-slate-600">{introBody}</p>}
              </div>
            )}
            {policies.length > 0 ? (
              <ul className="space-y-3">
                {policies.map((policy) => (
                  <li key={policy.id}>
                    <Link
                      href={policiesBySlug(policy.slug)}
                      className="flex items-center gap-3 p-4 rounded-xl border-2 border-primary-blue/20 bg-white hover:border-primary-blue/30 hover:shadow-card transition-all text-navy-blue font-medium"
                    >
                      <FileText className="h-5 w-5 text-primary-blue flex-shrink-0" />
                      <span>{policy.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="rounded-xl border-2 border-primary-blue/20 bg-white p-8 text-center text-navy-blue/80">
                <p className="mb-4">{emptyMessage}</p>
                <p className="text-sm">
                  {emptyContact}{' '}
                  <a href={contactMailTo} className="text-primary-blue hover:underline">
                    {contactEmail}
                  </a>{' '}
                  {emptyContactSuffix}
                </p>
              </div>
            )}
          </div>
        </Section>
      </div>
    </div>
  );
}
