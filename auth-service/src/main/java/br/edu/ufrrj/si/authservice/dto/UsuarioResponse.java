package br.edu.ufrrj.si.authservice.dto;

import br.edu.ufrrj.si.authservice.model.Perfil;
import br.edu.ufrrj.si.authservice.model.StatusUsuario;

import java.time.LocalDateTime;

/**
 * Representacao publica de um usuario (nunca inclui a senha/hash).
 */
public record UsuarioResponse(
        Long id,
        String nome,
        String email,
        Perfil perfil,
        StatusUsuario status,
        LocalDateTime dataCriacao,
        LocalDateTime dataAtualizacao
) {
}
