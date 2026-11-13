import { useState } from "react";
import StatusBadge from "./StatusBadge";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function DashboardCard({ post, onDelete }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div whileHover={{ y: -4 }} className="bg-white dark:bg-gray-950 rounded-2xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-800 flex flex-col">
      <div className="relative h-44 w-full">
        <img src={post.images?.[0] || "/noimage.jpg"} alt={post.title} className="w-full h-full object-cover" />
        <div className="absolute top-3 left-3">
          <StatusBadge status={post.status} />
        </div>
        <div className="absolute top-3 right-3">
          <div className="relative">
            <button onClick={() => setOpen((s) => !s)} className="px-2 py-1 rounded-md bg-white/80 dark:bg-gray-800/80">•••</button>

            {open && (
              <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-gray-900 rounded-md shadow-lg border">
                <Link to={`/${post.id}`} className="block px-4 py-2 text-sm hover:bg-gray-100">Preview</Link>
                <Link to={`/dashboard/edit/${post.id}`} className="block px-4 py-2 text-sm hover:bg-gray-100">Edit</Link>
                <button onClick={() => onDelete(post.id)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">Delete</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-lg font-semibold truncate">{post.title}</h3>
        <p className="text-gray-400 text-sm mt-1 truncate">{post.address || post.city}</p>

        <div className="mt-3 flex items-center justify-between">
          <div>
            <div className="text-xl font-bold text-indigo-600">{post.price.toLocaleString()} دج</div>
            <div className="text-sm text-gray-500">{post.rooms} • {post.property}</div>
          </div>

          <div className="text-sm text-gray-500 text-right">
            <div>👁 {post.views ?? 0}</div>
            <div className="mt-2 text-xs text-gray-400">{new Date(post.createdAt).toLocaleDateString()}</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
