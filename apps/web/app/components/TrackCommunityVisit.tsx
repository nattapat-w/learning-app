"use client";

import { useEffect } from "react";
import { recordCommunityVisit } from "../../lib/recent-visits";

type TrackCommunityVisitProps = {
  name: string;
  title: string;
};

export function TrackCommunityVisit({ name, title }: TrackCommunityVisitProps) {
  useEffect(() => {
    recordCommunityVisit(name, title);
  }, [name, title]);

  return null;
}
