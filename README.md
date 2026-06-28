# SisExt-SI - Módulo A

Este repositório contém o **Módulo A** do projeto SisExt-SI: o serviço de gestão de usuários e autenticação.

O projeto possui duas partes:

- `auth-service`: API em Java, Spring Boot e Maven.
- `frontend`: interface em React, TypeScript e Vite.

A API é responsável por cadastro de usuários, login, autenticação com JWT, validação de token, controle de perfis e exclusão lógica.

## Tecnologias

- Java 17 ou superior.
- Maven.
- PostgreSQL.
- Node.js 20 ou superior.
- npm.
- Docker Desktop, opcional.

## Perfis do sistema

O sistema usa dois perfis:

- `ALUNO`: usuário discente.
- `FUNCIONARIO`: usuário interno responsável por avaliar, gerenciar ou validar informações do sistema.

No contexto do projeto acadêmico, `FUNCIONARIO` representa o papel equivalente à comissão ou coordenação.

## Como rodar com Docker

Este é o caminho mais simples, porque o Docker sobe a API e o PostgreSQL juntos.

Antes de começar, instale e abra o Docker Desktop. No Windows, talvez seja necessário reiniciar o computador depois da instalação do Docker e do WSL.

Entre na pasta da API:

```powershell
cd "C:\caminho\para\api-web\auth-service"
```

Suba os containers:

```powershell
docker compose up --build
```

Quando terminar, a API estará disponível em:

```text
http://localhost:8081
```

Swagger:

```text
http://localhost:8081/swagger-ui.html
```

## Como rodar sem Docker

Use esta opção se preferir rodar o PostgreSQL diretamente no computador.

### 1. Instale o PostgreSQL

Instale o PostgreSQL e crie um banco chamado:

```text
sisext_si
```

Use estes dados, ou altere as variáveis de ambiente da aplicação:

```text
Host: localhost
Porta: 5432
Banco: sisext_si
Usuário: postgres
Senha: postgres
```

Se estiver usando PostgreSQL instalado pelo Scoop, inicie o banco com:

```powershell
& "$env:USERPROFILE\scoop\apps\postgresql\current\bin\pg_ctl.exe" -D "$env:USERPROFILE\scoop\apps\postgresql\current\data" -l "$env:USERPROFILE\scoop\apps\postgresql\current\data\server.log" start
```

Para criar o banco, use:

```powershell
& "$env:USERPROFILE\scoop\apps\postgresql\current\bin\createdb.exe" -U postgres -h localhost -p 5432 sisext_si
```

Se o banco já existir, esse comando pode mostrar erro de duplicidade. Nesse caso, pode seguir para o próximo passo.

### 2. Rode o backend

Entre na pasta da API:

```powershell
cd "C:\caminho\para\api-web\auth-service"
```

Execute:

```powershell
mvn spring-boot:run
```

Se você estiver usando o Maven que foi baixado dentro da pasta do trabalho, execute:

```powershell
& "..\..\.tools\apache-maven-3.9.16\bin\mvn.cmd" spring-boot:run
```

O backend deve subir em:

```text
http://localhost:8081
```

Confirme abrindo:

```text
http://localhost:8081/swagger-ui.html
```

## Como rodar o frontend

Abra outro terminal e entre na pasta do frontend:

```powershell
cd "C:\caminho\para\api-web\frontend"
```

Instale as dependências:

```powershell
npm install
```

Crie o arquivo `.env` a partir do exemplo:

```powershell
Copy-Item .env.example .env
```

Confira se o arquivo `.env` possui:

```env
VITE_API_BASE_URL=http://localhost:8081
```

Inicie o frontend:

```powershell
npm run dev
```

Abra no navegador:

```text
http://localhost:5173
```

## Fluxo recomendado para testar

1. Suba o PostgreSQL.
2. Suba o backend.
3. Suba o frontend.
4. Acesse `http://localhost:5173`.
5. Cadastre um usuário `FUNCIONARIO`.
6. Cadastre um usuário `ALUNO`.
7. Faça login com o `FUNCIONARIO`.
8. Acesse o dashboard.
9. Valide o token JWT.
10. Acesse a tela de usuários.
11. Liste, edite e desative um usuário.
12. Faça login com o `ALUNO`.
13. Tente acessar `/usuarios`.
14. Confirme que o acesso administrativo é bloqueado para `ALUNO`.

## Endpoints principais

Autenticação:

- `POST /api/auth/login`
- `POST /api/auth/validar`

Usuários:

- `POST /api/usuarios`
- `GET /api/usuarios`
- `GET /api/usuarios/{id}`
- `PUT /api/usuarios/{id}`
- `PATCH /api/usuarios/{id}`
- `DELETE /api/usuarios/{id}`

## Testes do Backend

Entre na pasta da API:

```powershell
cd "C:\caminho\para\api-web\auth-service"
```

Execute:

```powershell
mvn test
```

Os testes usam H2 em memória e não dependem do PostgreSQL local.

## Build do Frontend

Entre na pasta do frontend:

```powershell
cd "C:\caminho\para\api-web\frontend"
```

Execute:

```powershell
npm run build
```

## Problemas comuns

### O backend não sobe.

Verifique se o PostgreSQL está rodando na porta `5432`.

No Windows:

```powershell
Test-NetConnection 127.0.0.1 -Port 5432
```

Se `TcpTestSucceeded` for `False`, o banco está parado.

### A porta 8081 está ocupada.

Isso significa que já existe outro backend rodando nessa porta. Feche o processo antigo ou altere a porta com a variável:

```powershell
$env:SERVER_PORT=8082
```

### O frontend não consegue conectar na API.

Confirme se o backend está aberto em:

```text
http://localhost:8081/swagger-ui.html
```

Depois confira o arquivo `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8081
```

### O Docker não inicia no Windows.

Abra o Docker Desktop uma vez. Se ele pedir reinicialização, reinicie o computador.

Também verifique se o WSL está instalado:

```powershell
wsl --status
```

## Observações

- O backend não usa mais H2 como banco principal.
- O banco principal é PostgreSQL.
- H2 é usado apenas nos testes automatizados.
- O `DELETE /api/usuarios/{id}` faz exclusão lógica. Ele altera o status para `DESATIVADO`, mas não remove o registro fisicamente.
- Usuários desativados não conseguem fazer login.
