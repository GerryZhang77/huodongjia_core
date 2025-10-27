import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ConfigProvider } from "antd-mobile";
import { QueryClientProvider } from "@tanstack/react-query";
import zhCN from "antd-mobile/es/locales/zh-CN";
import { queryClient } from "./lib/queryClient";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Login from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import ActivityDetail from "./pages/ActivityDetail";
import ActivityCreate from "./pages/ActivityCreate";
import ActivityEdit from "./pages/ActivityEdit";
import EnrollmentManagement from "./pages/EnrollmentManagement";
import MatchingConfiguration from "./pages/MatchingConfiguration";
import ComponentShowcase from "./pages/ComponentShowcase";
import "./index.css";

// 判断是否为开发环境
const isDevelopment = import.meta.env.DEV;

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider locale={zhCN}>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              {/* 公开路由 */}
              <Route path="/login" element={<Login />} />

              {/* 受保护的路由 - 需要登录 */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/activity/create"
                element={
                  <ProtectedRoute>
                    <ActivityCreate />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/activity/:id"
                element={
                  <ProtectedRoute>
                    <ActivityDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/activity/:id/edit"
                element={
                  <ProtectedRoute>
                    <ActivityEdit />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/activity/:id/enrollment"
                element={
                  <ProtectedRoute>
                    <EnrollmentManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/activity/:id/matching"
                element={
                  <ProtectedRoute>
                    <MatchingConfiguration />
                  </ProtectedRoute>
                }
              />

              {/* 组件展示页面 - 仅开发环境可访问 */}
              {isDevelopment && (
                <Route path="/components" element={<ComponentShowcase />} />
              )}

              {/* 默认路由 */}
              <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
          </div>
        </Router>
      </ConfigProvider>
    </QueryClientProvider>
  );
}

export default App;
