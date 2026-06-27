package br.edu.ufrrj.si.authservice.controller;

import br.edu.ufrrj.si.authservice.dto.LoginRequest;
import br.edu.ufrrj.si.authservice.dto.LoginResponse;
import br.edu.ufrrj.si.authservice.dto.ValidarTokenResponse;
import br.edu.ufrrj.si.authservice.model.Perfil;
import br.edu.ufrrj.si.authservice.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Autenticacao", description = "Login, logout e validacao de token (consumido pelos Modulos B e C)")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    @Operation(summary = "Autentica um usuario e emite um token de sessao de 8 digitos.")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest requisicao) {
        return ResponseEntity.ok(authService.login(requisicao));
    }

    @PostMapping("/logout")
    @Operation(summary = "Encerra a sessao associada ao token enviado no cabecalho Authorization.")
    public ResponseEntity<Void> logout(@RequestHeader("Authorization") String token) {
        authService.logout(token);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/validar/{token}")
    @Operation(summary = "Endpoint de confirmacao usado pelos Modulos B e C para checar um token.",
            description = "Informe 'perfilExigido' (ALUNO ou COMISSAO) para tambem checar se o token "
                    + "pertence ao perfil esperado pela rota que esta sendo protegida.")
    public ResponseEntity<ValidarTokenResponse> validar(
            @PathVariable String token,
            @RequestParam(required = false) Perfil perfilExigido) {
        return ResponseEntity.ok(authService.validarToken(token, perfilExigido));
    }
}
