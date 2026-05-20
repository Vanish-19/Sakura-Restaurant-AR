import AppRoutes from './routes/AppRoutes.jsx'
import ChatbotWidget from './components/organisms/ChatbotWidget.jsx'
import LanguageSwitcher from './components/molecules/LanguageSwitcher.jsx'

export default function App() {
  return (
    <>
      <LanguageSwitcher />
      <AppRoutes />
      <ChatbotWidget />
    </>
  )
}
