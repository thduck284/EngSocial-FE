# EngSocial - English Social Learning Platform (Frontend)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/EngSocial-FE)

## 🚀 Tech Stack

- **Framework:** React 18 + Vite
- **Routing:** React Router DOM v6
- **Styling:** Tailwind CSS
- **Internationalization:** i18next + react-i18next
- **Icons:** Material Symbols

## 📦 Installation

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/EngSocial-FE.git
cd EngSocial-FE

# Install dependencies
npm install

# Create .env file from example
cp .env.example .env

# Start development server
npm run dev
```

## 🌍 Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_NAME=EngSocial
VITE_APP_ENV=development
```

## 📜 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🏗️ Project Structure

```
src/
├── components/      # Reusable components
│   ├── layout/     # Layout components (Header, Footer, etc.)
│   └── ui/         # UI components (Buttons, Cards, etc.)
├── pages/          # Page components
├── constants/      # Constants (routes, API endpoints)
├── raw/            # Raw data
│   ├── skills.js   # Fixed data (won't change)
│   └── mock/       # Mock data (temporary - will be replaced by API)
├── services/       # API service functions
├── utils/          # Utility functions
├── i18n/           # i18n configuration
├── locales/        # Translation files (vi.json, en.json)
└── styles/         # Global styles

```

## 🌐 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

Or use Vercel CLI:

```bash
npm i -g vercel
vercel
```

## 🔗 Links

- **Frontend:** [https://your-app.vercel.app](https://your-app.vercel.app)
- **Backend API:** [Your API URL]

## 📝 Features

- ✅ User Authentication (Login, Register, Forgot Password)
- ✅ Dashboard with stats and goals
- ✅ Skills Practice (Reading, Listening, Writing)
- ✅ Entertainment Games
- ✅ Lesson Detail Pages
- ✅ Community Feed
- ✅ Notifications
- ✅ AI Chatbot Assistant
- ✅ Multi-language Support (Vietnamese, English)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.
