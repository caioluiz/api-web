# Auth Service - Modulo A (SisExt-SI)

Servico de Gestao de Usuarios e Autenticacao do SisExt-SI. Esta versao usa Java, Spring Boot, Maven, PostgreSQL, Flyway, Spring Security e JWT.

## Como Rodar

### Docker Compose

```bash
docker compose up --build
```

A API fica em:

```text
http://localhost:8081
```

Swagger:

```text
http://localhost:8081/swagger-ui.html
```

O compose sobe dois servicos:

- `app`: API Spring Boot.
- `db`: PostgreSQL.

### Local Sem Docker

Suba um PostgreSQL local e configure as variaveis:

```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sisext_si
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=change-this-secret-with-at-least-32-chars
JWT_EXPIRATION=120
```

Depois execute:

```bash
mvn spring-boot:run
```

Neste ambiente, se voce estiver usando o Maven local baixado na pasta do trabalho:

```powershell
& "..\..\.tools\apache-maven-3.9.16\bin\mvn.cmd" spring-boot:run
```

## Perfis e Regras

Perfis validos:

- `ALUNO`
- `FUNCIONARIO`

`FUNCIONARIO` representa o usuario interno responsavel por avaliacao, gestao ou validacao de dados do sistema.

Regras principais:

- `ALUNO` consulta, atualiza e desativa apenas a propria conta.
- `ALUNO` nao lista todos os usuarios.
- `FUNCIONARIO` consulta, lista, atualiza e desativa usuarios.
- Exclusao e sempre logica: o status muda para `DESATIVADO`.
- Usuario `DESATIVADO` nao consegue fazer login.
- Senhas sao armazenadas com BCrypt.

## Endpoints

### Autenticacao

| Metodo | Rota | Descricao |
|---|---|---|
| `POST` | `/api/auth/login` | Autentica usuario e retorna JWT |
| `POST` | `/api/auth/validar` | Valida JWT para os demais modulos |

Login:

```json
{
  "email": "joao.pereira@ufrrj.br",
  "senha": "senha123"
}
```

Resposta:

```json
{
  "accessToken": "jwt...",
  "tokenType": "Bearer",
  "expiraEm": "2026-06-28T13:00:00",
  "usuarioId": 1,
  "nome": "Joao Pereira",
  "email": "joao.pereira@ufrrj.br",
  "perfil": "ALUNO",
  "status": "ATIVO"
}
```

Validar token:

```json
{
  "token": "jwt..."
}
```

Token valido:

```json
{
  "valido": true,
  "usuarioId": 1,
  "nome": "Joao Pereira",
  "email": "joao.pereira@ufrrj.br",
  "perfil": "ALUNO",
  "status": "ATIVO"
}
```

Token invalido:

```json
{
  "valido": false,
  "motivo": "TOKEN_INVALIDO"
}
```

Motivos possiveis:

- `TOKEN_AUSENTE`
- `TOKEN_INVALIDO`
- `TOKEN_EXPIRADO`
- `USUARIO_DESATIVADO`
- `USUARIO_NAO_ENCONTRADO`

### Usuarios

| Metodo | Rota | Acesso |
|---|---|---|
| `POST` | `/api/usuarios` | Publico |
| `GET` | `/api/usuarios` | `FUNCIONARIO` |
| `GET` | `/api/usuarios/{id}` | Proprio usuario ou `FUNCIONARIO` |
| `PUT` | `/api/usuarios/{id}` | Proprio usuario ou `FUNCIONARIO` |
| `PATCH` | `/api/usuarios/{id}` | Proprio usuario ou `FUNCIONARIO` |
| `DELETE` | `/api/usuarios/{id}` | Proprio usuario ou `FUNCIONARIO` |

Cadastro de aluno:

```json
{
  "nome": "Joao Pereira",
  "cpf": "123.456.789-00",
  "celular": "(21) 99999-8888",
  "dataNascimento": "2002-05-15",
  "email": "joao.pereira@ufrrj.br",
  "senha": "senha123",
  "perfil": "ALUNO",
  "detalhesPerfil": {
    "matricula": "20260010123",
    "curso": "Sistemas de Informacao",
    "nivel": "Graduacao",
    "periodoIngresso": "2026.1"
  }
}
```

Cadastro de funcionario:

```json
{
  "nome": "Profa. Maria Silva",
  "cpf": "987.654.321-00",
  "celular": "(21) 98888-7777",
  "dataNascimento": "1980-05-20",
  "email": "maria.silva@ufrrj.br",
  "senha": "senha123",
  "perfil": "FUNCIONARIO",
  "detalhesPerfil": {
    "siape": "3691232",
    "tipo": "Docente",
    "departamento": "Departamento de Computacao",
    "instituto": "ICE",
    "membroComissao": true
  }
}
```

Para rotas protegidas, envie:

```text
Authorization: Bearer <accessToken>
```

## Banco e Migrations

O banco principal e PostgreSQL. O schema inicial e criado por Flyway em:

```text
src/main/resources/db/migration/V1__create_usuarios.sql
```

Testes automatizados usam H2 com migration propria em:

```text
src/test/resources/db/migration-h2/V1__create_usuarios.sql
```

## Testes

```bash
mvn test
```

Os testes cobrem cadastro, duplicidade de CPF/e-mail, login, validacao de token, token expirado, usuario desativado, autorizacao de aluno e permissoes de funcionario.

## Arquivos Uteis

- `requests.http`: exemplos prontos para REST Client.
- `Dockerfile`: build da API.
- `docker-compose.yml`: API + PostgreSQL.
- `application.yml`: configuracao por variaveis de ambiente.
