export default function EmptyState({ title = "لا توجد إعلانات", subtitle = "لا يوجد شيء لعرضه حالياً" }) {
  return (
    <div className="flex flex-col items-center justify-center p-10 bg-white dark:bg-gray-900 rounded-2xl shadow">
      {/* Simple SVG illustration */}
      <svg width="160" height="120" viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="20" width="120" height="80" rx="8" fill="#EFF6FF" />
        <path d="M22 34H106" stroke="#93C5FD" strokeWidth="3" strokeLinecap="round" />
        <path d="M22 52H82" stroke="#93C5FD" strokeWidth="3" strokeLinecap="round" />
        <circle cx="138" cy="36" r="18" fill="#C7F9E9" />
        <path d="M130 32L146 40" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />
      </svg>

      <h3 className="mt-6 text-lg font-semibold">{title}</h3>
      <p className="text-sm text-gray-500 mt-2 text-center max-w-xs">{subtitle}</p>
    </div>
  );
}
