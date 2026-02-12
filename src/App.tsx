import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/auth/auth-context';
import { Login } from './pages/auth/login';
import { ProtectedRoute } from './components/protected-route';
import { Dashboard } from './pages/dashboard/dashboard';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/" element={<Dashboard />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;