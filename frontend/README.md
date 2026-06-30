# SisExt-SI Frontend

Frontend React + TypeScript para demonstrar o Módulo A do SisExt-SI: Gestão de Usuários e Autenticação.

## Stack

- React + TypeScript
- Vite
- React Router
- Axios
- CSS simples

## Configuração

Crie um arquivo `.env` a partir do exemplo:

```powershell
Copy-Item .env.example .env
```

O backend atual do repositório roda por padrão em `8081`, então o exemplo usa:

```env
VITE_API_BASE_URL=http://localhost:8081
```

Se o backend for executado em `8080`, altere a variável para `http://localhost:8080`.

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

## Fluxo de demonstração

1. Rode o backend do Módulo A.
2. Rode este frontend.
3. Cadastre um usuário `ALUNO`.
4. Cadastre um usuário `FUNCIONARIO`.
5. Faça login.
6. Acesse o dashboard e copie/valide o token.
7. Entre como `FUNCIONARIO` e acesse `Usuários`.
8. Liste, visualize, edite ou desative um usuário.
9. Entre como `ALUNO` e tente acessar `/usuarios`.
10. Demonstre que o acesso administrativo é bloqueado para `ALUNO`.

## Observações

- Não há backend fake nem mocks nas funcionalidades principais.
- `FUNCIONARIO` representa o papel interno responsável por avaliação, gestão ou validação.
- A rota `PATCH /api/usuarios/{id}` foi usada para edição porque o backend atual aceita atualização parcial.
- O botão Desativar chama `DELETE`, mas a API realiza exclusão lógica.
