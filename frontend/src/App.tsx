import { Route, Routes } from "react-router-dom";
import { Navigation } from "./components/Navigation";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { DashboardPage } from "./pages/DashboardPage";
import { EditUserPage } from "./pages/EditUserPage";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { TokenValidatorPage } from "./pages/TokenValidatorPage";
import { UsersPage } from "./pages/UsersPage";

export default function App() {
  return (
    <>
      <Navigation />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/cadastro" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/validador" element={<TokenValidatorPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/usuarios"
          element={
            <ProtectedRoute allowedProfiles={["FUNCIONARIO"]}>
              <UsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/usuarios/:id/editar"
          element={
            <ProtectedRoute allowedProfiles={["FUNCIONARIO"]}>
              <EditUserPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="*"
          element={
            <main className="page-shell">
              <section className="panel">
                <p className="eyebrow">Rota nao encontrada</p>
                <h1>Esta tela nao existe</h1>
                <p className="muted">
                  Use a navegacao superior para voltar ao fluxo de demonstracao.
                </p>
              </section>
            </main>
          }
        />
      </Routes>
    </>
  );
}
