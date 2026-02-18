import React from "react";
import { Input } from "@/components/common/input";
import { Button } from "@/components/common/button";

export default function LoginPage() {
  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-title font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          Sign in
        </h1>
        <p className="text-body text-slate-600 dark:text-slate-400">
          Use your email and password. Role detection will be based on your
          account when wired to the backend.
        </p>
      </header>
      <form className="space-y-3">
        <div className="space-y-1 text-body">
          <label htmlFor="email" className="font-medium text-slate-800 dark:text-slate-200">
            Email
          </label>
          <Input id="email" type="email" autoComplete="email" required />
        </div>
        <div className="space-y-1 text-body">
          <label htmlFor="password" className="font-medium text-slate-800 dark:text-slate-200">
            Password
          </label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>
        <div className="flex items-center justify-between text-caption">
          <label className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
            <input type="checkbox" className="h-3.5 w-3.5 rounded border" />
            Remember me
          </label>
          <a
            href="/(auth)/forgot-password"
            className="font-medium text-slate-900 hover:underline dark:text-slate-100"
          >
            Forgot password?
          </a>
        </div>
        <Button type="submit" className="w-full">
          Continue
        </Button>
      </form>
    </section>
  );
}

