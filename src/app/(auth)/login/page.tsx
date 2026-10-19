import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

export default function LoginPage() {
  return (
    <>
      <div className="rounded-[var(--radius-lg)] bg-paper p-6 shadow-[var(--shadow-floating)] sm:p-8">
        <h1 className="text-2xl font-bold tracking-[-0.02em]">Sign in</h1>
        <p className="mt-1 text-[0.9375rem] text-muted">Staff accounts. Staff must also enter a code from their authenticator app.</p>
        <div className="mt-6">
          <LoginForm />
        </div>
      </div>
      <div className="mt-6 rounded-[var(--radius-md)] border border-line bg-paper p-4 text-[0.9375rem]">
        <p className="font-display font-semibold text-navy-900">Students</p>
        <p className="mt-1 text-muted">
          Student accounts open when online applications launch. Until then, <Link href="/contact" className="text-navy-700 underline underline-offset-2">contact the academy office</Link> about
          your course.
        </p>
      </div>
    </>
  );
}
