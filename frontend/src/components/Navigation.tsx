import {
  Home,
  LayoutDashboard,
  LogIn,
  LogOut,
  ShieldCheck,
  UserPlus,
  Users
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Navigation() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  function handleSignOut() {
    signOut();
    navigate("/");
  }

  return (
    <header className="topbar">
      <nav className="nav-shell" aria-label="Navegação principal">
        <NavLink to="/" className="brand">
          <ShieldCheck size={22} aria-hidden="true" />
          <span>SisExt-SI</span>
        </NavLink>

        <div className="nav-links">
          <NavLink to="/" className="nav-link">
            <Home size={18} aria-hidden="true" />
            Início
          </NavLink>

          <NavLink to="/validador" className="nav-link">
            <ShieldCheck size={18} aria-hidden="true" />
            Validação
          </NavLink>

          {!user && (
            <>
              <NavLink to="/login" className="nav-link">
                <LogIn size={18} aria-hidden="true" />
                Entrar
              </NavLink>
              <NavLink to="/cadastro" className="nav-link">
                <UserPlus size={18} aria-hidden="true" />
                Cadastro
              </NavLink>
            </>
          )}

          {user && (
            <>
              <NavLink to="/dashboard" className="nav-link">
                <LayoutDashboard size={18} aria-hidden="true" />
                Dashboard
              </NavLink>

              {user.perfil === "FUNCIONARIO" && (
                <NavLink to="/usuarios" className="nav-link">
                  <Users size={18} aria-hidden="true" />
                  Usuários
                </NavLink>
              )}

              <button className="nav-button" type="button" onClick={handleSignOut}>
                <LogOut size={18} aria-hidden="true" />
                Sair
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
