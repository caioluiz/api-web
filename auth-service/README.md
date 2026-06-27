# Auth Service — Módulo A (SisExt-SI)

Serviço de **Gestão de Usuários e Autenticação** do projeto *Sistema de Gestão e
Acompanhamento de Atividades Extensionistas* (Web 3 — UFRRJ).

Este é o serviço "base" da arquitetura: os Módulos B (Serviço do Aluno) e C
(Serviço da Comissão) dependem dele tanto para autenticar usuários quanto para
**validar tokens** recebidos em suas próprias requisições.

---

## 1. O que este serviço faz

- **CRUD de usuários**, separando estritamente os perfis `ALUNO` e `COMISSAO`.
- **Exclusão lógica**: não existe exclusão física. Um usuário só pode solicitar
  a desativação da própria conta (`status` muda de `ATIVO` para `DESATIVADO`,
  e o histórico permanece no banco).
- **Autenticação simplificada por token**, exatamente como descrito no
  enunciado:
  - token aleatório de **8 dígitos numéricos**;
  - se o token **começa com `1`** → pertence a um usuário da **COMISSAO**;
  - qualquer outro primeiro dígito → pertence a um **ALUNO**;
  - o token é guardado em uma "sessão" (mapa em memória, com expiração) no
    `TokenService`;
  - existe uma rota de **confirmação de token**, que é o contrato que os
    Módulos B e C devem consumir.

## 2. Como executar

Pré-requisitos: **JDK 17+** e **Maven** instalados (o `mvn` baixa as
dependências do Spring na primeira execução — é necessário ter internet nessa
hora).

```bash
cd auth-service
mvn spring-boot:run
```

O serviço sobe em **`http://localhost:8081`**.

- Console do banco H2 (opcional, útil para depurar): `http://localhost:8081/h2-console`
  (JDBC URL: `jdbc:h2:file:./data/authdb`, usuário `sa`, senha vazia)
- Documentação interativa (Swagger): `http://localhost:8081/swagger-ui.html`

> O arquivo `requests.http` na raiz do projeto já traz o fluxo completo de
> exemplo (cadastro → login → validação → atualização → desativação), pronto
> para rodar com a extensão *REST Client* do VS Code ou equivalente do
> IntelliJ.

## 3. Contrato da API

Todas as rotas usam JSON. Erros sempre voltam no formato:

```json
{
  "timestamp": "2026-06-26T10:00:00",
  "status": 401,
  "erro": "Unauthorized",
  "mensagem": "Token invalido, expirado ou ausente.",
  "caminho": "/api/usuarios/2"
}
```

### 3.1 Usuários

| Método | Rota                | Autenticação                  | Descrição                                    |
|--------|---------------------|--------------------------------|-----------------------------------------------|
| POST   | `/api/usuarios`     | nenhuma (pública)               | Cadastra um novo usuário (ALUNO ou COMISSAO) |
| GET    | `/api/usuarios/{id}`| qualquer token válido           | Consulta um usuário pelo id                  |
| GET    | `/api/usuarios`     | token de **COMISSAO**           | Lista todos os usuários                      |
| PUT    | `/api/usuarios/{id}`| dono do recurso, ou COMISSAO    | Atualiza nome/e-mail/senha                   |
| DELETE | `/api/usuarios/{id}`| somente o dono do recurso       | Exclusão lógica (vira `DESATIVADO`)          |

**Cadastro** — `POST /api/usuarios`
```json
{
  "nome": "Joao Pereira",
  "email": "joao.pereira@ufrrj.br",
  "senha": "senha123",
  "perfil": "ALUNO"
}
```
Resposta `201 Created`:
```json
{
  "id": 2,
  "nome": "Joao Pereira",
  "email": "joao.pereira@ufrrj.br",
  "perfil": "ALUNO",
  "status": "ATIVO",
  "dataCriacao": "2026-06-26T10:00:00",
  "dataAtualizacao": "2026-06-26T10:00:00"
}
```

### 3.2 Autenticação

