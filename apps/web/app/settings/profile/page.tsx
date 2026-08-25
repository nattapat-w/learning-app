import { AppShell } from "../../components/AppShell";
import { AuthGate } from "../../components/auth/AuthGate";
import { getMe } from "../../../lib/api";
import { heading, pageSubtitle } from "../../../lib/ui";
import { ProfileForm } from "./ProfileForm";

export default async function ProfileSettingsPage() {
  const user = await getMe();

  return (
    <AppShell>
      <AuthGate user={user} title="Profile settings">
        {user && (
          <>
            <h1 className={heading}>Profile settings</h1>
            <p className={`mb-6 ${pageSubtitle}`}>u/{user.username}</p>
            <ProfileForm user={user} />
          </>
        )}
      </AuthGate>
    </AppShell>
  );
}
