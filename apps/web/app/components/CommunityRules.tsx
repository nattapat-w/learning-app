"use client";

import { useState } from "react";
import type { CommunityRulePublic } from "../../lib/types";
import { card, meta } from "../../lib/ui";

type CommunityRulesProps = {
  communityName: string;
  rules: CommunityRulePublic[];
};

export function CommunityRules({ communityName, rules }: CommunityRulesProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  if (rules.length === 0) return null;

  return (
    <div className={`mt-3 overflow-hidden ${card}`}>
      <div className="border-b border-d-divider px-4 py-3">
        <h3 className="text-xs font-bold uppercase tracking-wide text-d-header">
          Rules of r/{communityName}
        </h3>
      </div>
      <ol className="divide-y divide-d-divider">
        {rules.map((rule) => {
          const isOpen = openId === rule.id;
          return (
            <li key={rule.id}>
              <button
                type="button"
                onClick={() =>
                  setOpenId(isOpen ? null : rule.id)
                }
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-d-normal transition-colors hover:bg-[var(--background-modifier-hover)]"
              >
                <span>
                  {rule.position}. {rule.title}
                </span>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="currentColor"
                  className={`shrink-0 text-d-muted transition-transform ${isOpen ? "rotate-180" : ""}`}
                  aria-hidden
                >
                  <path d="M2.5 4.5L6 8l3.5-3.5H2.5z" />
                </svg>
              </button>
              {isOpen && rule.description && (
                <p className={`px-4 pb-3 ${meta} leading-relaxed`}>
                  {rule.description}
                </p>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
