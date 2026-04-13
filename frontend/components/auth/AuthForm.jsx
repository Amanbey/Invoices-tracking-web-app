"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthInput from "./AuthInput";
import { getCurrentUser, loginUser, registerUser } from "../../lib/api";

const initialValues = {
  name: "",
  email: "",
  password: "",
};

export default function AuthForm({ mode }) {
  const router = useRouter();
  const [values, setValues] = useState(initialValues);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isRegister = mode === "register";

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setIsLoading(true);

    try {
      const action = isRegister ? registerUser : loginUser;
      const payload = isRegister
        ? values
        : { email: values.email, password: values.password };
      const data = await action(payload);

      if (data?.token) {
        localStorage.setItem("token", data.token);
        const profile = await getCurrentUser(data.token);
        if (profile?.user) {
          localStorage.setItem("user", JSON.stringify(profile.user));
        }
        setMessage("Authentication successful. Redirecting...");
        router.push("/dashboard");
      }
    } catch (error) {
      setMessage(error.message || "Authentication failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
      {isRegister && (
        <AuthInput
          label="Full name"
          type="text"
          name="name"
          value={values.name}
          onChange={handleChange}
          placeholder="Jane Doe"
        />
      )}
      <AuthInput
        label="Email"
        type="email"
        name="email"
        value={values.email}
        onChange={handleChange}
        placeholder="you@company.com"
      />
      <AuthInput
        label="Password"
        type="password"
        name="password"
        value={values.password}
        onChange={handleChange}
        placeholder="Minimum 6 characters"
      />
      <button
        className="rounded-lg bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-800"
        type="submit"
        disabled={isLoading}
      >
        {isLoading ? "Please wait..." : isRegister ? "Create account" : "Sign in"}
      </button>
      {message && (
        <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
          {message}
        </p>
      )}
    </form>
  );
}
