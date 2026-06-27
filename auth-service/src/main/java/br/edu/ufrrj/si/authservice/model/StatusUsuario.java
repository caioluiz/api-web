package br.edu.ufrrj.si.authservice.model;

/**
 * Estado do cadastro do usuario.
 * Nunca existe exclusao fisica: "remover" um usuario significa
 * apenas migrar seu status para DESATIVADO (enunciado, Modulo A).
 */
public enum StatusUsuario {
    ATIVO,
    DESATIVADO
}
