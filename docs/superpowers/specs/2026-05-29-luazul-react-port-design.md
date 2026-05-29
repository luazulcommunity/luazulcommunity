# Luazul Community — Port para React + Vite + Tailwind (JS)

**Data:** 2026-05-29
**Status:** Aprovado (design) — aguardando plano de implementação

## Objetivo

Migrar a landing page atual (um único `index.html` com CSS e JS inline, ~1900 linhas)
para **React 18 + Vite 5 + Tailwind 3 (JavaScript, sem TypeScript)**, mantendo o
**visual idêntico** ("port fiel") e corrigindo os crashes que travam o navegador
(Safari iOS e Chrome) em loop de recarregamento.

Não é redesign. Mesmas seções, mesmos textos (francês), mesmo visual — só muda a
stack, a organização do código e a robustez das animações.

## Causa-raiz do crash (a corrigir no port)

A seção "Cycle Wide" decodificava um WebP animado **frame a frame** via a API
`ImageDecoder` (WebCodecs), desenhando continuamente num `<canvas>`. No mobile (e
no Chrome) isso estoura a memória e o WebKit/Blink mata e recarrega a aba em loop
("Um problema ocorreu repetidamente"). O port substitui isso por um `<img>` animado
leve com o mesmo estilo (blend + máscara), visualmente idêntico.

## Estrutura do projeto

```
luazul/
├─ index.html              # entrada do Vite (apenas <div id="root">)
├─ package.json            # React 18, Vite 5, Tailwind 3, @vitejs/plugin-react
├─ vite.config.js
├─ tailwind.config.js
├─ postcss.config.js
├─ Dockerfile              # multi-stage: build Node → serve nginx
├─ .dockerignore
├─ public/
│  └─ assets/              # 9 imagens usadas (logos, moon-spin.webp, fotos da equipe)
└─ src/
   ├─ main.jsx
   ├─ App.jsx              # monta loader + starfield + nav + seções + footer
   ├─ index.css           # @tailwind directives + efeitos assinatura (keyframes, blend, máscaras, gradientes, --variáveis)
   ├─ components/
   │  ├─ Loader.jsx
   │  ├─ Starfield.jsx
   │  ├─ Nav.jsx
   │  ├─ Hero.jsx            # 01
   │  ├─ About.jsx           # 02 Qui sommes-nous
   │  ├─ Expertise.jsx       # 03 Expertises
   │  ├─ WebDev.jsx          # 03b Web Developer & Tech (deck)
   │  ├─ CycleWide.jsx       # 04 Cycle Wide (lua — versão leve)
   │  ├─ Process.jsx         # 05 Processus
   │  ├─ WhyInvest.jsx       # 06 Pourquoi investir (gráfico SVG)
   │  ├─ Pricing.jsx         # 07 Offres
   │  ├─ Team.jsx            # 08 Équipe (foto que segue o cursor + crossfade)
   │  ├─ Experience.jsx      # 09 Expérience
   │  ├─ Contact.jsx         # 10 Contact (CTA final)
   │  └─ Footer.jsx
   └─ hooks/
      ├─ useScrollReveal.js  # revela elementos ao entrar na viewport (IntersectionObserver)
      └─ useParallax.js      # parallax em scroll com requestAnimationFrame + cleanup
```

Cada componente tem uma responsabilidade única (uma seção), recebe nada ou poucos
props, e pode ser entendido isoladamente. Os efeitos de animação ficam em hooks
reutilizáveis com cleanup correto.

## Estilo (Tailwind + CSS global)

- **Tailwind** para layout, espaçamento, tipografia e cores.
  - `tailwind.config.js` estende o tema com:
    - **Fontes:** Cormorant Garamond (serif), Space Grotesk, Manrope.
    - **Paleta cósmica** (ver tokens abaixo) + azuis de destaque (`#3A6BFF`, `#2A4FB0`, `#4D8DFF`).
    - **Keyframes** reutilizados.
- **`src/index.css`** guarda os efeitos que o Tailwind não cobre como utilitário,
  copiados/adaptados do site atual: `mix-blend-mode`, máscaras radiais
  (`mask-image`), gradientes complexos, `backdrop-filter`, e as ~15 animações
  `@keyframes`. Preserva também as `--variáveis` CSS.

### Tokens de fundo (paleta "azul-infinito" — direção da Vick)

Substituem o fundo atual (`#05081C`/`#0A0E2A`/`#0D1B4C`) pela paleta da Vick:

```
--bg-base:   #10142D   /* cor base do body */
--bg-near:   #0D1330   /* borda do gradiente radial (mais escuro) */
--bg-far:    #12183A   /* centro do gradiente radial (levemente mais claro) */
```

**Aplicação do fundo (efeito "olhar para o infinito"):**
- `body` recebe `background: #10142D`.
- Por cima, um **gradiente radial**: centro mais claro (`#12183A`) → bordas mais
  escuras (`#0D1330`), sobre a base.
- Mantêm-se os **brilhos de nebulosa** (radiais azuis suaves já existentes), que
  dão a sensação de profundidade infinita.

Os demais azuis de destaque, textos e gradientes de botões/títulos permanecem como
no site atual.

## Correção dos crashes (invisível ao usuário)

1. **Lua (CycleWide):** `<img src="/assets/moon-spin.webp">` animado, com a mesma
   classe/estilo `.orbit-moon` (blend `screen` + máscara radial). **Sem
   `ImageDecoder`/canvas.** Visual idêntico, sem crash.
2. **Starfield:** mantém o `<canvas>`, mas com:
   - `devicePixelRatio` limitado a no máximo 2;
   - número de partículas limitado (proporcional à área, com teto);
   - `prefers-reduced-motion` respeitado (reduz/pausa a animação);
   - **cleanup ao desmontar** (cancelar `requestAnimationFrame`, remover listeners).
3. **Parallax / deck / foto da equipe:** lógica atual portada para hooks/effects do
   React, com remoção correta de listeners no cleanup (sem loops acumulados);
   comportamentos gated por desktop onde já eram.
4. **Loader:** porta o loader de porcentagem; revela o conteúdo após carga inicial.

## Deploy

- **Dockerfile multi-stage:**
  ```dockerfile
  FROM node:22-alpine AS build
  WORKDIR /app
  COPY package*.json ./
  RUN npm ci
  COPY . .
  RUN npm run build
  FROM nginx:alpine
  COPY --from=build /app/dist /usr/share/nginx/html
  EXPOSE 80
  ```
- No Coolify, **Build Pack continua "Dockerfile"** — nenhuma outra mudança.

## Verificação

- **Critério de pronto:**
  1. `npm run build` conclui sem erro.
  2. Paridade visual lado a lado com o site atual (rodando `npm run dev`), seção por seção.
  3. Sem crash em mobile/Chrome (lua e starfield estáveis).
- Como é uma landing estática (pouca lógica testável), **não** haverá suíte de
  testes pesada. Foco: paridade visual + build limpo + estabilidade.

## Fora de escopo (YAGNI)

- Backend, formulário de contato funcional (mantém o comportamento atual), CMS,
  i18n multi-idioma, testes E2E. Nada disso faz parte deste port.
