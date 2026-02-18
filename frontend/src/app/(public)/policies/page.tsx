import Section from '@/components/layout/Section';
import { ListPoliciesUseCase } from '@/core/application/pages/useCases/ListPoliciesUseCase';
import { pageRepository } from '@/infrastructure/persistence/pages';
import { Metadata } from 'next';
import { headers } from 'next/headers';
import Link from 'next/link';
import { withTimeoutFallback } from '@/utils/promiseUtils';
import { FileText } from 'lucide-react';

export const revalidate = 1800;

async function getPolicies() {
  const useCase = new ListPoliciesUseCase(pageRepository);
  return withTimeoutFallback(useCase.execute(), 5000, []);
}

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get('host');
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}`;

  return {
    title: 'Policies & Legal - CAMS Services',
    description: 'Terms of service, privacy policy, safeguarding, cancellation, and other policies for CAMS Services.',
    openGraph: {
      title: 'Policies & Legal - CAMS Services',
      description: 'Terms of service, privacy policy, safeguarding, and other policies.',
      url: `${baseUrl}/policies`,
      type: 'website',
    },
    alternates: {
      canonical: `${baseUrl}/policies`,
    },
  };
}

export default async function PoliciesIndexPage() {
  const policies = await getPolicies();

  return (
    <div>
      <Section className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8 text-white overflow-hidden bg-gradient-to-br from-[#0080FF] to-[#1E3A5F]">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "url('/svgs/geometric-pattern.svg')",
            backgroundRepeat: 'repeat',
          }}
        />
        <div className="relative z-20 max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-heading font-extrabold leading-tight tracking-tight">
            Policies & Legal
          </h1>
          <p className="mt-6 text-lg md:text-xl max-w-2xl mx-auto font-sans font-light text-white/90">
            Important documents including terms of service, privacy, safeguarding, and refunds.
          </p>
        </div>
      </Section>

      <div className="py-20 bg-gradient-to-br from-blue-50 to-white">
        <Section>
          <div className="max-w-2xl mx-auto">
            {policies.length > 0 ? (
              <ul className="space-y-3">
                {policies.map((policy) => (
                  <li key={policy.id}>
                    <Link
                      href={`/policies/${policy.slug}`}
                      className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-white hover:border-[#0080FF]/30 hover:shadow-md transition-all text-[#1E3A5F] font-medium"
                    >
                      <FileText className="h-5 w-5 text-[#0080FF] flex-shrink-0" />
                      <span>{policy.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-600">
                <p className="mb-4">No published policies are available at the moment.</p>
                <p className="text-sm">
                  You can still reach us at{' '}
                  <a href="mailto:info@camsservices.co.uk" className="text-[#0080FF] hover:underline">
                    info@camsservices.co.uk
                  </a>{' '}
                  for any questions.
                </p>
              </div>
            )}
          </div>
        </Section>
      </div>
    </div>
  );
}
