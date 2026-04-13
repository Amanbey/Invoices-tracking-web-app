"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { getAssetUrl } from "../../lib/api";

const navLinkClass = (isActive) =>
  `rounded-full px-4 py-2 text-sm font-semibold transition ${
    isActive
      ? "bg-slate-900 text-white"
      : "text-slate-600 hover:text-slate-900"
  }`;

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isAuthRoute = pathname === "/login" || pathname === "/register";
  const menuRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const loadUser = () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          return;
        } catch (error) {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    loadUser();
    window.addEventListener("profile-updated", loadUser);

    return () => {
      window.removeEventListener("profile-updated", loadUser);
    };
  }, [pathname]);

  useEffect(() => {
    if (!isMenuOpen) {
      return undefined;
    }

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  const avatarUrl = useMemo(
    () => getAssetUrl(user?.avatarUrl || ""),
    [user]
  );

  const initials = useMemo(() => {
    if (!user?.name) {
      return "U";
    }
    return user.name
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsMenuOpen(false);
    router.push("/register");
  };

  if (isAuthRoute) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center px-6 py-4">
        <Link className="flex items-center gap-3" href="/dashboard">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white">
            IP
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Invoice & Payment
            </p>
            <p className="text-xs text-slate-500">Tracking System</p>
          </div>
        </Link>

        <nav className="ml-auto hidden items-center gap-2 lg:flex">
          <Link className={navLinkClass(pathname === "/dashboard")} href="/dashboard">
            Dashboard
          </Link>
          <Link className={navLinkClass(pathname === "/clients")} href="/clients">
            Clients
          </Link>
          <Link className={navLinkClass(pathname === "/invoices")} href="/invoices">
            Invoices
          </Link>
        </nav>

        <div className="ml-4 flex items-center gap-3">
          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-1.5 transition hover:border-slate-300"
                type="button"
                onClick={() => setIsMenuOpen((prev) => !prev)}
                aria-haspopup="menu"
                aria-expanded={isMenuOpen}
              >
                <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs font-semibold text-slate-900">
                    {user.name || "Your account"}
                  </p>
                  <p className="text-[11px] text-slate-500">Signed in</p>
                </div>
              </button>
              {isMenuOpen && (
                <div className="absolute right-0 mt-3 w-40 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
                  <Link
                    className="block px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    href="/profile"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    className="flex w-full px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    type="button"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-400"
                href="/login"
              >
                Sign in
              </Link>
              <Link
                className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                href="/register"
              >
                Get started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
