package br.edu.ufrrj.si.authservice.service;

import br.edu.ufrrj.si.authservice.dto.LoginRequest;
import br.edu.ufrrj.si.authservice.dto.LoginResponse;
import br.edu.ufrrj.si.authservice.dto.ValidarTokenResponse;
import br.edu.ufrrj.si.authservice.exception.AcessoNegadoException;
import br.edu.ufrrj.si.authservice.exception.NaoAutorizadoException;
import br.edu.ufrrj.si.authservice.model.Perfil;
import br.edu.ufrrj.si.authservice.model.StatusUsuario;
import br.edu.ufrrj.si.authservice.model.Usuario;
import br.edu.ufrrj.si.authservice.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final TokenService tokenService;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UsuarioRepository usuarioRepository, TokenService tokenService, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.tokenService = tokenService;
        this.passwordEncoder = passwordEncoder;
    }

    /** Autentica usuario/senha e emite um novo token de sessao. */
    public LoginResponse login(LoginRequest requisicao) {
        Usuario usuario = usuarioRepository.findByEmail(requisicao.email())
                .orElseThrow(() -> new NaoAutorizadoException("E-mail ou senha invalidos."));

        if (usuario.getStatus() == StatusUsuario.DESATIVADO) {
            throw new AcessoNegadoException("Esta conta foi desativada. Procure a coordenacao do curso.");
        }

        if (!passwordEncoder.matches(requisicao.senha(), usuario.getSenha())) {
            throw new NaoAutorizadoException("E-mail ou senha invalidos.");
        }

        String token = tokenService.gerarToken(usuario.getId(), usuario.getPerfil());
        SessaoToken sessao = tokenService.validar(token)
                .orElseThrow(() -> new IllegalStateException("Falha inesperada ao criar a sessao do token."));

        return new LoginResponse(token, usuario.getId(), usuario.getNome(), usuario.getPerfil(), sessao.expiraEm());
    }

    /** Encerra a sessao do token informado. Idempotente: nao falha se o token ja nao existir. */
    public void logout(String tokenBruto) {
        tokenService.invalidar(normalizarToken(tokenBruto));
    }

    /**
     * Endpoint de confirmacao consumido pelos demais modulos (B e C):
     * verifica se o token e valido e, opcionalmente, se pertence ao
     * perfil exigido pela rota protegida que esta sendo acessada.
     */
    public ValidarTokenResponse validarToken(String token, Perfil perfilExigido) {
        SessaoToken sessao = tokenService.validar(token).orElse(null);
        if (sessao == null) {
            return ValidarTokenResponse.invalido();
        }

        // Revalida contra a base: se o usuario foi desativado depois do login,
        // a sessao deixa de valer mesmo que o token ainda nao tenha expirado.
        Usuario usuario = usuarioRepository.findById(sessao.usuarioId()).orElse(null);
        if (usuario == null || usuario.getStatus() == StatusUsuario.DESATIVADO) {
            tokenService.invalidar(token);
            return ValidarTokenResponse.invalido();
        }

        Boolean autorizado = (perfilExigido == null) ? null : (perfilExigido == sessao.perfil());
        return new ValidarTokenResponse(true, sessao.usuarioId(), sessao.perfil(), autorizado, sessao.expiraEm());
    }

    /**
     * Usado pelos controllers deste proprio servico (UsuarioController) para
     * proteger rotas internas. Lanca 401 se o token estiver ausente/invalido.
     */
    public SessaoToken exigirAutenticacao(String tokenBruto) {
        String token = normalizarToken(tokenBruto);
        return tokenService.validar(token)
                .orElseThrow(() -> new NaoAutorizadoException("Token invalido, expirado ou ausente."));
    }

    /** Aceita tanto "Bearer 12345678" quanto apenas "12345678". */
    private String normalizarToken(String tokenBruto) {
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
