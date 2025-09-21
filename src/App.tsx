import React, { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AdminAuthProvider } from '@/contexts/AdminAuthContext'
import { UserAuthProvider } from '@/contexts/UserAuthContext'
import QueryProvider from '@/contexts/QueryProvider'
import { ToastProvider } from '@/components/Toast'
import LoadingSpinner from '@/components/LoadingSpinner'

// 懶加載組件
const ChatInterface = lazy(() => import('@/components/ChatInterface'))
const AdminLogin = lazy(() => import('@/components/admin/AdminLogin'))
const DashboardHome = lazy(() => import('@/components/admin/DashboardHome'))
const AdminLayout = lazy(() => import('@/components/admin/AdminLayout'))
const AnalyticsPage = lazy(() => import('@/components/admin/AnalyticsPage'))
const ConversationHistoryManager = lazy(() => import('@/components/admin/ConversationHistoryManager'))
const ConversationDetails = lazy(() => import('@/components/admin/ConversationDetails'))
const StoreManagement = lazy(() => import('@/components/admin/StoreManagement'))
const TrainingDataManagement = lazy(() => import('@/components/admin/TrainingDataManagement'))
const FaqManagement = lazy(() => import('@/components/admin/FaqManagement'))
const AIConfigManagement = lazy(() => import('@/components/admin/AIConfigManagement'))
const QuickQuestionsPage = lazy(() => import('@/components/admin/QuickQuestionsPage'))
const ActivitiesPage = lazy(() => import('@/components/admin/ActivitiesPage'))
const ContentWarningManager = lazy(() => import('@/components/admin/ContentWarningManager'))
const InteractionFilterPage = lazy(() => import('@/components/admin/InteractionFilterPage'))
const ProtectedRoute = lazy(() => import('@/components/admin/ProtectedRoute'))

function App() {
  return (
    <QueryProvider>
      <ToastProvider>
        <AdminAuthProvider>
          <UserAuthProvider>
            <Router>
              <Suspense fallback={<LoadingSpinner />}>
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
              </Suspense>
            </Router>
          </UserAuthProvider>
        </AdminAuthProvider>
      </ToastProvider>
    </QueryProvider>
  )
}

export default App