import Link from "next/link";
import AuthForm from "../../../components/auth/AuthForm";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <section className="ui-card w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_30px_70px_-55px_rgba(15,23,42,0.8)]">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">
          Welcome
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">Sign Up</h1>
        <p className="mt-2 text-sm text-slate-500">Hi, welcome to your workspace.</p>
        <AuthForm mode="register" />
        <p className="mt-6 text-sm text-slate-600">
          Already have an account?{" "}
          <Link
            className="font-semibold text-slate-700 transition hover:text-slate-900 hover:underline"
            href="/login"
          >
            Login
          </Link>
        </p>
      </section>
    </main>
  );
}
