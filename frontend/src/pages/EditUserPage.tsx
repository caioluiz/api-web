import { FormEvent, useEffect, useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { MessageBanner } from "../components/MessageBanner";
import { ProfileDetailsFields } from "../components/ProfileDetailsFields";
import { StatusBadge } from "../components/StatusBadge";
import {
  atualizarUsuario,
  buscarUsuario
} from "../services/userService";
import type { DetalhesPerfil, Perfil, Usuario } from "../types";
import { getApiErrorMessage } from "../utils/errors";
import {
  mergeDetailsForProfile,
  normalizeDetails,
  validateDetails
} from "../utils/profileDetails";

interface EditForm {
  nome: string;
  cpf: string;
  celular: string;
  dataNascimento: string;
  email: string;
}

const emptyForm: EditForm = {
  nome: "",
  cpf: "",
  celular: "",
  dataNascimento: "",
  email: ""
};

export function EditUserPage() {
  const { id } = useParams();
  const [user, setUser] = useState<Usuario | null>(null);
  const [form, setForm] = useState<EditForm>(emptyForm);
  const [perfil, setPerfil] = useState<Perfil>("ALUNO");
  const [details, setDetails] = useState<DetalhesPerfil>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      setIsLoading(true);
      setError(null);

      const numericId = Number(id);
      if (!numericId) {
        setError("ID de usuario invalido.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await buscarUsuario(numericId);
        setUser(response);
        setPerfil(response.perfil);
        setForm({
          nome: response.nome,
          cpf: response.cpf,
          celular: response.celular,
          dataNascimento: response.dataNascimento,
          email: response.email
        });
        setDetails(mergeDetailsForProfile(response.perfil, response.detalhesPerfil));
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, [id]);

  function setField<K extends keyof EditForm>(key: K, value: EditForm[K]) {
    setForm((current) => ({
      ...current,
      [key]: value
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
    return validateDetails(perfil, details);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const numericId = Number(id);
    const validationError = validateForm();

    if (!numericId) {
      setError("ID de usuario invalido.");
      return;
    }

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await atualizarUsuario(numericId, {
        nome: form.nome.trim(),
        cpf: form.cpf.trim(),
        celular: form.celular.trim(),
        dataNascimento: form.dataNascimento,
        email: form.email.trim().toLowerCase(),
        detalhesPerfil: normalizeDetails(perfil, details)
      });

      setUser(response);
      setPerfil(response.perfil);
      setDetails(mergeDetailsForProfile(response.perfil, response.detalhesPerfil));
      setMessage("Usuario atualizado com sucesso.");
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="page-shell">
      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Edicao administrativa</p>
            <h1>Editar usuario</h1>
          </div>
          <Link className="button button-secondary" to="/usuarios">
            <ArrowLeft size={18} aria-hidden="true" />
            Voltar
          </Link>
        </div>

        {isLoading ? (
          <p>Carregando usuario...</p>
        ) : (
          <>
            <MessageBanner kind="error">{error}</MessageBanner>
            <MessageBanner kind="success">{message}</MessageBanner>

            {user && (
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
                      required
                    />
                  </label>

                  <label>
                    Celular
                    <input
                      value={form.celular}
                      onChange={(event) => setField("celular", event.target.value)}
                      required
                    />
                  </label>

                  <label>
                    Data de nascimento
                    <input
                      type="date"
                      value={form.dataNascimento}
                      onChange={(event) =>
                        setField("dataNascimento", event.target.value)
                      }
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
                    Perfil
                    <input value={perfil} readOnly />
                  </label>

                  <label>
                    Status
                    <div className="readonly-field">
                      <StatusBadge value={user.status} />
                    </div>
                  </label>
                </div>

                <ProfileDetailsFields
                  perfil={perfil}
                  details={details}
                  onChange={setDetails}
                />

                <p className="muted">
                  Perfil e status nao sao alterados nesta rota. A API altera
                  status apenas pela desativacao logica.
                </p>

                <button className="button button-primary" type="submit" disabled={isSubmitting}>
                  <Save size={18} aria-hidden="true" />
                  {isSubmitting ? "Salvando..." : "Salvar alteracoes"}
                </button>
              </form>
            )}
          </>
        )}
      </section>
    </main>
  );
}
