import { UserProfile } from "@clerk/clerk-react";

export default function ProfileSettingsPage() {
  return (
    <div className="flex justify-center py-10">
      <UserProfile
        appearance={{
          elements: {
            card: "shadow-xl rounded-2xl",
          },
        }}
      />
    </div>
  );
}
