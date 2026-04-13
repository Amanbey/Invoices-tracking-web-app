const resolveApiBase = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  if (typeof window !== "undefined" && window.location?.hostname) {
    return `http://${window.location.hostname}:5001`;
  }

  return "http://localhost:5001";
};

export const API_BASE = resolveApiBase();

const request = async (path, options = {}) => {
  let response;

  try {
    const mergedHeaders = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };

    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: mergedHeaders,
    });
  } catch (error) {
    throw new Error("Unable to reach the API server.");
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
};

const requestForm = async (path, options = {}) => {
  let response;

  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
    });
  } catch (error) {
    throw new Error("Unable to reach the API server.");
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
};

export const getAssetUrl = (path) => {
  if (!path) {
    return "";
  }
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  return `${API_BASE}${path}`;
};

export const registerUser = (payload) =>
  request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const loginUser = (payload) =>
  request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const getCurrentUser = (token) =>
  request("/api/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const getInvoices = (token) =>
  request("/api/invoices", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const createInvoice = (token, payload) =>
  request("/api/invoices", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

export const updateInvoice = (token, invoiceId, payload) =>
  request(`/api/invoices/${invoiceId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

export const updateProfile = (token, formData) =>
  requestForm("/api/users/me", {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

export const getClients = (token) =>
  request("/api/clients", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const createClient = (token, payload) =>
  request("/api/clients", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

export const updateClient = (token, clientId, payload) =>
  request(`/api/clients/${clientId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

export const deleteClient = (token, clientId) =>
  request(`/api/clients/${clientId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
