package br.edu.ufrrj.si.authservice.dto;

import br.edu.ufrrj.si.authservice.model.Perfil;

import java.time.LocalDateTime;

/**
 * Resposta de um login bem-sucedido.
 * O campo "token" deve ser enviado pelo cliente no cabecalho
 * Authorization das proximas requisicoes (a este servico ou aos
 * servicos B/C, que irao validar o token aqui no Modulo A).
 */
public record LoginResponse(
        String token,
        Long usuarioId,
        String nome,
        Perfil perfil,
        LocalDateTime expiraEm
) {
}
