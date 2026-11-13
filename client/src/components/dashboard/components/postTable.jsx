"use client"

import { useMemo, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { DataGrid } from "@/components/reui/data-grid/data-grid"
import { DataGridColumnHeader } from "@/components/reui/data-grid/data-grid-column-header"
import { DataGridPagination } from "@/components/reui/data-grid/data-grid-pagination"
import { DataGridTable } from "@/components/reui/data-grid/data-grid-table"
import {
  getCoreRowModel, getFilteredRowModel,
  getPaginationRowModel, getSortedRowModel, useReactTable,
} from "@tanstack/react-table"
import { Badge } from "@/components/reui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Card, CardFooter, CardHeader, CardTitle, CardAction } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { IconTrash, IconAlertTriangle, IconX } from "@tabler/icons-react"
import apiRequest from "@/lib/apiRequest"
import { toast } from "sonner"

// ─── Constants ───────────────────────────────────────────────────────────────

const MUNICIPALITIES = [
  "الوادي","قمار","الرقيبة","البياضة","الدبيلة","حساني عبد الكريم",
  "الرباح","الطريفاوي","ورماس","سيدي عون","تماسين","الحمراية",
  "النخلة","أم الطيور","جامعة","طالب العربي","المقرن","الزقم",
]

const TYPE_LABELS = { rent: "كراء", buy: "بيع" }
const PROPERTY_LABELS = {
  apartment: "شقة", house: "منزل", land: "أرض",
  villa: "فيلا", commercial: "تجاري",
}
const STATUS_VARIANT = { ACTIVE: "success-outline", INACTIVE: "warning-outline" }
const STATUS_LABELS  = { ACTIVE: "نشط", INACTIVE: "معطّل" }

const SORT_OPTIONS = [
  { value: "created_desc", label: "الأحدث أولاً" },
  { value: "created_asc",  label: "الأقدم أولاً" },
  { value: "price_desc",   label: "السعر: الأعلى" },
  { value: "price_asc",    label: "السعر: الأدنى" },
]

const DEFAULT_FILTERS = {
  sort: "created_desc", type: "all",
  property: "all", city: "all", status: "all",
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatPrice = (price) =>
  !price && price !== 0
    ? "—"
    : new Intl.NumberFormat("ar-DZ").format(price) + " دج"

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-GB", {
    year: "numeric", month: "2-digit", day: "2-digit",
  })

// ─── Confirm Delete Dialog ───────────────────────────────────────────────────

