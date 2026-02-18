import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 text-center">
      <div className="mx-auto max-w-xl space-y-4">
        <p className="text-micro font-semibold uppercase tracking-[0.2em] text-slate-500">
          CAMS Services
        </p>
        <h1 className="text-display font-semibold tracking-tight text-slate-900">
          Universal Dashboard Scaffold
        </h1>
        <p className="text-body text-slate-600">
          This standalone Next.js app is a clean playground for the
          parent/trainer/admin dashboard you described. It is safe to iterate
          here and later plug it into the main platform.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-body">
          <Link
            href="/dashboard"
            className="rounded-full bg-slate-900 px-4 py-1.5 font-medium text-white shadow-sm hover:bg-slate-800"
          >
            Open dashboard
          </Link>
          <Link
            href="/about"
            className="rounded-full border border-slate-300 px-4 py-1.5 text-slate-700 hover:bg-white"
          >
            About this scaffold
          </Link>
        </div>
      </div>
    </main>
  );
}

