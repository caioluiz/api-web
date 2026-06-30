package br.edu.ufrrj.si.authservice.security;

import br.edu.ufrrj.si.authservice.model.Usuario;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;

@Service
public class JwtService {

    private final SecretKey chaveAssinatura;
    private final long expiracaoMinutos;

    public JwtService(
            @Value("${auth.jwt.secret}") String secret,
            @Value("${auth.jwt.expiration-minutes}") long expiracaoMinutos) {
        this.chaveAssinatura = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expiracaoMinutos = expiracaoMinutos;
    }

    public String gerarToken(Usuario usuario) {
        LocalDateTime agora = LocalDateTime.now();
        LocalDateTime expiraEm = calcularExpiracao(agora);

        return Jwts.builder()
                .subject(usuario.getEmail())
                .claim("usuarioId", usuario.getId())
                .claim("perfil", usuario.getPerfil().name())
                .issuedAt(toDate(agora))
                .expiration(toDate(expiraEm))
                .signWith(chaveAssinatura)
                .compact();
    }

    public LocalDateTime calcularExpiracao(LocalDateTime dataBase) {
        return dataBase.plusMinutes(expiracaoMinutos);
    }

    public Claims parseClaims(String token) throws JwtException, IllegalArgumentException {
        return Jwts.parser()
                .verifyWith(chaveAssinatura)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public Long getUsuarioId(Claims claims) {
        Object valor = claims.get("usuarioId");
        if (valor instanceof Number numero) {
            return numero.longValue();
        }
        if (valor instanceof String texto) {
            return Long.valueOf(texto);
        }
        throw new JwtException("Claim usuarioId ausente ou invalida.");
    }

    private Date toDate(LocalDateTime data) {
        return Date.from(data.atZone(ZoneId.systemDefault()).toInstant());
    }
}
