import Link from "next/link";
import type { CommunityPublic, UserPublic } from "../../lib/types";
import { btnPrimary, btnSecondary, card } from "../../lib/ui";
import { LoginPromptButton } from "./auth/LoginPromptButton";
import { JoinCommunityButton } from "./JoinCommunityButton";

type CommunityHeaderProps = {
  community: CommunityPublic;
  user: UserPublic | null;
};

export function CommunityIcon({
  name,
  size = "lg",
}: {
  name: string;
  size?: "sm" | "lg";
}) {
  const label = name.slice(0, 2).toUpperCase();
  const sizeClass =
    size === "lg"
      ? "h-[72px] w-[72px] text-lg border-4 border-d-secondary"
      : "h-8 w-8 text-xs border-2 border-d-secondary";

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-d-secondary-alt font-bold text-d-header shadow-[0_0_0_1px_rgba(0,0,0,0.2)] ${sizeClass}`}
      aria-hidden
    >
      {label}
    </div>
  );
}

export function CommunityHeader({ community, user }: CommunityHeaderProps) {
  const membership = community.viewerMembership;
  const bannerText = `R/${community.name.toUpperCase()}: ${community.title.toUpperCase()}`;

  return (
    <div className="mb-3">
      <div
        className={`overflow-hidden ${card} rounded-b-none border-b-0`}
        aria-hidden
      >
        <div className="flex h-20 items-center justify-center bg-d-secondary-alt px-6 sm:h-24">
          <p className="text-center text-[10px] font-bold uppercase tracking-[0.12em] text-d-muted sm:text-xs">
            {bannerText}
          </p>
        </div>
      </div>

      <div className={`${card} rounded-t-none px-4 pb-4 pt-0`}>
        <div className="-mt-9 flex flex-wrap items-end justify-between gap-3 sm:-mt-10">
          <div className="flex min-w-0 items-end gap-3">
            <CommunityIcon name={community.name} size="lg" />
            <h1 className="pb-1 font-[family-name:var(--font-display)] text-xl font-bold leading-6 text-d-header sm:text-2xl">
              r/{community.name}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2 pb-1">
            {user ? (
              <>
                <Link
                  href={`/r/${community.name}/submit`}
                  className={`${btnPrimary} min-h-8 gap-1.5 px-4 text-sm`}
                >
                  <span aria-hidden>+</span>
                  Create Post
                </Link>
                <JoinCommunityButton
                  communityName={community.name}
                  initialIsMember={membership?.isMember ?? false}
                  initialRole={membership?.role}
                  isCreator={membership?.isCreator ?? false}
                />
              </>
            ) : (
              <LoginPromptButton className={`${btnSecondary} min-h-8 px-4 text-sm`}>
                Log in to post
              </LoginPromptButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
