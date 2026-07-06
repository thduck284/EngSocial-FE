export function buildStudentLessonResultUrl(lesson, attempt) {
  const skill = lesson?.skill || 'reading'
  const category = lesson?.category === 'practice' ? 'practice' : 'lesson'
  const id = lesson?.id ?? lesson?._id
  const userId = attempt?.user?.id ?? attempt?.user?._id
  const attemptNo = attempt?.attemptNo
  if (!id || !userId) return null

  const base = category === 'practice' ? `/practice/${skill}/${id}/result` : `/lesson/${skill}/${id}/result`
  const q = new URLSearchParams()
  q.set('userId', String(userId))
  if (attemptNo != null) q.set('attemptNo', String(attemptNo))
  return `${base}?${q.toString()}`
}

/** URL trang kết quả writing/reading/listening cho chính học viên (có attemptNo nếu có). */
export function buildLessonResultUrl(lesson, { attemptNo, category } = {}) {
  const skill = lesson?.skill || 'reading'
  const id = lesson?.id ?? lesson?._id
  if (!id) return null
  const cat = lesson?.category === 'practice' ? 'practice' : (category || 'lesson')
  const base = cat === 'practice' ? `/practice/${skill}/${id}/result` : `/lesson/${skill}/${id}/result`
  if (attemptNo == null || attemptNo === '') return base
  const q = new URLSearchParams()
  q.set('attemptNo', String(attemptNo))
  return `${base}?${q.toString()}`
}

export function isModLessonResultView(searchParams) {
  return Boolean(searchParams?.get?.('userId'))
}

export async function fetchLessonProgressForResult(id, searchParams, lessonsService) {
  const userId = searchParams.get('userId')
  const attemptNo = searchParams.get('attemptNo')
  const params = {}
  if (attemptNo) params.attemptNo = attemptNo
  if (userId) {
    return lessonsService.getProgressForUser(id, userId, params)
  }
  return lessonsService.getProgress(id, params)
}
