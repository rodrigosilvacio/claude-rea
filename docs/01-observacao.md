# Fase 1 · Observação do Radar de Maturidade em IA

**Data:** 2026-11-18 · **Ferramenta:** REA 6.9.0 (`list-browser-targets`, `inspect-web-page`) · **Alvo:** https://radar.deltaacademy.com.br

## Resumo executivo

O Radar é uma **SPA estática** (um único bundle JS de ~225 KB) que funciona como **funil de captação de leads com diagnóstico**: antes de responder às 20 perguntas, o visitante informa nome, cargo, empresa, e-mail e WhatsApp. Na tela inicial, nenhuma chamada de rede é feita: as perguntas e a lógica de pontuação muito provavelmente estão dentro do bundle, o que será confirmado na Fase 2.

## Achados com evidência

| # | Achado | Evidência | Confiança |
| :--- | :--- | :--- | :--- |
| 1 | Página "Radar de Maturidade em IA \| Delta Academy" aberta e acessível via CDP | `evidence/01-targets.json` | Observado |
| 2 | Apenas 2 scripts: um inline (358 bytes) e `assets/index-BHbvKAo-.js` (225.248 bytes, módulo ES) | `02-inspect-radar.json` → `scripts.items` | Observado |
| 3 | Padrão de nome `assets/index-<hash>.js` + `index-<hash>.css` indica build com **Vite** | `resources` | Inferido |
| 4 | Sem source map declarado (`source_map_url: null`), ou seja, código minificado sem fontes originais | `scripts.items[1]` | Observado |
| 5 | Roteamento por hash (`/#/`) | `metadata.dom_urls` | Observado |
| 6 | Nenhuma requisição de rede, WebSocket ou storage durante 3 s de observação na tela inicial | `network`, `storage` | Observado (janela limitada) |
| 7 | Fontes Aeonik e ícone servidos pelo próprio domínio | `resources` | Observado |
| 8 | Modelo de 4 dimensões × 5 perguntas = **20 perguntas** | Textos da página (`accessibility`) | Observado |
| 9 | Formulário de lead **antes** do diagnóstico: Nome, Cargo, Nome da empresa, E-mail, WhatsApp | `accessibility` (textbox) | Observado |
| 10 | Promessa de valor: "Diagnóstico executivo em 10 minutos", resultado em "Radar por dimensão" e posição na "Jornada AI-First" | `accessibility` | Observado |

### As 4 dimensões (conforme o texto da página)

| Dimensão | O que avalia |
| :--- | :--- |
| Pessoas | Fluência, liderança, papéis, incentivo e adoção real no time |
| Processos | Uso em produção, automação, integração, KPIs e velocidade |
| Dados | Qualidade, governança, centralização e prontidão para IA |
| Estratégia | Roadmap, budget, ROI, governança e priorização por valor |

## Desconhecidos (ainda não observados)

- Texto das 20 perguntas e opções de resposta.
- Fórmula de pontuação, pesos e faixas de cada estágio da "Jornada AI-First".
- Para onde vão os dados do lead (API própria, CRM, Supabase, webhook, n8n?).
- Se o resultado é calculado no navegador ou no servidor.

## Limitações declaradas pelo REA

- A observação começa quando o REA se conecta: a atividade anterior de rede não foi capturada.
- Cabeçalhos, corpos, cookies e valores de storage nunca são retidos (apenas formatos).
- Source maps não são baixados.

## So what

1. **O ativo de negócio é o funil**, não só o questionário: lead qualificado (cargo + empresa + WhatsApp) em troca de um diagnóstico rápido.
2. **A inteligência provavelmente está no bundle**, então a Fase 2 (análise estática do JS) deve revelar perguntas, pontuação e endpoint de envio sem precisar submeter nada.
3. **Ponto de atenção LGPD na reconstrução**: coletar dados pessoais antes de entregar valor exige consentimento explícito e finalidade clara.
