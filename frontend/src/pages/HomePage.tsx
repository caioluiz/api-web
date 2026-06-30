import {
  DatabaseZap,
  KeyRound,
  ListChecks,
  ShieldCheck,
  Trash2,
  UserCog,
  Users
} from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  {
    title: "Gestão de usuários",
    text: "Cadastro, consulta, atualização e desativação lógica em uma API real.",
    icon: Users
  },
  {
    title: "Autenticação JWT",
    text: "Login contra o backend Spring Boot e armazenamento do token na sessão.",
    icon: KeyRound
  },
  {
    title: "Perfis de acesso",
    text: "Aluno usa o próprio cadastro; Funcionário gerencia usuários e permissões.",
    icon: UserCog
  },
  {
    title: "Validação de token",
    text: "Consulta pública para outros módulos confirmarem autenticação e perfil.",
    icon: ShieldCheck
  },
  {
    title: "Exclusão lógica",
    text: "DELETE desativa usuários sem remover o histórico do banco.",
    icon: Trash2
  }
];

export function HomePage() {
  return (
    <main className="page-shell">
      <section className="intro-panel">
        <div>
          <p className="eyebrow">Módulo A</p>
          <h1>Gestão de usuários e autenticação do SisExt-SI</h1>
          <p className="lead">
            Use esta interface para demonstrar cadastro, login, validação de JWT
            e administração de contas com as regras reais do Módulo A.
          </p>
        </div>

        <div className="intro-actions">
          <Link className="button button-primary" to="/cadastro">
            <Users size={18} aria-hidden="true" />
            Cadastrar usuário
          </Link>
          <Link className="button button-secondary" to="/login">
            <KeyRound size={18} aria-hidden="true" />
            Fazer login
          </Link>
          <Link className="button button-secondary" to="/validador">
            <ShieldCheck size={18} aria-hidden="true" />
            Validar token
          </Link>
        </div>
      </section>

      <section className="feature-grid" aria-label="Recursos demonstrados">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <article className="feature-card" key={feature.title}>
              <Icon size={24} aria-hidden="true" />
              <h2>{feature.title}</h2>
              <p>{feature.text}</p>
            </article>
          );
        })}
      </section>

      <section className="panel split-panel">
        <DatabaseZap size={28} aria-hidden="true" />
        <div>
          <h2>Integração com os Módulos B e C</h2>
          <p className="muted">
            Os módulos de participação, integralização e parecer ainda não estão
            implementados neste frontend. Mesmo assim, o Módulo A já fornece
            autenticação e validação de acesso para que eles consumam tokens JWT.
          </p>
        </div>
      </section>

      <section className="panel split-panel">
        <ListChecks size={28} aria-hidden="true" />
        <div>
          <h2>Fluxo recomendado para apresentação</h2>
          <ol className="workflow-list">
            <li>Cadastre um usuário Aluno e um usuário Funcionário.</li>
            <li>Entre como Funcionário para listar, editar e desativar usuários.</li>
            <li>Copie o JWT no dashboard e valide o token no validador público.</li>
          </ol>
        </div>
      </section>
    </main>
  );
}
