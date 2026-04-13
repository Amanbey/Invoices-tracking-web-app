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
  address: "",
  notes: "",
  status: "active",
};

const inputClassName =
  "rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-base text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200";
const selectClassName =
  "rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-base text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200";
const textareaClassName =
  "min-h-[120px] rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200";
const compactInputClassName =
  "rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200";

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
  const [isFormOpen, setIsFormOpen] = useState(false);

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
      const matchesQuery =
        name.toLowerCase().includes(query.toLowerCase()) ||
        email.toLowerCase().includes(query.toLowerCase()) ||
        (client.company || "").toLowerCase().includes(query.toLowerCase());
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
        address: formValues.address.trim(),
        notes: formValues.notes.trim(),
      };
      const data = await createClient(token, payload);
      if (data?.client) {
        setClients((prev) => [data.client, ...prev]);
        setFormValues(emptyForm);
        setIsFormOpen(false);
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
    setErrorMessage("");

    try {
      await deleteClient(token, clientId);
      setClients((prev) => prev.filter((client) => client._id !== clientId));
    } catch (error) {
      if (error.message === "Cannot delete a client with existing invoices") {
        setErrorMessage("This client has invoices. Delete those invoices first.");
        return;
      }
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

      <header className="ui-card relative overflow-hidden rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-sm backdrop-blur">
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
            <div className="relative">
              <button
                className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
                type="button"
                onClick={() => setIsFormOpen((prev) => !prev)}
                aria-expanded={isFormOpen}
                aria-controls="add-client"
              >
                Add client
              </button>
            </div>
          </div>
        </div>
      </header>

      {isFormOpen && (
        <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-slate-900/30 px-4 py-10 backdrop-blur-sm">
          <div className="ui-card w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_30px_80px_-50px_rgba(15,23,42,0.8)]">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  <span className="font-display">Add new client</span>
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Save client details to reuse on invoices.
                </p>
              </div>
              <button
                className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-400"
                type="button"
                onClick={() => setIsFormOpen(false)}
              >
                Close
              </button>
            </div>

            <form id="add-client" className="mt-6" onSubmit={handleCreate}>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm" htmlFor="clientName">
                  <span className="font-semibold text-slate-700">Client name</span>
                  <input
                    id="clientName"
                    className={inputClassName}
                    name="name"
                    value={formValues.name}
                    onChange={handleFormChange}
                    placeholder="Client name"
                    required
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm" htmlFor="clientEmail">
                  <span className="font-semibold text-slate-700">Email</span>
                  <input
                    id="clientEmail"
                    className={inputClassName}
                    name="email"
                    type="email"
                    value={formValues.email}
                    onChange={handleFormChange}
                    placeholder="client@email.com"
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm" htmlFor="clientPhone">
                  <span className="font-semibold text-slate-700">Phone</span>
                  <input
                    id="clientPhone"
                    className={inputClassName}
                    name="phone"
                    value={formValues.phone}
                    onChange={handleFormChange}
                    placeholder="Phone number"
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm" htmlFor="clientAddress">
                  <span className="font-semibold text-slate-700">Address</span>
                  <input
                    id="clientAddress"
                    className={inputClassName}
                    name="address"
                    value={formValues.address}
                    onChange={handleFormChange}
                    placeholder="Street, city, country"
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm" htmlFor="clientStatus">
                  <span className="font-semibold text-slate-700">Status</span>
                  <select
                    id="clientStatus"
                    className={selectClassName}
                    name="status"
                    value={formValues.status}
                    onChange={handleFormChange}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </label>
              </div>

              <label className="mt-4 flex flex-col gap-2 text-sm" htmlFor="clientNotes">
                <span className="font-semibold text-slate-700">Notes</span>
                <textarea
                  id="clientNotes"
                  className={textareaClassName}
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
                <button
                  className="rounded-full border border-slate-300 px-6 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <section className="ui-card rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
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
                className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                placeholder="Search by name or email"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <select
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
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

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-100">
          <div className="grid grid-cols-1 gap-0 border-b border-slate-100 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 md:grid-cols-[1.2fr_1.2fr_0.6fr_0.6fr]">
            <span>Name</span>
            <span>Contact</span>
            <span>Status</span>
            <span>Actions</span>
          </div>
          <div className="divide-y divide-slate-100">
            {filteredClients.map((client) => (
              <div
                key={client._id}
                className="ui-card grid grid-cols-1 gap-4 px-4 py-4 text-sm text-slate-700 transition hover:bg-slate-50/70 md:grid-cols-[1.2fr_1.2fr_0.6fr_0.6fr]"
              >
                {editingId === client._id ? (
                  <div className="md:col-span-4">
                    <div className="grid gap-3 md:grid-cols-2">
                      <label
                        className="flex flex-col gap-2 text-xs font-semibold text-slate-600"
                        htmlFor={`edit-name-${client._id}`}
                      >
                        Name
                        <input
                          id={`edit-name-${client._id}`}
                          className={compactInputClassName}
                          name="name"
                          value={editingValues.name}
                          onChange={handleEditChange}
                        />
                      </label>
                      <label
                        className="flex flex-col gap-2 text-xs font-semibold text-slate-600"
                        htmlFor={`edit-email-${client._id}`}
                      >
                        Email
                        <input
                          id={`edit-email-${client._id}`}
                          className={compactInputClassName}
                          name="email"
                          value={editingValues.email}
                          onChange={handleEditChange}
                        />
                      </label>
                      <label
                        className="flex flex-col gap-2 text-xs font-semibold text-slate-600"
                        htmlFor={`edit-phone-${client._id}`}
                      >
                        Phone
                        <input
                          id={`edit-phone-${client._id}`}
                          className={compactInputClassName}
                          name="phone"
                          value={editingValues.phone}
                          onChange={handleEditChange}
                        />
                      </label>
                      <label
                        className="flex flex-col gap-2 text-xs font-semibold text-slate-600"
                        htmlFor={`edit-address-${client._id}`}
                      >
                        Address
                        <input
                          id={`edit-address-${client._id}`}
                          className={compactInputClassName}
                          name="address"
                          value={editingValues.address}
                          onChange={handleEditChange}
                        />
                      </label>
                      <label
                        className="flex flex-col gap-2 text-xs font-semibold text-slate-600"
                        htmlFor={`edit-status-${client._id}`}
                      >
                        Status
                        <select
                          id={`edit-status-${client._id}`}
                          className={compactInputClassName}
                          name="status"
                          value={editingValues.status}
                          onChange={handleEditChange}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </label>
                      <label
                        className="md:col-span-2 flex flex-col gap-2 text-xs font-semibold text-slate-600"
                        htmlFor={`edit-notes-${client._id}`}
                      >
                        Notes
                        <textarea
                          id={`edit-notes-${client._id}`}
                          className={textareaClassName}
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
                  </div>
                ) : (
                  <>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {client.name}
                      </p>
                      {client.company && (
                        <p className="text-xs text-slate-500">
                          {client.company}
                        </p>
                      )}
                      {client.address && (
                        <p className="text-xs text-slate-500">
                          {client.address}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-slate-500">Email</p>
                      <p className="text-sm font-medium text-slate-800">
                        {client.email || "No email"}
                      </p>
                      <p className="text-xs text-slate-500">Phone</p>
                      <p className="text-sm font-medium text-slate-800">
                        {client.phone || "No phone"}
                      </p>
                    </div>
                    <div>
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
                    <div className="flex flex-wrap gap-2">
                      <button
                        className="h-7 rounded-[10px] bg-slate-900 px-3 text-[11px] font-semibold text-white transition-all duration-200 hover:bg-slate-800 hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2"
                        type="button"
                        onClick={() => startEdit(client)}
                      >
                        Edit
                      </button>
                      <button
                        className="h-7 rounded-[10px] bg-rose-600 px-3 text-[11px] font-semibold text-white transition-all duration-200 hover:bg-rose-700 hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-rose-300 focus:ring-offset-2"
                        type="button"
                        onClick={() => handleDelete(client._id)}
                        disabled={isSaving}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
