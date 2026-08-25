"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { NAVIGATION_START_EVENT } from "../../lib/navigation-progress";

const BAR_COLOR = "#ff4500";
const STALL_TIMEOUT_MS = 10000;

function normalizeHref(href: string): string {
  if (href.startsWith("http")) {
    const url = new URL(href);
    return url.pathname + url.search;
  }
  return href.split("#")[0];
}

function TopLoadingBarInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchKey = searchParams.toString();
  const [visible, setVisible] = useState(false);
  const [width, setWidth] = useState(0);
  const loadingRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stallTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function clearTimers() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    if (stallTimerRef.current) {
      clearTimeout(stallTimerRef.current);
      stallTimerRef.current = null;
    }
  }

  function startLoading() {
    clearTimers();
    loadingRef.current = true;
    setVisible(true);
    setWidth(12);

    intervalRef.current = setInterval(() => {
      setWidth((prev) => {
        if (prev >= 88) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return prev;
        }
        return prev + 6 + Math.random() * 10;
      });
    }, 180);

    stallTimerRef.current = setTimeout(() => {
      finishLoading();
    }, STALL_TIMEOUT_MS);
  }

  function finishLoading() {
    if (!loadingRef.current) return;
    clearTimers();
    loadingRef.current = false;
    setWidth(100);
    hideTimerRef.current = setTimeout(() => {
      setVisible(false);
      setWidth(0);
    }, 280);
  }

  // Finish when route or query string changes (search stays on /search)
  useEffect(() => {
    finishLoading();
  }, [pathname, searchKey]);

  useEffect(() => {
    function onNavigationStart() {
      startLoading();
    }

    function onClick(e: MouseEvent) {
      const anchor = (e.target as Element).closest("a");
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) {
        return;
      }

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:")) {
        return;
      }

      if (href.startsWith("http") && !href.startsWith(window.location.origin)) {
        return;
      }

      const target = normalizeHref(href);
      const current = pathname + (searchKey ? `?${searchKey}` : "");

      if (target === current) return;

      startLoading();
    }

    function onPopState() {
      finishLoading();
    }

    window.addEventListener(NAVIGATION_START_EVENT, onNavigationStart);
    window.addEventListener("popstate", onPopState);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener(NAVIGATION_START_EVENT, onNavigationStart);
      window.removeEventListener("popstate", onPopState);
      document.removeEventListener("click", onClick, true);
      clearTimers();
    };
  }, [pathname, searchKey]);

  if (!visible) return null;

  return (
    <div
      className="pointer-events-none fixed left-0 top-0 z-[200] h-[3px] origin-left"
      style={{
        width: `${width}%`,
        backgroundColor: BAR_COLOR,
        boxShadow: "0 0 10px rgba(255, 69, 0, 0.55)",
        transition: "width 180ms ease-out, opacity 280ms ease",
        opacity: width >= 100 ? 0 : 1,
      }}
      role="progressbar"
      aria-hidden
    />
  );
}

export function TopLoadingBar() {
  return (
    <Suspense fallback={null}>
      <TopLoadingBarInner />
    </Suspense>
  );
}
