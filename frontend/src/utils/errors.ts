import axios from "axios";

interface ApiErrorBody {
  mensagem?: string;
  message?: string;
  erro?: string;
  motivo?: string;
}

const fallbackByStatus: Record<number, string> = {
  400: "A requisicao possui dados invalidos.",
  401: "Sessao invalida ou expirada. Faca login novamente.",
  403: "Acesso negado para este perfil.",
  404: "Recurso nao encontrado.",
  409: "Ja existe um registro com esses dados.",
  500: "Erro interno no Modulo A."
};

export function getApiErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorBody>(error)) {
    return "Nao foi possivel concluir a operacao.";
  }

  if (!error.response) {
    return "Nao foi possivel conectar ao Modulo A. Verifique se o backend esta rodando.";
  }

  const body = error.response.data;
  return (
    body?.mensagem ||
    body?.message ||
    body?.motivo ||
    fallbackByStatus[error.response.status] ||
    body?.erro ||
    "Nao foi possivel concluir a operacao."
  );
}
