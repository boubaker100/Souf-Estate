
import { SignUp } from "@clerk/clerk-react";

function SignUpPage() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <SignUp
        routing="path"
        path="/sign-up"
        fallbackRedirectUrl="/"
      />
    </div>
  );
}

export default SignUpPage;
