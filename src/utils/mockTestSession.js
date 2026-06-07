/** Whether the lesson is part of an active mock test session in localStorage. */
export function isLessonInActiveMockTest(lessonId) {
  if (!lessonId) return false
  try {
    const raw = localStorage.getItem('engsocial_mock_test')
    if (!raw) return false
    const parsed = JSON.parse(raw)
    return (parsed.lessons || []).some((l) => {
      const lid = l.id || l._id
      return String(lid) === String(lessonId) || l.slug === lessonId
    })
  } catch {
    return false
  }
}
