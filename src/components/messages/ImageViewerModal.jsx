import { createPortal } from 'react-dom'

export function ImageViewerModal({ imageViewer, onClose }) {
  if (!imageViewer) return null
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80" onClick={onClose}>
      <div className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
        <img src={imageViewer.url} alt="" className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" />
        <button type="button" onClick={onClose} className="absolute -top-12 right-0 z-10 text-white hover:text-gray-300 p-1" aria-label="Close">
          <span className="material-symbols-outlined text-3xl">close</span>
        </button>
      </div>
    </div>,
    document.body
  )
}
