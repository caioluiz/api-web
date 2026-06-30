export type Perfil = "ALUNO" | "FUNCIONARIO";

export type StatusUsuario = "ATIVO" | "DESATIVADO";

export type DetalhesPerfil = Record<string, string | boolean | number | null>;

export interface Usuario {
  id: number;
  nome: string;
  cpf: string;
  celular: string;
  dataNascimento: string;
  detalhesPerfil: DetalhesPerfil;
  email: string;
  perfil: Perfil;
  status: StatusUsuario;
  dataCriacao?: string;
  dataAtualizacao?: string;
}

export interface CadastroUsuarioPayload {
  nome: string;
  cpf: string;
  celular: string;
  dataNascimento: string;
  detalhesPerfil: DetalhesPerfil;
  email: string;
  senha: string;
  perfil: Perfil;
}

export type AtualizarUsuarioPayload = Partial<
  Omit<CadastroUsuarioPayload, "senha" | "perfil">
>;

export interface LoginPayload {
  email: string;
  senha: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiraEm: string;
  usuarioId: number;
  nome: string;
  email: string;
  perfil: Perfil;
  status: StatusUsuario;
}

export interface ValidarTokenResponse {
  valido: boolean;
  motivo?: string;
  usuarioId?: number;
  nome?: string;
  email?: string;
  perfil?: Perfil;
  status?: StatusUsuario;
}

export interface AuthUser {
  usuarioId: number;
  nome: string;
  email: string;
  perfil: Perfil;
  status: StatusUsuario;
}
