package br.edu.ufrrj.si.authservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Modulo A do SisExt-SI: Servico de Gestao de Usuarios e Autenticacao.
 *
 * Responsabilidades (ver enunciado, secao 4 - Modulo A):
 *  - CRUD de usuarios, separando estritamente os perfis ALUNO e COMISSAO;
 *  - Exclusao logica (o usuario nunca e removido fisicamente da base);
 *  - Emissao de tokens de sessao de 8 digitos (tokens que comecam com '1'
 *    pertencem a COMISSAO; os demais pertencem a ALUNO);
 *  - Endpoint de validacao de token, consumido pelos Modulos B e C.
 */
@SpringBootApplication
public class AuthServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(AuthServiceApplication.class, args);
    }
}
