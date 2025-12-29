import { Routes, Route } from "react-router-dom"
import HomePage from "@/pages/HomePage"
import ViewSecretPage from "@/pages/ViewSecretPage"

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/secret" element={<ViewSecretPage />} />
    </Routes>
  )
}

export default App
