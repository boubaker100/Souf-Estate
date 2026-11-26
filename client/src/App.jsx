import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import { Suspense, lazy } from "react";

// ================= LOADERS =================
import { singlePageLoader } from "./lib/loaders";
import { Layout } from "./routes/layout/layout";
import HomePage from "./routes/homePage/homePage";

// ================= LAZY ROUTES (Code Splitting) =================
const AdminRoute = lazy(() => import("./routes/AdminDashboard/AdminRoute"));
const Page = lazy(() => import("./components/dashboard/page"));
const UsersTable = lazy(() => import("./components/dashboard/components/UsersTable"));
const MainCharts = lazy(() => import("./components/dashboard/components/Charts/MainCharts"));
const PostsTable = lazy(() => import("./components/dashboard/components/postTable"));

const DashboardLayout = lazy(() => import("./routes/UserDashboard/DashboardLayout"));
const MyPostsPage = lazy(() => import("./routes/UserDashboard/MyPostPage"));
const SavedPostsPage = lazy(() => import("./routes/UserDashboard/SavedPostsPage"));
const EditPostPage = lazy(() => import("./routes/UserDashboard/EditPostPage"));
const NewPostPage = lazy(() => import("./routes/UserDashboard/newPostPage"));

const SinglePage = lazy(() => import("./routes/singlePage/singlePage"));
const SignInPage = lazy(() => import("./routes/auth/signInPage"));
const SignUpPage = lazy(() => import("./routes/auth/signUpPage"));
const Account = lazy(() => import("./routes/account/Account"));
const DocumentsGuidePage = lazy(() => import("./components/navbar/DocumentsGuidePage"));
const ContactPage = lazy(() => import("./components/contacts/ContactPage"));

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
        { path: "saved", element: <SavedPostsPage /> },
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
  ], {
    future: {
      v7_startTransition: true,
    },
  });

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RouterProvider router={router} />
    </Suspense>
  );
}

export default App;