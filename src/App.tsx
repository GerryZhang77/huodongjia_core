import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ConfigProvider } from 'antd-mobile'
import zhCN from 'antd-mobile/es/locales/zh-CN'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ActivityDetail from './pages/ActivityDetail'
import ActivityForm from './pages/ActivityForm'
import EnrollmentManagement from './pages/EnrollmentManagement'
import MatchingConfiguration from './pages/MatchingConfiguration'
import './index.css'

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/activity/create" element={<ActivityForm />} />
            <Route path="/activity/:id" element={<ActivityDetail />} />
            <Route path="/activity/:id/edit" element={<ActivityForm />} />
            <Route path="/activity/:id/enrollment" element={<EnrollmentManagement />} />
            <Route path="/activity/:id/matching" element={<MatchingConfiguration />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </ConfigProvider>
  )
}

export default App
