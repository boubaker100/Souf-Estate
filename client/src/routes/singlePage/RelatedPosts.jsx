import DashboardCard from "@/components/Userdashboard/DashboardCard";
import { useEffect, useState } from "react";

function RelatedPosts({ postId }) {
  const [related, setRelated] = useState([]);

  useEffect(() => {
    fetch(`/api/posts/related/${postId}`)
      .then(res => res.json())
      .then(data => setRelated(data));
  }, [postId]);

  if (!related.length) return null;

  return (
    <div className="mt-12">
      <h2 className="text-xl font-bold mb-6">
        عقارات مشابهة في نفس المدينة
      </h2>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {related.map(post => (
          <DashboardCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}

export default RelatedPosts;
