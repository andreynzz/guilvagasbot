# GuilVagasBot

Bot de Discord em Node.js que busca vagas no Vagas.com.br periodicamente, publica no canal configurado e menciona uma pessoa específica em cada mensagem.

## Requisitos

- Node.js 18+
- Um bot do Discord com permissão para enviar mensagens no canal desejado
- Acesso ao Vagas.com.br

## Configuração

1. Instale as dependências:

```bash
npm install
```

2. Copie o arquivo de exemplo:

```bash
cp .env.example .env
```

3. Preencha os campos no `.env`:

- `DISCORD_TOKEN`: token do bot
- `GUILD_ID`: ID do servidor para registrar os slash commands rapidamente no ambiente de teste. Opcional
- `CHANNEL_ID`: ID do canal onde as vagas serão postadas
- `USER_ID`: ID da pessoa que será mencionada com `@`
- `VAGAS_SEARCH_TERMS`: lista separada por virgulas, como `facas,supermercado`
- `RELATED_KEYWORDS`: palavras-chave separadas por virgulas para deixar passar apenas vagas relacionadas ao tema desejado
- `MAX_JOBS_PER_RUN`: quantidade máxima de vagas enviadas por ciclo

## Execução

```bash
npm start
```

## Deploy no Render

Este projeto ja inclui um [render.yaml](/home/andrey/projects/guilvagasbot/render.yaml) para subir como Background Worker no Render.

1. Suba este repositorio para GitHub ou GitLab.
2. No Render, crie o servico a partir do Blueprint do repositorio.
3. Nao use Web Service para este projeto. Ele deve rodar como Background Worker.
4. O Render vai criar um Background Worker usando:
   - `buildCommand`: `pnpm install --frozen-lockfile`
   - `startCommand`: `pnpm start`
5. Preencha as variaveis secretas no Render:
   - `DISCORD_TOKEN`
   - `GUILD_ID` opcional
   - `CHANNEL_ID`
   - `USER_ID`
6. Se quiser, ajuste tambem:
   - `VAGAS_SEARCH_TERMS`
   - `RELATED_KEYWORDS`
   - `MAX_JOBS_PER_RUN`

## Comandos

- `/help`: shows the available commands
- `/postjobs`: fetches new jobs and posts them in the current channel
- `/requestjobs user:@pessoa`: admin only, fetches new jobs and posts them mentioning the selected person
- `/clearhistory`: admin only, clears the history of already sent jobs

## Como funciona

- O bot monta URLs de busca do Vagas com base em `vagasSearchTerms`
- Busca as páginas de resultados do Vagas.com.br
- Filtra as vagas para deixar passar apenas as relacionadas a `relatedKeywords`
- Compara as vagas com o histórico salvo em `data/seen-jobs.json`
- Envia apenas vagas novas
- Envia uma mensagem com `@everyone` e menciona a pessoa configurada com `<@userId>`
- Tenta anexar uma imagem de preview de cada vaga usando `og:image` da propria pagina
- Carrega e registra slash commands automaticamente da pasta `src/commands`
- Usa nomes e descricoes em ingles por padrao, com localizacao por regiao
- Agenda os envios diariamente para 10:00 e 20:00 no horario local da maquina
- Quando nao encontra vagas novas, responde com uma mensagem informando que vai tentar novamente depois

## Observações

- Na primeira execução, o arquivo `data/seen-jobs.json` é criado automaticamente
- Para este caso, o exemplo ja vem preparado para buscar vagas relacionadas a facas ou supermercado
- Como agora os comandos sao slash commands, o bot nao precisa da Message Content Intent
- As respostas dos comandos tambem respeitam o locale enviado pelo Discord quando houver traducao disponivel
- O comando `/requestjobs` so pode ser usado por membros com permissao de administrador
- O comando `/clearhistory` limpa o arquivo `data/seen-jobs.json`, permitindo reenviar vagas ja vistas
- Se `guildId` estiver configurado, os comandos sao registrados apenas nesse servidor e costumam aparecer quase imediatamente
- Se `guildId` nao estiver configurado, o registro continua global e pode levar mais tempo para propagar
- Em plataformas como o Render, o arquivo `data/seen-jobs.json` fica no disco local do servico. Em um novo deploy ou recriacao da instancia, esse historico pode ser perdido
- O Render pode tentar usar Node muito novo se o `package.json` estiver solto. Este projeto trava em `20.x` para usar uma versao LTS
