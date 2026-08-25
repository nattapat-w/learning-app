export const NAVIGATION_START_EVENT = "reddit-navigation-start";

export function startNavigationProgress(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(NAVIGATION_START_EVENT));
  }
}
