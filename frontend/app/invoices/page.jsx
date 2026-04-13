"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getInvoices } from "../../lib/api";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default function InvoicesPage() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [invoices, setInvoices] = useState([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/register");
      return;
    }

    const loadInvoices = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");
        const data = await getInvoices(token);
        setInvoices(data?.invoices || []);
      } catch (error) {
        setErrorMessage(error.message || "Unable to load invoices.");
      } finally {
        setIsLoading(false);
        setIsReady(true);
      }
    };

    loadInvoices();
  }, [router]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const client = invoice.client?.name || invoice.clientName || "";
      const invoiceNumber = invoice.invoiceNumber || "";
      const matchesQuery =
        client.toLowerCase().includes(query.toLowerCase()) ||
        invoiceNumber.toLowerCase().includes(query.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || invoice.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [invoices, query, statusFilter]);

  const formatStatus = (status) =>
    status
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());

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

  if (!isReady) {
    return null;
  }

  return (
    <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 left-10 h-64 w-64 rounded-full bg-amber-200/50 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-6 top-24 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl"
      />

      <header className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              Invoices
            </p>
            <h1 className="mt-3 text-4xl font-semibold text-slate-900 md:text-5xl">
              <span className="font-display">Invoice control center.</span>
            </h1>
            <p className="mt-4 max-w-xl text-base text-slate-600">
              Track every invoice from draft to paid. Filter by status, follow
              up on overdue items, and keep cash flow predictable.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              href="/dashboard"
            >
              Back to dashboard
            </Link>
            <Link
              className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
              href="/invoices/new"
            >
              New invoice
            </Link>
          </div>
        </div>
      </header>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-semibold text-slate-900">
              <span className="font-display">All invoices</span>
            </h2>
            <p className="text-sm text-slate-500">
              {filteredInvoices.length} invoices in view
            </p>
          </div>
          <div className="flex flex-1 flex-col gap-3 md:max-w-md md:flex-row md:items-center md:justify-end">
            <input
              className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-slate-400"
              placeholder="Search client or invoice ID"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <select
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-slate-400"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">All status</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="in_review">In review</option>
              <option value="overdue">Overdue</option>
              <option value="paid">Paid</option>
            </select>
          </div>
        </div>

        {isLoading && (
          <p className="mt-6 text-sm text-slate-500">Loading invoices...</p>
        )}
        {errorMessage && (
          <p className="mt-6 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {errorMessage}
          </p>
        )}
        {!isLoading && !errorMessage && filteredInvoices.length === 0 && (
          <p className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-500">
            No invoices yet. Create your first invoice to get started.
          </p>
        )}

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-100">
          <div className="grid grid-cols-1 gap-0 border-b border-slate-100 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 md:grid-cols-[1.2fr_0.9fr_0.9fr_0.8fr_0.7fr]">
            <span>Client</span>
            <span>Invoice</span>
            <span>Issued</span>
            <span>Amount</span>
            <span>Status</span>
          </div>
          <div className="divide-y divide-slate-100">
            {filteredInvoices.map((invoice) => (
              <div
                key={invoice._id}
                className="grid grid-cols-1 gap-3 px-4 py-4 text-sm text-slate-700 md:grid-cols-[1.2fr_0.9fr_0.9fr_0.8fr_0.7fr]"
              >
                <div>
                  <p className="font-semibold text-slate-900">
                    {invoice.client?.name || invoice.clientName}
                  </p>
                  <p className="text-xs text-slate-500">
                    Due {new Date(invoice.dueAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="font-semibold text-slate-700">
                  {invoice.invoiceNumber}
                </div>
                <div className="text-slate-500">
                  {new Date(invoice.issuedAt).toLocaleDateString()}
                </div>
                <div className="font-semibold text-slate-900">
                  {currency.format(invoice.amount)}
                </div>
                <div>
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusTone(
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
      </section>
    </div>
  );
}
