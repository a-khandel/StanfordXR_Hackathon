// import React from 'react'
// import ReactDOM from 'react-dom/client'
// import App from './App'
// import './index.css'

// ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
// 	<React.StrictMode>
// 		<App />
// 	</React.StrictMode>
// )

import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import App from "./App" // your existing app.tsx (might be ./App depending on file name)
import './index.css'
import Dashboard from "./Dashboard"


ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* send users to dashboard first */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* canvas page */}
        <Route path="/app/:canvasId" element={<App />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
