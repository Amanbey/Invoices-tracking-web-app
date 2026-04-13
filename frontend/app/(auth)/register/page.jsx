import Link from "next/link";
import AuthForm from "../../../components/auth/AuthForm";

export default function RegisterPage() {
  return (
    <section className="mx-auto max-w-lg rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold">Create your account</h1>
      <p className="mt-2 text-slate-600">
        Track your clients, invoices, and payments in one place.
      </p>
      <div className="mt-6 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600">
        Welcome to your new billing command center. Start with your details.
      </div>
      <AuthForm mode="register" />
      <p className="mt-6 text-sm text-slate-600">
        Already have an account?{" "}
        <Link
          className="font-medium text-slate-900 transition hover:text-slate-700"
          href="/login"
        >
          Sign in
        </Link>
      </p>
    </section>
  );
}
