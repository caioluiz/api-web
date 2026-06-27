package br.edu.ufrrj.si.authservice.service;

import br.edu.ufrrj.si.authservice.model.Perfil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Gera, guarda em sessao (mapa em memoria) e valida os tokens de
 * autenticacao, seguindo exatamente a regra simplificada do enunciado:
 *
 *   - Token aleatorio com 8 digitos numericos;
 *   - Se comeca com '1' -> pertence a um usuario da COMISSAO;
 *   - Qualquer outro primeiro digito -> pertence a um ALUNO;
 *   - O token e guardado em uma "sessao" (aqui, um mapa em memoria do
 *     processo) com data de expiracao, e os demais servicos (Modulo B
 *     e Modulo C) confirmam a validade chamando o Modulo A.
 *
 * Observacao: por ser um mapa em memoria, as sessoes existem apenas
 * enquanto esta instancia da aplicacao estiver de pe (escopo academico,
 * suficiente para a demonstracao do fluxo completo).
 */
@Service
public class TokenService {

    private static final int TAMANHO_TOKEN = 8;

    private final Map<String, SessaoToken> sessoes = new ConcurrentHashMap<>();
    private final SecureRandom random = new SecureRandom();

    @Value("${auth.token.duracao-minutos:120}")
    private long duracaoMinutos;

    /** Gera um novo token para o usuario/perfil informado e o guarda em sessao. */
    public String gerarToken(Long usuarioId, Perfil perfil) {
        String token;
        do {
            token = construirToken(perfil);
        } while (sessoes.containsKey(token));

        SessaoToken sessao = new SessaoToken(usuarioId, perfil, LocalDateTime.now().plusMinutes(duracaoMinutos));
        sessoes.put(token, sessao);
        return token;
    }

    private String construirToken(Perfil perfil) {
        StringBuilder sb = new StringBuilder(TAMANHO_TOKEN);

        int primeiroDigito;
        if (perfil == Perfil.COMISSAO) {
            primeiroDigito = 1;
        } else {
            do {
                primeiroDigito = random.nextInt(10);
            } while (primeiroDigito == 1);
        }
        sb.append(primeiroDigito);

        for (int i = 1; i < TAMANHO_TOKEN; i++) {
            sb.append(random.nextInt(10));
        }
        return sb.toString();
    }

    /** Retorna a sessao associada ao token, se ele existir e ainda nao tiver expirado. */
    public Optional<SessaoToken> validar(String token) {
        if (token == null || token.isBlank()) {
            return Optional.empty();
        }
        SessaoToken sessao = sessoes.get(token);
        if (sessao == null) {
            return Optional.empty();
        }
        if (sessao.expiraEm().isBefore(LocalDateTime.now())) {
            sessoes.remove(token);
            return Optional.empty();
        }
        return Optional.of(sessao);
    }

    /** Encerra a sessao (logout) ou forca a invalidacao de um token. */
    public void invalidar(String token) {
        if (token != null) {
            sessoes.remove(token);
        }
    }
}
