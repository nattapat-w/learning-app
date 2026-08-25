import type { PrismaService } from "../prisma/prisma.service";

type CommunityLookup = {
  id: string;
  name: string;
};

export function normalizeCommunityName(name: string): string {
  return name.trim().toLowerCase();
}

/** Case-insensitive community lookup (URLs may use any casing). */
export async function findCommunityByName(
  prisma: PrismaService,
  name: string,
): Promise<CommunityLookup | null> {
  const trimmed = name.trim();
  if (!trimmed) {
    return null;
  }

  return prisma.community.findFirst({
    where: {
      name: { equals: trimmed, mode: "insensitive" },
    },
    select: { id: true, name: true },
  });
}
