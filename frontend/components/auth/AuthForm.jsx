"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthButton from "./AuthButton";
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
      setMessage("Password must be at least 8 characters long.");
      return;
    }

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
    <form className="mt-8 flex flex-col gap-5" onSubmit={handleSubmit}>
      <button
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm"
        type="button"
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-full border border-slate-200">
          <svg
            aria-hidden="true"
            viewBox="0 0 48 48"
            className="h-3.5 w-3.5"
          >
            <path
              fill="#FFC107"
              d="M43.611 20.083H42V20H24v8h11.303C33.65 32.71 29.239 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.651-.389-3.917z"
            />
            <path
              fill="#FF3D00"
              d="M6.306 14.691l6.571 4.819C14.655 16.002 19.001 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4c-7.682 0-14.344 4.337-17.694 10.691z"
            />
            <path
              fill="#4CAF50"
              d="M24 44c5.171 0 9.86-1.977 13.409-5.197l-6.19-5.238C29.28 35.098 26.743 36 24 36c-5.218 0-9.615-3.27-11.282-7.861l-6.52 5.02C9.505 39.556 16.227 44 24 44z"
            />
            <path
              fill="#1976D2"
              d="M43.611 20.083H42V20H24v8h11.303c-1.08 2.884-3.436 5.183-6.264 6.565l.003-.002 6.19 5.238C34.785 41.296 40 36 40 24c0-1.341-.138-2.651-.389-3.917z"
            />
          </svg>
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
            <input
              className="h-4 w-4 rounded border border-slate-300 text-slate-900 focus:ring-2 focus:ring-slate-200"
              type="checkbox"
            />
            Remember me
          </label>
          <button
            className="font-semibold text-slate-500 transition hover:text-slate-700"
            type="button"
          >
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
