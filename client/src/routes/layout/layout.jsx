import Navbar from "../../components/navbar/Navbar"
import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "@clerk/clerk-react"


function Layout() { 
  const { pathname } = useLocation()
  
   
  return (
   
    <div>
        <Navbar />
        <Outlet />
    </div>
 
   
  )
}

function RequireAuth() {
  const { isSignedIn, isLoaded } = useAuth()

  if (!isLoaded) return null

  if (!isSignedIn) return <Navigate to="/sign-in" />

  return <Layout />
}

export { Layout, RequireAuth }