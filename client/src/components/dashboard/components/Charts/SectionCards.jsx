// SectionCards.jsx
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import CountUp from "react-countup"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import apiRequest from "@/lib/apiRequest"

// ======== Helper ========
function formatRangeLabel(range) {
  if (!range) return ""
  const value = parseInt(range)
  const type = range.slice(-1)
  if (type !== "d") return ""
  if (value % 365 === 0) {
    const years = value / 365
    return `Last ${years} Year${years > 1 ? "s" : ""}`
  }
  if (value % 30 === 0 && value >= 90) {
    const months = value / 30
    return `Last ${months} Months`
  }
  return `Last ${value} Days`
}

// ======== StatCard ========
function StatCard({ title, value = 0, growth = 0, range }) {
  const isPositive = growth > 0
  const isNeutral = growth === 0

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 relative">
      <CardHeader>
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums">
          <CountUp end={value} duration={1} separator="," />
        </CardTitle>

        {typeof growth === "number" && (
          <CardAction>
            <Badge
              variant="outline"
              className={
                isNeutral
                  ? "text-gray-600 border-gray-200"
                  : isPositive
                  ? "text-green-600 border-green-200"
                  : "text-red-600 border-red-200"
              }
            >
              {isPositive
                ? <IconTrendingUp className="size-4 mr-1" />
                : <IconTrendingDown className="size-4 mr-1" />
              }
              {Math.abs(growth).toFixed(1)}%
            </Badge>
          </CardAction>
        )}
      </CardHeader>

      {range && (
        <CardFooter className="text-xs text-muted-foreground">
          <p>Compared to previous {formatRangeLabel(range)}</p>
        </CardFooter>
      )}
    </Card>
  )
}

// ======== SectionCards ========
export function SectionCards() {
  const [range, setRange] = useState("30d")

  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: ["admin-dashboard", range], // ✅ موحّد مع VisitorsChart
    queryFn: async () => {
      const res = await apiRequest.get(`/api/admin/dashboard?range=${range}`)
      return res.data
    },
    keepPreviousData: true,
    staleTime: 1000 * 60 * 2,
  })

  const overview = data?.overview // ✅ الوصول الصحيح للبنية الجديدة

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
            </CardHeader>
            <CardFooter>
              <Skeleton className="h-4 w-40" />
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="px-4 text-red-500">
        Something went wrong: {error?.message}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* ===== Range Selector ===== */}
      <div className="flex justify-end px-4 lg:px-6 items-center gap-3">
        {isFetching && (
          <span className="text-xs text-muted-foreground animate-pulse">
            Updating...
          </span>
        )}
        <Select value={range} onValueChange={setRange}>
          <SelectTrigger className="w-35" aria-label="Select range">
            <SelectValue placeholder="اختر المدة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="90d">Last 3 Months</SelectItem>
            <SelectItem value="180d">Last 6 Months</SelectItem>
            <SelectItem value="270d">Last 9 Months</SelectItem>
            <SelectItem value="365d">Last 1 Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ===== Cards ===== */}
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        <StatCard title="Total Users"  value={overview?.totalUsers}  growth={overview?.usersGrowth}  range={range} />
        <StatCard title="Total Posts"  value={overview?.totalPosts}  growth={overview?.postsGrowth}  range={range} />
        <StatCard title="Rent Posts"   value={overview?.rentPosts}   growth={overview?.rentGrowth}   range={range} />
        <StatCard title="Buy Posts"    value={overview?.buyPosts}    growth={overview?.buyGrowth}    range={range} />
      </div>
    </div>
  )
}