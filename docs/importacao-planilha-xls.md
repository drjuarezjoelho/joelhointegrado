# Importação de planilha XLS/XLSX (cirurgias marcadas)

É possível importar em lote os dados dos pacientes e das cirurgias marcadas desde o início do ano usando uma planilha **Excel (.xls ou .xlsx)**.

## Como usar

1. Monte uma planilha com **uma linha de cabeçalho** na primeira linha e os dados a partir da segunda.
2. Salve como **.xlsx** ou **.xls**.
3. No terminal, na pasta do projeto:

```bash
# Instalar dependências (se ainda não instalou)
npm install

# Importar (informe o caminho da planilha)
npm run db:import-xls -- caminho/para/cirurgias.xlsx
```

Ou use a variável de ambiente:

```bash
XLS_PATH=./minha_planilha.xlsx npm run db:import-xls
```

Se não informar arquivo, o script procura por `scripts/cirurgias.xlsx`.

## Colunas reconhecidas

A primeira linha deve conter os títulos. O script reconhece as colunas abaixo (e variações em português/inglês):

| Dado            | Colunas aceitas (exemplos)                          |
|-----------------|-----------------------------------------------------|
| **Nome**        | Nome, Paciente, Name                                |
| **Idade**       | Idade, Age                                          |
| **Sexo**        | Sexo, Gênero, Gender (valores: M/F ou Masculino/Feminino) |
| **Email**       | Email, E-mail                                       |
| **Telefone**    | Telefone, Phone, Celular, Fone                      |
| **Data cirurgia** | Data da Cirurgia, Data Cirurgia, Cirurgia, Data   |
| **Tipo cirurgia** | Tipo de Cirurgia, Tipo Cirurgia, Tipo, Procedimento |
| **Observações** | Observações, Notes, Obs                             |

Apenas **Nome** é obrigatório. As demais são opcionais.

## Formato da data

- **Excel:** se a célula estiver no formato de data do Excel, o script converte automaticamente.
- **Texto:** aceita formatos como `DD/MM/AAAA`, `AAAA-MM-DD` ou texto que o JavaScript consiga interpretar como data.

## Exemplo de planilha

| Nome           | Idade | Sexo | Telefone      | Data da Cirurgia | Tipo de Cirurgia        |
|----------------|-------|------|---------------|------------------|--------------------------|
| Maria Silva    | 52    | F    | (11) 99999-1111 | 15/01/2026     | Artroplastia Total       |
| João Santos    | 48    | M    | (11) 98888-2222 | 22/01/2026     | Artroscopia              |

## Filtro por período (desde o início do ano)

O script importa **todas as linhas** da primeira aba da planilha. Para importar só cirurgias desde o início do ano:

1. **Opção A:** na própria planilha, filtre ou apague as linhas fora do período e salve um arquivo só com o que deseja importar.
2. **Opção B:** mantenha uma planilha “mestre” com tudo e use coluna “Data da Cirurgia” já preenchida; depois, no sistema, você pode filtrar/visualizar por período.

## Observações

- Cada linha com **Nome** preenchido vira um registro em **Pacientes** no banco.
- Os pacientes importados ficam associados ao usuário definido em `IMPORT_USER_ID` (padrão: 1).
- Duplicatas (mesmo nome/data) não são evitadas automaticamente; se precisar, deduplique na planilha antes de importar.
- O banco usado é o mesmo do projeto (SQLite em `data/`). Rode `npm run db:push` antes se ainda não tiver criado as tabelas.
