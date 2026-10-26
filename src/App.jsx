import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import { Leaf } from 'lucide-react';
// Add page imports here
import Landing from './pages/Landing';
import CheckProgress from './pages/CheckProgress';
import Dashboard from './pages/Dashboard';
import HowItWorks from './pages/HowItWorks';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div className="mx-auto w-10 h-10 rounded-xl bg-primary flex items-center justify-center mb-4">
            <Leaf className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="text-base font-semibold text-foreground">NitrateRisk Iowa</div>
          <p className="text-sm text-muted-foreground mt-1">Getting things ready…</p>
          <div className="mt-5 w-6 h-6 mx-auto border-[3px] border-border border-t-primary rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      {/* Add your page Route elements here */}
      <Route path="/" element={<Landing />} />
      <Route path="/checking" element={<CheckProgress />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/how-it-works" element={<HowItWorks />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App