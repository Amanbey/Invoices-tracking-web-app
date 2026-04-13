const resolveApiBases = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return [process.env.NEXT_PUBLIC_API_URL];
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "NEXT_PUBLIC_API_URL is required in production and must point to the deployed backend"
    );
  }

  if (typeof window !== "undefined" && window.location?.hostname) {
    const host = window.location.hostname;
    return [
      `http://${host}:5001`,
      `http://${host}:5002`,
      `http://${host}:5003`,
    ];
  }

  return ["http://localhost:5001", "http://localhost:5002", "http://localhost:5003"];
};

export const API_BASES = resolveApiBases();
export const API_BASE = API_BASES[0];
let activeApiBase = API_BASE;

const request = async (path, options = {}) => {
  const mergedHeaders = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  let lastConnectionError = null;

  for (const base of API_BASES) {
    let response;

    try {
      response = await fetch(`${base}${path}`, {
        ...options,
        headers: mergedHeaders,
      });
    } catch (error) {
      lastConnectionError = error;
      continue;
    }

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || "Request failed");
    }

    activeApiBase = base;

    return data;
  }

  if (lastConnectionError) {
    throw new Error("Unable to reach the API server.");
  }

  throw new Error("Request failed");
};

const requestForm = async (path, options = {}) => {
  let lastConnectionError = null;

  for (const base of API_BASES) {
    let response;

    try {
      response = await fetch(`${base}${path}`, {
        ...options,
      });
    } catch (error) {
      lastConnectionError = error;
      continue;
    }

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || "Request failed");
    }

    activeApiBase = base;

    return data;
  }

  if (lastConnectionError) {
    throw new Error("Unable to reach the API server.");
  }

  throw new Error("Request failed");
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

  const baseUrl = `${activeApiBase}${path}`;
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
