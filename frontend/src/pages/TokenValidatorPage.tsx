import { FormEvent, useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { MessageBanner } from "../components/MessageBanner";
import { StatusBadge } from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";
import { validarToken } from "../services/authService";
import type { ValidarTokenResponse } from "../types";
import { getApiErrorMessage } from "../utils/errors";

export function TokenValidatorPage() {
  const { token } = useAuth();
  const [tokenInput, setTokenInput] = useState("");
  const [initializedFromSession, setInitializedFromSession] = useState(false);
  const [result, setResult] = useState<ValidarTokenResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (token && !initializedFromSession) {
      setTokenInput(token);
      setInitializedFromSession(true);
    }
  }, [initializedFromSession, token]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setResult(null);
    setError(null);

    if (!tokenInput.trim()) {
      setError("Cole um token para validar.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await validarToken(tokenInput.trim());
      setResult(response);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="page-shell">
      <section className="panel">
        <p className="eyebrow">Validacao publica</p>
        <h1>Validador de Token</h1>
        <p className="muted">
          Cole qualquer JWT emitido pelo Modulo A para conferir se ele esta
          valido, expirado ou associado a um usuario desativado.
        </p>

        <MessageBanner kind="error">{error}</MessageBanner>

        <form className="form" onSubmit={handleSubmit}>
          <label>
            Token JWT
            <textarea
              value={tokenInput}
              onChange={(event) => setTokenInput(event.target.value)}
              rows={6}
              placeholder="Cole o token aqui"
            />
          </label>

          <button className="button button-primary" type="submit" disabled={isSubmitting}>
            <ShieldCheck size={18} aria-hidden="true" />
            {isSubmitting ? "Validando..." : "Validar token"}
          </button>
        </form>
      </section>

      {result && (
        <section className="panel compact-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Resultado</p>
              <h2>{result.valido ? "Token valido" : "Token invalido"}</h2>
            </div>
            {result.perfil && <StatusBadge value={result.perfil} />}
          </div>

          {result.valido ? (
            <div className="details-grid">
              <div>
                <span>ID</span>
                <strong>{result.usuarioId}</strong>
              </div>
              <div>
                <span>Nome</span>
                <strong>{result.nome}</strong>
              </div>
              <div>
                <span>E-mail</span>
                <strong>{result.email}</strong>
              </div>
              <div>
                <span>Status</span>
                <strong>{result.status}</strong>
              </div>
            </div>
          ) : (
            <MessageBanner kind="error">
              {result.motivo || "TOKEN_INVALIDO"}
            </MessageBanner>
          )}
        </section>
      )}
    </main>
  );
}
