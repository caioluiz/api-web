package br.edu.ufrrj.si.authservice.security;

import br.edu.ufrrj.si.authservice.model.Perfil;
import br.edu.ufrrj.si.authservice.model.StatusUsuario;

public record UsuarioPrincipal(
        Long id,
        String email,
        Perfil perfil,
        StatusUsuario status
) {
}
