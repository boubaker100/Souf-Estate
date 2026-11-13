import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiRequest from "../../../lib/apiRequest";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useState } from "react";
import AdminPagination from "./Pagination";
import useDataTable from "@/hooks/useDataTable";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

// تحويل التاريخ إلى صيغة "قبل يوم / أسبوع / شهر"
function timeAgo(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  const day = 1000 * 60 * 60 * 24;

  if (diff < day) return "اليوم";
  if (diff < day * 2) return "أمس";
  if (diff < day * 7) return `${Math.floor(diff / day)} أيام`;
  if (diff < day * 30) return `${Math.floor(diff / (day * 7))} أسبوع`;
  if (diff < day * 365) return `${Math.floor(diff / (day * 30))} شهر`;
  return `${Math.floor(diff / (day * 365))} سنة`;
}

const LIMIT = 10;

export default function UsersTable() {
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState(null);
  const [IsLoading]=useState(true);

  const {
    data,
    isLoading,
    page,
    setPage,
    setFilter,
  } = useDataTable({
    queryKey: "admin-users",
    endpoint: "/admin/users",
    initialLimit: LIMIT,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiRequest.delete(`/admin/users/${id}`),
    onMutate: async (userId) => {
      await queryClient.cancelQueries({ queryKey: ["admin-users"] });
      const previousData = queryClient.getQueriesData({ queryKey: ["admin-users"] });
      queryClient.setQueriesData({ queryKey: ["admin-users"] }, (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          users: oldData.users.filter((user) => user.id !== userId),
        };
      });
      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
    },
    onSuccess: () => {
      toast.success("تم حذف المستخدم بنجاح");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });



  const users = data?.users ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <Card className="m-6">
      <CardHeader>
        <CardTitle>إدارة المستخدمين</CardTitle>
      </CardHeader>

      <CardContent>
        {/* الفلاتر */}
        <div className="flex gap-4 mb-4">
          <select
            className="border rounded px-2 py-1"
            onChange={(e) => setFilter("minPosts", e.target.value)}
          >
            <option value="">فلترة حسب عدد الإعلانات</option>
            <option value="1">أكثر من 1 إعلان</option>
            <option value="5">أكثر من 5 إعلانات</option>
            <option value="10">أكثر من 10 إعلانات</option>
          </select>

          <select
            className="border rounded px-2 py-1"
            onChange={(e) => setFilter("sort", e.target.value)}
          >
            <option value="created_desc">تاريخ التسجيل: الأحدث أولاً</option>
            <option value="created_asc">تاريخ التسجيل: الأقدم أولاً</option>
          </select>
        </div>

        <div className="overflow-x-auto w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>المستخدم</TableHead>
                <TableHead>عدد الإعلانات</TableHead>
                <TableHead>تاريخ التسجيل</TableHead>
                <TableHead>آخر تسجيل دخول</TableHead>
                <TableHead>الأجراء</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
  {isLoading
    ? // أثناء التحميل، نعرض Skeletons
      Array.from({ length: LIMIT }).map((_, index) => (
        <TableRow key={index}>
          <TableCell>
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-full" /> {/* صورة */}
              <div className="flex flex-col gap-1">
                <Skeleton className="h-4 w-24" /> {/* اسم */}
                <Skeleton className="h-3 w-32" /> {/* ايميل */}
              </div>
            </div>
          </TableCell>

          <TableCell>
            <Skeleton className="h-4 w-12" /> {/* عدد الإعلانات */}
          </TableCell>

          <TableCell>
            <Skeleton className="h-4 w-24" /> {/* تاريخ التسجيل */}
          </TableCell>

          <TableCell>
            <Skeleton className="h-4 w-24" /> {/* آخر تسجيل دخول */}
          </TableCell>

          <TableCell className="text-right ">
            <Skeleton className="h-4 w-10 rounded-md" /> {/* زر الحذف */}
          </TableCell>
        </TableRow>
      ))
    : users.length === 0
    ? (
      <TableRow>
        <TableCell colSpan={5} className="text-center py-6">
          لا يوجد مستخدمين
        </TableCell>
      </TableRow>
    )
    : users.map((user) => (
        <TableRow key={user.id}>
          <TableCell>
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user.avatar} />
                <AvatarFallback>{user.username?.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <p className="font-medium">{user.username}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
          </TableCell>

          <TableCell className="relative left-4" >{user._count?.posts ?? 0}</TableCell>
          <TableCell>{new Date(user.createdAt).toLocaleDateString("en-US")}</TableCell>
          <TableCell>{timeAgo(user.lastLoginAt)}</TableCell>

          <TableCell className="">
            <Button
              className="cursor-pointer"
              variant="destructive"
              size="sm"
              onClick={() => setSelectedUser(user)}
            >
              حذف
            </Button>
          </TableCell>
        </TableRow>
      ))
  }
</TableBody>
          </Table>
          </div>
        </CardContent>

      <AdminPagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      {/* مودال التأكيد */}
      {selectedUser && (
        <ConfirmModal
          isOpen={!!selectedUser}
          onCancel={() => setSelectedUser(null)}
          onConfirm={() => {
            if (!selectedUser) return;
            deleteMutation.mutate(selectedUser.id);
            setSelectedUser(null);
          }}
          title="تأكيد حذف المستخدم"
          description={`هل أنت متأكد من حذف ${selectedUser.username}؟`}
        />
      )}
    </Card>
  );
}