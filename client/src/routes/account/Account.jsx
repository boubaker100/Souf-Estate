import { UserProfile } from "@clerk/clerk-react";

function Account() {
  return (
    <div className="flex justify-center items-center py-10">
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

export default Account;
