import { Await, useLoaderData } from "react-router-dom";
import { Suspense } from "react";

function OverviewPage() {
  const data = useLoaderData();

  return (
    <Suspense fallback={<p>Loading...</p>}>
      <Await resolve={data.postResponse}>
        {(postResponse) => {
          const { userPosts, savedPosts } = postResponse.data;

          return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard title="Total Posts" value={userPosts.length} />
              <StatCard title="Saved Posts" value={savedPosts.length} />
              <StatCard title="Total Views" value="—" />
            </div>
          );
        }}
      </Await>
    </Suspense>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow">
      <h3 className="text-gray-500 text-sm">{title}</h3>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}

export default OverviewPage;
