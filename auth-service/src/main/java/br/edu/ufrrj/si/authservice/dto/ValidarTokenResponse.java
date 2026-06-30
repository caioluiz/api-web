package br.edu.ufrrj.si.authservice.dto;

import br.edu.ufrrj.si.authservice.model.Perfil;
import br.edu.ufrrj.si.authservice.model.StatusUsuario;
import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ValidarTokenResponse(
        boolean valido,
        String motivo,
        Long usuarioId,
        String nome,
        String email,
        Perfil perfil,
        StatusUsuario status
) {

    public static ValidarTokenResponse valido(Long usuarioId, String nome, String email,
                                              Perfil perfil, StatusUsuario status) {
        return new ValidarTokenResponse(true, null, usuarioId, nome, email, perfil, status);
    }

    public static ValidarTokenResponse invalido(String motivo) {
        return new ValidarTokenResponse(false, motivo, null, null, null, null, null);
    }
}
