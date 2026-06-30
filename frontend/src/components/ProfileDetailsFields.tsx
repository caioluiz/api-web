import type { DetalhesPerfil, Perfil } from "../types";

interface ProfileDetailsFieldsProps {
  perfil: Perfil;
  details: DetalhesPerfil;
  onChange: (details: DetalhesPerfil) => void;
}

export function ProfileDetailsFields({
  perfil,
  details,
  onChange
}: ProfileDetailsFieldsProps) {
  function updateField(key: string, value: string | boolean) {
    onChange({
      ...details,
      [key]: value
    });
  }

  if (perfil === "FUNCIONARIO") {
    return (
      <fieldset className="form-section">
        <legend>Detalhes do perfil Funcionário</legend>
        <div className="form-grid two-columns">
          <label>
            SIAPE
            <input
              value={String(details.siape || "")}
              onChange={(event) => updateField("siape", event.target.value)}
              placeholder="1234567"
              required
            />
          </label>

          <label>
            Tipo
            <select
              value={String(details.tipo || "Docente")}
              onChange={(event) => updateField("tipo", event.target.value)}
            >
              <option value="Docente">Docente</option>
              <option value="Tecnico-Administrativo">Técnico-Administrativo</option>
            </select>
          </label>

          <label>
            Departamento
            <input
              value={String(details.departamento || "")}
              onChange={(event) => updateField("departamento", event.target.value)}
              placeholder="Departamento de Computação"
              required
            />
          </label>

          <label>
            Instituto
            <input
              value={String(details.instituto || "")}
              onChange={(event) => updateField("instituto", event.target.value)}
              placeholder="ICE"
              required
            />
          </label>
        </div>

        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={Boolean(details.membroComissao)}
            onChange={(event) =>
              updateField("membroComissao", event.target.checked)
            }
          />
          Membro da comissão/coordenação
        </label>
      </fieldset>
    );
  }

  return (
    <fieldset className="form-section">
      <legend>Detalhes do perfil ALUNO</legend>
      <div className="form-grid two-columns">
        <label>
          Matrícula
          <input
            value={String(details.matricula || "")}
            onChange={(event) => updateField("matricula", event.target.value)}
            placeholder="2026000000"
            required
          />
        </label>

        <label>
          Curso
          <input
            value={String(details.curso || "")}
            onChange={(event) => updateField("curso", event.target.value)}
            placeholder="Sistemas de Informação"
            required
          />
        </label>

        <label>
          Nível
          <select
            value={String(details.nivel || "Graduacao")}
            onChange={(event) => updateField("nivel", event.target.value)}
          >
            <option value="Graduacao">Graduação</option>
            <option value="Mestrado">Mestrado</option>
            <option value="Doutorado">Doutorado</option>
          </select>
        </label>

        <label>
          Período de ingresso
          <input
            value={String(details.periodoIngresso || "")}
            onChange={(event) => updateField("periodoIngresso", event.target.value)}
            placeholder="2026.1"
            required
          />
        </label>
      </div>
    </fieldset>
  );
}
