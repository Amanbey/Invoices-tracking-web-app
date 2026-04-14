"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCurrentUser, getInvoices } from "../../lib/api";

export default function DashboardPage() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [userName, setUserName] = useState("");
  const [currencyCode, setCurrencyCode] = useState("ETB");
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currencyCode,
        maximumFractionDigits: 0,
      }),
    [currencyCode]
  );

  useEffect(() => {
    const ensureSession = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.replace("/register");
        return;
      }

      try {
        const profile = await getCurrentUser(token);
        if (profile?.user) {
          localStorage.setItem("user", JSON.stringify(profile.user));
          setUserName(profile.user?.name || "");
          const data = await getInvoices(token);
          setInvoices(data?.invoices || []);
          setErrorMessage("");
          setIsReady(true);
          setIsLoading(false);
          return;
        }
        throw new Error("Invalid session");
      } catch (error) {
        setErrorMessage("Unable to load dashboard data.");
        setIsLoading(false);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.replace("/register");
      }
    };

    ensureSession();
  }, [router]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const loadCurrency = () => {
      const storedCurrency = localStorage.getItem("currencyCode");
      setCurrencyCode(storedCurrency === "USD" ? "USD" : "ETB");
    };

    loadCurrency();
    window.addEventListener("currency-changed", loadCurrency);

    return () => {
      window.removeEventListener("currency-changed", loadCurrency);
    };
  }, []);

  const stats = useMemo(() => {
    const totalInvoices = invoices.length;
    const draftCount = invoices.filter((invoice) => invoice.status === "draft")
      .length;
    const overdueCount = invoices.filter(
      (invoice) => invoice.status === "overdue"
    ).length;
    const paidTotal = invoices
      .filter((invoice) => invoice.status === "paid")
      .reduce((sum, invoice) => sum + (Number(invoice.amount) || 0), 0);
    const outstandingTotal = invoices
      .filter((invoice) => invoice.status !== "paid")
      .reduce((sum, invoice) => sum + (Number(invoice.amount) || 0), 0);

    return {
      totalInvoices,
      draftCount,
      overdueCount,
      paidTotal,
      outstandingTotal,
    };
  }, [invoices]);

  const recentInvoices = useMemo(() => invoices.slice(0, 4), [invoices]);
  const overdueInvoices = useMemo(
    () => invoices.filter((invoice) => invoice.status === "overdue"),
    [invoices]
  );

  const statusTone = (status) => {
    switch (status) {
      case "paid":
        return "bg-emerald-100 text-emerald-700";
      case "overdue":
        return "bg-rose-100 text-rose-700";
      case "in_review":
        return "bg-amber-100 text-amber-700";
      case "sent":
        return "bg-sky-100 text-sky-700";
      case "draft":
      default:
        return "bg-slate-200 text-slate-700";
    }
  };

  const formatStatus = (status = "draft") =>
    status.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

  if (!isReady) {
    return null;
  }

  return (
    <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-6 md:gap-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 right-4 h-56 w-56 rounded-full bg-amber-200/60 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-6 top-32 h-72 w-72 rounded-full bg-sky-200/50 blur-3xl"
      />

      <header className="ui-card relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-white to-slate-50 p-6 shadow-[0_30px_70px_-55px_rgba(15,23,42,0.8)] backdrop-blur sm:p-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              Dashboard
            </p>
            {userName && (
              <p className="mt-3 text-sm font-semibold text-slate-500">
                Welcome back, {userName}.
              </p>
            )}
            <h1 className="mt-3 text-2xl font-semibold text-slate-900 sm:text-3xl lg:text-4xl">
              <span className="font-display">Invoice clarity, every day.</span>
            </h1>
            <p className="mt-4 max-w-xl text-base text-slate-600">
              Keep billing momentum visible at a glance. Track overdue balances,
              automate follow-ups, and spot cash flow trends before the week ends.
            </p>
          </div>

          <div className="ui-card grid w-full max-w-sm grid-cols-1 gap-3 rounded-2xl bg-slate-900/95 p-4 text-white shadow-[0_18px_50px_-30px_rgba(15,23,42,0.9)] sm:grid-cols-2">
            <div className="min-w-0 rounded-2xl bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-white/70">
                Paid total
              </p>
              <p className="mt-2 break-words text-xl font-semibold leading-tight sm:text-2xl">
                {currencyFormatter.format(stats.paidTotal || 0)}
              </p>
              <p className="mt-2 text-xs text-white/70">
                {stats.totalInvoices} invoices tracked
              </p>
            </div>
            <div className="min-w-0 rounded-2xl bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-white/70">
                Outstanding
              </p>
              <p className="mt-2 break-words text-xl font-semibold leading-tight sm:text-2xl">
                {currencyFormatter.format(stats.outstandingTotal || 0)}
              </p>
              <p className="mt-2 text-xs text-white/70">
                {stats.overdueCount} overdue
              </p>
            </div>
            <div className="col-span-1 rounded-2xl bg-gradient-to-r from-amber-300/20 via-white/5 to-sky-300/20 p-4 sm:col-span-2">
              <p className="text-xs uppercase tracking-[0.2em] text-white/70">
                Draft invoices
              </p>
              <div className="mt-2 flex items-center justify-between gap-3">
                <p className="text-xl font-semibold leading-tight sm:text-2xl">
                  {stats.draftCount}
                </p>
                <p className="text-right text-xs text-white/70">waiting to send</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
        <div className="ui-card rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_18px_45px_-35px_rgba(15,23,42,0.65)]">
          <p className="text-sm font-semibold text-slate-600">Total invoices</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">
            {stats.totalInvoices}
          </p>
          <p className="mt-2 text-xs text-slate-500">All statuses included</p>
        </div>
        <div className="ui-card rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_18px_45px_-35px_rgba(15,23,42,0.65)]">
          <p className="text-sm font-semibold text-slate-600">Draft invoices</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">
            {stats.draftCount}
          </p>
          <p className="mt-2 text-xs text-slate-500">Ready to send</p>
        </div>
        <div className="ui-card rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_18px_45px_-35px_rgba(15,23,42,0.65)]">
          <p className="text-sm font-semibold text-slate-600">Overdue invoices</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">
            {stats.overdueCount}
          </p>
          <p className="mt-2 text-xs text-slate-500">Need follow-up</p>
        </div>
      </section>

      <section className="grid gap-4 md:gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="ui-card rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_22px_55px_-45px_rgba(15,23,42,0.75)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                <span className="font-display">Recent invoices</span>
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Latest activity across client billing.
              </p>
            </div>
            <Link
              className="inline-flex h-10 items-center justify-center self-start rounded-full border border-slate-300 px-4 text-xs font-semibold text-slate-700 transition hover:border-slate-400"
              href="/invoices"
            >
              View all
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            {isLoading && (
              <p className="text-sm text-slate-500">Loading invoices...</p>
            )}
            {errorMessage && (
              <p className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {errorMessage}
              </p>
            )}
            {!isLoading && !errorMessage && recentInvoices.length === 0 && (
              <p className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                No invoices yet. Create one to get started.
              </p>
            )}
            {recentInvoices.map((invoice) => (
              <div
                key={invoice._id}
                className="ui-card flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50/40 px-4 py-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {invoice.client?.name || invoice.clientName}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {invoice.invoiceNumber} • Due{" "}
                    {new Date(invoice.dueAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-sm font-semibold text-slate-900">
                    {currencyFormatter.format(invoice.amount)}
                  </p>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone(
                      invoice.status
                    )}`}
                  >
                    {formatStatus(invoice.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="ui-card rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_22px_55px_-45px_rgba(15,23,42,0.75)]">
            <h3 className="text-lg font-semibold text-slate-900">
              <span className="font-display">Overdue invoices</span>
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Items that need follow-up attention.
            </p>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              {overdueInvoices.slice(0, 4)
                .map((invoice) => (
                  <li
                    key={invoice._id}
                    className="ui-card rounded-2xl border border-slate-100 bg-slate-50/60 px-4 py-3"
                  >
                    {invoice.client?.name || invoice.clientName} • {currencyFormatter.format(invoice.amount)}
                  </li>
                ))}
              {!isLoading && overdueInvoices.length === 0 && (
                <li className="ui-card rounded-2xl border border-slate-100 bg-slate-50/60 px-4 py-3">
                  No overdue invoices right now.
                </li>
              )}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
