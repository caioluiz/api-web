create table usuarios (
    id bigserial primary key,
    nome varchar(150) not null,
    cpf varchar(11) not null unique,
    celular varchar(20) not null,
    data_nascimento date not null,
    detalhes_perfil jsonb not null,
    email varchar(150) not null unique,
    senha varchar(100) not null,
    perfil varchar(20) not null check (perfil in ('ALUNO', 'FUNCIONARIO')),
    status varchar(20) not null check (status in ('ATIVO', 'DESATIVADO')),
    data_criacao timestamp not null,
    data_atualizacao timestamp
);

create index idx_usuarios_perfil on usuarios (perfil);
create index idx_usuarios_status on usuarios (status);
