import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import "leaflet/dist/leaflet.css";
import { ClerkProvider } from "@clerk/clerk-react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { useRegisterSW } from "virtual:pwa-register/react";

const queryClient = new QueryClient();
// Import your Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Add your Clerk Publishable Key to the .env file')
}

// Wake up the Render backend (free tier spins down after 15 min of inactivity).
// Fire-and-forget on app load so the first real request doesn't hang on cold start.
function RenderWarmer() {
  useEffect(() => {
    apiRequest.get("/api/health").catch(() => {});
  }, []);
  return null;
}

// Auto-update SW without prompt
function SWRegister() {
  useRegisterSW({
    onNeedRefresh() {
      // Auto-reload when new content is available
      window.location.reload();
    },
    onOfflineReady() {
      console.log("App ready to work offline");
    },
  });
  return null;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RenderWarmer />
    <QueryClientProvider client={queryClient}> 
        <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
            <SWRegister />
            <App />
        </ClerkProvider> 
    </QueryClientProvider>
  </React.StrictMode>
);
