import { api } from "./api";
import type { LoginPayload, LoginResponse, ValidarTokenResponse } from "../types";

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/api/auth/login", payload);
  return data;
}

export async function validarToken(token: string): Promise<ValidarTokenResponse> {
  const { data } = await api.post<ValidarTokenResponse>("/api/auth/validar", {
    token
  });
  return data;
}
