package br.edu.ufrrj.si.authservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Modulo A do SisExt-SI: Servico de Gestao de Usuarios e Autenticacao.
 *
 * Responsabilidades (ver enunciado, secao 4 - Modulo A):
 *  - CRUD de usuarios, separando estritamente os perfis ALUNO e FUNCIONARIO;
 *  - Exclusao logica (o usuario nunca e removido fisicamente da base);
 *  - Emissao e validacao de JWT;
 *  - Endpoint de validacao de token consumido pelos Modulos B e C.
 */
@SpringBootApplication
public class AuthServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(AuthServiceApplication.class, args);
    }
}
