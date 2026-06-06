import React from 'react'

export function PostImageViewerLeft({
  currentSrc,
  zoom,
  zoomIn,
  zoomOut,
  fullscreen,
  toggleFullscreen,
  hasMultiple,
  goPrev,
  goNext,
  onClose,
  t,
}) {
  return (
    <div className="flex-1 flex flex-col min-h-[50vh] md:min-h-0 min-w-0 bg-black/40 relative">
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-3 bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors pointer-events-auto"
          aria-label={t('buttons.close') || 'Đóng'}
        >
          <span className="material-symbols-outlined">close</span>
        </button>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={zoomOut}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors pointer-events-auto"
            aria-label="Thu nhỏ"
          >
            <span className="material-symbols-outlined">zoom_out</span>
          </button>
          <button
            type="button"
            onClick={zoomIn}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors pointer-events-auto"
            aria-label="Phóng to"
          >
            <span className="material-symbols-outlined">zoom_in</span>
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors pointer-events-auto"
            aria-label="Toàn màn hình"
          >
            <span className="material-symbols-outlined">{fullscreen ? 'fullscreen_exit' : 'fullscreen'}</span>
          </button>
        </div>
      </div>
      {hasMultiple && (
        <>
          <button
            type="button"
            onClick={goPrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors pointer-events-auto"
            aria-label="Ảnh trước"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <button
            type="button"
            onClick={goNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors pointer-events-auto"
            aria-label="Ảnh sau"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </>
      )}
      <div className="flex-1 flex items-center justify-center min-h-0 p-3 md:p-6 overflow-auto">
        {currentSrc && (
          currentSrc.split('?')[0].match(/\.(mp4|webm|ogg|mov)$|^https:\/\/.+video.+/i) ? (
            <video
              src={currentSrc}
              controls
              autoPlay
              className="max-w-[min(100%,920px)] max-h-[82vh] md:max-h-[86vh] w-auto h-auto object-contain transition-transform duration-200 origin-center"
              style={{ transform: `scale(${zoom})` }}
              onClick={(e) => e.stopPropagation()}
              draggable={false}
            />
          ) : (
            <img
              src={currentSrc}
              alt=""
              className="max-w-[min(100%,920px)] max-h-[82vh] md:max-h-[86vh] w-auto h-auto object-contain transition-transform duration-200 origin-center"
              style={{ transform: `scale(${zoom})` }}
              onClick={(e) => e.stopPropagation()}
              referrerPolicy="no-referrer"
              draggable={false}
            />
          )
        )}
      </div>
    </div>
  )
}

