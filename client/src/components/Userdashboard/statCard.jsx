export default function StatCard({ title, value }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
      <p className="text-gray-400 text-sm">{title}</p>
      <h3 className="text-2xl font-bold mt-2">{value}</h3>
    </div>
  );
}
