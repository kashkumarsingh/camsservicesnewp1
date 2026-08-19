import type { ReactElement } from 'react';
import Link from 'next/link';
import { Button } from '@/marketing/components/ui/button';
import { InterventionPackageIcon } from '@/marketing/components/shared/CamsIcon';
import { PAGE_LAYOUT, PAGE_TYPOGRAPHY } from '@/marketing/components/shared/page-layout';
import { packageDetailHref } from '@/marketing/lib/package-detail-slug';
import { ROUTES } from '@/shared/utils/routes';
import {
  AGE_AND_ASSESSMENT_COPY,
  CHECKOUT_CTA_LABEL,
  CHECKOUT_DISCLOSURES,
  CHOOSE_MEMBERSHIP_LABEL,
  COMMUNITY_TRAVEL_COPY,
  EARLY_SERVICE_REQUEST_LABEL,
  ELIGIBLE_SUPPORT,
  FLEXIBILITY_EXAMPLE,
  FLEXIBLE_SUPPORT_FOOTER,
  FLEXIBLE_SUPPORT_HEADING,
  FLEXIBLE_SUPPORT_INTRO,
  FLEXIBLE_SUPPORT_POINTS,
  HOUR_EXPIRY_COPY,
  MEMBERSHIP_PLANS,
  MEMBERSHIP_STAYS_COPY,
  SUBSCRIPTION_UPGRADES,
  USE_REMAINING_HOURS_COPY,
  WAITING_TIME_COPY,
} from '@/marketing/content/membership-subscriptions';

