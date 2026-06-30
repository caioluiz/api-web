package br.edu.ufrrj.si.authservice.dto;

import jakarta.validation.constraints.NotBlank;

public record ValidarTokenRequest(
        @NotBlank(message = "O token e obrigatorio.")
        String token
) {
}
