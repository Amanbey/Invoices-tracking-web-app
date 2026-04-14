const API = process.env.NEXT_PUBLIC_API_URL;

if (!API && process.env.NODE_ENV === "production") {
  throw new Error(
    "NEXT_PUBLIC_API_URL is required in production and must point to the deployed backend"
  );
}

export const API_BASE = API || "";

const request = async (path, options = {}) => {
  const mergedHeaders = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: mergedHeaders,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
};

const requestForm = async (path, options = {}) => {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
};

export const getAssetUrl = (path, cacheKey) => {
  if (!path) {
    return "";
  }
  if (path.startsWith("http://") || path.startsWith("https://")) {
    if (cacheKey === undefined || cacheKey === null || cacheKey === "") {
      return path;
    }
    const separator = path.includes("?") ? "&" : "?";
    return `${path}${separator}v=${encodeURIComponent(cacheKey)}`;
  }

  const baseUrl = `${API_BASE}${path}`;
  if (cacheKey === undefined || cacheKey === null || cacheKey === "") {
    return baseUrl;
  }

  const separator = baseUrl.includes("?") ? "&" : "?";
  return `${baseUrl}${separator}v=${encodeURIComponent(cacheKey)}`;
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

export const deleteInvoice = (token, invoiceId) =>
  request(`/api/invoices/${invoiceId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
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
