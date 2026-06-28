import { useEffect, useState } from "react";
import { Eye, Pencil, RefreshCw, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { MessageBanner } from "../components/MessageBanner";
import { StatusBadge } from "../components/StatusBadge";
import {
  desativarUsuario,
  listarUsuarios
} from "../services/userService";
import type { Usuario } from "../types";
import { getApiErrorMessage } from "../utils/errors";
import { formatDate } from "../utils/format";

export function UsersPage() {
  const [users, setUsers] = useState<Usuario[]>([]);
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);

  async function loadUsers() {
    setIsLoading(true);
    setError(null);

    try {
      setUsers(await listarUsuarios());
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleDeactivate(user: Usuario) {
    const confirmed = window.confirm(
      `Desativar ${user.nome}? O registro permanecera no banco e o login sera bloqueado.`
    );

    if (!confirmed) {
      return;
    }

    setActionId(user.id);
    setError(null);
    setMessage(null);

    try {
      await desativarUsuario(user.id);
      setMessage("Usuario desativado com sucesso. A exclusao foi logica.");
      await loadUsers();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setActionId(null);
    }
  }

  return (
    <main className="page-shell">
      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Area administrativa</p>
            <h1>Usuarios</h1>
          </div>
          <button className="button button-secondary" type="button" onClick={loadUsers}>
            <RefreshCw size={18} aria-hidden="true" />
            Atualizar
          </button>
        </div>

        <p className="muted">
          Esta tela e restrita ao perfil FUNCIONARIO. O botao Desativar chama
          DELETE /api/usuarios/id e realiza exclusao logica.
        </p>

        <MessageBanner kind="success">{message}</MessageBanner>
        <MessageBanner kind="error">{error}</MessageBanner>

        {isLoading ? (
          <p>Carregando usuarios...</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>CPF</th>
                  <th>Perfil</th>
                  <th>Status</th>
                  <th>Acoes</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.nome}</td>
                    <td>{user.email}</td>
                    <td>{user.cpf}</td>
                    <td>
                      <StatusBadge value={user.perfil} />
                    </td>
                    <td>
                      <StatusBadge value={user.status} />
                    </td>
                    <td>
                      <div className="row-actions">
                        <button
                          className="icon-button"
                          type="button"
                          onClick={() => setSelectedUser(user)}
                          title="Visualizar detalhes"
                          aria-label={`Visualizar ${user.nome}`}
                        >
                          <Eye size={17} aria-hidden="true" />
                        </button>
                        <Link
                          className="icon-button"
                          to={`/usuarios/${user.id}/editar`}
                          title="Editar usuario"
                          aria-label={`Editar ${user.nome}`}
                        >
                          <Pencil size={17} aria-hidden="true" />
                        </Link>
                        <button
                          className="icon-button danger"
                          type="button"
                          onClick={() => handleDeactivate(user)}
                          disabled={user.status === "DESATIVADO" || actionId === user.id}
                          title="Desativar usuario"
                          aria-label={`Desativar ${user.nome}`}
                        >
                          <Trash2 size={17} aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {users.length === 0 && (
                  <tr>
                    <td colSpan={6}>Nenhum usuario cadastrado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selectedUser && (
        <section className="panel compact-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Detalhes</p>
              <h2>{selectedUser.nome}</h2>
            </div>
            <StatusBadge value={selectedUser.status} />
          </div>

          <div className="details-grid">
            <div>
              <span>ID</span>
              <strong>{selectedUser.id}</strong>
            </div>
            <div>
              <span>Nascimento</span>
              <strong>{formatDate(selectedUser.dataNascimento)}</strong>
            </div>
            <div>
              <span>Celular</span>
              <strong>{selectedUser.celular}</strong>
            </div>
            <div>
              <span>Perfil</span>
              <strong>{selectedUser.perfil}</strong>
            </div>
            <div className="wide">
              <span>Detalhes do perfil</span>
              <pre>{JSON.stringify(selectedUser.detalhesPerfil, null, 2)}</pre>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
