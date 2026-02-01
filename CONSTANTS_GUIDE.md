# EngSocial Frontend

## 📁 Cấu trúc Constants & Services

### 🗂️ Constants (`src/constants/`)

#### `routes.js` - Application Routes
Lưu trữ tất cả các route paths của ứng dụng:

```javascript
import { ROUTES } from '@/constants'

// Sử dụng
<Link to={ROUTES.SKILLS.READING}>Reading</Link>
<Link to={ROUTES.LESSON.LISTENING(lessonId)}>Listening Lesson</Link>
```

#### `api.js` - API Endpoints
Lưu trữ tất cả các API endpoints:

```javascript
import { API_ENDPOINTS, buildApiUrl } from '@/constants'

// Sử dụng
const url = buildApiUrl(API_ENDPOINTS.USER.PROFILE)
const lessonUrl = buildApiUrl(API_ENDPOINTS.SKILLS.READING.DETAIL(lessonId))
```

### 🛠️ Services (`src/services/`)

Các service functions để gọi API:

```javascript
import { authService, userService, skillsService } from '@/services'

// Authentication
await authService.login(email, password)
await authService.register(userData)

// User
const profile = await userService.getProfile()
const stats = await userService.getStats()

// Skills
const lessons = await skillsService.getReadingLessons({ difficulty: 'B2' })
await skillsService.submitReading(lessonId, answers)
```

### 🔧 API Client (`src/utils/api.js`)

Low-level API client với authentication:

```javascript
import { apiClient } from '@/utils/api'

// Generic requests
const data = await apiClient.get('/endpoint')
await apiClient.post('/endpoint', { data })
await apiClient.put('/endpoint', { data })
await apiClient.delete('/endpoint')

// Upload file
await apiClient.upload('/upload', formData)
```

## 🚀 Ví dụ sử dụng

### 1. Fetch Reading Lessons

```javascript
import { skillsService } from '@/services'

function ReadingPage() {
  const [lessons, setLessons] = useState([])

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const data = await skillsService.getReadingLessons({
          difficulty: 'B2',
          topic: 'Business'
        })
        setLessons(data)
      } catch (error) {
        console.error('Failed to fetch lessons:', error)
      }
    }
    fetchLessons()
  }, [])

  return (
    <div>
      {lessons.map(lesson => (
        <Link key={lesson.id} to={ROUTES.SKILLS.READING + `/${lesson.id}`}>
          {lesson.title}
        </Link>
      ))}
    </div>
  )
}
```

### 2. Submit Lesson Answers

```javascript
import { skillsService } from '@/services'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/constants'

function LessonPage({ lessonId }) {
  const navigate = useNavigate()
  const [answers, setAnswers] = useState({})

  const handleSubmit = async () => {
    try {
      const result = await skillsService.submitReading(lessonId, answers)
      alert(`Score: ${result.score}`)
      navigate(ROUTES.SKILLS.READING)
    } catch (error) {
      console.error('Submit failed:', error)
    }
  }

  return (
    <div>
      {/* Lesson content */}
      <button onClick={handleSubmit}>Submit</button>
    </div>
  )
}
```

### 3. User Login

```javascript
import { authService } from '@/services'
import { ROUTES } from '@/constants'

function LoginPage() {
  const navigate = useNavigate()
  
  const handleLogin = async (email, password) => {
    try {
      const { token, user } = await authService.login(email, password)
      localStorage.setItem('authToken', token)
      navigate(ROUTES.DASHBOARD)
    } catch (error) {
      alert(error.message)
    }
  }

  return <LoginForm onSubmit={handleLogin} />
}
```

## 🔐 Environment Variables

Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

Cấu hình API URL:

```
VITE_API_BASE_URL=http://localhost:3000/api
```

## 📝 Lưu ý

- Token authentication tự động thêm vào headers
- Tất cả API calls có error handling
- Response tự động parse JSON
- Support upload files với FormData
