package br.edu.ufrrj.si.authservice.controller;

import br.edu.ufrrj.si.authservice.dto.AtualizarUsuarioRequest;
import br.edu.ufrrj.si.authservice.dto.CadastroUsuarioRequest;
import br.edu.ufrrj.si.authservice.dto.UsuarioResponse;
import br.edu.ufrrj.si.authservice.security.UsuarioPrincipal;
import br.edu.ufrrj.si.authservice.service.UsuarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@Tag(name = "Usuarios", description = "CRUD de usuarios ALUNO/FUNCIONARIO e exclusao logica")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping
    @Operation(summary = "Cadastra um novo usuario ALUNO ou FUNCIONARIO. Rota publica.")
    public ResponseEntity<UsuarioResponse> cadastrar(@Valid @RequestBody CadastroUsuarioRequest requisicao) {
        return ResponseEntity.status(HttpStatus.CREATED).body(usuarioService.cadastrar(requisicao));
    }

    @GetMapping
    @Operation(summary = "Lista todos os usuarios. Restrito a FUNCIONARIO.")
    public ResponseEntity<List<UsuarioResponse>> listarTodos(@AuthenticationPrincipal UsuarioPrincipal principal) {
        return ResponseEntity.ok(usuarioService.listarTodos(principal));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Consulta usuario por id. ALUNO acessa apenas o proprio cadastro; FUNCIONARIO acessa todos.")
    public ResponseEntity<UsuarioResponse> buscarPorId(
            @PathVariable Long id,
            @AuthenticationPrincipal UsuarioPrincipal principal) {
        return ResponseEntity.ok(usuarioService.buscarPorId(id, principal));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualiza parcialmente um usuario.")
    public ResponseEntity<UsuarioResponse> atualizarPut(
            @PathVariable Long id,
            @Valid @RequestBody AtualizarUsuarioRequest requisicao,
            @AuthenticationPrincipal UsuarioPrincipal principal) {
        return ResponseEntity.ok(usuarioService.atualizar(id, requisicao, principal));
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Atualiza parcialmente um usuario.")
    public ResponseEntity<UsuarioResponse> atualizarPatch(
            @PathVariable Long id,
            @Valid @RequestBody AtualizarUsuarioRequest requisicao,
            @AuthenticationPrincipal UsuarioPrincipal principal) {
        return ResponseEntity.ok(usuarioService.atualizar(id, requisicao, principal));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Desativa logicamente um usuario, sem excluir fisicamente o registro.")
    public ResponseEntity<UsuarioResponse> desativar(
            @PathVariable Long id,
            @AuthenticationPrincipal UsuarioPrincipal principal) {
        return ResponseEntity.ok(usuarioService.desativar(id, principal));
    }
}
