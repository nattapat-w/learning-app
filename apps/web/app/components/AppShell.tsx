import type { ReactNode } from "react";
import { centerCol, rightRail, shellGrid } from "../../lib/ui";
import { LeftSidebar } from "./LeftSidebar";

type AppShellProps = {
  children: ReactNode;
  right?: ReactNode;
};

export function AppShell({ children, right }: AppShellProps) {
  return (
    <div className={shellGrid}>
      <LeftSidebar />
      <main className={centerCol}>{children}</main>
      {right ? <div className={rightRail}>{right}</div> : null}
    </div>
  );
}
