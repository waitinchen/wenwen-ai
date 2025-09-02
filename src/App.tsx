import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ChatInterface from '@/components/ChatInterface'
import AdminLogin from '@/components/admin/AdminLogin'
import DashboardHome from '@/components/admin/DashboardHome'
import AdminLayout from '@/components/admin/AdminLayout'
import AnalyticsPage from '@/components/admin/AnalyticsPage'
import ConversationHistoryManager from '@/components/admin/ConversationHistoryManager'
import ConversationDetails from '@/components/admin/ConversationDetails'
import StoreManagement from '@/components/admin/StoreManagement'
import TrainingDataManagement from '@/components/admin/TrainingDataManagement'
import FaqManagement from '@/components/admin/FaqManagement'
import AIConfigManagement from '@/components/admin/AIConfigManagement'
import QuickQuestionsPage from '@/components/admin/QuickQuestionsPage'
import ActivitiesPage from '@/components/admin/ActivitiesPage'
import ContentWarningManager from '@/components/admin/ContentWarningManager'
import InteractionFilterPage from '@/components/admin/InteractionFilterPage'
import ProtectedRoute from '@/components/admin/ProtectedRoute'
import { AdminAuthProvider } from '@/contexts/AdminAuthContext'
import { UserAuthProvider } from '@/contexts/UserAuthContext'

function App() {
  return (
    <AdminAuthProvider>
      <UserAuthProvider>
        <Router>
        <Routes>
          {/* 前台客服聊天界面 */}
          <Route path="/" element={<ChatInterface />} />
          
          {/* 管理後台登入 */}
          <Route path="/admin/login" element={<AdminLogin />} />
          
          {/* 管理後台主路由 */}
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }>
            {/* 儀表板首頁 */}
            <Route index element={<DashboardHome />} />
            
            {/* 内容管理 */}
            <Route path="conversations" element={<ConversationHistoryManager />} />
            <Route path="conversations/:sessionId" element={<ConversationDetails />} />
            <Route path="stores" element={<StoreManagement />} />
            <Route path="activities" element={<ActivitiesPage />} />
            <Route path="training" element={<TrainingDataManagement />} />
            <Route path="faqs" element={<FaqManagement />} />
            <Route path="quick-questions" element={<QuickQuestionsPage />} />
            
            {/* 數據統計 */}
            <Route path="analytics" element={<AnalyticsPage />} />
            
            {/* 系統設定 */}
            <Route path="ai-config" element={<AIConfigManagement />} />
            <Route path="content-warnings" element={<ContentWarningManager />} />
            <Route path="interaction-filters" element={<InteractionFilterPage />} />
          </Route>
        </Routes>
      </Router>
      </UserAuthProvider>
    </AdminAuthProvider>
  )
}

export default App