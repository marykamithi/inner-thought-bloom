# 🌸 Inner Thought Bloom

*Your personal wellness companion for mindful journaling and mental health tracking*

## ✨ Overview

Inner Thought Bloom is a comprehensive wellness platform that combines journaling, mood tracking, and AI-powered insights to support your mental health journey. Built with privacy-first principles, it provides a safe space to capture thoughts, track wellness metrics, and gain personalized insights for better self-awareness.

## 🚀 Features

### 📝 **Intelligent Journaling**
- **Memory Capture**: Write journal entries with rich text support
- **Voice-to-Text**: Speak your thoughts naturally with advanced speech recognition
- **AI Sentiment Analysis**: Get intelligent mood detection and wellness feedback
- **Guided Prompts**: Access curated prompts for deeper self-reflection
- **Smart Search**: Find entries by content, mood, or AI insights

### 🎯 **Wellness Tracking**
- **Daily Metrics**: Track sleep, exercise, water intake, energy, and stress levels
- **Goal Setting**: Create and monitor personal wellness objectives
- **Progress Visualization**: See your wellness patterns over time
- **Mood Analytics**: Understand emotional trends and triggers

### 📊 **Data & Insights**
- **Export Capabilities**: Download your data in PDF, CSV, or JSON formats
- **Privacy-First**: All data processing happens securely with Supabase
- **Cross-Device Sync**: Access your journal from any device
- **Offline Support**: Continue journaling even without internet

### 🎨 **Beautiful Experience**
- **Adaptive Themes**: Light and dark mode with gentle, calming design
- **Smooth Animations**: Fluid interactions that feel natural
- **Responsive Design**: Perfect experience on desktop, tablet, and mobile
- **Accessible**: Built with accessibility and inclusive design principles

## 🛠 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Components**: shadcn/ui + Radix UI primitives
- **Styling**: Tailwind CSS with custom design system
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)
- **AI/ML**: OpenAI integration for sentiment analysis
- **Voice**: Web Speech API for voice-to-text
- **State Management**: React Query + React Hooks
- **Deployment**: Vercel/Netlify ready

## 📦 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn/pnpm
- Supabase account for backend services

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/marykamithi/inner-thought-bloom.git
   cd inner-thought-bloom
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   Create a `.env.local` file:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Database Setup**
   Run the included Supabase migrations:
   ```bash
   supabase db reset
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## 🗄 Database Schema

The application uses three main tables:

- **`memories`**: Journal entries with sentiment analysis
- **`wellness_goals`**: User-defined wellness objectives
- **`wellness_metrics`**: Daily wellness tracking data

See `supabase/migrations/` for complete schema definitions.

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎨 Design System

The app features a carefully crafted design system with:
- **HSL-based color palette** for perfect theme transitions
- **Gentle gradients and shadows** for a calming aesthetic
- **Smooth animations** using CSS custom properties
- **Responsive typography** optimized for reading

## 🔒 Privacy & Security

- **End-to-end encryption** for sensitive data
- **Local-first architecture** where possible
- **GDPR compliant** data handling
- **No tracking or analytics** without consent
- **Open source** for transparency

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- UI components from [shadcn/ui](https://ui.shadcn.com)
- Icons from [Lucide React](https://lucide.dev)
- Backend powered by [Supabase](https://supabase.com)
- Typography with [Inter](https://rsms.me/inter/) font family

## 📞 Support

If you encounter any issues or have questions:
- 📧 Open an issue on GitHub
- 💬 Join our [Discord community](https://discord.gg/your-invite)
- 📖 Check the [Documentation](https://docs.yourapp.com)

---

**Made with 💖 for mental wellness and self-care**
