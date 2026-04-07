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
cp config.json.example config.json
```

3. Preencha os campos no `config.json`:

- `discordToken`: token do bot
- `guildId`: ID do servidor para registrar os slash commands rapidamente no ambiente de teste. Opcional
- `channelId`: ID do canal onde as vagas serão postadas
- `userId`: ID da pessoa que será mencionada com `@`
- `vagasSearchTerms`: lista de termos usados na busca do Vagas, como `["facas", "supermercado"]`
- `relatedKeywords`: palavras-chave para deixar passar apenas vagas relacionadas ao tema desejado
- `postIntervalMinutes`: intervalo entre verificações
- `maxJobsPerRun`: quantidade máxima de vagas enviadas por ciclo

## Execução

```bash
npm start
```

## Comandos

- `/help`: shows the available commands
- `/postjobs`: fetches new jobs and posts them in the current channel

## Como funciona

- O bot monta URLs de busca do Vagas com base em `vagasSearchTerms`
- Busca as páginas de resultados do Vagas.com.br
- Filtra as vagas para deixar passar apenas as relacionadas a `relatedKeywords`
- Compara as vagas com o histórico salvo em `data/seen-jobs.json`
- Envia apenas vagas novas
- Marca a pessoa configurada com `<@userId>`
- Carrega e registra slash commands automaticamente da pasta `src/commands`
- Usa nomes e descricoes em ingles por padrao, com localizacao por regiao
- Repete o processo no intervalo definido

## Observações

- Na primeira execução, o arquivo `data/seen-jobs.json` é criado automaticamente
- Para este caso, o exemplo ja vem preparado para buscar vagas relacionadas a facas ou supermercado
- Como agora os comandos sao slash commands, o bot nao precisa da Message Content Intent
- As respostas dos comandos tambem respeitam o locale enviado pelo Discord quando houver traducao disponivel
- Se `guildId` estiver configurado, os comandos sao registrados apenas nesse servidor e costumam aparecer quase imediatamente
- Se `guildId` nao estiver configurado, o registro continua global e pode levar mais tempo para propagar
