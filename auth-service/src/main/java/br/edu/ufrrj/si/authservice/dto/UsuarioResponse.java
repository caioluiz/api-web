package br.edu.ufrrj.si.authservice.dto;

import br.edu.ufrrj.si.authservice.model.Perfil;
import br.edu.ufrrj.si.authservice.model.StatusUsuario;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;

public record UsuarioResponse(
        Long id,
        String nome,
        String cpf,
        String celular,
        LocalDate dataNascimento,
        Map<String, Object> detalhesPerfil,
        String email,
        Perfil perfil,
        StatusUsuario status,
        LocalDateTime dataCriacao,
        LocalDateTime dataAtualizacao
) {
}
