import { useEffect, useState } from "react";
import { Copy, LogOut, RefreshCw, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MessageBanner } from "../components/MessageBanner";
import { StatusBadge } from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";
import type { ValidarTokenResponse } from "../types";
import { getApiErrorMessage } from "../utils/errors";
import { summarizeToken } from "../utils/format";
import { getPerfilLabel, getStatusLabel, getTokenReasonLabel } from "../utils/labels";

export function DashboardPage() {
  const { token, user, signOut, validateCurrentToken } = useAuth();
  const [validation, setValidation] = useState<ValidarTokenResponse | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    validateCurrentToken()
      .then((response) => {
        if (!active) return;

        if (response && !response.valido) {
          navigate("/login", { replace: true });
          return;
        }

        setValidation(response);
      })
      .catch(() => {
        if (active) {
          signOut();
          navigate("/login", { replace: true });
        }
      });

    return () => {
      active = false;
    };
  }, [navigate, signOut, validateCurrentToken]);

  async function handleValidate() {
    setMessage(null);
    setError(null);

    try {
      const response = await validateCurrentToken();
      setValidation(response);

      if (response?.valido) {
        setMessage("Token atual válido e autenticado.");
      } else {
        setError(getTokenReasonLabel(response?.motivo));
      }
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  async function handleCopy() {
    if (!token) return;

    try {
      await navigator.clipboard.writeText(token);
      setMessage("Token copiado.");
      setError(null);
    } catch {
      setError("Não foi possível copiar o token.");
    }
  }

  function handleSignOut() {
    signOut();
    navigate("/");
  }

  if (!user) {
    return null;
  }

  return (
    <main className="page-shell">
      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Dashboard</p>
            <h1>Usuário autenticado</h1>
          </div>
          <StatusBadge value={user.perfil} />
        </div>

        <MessageBanner kind="success">{message}</MessageBanner>
        <MessageBanner kind="error">{error}</MessageBanner>

        <div className="details-grid">
          <div>
            <span>Nome</span>
            <strong>{user.nome}</strong>
          </div>
          <div>
            <span>E-mail</span>
            <strong>{user.email}</strong>
          </div>
          <div>
            <span>Perfil</span>
            <strong>{getPerfilLabel(user.perfil)}</strong>
          </div>
          <div>
            <span>Status</span>
            <strong>{getStatusLabel(user.status)}</strong>
          </div>
          <div className="wide">
            <span>Token JWT</span>
            <code>{summarizeToken(token)}</code>
          </div>
        </div>

        <div className="form-actions">
          <button className="button button-secondary" type="button" onClick={handleCopy}>
            <Copy size={18} aria-hidden="true" />
            Copiar token
          </button>
          <button className="button button-secondary" type="button" onClick={handleValidate}>
            <RefreshCw size={18} aria-hidden="true" />
            Validar token atual
          </button>
          <button className="button button-danger" type="button" onClick={handleSignOut}>
            <LogOut size={18} aria-hidden="true" />
            Sair
          </button>
        </div>
      </section>

      <section className="panel split-panel">
        <ShieldCheck size={28} aria-hidden="true" />
        <div>
          {user.perfil === "ALUNO" ? (
            <>
              <h2>Área do Aluno</h2>
              <p className="muted">
                Este usuário possui acesso de Aluno. Os módulos de participação
                e integralização ainda não estão implementados, mas este token
                poderá autenticar chamadas futuras ao Módulo B.
              </p>
            </>
          ) : (
            <>
              <h2>Área do Funcionário</h2>
              <p className="muted">
                Este usuário possui acesso administrativo. Este perfil representa
                o usuário interno responsável por avaliar e gerenciar informações
                do sistema.
              </p>
            </>
          )}
        </div>
      </section>

      {validation && (
        <section className="panel compact-panel">
          <h2>Última validação</h2>
          <p className="muted">
            Resultado: {validation.valido ? "token válido" : getTokenReasonLabel(validation.motivo)}
          </p>
        </section>
      )}
    </main>
  );
}
