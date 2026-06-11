# Lua 3D interativa no hero — Design

**Data:** 2026-06-11
**Status:** Aprovado pelo usuário

## Objetivo

Substituir a imagem plana da lua do hero (`assets/moon.png`) por uma esfera 3D real
que o usuário pode girar com o mouse (drag) e que também rotaciona com o scroll,
mantendo o visual atual integrado ao cenário (aura, feather, opacidade, engrave).

## Arquitetura

- **Three.js** em versão fixa, carregado via CDN como módulo ES, de forma
  preguiçosa (após o loader do site terminar). O site continua single-file
  (`index.html`); o código 3D vive num `<script type="module">` próprio.
- **Textura:** baixar a textura da superfície lunar do repositório oficial do
  three.js e salvar localmente em `assets/moon-texture.jpg` (sem dependência de
  CDN em runtime para o asset).
- **Integração no DOM:** um `<canvas>` é inserido dentro de `.hero .moon`
  (no lugar visual do `<img>` em `.moon-rot`). Permanecem intactos e por cima:
  - aura azulada (`.hero .moon::before`)
  - brilho (`.hero .moon::after`)
  - texto gravado "LUAZUL" (`.engrave`)
  - estrelas ao redor (`.moon-stars`) e orbiters
- **Visual casado com o cenário:**
  - mesma borda esfumada via `mask-image` radial aplicada ao canvas
  - mesma opacidade `.72`
  - iluminação fria/azulada (DirectionalLight azulada + ambient baixa) para
    combinar com o fundo escuro do site

## Interação

- **Drag:** pointerdown/move/up no disco da lua gira a esfera em qualquer
  direção, com inércia ao soltar. Após alguns segundos sem interação, retoma
  auto-rotação lenta (equivalente à atual, ~150s por volta).
- **Scroll:** o scroll da página soma rotação suave no eixo Y, mantendo o
  parallax de posição/opacidade que já existe no JS atual.

## Fallback e segurança (histórico de crash mobile)

- **Mobile (modo leve atual): nada muda.** Continua o `moon.png` estático.
  O 3D só carrega em ambientes desktop (ex.: `pointer: fine` + viewport larga,
  fora do modo leve).
- **Swap seguro:** o `<img>` atual só é ocultado depois do primeiro frame 3D
  renderizado com sucesso. Se WebGL falhar, a lib não carregar ou a textura
  falhar, o `<img>` permanece como está hoje.
- **Performance:** DPR limitado a 2; render pausa quando o hero sai da viewport
  (IntersectionObserver); `prefers-reduced-motion` desativa auto-rotação e
  inércia.

## Fora de escopo

- 3D na lua da seção Cycle Wide (`.orbit-moon`) — permanece como está.
- 3D no mobile.
- Qualquer mudança no restante do hero (textos, CTAs, animações de entrada).
