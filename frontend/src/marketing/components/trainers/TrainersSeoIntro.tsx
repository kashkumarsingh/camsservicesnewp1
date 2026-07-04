import type { ReactElement } from "react";
import Link from "next/link";
import { ROUTES } from "@/shared/utils/routes";

type TrainersSeoIntroProps = {
  title: string;
  subtitle: string;
};

/** Server-rendered trainers copy for crawlers (client hero may not SSR). */
export function TrainersSeoIntro({ title, subtitle }: TrainersSeoIntroProps): ReactElement {
  return (
    <section className="border-b border-slate-200 bg-white py-10">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <h1 className="font-heading text-3xl font-bold text-navy-blue md:text-4xl">{title}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-navy-blue/80">{subtitle}</p>
        <div className="mx-auto mt-8 max-w-3xl space-y-4 text-left text-base leading-7 text-navy-blue/85">
          <p>
            CAMS services trainers are DBS-checked specialists delivering trauma-informed mentoring, chaperone
            support, and SEND-aware sessions across the UK. Every practitioner is recruited against our
            safeguarding standards, trained in de-escalation and professional boundaries, and supervised by
            experienced leads who understand education, children&apos;s services, and family support contexts.
          </p>
          <p>
            Families and referrers work with the same mentor wherever possible so young people build trust
            and consistency. Trainers lead activities that match each child&apos;s interests, from sports and
            fitness to community outings, while tracking goals agreed at the start of an intervention package.
          </p>
          <p>
            CAMS services trainers complete induction, safeguarding training, and ongoing supervision. Session notes
            and referrer updates are completed where commissioned so families, schools, and local authorities can see
            that provision is active and aligned with agreed goals.
          </p>
          <p>
            Interested in joining the team? Visit{" "}
            <Link href={ROUTES.BECOME_A_TRAINER} className="font-semibold text-primary-blue underline underline-offset-2">
              become a trainer
            </Link>
            . To commission support, see our{" "}
            <Link href={ROUTES.PACKAGES} className="font-semibold text-primary-blue underline underline-offset-2">
              intervention packages
            </Link>
            , read our{" "}
            <Link href={ROUTES.BLOG} className="font-semibold text-primary-blue underline underline-offset-2">
              commissioning guides
            </Link>
            , or{" "}
            <Link href={ROUTES.CONTACT} className="font-semibold text-primary-blue underline underline-offset-2">
              contact CAMS services
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
