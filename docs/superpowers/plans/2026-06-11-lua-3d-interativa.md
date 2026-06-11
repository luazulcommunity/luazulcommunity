# Lua 3D Interativa — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Substituir a imagem plana da lua do hero por uma esfera 3D (Three.js) que gira ao arrastar com o mouse e com o scroll, sem mudar nada no mobile.

**Architecture:** O site é um único `index.html` estático. Um `<script type="module">` novo, no fim do body, importa Three.js de CDN (versão fixa) só em desktop, renderiza a esfera num `<canvas>` dentro de `.hero .moon` e só esconde o `<img>` atual depois do primeiro frame 3D renderizado. Qualquer falha (CDN, WebGL, textura) deixa o site exatamente como está hoje.

**Tech Stack:** HTML/CSS/JS vanilla + Three.js 0.170.0 via jsdelivr (ES module). Sem build, sem npm.

**Spec:** `docs/superpowers/specs/2026-06-11-lua-3d-interativa-design.md`

**Contexto que o executor precisa saber:**
- O "modo leve mobile" é a media query `@media (max-width:820px), (pointer:coarse)` (em `index.html`, perto do fim do `<style>`). O 3D NÃO pode rodar quando ela casa.
- O loader adiciona `document.body.classList.add('loaded')` quando termina — o 3D espera isso.
- `.hero .moon` tem `pointer-events:none`; o canvas reativa com `pointer-events:auto`.
- O texto do hero (`.hero > .wrap`) está em `z-index:5`, acima da lua (`z-index:1`) — CTAs continuam clicáveis.
- O parallax de scroll existente (IIFE "Moon parallax") mexe em transform/opacity do container `.hero .moon` e NÃO deve ser alterado — ele continua valendo para o canvas.
- Não há framework de teste no projeto; a verificação é no navegador (Task 4), com servidor HTTP local (módulos ES + textura não carregam via `file://`).

---

### Task 1: Textura lunar local

**Files:**
- Create: `assets/moon-texture.jpg`

- [ ] **Step 1: Baixar a textura do repositório oficial do three.js**

Run (PowerShell):
```powershell
curl.exe -L -o assets/moon-texture.jpg https://raw.githubusercontent.com/mrdoob/three.js/r170/examples/textures/planets/moon_1024.jpg
```

- [ ] **Step 2: Verificar que baixou de verdade**

Run:
```powershell
Get-Item assets/moon-texture.jpg | Select-Object Name, Length
```
Expected: arquivo existe com `Length` > 100000 (≈230KB). Se vier pequeno (<10KB), é página de erro — apague e tente a tag `r169` na URL.

- [ ] **Step 3: Commit**

```powershell
git add assets/moon-texture.jpg; git commit -m "feat: textura lunar local para a lua 3d"
```

---

### Task 2: CSS do canvas 3D

**Files:**
- Modify: `index.html` (bloco `<style>`, logo após a regra `.hero .moon::after{...}`)

- [ ] **Step 1: Adicionar as regras do canvas**

Em `index.html`, localizar este bloco existente:

```css
  .hero .moon::after{
    content:"";position:absolute;inset:8%;border-radius:50%;z-index:2;
    background:radial-gradient(circle at 32% 36%, rgba(150,190,255,.16), transparent 52%);
    mix-blend-mode:screen;pointer-events:none;
  }
```

e inserir IMEDIATAMENTE DEPOIS dele:

```css
  /* lua 3D — canvas entra no lugar da imagem quando o WebGL renderiza (so desktop) */
  .hero .moon canvas.moon3d{
    position:absolute;inset:0;width:100%;height:100%;z-index:1;
    display:none;pointer-events:auto;cursor:grab;touch-action:none;
    opacity:.72;
    -webkit-mask-image:radial-gradient(circle closest-side, #000 72%, rgba(0,0,0,.5) 88%, transparent 99%);
    mask-image:radial-gradient(circle closest-side, #000 72%, rgba(0,0,0,.5) 88%, transparent 99%);
  }
  .hero .moon.moon3d-on canvas.moon3d{display:block}
  .hero .moon.moon3d-on .moon-rot{display:none}
```

Notas para o executor:
- A `opacity:.72` e o `mask-image` são cópia intencional dos valores do `.hero .moon img` — mantêm o visual esfumado atual.
- `display:none` por padrão: o canvas só aparece quando o JS adicionar a classe `moon3d-on` ao container (depois do primeiro frame renderizado).
- NÃO mexer nas regras vizinhas (`::before`, `::after`, `.engrave`) — elas ficam por cima do canvas e devem continuar como estão.

