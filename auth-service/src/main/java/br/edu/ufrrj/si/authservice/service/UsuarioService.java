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
import br.edu.ufrrj.si.authservice.security.UsuarioPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class UsuarioService {

    private static final Set<String> NIVEIS_ALUNO = Set.of(
            "Graduacao", "Graduação", "Pos-graduacao", "Pós-graduação", "Mestrado", "Doutorado"
    );
    private static final Set<String> TIPOS_FUNCIONARIO = Set.of(
            "Docente", "Tecnico-Administrativo", "Técnico-Administrativo"
    );

    private final UsuarioRepository repository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository repository, PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public UsuarioResponse cadastrar(CadastroUsuarioRequest requisicao) {
        String cpf = normalizarCpf(requisicao.cpf());
        String email = normalizarEmail(requisicao.email());
        validarUnicidade(cpf, email, null);
        Map<String, Object> detalhes = validarDetalhesPerfil(requisicao.perfil(), requisicao.detalhesPerfil());

        Usuario usuario = new Usuario();
        usuario.setNome(requisicao.nome().trim());
        usuario.setCpf(cpf);
        usuario.setCelular(normalizarCelular(requisicao.celular()));
        usuario.setDataNascimento(requisicao.dataNascimento());
        usuario.setDetalhesPerfil(detalhes);
        usuario.setEmail(email);
        usuario.setSenha(passwordEncoder.encode(requisicao.senha()));
        usuario.setPerfil(requisicao.perfil());
        usuario.setStatus(StatusUsuario.ATIVO);

        return paraResponse(repository.save(usuario));
    }

    @Transactional(readOnly = true)
    public UsuarioResponse buscarPorId(Long id, UsuarioPrincipal principal) {
        verificarPodeConsultar(id, principal);
        return paraResponse(buscarEntidadePorId(id));
    }

    @Transactional(readOnly = true)
    public Usuario buscarEntidadePorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuario nao encontrado: id " + id));
    }

    @Transactional(readOnly = true)
    public List<UsuarioResponse> listarTodos(UsuarioPrincipal principal) {
        exigirFuncionario(principal, "Apenas funcionarios podem listar todos os usuarios.");
        return repository.findAll().stream().map(this::paraResponse).toList();
    }

    @Transactional
    public UsuarioResponse atualizar(Long id, AtualizarUsuarioRequest requisicao, UsuarioPrincipal principal) {
        verificarPodeAlterar(id, principal);
        Usuario usuario = buscarEntidadePorId(id);

        if (temTexto(requisicao.nome())) {
            usuario.setNome(requisicao.nome().trim());
        }

        if (temTexto(requisicao.cpf())) {
            String cpf = normalizarCpf(requisicao.cpf());
            validarUnicidade(cpf, usuario.getEmail(), id);
            usuario.setCpf(cpf);
        }

        if (temTexto(requisicao.celular())) {
            usuario.setCelular(normalizarCelular(requisicao.celular()));
        }

        if (requisicao.dataNascimento() != null) {
            usuario.setDataNascimento(requisicao.dataNascimento());
        }

        if (requisicao.detalhesPerfil() != null) {
            usuario.setDetalhesPerfil(validarDetalhesPerfil(usuario.getPerfil(), requisicao.detalhesPerfil()));
        }

        if (temTexto(requisicao.email())) {
            String email = normalizarEmail(requisicao.email());
            validarUnicidade(usuario.getCpf(), email, id);
            usuario.setEmail(email);
        }

        if (temTexto(requisicao.senha())) {
            usuario.setSenha(passwordEncoder.encode(requisicao.senha()));
        }

        return paraResponse(repository.save(usuario));
    }

    @Transactional
    public UsuarioResponse desativar(Long id, UsuarioPrincipal principal) {
        verificarPodeDesativar(id, principal);
        Usuario usuario = buscarEntidadePorId(id);
        usuario.setStatus(StatusUsuario.DESATIVADO);
        return paraResponse(repository.save(usuario));
    }

    private void validarUnicidade(String cpf, String email, Long idIgnorado) {
        repository.findByCpf(cpf)
                .filter(usuario -> !usuario.getId().equals(idIgnorado))
                .ifPresent(usuario -> {
                    throw new RegraNegocioException("Ja existe um usuario cadastrado com este CPF.");
                });

        repository.findByEmail(email)
                .filter(usuario -> !usuario.getId().equals(idIgnorado))
                .ifPresent(usuario -> {
                    throw new RegraNegocioException("Ja existe um usuario cadastrado com este e-mail.");
                });
    }

    private Map<String, Object> validarDetalhesPerfil(Perfil perfil, Map<String, Object> detalhes) {
        if (detalhes == null || detalhes.isEmpty()) {
            throw new RegraNegocioException("detalhesPerfil e obrigatorio.");
        }

        Map<String, Object> copia = new LinkedHashMap<>(detalhes);
        if (perfil == Perfil.ALUNO) {
            exigirTexto(copia, "matricula");
            exigirTexto(copia, "curso");
            String nivel = exigirTexto(copia, "nivel");
            exigirTexto(copia, "periodoIngresso");
            if (!NIVEIS_ALUNO.contains(nivel)) {
                throw new RegraNegocioException("detalhesPerfil.nivel deve ser Graduacao, Pos-graduacao, Mestrado ou Doutorado.");
            }
            return copia;
        }

        if (perfil == Perfil.FUNCIONARIO) {
            exigirTexto(copia, "siape");
            String tipo = exigirTexto(copia, "tipo");
            exigirTexto(copia, "departamento");
            exigirTexto(copia, "instituto");
            Object membroComissao = copia.get("membroComissao");
            if (!(membroComissao instanceof Boolean)) {
                throw new RegraNegocioException("detalhesPerfil.membroComissao deve ser booleano.");
            }
            if (!TIPOS_FUNCIONARIO.contains(tipo)) {
                throw new RegraNegocioException("detalhesPerfil.tipo deve ser Docente ou Tecnico-Administrativo.");
            }
            return copia;
        }

        throw new RegraNegocioException("Perfil invalido.");
    }

    private String exigirTexto(Map<String, Object> detalhes, String campo) {
        Object valor = detalhes.get(campo);
        if (!(valor instanceof String texto) || texto.isBlank()) {
            throw new RegraNegocioException("detalhesPerfil." + campo + " e obrigatorio.");
        }
        return texto.trim();
    }

    private void verificarPodeConsultar(Long id, UsuarioPrincipal principal) {
        if (principal.perfil() == Perfil.FUNCIONARIO || principal.id().equals(id)) {
            return;
        }
        throw new AcessoNegadoException("Alunos so podem consultar os proprios dados.");
    }

    private void verificarPodeAlterar(Long id, UsuarioPrincipal principal) {
        if (principal.perfil() == Perfil.FUNCIONARIO || principal.id().equals(id)) {
            return;
        }
        throw new AcessoNegadoException("Voce nao tem permissao para alterar dados de outro usuario.");
    }

    private void verificarPodeDesativar(Long id, UsuarioPrincipal principal) {
        if (principal.perfil() == Perfil.FUNCIONARIO || principal.id().equals(id)) {
            return;
        }
        throw new AcessoNegadoException("Voce nao tem permissao para desativar outro usuario.");
    }

    private void exigirFuncionario(UsuarioPrincipal principal, String mensagem) {
        if (principal.perfil() != Perfil.FUNCIONARIO) {
            throw new AcessoNegadoException(mensagem);
        }
    }

    private String normalizarCpf(String cpf) {
        String apenasDigitos = cpf == null ? "" : cpf.replaceAll("\\D", "");
        if (apenasDigitos.length() != 11) {
            throw new RegraNegocioException("CPF deve conter 11 digitos.");
        }
        return apenasDigitos;
    }

    private String normalizarCelular(String celular) {
        String apenasDigitos = celular == null ? "" : celular.replaceAll("\\D", "");
        if (apenasDigitos.isBlank()) {
            throw new RegraNegocioException("Celular e obrigatorio.");
        }
        if (apenasDigitos.length() > 20) {
            throw new RegraNegocioException("Celular deve ter no maximo 20 digitos.");
        }
        return apenasDigitos;
    }

    private String normalizarEmail(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }

    private boolean temTexto(String valor) {
        return valor != null && !valor.isBlank();
    }

    private UsuarioResponse paraResponse(Usuario u) {
        return new UsuarioResponse(
                u.getId(),
                u.getNome(),
                u.getCpf(),
                u.getCelular(),
                u.getDataNascimento(),
                u.getDetalhesPerfil(),
                u.getEmail(),
                u.getPerfil(),
                u.getStatus(),
                u.getDataCriacao(),
                u.getDataAtualizacao()
        );
    }
}
