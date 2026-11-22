import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { toast } from "sonner";
import apiRequest from "@/lib/apiRequest";

export const SAVED_POSTS_KEY = ["saved-posts"];

// يجلب قائمة الإعلانات المحفوظة للمستخدم الحالي (فقط عند تسجيل الدخول).
export function useSavedPostsQuery() {
  const { isSignedIn } = useAuth();
  return useQuery({
    queryKey: SAVED_POSTS_KEY,
    queryFn: async () => {
      const res = await apiRequest.get("/api/dashboard/saved");
      return res.data?.data || [];
    },
    enabled: isSignedIn,
    staleTime: 30_000,
  });
}

// مجموعة معرّفات الإعلانات المحفوظة — تُستخدم لمعرفة حالة القلب في البطاقات.
export function useSavedPostIds() {
  const { data, isLoading } = useSavedPostsQuery();
  const savedIds = useMemo(() => new Set((data || []).map((p) => p.id)), [data]);
  return { savedIds, isLoading };
}

// تبديل الحفظ/الإلغاء مع تحديث متفائل وإبطال للكاش لمزامنة كل الصفحات.
export function useToggleSavedPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (postId) => {
      const res = await apiRequest.post(`/api/dashboard/saved/${postId}`);
      return res.data?.saved;
    },
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: SAVED_POSTS_KEY });
      const previous = queryClient.getQueryData(SAVED_POSTS_KEY);
      queryClient.setQueryData(SAVED_POSTS_KEY, (old = []) =>
        old.includes(postId)
          ? old.filter((id) => id !== postId)
          : [...old, postId]
      );
      return { previous };
    },
    onError: (err, _postId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(SAVED_POSTS_KEY, context.previous);
      }
      if (err?.response?.status === 403) {
        toast.error(err?.response?.data?.message || "لا يمكنك حفظ إعلانك الخاص");
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: SAVED_POSTS_KEY });
    },
  });
}