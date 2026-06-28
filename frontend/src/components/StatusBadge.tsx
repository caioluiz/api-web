import type { Perfil, StatusUsuario } from "../types";

interface StatusBadgeProps {
  value: StatusUsuario | Perfil;
}

export function StatusBadge({ value }: StatusBadgeProps) {
  return <span className={`badge badge-${value.toLowerCase()}`}>{value}</span>;
}
