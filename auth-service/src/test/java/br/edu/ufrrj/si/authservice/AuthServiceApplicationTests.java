package br.edu.ufrrj.si.authservice;

import br.edu.ufrrj.si.authservice.model.Perfil;
import br.edu.ufrrj.si.authservice.model.StatusUsuario;
import br.edu.ufrrj.si.authservice.model.Usuario;
import br.edu.ufrrj.si.authservice.repository.UsuarioRepository;
import br.edu.ufrrj.si.authservice.security.JwtService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.Map;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthServiceApplicationTests {

    private static final String TEST_SECRET = "test-secret-change-me-with-at-least-32-chars";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void limparBanco() {
        usuarioRepository.deleteAll();
    }

    @Test
    void cadastraAluno() throws Exception {
        mockMvc.perform(post("/api/usuarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(aluno("Joao", "123.456.789-00", "joao@email.com"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.perfil").value("ALUNO"))
                .andExpect(jsonPath("$.cpf").value("12345678900"))
                .andExpect(jsonPath("$.senha").doesNotExist());
    }

    @Test
    void cadastraFuncionario() throws Exception {
        mockMvc.perform(post("/api/usuarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(funcionario("Maria", "987.654.321-00", "maria@email.com"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.perfil").value("FUNCIONARIO"))
                .andExpect(jsonPath("$.detalhesPerfil.siape").value("3691232"));
    }

    @Test
    void rejeitaCpfDuplicado() throws Exception {
        cadastrarAluno("Joao", "12345678900", "joao@email.com");

        mockMvc.perform(post("/api/usuarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(aluno("Outro", "12345678900", "outro@email.com"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensagem").value("Ja existe um usuario cadastrado com este CPF."));
    }

    @Test
    void rejeitaEmailDuplicado() throws Exception {
        cadastrarAluno("Joao", "12345678900", "joao@email.com");

        mockMvc.perform(post("/api/usuarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(aluno("Outro", "98765432100", "JOAO@email.com"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensagem").value("Ja existe um usuario cadastrado com este e-mail."));
    }

    @Test
    void rejeitaDetalhesPerfilInvalidos() throws Exception {
        Map<String, Object> payload = aluno("Joao", "12345678900", "joao@email.com");
        payload.put("detalhesPerfil", Map.of("curso", "Sistemas de Informacao"));

        mockMvc.perform(post("/api/usuarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(payload)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensagem").value("detalhesPerfil.matricula e obrigatorio."));
    }

    @Test
    void loginComSucessoEValidaToken() throws Exception {
        cadastrarAluno("Joao", "12345678900", "joao@email.com");
        String token = login("joao@email.com", "senha123");

        mockMvc.perform(post("/api/auth/validar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("token", token))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valido").value(true))
                .andExpect(jsonPath("$.email").value("joao@email.com"))
                .andExpect(jsonPath("$.perfil").value("ALUNO"))
                .andExpect(jsonPath("$.status").value("ATIVO"));
    }

    @Test
    void loginComSenhaInvalida() throws Exception {
        cadastrarAluno("Joao", "12345678900", "joao@email.com");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("email", "joao@email.com", "senha", "errada"))))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void validaTokenExpirado() throws Exception {
        Usuario usuario = salvarUsuarioDireto("Joao", "12345678900", "joao@email.com", Perfil.ALUNO);
        String tokenExpirado = new JwtService(TEST_SECRET, -1).gerarToken(usuario);

        mockMvc.perform(post("/api/auth/validar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("token", tokenExpirado))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valido").value(false))
                .andExpect(jsonPath("$.motivo").value("TOKEN_EXPIRADO"));
    }

    @Test
    void usuarioDesativadoNaoAutentica() throws Exception {
        Usuario usuario = salvarUsuarioDireto("Joao", "12345678900", "joao@email.com", Perfil.ALUNO);
        usuario.setStatus(StatusUsuario.DESATIVADO);
        usuarioRepository.save(usuario);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("email", "joao@email.com", "senha", "senha123"))))
                .andExpect(status().isForbidden());
    }

    @Test
    void alunoNaoAcessaDadosDeOutroUsuario() throws Exception {
        Long alunoId = cadastrarAluno("Joao", "12345678900", "joao@email.com");
        Long outroId = cadastrarAluno("Ana", "98765432100", "ana@email.com");
        String tokenAluno = login("joao@email.com", "senha123");

        mockMvc.perform(get("/api/usuarios/{id}", outroId)
                        .header("Authorization", "Bearer " + tokenAluno))
                .andExpect(status().isForbidden());

        mockMvc.perform(patch("/api/usuarios/{id}", outroId)
                        .header("Authorization", "Bearer " + tokenAluno)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("nome", "Invasao"))))
                .andExpect(status().isForbidden());

        mockMvc.perform(delete("/api/usuarios/{id}", outroId)
                        .header("Authorization", "Bearer " + tokenAluno))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/usuarios/{id}", alunoId)
                        .header("Authorization", "Bearer " + tokenAluno))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("joao@email.com"));
    }

    @Test
    void funcionarioListaAtualizaEDesativaUsuarios() throws Exception {
        Long alunoId = cadastrarAluno("Joao", "12345678900", "joao@email.com");
        cadastrarFuncionario("Maria", "98765432100", "maria@email.com");
        String tokenFuncionario = login("maria@email.com", "senha123");

        mockMvc.perform(get("/api/usuarios")
                        .header("Authorization", "Bearer " + tokenFuncionario))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)));

        mockMvc.perform(patch("/api/usuarios/{id}", alunoId)
                        .header("Authorization", "Bearer " + tokenFuncionario)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("nome", "Joao Atualizado"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Joao Atualizado"));

        mockMvc.perform(delete("/api/usuarios/{id}", alunoId)
                        .header("Authorization", "Bearer " + tokenFuncionario))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("DESATIVADO"));
    }

    @Test
    void alunoNaoListaUsuarios() throws Exception {
        cadastrarAluno("Joao", "12345678900", "joao@email.com");
        String tokenAluno = login("joao@email.com", "senha123");

        mockMvc.perform(get("/api/usuarios")
                        .header("Authorization", "Bearer " + tokenAluno))
                .andExpect(status().isForbidden());
    }

    private Long cadastrarAluno(String nome, String cpf, String email) throws Exception {
        return cadastrar(aluno(nome, cpf, email));
    }

    private Long cadastrarFuncionario(String nome, String cpf, String email) throws Exception {
        return cadastrar(funcionario(nome, cpf, email));
    }

    private Long cadastrar(Map<String, Object> payload) throws Exception {
        String resposta = mockMvc.perform(post("/api/usuarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(payload)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        return objectMapper.readTree(resposta).get("id").asLong();
    }

    private String login(String email, String senha) throws Exception {
        String resposta = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("email", email, "senha", senha))))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        JsonNode json = objectMapper.readTree(resposta);
        return json.get("accessToken").asText();
    }

    private Usuario salvarUsuarioDireto(String nome, String cpf, String email, Perfil perfil) {
        Usuario usuario = new Usuario();
        usuario.setNome(nome);
        usuario.setCpf(cpf);
        usuario.setCelular("21999998888");
        usuario.setDataNascimento(LocalDate.of(2000, 1, 1));
        usuario.setDetalhesPerfil(perfil == Perfil.ALUNO ? detalhesAluno() : detalhesFuncionario());
        usuario.setEmail(email);
        usuario.setSenha(passwordEncoder.encode("senha123"));
        usuario.setPerfil(perfil);
        usuario.setStatus(StatusUsuario.ATIVO);
        return usuarioRepository.save(usuario);
    }

    private Map<String, Object> aluno(String nome, String cpf, String email) {
        Map<String, Object> payload = base(nome, cpf, email, Perfil.ALUNO);
        payload.put("detalhesPerfil", detalhesAluno());
        return payload;
    }

    private Map<String, Object> funcionario(String nome, String cpf, String email) {
        Map<String, Object> payload = base(nome, cpf, email, Perfil.FUNCIONARIO);
        payload.put("detalhesPerfil", detalhesFuncionario());
        return payload;
    }

    private Map<String, Object> base(String nome, String cpf, String email, Perfil perfil) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("nome", nome);
        payload.put("cpf", cpf);
        payload.put("celular", "(21) 99999-8888");
        payload.put("dataNascimento", "2000-01-01");
        payload.put("email", email);
        payload.put("senha", "senha123");
        payload.put("perfil", perfil.name());
        return payload;
    }

    private Map<String, Object> detalhesAluno() {
        Map<String, Object> detalhes = new LinkedHashMap<>();
        detalhes.put("matricula", "20260010123");
        detalhes.put("curso", "Sistemas de Informacao");
        detalhes.put("nivel", "Graduacao");
        detalhes.put("periodoIngresso", "2026.1");
        return detalhes;
    }

    private Map<String, Object> detalhesFuncionario() {
        Map<String, Object> detalhes = new LinkedHashMap<>();
        detalhes.put("siape", "3691232");
        detalhes.put("tipo", "Docente");
        detalhes.put("departamento", "Departamento de Computacao");
        detalhes.put("instituto", "ICE");
        detalhes.put("membroComissao", true);
        return detalhes;
    }

    private String json(Object objeto) throws Exception {
        return objectMapper.writeValueAsString(objeto);
    }
}