- [ ] **Step 2: Conferir que o site continua igual (CSS é inerte sem o JS)**

Abrir o site (qualquer forma) e confirmar que a lua-imagem continua aparecendo normalmente. Nada deve ter mudado visualmente.

- [ ] **Step 3: Commit**

```powershell
git add index.html; git commit -m "feat: estilos do canvas da lua 3d (inerte ate o js entrar)"
```

---

### Task 3: Script da lua 3D

**Files:**
- Modify: `index.html` (antes de `</body>`, depois do último `<script>` existente)

- [ ] **Step 1: Adicionar o módulo**

Em `index.html`, localizar o fim do último bloco `<script>...</script>` (logo antes de `</body>`) e inserir:

```html
<!-- ===== Lua 3D interativa — so desktop; mobile mantem a imagem leve ===== -->
<script type="module">
(async () => {
  // mesmo criterio do "modo leve" do CSS: celular/touch fica com a imagem estatica
  if (matchMedia('(max-width:820px), (pointer:coarse)').matches) return;

  const holder = document.querySelector('.hero .moon');
  if (!holder || !window.WebGLRenderingContext) return;

  // espera o loader liberar o site, pra nao competir com o carregamento inicial
  await new Promise(res => {
    if (document.body.classList.contains('loaded')) return res();
    const iv = setInterval(() => {
      if (document.body.classList.contains('loaded')) { clearInterval(iv); res(); }
    }, 150);
    setTimeout(() => { clearInterval(iv); res(); }, 10000); // trava de seguranca
  });

  // qualquer falha daqui pra baixo -> sai sem tocar no DOM e a imagem atual permanece
  let THREE, renderer;
  const canvas = document.createElement('canvas');
  canvas.className = 'moon3d';
  try {
    THREE = await import('https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js');
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  } catch (e) { return; }

  const tex = await new Promise(res => {
    new THREE.TextureLoader().load('assets/moon-texture.jpg', t => res(t), undefined, () => res(null));
  });
  if (!tex) return;
  tex.colorSpace = THREE.SRGBColorSpace;

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(34, 1, 0.1, 10);
  cam.position.z = 3.55; // esfera raio 1 ocupa ~96% do canvas; a borda cai na zona do feather

  // luz fria/azulada de cima-esquerda, casando com o brilho atual (::after em 32% 36%)
  scene.add(new THREE.AmbientLight(0x8fa8d8, 0.6));
  const sun = new THREE.DirectionalLight(0xcfe0ff, 2.2);
  sun.position.set(-1.6, 1.2, 2.4);
  scene.add(sun);

  const moon = new THREE.Mesh(
    new THREE.SphereGeometry(1, 64, 64),
    new THREE.MeshStandardMaterial({ map: tex, roughness: 1 })
  );
  scene.add(moon);

  // ----- rotacao: drag com inercia + scroll + auto-rotacao -----
  const AUTO = (2 * Math.PI) / 150; // mesma velocidade da animacao CSS antiga (150s/volta)
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let velX = 0, velY = REDUCED ? 0 : AUTO;
  let dragging = false, lastT = 0, lastInteract = -1e9;

  let px = 0, py = 0;
  canvas.addEventListener('pointerdown', e => {
    dragging = true; px = e.clientX; py = e.clientY;
    canvas.setPointerCapture(e.pointerId);
    canvas.style.cursor = 'grabbing';
  });
  canvas.addEventListener('pointermove', e => {
    if (!dragging) return;
    const k = 2.2 / canvas.clientWidth; // arrastar a largura toda ~ meia volta
    const dx = (e.clientX - px) * k, dy = (e.clientY - py) * k;
    px = e.clientX; py = e.clientY;
    moon.rotation.y += dx;
    moon.rotation.x = Math.max(-0.7, Math.min(0.7, moon.rotation.x + dy));
    velY = dx * 60; velX = dy * 60; // vira inercia ao soltar
    lastInteract = performance.now();
  });
  const release = () => { dragging = false; canvas.style.cursor = 'grab'; lastInteract = performance.now(); };
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', release);

  // scroll soma rotacao suave (o parallax de posicao/opacidade existente continua valendo)
  let lastScroll = window.scrollY;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (!REDUCED) moon.rotation.y += (y - lastScroll) * 0.0012;
    lastScroll = y;
  }, { passive: true });

  // dimensiona pro container e acompanha resize
  function size(){
    const s = holder.clientWidth;
    if (s > 0) renderer.setSize(s, s, false);
  }
  size();
  new ResizeObserver(size).observe(holder);

  // pausa o render quando o hero sai da tela
  let visible = true;
  new IntersectionObserver(en => { visible = en[0].isIntersecting; }).observe(holder);

  holder.appendChild(canvas);

  function frame(now){
    requestAnimationFrame(frame);
    if (!visible) { lastT = now; return; }
    const dt = Math.min((now - lastT) / 1000 || 0, 0.05);
    lastT = now;
    if (!dragging){
      moon.rotation.y += velY * dt;
      moon.rotation.x = Math.max(-0.7, Math.min(0.7, moon.rotation.x + velX * dt));
      velX *= 0.94;
      if (now - lastInteract > 3000 && !REDUCED){
        velY += (AUTO - velY) * 0.02;  // retoma o giro lento sozinha
        moon.rotation.x *= 0.995;       // nivela a inclinacao aos poucos
      } else {
        velY *= 0.94;                   // inercia decaindo
      }
    }
    renderer.render(scene, cam);
    // primeiro frame renderizado com sucesso -> troca a imagem pelo 3D
    if (!holder.classList.contains('moon3d-on')) holder.classList.add('moon3d-on');
  }
  requestAnimationFrame(frame);
})();
</script>
```