export function MembershipSubscriptionsSection(): ReactElement {
  return (
    <>
      <section className={`bg-white ${PAGE_LAYOUT.sectionPadding}`}>
        <div className={PAGE_LAYOUT.container}>
          <header className={PAGE_LAYOUT.sectionHeader}>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cams-primary">
              Membership + Support Subscription
            </p>
            <h2 className={`${PAGE_TYPOGRAPHY.sectionHeading} tracking-tight text-cams-dark`}>
              CAMS monthly Support Subscriptions
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-base leading-relaxed text-cams-slate md:text-lg">
              {AGE_AND_ASSESSMENT_COPY}
            </p>
          </header>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {MEMBERSHIP_PLANS.map((plan) => (
              <article
                key={plan.id}
                className="flex h-full flex-col rounded-2xl border border-slate-200 bg-[#F1F5FB] p-6"
              >
                <InterventionPackageIcon packageId={plan.id} size={40} />
                <h3 className="mt-4 font-heading text-xl font-bold text-cams-dark">{plan.name}</h3>
                <p className="mt-2 font-heading text-3xl font-bold text-cams-primary">{plan.monthlyPriceLabel}</p>
                <p className="mt-1 text-sm font-semibold uppercase tracking-wide text-cams-ink">
                  {plan.hoursLabel} of eligible CAMS support
                </p>
                <p className="mt-3 text-sm leading-6 text-cams-slate">{plan.shortDescription}</p>
                <ul className="mt-4 flex-1 space-y-2 text-sm text-cams-ink-secondary">
                  {plan.benefits.map((benefit) => (
                    <li key={benefit}>{benefit}</li>
                  ))}
                </ul>
                <Link
                  href={packageDetailHref(plan.id)}
                  className="mt-4 text-sm font-semibold text-cams-primary underline-offset-4 hover:underline"
                >
                  View {plan.name.replace(' Membership', '')} details
                </Link>
                <Button href={plan.chooseHref} variant="ctaPrimary" className="mt-4 w-full justify-center">
                  {CHOOSE_MEMBERSHIP_LABEL}
                </Button>
              </article>
            ))}
          </div>

          <p className="mt-8 text-center text-base font-semibold text-cams-ink md:text-lg">{MEMBERSHIP_STAYS_COPY}</p>
        </div>
      </section>

      <section id="flexible-support" className={`scroll-mt-24 bg-cams-soft ${PAGE_LAYOUT.sectionPadding}`}>
        <div className={PAGE_LAYOUT.container}>
          <h2 className={`${PAGE_TYPOGRAPHY.sectionHeading} text-cams-dark`}>{FLEXIBLE_SUPPORT_HEADING}</h2>
          <p className={`mt-4 max-w-3xl ${PAGE_TYPOGRAPHY.body}`}>{FLEXIBLE_SUPPORT_INTRO}</p>
          <p className="mt-4 font-semibold text-cams-ink">Members can:</p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {FLEXIBLE_SUPPORT_POINTS.map((point) => (
              <li key={point} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-cams-ink">
                {point}
              </li>
            ))}
          </ul>
          <p className={`mt-6 ${PAGE_TYPOGRAPHY.body}`}>{FLEXIBLE_SUPPORT_FOOTER}</p>

          <h3 className="mt-12 font-heading text-2xl font-bold text-cams-dark">Example of monthly flexibility</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            {FLEXIBILITY_EXAMPLE.map((row) => (
              <div key={row.month} className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-cams-primary">{row.month}</p>
                <p className="mt-2 font-heading font-bold text-cams-ink">{row.plan}</p>
                <p className="mt-1 text-sm text-cams-slate">{row.price}</p>
                <p className="mt-1 text-sm text-cams-ink-secondary">{row.hours}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="upgrades" className={`scroll-mt-24 bg-white ${PAGE_LAYOUT.sectionPadding}`}>
        <div className={PAGE_LAYOUT.container}>
          <h2 className={`${PAGE_TYPOGRAPHY.sectionHeading} text-cams-dark`}>Subscription upgrades</h2>
          <p className={`mt-4 max-w-3xl ${PAGE_TYPOGRAPHY.body}`}>
            Increase your Support Subscription during the current period by paying the difference. A lower
            subscription takes effect from the next period. Pausing paid support also applies from the next
            applicable period. Ending CAMS Membership is separate from pausing a Support Subscription.
          </p>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-[#F1F5FB]">
                <tr>
                  <th className="px-4 py-3 font-bold">Upgrade</th>
                  <th className="px-4 py-3 font-bold">Additional payment</th>
                  <th className="px-4 py-3 font-bold">Hours</th>
                </tr>
              </thead>
              <tbody>
                {SUBSCRIPTION_UPGRADES.map((row) => (
                  <tr key={`${row.from}-${row.to}`} className="border-t border-slate-100">
                    <td className="px-4 py-3 capitalize">
                      {row.from} to {row.to}
                    </td>
                    <td className="px-4 py-3 font-semibold">£{row.extraGbp}</td>
                    <td className="px-4 py-3">
                      {row.hoursFrom} hours to {row.hoursTo} hours
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className={`bg-cams-soft ${PAGE_LAYOUT.sectionPadding}`}>
        <div className={PAGE_LAYOUT.container}>
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <h2 className="font-heading text-2xl font-bold text-cams-dark">Using remaining hours</h2>
              <p className={`mt-3 ${PAGE_TYPOGRAPHY.body}`}>{USE_REMAINING_HOURS_COPY}</p>
              <h3 className="mt-8 font-heading text-2xl font-bold text-cams-dark">Monthly hour expiry</h3>
              <p className={`mt-3 ${PAGE_TYPOGRAPHY.body}`}>{HOUR_EXPIRY_COPY}</p>
            </div>
            <div>
              <h2 className="font-heading text-2xl font-bold text-cams-dark">Waiting time</h2>
              <p className={`mt-3 ${PAGE_TYPOGRAPHY.body}`}>{WAITING_TIME_COPY}</p>
              <h3 className="mt-8 font-heading text-2xl font-bold text-cams-dark">Community travel during CAMS support</h3>
              <p className={`mt-3 ${PAGE_TYPOGRAPHY.body}`}>{COMMUNITY_TRAVEL_COPY}</p>
            </div>
          </div>
        </div>
      </section>

      <section className={`bg-white ${PAGE_LAYOUT.sectionPadding}`}>
        <div className={PAGE_LAYOUT.container}>
          <h2 className={`${PAGE_TYPOGRAPHY.sectionHeading} text-cams-dark`}>Eligible CAMS support</h2>
          <p className={`mt-4 max-w-3xl ${PAGE_TYPOGRAPHY.body}`}>
            Subscription hours can be allocated towards approved CAMS support based on the agreed needs,
            circumstances and support objectives of the child or young person.
          </p>
          <ul className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {ELIGIBLE_SUPPORT.map((item) => (
              <li key={item} className="rounded-xl border border-slate-200 bg-[#F1F5FB] px-4 py-3 text-sm">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={`bg-cams-soft ${PAGE_LAYOUT.sectionPadding}`}>
        <div className={PAGE_LAYOUT.container}>
          <h2 className={`${PAGE_TYPOGRAPHY.sectionHeading} text-cams-dark`}>Before you start a paid Support Subscription</h2>
          <p className={`mt-4 max-w-3xl ${PAGE_TYPOGRAPHY.body}`}>
            Checkout will confirm membership, package, monthly price, hours, dates, next billing date,
            hour expiry, waiting time, upgrades, pause, cancellation and cooling-off information, then
            Membership Terms, Subscription Terms, Privacy Notice and safeguarding information.
          </p>
          <ul className="mt-4 columns-1 gap-x-8 text-sm text-cams-slate sm:columns-2 lg:columns-3">
            {CHECKOUT_DISCLOSURES.map((item) => (
              <li key={item} className="mb-2">
                {item}
              </li>
            ))}
          </ul>
          <p className={`mt-6 ${PAGE_TYPOGRAPHY.body}`}>
            Many online service contracts currently carry a 14 day cancellation period under the Consumer
            Contracts Regulations 2013. Where you ask CAMS to begin paid support during that period, we
            record this request:
          </p>
          <p className="mt-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-cams-ink">
            ☐ {EARLY_SERVICE_REQUEST_LABEL}
          </p>
          <div className="mt-6">
            <Button href={ROUTES.REGISTER} variant="ctaPrimary">
              {CHECKOUT_CTA_LABEL}
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
