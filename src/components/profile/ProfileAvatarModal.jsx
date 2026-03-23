export function ProfileAvatarModal({
  t,
  show,
  avatarPreview,
  avatarError,
  avatarSaving,
  onClose,
  onFileChange,
  onSave,
}) {
  if (!show) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-card-dark rounded-2xl p-6 w-full max-w-md border border-slate-200 dark:border-border-dark shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold dark:text-white mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">photo_camera</span>
          {t('profile.avatarModalTitle')}
        </h3>
        <div className="mb-4">
          <label className="block w-full cursor-pointer">
            <span className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-primary/50 dark:hover:border-primary/50 transition-colors text-slate-600 dark:text-slate-400">
              <span className="material-symbols-outlined">image</span>
              {t('profile.avatarChooseFile')}
            </span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="sr-only"
              onChange={onFileChange}
            />
          </label>
        </div>
        {avatarPreview && (
          <div className="mb-4 flex justify-center">
            <img
              src={avatarPreview}
              alt=""
              className="w-24 h-24 rounded-full object-cover border-2 border-slate-200 dark:border-border-dark"
              onError={(e) => {
                e.target.style.display = 'none'
              }}
            />
          </div>
        )}
        {avatarError && (
          <p className="text-sm text-red-500 dark:text-red-400 mb-2">{avatarError}</p>
        )}
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            className="px-4 py-2 rounded-lg border border-slate-200 dark:border-border-dark font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
            onClick={onClose}
          >
            {t('profile.cancel')}
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-60"
            onClick={onSave}
            disabled={avatarSaving}
          >
            {avatarSaving ? t('profile.saving') : t('profile.avatarSave')}
          </button>
        </div>
      </div>
    </div>
  )
}

