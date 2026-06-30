import axios from "axios";

interface ApiErrorBody {
  mensagem?: string;
  message?: string;
  erro?: string;
  motivo?: string;
}

const fallbackByStatus: Record<number, string> = {
  400: "A requisição possui dados inválidos.",
  401: "Sessão inválida ou expirada. Faça login novamente.",
  403: "Acesso negado para este perfil.",
  404: "Recurso não encontrado.",
  409: "Já existe um registro com esses dados.",
  500: "Erro interno no Módulo A."
};

const apiMessageCorrections: Record<string, string> = {
  "O nome e obrigatorio.": "O nome é obrigatório.",
  "O nome deve ter no maximo 150 caracteres.":
    "O nome deve ter no máximo 150 caracteres.",
  "O CPF e obrigatorio.": "O CPF é obrigatório.",
  "O celular e obrigatorio.": "O celular é obrigatório.",
  "O celular deve ter no maximo 20 caracteres.":
    "O celular deve ter no máximo 20 caracteres.",
  "A data de nascimento e obrigatoria.": "A data de nascimento é obrigatória.",
  "Os detalhes do perfil sao obrigatorios.": "Os detalhes do perfil são obrigatórios.",
  "O e-mail e obrigatorio.": "O e-mail é obrigatório.",
  "Informe um e-mail valido.": "Informe um e-mail válido.",
  "O e-mail deve ter no maximo 150 caracteres.":
    "O e-mail deve ter no máximo 150 caracteres.",
  "A senha e obrigatoria.": "A senha é obrigatória.",
  "O perfil e obrigatorio (ALUNO ou FUNCIONARIO).":
    "O perfil é obrigatório (ALUNO ou FUNCIONARIO).",
  "Apenas funcionarios podem listar todos os usuarios.":
    "Apenas funcionários podem listar todos os usuários.",
  "Payload invalido.": "Payload inválido.",
  "Cabecalho 'Authorization' e obrigatorio.":
    "Cabeçalho 'Authorization' é obrigatório.",
  "Corpo da requisicao ausente ou em formato JSON invalido.":
    "Corpo da requisição ausente ou em formato JSON inválido.",
  "Violacao de restricao de dados. Verifique CPF e e-mail unicos.":
    "Violação de restrição de dados. Verifique CPF e e-mail únicos.",
  "Rota nao encontrada.": "Rota não encontrada.",
  "Ja existe um usuario cadastrado com este CPF.":
    "Já existe um usuário cadastrado com este CPF.",
  "Ja existe um usuario cadastrado com este e-mail.":
    "Já existe um usuário cadastrado com este e-mail.",
  "detalhesPerfil e obrigatorio.": "Detalhes do perfil são obrigatórios.",
  "detalhesPerfil.nivel deve ser Graduacao, Pos-graduacao, Mestrado ou Doutorado.":
    "O nível deve ser Graduação, Pós-graduação, Mestrado ou Doutorado.",
  "detalhesPerfil.membroComissao deve ser booleano.":
    "O campo Membro da comissão deve ser verdadeiro ou falso.",
  "detalhesPerfil.tipo deve ser Docente ou Tecnico-Administrativo.":
    "O tipo deve ser Docente ou Técnico-Administrativo.",
  "Perfil invalido.": "Perfil inválido.",
  "Alunos so podem consultar os proprios dados.":
    "Alunos só podem consultar os próprios dados.",
  "Voce nao tem permissao para alterar dados de outro usuario.":
    "Você não tem permissão para alterar dados de outro usuário.",
  "Voce nao tem permissao para desativar outro usuario.":
    "Você não tem permissão para desativar outro usuário.",
  "CPF deve conter 11 digitos.": "CPF deve conter 11 dígitos.",
  "Celular e obrigatorio.": "Celular é obrigatório.",
  "Celular deve ter no maximo 20 digitos.":
    "Celular deve ter no máximo 20 dígitos.",
  "E-mail ou senha invalidos.": "E-mail ou senha inválidos.",
  "Esta conta esta desativada.": "Esta conta está desativada.",
  "Autenticacao obrigatoria.": "Autenticação obrigatória.",
  "O token e obrigatorio.": "O token é obrigatório."
};

function normalizeKnownApiMessage(message?: string): string | undefined {
  if (!message) return undefined;

  return message
    .split(" | ")
    .map((part) => {
      const [field, ...rest] = part.split(": ");
      const text = rest.length ? rest.join(": ") : part;
      const normalized =
        apiMessageCorrections[text] ||
        text
          .replace(/^Usuario nao encontrado/, "Usuário não encontrado")
          .replace(
            /^detalhesPerfil\.([a-zA-Z]+) e obrigatorio\.$/,
            "O campo $1 dos detalhes do perfil é obrigatório."
          );
      return rest.length ? `${field}: ${normalized}` : normalized;
    })
    .join(" | ");
}

export function getApiErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorBody>(error)) {
    return "Não foi possível concluir a operação.";
  }

  if (!error.response) {
    return "Não foi possível conectar ao Módulo A. Verifique se o backend está rodando.";
  }

  const body = error.response.data;
  const apiMessage =
    normalizeKnownApiMessage(body?.mensagem) ||
    normalizeKnownApiMessage(body?.message) ||
    normalizeKnownApiMessage(body?.motivo) ||
    normalizeKnownApiMessage(body?.erro);

  return (
    apiMessage ||
    fallbackByStatus[error.response.status] ||
    "Não foi possível concluir a operação."
  );
}
