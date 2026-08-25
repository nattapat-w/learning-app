import Link from "next/link";
import type { CommunityPublic } from "../../lib/types";
import { card, linkAccent, meta, stickyBelowHeader } from "../../lib/ui";
import { CommunityIcon } from "./CommunityHeader";
import { CommunityRules } from "./CommunityRules";
import { JoinCommunityButton } from "./JoinCommunityButton";
import { ProfilePic } from "./ProfilePic";

type CommunitySidebarProps = {
  community: CommunityPublic;
  isLoggedIn: boolean;
};

function formatCreated(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function CommunitySidebar({
  community,
  isLoggedIn,
}: CommunitySidebarProps) {
  const membership = community.viewerMembership;

  return (
    <aside className={`${stickyBelowHeader} space-y-3`}>
      <div className={`overflow-hidden ${card}`}>
        <div className="h-10 bg-d-secondary-alt" aria-hidden />
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <CommunityIcon name={community.name} size="sm" />
              <div className="min-w-0">
                <h2 className="text-sm font-bold text-d-header">{community.title}</h2>
                <p className="text-xs text-d-muted">r/{community.name}</p>
              </div>
            </div>
            {isLoggedIn && (
              <JoinCommunityButton
                communityName={community.name}
                initialIsMember={membership?.isMember ?? false}
                initialRole={membership?.role}
                isCreator={membership?.isCreator ?? false}
              />
            )}
          </div>

          {community.description && (
            <p className="mt-3 text-sm leading-[21px] text-d-normal">
              {community.description}
            </p>
          )}

          <div className="mt-4 space-y-2 border-t border-d-divider pt-4">
            <div className="flex items-center gap-2">
              <ProfilePic user={community.creator} size="sm" />
              <div className="min-w-0">
                <p className={meta}>Created by</p>
                <Link
                  href={`/u/${community.creator.username}`}
                  className={`text-sm font-bold text-d-header ${linkAccent} no-underline hover:no-underline`}
                >
                  u/{community.creator.username}
                </Link>
              </div>
            </div>
            <p className={meta}>
              Created {formatCreated(community.createdAt)}
            </p>
            <div className="flex gap-6">
              <div>
                <p className="text-sm font-bold text-d-header">
                  {community.memberCount.toLocaleString()}
                </p>
                <p className={meta}>Members</p>
              </div>
              <div>
                <p className="text-sm font-bold text-d-header">
                  {community.moderatorCount}
                </p>
                <p className={meta}>Moderators</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {community.moderators.length > 0 && (
        <div className={`p-4 ${card}`}>
          <h3 className="text-xs font-bold uppercase tracking-wide text-d-muted">
            Moderators
          </h3>
          <ul className="mt-3 space-y-2">
            {community.moderators.map((mod) => (
              <li key={mod.id} className="flex items-center gap-2">
                <ProfilePic user={mod} size="sm" />
                <Link
                  href={`/u/${mod.username}`}
                  className={`text-sm text-d-normal ${linkAccent} no-underline hover:no-underline`}
                >
                  {mod.displayName ?? mod.username}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <CommunityRules communityName={community.name} rules={community.rules} />
    </aside>
  );
}
