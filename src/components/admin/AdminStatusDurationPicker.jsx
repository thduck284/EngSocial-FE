import { useTranslation } from 'react-i18next'

const selectClass =
  'w-full bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-primary'

const inputClass =
  'w-full bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-primary'

export function buildStatusDurationPayload(mode, durationValue, durationUnit) {
  if (mode !== 'timed') return undefined
  const value = Number(durationValue)
  if (!Number.isFinite(value) || value < 1) return undefined
  return { value, unit: durationUnit }
}

export function formatAdminStatusUntil(iso, lang) {
  if (!iso) return null
  const locale = lang?.startsWith('vi') ? 'vi-VN' : 'en-US'
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(new Date(iso))
}

export function AdminStatusDurationPicker({
  mode,
  durationValue,
  durationUnit,
  onModeChange,
  onValueChange,
  onUnitChange,
  disabled = false,
}) {
  const { t } = useTranslation()

  return (
    <div className="space-y-2 rounded-lg border border-border-dark/80 bg-black/15 p-3">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        {t('adminConsole.lockDurationMode')}
      </p>
      <div className="flex flex-wrap gap-3 text-xs text-gray-300">
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="lockDurationMode"
            checked={mode === 'permanent'}
            onChange={() => onModeChange('permanent')}
            disabled={disabled}
          />
          {t('adminConsole.lockDurationPermanent')}
        </label>
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="lockDurationMode"
            checked={mode === 'timed'}
            onChange={() => onModeChange('timed')}
            disabled={disabled}
          />
          {t('adminConsole.lockDurationTimed')}
        </label>
      </div>
      {mode === 'timed' ? (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[11px] text-gray-500 mb-1">{t('adminConsole.lockDurationValue')}</label>
            <input
              type="number"
              min={1}
              max={3650}
              value={durationValue}
              onChange={(e) => onValueChange(e.target.value)}
              className={inputClass}
              disabled={disabled}
            />
          </div>
          <div>
            <label className="block text-[11px] text-gray-500 mb-1">{t('adminConsole.lockDurationUnit')}</label>
            <select
              value={durationUnit}
              onChange={(e) => onUnitChange(e.target.value)}
              className={selectClass}
              disabled={disabled}
            >
              <option value="day">{t('adminConsole.lockDurationUnitDay')}</option>
              <option value="week">{t('adminConsole.lockDurationUnitWeek')}</option>
              <option value="month">{t('adminConsole.lockDurationUnitMonth')}</option>
              <option value="year">{t('adminConsole.lockDurationUnitYear')}</option>
            </select>
          </div>
        </div>
      ) : null}
    </div>
  )
}
