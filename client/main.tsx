import React from "react"
import ReactDOM from "react-dom/client"
import { HashRouter, Routes, Route, Navigate } from "react-router-dom"
import "./index.css"

import App from "./App"
import Dashboard from "./Dashboard"
import SignIn from "./SignIn"

import { AuthProvider } from "./auth"
import ProtectedRoute from "./ProtectedRoute"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <HashRouter>
        <Routes>
          {/* default */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* public */}
          <Route path="/signin" element={<SignIn />} />

          {/* protected */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/app/:canvasId"
            element={
              <ProtectedRoute>
                <App />
              </ProtectedRoute>
            }
          />
        </Routes>
      </HashRouter>
    </AuthProvider>
  </React.StrictMode>
)
