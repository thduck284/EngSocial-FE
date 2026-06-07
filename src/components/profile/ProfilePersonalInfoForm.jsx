function PrivacyLabel({ label, privacyKey, visible, onToggle, saving, t, labelClass }) {
  return (
    <div className={`${labelClass} justify-between`}>
      <span className="flex items-center gap-1">{label}</span>
      <button
        type="button"
        onClick={() => onToggle(privacyKey)}
        disabled={Boolean(saving)}
        title={visible ? t('profile.privacyVisible') : t('profile.privacyHidden')}
        aria-label={visible ? t('profile.privacyVisible') : t('profile.privacyHidden')}
        className={`inline-flex items-center justify-center size-7 rounded-lg transition-colors shrink-0 ${
          visible
            ? 'text-primary hover:bg-primary/10'
            : 'text-slate-400 dark:text-gray-500 hover:bg-slate-100 dark:hover:bg-white/10'
        } disabled:opacity-50`}
      >
        {saving === privacyKey ? (
          <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
        ) : (
          <span className="material-symbols-outlined text-[18px]">
            {visible ? 'visibility' : 'visibility_off'}
          </span>
        )}
      </button>
    </div>
  )
}

export function ProfilePersonalInfoForm({
  t,
  form,
  privacy,
  privacySaving,
  saving,
  message,
  onChange,
  onTogglePrivacy,
  onCancel,
  onSave,
}) {
  const inputClass =
    'w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all dark:text-white'
  const labelClass = 'text-xs font-bold text-slate-500 dark:text-gray-500 flex items-center gap-1.5'

  return (
    <>
      <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
        <span className="material-symbols-outlined text-primary text-lg">badge</span>
        {t('profile.editInfo')}
      </h3>
      <p className="text-xs text-slate-400 dark:text-gray-500 mb-4">{t('profile.privacyHint')}</p>

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
          <PrivacyLabel
            label={t('auth.email')}
            privacyKey="showEmail"
            visible={privacy.showEmail}
            onToggle={onTogglePrivacy}
            saving={privacySaving}
            t={t}
            labelClass={labelClass}
          />
          <input
            type="email"
            disabled
            className="w-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-border-dark rounded-lg px-3 py-2 text-sm text-slate-600 dark:text-slate-400 cursor-not-allowed"
            value={form.email}
            readOnly
          />
        </div>
        <div className="space-y-1">
          <PrivacyLabel
            label={t('profile.phone')}
            privacyKey="showPhone"
            visible={privacy.showPhone}
            onToggle={onTogglePrivacy}
            saving={privacySaving}
            t={t}
            labelClass={labelClass}
          />
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
          <PrivacyLabel
            label={t('profile.address')}
            privacyKey="showAddress"
            visible={privacy.showAddress}
            onToggle={onTogglePrivacy}
            saving={privacySaving}
            t={t}
            labelClass={labelClass}
          />
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
            <PrivacyLabel
              label={t('auth.dateOfBirth')}
              privacyKey="showDateOfBirth"
              visible={privacy.showDateOfBirth}
              onToggle={onTogglePrivacy}
              saving={privacySaving}
              t={t}
              labelClass={labelClass}
            />
            <input
              type="date"
              className={inputClass}
              value={form.dateOfBirth}
              onChange={(e) => onChange('dateOfBirth', e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <PrivacyLabel
              label={t('auth.gender')}
              privacyKey="showGender"
              visible={privacy.showGender}
              onToggle={onTogglePrivacy}
              saving={privacySaving}
              t={t}
              labelClass={labelClass}
            />
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