- [ ] **Step 2: Commit**

```powershell
git add index.html; git commit -m "feat: lua 3d interativa no hero (drag + scroll, so desktop)"
```

---

### Task 4: Verificação no navegador

**Files:** nenhum (só verificação; ajustes finos voltam para Task 2/3 se necessário)

- [ ] **Step 1: Subir servidor local** (módulo ES + textura não funcionam via `file://`)

Run (em background):
```powershell
npx -y http-server -p 5500 -c-1
```

- [ ] **Step 2: Verificar desktop**

Abrir `http://localhost:5500` em janela larga (>820px) com mouse. Checar, nesta ordem:
1. Loader roda normal e o hero aparece.
2. Em até ~2s a lua vira 3D: no DevTools, `document.querySelector('.hero .moon').classList.contains('moon3d-on')` → `true`; o `<canvas class="moon3d">` está visível e o `<img>` sumiu.
3. A lua gira sozinha bem devagar; aura azulada, texto "LUAZUL" gravado e estrelas continuam por cima.
4. Arrastar com o mouse gira a lua na direção do arrasto, com inércia ao soltar; ~3s depois ela volta a girar sozinha.
5. Rolar a página: lua gira um pouco com o scroll E continua subindo/sumindo (parallax antigo intacto).
6. Botões do hero ("Lancer mon projet" etc.) continuam clicáveis.

- [ ] **Step 3: Verificar mobile (modo leve intacto)**

No DevTools, ativar emulação de celular (ex.: iPhone, 390px) e RECARREGAR a página (o critério roda só no load). Checar: `document.querySelector('.moon3d')` → `null`; a lua é o `<img>` de sempre.

- [ ] **Step 4: Verificar fallback de falha**

No DevTools, aba Network, bloquear a URL `cdn.jsdelivr.net`, recarregar em modo desktop. Checar: sem erro visível, lua-imagem aparece como hoje.

- [ ] **Step 5: Ajuste fino visual (se necessário)**

Se a esfera parecer pequena/grande demais dentro do feather: ajustar `cam.position.z` (3.4–3.7). Se escura/clara demais contra o céu: ajustar intensidades das luzes (`0.6` ambient / `2.2` directional). Re-conferir e commitar como `fix: ajuste fino da lua 3d`.

---

## Self-review (feito na escrita do plano)

- Cobertura do spec: textura local (T1), canvas dentro de `.hero .moon` com aura/engrave intactos (T2), opacidade/mask iguais (T2), lazy + versão fixa + swap só após 1º frame + fallbacks (T3), drag com inércia + scroll + auto-rotação 150s (T3), mobile intacto + DPR cap + IntersectionObserver + reduced-motion (T3), verificação completa (T4). Fora de escopo respeitado (orbit-moon intocada).
- Sem placeholders; todo código está literal nos steps.
- Nomes consistentes entre tasks: classe `moon3d`, classe de estado `moon3d-on`, arquivo `assets/moon-texture.jpg`.
