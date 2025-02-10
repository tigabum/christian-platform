import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Layout from "../components/layout/Layout";
import LoginScreen from "../screens/auth/LoginScreen";
import DashboardScreen from "../screens/dashboard/DashboardScreen";
import ResponderListScreen from "../screens/responders/ResponderListscreen";
import ResponderCreateScreen from "../screens/responders/ResponderCreateScreen";
import ResponderDetailScreen from "../screens/responders/ResponderDetailScreen";

const AppRouter = () => {
  const { admin, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Replace with proper loading component
  }

  return (
    <BrowserRouter>
      <Routes>
        {!admin ? (
          <Route path="/login" element={<LoginScreen />} />
        ) : (
          <Route element={<Layout />}>
            <Route path="/" element={<DashboardScreen />} />
            <Route path="/responders" element={<ResponderListScreen />} />
            <Route
              path="/responders/create"
              element={<ResponderCreateScreen />}
            />
            <Route path="/responders/:id" element={<ResponderDetailScreen />} />
          </Route>
        )}
        <Route path="*" element={<Navigate to={admin ? "/" : "/login"} />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
