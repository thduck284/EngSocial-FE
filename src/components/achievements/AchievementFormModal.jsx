function FieldLabel({ children }) {
  return <div className="text-xs font-semibold text-slate-300">{children}</div>
}

export function AchievementFormModal({
  open,
  title,
  subtitle,
  accent = 'sky',
  form,
  setForm,
  onClose,
  onSubmit,
  submitText,
}) {
  if (!open) return null

  const ring =
    accent === 'amber'
      ? 'focus:ring-amber-400/40'
      : accent === 'emerald'
        ? 'focus:ring-emerald-400/50'
        : 'focus:ring-sky-500/60'

  const baseInput = `w-full rounded-xl border border-slate-700/80 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 ${ring}`

  const baseInvalid = !form.name.trim() || !form.howTo.trim()
  let extraInvalid = false
  if ((form.rewardType || 'both') === 'exp') {
    extraInvalid = !Number(form.expAmount || 0)
  } else if ((form.rewardType || 'both') === 'badge') {
    extraInvalid = !(form.badgeName || '').trim()
  }
  const disabled = baseInvalid || extraInvalid

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[560px] rounded-2xl border border-slate-700/80 bg-slate-950 shadow-[0_30px_90px_rgba(0,0,0,0.65)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-slate-800/80 flex items-center justify-between">
          <div>
            <div className="text-sm font-bold text-white">{title}</div>
            {subtitle ? (
              <div className="text-[12px] text-slate-400">{subtitle}</div>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-700/80 bg-slate-900/70 px-2 py-1 text-slate-200 hover:bg-slate-900"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="px-5 py-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="space-y-1">
              <FieldLabel>Tên achievement *</FieldLabel>
              <input
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                className={baseInput}
                placeholder="Ví dụ: Chuỗi 14 ngày"
              />
            </label>
            <label className="space-y-1">
              <FieldLabel>Icon (Material)</FieldLabel>
              <input
                value={form.icon}
                onChange={(e) =>
                  setForm((p) => ({ ...p, icon: e.target.value }))
                }
                className={baseInput}
                placeholder="emoji_events"
              />
            </label>
          </div>

          <label className="space-y-1 block">
            <FieldLabel>Cách hoàn thành *</FieldLabel>
            <textarea
              value={form.howTo}
              onChange={(e) =>
                setForm((p) => ({ ...p, howTo: e.target.value }))
              }
              rows={3}
              className={baseInput}
              placeholder="Mô tả điều kiện hoàn thành..."
            />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="space-y-1">
              <FieldLabel>Độ hiếm</FieldLabel>
              <div className="relative">
                <select
                  value={form.rarity}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, rarity: e.target.value }))
                  }
                  className={`${baseInput} appearance-none`}
                >
                  <option value="common">common</option>
                  <option value="uncommon">uncommon</option>
                  <option value="rare">rare</option>
                  <option value="epic">epic</option>
                  <option value="legendary">legendary</option>
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[20px] text-slate-300">
                  expand_more
                </span>
              </div>
            </label>
            <label className="space-y-1">
              <FieldLabel>Loại phần thưởng</FieldLabel>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'both', label: 'Both' },
                  { id: 'exp', label: 'EXP' },
                  { id: 'badge', label: 'Badge' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() =>
                      setForm((p) => ({ ...p, rewardType: opt.id }))
                    }
                    className={`text-xs rounded-full border px-2 py-1 font-semibold ${
                      (form.rewardType || 'both') === opt.id
                        ? 'border-emerald-400/70 bg-emerald-500/20 text-emerald-100'
                        : 'border-slate-700/80 bg-slate-900/60 text-slate-300 hover:border-slate-500/80'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </label>
            {(form.rewardType || 'both') === 'exp' && (
              <label className="space-y-1">
                <FieldLabel>Số EXP</FieldLabel>
                <input
                  type="number"
                  min="0"
                  value={form.expAmount}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, expAmount: e.target.value }))
                  }
                  className={baseInput}
                  placeholder="Ví dụ: 200"
                />
              </label>
            )}
            {(form.rewardType || 'both') === 'badge' && (
              <>
                <label className="space-y-1">
                  <FieldLabel>Tên huy hiệu</FieldLabel>
                  <input
                    value={form.badgeName}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, badgeName: e.target.value }))
                    }
                    className={baseInput}
                    placeholder="Ví dụ: Chăm chỉ 7 ngày"
                  />
                </label>
                <label className="space-y-1">
                  <FieldLabel>Ảnh huy hiệu (URL)</FieldLabel>
                  <input
                    value={form.badgeImage}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, badgeImage: e.target.value }))
                    }
                    className={baseInput}
                    placeholder="https://... hoặc để trống"
                  />
                </label>
              </>
            )}
            {(form.rewardType || 'both') === 'both' && (
              <label className="space-y-1">
                <FieldLabel>Phần thưởng (mỗi dòng 1 mục)</FieldLabel>
                <textarea
                  value={form.rewards}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, rewards: e.target.value }))
                  }
                  rows={3}
                  className={baseInput}
                  placeholder="+200 XP&#10;Huy hiệu “...”"
                />
              </label>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="space-y-1">
              <FieldLabel>Link label (optional)</FieldLabel>
              <input
                value={form.linkLabel}
                onChange={(e) =>
                  setForm((p) => ({ ...p, linkLabel: e.target.value }))
                }
                className={baseInput}
                placeholder="Đi tới luyện tập"
              />
            </label>
            <label className="space-y-1">
              <FieldLabel>Link to (optional)</FieldLabel>
              <input
                value={form.linkTo}
                onChange={(e) =>
                  setForm((p) => ({ ...p, linkTo: e.target.value }))
                }
                className={baseInput}
                placeholder="/skills/reading hoặc https://..."
              />
            </label>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-slate-800/80 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-700/80 bg-slate-900/70 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-900"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={disabled}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitText}
          </button>
        </div>
      </div>
    </div>
  )
}

