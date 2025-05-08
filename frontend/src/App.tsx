import { Routes, Route, Navigate } from "react-router-dom"
// import { Toaster } from "./components/ui/toaster"
import { ThemeProvider } from "./components/theme-provider"
import Login from "./components/Login"
import Register from "./components/Register"
import ProtectedRoute from "./components/ProtectedRoute"
import { useAuthStore } from "./store/authStore"
import Home from "./pages/Home"
import Groups from "./pages/Group"
import Layout from "./components/layout/Layout"

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return (
    <ThemeProvider defaultTheme="system" storageKey="task-manager-theme">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <Home />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/groups"
          element={
            <ProtectedRoute>
              <Layout>
                <Groups />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} />} />
      </Routes>
      {/* <Toaster /> */}
    </ThemeProvider>
  )
}

export default App
