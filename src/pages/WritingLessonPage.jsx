import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { lessonsService } from '../services'

export function WritingLessonPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [content, setContent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userText, setUserText] = useState('')
  const [showSample, setShowSample] = useState(false)
  const [noteTitle, setNoteTitle] = useState('')
  const [noteContent, setNoteContent] = useState('')

  useEffect(() => {
    lessonsService
      .getWritingContent(id)
      .then((res) => setContent(res?.data || null))
      .catch(() => setContent(null))
      .finally(() => setLoading(false))
  }, [id])

  const info = content?.content || {}
  const wordLimit = info.wordLimit || { min: 100, max: 150 }
  const wordCount = (userText.trim() && userText.trim().split(/\s+/).length) || 0
  const inRange = wordCount >= (wordLimit.min || 0) && wordCount <= (wordLimit.max || 999)

  const handleSubmit = () => {
    // TODO: gửi bài lên API khi có endpoint submit writing
    console.log('Submit writing:', { lessonId: id, text: userText, wordCount })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
      </div>
    )
  }
  if (!content) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400">
        <span className="material-symbols-outlined text-5xl mb-4">error</span>
        <p>Không thể tải nội dung bài học.</p>
        <Link to="/lessons?skill=writing" className="mt-4 text-primary hover:underline">
          Quay lại
        </Link>
      </div>
    )
  }

  return (
    <main className="max-w-[1600px] mx-auto px-6 py-6 grid grid-cols-12 gap-6 min-h-[calc(100vh-64px)]">
      {/* Left Sidebar */}
      <aside className="col-span-12 lg:col-span-2 space-y-6 overflow-y-auto pr-2 pb-6 custom-scrollbar" style={{ width: 'calc(16.666667% + 200px)' }}>
        <div className="bg-card-dark rounded-2xl p-6 border border-border-dark shadow-xl">
          <div className="flex justify-between items-start mb-4">
            <span className="bg-primary/20 text-primary text-xs font-bold px-2 py-1 rounded">
              LEVEL {info.level}
            </span>
            <div className="flex items-center text-yellow-500">
              <span className="material-symbols-outlined text-sm mr-1">star</span>
              <span className="text-xs font-bold">{info.xpReward || 50} XP</span>
            </div>
          </div>
          <h2 className="text-lg font-bold mb-4 text-white leading-tight">{info.title}</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-gray-400">
              <span className="material-symbols-outlined text-lg text-primary">topic</span>
              <span>{info.topic || '—'}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-400">
              <span className="material-symbols-outlined text-lg text-primary">schedule</span>
              <span>{info.time}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-400">
              <span className="material-symbols-outlined text-lg text-primary">edit_note</span>
              <span>
                {wordLimit.min}–{wordLimit.max} từ
              </span>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-border-dark">
            <div className="flex justify-between text-xs font-bold mb-2">
              <span className="text-gray-400">Số từ</span>
              <span className={inRange ? 'text-emerald-400' : 'text-gray-400'}>
                {wordCount} / {wordLimit.min}–{wordLimit.max}
              </span>
            </div>
            <div className="w-full bg-background-dark rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${inRange ? 'bg-emerald-500' : 'bg-primary'}`}
                style={{
                  width: `${Math.min(100, (wordCount / (wordLimit.max || 150)) * 100)}%`,
                }}
              />
            </div>
          </div>
        </div>

        <div className="bg-card-dark rounded-2xl p-5 border border-border-dark shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-primary">note_alt</span>
            <h3 className="font-bold text-sm">Ghi chú của bạn</h3>
          </div>
          <input
            type="text"
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            className="w-full bg-background-dark border border-border-dark rounded-xl p-3 text-sm focus:ring-primary focus:border-primary placeholder:text-gray-500 text-white mb-3"
            placeholder="Tiêu đề ghi chú..."
          />
          <textarea
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            className="w-full bg-background-dark border border-border-dark rounded-xl p-3 text-sm focus:ring-primary focus:border-primary placeholder:text-gray-500 text-white"
            placeholder="Viết nội dung ghi chú..."
            rows={3}
          />
          <button
            type="button"
            className="mt-3 w-full py-2 bg-background-dark hover:bg-gray-700 text-white rounded-xl text-xs font-bold transition-all border border-border-dark"
          >
            Lưu ghi chú
          </button>
        </div>

        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-primary">lightbulb</span>
            <h3 className="font-bold text-primary text-sm">Mẹo học tập</h3>
          </div>
          <p className="text-xs leading-relaxed text-gray-400 italic">
            &quot;Đọc kỹ đề bài, lên dàn ý ngắn trước khi viết để bài có bố cục rõ ràng và đủ ý.&quot;
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <div className="col-span-12 lg:col-span-7 flex flex-col gap-6 overflow-hidden">
        <div className="bg-card-dark rounded-2xl border border-border-dark overflow-hidden flex flex-col flex-1 shadow-2xl">
          <div className="p-6 border-b border-border-dark bg-background-dark/50">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Đề bài</h3>
            <p className="text-white leading-relaxed whitespace-pre-wrap">{info.prompt || 'Chưa có đề bài.'}</p>
          </div>

          <div className="p-6 flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-400">Bài viết của bạn</label>
              <span className={`text-sm font-bold ${inRange ? 'text-emerald-400' : 'text-gray-400'}`}>
                {wordCount} từ
              </span>
            </div>
            <textarea
              value={userText}
              onChange={(e) => setUserText(e.target.value)}
              className="w-full flex-1 min-h-[280px] bg-background-dark border border-border-dark rounded-xl p-4 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-primary focus:border-primary resize-none custom-scrollbar"
              placeholder="Viết bài của bạn tại đây..."
            />

            {info.sampleAnswer && (
              <div className="mt-6 border-t border-border-dark pt-6">
                <button
                  type="button"
                  onClick={() => setShowSample((s) => !s)}
                  className="flex items-center gap-2 text-primary hover:underline text-sm font-bold mb-2"
                >
                  <span className="material-symbols-outlined text-lg">
                    {showSample ? 'expand_less' : 'expand_more'}
                  </span>
                  {showSample ? 'Ẩn bài mẫu' : 'Xem bài mẫu / gợi ý chấm'}
                </button>
                {showSample && (
                  <div className="bg-background-dark/80 rounded-xl p-4 border border-border-dark">
                    <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                      {info.sampleAnswer}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 flex items-center justify-between">
              <button
                type="button"
                onClick={() => navigate('/lessons?skill=writing')}
                className="px-4 py-2 border border-border-dark rounded-xl text-gray-400 hover:bg-white/5 text-sm font-medium"
              >
                Quay lại
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!inRange}
                className="px-6 py-2.5 bg-primary hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold rounded-xl text-sm transition-all"
              >
                Nộp bài
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right: placeholder or vocab */}
      <aside className="col-span-12 lg:col-span-3 hidden xl:block">
        {content.vocabulary && content.vocabulary.length > 0 && (
          <div className="bg-card-dark rounded-2xl p-5 border border-border-dark shadow-lg sticky top-6">
            <h3 className="font-bold text-sm text-gray-400 mb-3">Từ vựng gợi ý</h3>
            <ul className="space-y-2">
              {content.vocabulary.slice(0, 5).map((v, i) => (
                <li key={i} className="text-sm">
                  <span className="text-primary font-medium">{v.word}</span>
                  {v.phonetic && <span className="text-gray-500 ml-1">{v.phonetic}</span>}
                  {v.meaning && <p className="text-gray-400 mt-0.5">{v.meaning}</p>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </aside>
    </main>
  )
}
