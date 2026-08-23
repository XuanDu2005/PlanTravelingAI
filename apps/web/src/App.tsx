import { ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './store/AuthContext';
import { ThemeProvider } from './store/ThemeContext';
import { ConfirmProvider } from './components/ConfirmProvider';
import { FavoritesProvider } from './store/FavoritesProvider';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/Home/HomePage';
import LoginPage from './pages/Login/LoginPage';
import RegisterPage from './pages/Register/RegisterPage';
import CreateTripPage from './pages/CreateTrip/CreateTripPage';
import MyTripsPage from './pages/MyTrips/MyTripsPage';
import TripDetailPage from './pages/TripDetail/TripDetailPage';
import RecommendationsPage from './pages/Recommendations/RecommendationsPage';
import RecommendationDetailPage from './pages/Recommendations/RecommendationDetailPage';
import ProfilePage from './pages/Profile/ProfilePage';
import AdminDashboardPage from './admin/Dashboard/AdminDashboardPage';
import AdminUsersPage from './admin/Users/AdminUsersPage';
import AdminRecommendationsPage from './admin/Recommendations/AdminRecommendationsPage';
import AdminRecommendationFormPage from './admin/Recommendations/AdminRecommendationFormPage';
import AdminTripsPage from './admin/Trips/AdminTripsPage';
import AdminAnalyticsPage from './admin/Analytics/AdminAnalyticsPage';
import AdminSettingsPage from './admin/Settings/AdminSettingsPage';
import AdminHeroPage from './admin/Hero/AdminHeroPage';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ConfirmProvider>
          <FavoritesGate>
          <Routes>
        {/* Public site */}
        <Route element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="recommendations" element={<RecommendationsPage />} />
          <Route
            path="recommendations/:id"
            element={<RecommendationDetailPage />}
          />

          <Route element={<ProtectedRoute />}>
            <Route path="create-trip" element={<CreateTripPage />} />
            <Route path="trips" element={<MyTripsPage />} />
            <Route path="trips/:id" element={<TripDetailPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
        </Route>

        {/* Admin area */}
        <Route
          path="admin"
          element={
            <ProtectedRoute requireAdmin>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="trips" element={<AdminTripsPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="recommendations" element={<AdminRecommendationsPage />} />
          <Route
            path="recommendations/new"
            element={<AdminRecommendationFormPage mode="create" />}
          />
          <Route
            path="recommendations/:id/edit"
            element={<AdminRecommendationFormPage mode="edit" />}
          />
          <Route path="analytics" element={<AdminAnalyticsPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
          <Route path="hero" element={<AdminHeroPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </FavoritesGate>
        </ConfirmProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

function FavoritesGate({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  return (
    <FavoritesProvider enabled={!!user}>{children}</FavoritesProvider>
  );
}
