"use client";

import type { UserPublic } from "../../lib/types";
import { GuestNav, UserMenu } from "./UserMenu";

type HeaderNavProps = {
  user: UserPublic | null;
};

export function HeaderNav({ user }: HeaderNavProps) {
  if (user) {
    return <UserMenu user={user} />;
  }
  return <GuestNav />;
}
