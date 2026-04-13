"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createInvoice } from "../../../lib/api";

export default function NewInvoicePage() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/register");
      return;
    }

    setIsReady(true);
  }, [router]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/register");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const clientName = (formData.get("clientName") || "").toString().trim();
    const invoiceNumber = (formData.get("invoiceNumber") || "")
      .toString()
      .trim();
    const amountValue = Number(formData.get("amount"));
    const issuedAt = (formData.get("issuedAt") || "").toString();
    const dueAt = (formData.get("dueAt") || "").toString();
    const status = (formData.get("status") || "draft").toString();
    const notes = (formData.get("notes") || "").toString().trim();

    if (!clientName) {
      setErrorMessage("Client name is required.");
      return;
    }

    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      setErrorMessage("Amount must be a positive number.");
      return;
    }

    if (!issuedAt) {
      setErrorMessage("Issued date is required.");
      return;
    }

    if (!dueAt) {
      setErrorMessage("Due date is required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        clientName,
        invoiceNumber: invoiceNumber || undefined,
        amount: amountValue,
        issuedAt,
        dueAt,
        status,
        notes: notes || undefined,
      };

      await createInvoice(token, payload);
      router.push("/invoices");
    } catch (error) {
      setErrorMessage(error.message || "Unable to create invoice.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isReady) {
    return null;
  }

  return (
    <div className="relative mx-auto flex w-full max-w-4xl flex-col gap-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 right-10 h-64 w-64 rounded-full bg-amber-200/40 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-6 top-32 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl"
      />

      <header className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              New invoice
            </p>
            <h1 className="mt-3 text-4xl font-semibold text-slate-900 md:text-5xl">
              <span className="font-display">Create a fresh invoice.</span>
            </h1>
            <p className="mt-4 text-base text-slate-600">
              Capture client details, amount, and dates. We will handle numbering
              if you leave it blank.
            </p>
          </div>
          <Link
            className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
            href="/invoices"
          >
            Back to invoices
          </Link>
        </div>
      </header>

      <form
        className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
        onSubmit={handleSubmit}
      >
        <div className="grid gap-6 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-semibold text-slate-700">Client name</span>
            <input
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-base outline-none transition focus:border-slate-400"
              name="clientName"
              placeholder="Client or company"
              required
            />
          </label>

          <label className="flex flex-col gap-2 text-sm">
            <span className="font-semibold text-slate-700">Invoice number</span>
            <input
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-base outline-none transition focus:border-slate-400"
              name="invoiceNumber"
              placeholder="Optional"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm">
            <span className="font-semibold text-slate-700">Amount</span>
            <input
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-base outline-none transition focus:border-slate-400"
              name="amount"
              type="number"
              min="0"
              step="1"
              placeholder="0"
              required
            />
          </label>

          <label className="flex flex-col gap-2 text-sm">
            <span className="font-semibold text-slate-700">Status</span>
            <select
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-base outline-none transition focus:border-slate-400"
              name="status"
              defaultValue="draft"
            >
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="in_review">In review</option>
              <option value="overdue">Overdue</option>
              <option value="paid">Paid</option>
            </select>
          </label>

          <label className="flex flex-col gap-2 text-sm">
            <span className="font-semibold text-slate-700">Issued date</span>
            <input
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-base outline-none transition focus:border-slate-400"
              name="issuedAt"
              type="date"
              required
            />
          </label>

          <label className="flex flex-col gap-2 text-sm">
            <span className="font-semibold text-slate-700">Due date</span>
            <input
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-base outline-none transition focus:border-slate-400"
              name="dueAt"
              type="date"
              required
            />
          </label>
        </div>

        <label className="mt-6 flex flex-col gap-2 text-sm">
          <span className="font-semibold text-slate-700">Notes</span>
          <textarea
            className="min-h-[120px] rounded-xl border border-slate-200 px-4 py-3 text-base outline-none transition focus:border-slate-400"
            name="notes"
            placeholder="Optional notes for the client"
          />
        </label>

        {errorMessage && (
          <p className="mt-6 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {errorMessage}
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            className="rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Create invoice"}
          </button>
          <Link
            className="rounded-full border border-slate-300 px-6 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
            href="/invoices"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
