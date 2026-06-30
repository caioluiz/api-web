package br.edu.ufrrj.si.authservice.service;

import br.edu.ufrrj.si.authservice.dto.LoginRequest;
import br.edu.ufrrj.si.authservice.dto.LoginResponse;
import br.edu.ufrrj.si.authservice.dto.ValidarTokenResponse;
import br.edu.ufrrj.si.authservice.exception.AcessoNegadoException;
import br.edu.ufrrj.si.authservice.exception.NaoAutorizadoException;
import br.edu.ufrrj.si.authservice.model.StatusUsuario;
import br.edu.ufrrj.si.authservice.model.Usuario;
import br.edu.ufrrj.si.authservice.repository.UsuarioRepository;
import br.edu.ufrrj.si.authservice.security.JwtService;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UsuarioRepository usuarioRepository, JwtService jwtService, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest requisicao) {
        String email = requisicao.email().trim().toLowerCase();
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new NaoAutorizadoException("E-mail ou senha invalidos."));

        if (usuario.getStatus() == StatusUsuario.DESATIVADO) {
            throw new AcessoNegadoException("Esta conta esta desativada.");
        }

        if (!passwordEncoder.matches(requisicao.senha(), usuario.getSenha())) {
            throw new NaoAutorizadoException("E-mail ou senha invalidos.");
        }

        LocalDateTime agora = LocalDateTime.now();
        String token = jwtService.gerarToken(usuario);
        return new LoginResponse(
                token,
                "Bearer",
                jwtService.calcularExpiracao(agora),
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getPerfil(),
                usuario.getStatus()
        );
    }

    @Transactional(readOnly = true)
    public ValidarTokenResponse validarToken(String tokenBruto) {
        String token = normalizarToken(tokenBruto);
        if (token == null || token.isBlank()) {
            return ValidarTokenResponse.invalido("TOKEN_AUSENTE");
        }

        try {
            Long usuarioId = jwtService.getUsuarioId(jwtService.parseClaims(token));
            Usuario usuario = usuarioRepository.findById(usuarioId).orElse(null);
            if (usuario == null) {
                return ValidarTokenResponse.invalido("USUARIO_NAO_ENCONTRADO");
            }
            if (usuario.getStatus() == StatusUsuario.DESATIVADO) {
                return ValidarTokenResponse.invalido("USUARIO_DESATIVADO");
            }
            return ValidarTokenResponse.valido(
                    usuario.getId(),
                    usuario.getNome(),
                    usuario.getEmail(),
                    usuario.getPerfil(),
                    usuario.getStatus()
            );
        } catch (ExpiredJwtException ex) {
            return ValidarTokenResponse.invalido("TOKEN_EXPIRADO");
        } catch (JwtException | IllegalArgumentException ex) {
            return ValidarTokenResponse.invalido("TOKEN_INVALIDO");
        }
    }

    public String normalizarToken(String tokenBruto) {
        if (tokenBruto == null) {
            return null;
        }
        String valor = tokenBruto.trim();
        if (valor.regionMatches(true, 0, "Bearer ", 0, 7)) {
            valor = valor.substring(7).trim();
        }
        return valor;
    }
}
