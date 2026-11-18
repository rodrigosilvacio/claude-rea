# Fase 2 · Dissecação do Radar (sem enviar nada)

**Data:** 2026-11-18 · **Ferramentas:** REA 6.9.0 (`analyze-web-bundle`, `inspect-web-page --include-script-sources`, `export-web-scripts`) + leitura do bundle exportado + navegador em modo sandbox

## Resumo executivo

O Radar é um **diagnóstico 100% client-side acoplado ao HubSpot**. Perguntas, pontuação, níveis e recomendações estão no bundle JS e são calculados no navegador. O backend é só o **HubSpot Forms**, que recebe dois envios: o lead (formulário) e o resultado (pontuação + respostas). Sem e-mail preenchido, o código **não envia nada**. O resultado completo fica bloqueado atrás do formulário de lead.

## Arquitetura descoberta

```
Navegador (React + React Router em hash, build Vite)
 ├─ Perguntas, escalas, níveis, casos de uso ── tudo no bundle
 ├─ Cálculo de score ─────────────────────────── no navegador
 ├─ dataLayer (GTM) ──────────────────────────── eventos de funil
 └─ fetch POST ─▶ api.hsforms.com/submissions/v3/integration/submit/<portal>/<form>
      ├─ Form 1 "lead":      firstname, qual_o_seu_cargo, email, hs_whatsapp_phone_number, name (empresa)
      └─ Form 2 "resultado": maturity_total_score, maturity_level, maturity_level_name,
                             maturity_score_{people,processes,data,strategy},
                             maturity_critical_gap, maturity_completed_at,
                             maturity_answers_json, maturity_last_result
```

## Rotas

`/` (início) · `/quiz` e `/quiz/:n` (perguntas) · `/dados` (formulário de lead) · `/resultado` (radar) · `*` → início

## Modelo de diagnóstico

| Item | Como funciona |
| :--- | :--- |
| Dimensões | Pessoas (`P1..P5`), Processos (`PR1..PR5`), Dados (`D1..D5`), Estratégia (`E1..E5`) |
| Resposta | Escala 1 a 5 por pergunta, cada opção com rótulo próprio e um rótulo genérico ("Não existe ou nunca acontece" … "Sistemático, medido e sempre aplicado") |
| Score total | Soma simples das 20 respostas → faixa **20 a 100** |
| Score por dimensão | `round(soma da dimensão / 25 × 100)` → 0 a 100% |
| Lacuna crítica | A dimensão com **menor** percentual |
| Recomendações | Casos de uso filtrados por setor e área prioritária (com fontes públicas: Klarna, Duolingo, DeepMind, Walmart, BMW, John Deere etc.) |
| Link do resultado | `#/resultado?r=<base64url de {a: respostas, s: setor, p: área}>` |

### Níveis (Jornada AI-First)

| Score | Nível | Nome |
| :--- | :--- | :--- |
| 20 a 35 | Nível 1-2 | Consciência |
| 36 a 50 | Nível 3 | Habilitação |
| 51 a 65 | Nível 4 | Aceleração |
| 66 a 80 | Nível 5 | Transformação |
| 81 a 100 | Nível 6 | Excelência AI-First |

Cada nível traz tom, risco principal, trilha Delta recomendada, sinais por dimensão e três próximos passos.

## Funil e tracking

- **Variante A/B por URL:** `?flow=form-first` (padrão) ou `?flow=quiz-first`.
- **Eventos no `dataLayer`:** `radar_flow_view`, `radar_formulario_view`, `radar_campo_preenchido` (por campo, no blur), `radar_formulario_submit`, `radar_pergunta_respondida` (número + dimensão), `radar_cta_view`, `radar_cta_click`, `radar_resultado_view`.
- **Identidade:** lê o cookie `hubspotutk` para ligar o envio ao visitante rastreado.
- **CTAs finais:** "Baixar relatório completo" (`window.print()`), "Agendar reunião com especialistas" (link encurtado) e "Fazer novo diagnóstico".
- **Deduplicação:** o envio do resultado usa um cache em memória por `email|score|respostas` para não enviar duas vezes.

## Prova do "sem enviar" (modo sandbox)

Navegador com bloqueio de **todo** método diferente de GET e de **todo** host diferente de `radar.deltaacademy.com.br`:

| Tela | Resultado |
| :--- | :--- |
| Início com `?flow=quiz-first` | Renderizou normalmente |
| Pergunta 1 (`#/quiz/1`) | Renderizou: "Sua empresa tem programa formal de treinamento em IA para os colaboradores?" com 5 opções |
| Link de resultado com respostas hipotéticas (todas = 3) | **Redirecionou para o início**: o resultado exige o formulário de lead |
| Tentativas de POST | **Zero** |
| Bloqueados | Apenas `googletagmanager.com/gtm.js` e `api.fontshare.com` (GET), ou seja, nem o tracking saiu |

As capturas de tela ficam fora do repositório (contêm a marca do alvo).

## Limitações e desconhecidos

- **`analyze-web-bundle` do REA não concluiu** neste bundle: estourou heap de 1 GB e prazo de 280 s com 4 GB. Registrado em `evidence/03-bundle-endpoints.json`. A análise seguiu pela exportação verificada (`evidence/04-export-scripts.json`) e leitura do código.
- **Não avaliamos o código do bundle**: a extração automatizada dos literais foi barrada pela política de segurança da sessão. O modelo acima foi lido como texto.
- **Não contornamos o bloqueio do resultado** (por exemplo, injetando estado de formulário): isso seria burlar o funil do alvo.
- O que o HubSpot faz depois do envio (workflows, lead scoring, SDR) não é observável do navegador.

## So what

1. **A tecnologia é simples; o valor está no conteúdo e no funil.** Uma soma de 20 respostas e 5 faixas. O diferencial da Delta é a curadoria (perguntas, níveis, recomendações com cases) e a integração com o CRM.
2. **Para reconstruir, não precisamos de backend complexo**: SPA estática (GitHub Pages) + uma tabela de leads e resultados (Supabase) reproduzem a arquitetura.
3. **Oportunidades de fazer melhor na nossa versão**: entregar valor antes de pedir dados (quiz-first por padrão), consentimento LGPD explícito (não observamos checkbox de consentimento no formulário da tela inicial) e resultado calculado também no servidor para evitar adulteração.
