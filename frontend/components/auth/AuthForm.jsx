"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthButton from "./AuthButton";
import AuthInput from "./AuthInput";
import toast from "react-hot-toast"; // ✅ added

const API = process.env.NEXT_PUBLIC_API_URL;

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
  const [showPassword, setShowPassword] = useState(false);

  const isRegister = mode === "register";

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    if (isRegister && values.password.length < 8) {
      const msg = "Password must be at least 8 characters long.";
      setMessage(msg);
      toast.error(msg); // ✅ toast
      return;
    }

    setIsLoading(true);

    try {
      const payload = isRegister
        ? values
        : { email: values.email, password: values.password };

      if (!API) {
        throw new Error("NEXT_PUBLIC_API_URL is not configured.");
      }

      const authUrl = isRegister
        ? `${API}/api/auth/register`
        : `${API}/api/auth/login`;

      const response = await fetch(authUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Authentication failed.");
      }

      if (data?.token) {
        localStorage.setItem("token", data.token);

        const profileResponse = await fetch(`${API}/api/auth/me`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${data.token}`,
          },
        });

        const profile = await profileResponse.json().catch(() => ({}));

        if (!profileResponse.ok) {
          throw new Error(profile.message || "Unable to load user profile.");
        }

        if (profile?.user) {
          localStorage.setItem("user", JSON.stringify(profile.user));
        }

        // ✅ SUCCESS
        toast.success(
          isRegister ? "Account created successfully!" : "Login successful!"
        );

        setMessage("Authentication successful. Redirecting...");
        router.push("/dashboard");
      }
    } catch (error) {
      const errMsg = error.message || "Authentication failed.";
      setMessage(errMsg);
      toast.error(errMsg); // ✅ toast
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="mt-8 flex flex-col gap-5" onSubmit={handleSubmit}>
      <button
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm"
        type="button"
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-full border border-slate-200">
          {/* SVG unchanged */}
        </span>
        {isRegister ? "Sign up with Google" : "Login with Google"}
      </button>

      <div className="relative flex items-center">
        <div className="h-px w-full bg-slate-200" />
        <span className="absolute left-1/2 -translate-x-1/2 bg-white px-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          {isRegister ? "Or sign up with email" : "Or login with email"}
        </span>
      </div>

      {isRegister && (
        <AuthInput
          id="name"
          label="Full name"
          type="text"
          name="name"
          value={values.name}
          onChange={handleChange}
          placeholder="Jane Doe"
        />
      )}

      <AuthInput
        id="email"
        label="Email"
        type="email"
        name="email"
        value={values.email}
        onChange={handleChange}
        placeholder="you@company.com"
      />

      <AuthInput
        id="password"
        label="Password"
        type={showPassword ? "text" : "password"}
        name="password"
        value={values.password}
        onChange={handleChange}
        placeholder="Minimum 8 characters"
        rightElement={
          <button
            className="text-xs font-semibold text-slate-500 transition hover:text-slate-700"
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        }
      />

      {!isRegister && (
        <div className="flex items-center justify-between text-xs text-slate-600">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="h-4 w-4" />
            Remember me
          </label>
          <button type="button" className="font-semibold text-slate-500">
            Forgot Password?
          </button>
        </div>
      )}

      <AuthButton isLoading={isLoading}>
        {isRegister ? "Create account" : "Login"}
      </AuthButton>

      {message && (
        <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
          {message}
        </p>
      )}
    </form>
  );
}