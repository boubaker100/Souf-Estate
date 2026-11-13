import { useState, useEffect } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { toast } from "sonner";
import { formatDistanceToNowStrict } from "date-fns";
import { ar } from "date-fns/locale";
import { MessageCircle, Trash2, CornerDownLeft } from "lucide-react";
import apiRequest from "@/lib/apiRequest";
import { Link } from "react-router-dom";

// عدد مستويات الردود المسموح عرضها بمسافة بادئة متزايدة قبل تسطيح الباقي،
// لتفادي تعليقات تنزلق خارج الشاشة على الهاتف عند تداخل عميق جداً
const MAX_INDENT_DEPTH = 3;

const insertLocalComment = (tree, comment, parentId) => {
  if (!parentId) return [...tree, { ...comment, replies: [] }];
  return tree.map((c) =>
    c.id === parentId
      ? { ...c, replies: [...(c.replies || []), { ...comment, replies: [] }] }
      : { ...c, replies: insertLocalComment(c.replies || [], comment, parentId) }
  );
};

export default function CommentSection({ postId }) {
  const { isSignedIn, userId } = useAuth();
  const { user } = useUser();

  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null); // id التعليق الجاري الرد عليه
  const [replyText, setReplyText] = useState("");

  const fetchComments = async () => {
    try {
      const res = await apiRequest.get(`/api/posts/${postId}/comments`);
      setComments(res.data?.data || []);
    } catch (err) {
      toast.error("حدث خطأ في تحميل التعليقات، يرجى المحاولة مرة أخرى");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (postId) fetchComments();
  }, [postId]);

  const handleSubmit = async (e, parentId = null) => {
    e.preventDefault();
    const content = parentId ? replyText : newComment;
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      const res = await apiRequest.post(`/api/posts/${postId}/comments`, {
        content: content.trim(),
        parentId,
      });
      if (parentId) {
        setReplyText("");
        setReplyingTo(null);
      } else {
        setNewComment("");
      }
      // نُعلّم التعليق الذي أنشأه المستخدم للتو بـ isOwn محلياً، لأن مسار
      // GET العام لا يضمن حساب isOwn (راجع تعليق getComments في الباك-إند).
      // هذا يجعل زر الحذف يظهر فوراً دون انتظار إعادة تحميل الصفحة.
      const newlyCreated = { ...res.data?.data, isOwn: true };
      setComments((prev) => insertLocalComment(prev, newlyCreated, parentId));
    } catch (err) {
      toast.error("حدث خطأ في نشر التعليق، يرجى المحاولة مرة أخرى");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await apiRequest.delete(`/api/posts/${postId}/comments/${commentId}`);
      await fetchComments();
    } catch (err) {
      toast.error("حدث خطأ في حذف التعليق، يرجى المحاولة مرة أخرى");
    }
  };

  const countAll = (list) =>
    list.reduce((sum, c) => sum + 1 + countAll(c.replies || []), 0);

  return (
    <div className="mt-10 pt-8 border-t border-gray-100">
      <h3 className="flex items-center gap-2 text-xl font-bold text-gray-800 mb-6">
        <MessageCircle className="w-5 h-5 text-gray-500" />
        التعليقات {comments.length > 0 && `(${countAll(comments)})`}
      </h3>

      {/* نموذج إضافة تعليق رئيسي */}
      {isSignedIn ? (
        <form onSubmit={(e) => handleSubmit(e)} className="mb-8">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="اكتب تعليقك حول هذا العقار..."
            rows={3}
            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 resize-none"
          />
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="bg-gray-900 text-white text-sm font-bold px-5 py-2 rounded-lg hover:bg-gray-800 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? "جاري الإرسال..." : "نشر التعليق"}
            </button>
          </div>
        </form>
      ) : (
    <div className="mb-8 bg-gray-50 border border-gray-100 rounded-xl p-4 text-center text-sm text-gray-500">
          يجب{" "}
          <Link to="/sign-in" className="font-bold text-gray-800 underline hover:text-gray-900">
            تسجيل الدخول
          </Link>{" "}
          لإضافة تعليق
        </div>
      )}

      {/* قائمة التعليقات */}
      {loading ? (
        <p className="text-sm text-gray-400">جاري تحميل التعليقات...</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-gray-400">لا توجد تعليقات بعد، كن أول من يعلّق.</p>
      ) : (
        <div className="space-y-5">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              depth={0}
              currentUserId={userId}
              isSignedIn={isSignedIn}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              replyText={replyText}
              setReplyText={setReplyText}
              onReplySubmit={handleSubmit}
              onDelete={handleDelete}
              submitting={submitting}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CommentItem({
  comment,
  depth,
  currentUserId,
  isSignedIn,
  replyingTo,
  setReplyingTo,
  replyText,
  setReplyText,
  onReplySubmit,
  onDelete,
  submitting,
}) {
  const isOwn = comment.isOwn === true;
  const indent = Math.min(depth, MAX_INDENT_DEPTH);
  const timeLabel = comment.createdAt
    ? formatDistanceToNowStrict(new Date(comment.createdAt), { addSuffix: true, locale: ar })
    : "";

  return (
    <div style={{ marginRight: indent * 24 }}>
      <div className="flex items-start gap-3">
        <img
          src={comment.user?.avatar || "https://placehold.co/100x100?text=User"}
          alt={comment.user?.username}
          className="w-9 h-9 rounded-full object-cover flex-shrink-0 border border-gray-100"
        />
        <div className="flex-1 min-w-0">
          <div className="bg-gray-50 rounded-2xl px-4 py-2.5 border border-gray-100">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-bold text-gray-800">{comment.user?.username || "مستخدم"}</span>
              <span className="text-[11px] text-gray-400">{timeLabel}</span>
            </div>
            <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap break-words">
              {comment.content}
            </p>
          </div>

          <div className="flex items-center gap-4 mt-1.5 px-1">
            {isSignedIn && (
              <button
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-800 transition"
              >
                <CornerDownLeft className="w-3.5 h-3.5" />
                رد
              </button>
            )}
            {isOwn && (
              <button
                onClick={() => onDelete(comment.id)}
                className="flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-700 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                حذف
              </button>
            )}
          </div>

          {/* نموذج الرد */}
          {replyingTo === comment.id && (
            <form
              onSubmit={(e) => onReplySubmit(e, comment.id)}
              className="mt-2"
            >
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`الرد على ${comment.user?.username || "مستخدم"}...`}
                rows={2}
                className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 resize-none"
                autoFocus
              />
              <div className="flex justify-end gap-2 mt-1.5">
                <button
                  type="button"
                  onClick={() => setReplyingTo(null)}
                  className="text-xs font-semibold text-gray-500 px-3 py-1.5"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting || !replyText.trim()}
                  className="bg-gray-900 text-white text-xs font-bold px-4 py-1.5 rounded-lg hover:bg-gray-800 transition disabled:opacity-40"
                >
                  إرسال الرد
                </button>
              </div>
            </form>
          )}

          {/* الردود المتداخلة */}
          {comment.replies?.length > 0 && (
            <div className="mt-3 space-y-3">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  depth={depth + 1}
                  currentUserId={currentUserId}
                  isSignedIn={isSignedIn}
                  replyingTo={replyingTo}
                  setReplyingTo={setReplyingTo}
                  replyText={replyText}
                  setReplyText={setReplyText}
                  onReplySubmit={onReplySubmit}
                  onDelete={onDelete}
                  submitting={submitting}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}