"use client";

import type { ReactElement } from "react";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/marketing/components/ui/button";
import { PageShell } from "@/marketing/components/shared/PageShell";
import { PageHeroBand } from "@/marketing/components/shared/PageHeroBand";
import { CamsIcon, type CamsIconName } from "@/marketing/components/shared/CamsIcon";
import { PAGE_LAYOUT, PAGE_SURFACES } from "@/marketing/components/shared/page-layout";
import { camsUnsplashPhotoUrl } from "@/marketing/mock/cams-unsplash";
import { useTrainerApplicationForm } from "@/interfaces/web/hooks/trainerApplications/useTrainerApplicationForm";

const TRAINER_PROMO_IMAGE = camsUnsplashPhotoUrl("1575800542980-4753fe7fd72e", 1400, 900);

const FEATURE_POINTS: ReadonlyArray<{ icon: CamsIconName; title: string; description: string }> = [
  {
    icon: "wallet",
    title: "Families ready to book",
    description:
      "Parents arrive with clear goals and prepaid hours, so you can focus on coaching delivery instead of admin and payments."
  },
  {
    icon: "mapPin",
    title: "Location smart matching",
    description:
      "Set your preferred radius and availability; our team matches you with suitable assignments across London and Essex."
  },
  {
    icon: "heartHandshake",
    title: "Safeguarding first",
    description:
      "DBS, insurance, and specialist tags stay in one profile so operations can fast-track assignment checks and approvals."
  }
];

const ONBOARDING_STEPS: ReadonlyArray<{
  icon: CamsIconName;
  title: string;
  detail: string;
}> = [
  {
    icon: "listTodo",
    title: "Application profile",
    detail:
      "Share your activity specialisms, coverage radius, and right-to-work details so we can map your fit quickly."
  },
  {
    icon: "listChecks",
    title: "Compliance review",
    detail:
      "Our UK operations team checks safeguarding and compliance evidence within the standard review window."
  },
  {
    icon: "sparkles",
    title: "Curated booking launch",
    detail:
      "Receive onboarding confirmation, portal access, and assignments aligned to your expertise and availability."
  }
];

const FORM_STEPS: ReadonlyArray<{
  id: number;
  icon: CamsIconName;
  title: string;
  description: string;
}> = [
  { id: 1, icon: "activity", title: "Activities", description: "What activities you can facilitate." },
  { id: 2, icon: "users", title: "Profile", description: "Who you are and your expertise." },
  { id: 3, icon: "mapPin", title: "Coverage", description: "Where and when you coach." },
  { id: 4, icon: "clipboardList", title: "Safeguarding", description: "DBS, insurance, and documents." }
];

const QUALIFICATION_OPTIONS: readonly string[] = [
  "Level 2 Safeguarding",
  "Level 3 Safeguarding",
  "First Aid",
  "Boxing Coach Award",
  "Fitness Instructor / PT",
  "Youth Mentoring / Youth Work",
  "SEN / Additional Needs Training"
];

type TrainerWizardValues = {
  activityCoverageChoice: "all" | "limited" | "";
  limitedActivities: string;
  legalName: string;
  email: string;
  phone: string;
  experienceYears: number;
  dateOfBirth: string;
  rightToWorkUk: "yes" | "no" | "";
  qualificationsSelected: string[];
  qualificationsOther: string;
  mainPostcode: string;
  travelRadius: string;
  transportMode: "public-transport" | "car" | "both" | "";
  availabilityWeekdays: string;
  availabilityEvenings: string;
  availabilityWeekends: string;
  enhancedDbs: "yes" | "no" | "in-progress" | "";
  dbsUpdateService: "yes" | "no" | "";
  safeguardingLevel: "level-2" | "level-3" | "none" | "";
  publicLiabilityInsurance: "yes" | "no" | "in-progress" | "";
  referenceCount: "0" | "1" | "2plus" | "";
  complianceNotes: string;
};

const INITIAL_WIZARD_VALUES: TrainerWizardValues = {
  activityCoverageChoice: "",
  limitedActivities: "",
  legalName: "",
  email: "",
  phone: "",
  experienceYears: 0,
  dateOfBirth: "",
  rightToWorkUk: "",
  qualificationsSelected: [],
  qualificationsOther: "",
  mainPostcode: "",
  travelRadius: "",
  transportMode: "",
  availabilityWeekdays: "",
  availabilityEvenings: "",
  availabilityWeekends: "",
  enhancedDbs: "",
  dbsUpdateService: "",
  safeguardingLevel: "",
  publicLiabilityInsurance: "",
  referenceCount: "",
  complianceNotes: ""
};

const QUALITY_SIGNAL_ITEMS: ReadonlyArray<{
  icon: CamsIconName;
  label: string;
  value: string;
}> = [
  { icon: "timer", label: "Fast-track matching", value: "48 hours" },
  { icon: "listChecks", label: "Review window", value: "2 business days" },
  { icon: "target", label: "Safeguarding baseline", value: "Level 3 preferred" }
];

