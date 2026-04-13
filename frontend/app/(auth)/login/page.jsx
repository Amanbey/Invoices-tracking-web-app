import Link from "next/link";
import AuthForm from "../../../components/auth/AuthForm";

export default function LoginPage() {
  return (
    <section className="mx-auto max-w-lg rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold">Welcome back</h1>
      <p className="mt-2 text-slate-600">
        Sign in to manage invoices and payments.
      </p>
      <div className="mt-6 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600">
        Great to see you again. Let's keep your cash flow moving.
      </div>
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
