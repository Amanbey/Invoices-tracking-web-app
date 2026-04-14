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
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
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

  useEffect(() => {
    setIsMobileNavOpen(false);
    setIsMenuOpen(false);
  }, [pathname]);

  const avatarUrl = useMemo(
    () => getAssetUrl(user?.avatarUrl || "", user?.updatedAt || ""),
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
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur transition-shadow duration-200 hover:shadow-sm">
      <div className="mx-auto flex w-full max-w-7xl items-center px-4 py-3 sm:px-6 lg:px-8">
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

        <button
          className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300 text-slate-700 transition hover:border-slate-400 lg:hidden"
          type="button"
          onClick={() => setIsMobileNavOpen((prev) => !prev)}
          aria-expanded={isMobileNavOpen}
          aria-controls="mobile-nav"
          aria-label="Toggle navigation menu"
        >
          <span className="sr-only">Toggle navigation</span>
          <svg
            className={`h-5 w-5 transition-transform duration-300 ${
              isMobileNavOpen ? "rotate-90" : "rotate-0"
            }`}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M4 7H20M4 12H20M4 17H20"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <div className="ml-3 hidden items-center gap-3 lg:flex">
          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                className="flex h-10 items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-1.5 transition hover:border-slate-300"
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
                className="inline-flex h-10 items-center rounded-full border border-slate-300 px-4 text-xs font-semibold text-slate-700 transition hover:border-slate-400"
                href="/login"
              >
                Sign in
              </Link>
              <Link
                className="inline-flex h-10 items-center rounded-full bg-slate-900 px-4 text-xs font-semibold text-white transition hover:bg-slate-800"
                href="/register"
              >
                Get started
              </Link>
            </div>
          )}
        </div>
      </div>

      <div
        id="mobile-nav"
        className={`overflow-hidden border-t border-slate-200 bg-white/95 backdrop-blur transition-all duration-500 ease-out lg:hidden ${
          isMobileNavOpen
            ? "max-h-[520px] translate-y-0 opacity-100"
            : "max-h-0 -translate-y-2 opacity-0"
        }`}
      >
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-4 sm:px-6">
          <Link
            className={`${navLinkClass(
              pathname === "/dashboard"
            )} w-fit self-start px-3 py-1.5 text-xs transition-all duration-500 sm:px-4 sm:py-2 sm:text-sm ${
              isMobileNavOpen
                ? "translate-x-0 opacity-100 delay-75"
                : "-translate-x-2 opacity-0"
            }`}
            href="/dashboard"
            onClick={() => setIsMobileNavOpen(false)}
          >
            Dashboard
          </Link>
          <Link
            className={`${navLinkClass(
              pathname === "/clients"
            )} w-fit self-start px-3 py-1.5 text-xs transition-all duration-500 sm:px-4 sm:py-2 sm:text-sm ${
              isMobileNavOpen
                ? "translate-x-0 opacity-100 delay-100"
                : "-translate-x-2 opacity-0"
            }`}
            href="/clients"
            onClick={() => setIsMobileNavOpen(false)}
          >
            Clients
          </Link>
          <Link
            className={`${navLinkClass(
              pathname === "/invoices"
            )} w-fit self-start px-3 py-1.5 text-xs transition-all duration-500 sm:px-4 sm:py-2 sm:text-sm ${
              isMobileNavOpen
                ? "translate-x-0 opacity-100 delay-150"
                : "-translate-x-2 opacity-0"
            }`}
            href="/invoices"
            onClick={() => setIsMobileNavOpen(false)}
          >
            Invoices
          </Link>

          <div className="mt-2 h-px w-full bg-slate-200" />

          {user ? (
            <div className="flex flex-col gap-2">
              <Link
                className={`inline-flex h-9 w-fit items-center justify-center self-start rounded-full border border-slate-300 px-3 text-xs font-semibold text-slate-700 transition-all duration-500 hover:border-slate-400 sm:h-10 sm:px-4 sm:text-sm ${
                  isMobileNavOpen
                    ? "translate-x-0 opacity-100 delay-200"
                    : "-translate-x-2 opacity-0"
                }`}
                href="/profile"
                onClick={() => setIsMobileNavOpen(false)}
              >
                Profile
              </Link>
              <button
                className={`inline-flex h-9 w-fit items-center justify-center self-start rounded-full bg-slate-900 px-3 text-xs font-semibold text-white transition-all duration-500 hover:bg-slate-800 sm:h-10 sm:px-4 sm:text-sm ${
                  isMobileNavOpen
                    ? "translate-x-0 opacity-100 delay-[250ms]"
                    : "-translate-x-2 opacity-0"
                }`}
                type="button"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Link
                className="inline-flex h-10 items-center justify-center rounded-full border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
                href="/login"
                onClick={() => setIsMobileNavOpen(false)}
              >
                Sign in
              </Link>
              <Link
                className="inline-flex h-10 items-center justify-center rounded-full bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
                href="/register"
                onClick={() => setIsMobileNavOpen(false)}
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
