package br.edu.ufrrj.si.authservice.dto;

import br.edu.ufrrj.si.authservice.model.Perfil;

import java.time.LocalDateTime;

/**
 * Resposta do endpoint GET /api/auth/validar/{token}.
 *
 * Este e o "contrato" que os Modulos B (Servico do Aluno) e C
 * (Servico da Comissao) devem consumir para checar se um token
 * e valido e, opcionalmente, se pertence ao perfil exigido pela
 * rota que esta sendo protegida (parametro ?perfilExigido=).
 *
 * Quando o token e invalido/expirado: valido=false e os demais
 * campos vem nulos.
 */
public record ValidarTokenResponse(
        boolean valido,
        Long usuarioId,
        Perfil perfil,
        Boolean autorizado,
        LocalDateTime expiraEm
) {

    public static ValidarTokenResponse invalido() {
        return new ValidarTokenResponse(false, null, null, null, null);
    }
}
