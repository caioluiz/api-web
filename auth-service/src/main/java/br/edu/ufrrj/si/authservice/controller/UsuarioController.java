package br.edu.ufrrj.si.authservice.controller;

import br.edu.ufrrj.si.authservice.dto.AtualizarUsuarioRequest;
import br.edu.ufrrj.si.authservice.dto.CadastroUsuarioRequest;
import br.edu.ufrrj.si.authservice.dto.UsuarioResponse;
import br.edu.ufrrj.si.authservice.exception.AcessoNegadoException;
import br.edu.ufrrj.si.authservice.model.Perfil;
import br.edu.ufrrj.si.authservice.service.AuthService;
import br.edu.ufrrj.si.authservice.service.SessaoToken;
import br.edu.ufrrj.si.authservice.service.UsuarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@Tag(name = "Usuarios", description = "CRUD de usuarios (ALUNO e COMISSAO) e exclusao logica")
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final AuthService authService;

    public UsuarioController(UsuarioService usuarioService, AuthService authService) {
        this.usuarioService = usuarioService;
        this.authService = authService;
    }

    @PostMapping
    @Operation(summary = "Cadastra um novo usuario (ALUNO ou COMISSAO). Rota publica.")
    public ResponseEntity<UsuarioResponse> cadastrar(@Valid @RequestBody CadastroUsuarioRequest requisicao) {
        return ResponseEntity.status(HttpStatus.CREATED).body(usuarioService.cadastrar(requisicao));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Consulta um usuario pelo id. Exige token valido de qualquer perfil.")
    public ResponseEntity<UsuarioResponse> buscarPorId(
            @PathVariable Long id,
            @RequestHeader("Authorization") String token) {
        authService.exigirAutenticacao(token);
        return ResponseEntity.ok(usuarioService.buscarPorId(id));
    }

    @GetMapping
    @Operation(summary = "Lista todos os usuarios. Restrito a membros da COMISSAO.")
    public ResponseEntity<List<UsuarioResponse>> listarTodos(@RequestHeader("Authorization") String token) {
        SessaoToken sessao = authService.exigirAutenticacao(token);
        if (sessao.perfil() != Perfil.COMISSAO) {
            throw new AcessoNegadoException("Apenas membros da comissao podem listar todos os usuarios.");
        }
        return ResponseEntity.ok(usuarioService.listarTodos());
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualiza nome/e-mail/senha. ALUNO so altera o proprio cadastro; COMISSAO altera qualquer um.")
    public ResponseEntity<UsuarioResponse> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody AtualizarUsuarioRequest requisicao,
            @RequestHeader("Authorization") String token) {
        SessaoToken sessao = authService.exigirAutenticacao(token);
        return ResponseEntity.ok(usuarioService.atualizar(id, requisicao, sessao));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Exclusao logica: o usuario so pode desativar a propria conta (nunca exclusao fisica).")
    public ResponseEntity<UsuarioResponse> desativar(
            @PathVariable Long id,
            @RequestHeader("Authorization") String token) {
        SessaoToken sessao = authService.exigirAutenticacao(token);
        return ResponseEntity.ok(usuarioService.desativar(id, sessao));
    }
}
