# EngSocial-FE

Giao diện web cho nền tảng học tiếng Anh xã hội **EngSocial** — bảng tin, cộng đồng, nhắn tin, luyện kỹ năng, gamification, game realtime, chatbot AI và cổng quản trị/điều phối viên.

**Backend đi kèm:** [EngSocial-BE](https://github.com/thduck284/EngSocial-BE)

## Tech stack

| Thành phần | Công nghệ |
|------------|-----------|
| UI | React 18 |
| Build | Vite 5 |
| Styling | Tailwind CSS 3 |
| Routing | React Router 6 |
| Realtime | Socket.IO Client |
| i18n | i18next (Vi / En) |
| Toast | react-hot-toast |

## Kiến trúc tích hợp

Frontend gọi **EngSocial-BE** làm API trung tâm. Một số tính năng AI/microservice do BE proxy:

```text
EngSocial-FE (localhost:3000 / Render)
        │
        ▼
EngSocial-BE (/api) ──► MongoDB Atlas
        │
        ├── Chatbot AI (Flask qua BE)
        ├── AI kiểm duyệt nội dung (qua BE)
        └── AI matchmaking game (VITE_API_AI_MATCHING_URL)
```

> Cổng **Moderator** (`/mod/:userId/...`) và **Admin** (`/adminstrator/:userId/...`) nằm trong cùng app FE, không cần frontend riêng.

## Yêu cầu

- Node.js >= 18
- npm
- [EngSocial-BE](https://github.com/thduck284/EngSocial-BE) đang chạy (local hoặc Render)
- (Tuỳ chọn) Google / Facebook Developer — đăng nhập OAuth
- (Tuỳ chọn) Giphy API key — gửi GIF trong tin nhắn

## Cài đặt local

```bash
cd EngSocial-FE
npm install

# Tạo file .env (xem mục Environment bên dưới)

npm run dev
```

Ứng dụng mặc định: `http://localhost:3000`

> Chạy song song **EngSocial-BE** tại `http://localhost:5000` và khai báo `CORS_ORIGIN=http://localhost:3000` trong `.env` của BE.

## Environment variables

Tạo file `.env` ở thư mục gốc `EngSocial-FE/`. **Không commit** file này.

### Bắt buộc

| Biến | Mô tả |
|------|--------|
| `VITE_API_LOCAL_URL` | URL backend khi dev local, vd: `http://localhost:5000` |
| `VITE_API_RENDER_URL` | URL backend trên Render (dùng khi không chạy BE local hoặc làm fallback) |

FE tự chọn API theo hostname:
- `localhost` / `127.0.0.1` → `VITE_API_LOCAL_URL`
- Production → `VITE_API_RENDER_URL`

### Đăng nhập OAuth

| Biến | Mô tả |
|------|--------|
| `VITE_GOOGLE_CLIENT_ID` | Client ID Google Sign-In |
| `VITE_FACEBOOK_APP_ID` | Facebook App ID |
| `VITE_FACEBOOK_GRAPH_VERSION` | (Tuỳ chọn) Mặc định `v19.0` |

### Tính năng tuỳ chọn

| Biến | Mô tả |
|------|--------|
| `VITE_API_AI_MATCHING_URL` | URL ghép trò chơi AI, vd: `http://localhost:9999/api/matchmake` |
| `VITE_GIPHY_API_KEY` | API key Giphy cho GIF trong chat |
| `VITE_ADMIN_APP_URL` | URL app admin (nếu tách riêng; mặc định dùng route nội bộ `/mod/...`) |
| `VITE_USE_DEV_HTTPS` | `1` hoặc `true` — bật HTTPS cho Vite dev server |

### Ví dụ `.env` local

```env
VITE_API_LOCAL_URL=http://localhost:5000
VITE_API_RENDER_URL=https://your-engsocial-be.onrender.com
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_FACEBOOK_APP_ID=your-facebook-app-id
VITE_API_AI_MATCHING_URL=http://localhost:9999/api/matchmake
```

## Scripts

| Lệnh | Mô tả |
|------|--------|
| `npm run dev` | Chạy dev server tại port 3000 (tự mở trình duyệt) |
| `npm run build` | Build production → thư mục `dist/` |
| `npm run preview` | Xem trước bản build local |

## Cấu trúc thư mục

```text
EngSocial-FE/
├── src/
│   ├── main.jsx              # Entry + React Router
│   ├── App.jsx               # Route tree (user / mod / admin)
│   ├── pages/                # Trang theo feature
│   ├── components/           # UI tái sử dụng (layout, post, messages, …)
│   ├── hooks/                # Custom hooks
│   ├── services/             # Gọi REST API
│   ├── context/              # AuthContext, PostFeedSyncContext
│   ├── constants/            # api.js (endpoints), routes
│   ├── utils/                # socketClient, helpers
│   ├── locales/              # vi.json, en.json
│   ├── i18n/                 # Cấu hình i18next
│   ├── data/                 # Dữ liệu tĩnh (từ vựng, XP, …)
│   └── styles/               # Tailwind / global CSS
├── public/
├── index.html
├── vite.config.js
├── tailwind.config.js
├── package.json
└── .env                      # Local only — không push lên git
```

## Tính năng chính

| Nhóm | Route gợi ý | Mô tả |
|------|---------------|--------|
| Auth | `/login`, `/register` | Đăng ký, đăng nhập email/OAuth, quên mật khẩu |
| Dashboard | `/home` | Bảng tin, bài viết, sidebar |
| Học tập | `/lesson`, `/practice` | Bài học & luyện Reading / Listening / Writing |
| Thi thử | `/practice/mock-test` | Mock test tổng hợp + kết quả |
| Từ vựng | `/words-notes` | Chủ đề, flashcard, match game, test |
| Gamification | `/quests`, `/achievements` | Nhiệm vụ, thử thách, thành tích |
| Cộng đồng | `/community/*` | Nhóm, bài viết, khám phá |
| Nhắn tin | `/messages` | Chat cá nhân / nhóm |
| Giải trí | `/practice/entertainment` | Word Scramble, Snake Word (Socket.IO) |
| Chatbot | (trong app) | Trợ lý AI học tiếng Anh |
| Hồ sơ | `/profile` | Cá nhân, cài đặt, thông báo |
| Moderator | `/mod/:userId/*` | Quản lý bài học, quest, mock test, … |
| Admin | `/adminstrator/:userId/*` | Users, báo cáo vi phạm |

Danh sách route đầy đủ: `src/constants/api.js` → `ROUTES`.

## Deploy lên Render

1. Kết nối repo GitHub với Render **Static Site** hoặc **Web Service**.
2. **Build command:** `npm install && npm run build`
3. **Publish directory:** `dist`
4. Thêm **Environment Variables** (giống `.env`, không dùng file `.env` trên cloud):

```env
VITE_API_RENDER_URL=https://your-engsocial-be.onrender.com
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_FACEBOOK_APP_ID=your-facebook-app-id
VITE_API_AI_MATCHING_URL=https://your-ai-matching.onrender.com/api/matchmake
```

5. Cấu hình **Rewrite rule** (SPA fallback) — mọi path → `index.html`.
6. Đảm bảo BE đã khai báo origin FE trong `CORS_ORIGIN`.

**Production (tham khảo):** `https://engsocial-fe.onrender.com`

## Ghi chú phát triển

- Alias import: `@/` → `src/`, `@data/`, `@vocabulary/`
- Socket.IO kết nối cùng origin với API (bỏ suffix `/api`)
- Guest có thể xem một số trang; nhiều tính năng yêu cầu đăng nhập (`GuestRestrictedPage`)
- Đổi ngôn ngữ UI: `LanguageSwitcher` (Vi / En)

## License

MIT
