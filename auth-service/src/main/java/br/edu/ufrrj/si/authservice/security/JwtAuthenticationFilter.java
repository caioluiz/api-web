package br.edu.ufrrj.si.authservice.security;

import br.edu.ufrrj.si.authservice.model.StatusUsuario;
import br.edu.ufrrj.si.authservice.model.Usuario;
import br.edu.ufrrj.si.authservice.repository.UsuarioRepository;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UsuarioRepository usuarioRepository;

    public JwtAuthenticationFilter(JwtService jwtService, UsuarioRepository usuarioRepository) {
        this.jwtService = jwtService;
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String authorization = request.getHeader("Authorization");

        if (authorization != null && authorization.regionMatches(true, 0, "Bearer ", 0, 7)
                && SecurityContextHolder.getContext().getAuthentication() == null) {
            autenticarSeTokenValido(authorization.substring(7).trim(), request);
        }

        filterChain.doFilter(request, response);
    }

    private void autenticarSeTokenValido(String token, HttpServletRequest request) {
        try {
            Long usuarioId = jwtService.getUsuarioId(jwtService.parseClaims(token));
            Usuario usuario = usuarioRepository.findById(usuarioId).orElse(null);
            if (usuario == null || usuario.getStatus() != StatusUsuario.ATIVO) {
                return;
            }

            UsuarioPrincipal principal = new UsuarioPrincipal(
                    usuario.getId(),
                    usuario.getEmail(),
                    usuario.getPerfil(),
                    usuario.getStatus()
            );
            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    principal,
                    null,
                    List.of(new SimpleGrantedAuthority("ROLE_" + usuario.getPerfil().name()))
            );
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authentication);
        } catch (JwtException | IllegalArgumentException ex) {
            SecurityContextHolder.clearContext();
        }
    }
}
