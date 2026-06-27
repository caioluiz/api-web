package br.edu.ufrrj.si.authservice.service;

import br.edu.ufrrj.si.authservice.dto.AtualizarUsuarioRequest;
import br.edu.ufrrj.si.authservice.dto.CadastroUsuarioRequest;
import br.edu.ufrrj.si.authservice.dto.UsuarioResponse;
import br.edu.ufrrj.si.authservice.exception.AcessoNegadoException;
import br.edu.ufrrj.si.authservice.exception.RecursoNaoEncontradoException;
import br.edu.ufrrj.si.authservice.exception.RegraNegocioException;
import br.edu.ufrrj.si.authservice.model.Perfil;
import br.edu.ufrrj.si.authservice.model.StatusUsuario;
import br.edu.ufrrj.si.authservice.model.Usuario;
import br.edu.ufrrj.si.authservice.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UsuarioService {

    private final UsuarioRepository repository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository repository, PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
    }

    /** Cadastro de conta (item "CRUD de Usuarios" do Modulo A). Rota publica, sem token. */
    public UsuarioResponse cadastrar(CadastroUsuarioRequest requisicao) {
        if (repository.existsByEmail(requisicao.email())) {
            throw new RegraNegocioException("Ja existe um usuario cadastrado com este e-mail.");
        }

        Usuario usuario = new Usuario();
        usuario.setNome(requisicao.nome());
        usuario.setEmail(requisicao.email());
        usuario.setSenha(passwordEncoder.encode(requisicao.senha()));
        usuario.setPerfil(requisicao.perfil());
        usuario.setStatus(StatusUsuario.ATIVO);

        return paraResponse(repository.save(usuario));
    }

    public UsuarioResponse buscarPorId(Long id) {
        return paraResponse(buscarEntidadePorId(id));
    }

    public Usuario buscarEntidadePorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuario nao encontrado: id " + id));
    }

    /** Listagem completa: restrita a membros da comissao (verificado no controller). */
    public List<UsuarioResponse> listarTodos() {
        return repository.findAll().stream().map(this::paraResponse).toList();
    }

    /**
     * Atualizacao parcial. Regra de robustez exigida no enunciado:
     * um ALUNO so pode alterar o proprio cadastro; a COMISSAO pode
     * alterar qualquer cadastro.
     */
    public UsuarioResponse atualizar(Long id, AtualizarUsuarioRequest requisicao, SessaoToken sessao) {
        Usuario usuario = buscarEntidadePorId(id);
        verificarPermissaoSobreRecurso(id, sessao);

        if (requisicao.nome() != null && !requisicao.nome().isBlank()) {
            usuario.setNome(requisicao.nome());
        }

        if (requisicao.email() != null && !requisicao.email().isBlank()
                && !requisicao.email().equalsIgnoreCase(usuario.getEmail())) {
            if (repository.existsByEmail(requisicao.email())) {
                throw new RegraNegocioException("Ja existe um usuario cadastrado com este e-mail.");
            }
            usuario.setEmail(requisicao.email());
        }

        if (requisicao.senha() != null && !requisicao.senha().isBlank()) {
            usuario.setSenha(passwordEncoder.encode(requisicao.senha()));
        }

        return paraResponse(repository.save(usuario));
    }

    /**
     * Exclusao logica (Regra de Exclusao Logica do Modulo A): o registro
     * nunca e removido da base, apenas migra para o estado DESATIVADO.
     * Somente o proprio usuario pode solicitar a desativacao da sua conta.
     */
    public UsuarioResponse desativar(Long id, SessaoToken sessao) {
        Usuario usuario = buscarEntidadePorId(id);

        if (!sessao.usuarioId().equals(id)) {
            throw new AcessoNegadoException("Um usuario so pode solicitar a desativacao da propria conta.");
        }

        usuario.setStatus(StatusUsuario.DESATIVADO);
        return paraResponse(repository.save(usuario));
    }

    private void verificarPermissaoSobreRecurso(Long idAlvo, SessaoToken sessao) {
        boolean ehComissao = sessao.perfil() == Perfil.COMISSAO;
        boolean ehProprioRecurso = sessao.usuarioId().equals(idAlvo);
        if (!ehComissao && !ehProprioRecurso) {
            throw new AcessoNegadoException("Voce nao tem permissao para alterar dados de outro usuario.");
        }
    }

    private UsuarioResponse paraResponse(Usuario u) {
        return new UsuarioResponse(
                u.getId(), u.getNome(), u.getEmail(), u.getPerfil(),
                u.getStatus(), u.getDataCriacao(), u.getDataAtualizacao()
        );
    }
}
