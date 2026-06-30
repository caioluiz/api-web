import type { Perfil, StatusUsuario } from "../types";
import { getPerfilLabel, getStatusLabel } from "../utils/labels";

interface StatusBadgeProps {
  value: StatusUsuario | Perfil;
}

export function StatusBadge({ value }: StatusBadgeProps) {
  const label =
    value === "ALUNO" || value === "FUNCIONARIO"
      ? getPerfilLabel(value)
      : getStatusLabel(value);

  return <span className={`badge badge-${value.toLowerCase()}`}>{label}</span>;
}
