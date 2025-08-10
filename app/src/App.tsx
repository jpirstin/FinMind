import { Outlet } from 'react-router-dom'
import Navbar from './components/Navbar'
import './App.css'

export default function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="container">
        <Outlet />
      </main>
    </div>
  )
}
