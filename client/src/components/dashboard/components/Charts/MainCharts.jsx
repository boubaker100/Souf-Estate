// MainCharts.jsx
import { SectionCards } from "./SectionCards"
import { VisitorsChart } from "./VisitorsChart"

export function MainCharts() {
  return (
    <div className="space-y-8">
      <SectionCards />
      <VisitorsChart />
    </div>
  )
}