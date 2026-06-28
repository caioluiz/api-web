import { api } from "./api";
import type {
  AtualizarUsuarioPayload,
  CadastroUsuarioPayload,
  Usuario
} from "../types";

export async function cadastrarUsuario(
  payload: CadastroUsuarioPayload
): Promise<Usuario> {
  const { data } = await api.post<Usuario>("/api/usuarios", payload);
  return data;
}

export async function listarUsuarios(): Promise<Usuario[]> {
  const { data } = await api.get<Usuario[]>("/api/usuarios");
  return data;
}

export async function buscarUsuario(id: number): Promise<Usuario> {
  const { data } = await api.get<Usuario>(`/api/usuarios/${id}`);
  return data;
}

export async function atualizarUsuario(
  id: number,
  payload: AtualizarUsuarioPayload
): Promise<Usuario> {
  const { data } = await api.patch<Usuario>(`/api/usuarios/${id}`, payload);
  return data;
}

export async function desativarUsuario(id: number): Promise<Usuario> {
  const { data } = await api.delete<Usuario>(`/api/usuarios/${id}`);
  return data;
}
