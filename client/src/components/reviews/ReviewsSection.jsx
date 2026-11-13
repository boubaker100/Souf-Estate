import { useState } from "react";

function ReviewsSection({ postId, reviews = [] }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    await fetch(`/api/posts/${postId}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, comment }),
    });

    window.location.reload();
  };

  return (
    <div className="bg-white dark:bg-gray-950 p-6 rounded-2xl shadow border">
      <h2 className="text-xl font-bold mb-6">⭐ التقييمات</h2>

      {/* عرض التقييمات */}
      <div className="space-y-4 mb-8">
        {reviews.length === 0 && (
          <p className="text-gray-400">لا توجد تقييمات بعد</p>
        )}

        {reviews.map((r) => (
          <div key={r.id} className="border-b pb-4">
            <div className="flex justify-between">
              <p className="font-semibold">{r.user.username}</p>
              <p className="text-yellow-500">⭐ {r.rating}/5</p>
            </div>
            <p className="text-gray-600 mt-2">{r.comment}</p>
          </div>
        ))}
      </div>

      {/* إضافة تقييم */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <select
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          className="w-full border p-2 rounded-lg"
        >
          {[1,2,3,4,5].map(n => (
            <option key={n} value={n}>{n} نجوم</option>
          ))}
        </select>

        <textarea
          placeholder="اكتب تعليقك..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full border p-3 rounded-lg"
        />

        <button className="bg-indigo-600 text-white px-6 py-2 rounded-xl">
          إرسال التقييم
        </button>
      </form>
    </div>
  );
}

export default ReviewsSection;
