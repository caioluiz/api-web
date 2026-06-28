import {
  DatabaseZap,
  KeyRound,
  ShieldCheck,
  Trash2,
  UserCog,
  Users
} from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  {
    title: "Gestao de Usuarios",
    text: "Cadastro, consulta, atualizacao e governanca dos dados do Modulo A.",
    icon: Users
  },
  {
    title: "Autenticacao JWT",
    text: "Login real contra o backend Spring Boot e armazenamento do token no navegador.",
    icon: KeyRound
  },
  {
    title: "Perfis ALUNO e FUNCIONARIO",
    text: "FUNCIONARIO representa o usuario interno avaliador/administrativo.",
    icon: UserCog
  },
  {
    title: "Validacao de Token",
    text: "Consulta publica para outros modulos confirmarem autenticacao e perfil.",
    icon: ShieldCheck
  },
  {
    title: "Exclusao Logica",
    text: "DELETE desativa usuarios sem remover o historico do banco.",
    icon: Trash2
  }
];

export function HomePage() {
  return (
    <main className="page-shell">
      <section className="intro-panel">
        <div>
          <p className="eyebrow">Modulo A</p>
          <h1>Frontend de demonstracao do Auth Service</h1>
          <p className="lead">
            Esta interface consome a API real de Gestao de Usuarios e
            Autenticacao do SisExt-SI para demonstrar cadastro, login, JWT,
            validacao de token e gerenciamento administrativo.
          </p>
        </div>

        <div className="intro-actions">
          <Link className="button button-primary" to="/cadastro">
            <Users size={18} aria-hidden="true" />
            Cadastrar usuario
          </Link>
          <Link className="button button-secondary" to="/login">
            <KeyRound size={18} aria-hidden="true" />
            Fazer login
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
          <h2>Integracao com os Modulos B e C</h2>
          <p className="muted">
            Os modulos de participacao, integralizacao e parecer ainda nao
            estao implementados neste frontend. Mesmo assim, este Modulo A ja
            fornece autenticacao e validacao de acesso para que eles consumam
            tokens JWT no futuro.
          </p>
        </div>
      </section>
    </main>
  );
}