const UK_POSTCODE_REGEX =
  /^([Gg][Ii][Rr]\s?0[Aa]{2}|(?:[A-Za-z][0-9]{1,2}|[A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2}|[A-Za-z][0-9][A-Za-z]|[A-Za-z][A-Ha-hJ-Yj-y][0-9]?[A-Za-z])\s?[0-9][A-Za-z]{2})$/;
const UK_PHONE_REGEX = /^(?:\+44\s?7\d{3}|\(?07\d{3}\)?)\s?\d{3}\s?\d{3}$/;
const SIMPLE_EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function splitLegalName(legalName: string): { firstName: string; lastName: string } {
  const normalized = legalName.trim().replace(/\s+/g, " ");
  const [firstName = "", ...rest] = normalized.split(" ");
  const lastName = rest.join(" ").trim();
  return {
    firstName,
    lastName: lastName || "N/A",
  };
}

function toTravelRadiusKm(value: TrainerWizardValues["travelRadius"]): number {
  if (value === "0-5") return 5;
  if (value === "5-10") return 10;
  if (value === "10-20") return 20;
  if (value === "20+") return 30;
  return 5;
}

function isAtLeast18(dateOfBirthIso: string): boolean {
  if (!dateOfBirthIso) {
    return false;
  }
  const dob = new Date(dateOfBirthIso);
  if (Number.isNaN(dob.getTime())) {
    return false;
  }
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age -= 1;
  }
  return age >= 18;
}

