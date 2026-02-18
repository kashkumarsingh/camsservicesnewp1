import { redirect } from 'next/navigation';

type Props = {
  searchParams: Promise<{ package?: string; childId?: string }>;
};

/**
 * Package purchase is done from the parent dashboard only.
 * Public /checkout is redirected to the parent dashboard with package (and optional childId) so
 * parents complete purchase in their dashboard (Buy Hours modal).
 */
export default async function CheckoutPage({ searchParams }: Props) {
  const resolvedParams = await searchParams;
  const packageSlug = resolvedParams.package;

  if (!packageSlug) {
    redirect('/packages');
  }

  const childId = resolvedParams.childId ?? '';
  const query = new URLSearchParams({ package: packageSlug });
  if (childId) query.set('childId', childId);
  redirect(`/dashboard/parent?${query.toString()}`);
}
