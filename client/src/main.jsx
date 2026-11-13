import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import "leaflet/dist/leaflet.css";
import { ClerkProvider } from "@clerk/clerk-react";
import { QueryClientProvider,QueryClient } from "@tanstack/react-query";
import { Toaster } from "./components/ui/sonner.jsx";
  
const queryClient = new QueryClient();
// Import your Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Add your Clerk Publishable Key to the .env file')
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}> 
      
   
       <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
          
           <App />
         
       </ClerkProvider> 
       
       </QueryClientProvider>
  </React.StrictMode>
);
