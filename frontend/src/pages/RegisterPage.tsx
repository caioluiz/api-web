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
      return "Informe um e-mail valido.";
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
      setSuccess("Usuario cadastrado com sucesso. Agora voce ja pode fazer login.");
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
        <p className="eyebrow">Cadastro publico</p>
        <h1>Cadastrar usuario</h1>
        <p className="muted">
          Crie usuarios ALUNO ou FUNCIONARIO para demonstrar as regras do Auth
          Service.
        </p>

        <MessageBanner kind="error">{error}</MessageBanner>
        <MessageBanner kind="success">{success}</MessageBanner>

        <form className="form" onSubmit={handleSubmit}>
          <div className="form-grid two-columns">
            <label>
              Nome
              <input
                value={form.nome}
                onChange={(event) => setField("nome", event.target.value)}
                required
              />
            </label>

            <label>
              CPF
              <input
                value={form.cpf}
                onChange={(event) => setField("cpf", event.target.value)}
                placeholder="000.000.000-00"
                required
              />
            </label>

            <label>
              Celular
              <input
                value={form.celular}
                onChange={(event) => setField("celular", event.target.value)}
                placeholder="(21) 99999-9999"
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

            <label>
              E-mail
              <input
                type="email"
                value={form.email}
                onChange={(event) => setField("email", event.target.value)}
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
                required
              />
            </label>

            <label>
              Perfil
              <select
                value={form.perfil}
                onChange={(event) => changeProfile(event.target.value as Perfil)}
              >
                <option value="ALUNO">ALUNO</option>
                <option value="FUNCIONARIO">FUNCIONARIO</option>
              </select>
            </label>
          </div>

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
