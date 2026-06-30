package br.edu.ufrrj.si.authservice.dto;

import br.edu.ufrrj.si.authservice.model.Perfil;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.Map;

public record CadastroUsuarioRequest(

        @NotBlank(message = "O nome e obrigatorio.")
        @Size(max = 150, message = "O nome deve ter no maximo 150 caracteres.")
        String nome,

        @NotBlank(message = "O CPF e obrigatorio.")
        String cpf,

        @NotBlank(message = "O celular e obrigatorio.")
        @Size(max = 20, message = "O celular deve ter no maximo 20 caracteres.")
        String celular,

        @NotNull(message = "A data de nascimento e obrigatoria.")
        LocalDate dataNascimento,

        @NotNull(message = "Os detalhes do perfil sao obrigatorios.")
        Map<String, Object> detalhesPerfil,

        @NotBlank(message = "O e-mail e obrigatorio.")
        @Email(message = "Informe um e-mail valido.")
        @Size(max = 150, message = "O e-mail deve ter no maximo 150 caracteres.")
        String email,

        @NotBlank(message = "A senha e obrigatoria.")
        @Size(min = 6, max = 72, message = "A senha deve ter entre 6 e 72 caracteres.")
        String senha,

        @NotNull(message = "O perfil e obrigatorio (ALUNO ou FUNCIONARIO).")
        Perfil perfil
) {
}
