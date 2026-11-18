# claude-rea · POC de engenharia reversa com agentes

POC que usa o **REA (Reverse Engineer Anything)** para que um agente de IA (Claude Code) inspecione uma funcionalidade web sem acesso ao código-fonte, explique como ela funciona **com evidências** e construa uma **versão própria**.

## Alvo da POC

| Item | Valor |
| :--- | :--- |
| Funcionalidade | Radar de Maturidade em IA |
| URL | https://radar.deltaacademy.com.br |
| Tipo de análise | Observação passiva no navegador (o que qualquer visitante recebe) |
| Resultado esperado | Relatório de engenharia reversa + diagnóstico próprio de maturidade em IA |

## Ferramentas

| Camada | Escolha |
| :--- | :--- |
| Agente | Claude Code (sessão cloud) |
| Engenharia reversa | [`rea-agents`](https://www.npmjs.com/package/rea-agents) 6.9.0, fonte oficial [`morluto/rea`](https://github.com/morluto/rea) |
| Navegador | Chromium headless com CDP em `127.0.0.1:9222` |
| Publicação (fase 4) | GitHub Pages |
| Dados (fase 4) | Supabase |

O arquivo [`.mcp.json`](.mcp.json) registra o REA como servidor MCP para qualquer agente que abrir este repositório.

## Fases

| # | Fase | Status | Documento |
| :--- | :--- | :--- | :--- |
| 1 | Observar | ✅ Concluída | [docs/01-observacao.md](docs/01-observacao.md) |
| 2 | Dissecar o bundle JS | ✅ Concluída | [docs/02-dissecacao.md](docs/02-dissecacao.md) |
| 3 | Explicar com evidências | ⏳ Próxima | |
| 4 | Reconstruir (versão própria) | ⬜ | |

## Regras do jogo (governança)

1. **Somente observação passiva**: o que o navegador público recebe. Sem login, força bruta, varredura ou carga no servidor.
2. **Sem envio de dados falsos** para o backend do alvo. No máximo uma submissão de teste, e só com aprovação explícita.
3. **Evidência acima de opinião**: toda conclusão aponta para um arquivo em [`evidence/`](evidence/). O que não foi observado fica registrado como desconhecido.
4. **Reconstrução própria**: marca, textos, perguntas e modelo de pontuação nossos. Não copiamos identidade visual nem conteúdo do alvo.
5. **LGPD**: a versão própria trata dados pessoais com base legal, consentimento explícito e mínimo necessário.
6. **Fontes oficiais**: REA apenas de `morluto/rea`, `rea.tools` ou do pacote `rea-agents`.
