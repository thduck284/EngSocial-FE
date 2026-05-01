import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { groupService } from '../services/group.service'
import { friendsService } from '../services/friends.service'
import { uploadService } from '../services/upload.service'
import { showEngSuccessToast } from '../utils/showEngToast'

export function GroupCreatePage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [form, setForm] = useState({
    name: '',
    description: '',
    contentVisibility: 'public', // 'public' | 'private'
    searchable: true, // true = có thể tìm thấy, false = Không thể tìm thấy nhóm
    icon: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [memberQuery, setMemberQuery] = useState('')
  const [memberResults, setMemberResults] = useState([])
  const [loadingMembers, setLoadingMembers] = useState(false)
  const [selectedMembers, setSelectedMembers] = useState([])

  const canSubmit =
    form.name.trim().length > 0 && selectedMembers.length >= 2 && !submitting

  useEffect(() => {
    if (!memberQuery.trim()) {
      setMemberResults([])
      return
    }
    let cancelled = false
    setLoadingMembers(true)
    ;(async () => {
      try {
        const res = await friendsService.search({
          q: memberQuery.trim(),
          limit: 5,
          friendFilter: 'all',
        })
        const list =
          res?.data?.data?.items ??
          res?.data?.data ??
          res?.data?.friends ??
          res?.data ??
          []
        if (!cancelled) {
          setMemberResults(
            list.map((item) => ({
              id: item.id || item.userId || item._id,
              name: item.name,
              avatar: item.avatar,
            })).filter((x) => x.id)
          )
        }
      } catch {
        if (!cancelled) setMemberResults([])
      } finally {
        if (!cancelled) setLoadingMembers(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [memberQuery])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!canSubmit) return
    try {
      setSubmitting(true)
      const type = !form.searchable ? 'invite_only' : form.contentVisibility
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        type,
        icon: form.icon || undefined,
        inviteUserIds: selectedMembers.map((m) => m.id),
      }
      await groupService.create(payload)
      showEngSuccessToast(t('groupsCreate.createSuccess', { defaultValue: 'Tạo nhóm thành công!' }))
      navigate('/community')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="flex-1 max-w-[1400px] mx-auto w-full px-1.5 sm:px-2 lg:px-3 py-6 h-[calc(100vh-80px)] overflow-hidden flex flex-col">
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-4 shrink-0">
        <span className="hover:text-primary transition-colors cursor-pointer" onClick={() => navigate('/home')}>
          {t('groupsCreate.breadcrumbHome', { defaultValue: 'Home' })}
        </span>
        <span className="material-symbols-outlined text-base">chevron_right</span>
        <span className="hover:text-primary transition-colors cursor-pointer" onClick={() => navigate('/community')}>
          {t('groupsCreate.breadcrumbGroups', { defaultValue: 'Groups' })}
        </span>
        <span className="material-symbols-outlined text-base text-primary">chevron_right</span>
        <span className="text-slate-300 font-medium">
          {t('groupsCreate.breadcrumbCreate', { defaultValue: 'Tạo nhóm mới' })}
        </span>
      </nav>

      <div className="mb-2 shrink-0" />

      <form
        className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-6"
        onSubmit={handleSubmit}
      >
        {/* Left column: Thông tin cơ bản */}
        <section className="lg:col-span-5 bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-2xl p-6 lg:p-8 space-y-6 min-h-[480px] shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-primary">info</span>
            <h3 className="font-bold text-lg">
              {t('groupsCreate.basicInfoTitle', { defaultValue: 'Thông tin cơ bản' })}
            </h3>
          </div>
          <div className="space-y-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {t('groupsCreate.fieldNameRequired', { defaultValue: 'Tên nhóm *' })}
              </label>
              <input
                type="text"
                className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 text-sm text-slate-900 dark:text-white shadow-inner"
                placeholder={t('groupsCreate.fieldNamePlaceholder', {
                  defaultValue: 'Ví dụ: English for Developers',
                })}
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {t('groupsCreate.fieldDescription', { defaultValue: 'Mô tả nhóm' })}
              </label>
              <textarea
                rows={6}
                className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 text-sm resize-none text-slate-900 dark:text-white shadow-inner"
                placeholder={t('groupsCreate.fieldDescriptionPlaceholder', {
                  defaultValue: 'Giới thiệu ngắn về mục tiêu và nội dung của nhóm...',
                })}
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {t('groupsCreate.fieldImage', { defaultValue: 'Ảnh nhóm' })}
              </label>
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-white/5 rounded-2xl px-3 py-2.5 shadow-inner">
                <div className="size-10 rounded-full bg-slate-200 dark:bg-slate-900 flex items-center justify-center overflow-hidden border border-slate-300 dark:border-slate-800">
                  {form.icon ? (
                    <img
                      src={form.icon}
                      alt="Group avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="material-symbols-outlined text-xl text-slate-600">
                      image
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <span className="text-xs font-semibold text-primary">
                      {t('groupsCreate.imageHintMain', {
                        defaultValue: 'Tải ảnh nhóm',
                      })}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        try {
                          const url = await uploadService.uploadMedia(file)
                          const finalUrl = url?.url || url // tùy BE trả về
                          if (finalUrl) {
                            setForm((p) => ({ ...p, icon: finalUrl }))
                          }
                        } catch {
                          // TODO: thêm toast lỗi nếu cần
                        } finally {
                          e.target.value = ''
                        }
                      }}
                    />
                  </label>
                  <p className="text-[10px] text-slate-500">
                    {t('groupsCreate.imageHintSub', {
                      defaultValue: 'JPG, PNG, GIF · Tối đa 5MB',
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Right column: Quyền riêng tư + Mời bạn bè */}
        <section className="lg:col-span-7 flex flex-col gap-6 min-h-[480px]">
          {/* Quyền riêng tư */}
          <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-2xl p-6 lg:p-8 space-y-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <span className="material-symbols-outlined text-primary">visibility</span>
              <h3 className="font-bold text-lg">
                {t('groupsCreate.privacyTitle', { defaultValue: 'Thiết lập quyền riêng tư' })}
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Content visibility (1 trong 2) */}
              {[
                {
                  id: 'public',
                  icon: 'public',
                  title: t('groupsCreate.privacyPublicTitle', { defaultValue: 'Công khai' }),
                  desc: t('groupsCreate.privacyPublicDesc', {
                    defaultValue: 'Mọi người có thể xem nội dung nhóm',
                  }),
                },
                {
                  id: 'private',
                  icon: 'lock',
                  title: t('groupsCreate.privacyPrivateTitle', { defaultValue: 'Riêng tư' }),
                  desc: t('groupsCreate.privacyPrivateDesc', {
                    defaultValue: 'Chỉ thành viên mới có thể thấy nội dung nhóm',
                  }),
                },
              ].map((opt) => (
                <label key={opt.id} className="relative flex cursor-pointer">
                  <input
                    type="radio"
                    name="contentVisibility"
                    className="peer sr-only"
                    checked={form.contentVisibility === opt.id}
                    onChange={() =>
                      setForm((p) => ({ ...p, contentVisibility: opt.id }))
                    }
                  />
                  <div className="w-full p-5 flex flex-col gap-2 rounded-2xl border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-background-dark peer-checked:border-primary peer-checked:bg-primary/5 transition-all hover:border-primary/50 shadow-inner">
                    <div className="flex items-center justify-between">
                      <span className="material-symbols-outlined text-primary">
                        {opt.icon}
                      </span>
                      <div className="w-4 h-4 rounded-full border-2 border-slate-700 peer-checked:border-primary flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-primary opacity-0 peer-checked:opacity-100" />
                      </div>
                    </div>
                    <div>
                      <p className="font-bold text-sm">{opt.title}</p>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        {opt.desc}
                      </p>
                    </div>
                  </div>
                </label>
              ))}

              {/* Group visibility (bật thêm hoặc tắt) */}
              <label className="relative flex cursor-pointer">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={!form.searchable}
                  onChange={() =>
                    setForm((p) => ({ ...p, searchable: !p.searchable }))
                  }
                />
                <div className="w-full p-5 flex flex-col gap-2 rounded-xl border border-slate-800 bg-slate-950 peer-checked:border-primary peer-checked:bg-primary/5 transition-all hover:border-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="material-symbols-outlined text-primary">
                      mail
                    </span>
                    <div className="w-4 h-4 rounded-md border-2 border-slate-700 peer-checked:border-primary flex items-center justify-center">
                      <span className="material-symbols-outlined text-[13px] text-primary opacity-0 peer-checked:opacity-100">
                        check
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="font-bold text-sm">
                      {t('groupsCreate.privacySearchTitle', { defaultValue: 'Tìm kiếm' })}
                    </p>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {form.searchable
                        ? t('groupsCreate.privacySearchOn', {
                            defaultValue: 'Có thể tìm thấy nhóm',
                          })
                        : t('groupsCreate.privacySearchOff', {
                            defaultValue: 'Không thể tìm thấy nhóm',
                          })}
                    </p>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Mời bạn bè */}
        <section className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-2xl p-6 lg:p-8 space-y-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">person_add</span>
              <h3 className="font-bold text-lg">
                {t('groupsCreate.inviteTitle', { defaultValue: 'Mời bạn bè' })}
              </h3>
            </div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
              {t('groupsCreate.inviteSelected', {
                count: selectedMembers.length,
                defaultValue: `${selectedMembers.length} thành viên đã chọn`,
              })}
            </span>
          </div>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
              search
            </span>
            <input
              type="text"
              className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-white/5 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 text-slate-900 dark:text-white shadow-inner"
              placeholder={t('groupsCreate.inviteSearchPlaceholder', {
                defaultValue: 'Tìm kiếm theo tên hoặc email...',
              })}
              value={memberQuery}
              onChange={(e) => setMemberQuery(e.target.value)}
            />
            {memberQuery.trim() && (
              <div className="absolute z-20 bottom-full mb-2 w-full bg-slate-950 border border-slate-800 rounded-xl shadow-lg max-h-64 overflow-y-auto custom-scrollbar">
                {loadingMembers ? (
                  <div className="px-4 py-3 text-xs text-slate-500">
                    {t('groupsCreate.inviteSearching', { defaultValue: 'Đang tìm kiếm...' })}
                  </div>
                ) : memberResults.length === 0 ? (
                  <div className="px-4 py-3 text-xs text-slate-500">
                    {t('groupsCreate.inviteNoResults', {
                      defaultValue: 'Không tìm thấy bạn bè phù hợp.',
                    })}
                  </div>
                ) : (
                  memberResults.map((m) => {
                    const already = selectedMembers.some((x) => x.id === m.id)
                    return (
                      <button
                        key={m.id}
                        type="button"
                        disabled={already}
                        onClick={() => {
                          if (already) return
                          setSelectedMembers((prev) => [...prev, m])
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-800 text-left disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <div className="size-8 rounded-full overflow-hidden bg-slate-800 shrink-0">
                          {m.avatar ? (
                            <img
                              src={m.avatar}
                              alt={m.name}
                              className="w-full h-full object-cover"
                            />
                          ) : null}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-100 truncate">
                            {m.name}
                          </p>
                        </div>
                        {!already && (
                          <span className="text-xs font-semibold text-primary">
                            Thêm
                          </span>
                        )}
                      </button>
                    )
                  })
                )}
              </div>
            )}
          </div>

          {selectedMembers.length > 0 && (
            <div className="max-h-32 overflow-y-auto custom-scrollbar pt-2 border-t border-slate-800/50 mt-2">
              <div className="flex flex-wrap gap-2">
                {selectedMembers.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-2 bg-slate-900 pl-1.5 pr-2.5 py-1.5 rounded-full border border-slate-700 hover:border-primary/50 transition-colors"
                  >
                    <div className="size-6 rounded-full overflow-hidden bg-slate-800">
                      {m.avatar ? (
                        <img
                          src={m.avatar}
                          alt={m.name}
                          className="w-full h-full object-cover"
                        />
                      ) : null}
                    </div>
                    <span className="text-xs font-medium">{m.name}</span>
                    <button
                      type="button"
                      className="text-slate-400 hover:text-white leading-none ml-1"
                      onClick={() =>
                        setSelectedMembers((prev) => prev.filter((x) => x.id !== m.id))
                      }
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
        </section>
      </form>

      <div className="mt-4 flex items-center justify-end gap-4 shrink-0">
        <button
          type="button"
            className="px-8 py-3 rounded-xl font-bold text-sm text-slate-400 hover:text-white hover:bg-slate-900 transition-all"
          onClick={() => navigate('/community')}
          >
          {t('groupsCreate.cancel', { defaultValue: 'Hủy bỏ' })}
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="px-10 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting
            ? t('groupsCreate.submitting', { defaultValue: 'Đang tạo...' })
            : t('groupsCreate.submit', { defaultValue: 'Tạo nhóm ngay' })}
        </button>
      </div>
    </main>
  )
}

