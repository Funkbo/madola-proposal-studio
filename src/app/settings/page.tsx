import { getCurrentUserProfile } from "@/lib/services/profile";
import { SettingsContainer } from "@/components/settings/SettingsContainer";

export default async function SettingsPage() {
  const { user, profile } = await getCurrentUserProfile();

  const userProfile = profile
    ? {
        id: profile.id,
        fullName: profile.fullName,
        role: profile.role,
        email: user?.email || "",
      }
    : null;

  return (
    <div className="p-6 sm:p-8">
      <SettingsContainer currentUserProfile={userProfile} />
    </div>
  );
}
