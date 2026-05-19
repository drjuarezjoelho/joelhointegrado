# Dicionário de dados (v1.0 — esboço)

`protocol_version` atual: **1.0** (congelar após aprovação CEP).

## Identificação (`participants`)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `study_code` | string | Pseudônimo único (`LZ-001`) |
| `codigo` | string | Rótulo interno (“Caso 5”) |
| `iniciais` | string | Iniciais (LGPD) |
| `date_of_birth` | date | DN — exportar idade calculada, não DN, no CSV público |
| `cidade`, `uf` | string | |
| `convenio` | string | |
| `articulacao_indice` | string | Articulação-índice |
| `study_status` | enum | Triagem, T0, T3… |
| `inclusion_date` | date | |

## Payload por visita (`visits.payload_json`)

JSON validado por `visit-payload.ts`. Chaves alinhadas ao protótipo atual:

- **T0**: `comorbidades`, `medicacoes`, …, `hsCRP`, `vitD`, `trhDefinida`, etc.
- **T3/T6/T12**: definir subconjunto (ex.: `peso`, `vas`, labs selecionados, `eventosAdversos`).

Unidades documentadas no manual do investigador (hs-CRP mg/dL, vit D ng/mL, E2 pg/mL ou conversão).

## Exportação

| Arquivo | Conteúdo |
|---------|----------|
| `export_participants_wide.csv` | 1 linha/participante |
| `export_visits_long.csv` | 1 linha/participante/visita |
| `data_dictionary.csv` | metadados das colunas |

Colunas **nunca** exportadas: `date_of_birth` bruto (usar `idade_anos`), e-mail, IP.

## Semáforo Linha Zero

Calculado na UI/API para apoio clínico. Para o artigo, usar variáveis contínuas/categorizadas conforme plano estatístico (SAP), não o contador “X/Y alvos”.