**Login** — `POST /api/auth/login`
```json
{ "email": "joao.pereira@ufrrj.br", "senha": "senha123" }
```
Resposta `200 OK`:
```json
{
  "token": "47218390",
  "usuarioId": 2,
  "nome": "Joao Pereira",
  "perfil": "ALUNO",
  "expiraEm": "2026-06-26T12:00:00"
}
```
A partir daqui, envie o token no cabeçalho `Authorization` das próximas
chamadas (aceita tanto o token puro quanto `Bearer <token>`).

**Logout** — `POST /api/auth/logout` (cabeçalho `Authorization: <token>`) → `204 No Content`

**Validação de token (rota usada pelos Módulos B e C)** —
`GET /api/auth/validar/{token}`

Resposta quando válido:
```json
{
  "valido": true,
  "usuarioId": 2,
  "perfil": "ALUNO",
  "autorizado": null,
  "expiraEm": "2026-06-26T12:00:00"
}
```
Resposta quando inválido/expirado:
```json
{ "valido": false, "usuarioId": null, "perfil": null, "autorizado": null, "expiraEm": null }
```

Você também pode exigir um perfil específico, útil quando o Módulo C quer
garantir que só a comissão acesse uma rota:

```
GET /api/auth/validar/{token}?perfilExigido=COMISSAO
```
Nesse caso o campo `autorizado` vem `true`/`false` em vez de `null`.

## 4. Como os Módulos B e C devem integrar

Cada requisição que o aluno ou a comissão fizer aos Módulos B/C deve trazer o
token no cabeçalho `Authorization`. Antes de processar a regra de negócio,
o módulo deve chamar este serviço:

```
GET http://localhost:8081/api/auth/validar/{token}
```

- Se `valido = false` → responder `401 Unauthorized` ao cliente.
- Se `valido = true` → usar `usuarioId` e `perfil` retornados para aplicar as
  regras de autorização daquele módulo (ex.: "este `usuarioId` é o dono deste
  cadastro de participação?").

Isso é exatamente o que o enunciado pede: *"Os outros serviços devem ter
disponível um mecanismo de confirmação para consultar se um token é válido e
está autenticado."*

## 5. Decisões de projeto (para a apresentação)

- **Por que REST e não GraphQL?** Os Módulos B e C podem ser implementados em
  pilhas diferentes; um endpoint REST simples de validação de token é o mais
  fácil de consumir por qualquer stack, sem exigir um cliente GraphQL.
- **Por que sem Spring Security completo?** O enunciado dispensa
  explicitamente a parte de certificados e autoriza uma "função para
  simplificar a autenticação". Optamos por um `TokenService` próprio (mapa em
  memória) em vez de JWT, exatamente como a alternativa sugerida no enunciado.
- **Por que H2 em arquivo, e não em memória?** Para que os dados sobrevivam a
  reinicializações durante os testes de integração com os colegas dos
  Módulos B e C.
- **Senha sempre em hash (BCrypt)**, nunca armazenada em texto puro.
- **Exclusão lógica reforçada em duas camadas**: o `DELETE` só aceita o
  próprio `usuarioId` da sessão, e a validação de token também invalida a
  sessão automaticamente se o usuário for desativado por outro caminho.

## 6. Possíveis extensões (se quiserem ir além)

- Trocar o token simples por JWT assinado (estrutura já isolada em
  `TokenService`/`AuthService`, fácil de substituir sem tocar nos
  controllers).
- Persistir as sessões em uma tabela/Redis em vez de mapa em memória, para
  sobreviver a reinícios do serviço.
- Adicionar paginação em `GET /api/usuarios` quando a base crescer.

## 7. Estrutura do projeto

```
auth-service/
├── pom.xml
├── requests.http
└── src/main/java/br/edu/ufrrj/si/authservice/
    ├── AuthServiceApplication.java
    ├── config/        (CORS, BCrypt, Swagger)
    ├── controller/     (AuthController, UsuarioController)
    ├── dto/            (records de request/response)
    ├── exception/       (exceções + handler global)
    ├── model/           (Usuario, Perfil, StatusUsuario)
    ├── repository/      (UsuarioRepository)
    └── service/         (UsuarioService, AuthService, TokenService, SessaoToken)
```
