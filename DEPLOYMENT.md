# Hướng dẫn Deploy EngSocial Frontend lên GitHub & Vercel

## 📋 Chuẩn bị

### 1. Kiểm tra Git đã cài đặt
```bash
git --version
```

Nếu chưa có, tải tại: https://git-scm.com/downloads

### 2. Tạo tài khoản
- GitHub: https://github.com/signup
- Vercel: https://vercel.com/signup (có thể đăng nhập bằng GitHub)

---

## 🚀 Bước 1: Push code lên GitHub

### 1.1. Khởi tạo Git repository
```bash
cd D:\KLTN\EngSocial-FE
git init
git add .
git commit -m "Initial commit: Setup EngSocial Frontend"
```

### 1.2. Tạo repository mới trên GitHub
1. Vào https://github.com/new
2. Đặt tên repository: `EngSocial-FE`
3. Chọn **Public** hoặc **Private**
4. **KHÔNG** tick "Add a README" (vì đã có sẵn)
5. Click **Create repository**

### 1.3. Kết nối và push
```bash
# Thay YOUR_USERNAME bằng: thduck284
git remote add origin https://github.com/thduck284/EngSocial-FE.git
git branch -M main
git push -u origin main
```

**Lưu ý:** Nếu lần đầu push, Git sẽ yêu cầu đăng nhập GitHub.

---

## 🌐 Bước 2: Deploy lên Vercel

### Cách 1: Deploy qua Vercel Dashboard (Khuyên dùng)

1. Vào https://vercel.com/new
2. Click **Import Git Repository**
3. Chọn repository `EngSocial-FE` từ GitHub
4. **Configure Project:**
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. **Environment Variables** (quan trọng!):
   ```
   VITE_API_BASE_URL=https://your-backend-api.com/api
   VITE_APP_NAME=EngSocial
   VITE_APP_ENV=production
   ```
6. Click **Deploy**

### Cách 2: Deploy qua Vercel CLI

```bash
# Cài Vercel CLI
npm i -g vercel

# Login vào Vercel
vercel login

# Deploy
vercel

# Deploy production
vercel --prod
```

---

## ⚙️ Bước 3: Cấu hình Environment Variables

### Trên Vercel Dashboard:

1. Vào project settings
2. Click tab **Environment Variables**
3. Thêm các biến:

| Key | Value | Environment |
|-----|-------|------------|
| `VITE_API_BASE_URL` | `https://your-api.com/api` | Production |
| `VITE_APP_NAME` | `EngSocial` | All |
| `VITE_APP_ENV` | `production` | Production |

4. Click **Save**
5. **Redeploy** project để áp dụng

---

## 🔄 Cập nhật code sau này

```bash
# Sau khi sửa code
git add .
git commit -m "Update: mô tả thay đổi"
git push

# Vercel sẽ tự động deploy lại
```

---

## 🔗 Domain & URL

### URL mặc định
Sau khi deploy, Vercel sẽ cung cấp URL:
```
https://engsocial-fe-xxxxx.vercel.app
```

### Thêm Custom Domain (Tùy chọn)
1. Vào **Project Settings** > **Domains**
2. Add domain của bạn (VD: `engsocial.com`)
3. Cấu hình DNS theo hướng dẫn của Vercel

---

## 🐛 Troubleshooting

### Lỗi: "Page not found" khi refresh
✅ **Đã fix:** File `vercel.json` đã cấu hình SPA routing

### Lỗi: "Module not found" 
```bash
# Xóa node_modules và cài lại
rm -rf node_modules
npm install
```

### Lỗi: API không kết nối được
- Kiểm tra `VITE_API_BASE_URL` trong Environment Variables
- Đảm bảo backend API đã enable CORS cho domain Vercel

### Build fails
```bash
# Test build locally trước
npm run build
npm run preview
```

---

## 📱 Kiểm tra sau Deploy

1. ✅ Trang chủ load được
2. ✅ Đăng nhập/Đăng ký hoạt động
3. ✅ Routing các trang khác nhau
4. ✅ Chuyển ngôn ngữ (VI/EN)
5. ✅ Responsive trên mobile

---

## 🎉 Xong rồi!

Frontend của bạn đã live tại:
- **GitHub:** `https://github.com/thduck284/EngSocial-FE`
- **Vercel:** `https://your-app.vercel.app`

Mỗi lần push code lên GitHub, Vercel sẽ tự động build & deploy!
