package br.edu.ufrrj.si.authservice.dto;

import br.edu.ufrrj.si.authservice.model.Perfil;
import br.edu.ufrrj.si.authservice.model.StatusUsuario;

import java.time.LocalDateTime;

public record LoginResponse(
        String accessToken,
        String tokenType,
        LocalDateTime expiraEm,
        Long usuarioId,
        String nome,
        String email,
        Perfil perfil,
        StatusUsuario status
) {
}
