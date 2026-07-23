import './index.css'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Login from './pages/Login/Login.tsx'
import Header from './components/Header/Header.tsx'
import Home from './pages/Home/Home.tsx'
import Server from './pages/Server/Server.tsx'
import Chatroom from './pages/Chatroom/Chatroom.tsx'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute.tsx'
import { AuthProvider } from './components/AuthProvider/AuthProvider.tsx'

export default function App() {
    return (
    <>
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />

                    <Route element={<ProtectedRoute />}>
                        <Route element={<Header />}>
                            <Route index element={<Home />} />
                            <Route path="/server/:serverId" element={<Server />} />
                            <Route path="/chatroom/:chatroomId" element={<Chatroom />} />
                        </Route>
                    </Route>

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    </>
    )
}