import { useQuery } from "@tanstack/react-query"
import { useMemo, useState } from "react"
import { AreaChart, Area, CartesianGrid, XAxis } from "recharts"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import apiRequest from "@/lib/apiRequest"

const chartConfig = {
  desktop: { label: "Desktop", color: "var(--chart-1)" },
  mobile:  { label: "Mobile",  color: "var(--chart-2)" },
}

export function VisitorsChart() {
  const [range, setRange] = useState("30d")

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-dashboard", range], // ✅ نفس queryKey → يشارك cache مع SectionCards
    queryFn: async () => {
      const res = await apiRequest.get(`/api/admin/dashboard?range=${range}`)
      return res.data
    },
    keepPreviousData: true,
    staleTime: 1000 * 60 * 2,
  })

  // ===== تجهيز بيانات الشارت =====
  const formattedData = useMemo(() => {
    if (!data?.charts?.visitorsPerDay) return []

    const map = {}
    data.charts.visitorsPerDay.forEach((item) => {
      const date   = item._id.date
      const device = item._id.device || "desktop"
      if (!map[date]) map[date] = { date }
      map[date][device] = item.count
    })

    return Object.values(map).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    )
  }, [data])

  const totalVisitors = data?.overview?.totalVisitors ?? 0 // ✅ overview
  const returning     = data?.overview?.returning     ?? 0 // ✅ overview

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Skeleton className="h-64 w-full rounded-xl" />
        </CardContent>
      </Card>
    )
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="text-red-500">
          Failed to load visitors data
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="pt-3">
      <CardHeader className="flex justify-between">
        <div>
          <CardTitle>زوار الموقع</CardTitle>
          <p className="mt-2 text-sm">
            إجمالي الزوار: <strong>{totalVisitors}</strong>
          </p>
          <p className="text-sm">
            الزوار العائدين: <strong>{returning}</strong>
          </p>
        </div>

        <Select value={range} onValueChange={setRange}>
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder="اختر المدة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">7 أيام</SelectItem>
            <SelectItem value="30d">30 يوم</SelectItem>
            <SelectItem value="90d">90 يوم</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <AreaChart data={formattedData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(value) =>
                new Date(value).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }
            />
            <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
            <Area dataKey="desktop" type="monotone" stroke="var(--chart-1)" fillOpacity={0.2} />
            <Area dataKey="mobile"  type="monotone" stroke="var(--chart-2)" fillOpacity={0.2} />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}