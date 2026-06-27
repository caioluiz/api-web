package br.edu.ufrrj.si.authservice.exception;

/** Lancada quando uma regra de negocio e violada (ex.: e-mail duplicado). */
public class RegraNegocioException extends RuntimeException {
    public RegraNegocioException(String mensagem) {
        super(mensagem);
    }
}
