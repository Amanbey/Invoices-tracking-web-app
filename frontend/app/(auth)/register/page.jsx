import Link from "next/link";
import AuthForm from "../../../components/auth/AuthForm";

export default function RegisterPage() {
  return (
    <main className="relative flex min-h-[calc(100vh-140px)] items-center justify-center overflow-hidden px-4 py-6 md:px-6 md:py-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-12 top-10 h-56 w-56 rounded-full bg-lime-200/60 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-8 bottom-6 h-64 w-64 rounded-full bg-sky-200/60 blur-3xl"
      />

      <section className="mx-auto w-full max-w-md overflow-hidden rounded-3xl border border-white/60 bg-white/95 p-6 shadow-[0_28px_70px_-45px_rgba(15,23,42,0.6)] backdrop-blur sm:p-8">
        <p className="inline-flex rounded-full bg-lime-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-lime-700">
          Start Fresh
        </p>
        <h1 className="mt-4 text-2xl font-semibold leading-tight text-slate-900 md:text-3xl">Sign Up</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">Create your account and track invoices with clarity.</p>

        <AuthForm mode="register" />

        <p className="mt-7 border-t border-slate-100 pt-5 text-sm text-slate-600">
          Already have an account?{" "}
          <Link
            className="font-semibold text-lime-700 transition hover:text-lime-800 hover:underline"
            href="/login"
          >
            Login
          </Link>
        </p>
      </section>
    </main>
  );
}
