import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import type { Perfil } from "../types";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedProfiles?: Perfil[];
}

export function ProtectedRoute({
  children,
  allowedProfiles
}: ProtectedRouteProps) {
  const { token, user, isChecking } = useAuth();
  const location = useLocation();

  if (isChecking) {
    return (
      <main className="page-shell">
        <section className="panel">
          <p>Validando sessao...</p>
        </section>
      </main>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedProfiles && !allowedProfiles.includes(user.perfil)) {
    return (
      <main className="page-shell">
        <section className="panel">
          <p className="eyebrow">Acesso restrito</p>
          <h1>Acesso permitido apenas para FUNCIONARIO</h1>
          <p className="muted">
            O usuario autenticado possui perfil {user.perfil} e nao pode acessar
            a listagem administrativa de usuarios.
          </p>
        </section>
      </main>
    );
  }

  return <>{children}</>;
}
