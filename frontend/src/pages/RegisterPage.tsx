import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { Save, LogIn } from "lucide-react";
import { MessageBanner } from "../components/MessageBanner";
import { ProfileDetailsFields } from "../components/ProfileDetailsFields";
import { cadastrarUsuario } from "../services/userService";
import type { CadastroUsuarioPayload, Perfil } from "../types";
import { getApiErrorMessage } from "../utils/errors";
import {
  emptyDetailsForProfile,
  normalizeDetails,
  validateDetails
} from "../utils/profileDetails";

const initialForm: CadastroUsuarioPayload = {
  nome: "",
  cpf: "",
  celular: "",
  dataNascimento: "",
  detalhesPerfil: emptyDetailsForProfile("ALUNO"),
  email: "",
  senha: "",
  perfil: "ALUNO"
};

export function RegisterPage() {
  const [form, setForm] = useState<CadastroUsuarioPayload>(initialForm);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function setField<K extends keyof CadastroUsuarioPayload>(
    key: K,
    value: CadastroUsuarioPayload[K]
  ) {
    setForm((current) => ({
      ...current,
      [key]: value
    }));
  }

  function changeProfile(perfil: Perfil) {
    setForm((current) => ({
      ...current,
      perfil,
      detalhesPerfil: emptyDetailsForProfile(perfil)
    }));
  }

  function validateForm(): string | null {
    if (!form.nome.trim()) return "Informe o nome.";
    if (!form.cpf.trim()) return "Informe o CPF.";
    if (!form.celular.trim()) return "Informe o celular.";
    if (!form.dataNascimento) return "Informe a data de nascimento.";
    if (!form.email.trim()) return "Informe o e-mail.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      return "Informe um e-mail válido.";
    }
    if (!form.senha.trim()) return "Informe a senha.";
    if (form.senha.length < 6) return "A senha deve ter pelo menos 6 caracteres.";
    return validateDetails(form.perfil, form.detalhesPerfil);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      await cadastrarUsuario({
        ...form,
        nome: form.nome.trim(),
        cpf: form.cpf.trim(),
        celular: form.celular.trim(),
        email: form.email.trim().toLowerCase(),
        detalhesPerfil: normalizeDetails(form.perfil, form.detalhesPerfil)
      });
      setSuccess("Usuário cadastrado com sucesso. Agora você já pode fazer login.");
      setForm(initialForm);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="page-shell">
      <section className="panel">
        <p className="eyebrow">Cadastro público</p>
        <h1>Cadastrar usuário</h1>
        <p className="muted">
          Crie contas de Aluno ou Funcionário para demonstrar as regras de
          autenticação, autorização e validação de token.
        </p>

        <MessageBanner kind="error">{error}</MessageBanner>
        <MessageBanner kind="success">{success}</MessageBanner>

        <form className="form" onSubmit={handleSubmit}>
          <fieldset className="form-section">
            <legend>Dados pessoais</legend>
            <div className="form-grid two-columns">
              <label>
                Nome
                <input
                  value={form.nome}
                  onChange={(event) => setField("nome", event.target.value)}
                  autoComplete="name"
                  required
                />
              </label>

              <label>
                CPF
                <input
                  value={form.cpf}
                  onChange={(event) => setField("cpf", event.target.value)}
                  placeholder="000.000.000-00"
                  inputMode="numeric"
                  required
                />
              </label>

              <label>
                Celular
                <input
                  value={form.celular}
                  onChange={(event) => setField("celular", event.target.value)}
                  placeholder="(21) 99999-9999"
                  autoComplete="tel"
                  required
                />
              </label>

              <label>
                Data de nascimento
                <input
                  type="date"
                  value={form.dataNascimento}
                  onChange={(event) => setField("dataNascimento", event.target.value)}
                  required
                />
              </label>
            </div>
          </fieldset>

          <fieldset className="form-section">
            <legend>Acesso</legend>
            <div className="form-grid two-columns">
              <label>
                E-mail
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setField("email", event.target.value)}
                  autoComplete="email"
                  required
                />
              </label>

              <label>
                Senha
                <input
                  type="password"
                  value={form.senha}
                  onChange={(event) => setField("senha", event.target.value)}
                  minLength={6}
                  autoComplete="new-password"
                  required
                />
                <small className="field-hint">Use pelo menos 6 caracteres.</small>
              </label>

              <label>
                Perfil
                <select
                  value={form.perfil}
                  onChange={(event) => changeProfile(event.target.value as Perfil)}
                >
                  <option value="ALUNO">Aluno</option>
                  <option value="FUNCIONARIO">Funcionário</option>
                </select>
              </label>
            </div>
          </fieldset>

          <ProfileDetailsFields
            perfil={form.perfil}
            details={form.detalhesPerfil}
            onChange={(details) => setField("detalhesPerfil", details)}
          />

          <div className="form-actions">
            <button className="button button-primary" type="submit" disabled={isSubmitting}>
              <Save size={18} aria-hidden="true" />
              {isSubmitting ? "Cadastrando..." : "Cadastrar"}
            </button>
            <Link className="button button-secondary" to="/login">
              <LogIn size={18} aria-hidden="true" />
              Ir para login
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}
