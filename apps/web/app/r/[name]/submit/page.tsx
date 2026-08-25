import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AppShell } from "../../../components/AppShell";
import { AuthGate } from "../../../components/auth/AuthGate";
import { getCommunity, getMe } from "../../../../lib/api";
import { heading, linkAccent, meta } from "../../../../lib/ui";
import { SubmitPostForm } from "./SubmitPostForm";

type SubmitPageProps = {
  params: Promise<{ name: string }>;
};

export default async function SubmitPostPage({ params }: SubmitPageProps) {
  const { name } = await params;
  const user = await getMe();

  const community = await getCommunity(name);
  if (!community) {
    notFound();
  }

  if (name !== community.name) {
    redirect(`/r/${community.name}/submit`);
  }

  return (
    <AppShell>
      <AuthGate user={user} title="Create post">
        <p className={meta}>
          Posting to{" "}
          <Link href={`/r/${community.name}`} className={linkAccent}>
            r/{community.name}
          </Link>
        </p>
        <h1 className={`mb-6 mt-2 ${heading}`}>Create post</h1>
        <SubmitPostForm communityName={community.name} />
      </AuthGate>
    </AppShell>
  );
}
