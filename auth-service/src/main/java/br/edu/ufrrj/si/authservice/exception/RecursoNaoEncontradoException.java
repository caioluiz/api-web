package br.edu.ufrrj.si.authservice.exception;

/** Lancada quando um usuario consultado por id nao existe na base. */
public class RecursoNaoEncontradoException extends RuntimeException {
    public RecursoNaoEncontradoException(String mensagem) {
        super(mensagem);
    }
}
