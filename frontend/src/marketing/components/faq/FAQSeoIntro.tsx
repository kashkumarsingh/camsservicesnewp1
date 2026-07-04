import type { ReactElement } from "react";
import Link from "next/link";
import { ROUTES } from "@/shared/utils/routes";

type FAQSeoIntroProps = {
  heading: string;
  body: string;
};

export function FAQSeoIntro({ heading, body }: FAQSeoIntroProps): ReactElement {
  return (
    <section className="border-b border-slate-200 bg-white py-10">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h1 className="font-heading text-3xl font-bold text-navy-blue md:text-4xl">{heading}</h1>
        <p className="mt-4 text-base leading-7 text-slate-600">{body}</p>
        <p className="mt-4 text-sm leading-6 text-slate-500">
          Need commissioning detail? Read about{" "}
          <Link href={ROUTES.SERVICES} className="font-semibold text-primary-blue underline underline-offset-2">
            CAMS Services
          </Link>
          , compare{" "}
          <Link href={ROUTES.PACKAGES} className="font-semibold text-primary-blue underline underline-offset-2">
            intervention packages
          </Link>
          , or review our{" "}
          <Link href={ROUTES.POLICIES} className="font-semibold text-primary-blue underline underline-offset-2">
            policies and safeguarding documents
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
