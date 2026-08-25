import { AppShell } from "../../components/AppShell";
import { AuthGate } from "../../components/auth/AuthGate";
import { getMe } from "../../../lib/api";
import { CreateCommunityForm } from "./CreateCommunityForm";

export default async function NewCommunityPage() {
  const user = await getMe();

  return (
    <AppShell>
      <AuthGate user={user} title="Create a community">
        <div className="rounded-lg border border-d-divider bg-d-secondary p-4">
          <h1 className="mb-6 text-lg font-bold text-d-header">Create a community</h1>
          <CreateCommunityForm />
        </div>
      </AuthGate>
    </AppShell>
  );
}
