import { FormEvent, useEffect, useState } from "react";
import { KeyRound, LogIn } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MessageBanner } from "../components/MessageBanner";
import { useAuth } from "../context/AuthContext";
import { getApiErrorMessage } from "../utils/errors";

interface LocationState {
  from?: {
    pathname?: string;
  };
}

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate, user]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!email.trim() || !senha.trim()) {
      setError("Informe e-mail e senha.");
      return;
    }

    setIsSubmitting(true);

    try {
      await signIn(email.trim().toLowerCase(), senha);
      const state = location.state as LocationState | null;
      navigate(state?.from?.pathname || "/dashboard", { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="page-shell narrow">
      <section className="panel">
        <p className="eyebrow">Autenticação</p>
        <h1>Acessar o Módulo A</h1>
        <p className="muted">
          Use seu e-mail e senha para autenticação e emissão do token JWT.
        </p>

        <MessageBanner kind="error">{error}</MessageBanner>

        <form className="form" onSubmit={handleSubmit}>
          <label>
            E-mail
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </label>

          <label>
            Senha
            <input
              type="password"
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              autoComplete="current-password"
              required
            />
          </label>

          <button className="button button-primary full-width" type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <KeyRound size={18} aria-hidden="true" />
            ) : (
              <LogIn size={18} aria-hidden="true" />
            )}
            {isSubmitting ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="muted centered-copy">
          Ainda não tem conta? <Link className="inline-link" to="/cadastro">Cadastre um usuário</Link>.
        </p>
      </section>
    </main>
  );
}
