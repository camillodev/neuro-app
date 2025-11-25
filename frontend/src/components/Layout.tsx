import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserButton } from '@clerk/clerk-react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container-center py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <h1 className="text-2xl font-bold text-gradient">NeuroApp</h1>

              <nav className="hidden md:flex gap-4">
                <Link
                  to="/"
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    isActive('/')
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Rotina da Manhã
                </Link>

                <Link
                  to="/anxiety"
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    isActive('/anxiety')
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Ansiedade
                </Link>

                <Link
                  to="/reports"
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    isActive('/reports')
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Relatórios
                </Link>
              </nav>
            </div>

            <UserButton afterSignOutUrl="/sign-in" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-center py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-200 bg-white">
        <div className="container-center py-6 text-center text-sm text-gray-600">
          <p>NeuroApp - Sua jornada neurodivergente, no seu ritmo.</p>
        </div>
      </footer>
    </div>
  );
}
