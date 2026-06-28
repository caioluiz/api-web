package br.edu.ufrrj.si.authservice.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.Map;

public record AtualizarUsuarioRequest(

        @Size(max = 150, message = "O nome deve ter no maximo 150 caracteres.")
        String nome,

        String cpf,

        @Size(max = 20, message = "O celular deve ter no maximo 20 caracteres.")
        String celular,

        LocalDate dataNascimento,

        Map<String, Object> detalhesPerfil,

        @Email(message = "Informe um e-mail valido.")
        @Size(max = 150, message = "O e-mail deve ter no maximo 150 caracteres.")
        String email,

        @Size(min = 6, max = 72, message = "A senha deve ter entre 6 e 72 caracteres.")
        String senha
) {
}
