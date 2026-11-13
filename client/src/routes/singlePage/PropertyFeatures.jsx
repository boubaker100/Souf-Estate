function FeatureItem({ title, value, subValue, icon }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-white hover:shadow-md transition-all group">
      <div className="bg-white p-3 rounded-lg shadow-sm group-hover:bg-yellow-50 transition-colors">
        <img src={icon} alt="" className="w-8 h-8 object-contain" />
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium mb-1">{title}</p>
        <p className="text-base font-bold text-gray-800 leading-tight">{value}</p>
        {subValue && <p className="text-xs text-green-600 mt-1">{subValue}</p>}
      </div>
    </div>
  );
}
