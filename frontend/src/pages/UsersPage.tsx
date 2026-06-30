import { useEffect, useState } from "react";
import { Eye, Pencil, RefreshCw, Trash2, X } from "lucide-react";
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
import { getPerfilLabel, getProfileDetailEntries } from "../utils/labels";

export function UsersPage() {
  const [users, setUsers] = useState<Usuario[]>([]);
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);
  const selectedDetails = selectedUser
    ? getProfileDetailEntries(selectedUser.detalhesPerfil)
    : [];

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
      `Desativar ${user.nome}? O registro permanecerá no banco e o login será bloqueado.`
    );

    if (!confirmed) {
      return;
    }

    setActionId(user.id);
    setError(null);
    setMessage(null);

    try {
      await desativarUsuario(user.id);
      setMessage("Usuário desativado com sucesso. A exclusão foi lógica.");
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
            <p className="eyebrow">Área administrativa</p>
            <h1>Usuários</h1>
          </div>
          <button className="button button-secondary" type="button" onClick={loadUsers}>
            <RefreshCw size={18} aria-hidden="true" />
            Atualizar
          </button>
        </div>

        <p className="muted">
          Esta tela é restrita ao perfil Funcionário. O botão Desativar chama
          DELETE /api/usuarios/id e realiza exclusão lógica.
        </p>

        <MessageBanner kind="success">{message}</MessageBanner>
        <MessageBanner kind="error">{error}</MessageBanner>

        {isLoading ? (
          <p>Carregando usuários...</p>
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
                  <th>Ações</th>
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
                          title="Editar usuário"
                          aria-label={`Editar ${user.nome}`}
                        >
                          <Pencil size={17} aria-hidden="true" />
                        </Link>
                        <button
                          className="icon-button danger"
                          type="button"
                          onClick={() => handleDeactivate(user)}
                          disabled={user.status === "DESATIVADO" || actionId === user.id}
                          title={user.status === "DESATIVADO" ? "Usuário já desativado" : "Desativar usuário"}
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
                    <td colSpan={6}>
                      <div className="empty-state">
                        <strong>Nenhum usuário cadastrado.</strong>
                        <span>Cadastre um usuário Aluno ou Funcionário para iniciar a demonstração.</span>
                        <Link className="button button-secondary" to="/cadastro">
                          Cadastrar usuário
                        </Link>
                      </div>
                    </td>
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
            <div className="row-actions">
              <StatusBadge value={selectedUser.status} />
              <button
                className="icon-button"
                type="button"
                onClick={() => setSelectedUser(null)}
                title="Fechar detalhes"
                aria-label="Fechar detalhes"
              >
                <X size={17} aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="details-grid">
            <div>
              <span>Nome</span>
              <strong>{selectedUser.nome}</strong>
            </div>
            <div>
              <span>E-mail</span>
              <strong>{selectedUser.email}</strong>
            </div>
            <div>
              <span>CPF</span>
              <strong>{selectedUser.cpf}</strong>
            </div>
            <div>
              <span>Perfil</span>
              <strong>{getPerfilLabel(selectedUser.perfil)}</strong>
            </div>
            <div>
              <span>Nascimento</span>
              <strong>{formatDate(selectedUser.dataNascimento)}</strong>
            </div>
            <div>
              <span>Celular</span>
              <strong>{selectedUser.celular}</strong>
            </div>
          </div>

          <div className="profile-details-panel">
            <h3>Detalhes do perfil</h3>
            {selectedDetails.length > 0 ? (
              <dl className="profile-details-list">
                {selectedDetails.map((detail) => (
                  <div key={detail.key}>
                    <dt>{detail.label}</dt>
                    <dd>{detail.value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="muted">Nenhum detalhe de perfil informado.</p>
            )}
          </div>
        </section>
      )}
    </main>
  );
}
