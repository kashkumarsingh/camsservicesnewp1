import React from "react";
import { Input } from "@/components/common/input";
import { Button } from "@/components/common/button";

export default function RegisterPage() {
  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-title font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          Create an account
        </h1>
        <p className="text-body text-slate-600 dark:text-slate-400">
          Basic registration form. When wired to the backend we can auto-detect
          role based on email domain and approvals.
        </p>
      </header>
      <form className="space-y-3">
        <div className="space-y-1 text-body">
          <label htmlFor="name" className="font-medium text-slate-800 dark:text-slate-200">
            Full name
          </label>
          <Input id="name" type="text" autoComplete="name" required />
        </div>
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
            autoComplete="new-password"
            required
          />
        </div>
        <Button type="submit" className="w-full">
          Sign up
        </Button>
      </form>
    </section>
  );
}

