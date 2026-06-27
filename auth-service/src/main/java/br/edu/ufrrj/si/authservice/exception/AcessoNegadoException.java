package br.edu.ufrrj.si.authservice.exception;

/**
 * Lancada quando o token e valido (usuario autenticado), mas o
 * usuario nao tem permissao para a operacao solicitada -- ex.: um
 * aluno tentando alterar o cadastro de outro aluno.
 */
public class AcessoNegadoException extends RuntimeException {
    public AcessoNegadoException(String mensagem) {
        super(mensagem);
    }
}
