package br.edu.ufrrj.si.authservice.service;

import br.edu.ufrrj.si.authservice.model.Perfil;

import java.time.LocalDateTime;

/**
 * Sessao associada a um token valido, mantida em memoria pelo
 * TokenService (enunciado: "Guarde o token de usuario em uma sessao").
 */
public record SessaoToken(Long usuarioId, Perfil perfil, LocalDateTime expiraEm) {
}
