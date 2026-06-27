package br.edu.ufrrj.si.authservice.dto;

import jakarta.validation.constraints.NotBlank;

/** Corpo da requisicao de login (POST /api/auth/login). */
public record LoginRequest(

        @NotBlank(message = "O e-mail e obrigatorio.")
        String email,

        @NotBlank(message = "A senha e obrigatoria.")
        String senha
) {
}
