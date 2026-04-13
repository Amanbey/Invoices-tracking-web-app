"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getAssetUrl, getCurrentUser, updateProfile } from "../../lib/api";

const inputClassName =
  "rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-base text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200";

export default function ProfilePage() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    avatarUrl: "",
    avatarUpdatedAt: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/register");
      return;
    }

    const loadProfile = async () => {
      try {
        const data = await getCurrentUser(token);
        if (data?.user) {
          setProfile({
            name: data.user.name || "",
            email: data.user.email || "",
            avatarUrl: data.user.avatarUrl || "",
            avatarUpdatedAt: data.user.updatedAt || "",
          });
          setIsReady(true);
          return;
        }
        throw new Error("Invalid session");
      } catch (error) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.replace("/register");
      }
    };

    loadProfile();
  }, [router]);

  const avatarPreview = useMemo(() => {
    if (avatarFile) {
      return URL.createObjectURL(avatarFile);
    }
    return getAssetUrl(profile.avatarUrl || "", profile.avatarUpdatedAt);
  }, [avatarFile, profile.avatarUrl, profile.avatarUpdatedAt]);

  const initials = profile.name
    ? profile.name
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/register");
      return;
    }

    setIsSaving(true);

    try {
      const formData = new FormData();
      formData.append("name", profile.name.trim());
      formData.append("email", profile.email.trim());
      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      const data = await updateProfile(token, formData);
      if (data?.user) {
        setProfile({
          name: data.user.name || "",
          email: data.user.email || "",
          avatarUrl: data.user.avatarUrl || "",
          avatarUpdatedAt: data.user.updatedAt || Date.now().toString(),
        });
        localStorage.setItem("user", JSON.stringify(data.user));
        window.dispatchEvent(new Event("profile-updated"));
      }

      setMessage("Profile updated successfully.");
      setAvatarFile(null);
    } catch (error) {
      setMessage(error.message || "Unable to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isReady) {
    return null;
  }

  return (
    <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-8">
      <header className="ui-card rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-sm backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
          Profile
        </p>
        <h1 className="mt-3 text-4xl font-semibold text-slate-900 md:text-5xl">
          <span className="font-display">Your profile settings.</span>
        </h1>
        <p className="mt-4 max-w-xl text-base text-slate-600">
          Keep your profile information up to date and personalize your account.
        </p>
      </header>

      <form
        className="ui-card rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.8)]"
        onSubmit={handleSubmit}
      >
        <div className="grid gap-6 lg:grid-cols-[0.7fr_1fr]">
          <div className="ui-card flex flex-col items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-6 text-center">
            <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-2xl font-semibold text-slate-700">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                initials
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {profile.name || "Your name"}
              </p>
              <p className="text-xs text-slate-500">{profile.email}</p>
            </div>
            <label
              className="inline-flex cursor-pointer rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-400"
              htmlFor="avatar"
            >
              Change photo
            </label>
            <input
              id="avatar"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  setAvatarFile(file);
                }
              }}
            />
            <p className="text-xs text-slate-500">
              JPG or PNG up to 2MB.
            </p>
          </div>

          <div className="grid gap-5">
            <label className="flex flex-col gap-2 text-sm" htmlFor="name">
              <span className="font-semibold text-slate-700">Full name</span>
              <input
                id="name"
                className={inputClassName}
                value={profile.name}
                onChange={(event) =>
                  setProfile((prev) => ({ ...prev, name: event.target.value }))
                }
                placeholder="Jane Doe"
                required
              />
            </label>
            <label className="flex flex-col gap-2 text-sm" htmlFor="email">
              <span className="font-semibold text-slate-700">Email</span>
              <input
                id="email"
                className={inputClassName}
                type="email"
                value={profile.email}
                onChange={(event) =>
                  setProfile((prev) => ({ ...prev, email: event.target.value }))
                }
                placeholder="you@company.com"
                required
              />
            </label>
            {message && (
              <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                {message}
              </p>
            )}
            <div className="flex flex-wrap gap-3">
              <button
                className="rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                type="submit"
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
