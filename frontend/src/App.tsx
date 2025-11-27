import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import {
  SignIn,
  SignUp,
  SignedIn,
  SignedOut,
  UserButton,
  useAuth,
} from '@clerk/clerk-react';
import MorningRoutinePage from './pages/MorningRoutinePage';
import AnxietyTrackerPage from './pages/AnxietyTrackerPage';
import ReportsPage from './pages/ReportsPage';
import PublicReportPage from './pages/PublicReportPage';
import Layout from './components/Layout';
import apiService from './services/api';

function AppContent() {
  const { getToken } = useAuth();

  useEffect(() => {
    // Configurar o provider de token para o serviço de API
    apiService.setTokenProvider(async () => {
      try {
        return await getToken();
      } catch (error) {
        console.error('Erro ao obter token:', error);
        return null;
      }
    });
  }, [getToken]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas públicas */}
        <Route path="/sign-in/*" element={<SignIn routing="path" path="/sign-in" />} />
        <Route path="/sign-up/*" element={<SignUp routing="path" path="/sign-up" />} />
        <Route path="/report/public/:token" element={<PublicReportPage />} />

        {/* Rotas protegidas */}
        <Route
          path="/*"
          element={
            <>
              <SignedIn>
                <Layout>
                  <Routes>
                    <Route path="/" element={<MorningRoutinePage />} />
                    <Route path="/anxiety" element={<AnxietyTrackerPage />} />
                    <Route path="/reports" element={<ReportsPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Layout>
              </SignedIn>
              <SignedOut>
                <Navigate to="/sign-in" replace />
              </SignedOut>
            </>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return <AppContent />;
}

export default App;
