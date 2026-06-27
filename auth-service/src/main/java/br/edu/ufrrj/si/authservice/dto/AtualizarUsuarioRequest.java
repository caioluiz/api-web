package br.edu.ufrrj.si.authservice.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

/**
 * Corpo da requisicao de atualizacao (PUT /api/usuarios/{id}).
 * Todos os campos sao opcionais: somente os preenchidos sao alterados.
 * Perfil e status NAO sao editaveis por esta rota (status so muda
 * via desativacao logica; perfil e definido apenas no cadastro).
 */
public record AtualizarUsuarioRequest(

        @Size(max = 150, message = "O nome deve ter no maximo 150 caracteres.")
        String nome,

        @Email(message = "Informe um e-mail valido.")
        @Size(max = 150, message = "O e-mail deve ter no maximo 150 caracteres.")
        String email,

        @Size(min = 6, max = 72, message = "A senha deve ter entre 6 e 72 caracteres.")
        String senha
) {
}
