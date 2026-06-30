export function summarizeToken(token: string | null): string {
  if (!token) {
    return "Nenhum token";
  }

  if (token.length <= 28) {
    return token;
  }

  return `${token.slice(0, 16)}...${token.slice(-12)}`;
}

export function formatDate(value?: string): string {
  if (!value) {
    return "-";
  }

  return value.split("T")[0];
}
