export function ProfilePersonalInfoForm({
  t,
  form,
  saving,
  message,
  onChange,
  onCancel,
  onSave,
}) {
  const inputClass =
    'w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all dark:text-white'
  const labelClass = 'text-xs font-bold text-slate-500 dark:text-gray-500'

  return (
    <>
      <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-primary text-lg">badge</span>
        {t('profile.editInfo')}
      </h3>

      {message.text && (
        <div
          className={`mb-3 px-3 py-2 rounded-lg text-xs ${
            message.type === 'success'
              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
              : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className={labelClass}>{t('profile.displayName')}</label>
          <input
            type="text"
            className={inputClass}
            value={form.name}
            onChange={(e) => onChange('name', e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label className={labelClass}>{t('auth.email')}</label>
          <input
            type="email"
            disabled
            className="w-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-border-dark rounded-lg px-3 py-2 text-sm text-slate-600 dark:text-slate-400 cursor-not-allowed"
            value={form.email}
            readOnly
          />
        </div>
        <div className="space-y-1">
          <label className={labelClass}>{t('profile.phone')}</label>
          <input
            type="text"
            className={inputClass}
            placeholder="0123 456 789"
            value={form.phone}
            onChange={(e) => onChange('phone', e.target.value)}
          />
        </div>
        <div className="md:col-span-2 space-y-1">
          <label className={labelClass}>{t('profile.bio')}</label>
          <textarea
            className={`${inputClass} resize-none`}
            rows={3}
            placeholder={t('profile.bioPlaceholder')}
            value={form.bio}
            onChange={(e) => onChange('bio', e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label className={labelClass}>{t('profile.address')}</label>
          <input
            type="text"
            className={inputClass}
            placeholder={t('profile.addressPlaceholder')}
            value={form.address}
            onChange={(e) => onChange('address', e.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className={labelClass}>{t('auth.dateOfBirth')}</label>
            <input
              type="date"
              className={inputClass}
              value={form.dateOfBirth}
              onChange={(e) => onChange('dateOfBirth', e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className={labelClass}>{t('auth.gender')}</label>
            <select
              className={`${inputClass} appearance-none`}
              value={form.gender}
              onChange={(e) => onChange('gender', e.target.value)}
            >
              <option value="">{t('auth.genderPlaceholder')}</option>
              <option value="male">{t('auth.genderMale')}</option>
              <option value="female">{t('auth.genderFemale')}</option>
              <option value="other">{t('auth.genderOther')}</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          className="px-4 py-2 rounded-lg border border-slate-200 dark:border-border-dark text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          onClick={onCancel}
        >
          {t('profile.cancel')}
        </button>
        <button
          type="button"
          className="px-4 py-2 rounded-lg border border-slate-200 dark:border-border-dark text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
          onClick={() => {}}
        >
          <span className="material-symbols-outlined text-base">lock_reset</span>
          {t('profile.changePassword')}
        </button>
        <button
          type="button"
          className="px-4 py-2 rounded-lg bg-primary text-white text-xs font-bold shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-60"
          onClick={onSave}
          disabled={saving}
        >
          {saving ? t('profile.saving') : t('profile.saveChanges')}
        </button>
      </div>
    </>
  )
}
