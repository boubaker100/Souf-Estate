import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import { Suspense } from "react";

// ================= LOADERS =================
import { singlePageLoader } from "./lib/loaders";
import MyPostsPage from "./routes/UserDashboard/MyPostPage";
import AdminRoute from "./routes/AdminDashboard/AdminRoute";
import EditPostPage from "./routes/UserDashboard/EditPostPage";
import { Layout } from "./routes/layout/layout";
import HomePage from "./routes/homePage/homePage";
import Account from "./routes/account/Account";
import NewPostPage from "./routes/UserDashboard/newPostPage";
import SinglePage from "./routes/singlePage/singlePage";
import SignInPage from "./routes/auth/signInPage";
import SignUpPage from "./routes/auth/signUpPage";
import Page from "./components/dashboard/page";
import UsersTable from "./components/dashboard/components/UsersTable";
import DashboardLayout from "./routes/UserDashboard/DashboardLayout";
import { MainCharts } from "./components/dashboard/components/Charts/MainCharts";
import { PostsTable } from "./components/dashboard/components/postTable";
import DocumentsGuidePage from "./components/navbar/DocumentsGuidePage";
import ContactPage from "./components/contacts/ContactPage";

// ================= PROTECTED WRAPPER =================
function Protected({ children }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        {/* سينقله لصفحة تسجيل الدخول تلقائياً إذا لم يكن مسجلاً */}
        <RedirectToSignIn /> 
      </SignedOut>
    </>
  );
}

function App() {
  const router = createBrowserRouter([

    // ================= ADMIN =================
    {
      path: "/admin",
      element: (
        <AdminRoute>
          <Page/>
        </AdminRoute>
      ),
      children: [
        { path: "users", element: <UsersTable /> },
        { path: "analytics", element: <MainCharts/> },
        { path: "posts", element: <PostsTable/> } 
      ],
    },

    // ================= USER DASHBOARD (تمت حمايته هنا) =================
    {
      path: "/dashboard",
      element: (
        <Protected>
          <DashboardLayout />
        </Protected>
      ),
      children: [
        { index: true, element: <MyPostsPage/> },
        { path: "my-posts", element: <MyPostsPage /> },
        { path: "edit/:id", element: <EditPostPage /> },
        { path: "add", element: <NewPostPage/> }, // الآن أصبح محمي تلقائياً!
      ],
    },

    // ================= MAIN SITE =================
    {
      path: "/",
      element: <Layout />,
      children: [
        { index: true, element: <HomePage /> },
        {
          path: ":id",
          element: <SinglePage/>,
          loader: singlePageLoader,
        },
        { path: "sign-in/*", element: <SignInPage /> },
        { path: "sign-up/*", element: <SignUpPage /> },

           // صفحة دليل الوثائق والإجراءات القانونية — عامة، لا تحتاج تسجيل دخول
        { path: "documents-guide", element: <DocumentsGuidePage /> },
            // صفحة التواصل — عامة، تطابق مسار "/contact" الموجود أصلاً في navLinks بالنافبار
        { path: "contact", element: <ContactPage /> },
 
        
        // ================= ACCOUNT (تمت حمايته هنا) =================
        {
          path: "account",
          element: (
            <Protected>
              <Account />
            </Protected>
          ),
        },
      ],
    },
  ]);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RouterProvider router={router} />
    </Suspense>
  );
}

export default App;