function ConfirmDeleteDialog({ open, onConfirm, onCancel, count = 1 }) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <IconAlertTriangle className="text-destructive size-5" />
            تأكيد الحذف
          </AlertDialogTitle>
          <AlertDialogDescription>
            {count > 1
              ? `سيتم حذف ${count} منشور نهائياً. هذا الإجراء لا يمكن التراجع عنه.`
              : "سيتم حذف هذا المنشور نهائياً. هذا الإجراء لا يمكن التراجع عنه."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>إلغاء</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive hover:bg-destructive/90"
          >
            حذف
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// ─── Row Actions — زر الحذف فقط ──────────────────────────────────────────────

function RowActions({ post, onDelete }) {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="cursor-pointer size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={(e) => { e.stopPropagation(); onDelete({ id: post.id }) }}
          >
            <IconTrash className="size-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">حذف المنشور</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// ─── Filters Bar ─────────────────────────────────────────────────────────────

function FiltersBar({ filters, onChange, onReset, hasActiveFilters }) {
  return (
    <div className="flex flex-wrap items-center gap-2">

      <Select value={filters.sort} onValueChange={(v) => onChange("sort", v)}>
        <SelectTrigger className="h-8 w-full sm:w-36 text-xs">
          <SelectValue placeholder="الترتيب" />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.type} onValueChange={(v) => onChange("type", v)}>
        <SelectTrigger className="h-8 w-full sm:w-28 text-xs">
          <SelectValue placeholder="النوع" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all"  className="text-xs">كل الأنواع</SelectItem>
          <SelectItem value="rent" className="text-xs">كراء</SelectItem>
          <SelectItem value="buy"  className="text-xs">بيع</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.property} onValueChange={(v) => onChange("property", v)}>
        <SelectTrigger className="h-8 w-full sm:w-32 text-xs">
          <SelectValue placeholder="نوع العقار" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all"        className="text-xs">كل العقارات</SelectItem>
          <SelectItem value="apartment"  className="text-xs">شقة</SelectItem>
          <SelectItem value="house"      className="text-xs">منزل</SelectItem>
          <SelectItem value="land"       className="text-xs">أرض</SelectItem>
          <SelectItem value="villa"      className="text-xs">فيلا</SelectItem>
          <SelectItem value="commercial" className="text-xs">تجاري</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.city} onValueChange={(v) => onChange("city", v)}>
        <SelectTrigger className="h-8 w-full sm:w-36 text-xs">
          <SelectValue placeholder="الدائرة" />
        </SelectTrigger>
        <SelectContent className="max-h-60">
          <SelectItem value="all" className="text-xs">كل الدوائر</SelectItem>
          {MUNICIPALITIES.map((m) => (
            <SelectItem key={m} value={m} className="text-xs">{m}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.status} onValueChange={(v) => onChange("status", v)}>
        <SelectTrigger className="h-8 w-full sm:w-28 text-xs">
          <SelectValue placeholder="الحالة" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all"      className="text-xs">الكل</SelectItem>
          <SelectItem value="ACTIVE"   className="text-xs">نشط</SelectItem>
          <SelectItem value="INACTIVE" className="text-xs">معطّل</SelectItem>
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button
          variant="ghost" size="sm"
          className="h-8 gap-1 text-xs text-muted-foreground hover:text-foreground"
          onClick={onReset}
        >
          <IconX className="size-3.5" />
          إعادة ضبط
        </Button>
      )}
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function PostsTable() {
  const queryClient = useQueryClient()
  const navigate    = useNavigate()

  const [filters, setFilters]           = useState(DEFAULT_FILTERS)
  const [pagination, setPagination]     = useState({ pageIndex: 0, pageSize: 10 })
  const [sorting, setSorting]           = useState([])
  const [columnOrder, setColumnOrder]   = useState([])
  const [deleteTarget, setDeleteTarget] = useState(null)

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS)
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }

  const hasActiveFilters = Object.keys(DEFAULT_FILTERS).some(
    (k) => filters[k] !== DEFAULT_FILTERS[k]
  )

  const queryParams = {
    page: pagination.pageIndex + 1,
    take: pagination.pageSize,
    sort: filters.sort,
    ...(filters.type     !== "all" && { type:     filters.type }),
    ...(filters.property !== "all" && { property: filters.property }),
    ...(filters.city     !== "all" && { city:     filters.city }),
    ...(filters.status   !== "all" && { status:   filters.status }),
  }

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["admin-posts", queryParams],
    queryFn: async () => {
      const params = new URLSearchParams(queryParams).toString()
      const res = await apiRequest.get(`/api/admin/posts?${params}`)
      return res.data
    },
    keepPreviousData: true,
    staleTime: 1000 * 60,
  })

  const posts = data?.posts ?? []
  const total = data?.total  ?? 0

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-posts"] })

  const deleteMutation = useMutation({
    mutationFn: (id) => apiRequest.delete(`/admin/posts/${id}`),
    onSuccess: () => {
      toast.success("تم حذف المنشور بنجاح", {
        description: "تم إزالة الإعلان من قاعدة البيانات.",
      })
      invalidate()
    },
    onError: () => toast.error("فشل حذف المنشور", {
      description: "حدث خطأ، يرجى المحاولة مجدداً.",
    }),
  })

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids) => apiRequest.post("/admin/posts/bulk-delete", { ids }),
    onSuccess: (_, ids) => {
      toast.success(`تم حذف ${ids.length} منشور بنجاح`, {
        description: "تم إزالة المنشورات المحددة.",
      })
      table.resetRowSelection()
      invalidate()
    },
    onError: () => toast.error("فشل الحذف الجماعي", {
      description: "حدث خطأ، يرجى المحاولة مجدداً.",
    }),
  })

  const confirmDelete = () => {
    if (!deleteTarget) return
    if (deleteTarget.ids) bulkDeleteMutation.mutate(deleteTarget.ids)
    else                  deleteMutation.mutate(deleteTarget.id)
    setDeleteTarget(null)
  }

  // ── Columns ──
  const columns = useMemo(() => [

    // Checkbox
    {
      id: "select",
      header: ({ table }) => (
        <input
          type="checkbox"
          className="accent-primary size-4 cursor-pointer"
          checked={table.getIsAllPageRowsSelected()}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          className="accent-primary size-4 cursor-pointer"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          onClick={(e) => e.stopPropagation()}
        />
      ),
      size: 40,
      enableSorting: false, enableHiding: false, enableResizing: false,
    },

    // صورة + عنوان + هاتف — قابل للنقر للانتقال للإعلان
    {
      accessorKey: "title", id: "title",
      header: ({ column }) => (
        <DataGridColumnHeader title="المنشور" visibility column={column} />
      ),
      cell: ({ row }) => {
        const post = row.original
        const img  = post.images?.[0]
        return (
          <button
            type="button"
            className="flex items-center gap-3 text-start transition-opacity hover:opacity-75 cursor-pointer"
            onClick={() => navigate(`/${post.id}`)}
          >
            <div className="bg-muted size-10 shrink-0 overflow-hidden rounded-md">
              {img
                ? <img src={img} alt={post.title} className="size-full object-cover" />
                : <div className="text-muted-foreground flex size-full items-center justify-center text-xs">—</div>
              }
            </div>
            <div className="min-w-0 space-y-0.5">
              <p className="text-foreground truncate text-sm font-medium hover:underline">
                {post.title || "بدون عنوان"}
              </p>
              <p className="text-muted-foreground truncate text-xs">{post.phone}</p>
            </div>
          </button>
        )
      },
      meta: {
        skeleton: (
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-md" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ),
      },
      size: 230,
      enableSorting: false, enableHiding: false, enableResizing: true,
    },

    // الدائرة
    {
      accessorKey: "city", id: "city",
      header: ({ column }) => (
        <DataGridColumnHeader title="الدائرة" visibility column={column} />
      ),
      cell: ({ row }) => (
        <span className="text-sm">{row.original.city || "—"}</span>
      ),
      meta: { skeleton: <Skeleton className="h-5 w-20" /> },
      size: 110,
      enableSorting: false,
    },

    // نوع الإعلان
    {
      accessorKey: "type", id: "type",
      header: ({ column }) => (
        <DataGridColumnHeader title="النوع" visibility column={column} />
      ),
      cell: ({ row }) => (
        <Badge variant={row.original.type === "rent" ? "info-outline" : "success-outline"}>
          {TYPE_LABELS[row.original.type] ?? row.original.type}
        </Badge>
      ),
      meta: { skeleton: <Skeleton className="h-6 w-14" /> },
      size: 85,
      enableSorting: false, enableResizing: false,
    },

    // نوع العقار
    {
      accessorKey: "property", id: "property",
      header: ({ column }) => (
        <DataGridColumnHeader title="العقار" visibility column={column} />
      ),
      cell: ({ row }) => (
        <span className="text-sm">
          {PROPERTY_LABELS[row.original.property] ?? row.original.property}
        </span>
      ),
      meta: { skeleton: <Skeleton className="h-5 w-16" /> },
      size: 90,
      enableSorting: false,
    },

    // السعر
    {
      accessorKey: "price", id: "price",
      header: ({ column }) => (
        <DataGridColumnHeader title="السعر" visibility column={column} />
      ),
      cell: ({ row }) => (
        <span className="tabular-nums whitespace-nowrap text-sm font-medium">
          {formatPrice(row.original.price)}
        </span>
      ),
      meta: { skeleton: <Skeleton className="h-5 w-28" /> },
      size: 140,
      enableSorting: false, enableResizing: false,
    },

    // الحالة
    {
      accessorKey: "status", id: "status",
      header: ({ column }) => (
        <DataGridColumnHeader title="الحالة" visibility column={column} />
      ),
      cell: ({ row }) => {
        const s = row.original.status
        return (
          <Badge variant={STATUS_VARIANT[s] ?? "outline"}>
            {STATUS_LABELS[s] ?? s}
          </Badge>
        )
      },
      meta: { skeleton: <Skeleton className="h-6 w-16" /> },
      size: 90,
      enableSorting: false, enableResizing: false,
    },

    // تاريخ النشر
    {
      accessorKey: "createdAt", id: "createdAt",
      header: ({ column }) => (
        <DataGridColumnHeader title="تاريخ النشر" visibility column={column} />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground whitespace-nowrap text-xs">
          {formatDate(row.original.createdAt)}
        </span>
      ),
      meta: { skeleton: <Skeleton className="h-4 w-28" /> },
      size: 130,
      enableSorting: false, enableResizing: false,
    },

    // حذف فقط
    {
      id: "actions",
      header: () => null,
      cell: ({ row }) => (
        <RowActions
          post={row.original}
          onDelete={(target) => setDeleteTarget(target)}
        />
      ),
      meta: { skeleton: <Skeleton className="size-8 rounded-md" /> },
      size: 60,
      enableSorting: false, enableHiding: false, enableResizing: false,
    },

  ], [navigate])

  const table = useReactTable({
    columns,
    data: posts,
    pageCount: Math.ceil(total / pagination.pageSize),
    getRowId: (row) => row.id,
    state: { pagination, sorting, columnOrder },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onColumnOrderChange: setColumnOrder,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    manualSorting: true,
  })

  const selectedIds = Object.keys(table.getState().rowSelection)

  return (
    <>
      <DataGrid
        table={table}
        recordCount={total}
        isLoading={isLoading}
        tableClassNames={{ edgeCell: "px-5" }}
        tableLayout={{ columnsPinnable: true, columnsMovable: true, columnsVisibility: true }}
      >
        <Card className="w-full gap-3 py-3.5">

          <CardHeader className="flex flex-col gap-3 px-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle>المنشورات</CardTitle>
                {isFetching && !isLoading && (
                  <span className="text-muted-foreground animate-pulse text-xs">
                    جاري التحديث...
                  </span>
                )}
              </div>
              <CardAction >
                {selectedIds.length > 0 && (
                  <Button
                    variant="destructive" size="sm" className="h-8 relative left-5 cursor-pointer gap-3"
                    onClick={() => setDeleteTarget({ ids: selectedIds })}
                  >
                    <IconTrash className="size-3.5" />
                    حذف ({selectedIds.length})
                  </Button>
                )}
              </CardAction>
            </div>

            <FiltersBar
              filters={filters}
              onChange={handleFilterChange}
              onReset={handleReset}
              hasActiveFilters={hasActiveFilters}
            />
          </CardHeader>

          <div className="w-full border-y">
            <ScrollArea>
              <DataGridTable />
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>

          <CardFooter className="border-none bg-transparent! px-3.5 py-0">
            <DataGridPagination />
          </CardFooter>

        </Card>
      </DataGrid>

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        count={deleteTarget?.ids?.length ?? 1}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  )
}