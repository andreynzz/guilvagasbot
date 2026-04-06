# GuilVagasBot

Bot de Discord em Node.js que busca vagas em um feed RSS periodicamente, publica no canal configurado e menciona uma pessoa específica em cada mensagem.

## Requisitos

- Node.js 18+
- Um bot do Discord com permissão para enviar mensagens no canal desejado
- Um feed RSS de vagas

## Configuração

1. Instale as dependências:

```bash
npm install
```

2. Copie o arquivo de exemplo:

```bash
cp config.json.example config.json
```

3. Preencha os campos no `config.json`:

- `discordToken`: token do bot
- `channelId`: ID do canal onde as vagas serão postadas
- `userId`: ID da pessoa que será mencionada com `@`
- `jobsFeedUrl`: URL do feed RSS de vagas
- `postIntervalMinutes`: intervalo entre verificações
- `maxJobsPerRun`: quantidade máxima de vagas enviadas por ciclo

## Execução

```bash
npm start
```

## Como funciona

- O bot lê o feed RSS configurado
- Compara as vagas com o histórico salvo em `data/seen-jobs.json`
- Envia apenas vagas novas
- Marca a pessoa configurada com `<@userId>`
- Repete o processo no intervalo definido

## Observações

- Na primeira execução, o arquivo `data/seen-jobs.json` é criado automaticamente
- Se quiser trocar a fonte das vagas, basta apontar `JOBS_FEED_URL` para outro feed RSS compatível
