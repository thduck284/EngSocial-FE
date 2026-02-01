# Quick Start Guide

## 🚀 Deploy trong 5 phút

### Bước 1: Push lên GitHub
```bash
cd D:\KLTN\EngSocial-FE
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/thduck284/EngSocial-FE.git
git push -u origin main
```

### Bước 2: Deploy Vercel
1. Vào https://vercel.com/new
2. Import repository `EngSocial-FE`
3. Thêm Environment Variables:
   ```
   VITE_API_BASE_URL=https://your-api.com/api
   ```
4. Click Deploy

### Xong! 🎉

URL của bạn: `https://your-app.vercel.app`

---

## 📝 Chi tiết đầy đủ

Xem file [DEPLOYMENT.md](./DEPLOYMENT.md) để biết hướng dẫn chi tiết.
