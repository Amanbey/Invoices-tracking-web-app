"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createClient,
  deleteClient,
  getClients,
  updateClient,
} from "../../lib/api";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  company: "",
  address: "",
  notes: "",
  status: "active",
};

export default function ClientsPage() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [clients, setClients] = useState([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [formValues, setFormValues] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingValues, setEditingValues] = useState(emptyForm);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/register");
      return;
    }

    const loadClients = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");
        const data = await getClients(token);
        setClients(data?.clients || []);
      } catch (error) {
        setErrorMessage(error.message || "Unable to load clients.");
      } finally {
        setIsLoading(false);
        setIsReady(true);
      }
    };

    loadClients();
  }, [router]);

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const name = client.name || "";
      const email = client.email || "";
      const company = client.company || "";
      const matchesQuery =
        name.toLowerCase().includes(query.toLowerCase()) ||
        email.toLowerCase().includes(query.toLowerCase()) ||
        company.toLowerCase().includes(query.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || client.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [clients, query, statusFilter]);

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditingValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    if (!formValues.name.trim()) {
      setErrorMessage("Client name is required.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/register");
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        ...formValues,
        name: formValues.name.trim(),
        email: formValues.email.trim(),
        phone: formValues.phone.trim(),
        company: formValues.company.trim(),
        address: formValues.address.trim(),
        notes: formValues.notes.trim(),
      };
      const data = await createClient(token, payload);
      if (data?.client) {
        setClients((prev) => [data.client, ...prev]);
        setFormValues(emptyForm);
      }
    } catch (error) {
      setErrorMessage(error.message || "Unable to add client.");
    } finally {
      setIsSaving(false);
    }
  };

  const startEdit = (client) => {
    setEditingId(client._id);
    setEditingValues({
      name: client.name || "",
      email: client.email || "",
      phone: client.phone || "",
      company: client.company || "",
      address: client.address || "",
      notes: client.notes || "",
      status: client.status || "active",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingValues(emptyForm);
  };

  const handleUpdate = async (clientId) => {
    if (!editingValues.name.trim()) {
      setErrorMessage("Client name is required.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/register");
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        ...editingValues,
        name: editingValues.name.trim(),
        email: editingValues.email.trim(),
        phone: editingValues.phone.trim(),
        company: editingValues.company.trim(),
        address: editingValues.address.trim(),
        notes: editingValues.notes.trim(),
      };
      const data = await updateClient(token, clientId, payload);
      if (data?.client) {
        setClients((prev) =>
          prev.map((client) =>
            client._id === clientId ? data.client : client
          )
        );
        cancelEdit();
      }
    } catch (error) {
      setErrorMessage(error.message || "Unable to update client.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (clientId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/register");
      return;
    }

    const confirmed = window.confirm("Delete this client?");
    if (!confirmed) {
      return;
    }

    setIsSaving(true);

    try {
      await deleteClient(token, clientId);
      setClients((prev) => prev.filter((client) => client._id !== clientId));
    } catch (error) {
      setErrorMessage(error.message || "Unable to delete client.");
    } finally {
      setIsSaving(false);
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
              Clients
            </p>
            <h1 className="mt-3 text-4xl font-semibold text-slate-900 md:text-5xl">
              <span className="font-display">Client relationships at a glance.</span>
            </h1>
            <p className="mt-4 max-w-xl text-base text-slate-600">
              Keep every client profile organized, track their status, and move
              faster when creating new invoices.
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
              href="/invoices"
            >
              View invoices
            </Link>
          </div>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <form
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          onSubmit={handleCreate}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                <span className="font-display">Add new client</span>
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Save client details to reuse on invoices.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-semibold text-slate-700">Client name</span>
              <input
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-base outline-none transition focus:border-slate-400"
                name="name"
                value={formValues.name}
                onChange={handleFormChange}
                placeholder="Client name"
                required
              />
            </label>
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-semibold text-slate-700">Company</span>
              <input
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-base outline-none transition focus:border-slate-400"
                name="company"
                value={formValues.company}
                onChange={handleFormChange}
                placeholder="Company name"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-semibold text-slate-700">Email</span>
              <input
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-base outline-none transition focus:border-slate-400"
                name="email"
                type="email"
                value={formValues.email}
                onChange={handleFormChange}
                placeholder="client@email.com"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-semibold text-slate-700">Phone</span>
              <input
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-base outline-none transition focus:border-slate-400"
                name="phone"
                value={formValues.phone}
                onChange={handleFormChange}
                placeholder="Phone number"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-semibold text-slate-700">Address</span>
              <input
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-base outline-none transition focus:border-slate-400"
                name="address"
                value={formValues.address}
                onChange={handleFormChange}
                placeholder="Street, city, country"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-semibold text-slate-700">Status</span>
              <select
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-base outline-none transition focus:border-slate-400"
                name="status"
                value={formValues.status}
                onChange={handleFormChange}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
          </div>

          <label className="mt-4 flex flex-col gap-2 text-sm">
            <span className="font-semibold text-slate-700">Notes</span>
            <textarea
              className="min-h-[120px] rounded-xl border border-slate-200 px-4 py-3 text-base outline-none transition focus:border-slate-400"
              name="notes"
              value={formValues.notes}
              onChange={handleFormChange}
              placeholder="Optional notes"
            />
          </label>

          {errorMessage && (
            <p className="mt-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {errorMessage}
            </p>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              className="rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              type="submit"
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save client"}
            </button>
          </div>
        </form>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                <span className="font-display">Client directory</span>
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {filteredClients.length} clients in view
              </p>
            </div>
            <div className="flex flex-1 flex-col gap-3 md:max-w-sm md:flex-row md:items-center md:justify-end">
              <input
                className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-slate-400"
                placeholder="Search by name, email, company"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <select
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-slate-400"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="all">All status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {isLoading && (
            <p className="mt-6 text-sm text-slate-500">Loading clients...</p>
          )}
          {!isLoading && filteredClients.length === 0 && (
            <p className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-500">
              No clients yet. Add your first client to get started.
            </p>
          )}

          <div className="mt-6 space-y-4">
            {filteredClients.map((client) => (
              <div
                key={client._id}
                className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4"
              >
                {editingId === client._id ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
                      Name
                      <input
                        className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-400"
                        name="name"
                        value={editingValues.name}
                        onChange={handleEditChange}
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
                      Company
                      <input
                        className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-400"
                        name="company"
                        value={editingValues.company}
                        onChange={handleEditChange}
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
                      Email
                      <input
                        className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-400"
                        name="email"
                        value={editingValues.email}
                        onChange={handleEditChange}
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
                      Phone
                      <input
                        className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-400"
                        name="phone"
                        value={editingValues.phone}
                        onChange={handleEditChange}
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
                      Address
                      <input
                        className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-400"
                        name="address"
                        value={editingValues.address}
                        onChange={handleEditChange}
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
                      Status
                      <select
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-400"
                        name="status"
                        value={editingValues.status}
                        onChange={handleEditChange}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </label>
                    <label className="md:col-span-2 flex flex-col gap-2 text-xs font-semibold text-slate-600">
                      Notes
                      <textarea
                        className="min-h-[90px] rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-400"
                        name="notes"
                        value={editingValues.notes}
                        onChange={handleEditChange}
                      />
                    </label>
                    <div className="md:col-span-2 flex flex-wrap gap-3">
                      <button
                        className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                        type="button"
                        onClick={() => handleUpdate(client._id)}
                        disabled={isSaving}
                      >
                        Save changes
                      </button>
                      <button
                        className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-400"
                        type="button"
                        onClick={cancelEdit}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {client.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {client.company || "Independent"} • {client.email || "No email"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {client.phone || "No phone"}
                        </p>
                      </div>
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          client.status === "inactive"
                            ? "bg-slate-200 text-slate-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {client.status === "inactive" ? "Inactive" : "Active"}
                      </span>
                    </div>
                    {client.address && (
                      <p className="text-xs text-slate-500">{client.address}</p>
                    )}
                    {client.notes && (
                      <p className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500">
                        {client.notes}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-3">
                      <button
                        className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-400"
                        type="button"
                        onClick={() => startEdit(client)}
                      >
                        Edit
                      </button>
                      <button
                        className="rounded-full border border-rose-200 px-4 py-2 text-xs font-semibold text-rose-600 transition hover:border-rose-300"
                        type="button"
                        onClick={() => handleDelete(client._id)}
                        disabled={isSaving}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
