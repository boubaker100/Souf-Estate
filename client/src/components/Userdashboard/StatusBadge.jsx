export default function StatusBadge({ status }) {
  const map = {
    pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
    approved: { label: "Approved", className: "bg-green-100 text-green-800" },
    rejected: { label: "Rejected", className: "bg-red-100 text-red-800" },
  };
  const s = map[status] || { label: status || "Approved", className: "bg-green-100 text-green-800" };
  return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${s.className}`}>{s.label}</span>;
}
