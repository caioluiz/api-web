package br.edu.ufrrj.si.authservice.controller;

import br.edu.ufrrj.si.authservice.dto.LoginRequest;
import br.edu.ufrrj.si.authservice.dto.LoginResponse;
import br.edu.ufrrj.si.authservice.dto.ValidarTokenRequest;
import br.edu.ufrrj.si.authservice.dto.ValidarTokenResponse;
import br.edu.ufrrj.si.authservice.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Autenticacao", description = "Login JWT e validacao de token para integracao entre modulos")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    @Operation(summary = "Autentica um usuario e emite um JWT.")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest requisicao) {
        return ResponseEntity.ok(authService.login(requisicao));
    }

    @PostMapping("/validar")
    @Operation(summary = "Valida um JWT e retorna os dados publicos do usuario autenticado.")
    public ResponseEntity<ValidarTokenResponse> validar(@RequestBody(required = false) ValidarTokenRequest requisicao) {
        String token = requisicao == null ? null : requisicao.token();
        return ResponseEntity.ok(authService.validarToken(token));
    }
}
