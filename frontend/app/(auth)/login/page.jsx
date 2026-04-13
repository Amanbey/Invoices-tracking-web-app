import Link from "next/link";
import AuthForm from "../../../components/auth/AuthForm";

export default function LoginPage() {
  return (
    <section className="mx-auto max-w-lg rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold">Welcome back</h1>
      <p className="mt-2 text-slate-600">
        Sign in to manage invoices and payments.
      </p>
      <AuthForm mode="login" />
      <p className="mt-6 text-sm text-slate-600">
        New here?{" "}
        <Link
          className="font-medium text-slate-900 transition hover:text-slate-700"
          href="/register"
        >
          Create an account
        </Link>
      </p>
    </section>
  );
}
