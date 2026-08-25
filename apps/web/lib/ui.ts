/** Reddit design tokens — see DESIGN.md */

export const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-d-link/50 focus-visible:ring-offset-2 focus-visible:ring-offset-d-tertiary";

export const btnBase =
  "inline-flex cursor-pointer items-center justify-center rounded-full text-sm font-bold tracking-wide transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50 min-h-8 min-w-[80px] px-4 py-2";

export const btnPrimary = `${btnBase} ${focusRing} bg-brand text-white hover:bg-brand-hover active:bg-brand-active`;

export const btnSecondary = `${btnBase} ${focusRing} border border-d-link bg-transparent text-d-link hover:bg-[rgba(79,188,255,0.1)]`;

export const btnDanger = `${btnBase} ${focusRing} bg-d-danger text-white hover:bg-red-600`;

export const btnGhost =
  "inline-flex cursor-pointer items-center justify-center rounded px-2 py-2 text-sm font-medium text-d-muted transition-colors hover:bg-[var(--background-modifier-hover)] hover:text-d-normal";

export const linkBase =
  "cursor-pointer transition-colors duration-150 hover:underline underline-offset-2";

export const linkNav = `${linkBase} text-d-muted hover:text-d-normal`;

export const linkAccent = `${linkBase} text-d-link hover:text-[#6ecaff]`;

export const inputBase =
  "w-full rounded border border-d-divider bg-d-inset px-3 py-2 text-sm text-d-normal transition-colors placeholder:text-d-muted focus:border-d-link focus:bg-d-secondary focus:outline-none h-10";

export const textareaBase =
  "w-full resize-y rounded border border-d-divider bg-d-inset px-4 py-3 text-sm text-d-normal transition-colors placeholder:text-d-muted focus:border-d-link focus:bg-d-secondary focus:outline-none min-h-[44px]";

export const card =
  "rounded-lg border border-d-divider bg-d-secondary";

export const feedCard =
  "rounded-lg border border-d-divider bg-d-secondary hover:border-d-muted transition-colors duration-150";

export const voteColumn =
  "flex w-10 shrink-0 flex-col items-center bg-d-inset py-2 px-1";

/** Reddit layout — 1280px max, 24px gaps, 272 | 640 | 312 */
export const layoutMax = "mx-auto w-full max-w-[1280px]";

export const layoutPad = "px-6";

export const shellGrid =
  `${layoutMax} ${layoutPad} grid grid-cols-1 gap-y-6 py-5 lg:grid-cols-[272px_minmax(0,1fr)] lg:gap-x-6 xl:grid-cols-[272px_640px_312px] xl:gap-x-6`;

export const leftRail = "hidden lg:block w-[272px] shrink-0";

export const centerCol = "min-w-0 w-full xl:w-[640px] xl:max-w-[640px]";

export const rightRail = "hidden xl:block w-[312px] shrink-0";

export const headerBar =
  `${layoutMax} ${layoutPad} flex h-12 items-center gap-4 lg:gap-6 xl:gap-6`;

export const headerLogo =
  "shrink-0 font-[family-name:var(--font-display)] text-xl font-bold leading-5 text-d-header no-underline hover:no-underline lg:w-[272px]";

export const stickyBelowHeader =
  "sticky top-12 max-h-[calc(100vh-3rem)] overflow-y-auto overscroll-y-contain pb-4";

export const mainWrap = shellGrid;

export const navItem =
  "flex items-center gap-3 rounded-full px-3 py-2.5 text-sm font-medium text-d-normal transition-colors hover:bg-[var(--background-modifier-hover)]";

export const navItemActive =
  "flex items-center gap-3 rounded-full bg-[rgba(79,188,255,0.1)] px-3 py-2.5 text-sm font-bold text-d-link";

export const sidebarSection =
  "mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.08em] text-d-muted";

export const chip =
  "cursor-pointer rounded-full border border-d-divider bg-d-secondary-alt px-3 py-1.5 text-xs font-bold text-d-muted transition-colors hover:bg-[var(--background-modifier-hover)] hover:text-d-normal";

export const display =
  "font-[family-name:var(--font-display)] text-2xl font-bold leading-7 tracking-tight text-d-header";

export const heading = "text-lg font-bold leading-5 text-d-header";

export const postTitle = "text-lg font-medium leading-[22px] text-d-header";

export const pageTitle = display;

export const pageSubtitle = "mt-2 text-sm text-d-muted";

export const meta = "text-xs text-d-muted";

export const labelCaps =
  "mb-2 block text-xs font-bold uppercase tracking-wide text-d-header-secondary";

export const contentCard = `${card} p-4`;

export const divider = "h-px bg-d-divider";

export const actionPill =
  "inline-flex items-center gap-1.5 rounded-full bg-d-secondary-alt px-3 py-1.5 text-xs font-bold text-d-muted transition-colors hover:bg-[var(--background-modifier-hover)]";

export const feedSortBar =
  "mb-2 flex items-center rounded-lg border border-d-divider bg-d-secondary px-3 py-2";
