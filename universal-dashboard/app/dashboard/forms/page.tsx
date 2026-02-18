"use client";

import React from "react";
import { z } from "zod";
import { Input } from "@/components/common/input";
import { Select } from "@/components/common/select";
import { Button } from "@/components/common/button";
import { FormWrapper } from "@/components/forms/form-wrapper";
import { FormField } from "@/components/forms/form-field";
import { useToast } from "@/components/common/toast";

const DemoFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  role: z.enum(["viewer", "editor", "admin"]),
});

type DemoForm = z.infer<typeof DemoFormSchema>;

export default function FormsShowcasePage() {
  const { show } = useToast();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState<DemoForm["role"]>("viewer");
  const [errors, setErrors] = React.useState<Partial<Record<keyof DemoForm, string>>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = DemoFormSchema.safeParse({ name, email, role });
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof DemoForm, string>> = {};
      result.error.issues.forEach((i) => {
        const k = i.path[0];
        if (typeof k === "string") fieldErrors[k as keyof DemoForm] = i.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    show({ title: "Form submitted", description: `Hello ${name}`, variant: "success" });
  };

  return (
    <section className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-display font-semibold tracking-tight text-slate-900 dark:text-slate-50">Forms</h1>
        <p className="text-body text-slate-600 dark:text-slate-400">
          Form wrapper, fields, validation (Zod), and toast on submit. All mock.
        </p>
      </header>

      <FormWrapper title="Demo form" description="Required name and email; role select." onSubmit={handleSubmit}>
        <FormField label="Name" htmlFor="name" required error={errors.name}>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="h-9" />
        </FormField>
        <FormField label="Email" htmlFor="email" required error={errors.email}>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-9" />
        </FormField>
        <FormField label="Role" htmlFor="role" error={errors.role}>
          <Select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value as DemoForm["role"])}
            className="h-9"
          >
            <option value="viewer">Viewer</option>
            <option value="editor">Editor</option>
            <option value="admin">Admin</option>
          </Select>
        </FormField>
        <div className="flex gap-2 pt-2">
          <Button type="submit" variant="primary" size="sm">Submit</Button>
          <Button type="button" variant="secondary" size="sm" onClick={() => { setName(""); setEmail(""); setRole("viewer"); setErrors({}); }}>Reset</Button>
        </div>
      </FormWrapper>
    </section>
  );
}
