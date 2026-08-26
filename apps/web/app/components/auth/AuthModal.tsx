"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { btnGhost, btnPrimary, btnSecondary, focusRing, inputBase, linkAccent } from "../../../lib/ui";
import {
  useAuthProviders,
  useLoginMutation,
  useMagicLinkMutation,
  useRegisterMutation,
  type AuthProviders,
} from "../../../lib/hooks/use-api-mutations";
import { useAuth } from "./auth-context";
import { SocialAuthButton, socialIcons } from "./SocialAuthButton";

const authLinkBtn = `${linkAccent} font-medium bg-transparent border-none min-h-0 min-w-0 px-0 py-0`;

const defaultProviders: AuthProviders = {
  google: false,
  line: false,
  magicLink: false,
};

export function AuthModal() {
  const { isOpen, mode, closeAuth, setMode } = useAuth();
  const providersQuery = useAuthProviders(isOpen);
  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();
  const magicLinkMutation = useMagicLinkMutation();

  const providers = providersQuery.data ?? defaultProviders;
  const providersError: AuthProviders | null =
    providersQuery.isError && !providersQuery.data
      ? {
          google: false,
          line: false,
          magicLink: false,
          googleMissing: ["API unreachable — check API_URL / Render"],
          lineMissing: ["API unreachable — check API_URL / Render"],
        }
      : null;
  const activeProviders: AuthProviders = providersError ?? providers;

  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [magicLinkMode, setMagicLinkMode] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [magicEmail, setMagicEmail] = useState("");

  const loading =
    loginMutation.isPending ||
    registerMutation.isPending ||
    magicLinkMutation.isPending;
  const resetForm = useCallback(() => {
    setError(null);
    setNotice(null);
    setIdentifier("");
    setPassword("");
    setUsername("");
    setMagicEmail("");
    setShowPassword(false);
    setMagicLinkMode(false);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen, mode, resetForm]);

  useEffect(() => {
    if (!isOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeAuth();
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, closeAuth]);

  function startGoogle() {
    if (!activeProviders.google) {
      const missing = activeProviders.googleMissing?.join(", ");
      setNotice(
        missing
          ? `API still missing: ${missing}. Set on Render (production) or apps/api/.env (local). Trying Google…`
          : "Google may not be configured on the API. Trying anyway…",
      );
      setError(null);
    }
    window.location.href = "/api/auth/google";
  }

  function startLine() {
    if (!activeProviders.line) {
      const missing = activeProviders.lineMissing?.join(", ");
      setNotice(
        missing
          ? `API still missing: ${missing}. Set on Render (production) or apps/api/.env (local). Trying LINE…`
          : "LINE may not be configured on the API. Trying anyway…",
      );
      setError(null);
    }
    window.location.href = "/api/auth/line";
  }

  async function sendMagicLink(e?: FormEvent) {
    e?.preventDefault();
    setError(null);
    setNotice(null);

    const email = magicEmail.trim() || identifier.trim();
    if (!email || !email.includes("@")) {
      setError("Enter a valid email address");
      return;
    }

    if (!activeProviders.magicLink) {
      setNotice("Magic link is not configured. Add RESEND_API_KEY and EMAIL_FROM.");
      return;
    }

    try {
      await magicLinkMutation.mutateAsync(email);
      setNotice("Check your email for a one-time sign-in link.");
      setMagicLinkMode(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send magic link");
    }
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setNotice(null);

    try {
      if (mode === "login") {
        await loginMutation.mutateAsync({ identifier, password });
      } else {
        await registerMutation.mutateAsync({
          username,
          email: identifier,
          password,
        });
      }
      closeAuth();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    }
  }

  if (!isOpen) return null;

  const canSubmit =
    password.length >= 8 &&
    identifier.trim().length > 0 &&
    (mode === "login" || username.trim().length >= 3);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-pointer bg-black/85"
        aria-label="Close"
        onClick={closeAuth}
      />
      <div className="auth-modal-panel relative w-full max-w-[440px] overflow-hidden rounded-md bg-d-primary shadow-[0_8px_16px_rgba(0,0,0,0.24)]">
        <div className="p-4 sm:p-6">
          <button
            type="button"
            onClick={closeAuth}
            className={`${btnGhost} ${focusRing} absolute right-3 top-3 flex h-8 w-8 min-h-0 min-w-0 items-center justify-center rounded-md text-d-muted hover:text-d-header`}
            aria-label="Close"
          >
            ✕
          </button>

          <h2
            id="auth-modal-title"
            className="text-center text-xl font-semibold leading-6 text-d-header"
          >
            {magicLinkMode
              ? "Email me a link"
              : mode === "login"
                ? "Log In"
                : "Sign Up"}
          </h2>
          <p className="mt-3 text-center text-base font-normal leading-[22px] text-d-normal">
            By continuing, you agree to our{" "}
            <span className={linkAccent}>User Agreement</span> and acknowledge
            that you understand the{" "}
            <span className={linkAccent}>Privacy Policy</span>.
          </p>

        {magicLinkMode ? (
          <form onSubmit={sendMagicLink} className="mt-6 space-y-4">
            <input
              type="email"
              required
              placeholder="Email"
              value={magicEmail}
              onChange={(e) => setMagicEmail(e.target.value)}
              className={inputBase}
            />
            {notice && <p className="text-sm font-medium text-d-link">{notice}</p>}
            {error && <p className="text-sm font-medium text-d-danger">{error}</p>}
            <div className="flex justify-end gap-2">
              <button type="button" className={btnSecondary} onClick={() => setMagicLinkMode(false)}>
                Back
              </button>
              <button type="submit" disabled={loading} className={btnPrimary}>
                {loading ? "Sending…" : "Send link"}
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="mt-6 space-y-2">
              <SocialAuthButton
                icon={socialIcons.google}
                label="Continue with Google"
                onClick={startGoogle}
                dimmed={!activeProviders.google}
              />
              <SocialAuthButton
                icon={socialIcons.line}
                label="Continue with LINE"
                onClick={startLine}
                dimmed={!activeProviders.line}
              />
              <SocialAuthButton
                icon={socialIcons.link}
                label="Email me a one-time link"
                onClick={() => {
                  if (!activeProviders.magicLink) {
                    setNotice(
                      "Magic link is not configured. Add RESEND_API_KEY and EMAIL_FROM.",
                    );
                    setError(null);
                    return;
                  }
                  setMagicLinkMode(true);
                  setMagicEmail(identifier.includes("@") ? identifier : "");
                  setError(null);
                  setNotice(null);
                }}
                dimmed={!activeProviders.magicLink}
              />
            </div>

            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-d-divider" />
              <span className="text-xs font-bold uppercase tracking-wide text-d-muted">
                OR
              </span>
              <div className="h-px flex-1 bg-d-divider" />
            </div>

            <form onSubmit={onSubmit} className="space-y-3">
              {mode === "register" && (
                <input
                  name="username"
                  type="text"
                  required
                  minLength={3}
                  maxLength={20}
                  pattern="[a-z0-9_]+"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={inputBase}
                />
              )}
              <input
                name="identifier"
                type="text"
                required
                placeholder={
                  mode === "login" ? "Email or username" : "Email"
                }
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className={inputBase}
              />
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputBase} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className={`${btnGhost} ${focusRing} absolute right-2 top-1/2 -translate-y-1/2 min-h-0 min-w-0 p-1.5 text-d-muted hover:text-d-header`}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "🙈" : "👁"}
                </button>
              </div>

              {notice && <p className="text-sm font-medium text-d-link">{notice}</p>}
              {error && <p className="text-sm font-medium text-d-danger">{error}</p>}

              <button
                type="submit"
                disabled={loading || !canSubmit}
                className={`${btnPrimary} w-full`}
              >
                {loading
                  ? mode === "login"
                    ? "Logging in…"
                    : "Signing up…"
                  : mode === "login"
                    ? "Log In"
                    : "Sign Up"}
              </button>
            </form>

            <p className="mt-4 text-center text-sm font-medium text-d-muted">
              {mode === "login" ? "New here? " : "Already have an account? "}
              <button
                type="button"
                className={authLinkBtn}
                onClick={() => {
                  setMode(mode === "login" ? "register" : "login");
                  resetForm();
                }}
              >
                {mode === "login" ? "Sign Up" : "Log In"}
              </button>
            </p>
          </>
        )}
        </div>
      </div>
    </div>
  );
}
