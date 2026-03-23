export function ProfilePersonalInfoForm({
  t,
  form,
  saving,
  message,
  onChange,
  onCancel,
  onSave,
}) {
  return (
    <>
      <h3 className="text-lg font-bold mb-6 dark:text-white flex items-center gap-2">
        <span className="material-symbols-outlined text-primary">edit</span>
        {t('profile.editInfo')}
      </h3>

      {message.text && (
        <div
          className={`mb-4 px-4 py-2 rounded-lg text-sm ${
            message.type === 'success'
              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
              : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            {t('profile.displayName')}
          </label>
          <input
            type="text"
            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-border-dark rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/50 transition-all dark:text-white"
            value={form.name}
            onChange={(e) => onChange('name', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            {t('auth.email')}
          </label>
          <input
            type="email"
            disabled
            className="w-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-border-dark rounded-lg px-4 py-2.5 text-slate-600 dark:text-slate-400 cursor-not-allowed"
            value={form.email}
            readOnly
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            {t('profile.phone')}
          </label>
          <input
            type="text"
            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-border-dark rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/50 transition-all dark:text-white"
            placeholder="0123 456 789"
            value={form.phone}
            onChange={(e) => onChange('phone', e.target.value)}
          />
        </div>
        <div className="md:col-span-2 space-y-2">
          <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            {t('profile.bio')}
          </label>
          <textarea
            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-border-dark rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/50 transition-all dark:text-white resize-none"
            rows={3}
            placeholder={t('profile.bioPlaceholder')}
            value={form.bio}
            onChange={(e) => onChange('bio', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            {t('profile.address')}
          </label>
          <input
            type="text"
            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-border-dark rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/50 transition-all dark:text-white"
            placeholder={t('profile.addressPlaceholder')}
            value={form.address}
            onChange={(e) => onChange('address', e.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              {t('auth.dateOfBirth')}
            </label>
            <input
              type="date"
              className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-border-dark rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-primary/50 transition-all dark:text-white"
              value={form.dateOfBirth}
              onChange={(e) => onChange('dateOfBirth', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              {t('auth.gender')}
            </label>
            <select
              className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-border-dark rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/50 transition-all dark:text-white appearance-none"
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

      <div className="mt-8 flex flex-wrap items-center justify-end gap-3">
        <button
          type="button"
          className="px-6 py-2.5 rounded-lg border border-slate-200 dark:border-border-dark font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          onClick={onCancel}
        >
          {t('profile.cancel')}
        </button>
        <button
          type="button"
          className="px-6 py-2.5 rounded-lg border-2 border-slate-200 dark:border-border-dark font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
          onClick={() => {}}
        >
          <span className="material-symbols-outlined text-lg">lock_reset</span>
          {t('profile.changePassword')}
        </button>
        <button
          type="button"
          className="px-8 py-2.5 rounded-lg bg-primary text-white font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors disabled:opacity-60"
          onClick={onSave}
          disabled={saving}
        >
          {saving ? t('profile.saving') : t('profile.saveChanges')}
        </button>
      </div>
    </>
  )
}

