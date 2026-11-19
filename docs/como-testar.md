# Como testar a POC

Três formas, da mais simples para a mais completa. Todas respeitam as regras do jogo: só leitura, nenhum envio ao alvo.

| Forma | Onde roda | Tempo | Para quê |
| :--- | :--- | :--- | :--- |
| 1. Sandbox | Sua máquina ou sessão cloud | 2 min | Ver o Radar abrir com **zero envios** |
| 2. REA pelo agente | Claude Code (ou Cursor, Codex) | 10 min | Repetir a investigação conversando com o agente |
| 3. REA pela linha de comando | Terminal | 10 min | Gerar as mesmas evidências da pasta `evidence/` |

Pré-requisitos: **Node.js 20+** e **Google Chrome** (ou Chromium).

```bash
git clone https://github.com/rodrigosilvacio/claude-rea.git
```

```bash
cd claude-rea && git checkout claude/exciting-ramanujan-fjmg8u
```

## 1. Sandbox (sem enviar nada)

```bash
npm install --no-save playwright && npx playwright install chromium
```

```bash
node scripts/sandbox-radar.js
```

**Resultado esperado:** duas capturas em `evidence/screens/` (fora do git) e, no terminal, `Tentativas de envio (POST/PUT etc.): 0`. A lista de bloqueados mostra o que o site tentou buscar fora do domínio (GTM, fontes).

## 2. REA pelo agente (o jeito "workshop")

1. Registre o REA no seu agente (pede aprovação antes de alterar algo):

   ```bash
   npx rea-agents setup
   ```

   Neste repositório o arquivo `.mcp.json` já registra o REA para o Claude Code, então abrir o Claude Code na pasta também funciona.
2. Reinicie o agente.
3. Abra um Chrome separado com depuração (perfil temporário, não use o seu perfil pessoal):

   macOS:
   ```bash
   "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --remote-debugging-port=9222 --user-data-dir=/tmp/rea-chrome https://radar.deltaacademy.com.br/
   ```

   Windows (PowerShell):
   ```bash
   & "C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --user-data-dir="$env:TEMP\rea-chrome" https://radar.deltaacademy.com.br/
   ```
4. Peça ao agente, por exemplo:
   > Use o REA para listar as abas do Chrome em 127.0.0.1:9222, inspecionar o Radar com textos de acessibilidade e fontes dos scripts, e me explicar com evidências para onde vão os dados e como a nota é calculada. Não preencha nem envie formulários.

**Resultado esperado:** o agente chega às mesmas conclusões de [`02-dissecacao.md`](02-dissecacao.md) (HubSpot Forms, soma de 20 respostas, 5 faixas de nível).

## 3. REA pela linha de comando

Com o Chrome do passo 2.3 aberto:

```bash
npx rea-agents@6.9.0 list-browser-targets http://127.0.0.1:9222 --format json
```

Copie o `id` da aba do Radar e use no lugar de `<ID>`:

```bash
npx rea-agents@6.9.0 inspect-web-page http://127.0.0.1:9222 <ID> --observation-ms 3000 --include-accessibility-text --include-storage-keys --include-json-body-shapes --format json > minha-inspecao.json
```

Para exportar os scripts e lê-los (pasta de saída precisa não existir):

```bash
npx rea-agents@6.9.0 inspect-web-page http://127.0.0.1:9222 <ID> --observation-ms 1500 --include-script-sources --format json > com-fontes.json
```

```bash
npx rea-agents@6.9.0 export-web-scripts com-fontes.json scripts-exportados --format json
```

```bash
grep -o 'api.hsforms.com[^"]*' scripts-exportados/*.js | head
```

**Resultado esperado:** o `grep` mostra o endpoint do HubSpot Forms, a mesma evidência da Fase 2.

## Cuidados

- **Não preencha o formulário** do Radar durante o teste: isso cria um lead real no CRM da Delta.
- **Não versione** capturas de tela nem scripts exportados: contêm marca e código do alvo (já estão fora do git).
- Use **perfil temporário** no Chrome com depuração: a porta 9222 dá controle total do navegador a quem acessá-la.
