import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginView } from '../modules/auth/views/LoginView';
import { RegisterView } from '../modules/auth/views/RegisterView';
import { ProfileView } from '../modules/auth/views/ProfileView';
import { DailyView } from '../modules/daily/views/DailyView';
import { NotesView } from '../modules/notes/views/NotesView';
import { ReportsView } from '../modules/reports/views/ReportsView';
import { MastersView } from '../modules/masters/views/MastersView';
import { AdminDashboardView } from '../modules/admin/views/AdminDashboardView';
import { ProtectedRoute } from '../components/ProtectedRoute';

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginView />} />
        <Route path="/register" element={<RegisterView />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/daily" element={<DailyView />} />
          <Route path="/notes" element={<NotesView />} />
          <Route path="/reports" element={<ReportsView />} />
          <Route path="/masters" element={<MastersView />} />
          <Route path="/admin" element={<AdminDashboardView />} />
          <Route path="/profile" element={<ProfileView />} />
          <Route path="/" element={<Navigate to="/daily" replace />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
