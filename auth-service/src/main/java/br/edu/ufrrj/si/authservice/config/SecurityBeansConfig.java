package br.edu.ufrrj.si.authservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Disponibiliza o BCryptPasswordEncoder sem precisar habilitar o
 * Spring Security completo (o enunciado dispensa a parte de
 * certificados/filtros e permite uma autenticacao simplificada).
 */
@Configuration
public class SecurityBeansConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
