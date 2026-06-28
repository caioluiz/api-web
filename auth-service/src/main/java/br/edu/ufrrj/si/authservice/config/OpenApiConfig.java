package br.edu.ufrrj.si.authservice.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Metadados exibidos na documentacao automatica (Swagger UI em
 * /swagger-ui.html). Util para apresentar o "Contrato da API" deste
 * modulo aos colegas que vao implementar os Modulos B e C.
 */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI().info(new Info()
                .title("Auth Service - Modulo A (SisExt-SI)")
                .version("1.0.0")
                .description("Servico de Gestao de Usuarios e Autenticacao do ecossistema de "
                        + "submissao, consulta e validacao de horas extensionistas. "
                        + "Os Modulos B e C devem consumir o endpoint POST /api/auth/validar "
                        + "para confirmar a autenticidade dos tokens recebidos."));
    }
}
