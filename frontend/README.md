# SisExt-SI Auth Frontend

Frontend React + TypeScript para demonstrar o Modulo A do SisExt-SI: Gestao de Usuarios e Autenticacao.

## Stack

- React + TypeScript
- Vite
- React Router
- Axios
- CSS simples

## Configuracao

Crie um arquivo `.env` a partir do exemplo:

```powershell
Copy-Item .env.example .env
```

O backend atual do repositorio roda por padrao em `8081`, entao o exemplo usa:

```env
VITE_API_BASE_URL=http://localhost:8081
```

Se o backend for executado em `8080`, altere a variavel para `http://localhost:8080`.

## Como rodar

```powershell
cd frontend
npm install
npm run dev
```

Abra:

```text
http://localhost:5173
```

## Endpoints consumidos

- `POST /api/usuarios`
- `GET /api/usuarios`
- `GET /api/usuarios/{id}`
- `PATCH /api/usuarios/{id}`
- `DELETE /api/usuarios/{id}`
- `POST /api/auth/login`
- `POST /api/auth/validar`

## Fluxo de demonstracao

1. Rode o backend do Modulo A.
2. Rode este frontend.
3. Cadastre um usuario `ALUNO`.
4. Cadastre um usuario `FUNCIONARIO`.
5. Faca login.
6. Acesse o dashboard e copie/valide o token.
7. Entre como `FUNCIONARIO` e acesse `Usuarios`.
8. Liste, visualize, edite ou desative um usuario.
9. Entre como `ALUNO` e tente acessar `/usuarios`.
10. Demonstre que o acesso administrativo e bloqueado para `ALUNO`.

## Observacoes

- Nao ha backend fake nem mocks nas funcionalidades principais.
- `FUNCIONARIO` representa o papel interno equivalente a comissao/coordenacao.
- A rota `PATCH /api/usuarios/{id}` foi usada para edicao porque o backend atual aceita atualizacao parcial.
- O botao Desativar chama `DELETE`, mas a API realiza exclusao logica.
