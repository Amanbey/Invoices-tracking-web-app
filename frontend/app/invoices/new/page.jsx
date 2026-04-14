"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createInvoice, getClients } from "../../../lib/api";

export default function NewInvoicePage() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [clients, setClients] = useState([]);
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/register");
      return;
    }

    setIsReady(true);

    const loadClients = async () => {
      setIsLoadingClients(true);
      try {
        const data = await getClients(token);
        setClients(data?.clients || []);
      } catch (error) {
        setErrorMessage(error.message || "Unable to load clients.");
      } finally {
        setIsLoadingClients(false);
      }
    };

    loadClients();
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
    const productType = (formData.get("productType") || "").toString().trim();
    const invoiceNumber = (formData.get("invoiceNumber") || "")
      .toString()
      .trim();
    const amountValue = Number(formData.get("amount"));
    const issuedAt = (formData.get("issuedAt") || "").toString();
    const dueAt = (formData.get("dueAt") || "").toString();
    const status = (formData.get("status") || "draft").toString();
    const notes = (formData.get("notes") || "").toString().trim();

    if (!selectedClientId) {
      setErrorMessage("Select a client to continue.");
      return;
    }

    if (!productType) {
      setErrorMessage("Product type is required.");
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
        clientId: selectedClientId,
        productType,
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
    <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-6 md:gap-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 right-10 h-64 w-64 rounded-full bg-amber-200/40 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-6 top-32 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl"
      />

      <header className="ui-card relative overflow-hidden rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur sm:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              New invoice
            </p>
            <h1 className="mt-3 text-2xl font-semibold text-slate-900 sm:text-3xl lg:text-4xl">
              <span className="font-display">Create a fresh invoice.</span>
            </h1>
            <p className="mt-4 text-base text-slate-600">
              Capture client details, amount, and dates. We will handle numbering
              if you leave it blank.
            </p>
          </div>
          <Link
            className="inline-flex h-10 items-center justify-center self-start rounded-full border border-slate-300 px-5 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
            href="/invoices"
          >
            Back to invoices
          </Link>
        </div>
      </header>

      <form
        className="ui-card rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.8)] sm:p-8"
        onSubmit={handleSubmit}
      >
        <div className="grid gap-6 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm" htmlFor="clientId">
            <span className="font-semibold text-slate-700">Select client</span>
            <select
              id="clientId"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-base text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              value={selectedClientId}
              onChange={(event) => setSelectedClientId(event.target.value)}
              required
            >
              <option value="">Choose from saved clients</option>
              {clients.map((client) => (
                <option key={client._id} value={client._id}>
                  {client.name}
                </option>
              ))}
            </select>
            {isLoadingClients && (
              <span className="text-xs text-slate-500">Loading clients...</span>
            )}
          </label>

          <label className="flex flex-col gap-2 text-sm" htmlFor="productType">
            <span className="font-semibold text-slate-700">Product type</span>
            <input
              id="productType"
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-base text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              name="productType"
              placeholder="Website build, consulting, design"
              required
            />
          </label>

          <label className="flex flex-col gap-2 text-sm" htmlFor="invoiceNumber">
            <span className="font-semibold text-slate-700">Invoice number</span>
            <input
              id="invoiceNumber"
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-base text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              name="invoiceNumber"
              placeholder="Optional"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm" htmlFor="amount">
            <span className="font-semibold text-slate-700">Amount</span>
            <input
              id="amount"
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-base text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              name="amount"
              type="number"
              min="0"
              step="1"
              placeholder="0"
              required
            />
          </label>

          <label className="flex flex-col gap-2 text-sm" htmlFor="status">
            <span className="font-semibold text-slate-700">Status</span>
            <select
              id="status"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-base text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
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

          <label className="flex flex-col gap-2 text-sm" htmlFor="issuedAt">
            <span className="font-semibold text-slate-700">Issued date</span>
            <input
              id="issuedAt"
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-base text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              name="issuedAt"
              type="date"
              required
            />
          </label>

          <label className="flex flex-col gap-2 text-sm" htmlFor="dueAt">
            <span className="font-semibold text-slate-700">Due date</span>
            <input
              id="dueAt"
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-base text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              name="dueAt"
              type="date"
              required
            />
          </label>
        </div>

        <label className="mt-6 flex flex-col gap-2 text-sm" htmlFor="notes">
          <span className="font-semibold text-slate-700">Notes</span>
          <textarea
            id="notes"
            className="min-h-[120px] rounded-xl border border-slate-200 px-4 py-3 text-base text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            name="notes"
            placeholder="Optional internal notes"
          />
        </label>

        {errorMessage && (
          <p className="mt-6 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {errorMessage}
          </p>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <button
            className="inline-flex h-10 w-full items-center justify-center rounded-full bg-slate-900 px-6 text-sm font-semibold text-white transition hover:bg-slate-800 sm:w-auto"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Create invoice"}
          </button>
          <Link
            className="inline-flex h-10 w-full items-center justify-center rounded-full border border-slate-300 px-6 text-sm font-semibold text-slate-700 transition hover:border-slate-400 sm:w-auto"
            href="/invoices"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
