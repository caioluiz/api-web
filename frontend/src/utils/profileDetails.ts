import type { DetalhesPerfil, Perfil } from "../types";

export function emptyDetailsForProfile(perfil: Perfil): DetalhesPerfil {
  if (perfil === "FUNCIONARIO") {
    return {
      siape: "",
      tipo: "Docente",
      departamento: "",
      instituto: "",
      membroComissao: true
    };
  }

  return {
    matricula: "",
    curso: "",
    nivel: "Graduacao",
    periodoIngresso: ""
  };
}

export function normalizeDetails(
  perfil: Perfil,
  details: DetalhesPerfil
): DetalhesPerfil {
  if (perfil === "FUNCIONARIO") {
    return {
      siape: String(details.siape || "").trim(),
      tipo: String(details.tipo || "Docente").trim(),
      departamento: String(details.departamento || "").trim(),
      instituto: String(details.instituto || "").trim(),
      membroComissao: Boolean(details.membroComissao)
    };
  }

  return {
    matricula: String(details.matricula || "").trim(),
    curso: String(details.curso || "").trim(),
    nivel: String(details.nivel || "Graduacao").trim(),
    periodoIngresso: String(details.periodoIngresso || "").trim()
  };
}

export function validateDetails(perfil: Perfil, details: DetalhesPerfil): string | null {
  const normalized = normalizeDetails(perfil, details);

  if (perfil === "FUNCIONARIO") {
    const required = ["siape", "tipo", "departamento", "instituto"] as const;
    const missing = required.find((field) => !String(normalized[field] || "").trim());
    return missing ? "Preencha todos os detalhes do funcionario." : null;
  }

  const required = ["matricula", "curso", "nivel", "periodoIngresso"] as const;
  const missing = required.find((field) => !String(normalized[field] || "").trim());
  return missing ? "Preencha todos os detalhes do aluno." : null;
}

export function mergeDetailsForProfile(
  perfil: Perfil,
  details?: DetalhesPerfil
): DetalhesPerfil {
  return {
    ...emptyDetailsForProfile(perfil),
    ...(details || {})
  };
}
