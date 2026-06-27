package br.edu.ufrrj.si.authservice.exception;

/** Lancada quando o token informado e ausente, invalido ou expirado. */
public class NaoAutorizadoException extends RuntimeException {
    public NaoAutorizadoException(String mensagem) {
        super(mensagem);
    }
}
