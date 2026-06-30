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

  const [date] = value.split("T");
  const [year, month, day] = date.split("-");

  if (!year || !month || !day) {
    return value;
  }

  return `${day}/${month}/${year}`;
}
