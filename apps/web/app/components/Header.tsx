import Link from "next/link";
import { getMe } from "../../lib/api";
import { headerBar, headerLogo } from "../../lib/ui";
import { HeaderNav } from "./HeaderNav";
import { HeaderSearch } from "./HeaderSearch";

export async function Header() {
  const user = await getMe();

  return (
    <header className="sticky top-0 z-[100] border-b border-d-divider bg-d-secondary">
      <div className={headerBar}>
        <Link href="/" className={headerLogo}>
          reddit
        </Link>
        <HeaderSearch />
        <nav className="flex shrink-0 items-center gap-2 text-sm font-medium sm:gap-3">
          <HeaderNav user={user} />
        </nav>
      </div>
    </header>
  );
}
