import React from "react";
import { AuthProvider } from "./contexts/AuthContext";
import AppRouter from "./navigation/AppRouter";

const App = () => {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
};

export default App;
