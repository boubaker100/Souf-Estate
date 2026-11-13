import { motion, AnimatePresence } from "framer-motion";

export default function ConfirmModal({
  isOpen,
  onConfirm,
  onCancel,
  title = "Are you sure?",
  description = "هذا الإجراء لا يمكن التراجع عنه.",
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 px-4"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {title}
              </h2>

              <p className="text-gray-500 mb-6">{description}</p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={onCancel}
                  className="px-4 py-2 cursor-pointer rounded-lg bg-gray-200 hover:bg-gray-300 transition"
                >
                  إلغاء
                </button>

                <button
                  onClick={onConfirm}
                  className="px-4 py-2 cursor-pointer rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
                >
                  حذف
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
