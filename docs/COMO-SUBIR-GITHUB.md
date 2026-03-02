# Como salvar o projeto completo e subir para o GitHub

## 1. Instalar o Git (se ainda não tiver)

- Baixe em: **https://git-scm.com/download/win**
- Instale e, se perguntar, marque a opção para usar Git no **Prompt de Comando** (ou PowerShell).
- Feche e abra de novo o terminal.

Para conferir:
```bash
git --version
```

## 2. Configurar nome e e-mail (só na primeira vez)

```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu-email@exemplo.com"
```
Use o **mesmo e-mail** da sua conta do GitHub.

---

## 3. Dentro da pasta do projeto

Abra o terminal (PowerShell ou CMD) e vá até a pasta do projeto:

```bash
cd C:\Users\JUAREZ\cadastro-ci
```

## 4. Inicializar o repositório e fazer o primeiro commit

```bash
git init
git add .
git status
git commit -m "Projeto inicial - C.I.J. Cadastro"
```

O arquivo **`.gitignore`** já está configurado para **não** subir:
- `node_modules/`
- pasta `data/` (banco SQLite)
- arquivos `.env` (senhas e chaves)

## 5. Criar o repositório no GitHub

1. Acesse **https://github.com** e faça login.
2. Clique em **“+”** → **“New repository”**.
3. **Repository name:** por exemplo `cadastro-ci`.
4. Deixe **Public** e **não** marque “Add a README” (o projeto já tem arquivos).
5. Clique em **“Create repository”**.

## 6. Conectar o projeto ao GitHub e enviar

No terminal, na pasta do projeto. Repositório: **https://github.com/drjuarezjoelho/joelhointegrado**

```bash
git remote add origin https://github.com/drjuarezjoelho/joelhointegrado.git
git branch -M main
git push -u origin main
```

O GitHub pode pedir **login** (usuário/senha ou token). Se usar autenticação em dois fatores, crie um **Personal Access Token** em:  
GitHub → Settings → Developer settings → Personal access tokens → Generate new token, e use o token no lugar da senha.

---

## Depois disso: como “salvar” e “subir” de novo

Sempre que fizer alterações e quiser guardar no GitHub:

```bash
cd C:\Users\JUAREZ\cadastro-ci
git add .
git status
git commit -m "Descrição do que você mudou"
git push
```

---

## Resumo rápido

| Etapa              | Comando |
|--------------------|--------|
| Entrar na pasta   | `cd C:\Users\JUAREZ\cadastro-ci` |
| Iniciar Git       | `git init` |
| Adicionar tudo    | `git add .` |
| Primeiro commit   | `git commit -m "Projeto inicial"` |
| Conectar GitHub   | `git remote add origin https://github.com/drjuarezjoelho/joelhointegrado.git` |
| Enviar            | `git push -u origin main` |

Se aparecer algum erro (por exemplo “git não é reconhecido”), instale o Git (passo 1) e abra um novo terminal.