export function BecomeATrainerPageClient(): ReactElement {
  const [currentWizardStep, setCurrentWizardStep] = useState<number>(1);
  const [wizardValues, setWizardValues] = useState<TrainerWizardValues>(INITIAL_WIZARD_VALUES);
  const [wizardSubmitted, setWizardSubmitted] = useState<boolean>(false);
  const [applicationSubmitted, setApplicationSubmitted] = useState<boolean>(false);
  const { submit, loading, error, result } = useTrainerApplicationForm();

  const activeStepMeta = FORM_STEPS[currentWizardStep - 1];
  const isValidEmail = SIMPLE_EMAIL_REGEX.test(wizardValues.email.trim());
  const isValidUkPhone = UK_PHONE_REGEX.test(wizardValues.phone.trim());
  const isValidUkPostcode = UK_POSTCODE_REGEX.test(wizardValues.mainPostcode.trim());
  const hasValidDob = isAtLeast18(wizardValues.dateOfBirth);
  const dbsEligible =
    wizardValues.enhancedDbs === "yes" || wizardValues.enhancedDbs === "in-progress";
  const safeguardingEligible =
    wizardValues.safeguardingLevel === "level-3" || wizardValues.safeguardingLevel === "level-2";
  const insuranceEligible =
    wizardValues.publicLiabilityInsurance === "yes" ||
    wizardValues.publicLiabilityInsurance === "in-progress";
  const referencesEligible =
    wizardValues.referenceCount === "1" || wizardValues.referenceCount === "2plus";
  const requiresCompliancePlan =
    wizardValues.enhancedDbs === "in-progress" ||
    wizardValues.publicLiabilityInsurance === "in-progress" ||
    wizardValues.dbsUpdateService === "no" ||
    wizardValues.safeguardingLevel === "level-2" ||
    wizardValues.referenceCount === "1";
  const hasCompliancePlan = wizardValues.complianceNotes.trim().length >= 20;

  const canContinue =
    (currentWizardStep === 1 &&
      (wizardValues.activityCoverageChoice === "all" ||
        (wizardValues.activityCoverageChoice === "limited" &&
          wizardValues.limitedActivities.trim().length > 0))) ||
    (currentWizardStep === 2 &&
      wizardValues.legalName.trim().length > 0 &&
      isValidEmail &&
      isValidUkPhone &&
      wizardValues.experienceYears >= 0 &&
      hasValidDob &&
      wizardValues.rightToWorkUk === "yes" &&
      (wizardValues.qualificationsSelected.length > 0 ||
        wizardValues.qualificationsOther.trim().length > 0)) ||
    (currentWizardStep === 3 &&
      isValidUkPostcode &&
      wizardValues.travelRadius.trim().length > 0 &&
      wizardValues.transportMode !== "" &&
      wizardValues.availabilityWeekdays.trim().length > 0 &&
      wizardValues.availabilityEvenings.trim().length > 0 &&
      wizardValues.availabilityWeekends.trim().length > 0) ||
    (currentWizardStep === 4 &&
      wizardValues.enhancedDbs !== "" &&
      wizardValues.dbsUpdateService !== "" &&
      wizardValues.safeguardingLevel !== "" &&
      wizardValues.publicLiabilityInsurance !== "" &&
      wizardValues.referenceCount !== "" &&
      dbsEligible &&
      safeguardingEligible &&
      insuranceEligible &&
      referencesEligible &&
      (!requiresCompliancePlan || hasCompliancePlan));

  async function handleTrainerApplicationSubmit(): Promise<void> {
    const { firstName, lastName } = splitLegalName(wizardValues.legalName);
    const hasDbsCheck = wizardValues.enhancedDbs === "yes";
    const certifications = [
      ...wizardValues.qualificationsSelected,
      wizardValues.qualificationsOther.trim(),
      wizardValues.safeguardingLevel === "level-3"
        ? "Safeguarding Level 3"
        : wizardValues.safeguardingLevel === "level-2"
          ? "Safeguarding Level 2"
          : "",
    ].filter((item) => item.length > 0);

    const availabilityPreferences = [
      `Weekdays: ${wizardValues.availabilityWeekdays.trim()}`,
      `Evenings: ${wizardValues.availabilityEvenings.trim()}`,
      `Weekends: ${wizardValues.availabilityWeekends.trim()}`,
      `Transport: ${wizardValues.transportMode}`,
    ];

    const exclusionReason =
      wizardValues.activityCoverageChoice === "limited"
        ? wizardValues.limitedActivities.trim() || "Candidate reported activity limitations."
        : undefined;
    const complianceSummary = [
      `DBS status: ${wizardValues.enhancedDbs}`,
      `DBS update service: ${wizardValues.dbsUpdateService}`,
      `Safeguarding level: ${wizardValues.safeguardingLevel}`,
      `Insurance status: ${wizardValues.publicLiabilityInsurance}`,
      `References: ${wizardValues.referenceCount}`,
      wizardValues.complianceNotes.trim() ? `Notes: ${wizardValues.complianceNotes.trim()}` : "",
    ]
      .filter((item) => item.length > 0)
      .join(" | ");

    try {
      await submit({
        firstName,
        lastName,
        email: wizardValues.email.trim(),
        phone: wizardValues.phone.trim(),
        postcode: wizardValues.mainPostcode.trim(),
        travelRadiusKm: toTravelRadiusKm(wizardValues.travelRadius),
        availabilityPreferences,
        exclusionReason,
        experienceYears: wizardValues.experienceYears,
        bio: complianceSummary,
        preferredAgeGroups: ["Early Years (3-5)", "Primary (6-11)", "Teens (12-16)"],
        certifications,
        hasDbsCheck,
        insuranceProvider:
          wizardValues.publicLiabilityInsurance === "yes"
            ? "Candidate has insurance in place"
            : wizardValues.publicLiabilityInsurance === "in-progress"
              ? "Insurance in progress"
              : undefined,
      });
      setApplicationSubmitted(true);
    } catch {
      setApplicationSubmitted(false);
    }
  }

  return (
    <PageShell maxWidthClassName="max-w-[1600px]">
      <PageHeroBand
        title={
          <>
            Become a <span className="text-cams-primary">trainer</span>
          </>
        }
        description="Join CAMS Services to coach families across London and Essex. Complete a premium UK-first onboarding flow with clear safeguarding requirements, faster review timelines, and curated bookings."
      />

      <section className="relative overflow-hidden rounded-2xl border border-cams-primary/20 bg-slate-950 shadow-[0_20px_44px_-30px_rgba(2,12,27,0.65)]">
        <Image
          src={TRAINER_PROMO_IMAGE}
          alt="CAMS trainer coaching children during an activity session in the UK"
          className="h-[380px] w-full object-cover md:h-[460px]"
          width={1400}
          height={900}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/88 via-slate-900/62 to-cams-primary/36" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/78 via-slate-950/8 to-transparent" />
        <div className="absolute left-0 top-0 h-full w-full p-6 md:p-10">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/45 bg-slate-950/35 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-white backdrop-blur-md">
              <CamsIcon name="sparkles" size={14} className="text-white" />
              UK trainer careers
            </p>
            <h2 className="mt-4 text-3xl font-bold text-white md:text-4xl">
              Premium onboarding with clear UK trainer standards
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-white/95 md:text-base">
              Designed for fast scanning: strong visuals, clear trust signals, and a direct route
              into the trainer application journey.
            </p>
            <div className={PAGE_LAYOUT.ctaRow}>
              <Button href="#trainer-application-wizard">Start trainer application</Button>
              <Button
                href="/contact"
                variant="secondary"
                className="border-white/60 bg-white/15 text-white hover:bg-white/25"
              >
                Speak to onboarding team
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="relative -mt-2 overflow-hidden rounded-2xl border border-cams-primary/15 bg-gradient-to-r from-cams-primary/[0.06] via-white to-cams-secondary/[0.06] p-5 shadow-[0_16px_36px_-28px_rgba(10,99,255,0.45)] md:p-6">
        <div className="pointer-events-none absolute -left-16 -top-14 h-36 w-36 rounded-full bg-cams-primary/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 right-0 h-44 w-44 rounded-full bg-cams-secondary/20 blur-3xl" />
        <div className={PAGE_LAYOUT.threeColGrid}>
          {QUALITY_SIGNAL_ITEMS.map((item) => (
            <article
              key={item.label}
              className="rounded-xl border border-white/70 bg-white/85 p-4 shadow-[0_10px_24px_-20px_rgba(2,12,27,0.35)] backdrop-blur-sm transition duration-300 hover:bg-white/95"
            >
              <div className="flex items-center gap-2">
                <CamsIcon name={item.icon} size={18} className="text-cams-primary" />
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-cams-slate">
                  {item.label}
                </p>
              </div>
              <p className="mt-2 text-xl font-bold text-cams-ink">{item.value}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={PAGE_LAYOUT.threeColGrid}>
        {FEATURE_POINTS.map((item) => (
          <article
            key={item.title}
            className={`group relative overflow-hidden ${PAGE_SURFACES.cardHoverLiftPrimary} p-6 shadow-[0_12px_26px_-20px_rgba(2,12,27,0.32)] duration-300 hover:border-cams-primary/35 hover:shadow-[0_20px_34px_-24px_rgba(10,99,255,0.4)]`}
          >
            <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-cams-primary/12 blur-2xl transition group-hover:bg-cams-secondary/20" />
            <div className="relative z-10">
              <div className="inline-flex rounded-lg border border-cams-primary/25 bg-cams-soft/85 p-2">
                <CamsIcon name={item.icon} size={20} className="text-cams-primary" />
              </div>
              <h2 className="mt-4 text-xl font-bold text-cams-ink">{item.title}</h2>
              <p className="mt-3 text-sm leading-7 text-cams-slate">{item.description}</p>
            </div>
          </article>
        ))}
      </section>

      <section
        id="trainer-application-wizard"
        className={`relative overflow-hidden ${PAGE_LAYOUT.panelCompact} p-7 shadow-[0_18px_40px_-28px_rgba(2,12,27,0.35)] md:p-8`}
      >
        <div className="pointer-events-none absolute -left-20 top-8 h-40 w-40 rounded-full bg-cams-primary/8 blur-3xl" />
        <h2 className="text-3xl font-bold text-cams-ink">How onboarding works</h2>
        <p className="mt-3 text-base text-cams-slate">
          Dedicated onboarding support is available throughout your application. Most profiles are
          approved within two business days when safeguarding documents are complete.
        </p>
        <ol className="mt-7 grid gap-4 md:grid-cols-3">
          {ONBOARDING_STEPS.map((step, index) => (
            <li
              key={step.title}
              className="group relative rounded-xl border border-slate-200 bg-gradient-to-br from-white via-cams-soft/35 to-white p-4 pl-5 transition duration-300 hover:border-cams-primary/30 hover:shadow-[0_16px_28px_-24px_rgba(10,99,255,0.35)]"
            >
              <div className="pointer-events-none absolute right-3 top-3 rounded-full border border-cams-primary/25 bg-white/80 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-cams-primary">
                Step {index + 1}
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cams-primary text-white shadow-sm ring-4 ring-cams-primary/15">
                  <CamsIcon name={step.icon} size={18} surface="inverse" className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-cams-ink">{step.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-cams-slate">{step.detail}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
        <div className={PAGE_LAYOUT.ctaRow}>
          <Button href="#trainer-application-wizard">
            Start trainer application
          </Button>
          <Button href="/contact" variant="secondary">
            Speak to onboarding team
          </Button>
          <Button href="/referral" variant="ghost">
            Need guidance first?
          </Button>
        </div>
      </section>

      <section className={`${PAGE_SURFACES.cardBase} p-7 shadow-sm md:p-8`}>
        <h2 className="text-3xl font-bold text-cams-ink">Trainer application wizard</h2>
        <p className="mt-3 text-base text-cams-slate">
          CAMS Collective is our vetted trainer network. Complete this wizard to submit the core
          information we need for matching, compliance, and onboarding.
        </p>
        <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="space-y-3">
            {FORM_STEPS.map((step) => {
              const isActive = step.id === currentWizardStep;
              const isComplete = step.id < currentWizardStep;
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setCurrentWizardStep(step.id)}
                  className={`w-full rounded-xl border p-4 text-left transition ${
                    isActive
                      ? "border-cams-primary bg-cams-soft shadow-sm"
                      : isComplete
                        ? "border-cams-primary/30 bg-white"
                        : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-cams-primary">
                      Step {step.id}
                    </p>
                    <CamsIcon name={isComplete ? "listChecks" : step.icon} size={16} className="text-cams-primary" />
                  </div>
                  <h3 className="mt-1 text-base font-bold text-cams-ink">{step.title}</h3>
                  <p className="mt-1 text-xs text-cams-slate">{step.description}</p>
                </button>
              );
            })}
          </aside>

          <div className={`${PAGE_SURFACES.cardMuted} p-5 md:p-6`}>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CamsIcon name={activeStepMeta.icon} size={18} className="text-cams-primary" />
                <p className="text-sm font-semibold text-cams-primary">
                  Step {activeStepMeta.id}: {activeStepMeta.title}
                </p>
              </div>
              <p className="text-xs text-cams-slate">{currentWizardStep}/4</p>
            </div>
            <div className="h-2 rounded-full bg-slate-200">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-cams-primary to-cams-secondary transition-all"
                style={{ width: `${(currentWizardStep / FORM_STEPS.length) * 100}%` }}
              />
            </div>

            {!wizardSubmitted ? (
              <div className="mt-5 space-y-4">
                {currentWizardStep === 1 ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-cams-primary">
                        Activity Coverage
                      </p>
                      <h4 className="mt-1 text-xl font-bold text-cams-ink">
                        Can You Facilitate ALL Types of Activities?
                      </h4>
                      <p className="mt-2 text-sm leading-6 text-cams-slate">
                        <strong>95% of our trainers can facilitate all activities</strong> in our
                        catalogue (48 total).
                      </p>
                      <p className="mt-1 text-sm leading-6 text-cams-slate">
                        Only select &quot;No&quot; if you have physical, mental, or medical
                        limitations that prevent you from performing certain activities.
                      </p>
                    </div>

                    <label className="block cursor-pointer rounded-xl border border-cams-primary/35 bg-cams-soft p-4 transition hover:border-cams-primary">
                      <input
                        type="radio"
                        name="activityCoverageChoice"
                        value="all"
                        checked={wizardValues.activityCoverageChoice === "all"}
                        onChange={() =>
                          setWizardValues((value) => ({
                            ...value,
                            activityCoverageChoice: "all",
                            limitedActivities: ""
                          }))
                        }
                        className="sr-only"
                      />
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold text-cams-ink">
                            Yes - I can facilitate ALL activities
                          </p>
                          <p className="mt-1 inline-flex rounded-md bg-cams-primary px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-white">
                            Recommended
                          </p>
                          <p className="mt-2 text-xs text-cams-slate">
                            Maximum booking opportunities - 95% of trainers choose this option.
                          </p>
                        </div>
                        {wizardValues.activityCoverageChoice === "all" ? (
                          <CamsIcon name="listChecks" size={18} className="text-cams-primary" />
                        ) : null}
                      </div>
                    </label>

                    <label className="block cursor-pointer rounded-xl border border-slate-300 bg-white p-4 transition hover:border-cams-primary/40">
                      <input
                        type="radio"
                        name="activityCoverageChoice"
                        value="limited"
                        checked={wizardValues.activityCoverageChoice === "limited"}
                        onChange={() =>
                          setWizardValues((value) => ({
                            ...value,
                            activityCoverageChoice: "limited"
                          }))
                        }
                        className="sr-only"
                      />
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-bold text-cams-ink">
                          No - I have specific limitations
                        </p>
                        {wizardValues.activityCoverageChoice === "limited" ? (
                          <CamsIcon name="circleHelp" size={18} className="text-cams-primary" />
                        ) : null}
                      </div>
                    </label>

                    {wizardValues.activityCoverageChoice === "limited" ? (
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-cams-ink">
                          Select specific activities you cannot facilitate *
                        </label>
                        <textarea
                          rows={4}
                          value={wizardValues.limitedActivities}
                          onChange={(event) =>
                            setWizardValues((value) => ({
                              ...value,
                              limitedActivities: event.target.value
                            }))
                          }
                          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm transition focus:border-cams-primary/60 focus:outline-none focus:ring-2 focus:ring-cams-primary/20"
                          placeholder="List the activities you cannot facilitate and a short reason if needed."
                        />
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {currentWizardStep === 2 ? (
                  <div className="space-y-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-cams-primary">
                      UK profile requirements
                    </p>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-cams-ink">Legal full name *</label>
                        <input
                          type="text"
                          value={wizardValues.legalName}
                          onChange={(event) =>
                            setWizardValues((value) => ({ ...value, legalName: event.target.value }))
                          }
                          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm transition focus:border-cams-primary/60 focus:outline-none focus:ring-2 focus:ring-cams-primary/20"
                          placeholder="As shown on ID"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-cams-ink">Date of birth *</label>
                        <input
                          type="date"
                          value={wizardValues.dateOfBirth}
                          onChange={(event) =>
                            setWizardValues((value) => ({ ...value, dateOfBirth: event.target.value }))
                          }
                          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm transition focus:border-cams-primary/60 focus:outline-none focus:ring-2 focus:ring-cams-primary/20"
                          max={new Date().toISOString().split("T")[0]}
                        />
                        {!hasValidDob && wizardValues.dateOfBirth ? (
                          <p className="mt-1 text-xs text-rose-600">Applicants must be at least 18 years old.</p>
                        ) : null}
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-cams-ink">Email address *</label>
                        <input
                          type="email"
                          value={wizardValues.email}
                          onChange={(event) =>
                            setWizardValues((value) => ({ ...value, email: event.target.value }))
                          }
                          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm transition focus:border-cams-primary/60 focus:outline-none focus:ring-2 focus:ring-cams-primary/20"
                          placeholder="name@example.com"
                        />
                        {!isValidEmail && wizardValues.email.trim().length > 0 ? (
                          <p className="mt-1 text-xs text-rose-600">Enter a valid email address.</p>
                        ) : null}
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-cams-ink">Mobile number *</label>
                        <input
                          type="tel"
                          value={wizardValues.phone}
                          onChange={(event) =>
                            setWizardValues((value) => ({ ...value, phone: event.target.value }))
                          }
                          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm transition focus:border-cams-primary/60 focus:outline-none focus:ring-2 focus:ring-cams-primary/20"
                          placeholder="e.g. 07911 123456 or +44 7911 123456"
                        />
                        {!isValidUkPhone && wizardValues.phone.trim().length > 0 ? (
                          <p className="mt-1 text-xs text-rose-600">Enter a valid UK mobile number.</p>
                        ) : null}
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-cams-ink">
                        Years of coaching / mentoring experience *
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={60}
                        value={wizardValues.experienceYears}
                        onChange={(event) =>
                          setWizardValues((value) => ({
                            ...value,
                            experienceYears: Math.max(0, Number(event.target.value))
                          }))
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm transition focus:border-cams-primary/60 focus:outline-none focus:ring-2 focus:ring-cams-primary/20"
                        placeholder="e.g. 4"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-cams-ink">
                        Right to work in the UK *
                      </label>
                      <select
                        value={wizardValues.rightToWorkUk}
                        onChange={(event) =>
                          setWizardValues((value) => ({
                            ...value,
                            rightToWorkUk: event.target.value as TrainerWizardValues["rightToWorkUk"]
                          }))
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm transition focus:border-cams-primary/60 focus:outline-none focus:ring-2 focus:ring-cams-primary/20"
                      >
                        <option value="">Select option</option>
                        <option value="yes">Yes - I have right to work in the UK</option>
                        <option value="no">No</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-cams-ink">
                        Relevant qualifications / certifications *
                      </label>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {QUALIFICATION_OPTIONS.map((option) => {
                          const isChecked = wizardValues.qualificationsSelected.includes(option);
                          return (
                            <label
                              key={option}
                              className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-cams-ink transition hover:border-cams-primary/40"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(event) =>
                                  setWizardValues((value) => ({
                                    ...value,
                                    qualificationsSelected: event.target.checked
                                      ? [...value.qualificationsSelected, option]
                                      : value.qualificationsSelected.filter((item) => item !== option)
                                  }))
                                }
                                className="h-4 w-4 rounded border-slate-300"
                              />
                              <span>{option}</span>
                            </label>
                          );
                        })}
                      </div>
                      <input
                        type="text"
                        value={wizardValues.qualificationsOther}
                        onChange={(event) =>
                          setWizardValues((value) => ({
                            ...value,
                            qualificationsOther: event.target.value
                          }))
                        }
                        className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm transition focus:border-cams-primary/60 focus:outline-none focus:ring-2 focus:ring-cams-primary/20"
                        placeholder="Other qualification (optional)"
                      />
                    </div>
                  </div>
                ) : null}

                {currentWizardStep === 3 ? (
                  <div className="space-y-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-cams-primary">
                      UK travel and availability
                    </p>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-cams-ink">
                          Main postcode / base area *
                        </label>
                        <input
                          type="text"
                          value={wizardValues.mainPostcode}
                          onChange={(event) =>
                            setWizardValues((value) => ({ ...value, mainPostcode: event.target.value }))
                          }
                          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm transition focus:border-cams-primary/60 focus:outline-none focus:ring-2 focus:ring-cams-primary/20"
                          placeholder="e.g. E1 6AN"
                        />
                        {!isValidUkPostcode && wizardValues.mainPostcode.trim().length > 0 ? (
                          <p className="mt-1 text-xs text-rose-600">Enter a valid UK postcode format.</p>
                        ) : null}
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-cams-ink">
                          Maximum travel radius *
                        </label>
                        <select
                          value={wizardValues.travelRadius}
                          onChange={(event) =>
                            setWizardValues((value) => ({ ...value, travelRadius: event.target.value }))
                          }
                          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm transition focus:border-cams-primary/60 focus:outline-none focus:ring-2 focus:ring-cams-primary/20"
                        >
                          <option value="">Select radius</option>
                          <option value="0-5">0-5 miles</option>
                          <option value="5-10">5-10 miles</option>
                          <option value="10-20">10-20 miles</option>
                          <option value="20+">20+ miles</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-cams-ink">Transport mode *</label>
                      <select
                        value={wizardValues.transportMode}
                        onChange={(event) =>
                          setWizardValues((value) => ({
                            ...value,
                            transportMode: event.target.value as TrainerWizardValues["transportMode"]
                          }))
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm transition focus:border-cams-primary/60 focus:outline-none focus:ring-2 focus:ring-cams-primary/20"
                      >
                        <option value="">Select transport mode</option>
                        <option value="public-transport">Public transport</option>
                        <option value="car">Car</option>
                        <option value="both">Both</option>
                      </select>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-cams-ink">
                          Weekday availability *
                        </label>
                        <input
                          type="text"
                          value={wizardValues.availabilityWeekdays}
                          onChange={(event) =>
                            setWizardValues((value) => ({
                              ...value,
                              availabilityWeekdays: event.target.value
                            }))
                          }
                          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm transition focus:border-cams-primary/60 focus:outline-none focus:ring-2 focus:ring-cams-primary/20"
                          placeholder="e.g. 15:00-20:00"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-cams-ink">
                          Evening availability *
                        </label>
                        <input
                          type="text"
                          value={wizardValues.availabilityEvenings}
                          onChange={(event) =>
                            setWizardValues((value) => ({
                              ...value,
                              availabilityEvenings: event.target.value
                            }))
                          }
                          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm transition focus:border-cams-primary/60 focus:outline-none focus:ring-2 focus:ring-cams-primary/20"
                          placeholder="e.g. Mon-Thu"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-cams-ink">
                          Weekend availability *
                        </label>
                        <input
                          type="text"
                          value={wizardValues.availabilityWeekends}
                          onChange={(event) =>
                            setWizardValues((value) => ({
                              ...value,
                              availabilityWeekends: event.target.value
                            }))
                          }
                          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm transition focus:border-cams-primary/60 focus:outline-none focus:ring-2 focus:ring-cams-primary/20"
                          placeholder="e.g. Sat mornings"
                        />
                      </div>
                    </div>
                  </div>
                ) : null}

                {currentWizardStep === 4 ? (
                  <div className="space-y-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-cams-primary">
                      UK safeguarding and compliance
                    </p>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-cams-ink">Enhanced DBS *</label>
                        <select
                          value={wizardValues.enhancedDbs}
                          onChange={(event) =>
                            setWizardValues((value) => ({
                              ...value,
                              enhancedDbs: event.target.value as TrainerWizardValues["enhancedDbs"]
                            }))
                          }
                          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm transition focus:border-cams-primary/60 focus:outline-none focus:ring-2 focus:ring-cams-primary/20"
                        >
                          <option value="">Select option</option>
                          <option value="yes">Yes - valid Enhanced DBS</option>
                          <option value="in-progress">In progress</option>
                          <option value="no">No</option>
                        </select>
                        {wizardValues.enhancedDbs === "no" ? (
                          <p className="mt-1 text-xs text-rose-600">
                            Enhanced DBS is mandatory before approval.
                          </p>
                        ) : null}
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-cams-ink">
                          DBS Update Service *
                        </label>
                        <select
                          value={wizardValues.dbsUpdateService}
                          onChange={(event) =>
                            setWizardValues((value) => ({
                              ...value,
                              dbsUpdateService: event.target.value as TrainerWizardValues["dbsUpdateService"]
                            }))
                          }
                          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm transition focus:border-cams-primary/60 focus:outline-none focus:ring-2 focus:ring-cams-primary/20"
                        >
                          <option value="">Select option</option>
                          <option value="yes">Yes</option>
                          <option value="no">No</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-cams-ink">
                          Safeguarding training level *
                        </label>
                        <select
                          value={wizardValues.safeguardingLevel}
                          onChange={(event) =>
                            setWizardValues((value) => ({
                              ...value,
                              safeguardingLevel:
                                event.target.value as TrainerWizardValues["safeguardingLevel"]
                            }))
                          }
                          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm transition focus:border-cams-primary/60 focus:outline-none focus:ring-2 focus:ring-cams-primary/20"
                        >
                          <option value="">Select level</option>
                          <option value="level-3">Level 3 (preferred)</option>
                          <option value="level-2">Level 2</option>
                          <option value="none">No current certification</option>
                        </select>
                        {wizardValues.safeguardingLevel === "none" ? (
                          <p className="mt-1 text-xs text-rose-600">
                            Safeguarding training is required (minimum Level 2).
                          </p>
                        ) : null}
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-cams-ink">
                          Public liability insurance *
                        </label>
                        <select
                          value={wizardValues.publicLiabilityInsurance}
                          onChange={(event) =>
                            setWizardValues((value) => ({
                              ...value,
                              publicLiabilityInsurance:
                                event.target.value as TrainerWizardValues["publicLiabilityInsurance"]
                            }))
                          }
                          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm transition focus:border-cams-primary/60 focus:outline-none focus:ring-2 focus:ring-cams-primary/20"
                        >
                          <option value="">Select option</option>
                          <option value="yes">In place</option>
                          <option value="in-progress">In progress</option>
                          <option value="no">Not yet</option>
                        </select>
                        {wizardValues.publicLiabilityInsurance === "no" ? (
                          <p className="mt-1 text-xs text-rose-600">
                            Public liability insurance is required before approval.
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-cams-ink">
                        Professional references available *
                      </label>
                      <select
                        value={wizardValues.referenceCount}
                        onChange={(event) =>
                          setWizardValues((value) => ({
                            ...value,
                            referenceCount: event.target.value as TrainerWizardValues["referenceCount"]
                          }))
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm transition focus:border-cams-primary/60 focus:outline-none focus:ring-2 focus:ring-cams-primary/20"
                      >
                        <option value="">Select option</option>
                        <option value="2plus">Two or more references</option>
                        <option value="1">One reference</option>
                        <option value="0">No references yet</option>
                      </select>
                      {wizardValues.referenceCount === "0" ? (
                        <p className="mt-1 text-xs text-rose-600">
                          At least one professional reference is required.
                        </p>
                      ) : null}
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-cams-ink">
                        Compliance notes {requiresCompliancePlan ? "*" : "(optional)"}
                      </label>
                      <textarea
                        rows={3}
                        value={wizardValues.complianceNotes}
                        onChange={(event) =>
                          setWizardValues((value) => ({ ...value, complianceNotes: event.target.value }))
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm transition focus:border-cams-primary/60 focus:outline-none focus:ring-2 focus:ring-cams-primary/20"
                        placeholder="Add remediation plan, expected completion dates, and document notes."
                      />
                      {requiresCompliancePlan && !hasCompliancePlan ? (
                        <p className="mt-1 text-xs text-amber-700">
                          Add a short compliance plan (minimum 20 characters) when items are in progress
                          or below preferred standards.
                        </p>
                      ) : null}
                    </div>
                  </div>
                ) : null}

                <div className="flex flex-wrap justify-between gap-3 pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setCurrentWizardStep((step) => Math.max(1, step - 1))}
                    className={currentWizardStep === 1 ? "pointer-events-none opacity-50" : ""}
                  >
                    Back
                  </Button>

                  {currentWizardStep < FORM_STEPS.length ? (
                    <Button
                      type="button"
                      onClick={() => setCurrentWizardStep((step) => Math.min(FORM_STEPS.length, step + 1))}
                      className={!canContinue ? "pointer-events-none opacity-50" : ""}
                    >
                      Next step
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => setWizardSubmitted(true)}
                      className={!canContinue ? "pointer-events-none opacity-50" : ""}
                    >
                      Complete wizard
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                <div className="rounded-xl border border-cams-primary/30 bg-cams-primary/5 p-4">
                  <p className="text-sm font-semibold text-cams-primary">
                    Wizard complete. Your trainer application details are ready for review.
                  </p>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <article className="rounded-lg border border-slate-200 bg-white p-3">
                    <h4 className="text-sm font-semibold text-cams-ink">Activities</h4>
                    <p className="mt-1 text-xs text-cams-slate">
                      {wizardValues.activityCoverageChoice === "all"
                        ? "Can facilitate all activities."
                        : `Limited activities: ${wizardValues.limitedActivities}`}
                    </p>
                  </article>
                  <article className="rounded-lg border border-slate-200 bg-white p-3">
                    <h4 className="text-sm font-semibold text-cams-ink">Profile</h4>
                    <p className="mt-1 text-xs text-cams-slate">
                      {wizardValues.legalName}, {wizardValues.email}, right-to-work:{" "}
                      {wizardValues.rightToWorkUk === "yes" ? "Yes" : "No"}
                    </p>
                    <p className="mt-1 text-xs text-cams-slate">
                      Experience: {wizardValues.experienceYears} year
                      {wizardValues.experienceYears === 1 ? "" : "s"}
                    </p>
                    <p className="mt-1 text-xs text-cams-slate">
                      Qualifications:{" "}
                      {[...wizardValues.qualificationsSelected, wizardValues.qualificationsOther]
                        .filter((item) => item.trim().length > 0)
                        .join(", ")}
                    </p>
                  </article>
                  <article className="rounded-lg border border-slate-200 bg-white p-3">
                    <h4 className="text-sm font-semibold text-cams-ink">Coverage</h4>
                    <p className="mt-1 text-xs text-cams-slate">
                      {wizardValues.mainPostcode}, {wizardValues.travelRadius} miles,{" "}
                      {wizardValues.transportMode}
                    </p>
                  </article>
                  <article className="rounded-lg border border-slate-200 bg-white p-3">
                    <h4 className="text-sm font-semibold text-cams-ink">Safeguarding</h4>
                    <p className="mt-1 text-xs text-cams-slate">
                      DBS: {wizardValues.enhancedDbs}, update service: {wizardValues.dbsUpdateService},
                      safeguarding: {wizardValues.safeguardingLevel}
                    </p>
                  </article>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setWizardSubmitted(false);
                      setApplicationSubmitted(false);
                    }}
                  >
                    Edit wizard answers
                  </Button>
                  <Button type="button" onClick={handleTrainerApplicationSubmit}>
                    {loading ? "Submitting application..." : "Submit trainer application"}
                  </Button>
                </div>
                {error ? (
                  <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {error.message}
                  </p>
                ) : null}
                {applicationSubmitted && result ? (
                  <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    Application submitted successfully. Reference: {result.id}
                  </p>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="relative mb-10 overflow-hidden rounded-2xl border border-cams-primary/25 bg-gradient-to-br from-cams-soft via-white to-cams-soft p-7 text-center shadow-[0_20px_45px_-30px_rgba(10,99,255,0.6)] md:mb-14 md:p-10">
        <div className="pointer-events-none absolute inset-y-0 right-0 w-[52%] overflow-hidden" aria-hidden>
          <Image
            src={TRAINER_PROMO_IMAGE}
            alt=""
            className="h-full w-full object-cover opacity-20"
            width={1400}
            height={900}
          />
          <div className="absolute inset-0 bg-gradient-to-l from-cams-soft/30 via-white/88 to-transparent" />
        </div>
        <div className="absolute -left-16 bottom-0 h-44 w-44 rounded-full bg-cams-primary/15 blur-3xl" />
        <div className="absolute -right-16 top-0 h-44 w-44 rounded-full bg-cams-secondary/15 blur-3xl" />
        <h2 className="relative z-10 text-3xl font-bold text-cams-ink">Ready to Join Our Team?</h2>
        <p className="relative z-10 mx-auto mt-3 max-w-2xl text-base text-cams-slate">
          Start your journey as a CAMS trainer and make a lasting impact on children&apos;s lives.
        </p>
        <div className="relative z-10 mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button href="#trainer-application-wizard">Start trainer application</Button>
          <Button href="/careers" variant="secondary">
            View current trainers
          </Button>
        </div>
      </section>
    </PageShell>
  );
}
