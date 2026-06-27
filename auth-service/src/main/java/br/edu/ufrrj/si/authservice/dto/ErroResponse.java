package br.edu.ufrrj.si.authservice.dto;

import java.time.LocalDateTime;

/** Formato padronizado de erro retornado por toda a API. */
public record ErroResponse(
        LocalDateTime timestamp,
        int status,
        String erro,
        String mensagem,
        String caminho
) {
}
