import type { DetalhesPerfil, Perfil, StatusUsuario } from "../types";

const perfilLabels: Record<string, string> = {
  ALUNO: "Aluno",
  FUNCIONARIO: "Funcionário"
};

const statusLabels: Record<string, string> = {
  ATIVO: "Ativo",
  DESATIVADO: "Desativado"
};

const tokenReasonLabels: Record<string, string> = {
  TOKEN_AUSENTE: "Token ausente",
  TOKEN_INVALIDO: "Token inválido",
  TOKEN_EXPIRADO: "Token expirado",
  USUARIO_DESATIVADO: "Usuário desativado",
  USUARIO_NAO_ENCONTRADO: "Usuário não encontrado"
};

const detailLabels: Record<string, string> = {
  siape: "SIAPE",
  tipo: "Tipo",
  departamento: "Departamento",
  instituto: "Instituto",
  membroComissao: "Membro da comissão",
  matricula: "Matrícula",
  curso: "Curso",
  nivel: "Nível",
  periodoIngresso: "Período de ingresso"
};

const detailValueLabels: Record<string, string> = {
  Graduacao: "Graduação",
  "Tecnico-Administrativo": "Técnico-Administrativo"
};

export function getPerfilLabel(perfil?: Perfil | string): string {
  if (!perfil) return "-";
  return perfilLabels[perfil] || perfil;
}

export function getStatusLabel(status?: StatusUsuario | string): string {
  if (!status) return "-";
  return statusLabels[status] || status;
}

export function getTokenReasonLabel(reason?: string): string {
  if (!reason) return "Token inválido";
  return tokenReasonLabels[reason] || reason.replace(/_/g, " ").toLowerCase();
}

export function getProfileDetailLabel(key: string): string {
  return detailLabels[key] || key.replace(/([A-Z])/g, " $1").trim();
}

export function formatProfileDetailValue(value: unknown): string {
  if (typeof value === "boolean") return value ? "Sim" : "Não";
  if (value === null || value === undefined || value === "") return "-";

  const rawValue = String(value);
  return detailValueLabels[rawValue] || rawValue;
}

export function getProfileDetailEntries(details?: DetalhesPerfil) {
  if (!details) return [];

  return Object.entries(details).map(([key, value]) => ({
    key,
    label: getProfileDetailLabel(key),
    value: formatProfileDetailValue(value)
  }));
}
