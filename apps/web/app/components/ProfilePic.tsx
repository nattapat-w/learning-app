import type { AuthorSummary, UserPublic } from "../../lib/types";

type ProfilePicProps = {
  user: AuthorSummary | UserPublic;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-20 w-20 text-2xl",
};

export function ProfilePic({ user, size = "md", className = "" }: ProfilePicProps) {
  const label = user.displayName ?? user.username;
  const initial = label[0]?.toUpperCase() ?? "?";

  if (user.avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={user.avatarUrl}
        alt=""
        className={`rounded-full object-cover bg-d-tertiary ${sizeClasses[size]} ${className}`}
      />
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-d-secondary-alt font-semibold text-d-header ${sizeClasses[size]} ${className}`}
      aria-hidden
    >
      {initial}
    </div>
  );
}
