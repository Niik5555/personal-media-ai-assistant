export default function ConfirmDialog({ isOpen, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-80">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          Confirm Delete
        </h3>

        <p className="text-sm text-gray-600 mb-5">
          Are you sure you want to delete this search?
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-3 py-1 rounded border text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}