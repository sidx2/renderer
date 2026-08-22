import React, { useState, useEffect, useRef, useMemo } from "react";
// import {
//   Github,
//   ArrowRight,
//   ArrowUpRight,
//   Copy,
//   Check,
//   Menu,
//   X,
//   Box,
//   Boxes,
//   Palette,
//   Camera,
//   Sparkles,
//   LayoutGrid,
//   Zap,
//   Code,
//   Rocket,
//   GraduationCap,
//   Gamepad2,
//   FlaskConical,
//   BookOpen,
//   Compass,
//   RotateCw,
//   Move,
//   Blocks,
//   Target,
//   Mountain,
//   Braces,
//   Cpu,
//   Layers,
// } from "lucide-react";

import {
  LuGithub as Github,
  LuArrowRight as ArrowRight,
  LuArrowUpRight as ArrowUpRight,
  LuCopy as Copy,
  LuCheck as Check,
  LuMenu as Menu,
  LuX as X,
  LuBox as Box,
  LuBoxes as Boxes,
  LuPalette as Palette,
  LuCamera as Camera,
  LuSparkles as Sparkles,
  LuLayoutGrid as LayoutGrid,
  LuZap as Zap,
  LuCode as Code,
  LuRocket as Rocket,
  LuGraduationCap as GraduationCap,
  LuGamepad2 as Gamepad2,
  LuFlaskConical as FlaskConical,
  LuBookOpen as BookOpen,
  LuCompass as Compass,
  LuRotateCw as RotateCw,
  LuMove as Move,
  LuBlocks as Blocks,
  LuTarget as Target,
  LuMountain as Mountain,
  LuBraces as Braces,
  LuCpu as Cpu,
  LuLayers as Layers,
} from "react-icons/lu";
import { PiArrowUpRightLight } from "react-icons/pi";

/* ====================================================================
   RENDERER — a lightweight WebGL2 rendering library.
   Multi-page site: Home / Getting Started / Examples / API Reference /
   Documentation / Showcase.

   Content is derived from the project's own README.md and its main
   module (renderer.ts) — the real exported classes are Input, Geometry,
   Mesh, Transform, Material, Entity, Scene, CollisionSystem, Selection,
   TransformGizmo, and Renderer. This site documents the well-formed,
   README-aligned surface: Renderer, Scene, Entity, Transform, Material,
   Mesh & Geometry, and CollisionSystem. Selection/TransformGizmo/Input
   are exported but have no documented workflow in the README, so they
   are intentionally left out rather than guessed at.

   ROUTING: not implemented on purpose. <SiteLayout> supplies the shared
   chrome (stylesheet, nav, footer, ambient background) and expects a
   `current` page id + `onNavigate` handler — swap those for your
   router's location/navigate, and the <a> tags in TopNav/Footer for
   your router's <Link>. Page components render only their own content
   so they drop into a layout route:

     <Route element={<SiteLayout .../>}>
       <Route index element={<HomePage onNavigate={...} />} />
       <Route path="getting-started" element={<GettingStartedPage />} />
       <Route path="examples" element={<ExamplesPage />} />
       <Route path="api-reference" element={<APIReferencePage />} />
       <Route path="docs" element={<DocumentationPage onNavigate={...} />} />
       <Route path="showcase" element={<ShowcasePage onNavigate={...} />} />
     </Route>

   The default export (RendererSite) is a self-contained preview shell
   that fakes routing with local state, purely so this renders as one
   live artifact.
   ==================================================================== */

const GITHUB_URL = "https://github.com/sidx2/renderer";
const PHYZZIX_DEMO_URL = "https://sidx2.github.io/phyzzix";
const INSTALL_CMD = "npm install https://github.com/sidx2/renderer";

/* ------------------------------------------------------------------ */
/* Design tokens — a graphics-native identity: the accent blue is the  */
/* exact color of the cube in the README's own example                */
/* (vec3(0.2, 0.3, 0.9)), paired with a warm rim-light amber —         */
/* the classic key-light / rim-light pairing from 3D lighting setups.  */
/* ------------------------------------------------------------------ */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');

  .rn-root {
    --void: #0a0d16;
    --surface: #10141f;
    --surface-2: #171d2c;
    --beam: #4d63ff;
    --beam-dim: rgba(77,99,255,0.14);
    --rim: #ff9457;
    --white: #eef1f8;
    --ash: #8b93a8;
    --ash-dim: #565d70;
    --border: rgba(238,241,248,0.09);
    --border-soft: rgba(238,241,248,0.05);

    background: var(--void);
    color: var(--white);
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    position: relative;
    isolation: isolate;
    overflow-x: hidden;
    scroll-behavior: smooth;
    line-height: 1.55;
  }
  .rn-root * { box-sizing: border-box; }
  .rn-display { font-family: 'Space Grotesk', sans-serif; }
  .rn-mono { font-family: 'IBM Plex Mono', ui-monospace, monospace; }
  .rn-root a { color: inherit; text-decoration: none; }
  .rn-root button { font-family: inherit; cursor: pointer; }
  .rn-root ::selection { background: rgba(77,99,255,0.35); color: var(--white); }
  .rn-root :focus-visible { outline: 2px solid var(--beam); outline-offset: 3px; border-radius: 4px; }

  .rn-shell { max-width: 1180px; margin: 0 auto; padding: 0 24px; }

  /* --------------------------- ambient layers -------------------------- */
  .glow-blob { position: absolute; border-radius: 50%; filter: blur(100px); pointer-events: none; mix-blend-mode: screen; opacity: 0.4; z-index: 0; }
  .glow-beam { background: radial-gradient(circle at 30% 30%, var(--beam), transparent 70%); }
  .glow-rim { background: radial-gradient(circle at 60% 60%, var(--rim), transparent 70%); }
  @keyframes floatA { 0%, 100% { transform: translate(0,0) scale(1); } 50% { transform: translate(36px,-26px) scale(1.06); } }
  @keyframes floatB { 0%, 100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-44px,32px) scale(1.04); } }

  .grid-floor {
    position: absolute; left: -10%; right: -10%; bottom: 0; height: 380px;
    background-image: linear-gradient(rgba(77,99,255,0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(77,99,255,0.22) 1px, transparent 1px);
    background-size: 42px 42px;
    transform: perspective(560px) rotateX(62deg);
    transform-origin: bottom;
    -webkit-mask-image: linear-gradient(to top, black, transparent 85%);
    mask-image: linear-gradient(to top, black, transparent 85%);
    z-index: 0;
  }

  .cube-stage { perspective: 1000px; display: flex; align-items: center; justify-content: center; }
  .cube { position: relative; transform-style: preserve-3d; animation: spinCube 16s linear infinite; }
  .cube-face { position: absolute; border: 1.5px solid var(--beam); background: linear-gradient(135deg, rgba(77,99,255,0.16), rgba(255,148,87,0.06)); box-shadow: inset 0 0 40px rgba(77,99,255,0.2); }
  @keyframes spinCube { from { transform: rotateX(-20deg) rotateY(0deg); } to { transform: rotateX(-20deg) rotateY(360deg); } }

  .floating-geo { position: absolute; inset: 0; overflow: hidden; pointer-events: none; z-index: 0; opacity: 0.5; }
  .floating-geo-item { position: absolute; animation-name: driftY; animation-timing-function: ease-in-out; animation-iteration-count: infinite; }
  @keyframes driftY { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-24px); } }

  /* --------------------------------- nav -------------------------------- */
  .rn-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 40; border-bottom: 1px solid transparent; transition: background-color .3s ease, border-color .3s ease, backdrop-filter .3s ease; }
  .rn-nav.scrolled { background: rgba(10,13,22,0.75); backdrop-filter: blur(14px); border-bottom-color: var(--border); }
  .rn-nav-inner { display: flex; align-items: center; justify-content: space-between; height: 66px; }
  .rn-logo { display: flex; align-items: center; gap: 9px; font-weight: 700; font-size: 16.5px; letter-spacing: -0.01em; }
  .rn-axes { flex-shrink: 0; }
  .rn-nav-links { display: flex; align-items: center; gap: 26px; }
  .rn-nav-link { position: relative; font-size: 13.5px; color: var(--ash); transition: color .2s ease; padding-bottom: 4px; white-space: nowrap; }
  .rn-nav-link:hover { color: var(--white); }
  .rn-nav-link.active { color: var(--white); }
  .rn-nav-link.active::after { content: ''; position: absolute; left: 0; right: 0; bottom: -22px; height: 2px; background: linear-gradient(90deg, var(--beam), var(--rim)); }
  .rn-nav-cta { display: inline-flex; align-items: center; gap: 6px; font-size: 13.5px; font-weight: 600; color: var(--white); border: 1px solid var(--border); padding: 8px 13px; border-radius: 8px; transition: border-color .2s ease, background .2s ease; }
  .rn-nav-cta:hover { border-color: rgba(77,99,255,0.5); background: rgba(77,99,255,0.08); }
  .rn-nav-mobile-btn { display: none; }

  /* -------------------------------- buttons ------------------------------ */
  .rn-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; font-weight: 700; font-size: 14.5px; padding: 12px 22px; border-radius: 10px; border: 1px solid transparent; transition: transform .2s ease, box-shadow .2s ease; white-space: nowrap; }
  .rn-btn:active { transform: scale(0.97); }
  .rn-btn-red-star {
    background: linear-gradient(135deg, #ff1744, #d50000 55%, #ff3d00);
    color: var(--white);
    box-shadow:
      0 10px 30px -8px rgba(255, 23, 68, 0.75),
      0 0 18px rgba(255, 61, 0, 0.45);
  }
  .rn-btn-red-star:hover {
    box-shadow:
      0 14px 36px -6px rgba(255, 23, 68, 0.9),
      0 0 24px rgba(255, 61, 0, 0.6);
    transform: translateY(-1px);
  }
  .rn-btn-primary { background: linear-gradient(135deg, var(--beam), #7a3dff); color: var(--white); box-shadow: 0 10px 30px -8px rgba(77,99,255,0.55); }
  .rn-btn-primary:hover { box-shadow: 0 14px 36px -6px rgba(77,99,255,0.75); transform: translateY(-1px); }
  .rn-btn-ghost { background: rgba(238,241,248,0.03); border-color: var(--border); color: var(--white); }
  .rn-btn-ghost:hover { border-color: rgba(77,99,255,0.4); background: rgba(77,99,255,0.06); }

  /* --------------------------------- hero -------------------------------- */
  .rn-hero { position: relative; padding: 164px 0 120px; z-index: 1; overflow: hidden; }
  .rn-hero-grid { display: grid; grid-template-columns: 1.05fr 0.95fr; gap: 50px; align-items: center; }
  .rn-eyebrow-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 22px; }
  .rn-eyebrow { display: inline-flex; align-items: center; gap: 7px; font-size: 11.5px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: #c7cdff; background: rgba(77,99,255,0.1); border: 1px solid rgba(77,99,255,0.25); padding: 6px 11px; border-radius: 999px; }
  .rn-eyebrow.warn { color: var(--rim); background: rgba(255,148,87,0.08); border-color: rgba(255,148,87,0.25); }
  .rn-h1 { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: clamp(36px, 4.8vw, 58px); line-height: 1.08; letter-spacing: -0.02em; margin: 0 0 22px; }
  .rn-h1 .rn-grad { background: linear-gradient(100deg, var(--beam) 10%, #9d7bff 55%, var(--rim) 100%); -webkit-background-clip: text; background-clip: text; color: transparent; }
  .rn-sub { font-size: 17.5px; color: var(--ash); max-width: 480px; margin: 0 0 34px; }
  .rn-hero-ctas { display: flex; gap: 14px; flex-wrap: wrap; }

  /* ------------------------------ reveal utility -------------------------- */
  .rn-reveal { opacity: 0; transform: translateY(26px); transition: opacity .7s cubic-bezier(.2,.7,.3,1), transform .7s cubic-bezier(.2,.7,.3,1); }
  .rn-reveal.rn-visible { opacity: 1; transform: translateY(0); }

  /* -------------------------------- sections ------------------------------ */
  .rn-section { position: relative; padding: 96px 0; z-index: 1; }
  .rn-section-head { max-width: 620px; margin: 0 0 50px; }
  .rn-section-head.rn-center { margin-left: auto; margin-right: auto; text-align: center; }
  .rn-kicker { font-size: 11.5px; font-weight: 700; letter-spacing: 0.13em; text-transform: uppercase; color: var(--beam); margin-bottom: 14px; }
  .rn-h2 { font-family: 'Space Grotesk', sans-serif; font-size: clamp(25px, 3.1vw, 36px); font-weight: 700; letter-spacing: -0.01em; margin: 0 0 14px; }
  .rn-lead { font-size: 16px; color: var(--ash); margin: 0; }
  .rn-subhead { font-size: 11.5px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--ash-dim); margin: 0 0 18px; }

  .rn-page-header { position: relative; padding: 148px 0 58px; z-index: 1; text-align: center; overflow: hidden; }

  /* --------------------------------- cards -------------------------------- */
  .rn-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
  .rn-grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 18px; }
  .rn-card { background: linear-gradient(180deg, rgba(238,241,248,0.03), rgba(238,241,248,0.012)); border: 1px solid var(--border); border-radius: 14px; padding: 25px; transition: transform .3s ease, border-color .3s ease, background .3s ease; }
  .rn-card:hover { transform: translateY(-4px); border-color: rgba(77,99,255,0.35); background: linear-gradient(180deg, rgba(77,99,255,0.07), rgba(238,241,248,0.015)); }
  .rn-card-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; background: rgba(77,99,255,0.12); color: var(--beam); margin-bottom: 16px; transition: background .3s ease, transform .3s ease; flex-shrink: 0; }
  .rn-card:hover .rn-card-icon { background: linear-gradient(135deg, var(--beam), var(--rim)); color: var(--white); transform: scale(1.06); }
  .rn-card h3 { font-size: 16px; font-weight: 700; margin: 0 0 8px; letter-spacing: -0.01em; }
  .rn-card p { font-size: 14px; color: var(--ash); margin: 0; line-height: 1.6; }

  /* code + terminal */
  .rn-code { position: relative; background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 14px 46px 14px 16px; font-size: 12.5px; color: #cfd6ff; overflow-x: auto; white-space: pre; }
  .rn-copy-btn { position: absolute; top: 10px; right: 10px; width: 28px; height: 28px; border-radius: 7px; display: flex; align-items: center; justify-content: center; background: rgba(238,241,248,0.05); border: 1px solid var(--border); color: var(--ash); transition: color .2s ease, border-color .2s ease; }
  .rn-copy-btn:hover { color: var(--white); border-color: rgba(77,99,255,0.4); }

  .rn-term { background: rgba(16,20,31,0.88); border: 1px solid var(--border); border-radius: 14px; overflow: hidden; backdrop-filter: blur(10px); box-shadow: 0 30px 60px -20px rgba(0,0,0,0.6); }
  .rn-term-bar { display: flex; align-items: center; gap: 8px; padding: 12px 16px; border-bottom: 1px solid var(--border-soft); }
  .rn-term-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--ash-dim); opacity: 0.5; }
  .rn-term-title { margin-left: 8px; font-size: 12px; color: var(--ash-dim); }
  .rn-term-body { padding: 18px 20px; font-size: 13px; }
  .rn-term-prompt { color: var(--beam); margin-right: 8px; }

  .rn-split { display: grid; grid-template-columns: 1fr 1fr; gap: 52px; align-items: start; }

  /* workflow / steps */
  .rn-steps { display: flex; flex-direction: column; }
  .rn-step { display: grid; grid-template-columns: 52px 1fr; gap: 20px; padding: 28px 0; border-top: 1px solid var(--border-soft); }
  .rn-step:last-child { border-bottom: 1px solid var(--border-soft); }
  .rn-step-num { font-family: 'IBM Plex Mono', monospace; font-size: 12.5px; color: var(--beam); font-weight: 700; padding-top: 3px; }
  .rn-step h4 { margin: 0 0 6px; font-size: 15.5px; font-weight: 700; }
  .rn-step p { margin: 0 0 14px; font-size: 13.5px; color: var(--ash); max-width: 520px; }

  /* result preview */
  .rn-preview-frame { border: 1px solid var(--border); border-radius: 16px; padding: 40px; background: radial-gradient(circle at 50% 40%, rgba(77,99,255,0.08), transparent 70%); display: flex; flex-direction: column; align-items: center; gap: 18px; }
  .rn-preview-caption { font-size: 12.5px; color: var(--ash-dim); text-align: center; }

  /* examples */
  .rn-example-card { border: 1px solid var(--border); border-radius: 14px; padding: 24px; display: flex; flex-direction: column; gap: 14px; }
  .rn-example-card h3 { margin: 0; font-size: 15.5px; font-weight: 700; }
  .rn-example-card p { margin: 0; font-size: 13.5px; color: var(--ash); line-height: 1.6; }

  /* API explorer */
  .rn-api-shell { display: grid; grid-template-columns: 220px 1fr; gap: 40px; align-items: start; }
  .rn-api-nav { display: flex; flex-direction: column; gap: 2px; position: sticky; top: 96px; }
  .rn-api-nav-btn { display: flex; align-items: center; gap: 10px; text-align: left; padding: 10px 13px; border-radius: 8px; font-size: 13.5px; color: var(--ash); background: transparent; border: 1px solid transparent; }
  .rn-api-nav-btn:hover { color: var(--white); }
  .rn-api-nav-btn.active { color: var(--white); background: rgba(77,99,255,0.09); border-color: rgba(77,99,255,0.25); }
  .rn-api-panel { border: 1px solid var(--border); border-radius: 16px; padding: 36px; animation: panelIn .4s ease; }
  @keyframes panelIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
  .rn-api-panel h2 { font-family: 'IBM Plex Mono', monospace; font-size: 24px; margin: 0 0 16px; }
  .rn-api-panel > p.rn-lead { margin-bottom: 4px; }
  .rn-api-sub { font-size: 11px; letter-spacing: .1em; text-transform: uppercase; color: var(--ash-dim); margin: 30px 0 12px; font-weight: 700; }
  .rn-api-sub.first { margin-top: 0; }
  .rn-method-list { display: flex; flex-direction: column; gap: 14px; margin: 0; padding: 0; list-style: none; }
  .rn-method-list li { display: flex; flex-direction: column; gap: 3px; }
  .rn-method-sig { font-size: 13px; color: #cfd6ff; }
  .rn-method-body { font-size: 13.5px; color: var(--ash); }

  /* docs cards */
  .rn-docs-card { border: 1px solid var(--border); border-radius: 14px; padding: 22px; display: flex; align-items: flex-start; gap: 13px; background: transparent; font: inherit; color: inherit; text-align: left; width: 100%; }
  .rn-docs-card.clickable { transition: transform .25s ease, border-color .25s ease; }
  .rn-docs-card.clickable:hover { transform: translateY(-3px); border-color: rgba(77,99,255,0.35); }
  .rn-docs-card h3 { font-size: 14.5px; margin: 0 0 6px; font-weight: 700; }
  .rn-docs-card p { font-size: 13px; color: var(--ash); margin: 0; line-height: 1.55; }
  .rn-docs-arrow { margin-left: auto; color: var(--ash-dim); flex-shrink: 0; transition: transform .25s ease, color .25s ease; }
  .rn-docs-card.clickable:hover .rn-docs-arrow { color: var(--beam); transform: translate(3px,-3px); }

  /* final cta */
  .rn-cta-section { text-align: center; padding: 120px 0; position: relative; z-index: 1; overflow: hidden; }
  .rn-cta-section .rn-h2 { font-size: clamp(27px, 3.8vw, 42px); }
  .rn-cta-section .rn-lead { max-width: 480px; margin: 0 auto 38px; }
  .rn-cta-btns { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }

  /* footer */
  .rn-footer { border-top: 1px solid var(--border-soft); padding: 48px 0; position: relative; z-index: 1; }
  .rn-footer-inner { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 36px; }
  .rn-footer-tag { font-size: 12.5px; color: var(--ash-dim); }
  .rn-footer-cols { display: flex; gap: 50px; }
  .rn-footer-cols a { display: block; font-size: 13px; color: var(--ash); padding: 5px 0; }
  .rn-footer-cols a:hover { color: var(--white); }
  .rn-footer-col-title { font-size: 10.5px; letter-spacing: .08em; text-transform: uppercase; color: var(--ash-dim); margin-bottom: 10px; font-weight: 700; }

  /* -------------------------------- mobile -------------------------------- */
  @media (max-width: 880px) {
    .rn-hero-grid { grid-template-columns: 1fr; }
    .rn-split { grid-template-columns: 1fr; gap: 36px; }
    .rn-grid-3 { grid-template-columns: 1fr; }
    .rn-grid-2 { grid-template-columns: 1fr; }
    .rn-api-shell { grid-template-columns: 1fr; }
    .rn-api-nav { position: static; flex-direction: row; overflow-x: auto; gap: 6px; }
    .rn-nav-links { display: none; }
    .rn-nav-mobile-btn { display: flex; }
    .rn-hero { padding: 124px 0 74px; }
    .rn-section { padding: 68px 0; }
    .rn-page-header { padding: 122px 0 46px; }
  }
  @media (max-width: 560px) {
    .rn-shell { padding: 0 18px; }
    .rn-footer-cols { gap: 30px; }
    .rn-api-panel { padding: 24px; }
  }

  .rn-mobile-menu { position: fixed; inset: 66px 0 0 0; z-index: 39; background: rgba(10,13,22,0.97); backdrop-filter: blur(16px); display: flex; flex-direction: column; gap: 4px; padding: 24px; }
  .rn-mobile-menu a { font-size: 17px; padding: 14px 4px; border-bottom: 1px solid var(--border-soft); color: var(--white); }

  @media (prefers-reduced-motion: reduce) {
    .rn-root * { animation: none !important; transition: none !important; }
    .rn-reveal { opacity: 1 !important; transform: none !important; }
    .cube { transform: rotateX(-20deg) rotateY(35deg) !important; }
  }
`;

/* ==================================================================== */
/* Hooks + tiny shared utilities                                        */
/* ==================================================================== */
function useReveal(threshold = 0.18) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.unobserve(el);
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function Reveal({ as: Tag = "div", delay = 0, className = "", children, ...rest }) {
  const [ref, visible] = useReveal();
  return (
    <Tag
      ref={ref}
      className={`rn-reveal ${visible ? "rn-visible" : ""} ${className}`}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const onClick = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      /* clipboard unavailable — no-op */
    }
  };
  return (
    <button className="rn-copy-btn" onClick={onClick} aria-label="Copy code">
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  );
}

/* Tiny R/G/B axis gizmo — standard 3D-tool convention, used as a brand mark */
function AxesMark({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true">
      <line x1="10" y1="10" x2="18" y2="6" stroke="#ff5d5d" strokeWidth="2" strokeLinecap="round" />
      <line x1="10" y1="10" x2="10" y2="1" stroke="#5dff8f" strokeWidth="2" strokeLinecap="round" />
      <line x1="10" y1="10" x2="4" y2="17" stroke="#5d8fff" strokeWidth="2" strokeLinecap="round" />
      <circle cx="10" cy="10" r="2.2" fill="#eef1f8" />
    </svg>
  );
}

/* ==================================================================== */
/* Signature visual: a CSS-only rotating wireframe cube (echoes the      */
/* README's own rotating-cube example — stylized, not a live capture)   */
/* ==================================================================== */
function RotatingCube({ size = 160 }) {
  const half = size / 2;
  const faces = [
    { cls: "front", t: `translateZ(${half}px)` },
    { cls: "back", t: `translateZ(-${half}px) rotateY(180deg)` },
    { cls: "right", t: `rotateY(90deg) translateZ(${half}px)` },
    { cls: "left", t: `rotateY(-90deg) translateZ(${half}px)` },
    { cls: "top", t: `rotateX(90deg) translateZ(${half}px)` },
    { cls: "bottom", t: `rotateX(-90deg) translateZ(${half}px)` },
  ];
  return (
    <div className="cube-stage" style={{ width: size, height: size }}>
      <div className="cube" style={{ width: size, height: size }}>
        {faces.map((f) => (
          <div key={f.cls} className="cube-face" style={{ width: size, height: size, transform: f.t }} />
        ))}
      </div>
    </div>
  );
}

function FloatingGeometry() {
  const items = useMemo(
    () => [
      { top: "10%", left: "4%", size: 44, duration: 20, delay: 0 },
      { top: "66%", left: "8%", size: 28, duration: 25, delay: 3 },
      { top: "18%", right: "6%", size: 36, duration: 18, delay: 1 },
      { top: "72%", right: "12%", size: 52, duration: 23, delay: 2 },
      { top: "42%", left: "46%", size: 24, duration: 28, delay: 4 },
    ],
    []
  );
  return (
    <div className="floating-geo" aria-hidden="true">
      {items.map((it, i) => (
        <div
          key={i}
          className="floating-geo-item"
          style={{ top: it.top, left: it.left, right: it.right, animationDuration: `${it.duration}s`, animationDelay: `${it.delay}s` }}
        >
          <RotatingCube size={it.size} />
        </div>
      ))}
    </div>
  );
}

function AmbientGlow({ hero = false }) {
  return (
    <>
      <div className="glow-blob glow-beam" style={{ width: 460, height: 460, top: -110, left: "6%", animation: "floatA 17s ease-in-out infinite" }} aria-hidden="true" />
      <div className="glow-blob glow-rim" style={{ width: 400, height: 400, top: 30, right: "2%", animation: "floatB 20s ease-in-out infinite" }} aria-hidden="true" />
      {hero && <div className="grid-floor" aria-hidden="true" />}
      <FloatingGeometry />
    </>
  );
}

/* ==================================================================== */
/* Shared components: SectionHeading, PageHeader, FeatureCard, CodeBlock,*/
/* TerminalCard, ExampleCard                                            */
/* ==================================================================== */
function SectionHeading({ kicker, title, lead, center = false }) {
  return (
    <div className={`rn-section-head ${center ? "rn-center" : ""}`}>
      <div className="rn-kicker">{kicker}</div>
      <h2 className="rn-h2 rn-display">{title}</h2>
      {lead && <p className="rn-lead">{lead}</p>}
    </div>
  );
}

function PageHeader({ kicker, title, lead }) {
  return (
    <section className="rn-page-header">
      <AmbientGlow />
      <div className="rn-shell">
        <Reveal>
          <div className="rn-kicker" style={{ justifyContent: "center", display: "flex" }}>
            {kicker}
          </div>
          <h1 className="rn-h1 rn-display" style={{ fontSize: "clamp(28px,4.2vw,44px)" }}>
            {title}
          </h1>
          {lead && (
            <p className="rn-lead" style={{ maxWidth: 560, margin: "0 auto" }}>
              {lead}
            </p>
          )}
        </Reveal>
      </div>
    </section>
  );
}

function FeatureCard({ icon: Icon, title, body }) {
  return (
    <div className="rn-card">
      <div className="rn-card-icon">
        <Icon size={18} />
      </div>
      <h3>{title}</h3>
      <p>{body}</p>
    </div>
  );
}

function CodeBlock({ code }) {
  return (
    <div className="rn-code rn-mono">
      {code}
      <CopyButton text={code} />
    </div>
  );
}

function TerminalCard({ lines, title = "shell" }) {
  return (
    <div className="rn-term rn-mono">
      <div className="rn-term-bar">
        <span className="rn-term-dot" />
        <span className="rn-term-dot" />
        <span className="rn-term-dot" />
        <span className="rn-term-title">{title}</span>
      </div>
      <div className="rn-term-body">
        {lines.map((l, i) => (
          <div key={i}>
            <span className="rn-term-prompt">$</span>
            {l}
          </div>
        ))}
      </div>
    </div>
  );
}

function ExampleCard({ icon: Icon, title, body, code }) {
  return (
    <div className="rn-example-card">
      <div className="rn-card-icon">
        <Icon size={18} />
      </div>
      <h3>{title}</h3>
      <p>{body}</p>
      <CodeBlock code={code} />
    </div>
  );
}

/* ==================================================================== */
/* APIExplorer — sticky nav + detail panel, grounded in the real classes */
/* ==================================================================== */
const API_ITEMS = [
  {
    id: "renderer",
    label: "Renderer",
    icon: Cpu,
    overview:
      "The entry point. Wraps a WebGL2 context on a canvas and knows how to clear the screen, upload geometry to the GPU, and draw a scene from a camera's point of view. There's no separate Camera class — you build a plain mat4 with gl-matrix's mat4.perspective() and pass it straight into render(), so the math stays fully in your hands.",
    example: `const renderer = new Renderer(canvas);\nconst mesh = renderer.createMesh(Samples.cubeGeometry);`,
    methods: [
      { sig: "createMesh(geometry)", body: "Uploads a Geometry's data to the GPU and returns a Mesh." },
      { sig: "render(scene, camera)", body: "Draws every entity in a Scene using a camera matrix." },
      { sig: "clearCanvas(color)", body: "Clears the canvas to a solid color before the next frame." },
      { sig: "drawLines(entity, color)", body: "Draws an entity's mesh as a wireframe instead of filled triangles." },
      { sig: "createCubeMap(faces) / drawSkybox(camera)", body: "Loads a cubemap texture and renders it as a background environment." },
    ],
    relationships: "Every Scene needs a Renderer to become pixels. Meshes are created through the renderer, because that's what actually uploads geometry to the GPU.",
  },
  {
    id: "scene",
    label: "Scene",
    icon: Boxes,
    overview: "A flat list of entities — nothing more. No layers, no hierarchy, just what you want drawn this frame.",
    example: `const scene = new Scene();\nscene.add(cube);`,
    methods: [{ sig: "add(entity)", body: "Appends an entity to scene.entities." }],
    relationships: "Passed into renderer.render() alongside a camera matrix. Every entity in scene.entities gets drawn, in order.",
  },
  {
    id: "entity",
    label: "Entity",
    icon: Box,
    overview: "A single renderable thing — the combination of a mesh, a transform, and a material. Each entity gets a random numeric id when it's created.",
    example: `const cube = new Entity(\n  mesh,\n  new Transform({ position: vec3.fromValues(0, 0, -3) }),\n  new Material(vec3.fromValues(0.2, 0.3, 0.9)),\n);`,
    methods: [
      { sig: "clone()", body: "Creates a copy with an independent (deep-copied) transform, sharing the same GPU mesh." },
      { sig: "cloneLinked()", body: "Like clone(), but also shares the same material reference." },
      { sig: "get geometry", body: "Reads straight through to the entity's mesh.geometry." },
    ],
    relationships: "Added to a Scene with scene.add(). Its transform is read every frame by the Renderer to place it in the world.",
  },
  {
    id: "transform",
    label: "Transform",
    icon: Move,
    overview: "Position, rotation, and scale for an entity, expressed with gl-matrix's vec3 and quat. Converts to a 4x4 matrix on demand.",
    example: `const t = new Transform({ position: vec3.fromValues(0, 0, -3) });\nquat.rotateY(t.rotation, t.rotation, angle);`,
    methods: [
      { sig: "getMatrix()", body: "Builds a mat4 from the current position, rotation, and scale." },
      { sig: "clone()", body: "Returns an independent deep copy." },
    ],
    relationships: "Every Entity owns exactly one. The renderer calls getMatrix() each frame to place the entity in world space.",
  },
  {
    id: "material",
    label: "Material",
    icon: Palette,
    overview: "Currently just a color. Give an entity a vec3 and that's the color it renders in.",
    example: `new Material(vec3.fromValues(0.2, 0.3, 0.9))`,
    methods: [{ sig: "constructor(color: vec3)", body: "Defaults to white (1, 1, 1) if no color is given." }],
    relationships: "Read by the renderer when it draws an entity, and passed to the shader as a color uniform.",
  },
  {
    id: "mesh",
    label: "Mesh & Geometry",
    icon: Layers,
    overview:
      "Geometry is plain data — positions, and optionally normals, UVs, and indices, as typed arrays. A Mesh is what you get back after renderer.createMesh(geometry) uploads that data to the GPU.",
    example: `const mesh = renderer.createMesh(new Geometry(positions, normals));`,
    methods: [
      { sig: "new Geometry(positions, normals?, uvs?, indices?)", body: "Wraps raw vertex data in typed arrays." },
      { sig: "renderer.createMesh(geometry)", body: "The only way to get a Mesh — it lives on the GPU, not just in memory." },
    ],
    relationships: "Meshes are shared, not duplicated, when you call entity.clone() — cheap copies of the same GPU buffers with independent transforms.",
  },
  {
    id: "collision",
    label: "CollisionSystem",
    icon: Target,
    overview: "All-pairs collision detection between entities, using the GJK algorithm in 3D. Call update() with your entities each frame and read back which pairs are touching.",
    example: `const collisions = new CollisionSystem();\ncollisions.update(scene.entities);`,
    methods: [{ sig: "update(entities)", body: "Re-checks every pair and repopulates .collisions with { a, b } matches." }],
    relationships: "Independent of rendering — it reads each entity's geometry and transform to test shapes in world space.",
  },
];

function APIExplorer() {
  const [active, setActive] = useState(0);
  const current = API_ITEMS[active];
  return (
    <div className="rn-api-shell">
      <nav className="rn-api-nav" aria-label="API sections">
        {API_ITEMS.map((item, i) => (
          <button key={item.id} className={`rn-api-nav-btn ${active === i ? "active" : ""}`} onClick={() => setActive(i)}>
            <item.icon size={15} />
            {item.label}
          </button>
        ))}
      </nav>
      <div className="rn-api-panel" key={current.id}>
        <h2>{current.label}</h2>
        <p className="rn-lead">{current.overview}</p>

        <div className="rn-api-sub">Example Usage</div>
        <CodeBlock code={current.example} />

        <div className="rn-api-sub">Key Methods</div>
        <ul className="rn-method-list">
          {current.methods.map((m) => (
            <li key={m.sig}>
              <span className="rn-method-sig rn-mono">{m.sig}</span>
              <span className="rn-method-body">{m.body}</span>
            </li>
          ))}
        </ul>

        <div className="rn-api-sub">Relationships</div>
        <p className="rn-lead" style={{ fontSize: 14 }}>
          {current.relationships}
        </p>
      </div>
    </div>
  );
}

/* ==================================================================== */
/* TopNav + Footer + SiteLayout                                          */
/* ==================================================================== */
const NAV_ITEMS = [
  { id: "home", label: "Home", href: "/" },
  { id: "getting-started", label: "Getting Started", href: "/getting-started" },
  { id: "examples", label: "Examples", href: "/examples" },
  { id: "api-reference", label: "API Reference", href: "/api-reference" },
  { id: "docs", label: "Docs", href: "/docs" },
  { id: "showcase", label: "Showcase", href: "/showcase" },
];

function TopNav({ current, onNavigate }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (id) => (e) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(id);
    }
    setOpen(false);
  };

  return (
    <>
      <header className={`rn-nav ${scrolled ? "scrolled" : ""}`}>
        <div className="rn-shell rn-nav-inner">
          <a href="/" className="rn-logo rn-display" onClick={go("home")}>
            <AxesMark />
            renderer
          </a>
          <nav className="rn-nav-links" aria-label="Primary">
            {NAV_ITEMS.slice(1).map((l) => (
              <a key={l.id} href={l.href} className={`rn-nav-link ${current === l.id ? "active" : ""}`} onClick={go(l.id)}>
                {l.label}
              </a>
            ))}
          </nav>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="rn-nav-cta">
              <Github size={15} />
              GitHub
            </a>
            <button
              className="rn-nav-mobile-btn"
              style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 8, background: "transparent", color: "var(--white)" }}
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((o) => !o)}
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>
      {open && (
        <div className="rn-mobile-menu">
          {NAV_ITEMS.map((l) => (
            <a key={l.id} href={l.href} onClick={go(l.id)}>
              {l.label}
            </a>
          ))}
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>
            GitHub ↗
          </a>
        </div>
      )}
    </>
  );
}

function Footer({ onNavigate }) {
  const go = (id) => (e) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(id);
    }
  };
  return (
    <footer className="rn-footer">
      <div className="rn-shell rn-footer-inner">
        <div>
          <div className="rn-logo rn-display">
            <AxesMark />
            renderer
          </div>
          <p className="rn-footer-tag" style={{ marginTop: 8, maxWidth: 260 }}>
            A lightweight WebGL2 renderer for learning and experimentation.
          </p>
        </div>
        <div className="rn-footer-cols">
          <div>
            <div className="rn-footer-col-title">Site</div>
            {NAV_ITEMS.map((l) => (
              <a key={l.id} href={l.href} onClick={go(l.id)}>
                {l.label}
              </a>
            ))}
          </div>
          <div>
            <div className="rn-footer-col-title">Project</div>
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
              GitHub ↗
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SiteLayout({ current, onNavigate, children }) {
  return (
    <div className="rn-root">
      <style>{CSS}</style>
      <TopNav current={current} onNavigate={onNavigate} />
      <main key={current}>{children}</main>
      <Footer onNavigate={onNavigate} />
    </div>
  );
}

/* ==================================================================== */
/* PAGE: Home                                                            */
/* ==================================================================== */
function HeroSection({ onNavigate }) {
  return (
    <section className="rn-hero">
      <AmbientGlow hero />
      <div className="rn-shell rn-hero-grid">
        <div>
          <div className="rn-eyebrow-row rn-reveal rn-visible">
            <span className="rn-eyebrow">WEBGL2 · TYPESCRIPT</span>
            <span className="rn-eyebrow warn">
              <FlaskConical size={12} /> EXPERIMENTAL
            </span>
          </div>
          <h1 className="rn-h1 rn-display rn-reveal rn-visible" style={{ transitionDelay: "80ms" }}>
            Vertices in.
            <br />
            <span className="rn-grad">Pixels out.</span>
          </h1>
          <p className="rn-sub rn-reveal rn-visible" style={{ transitionDelay: "160ms" }}>
            A lightweight WebGL2 renderer for learning, experimenting, and building
            small 3D scenes — scenes, entities, transforms, and materials, with the
            essentials in about ten lines.
          </p>
          <div className="rn-hero-ctas rn-reveal rn-visible" style={{ transitionDelay: "240ms" }}>
            <a className="rn-btn rn-btn-red-star" target="_blank" href={PHYZZIX_DEMO_URL} rel="noopener noreferrer">
              Demo <PiArrowUpRightLight size={16} />
            </a>
            <button className="rn-btn rn-btn-primary" onClick={() => onNavigate && onNavigate("getting-started")}>
              Get Started <ArrowRight size={16} />
            </button>
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="rn-btn rn-btn-ghost">
              <Github size={16} /> View on GitHub
            </a>
          </div>
        </div>
        <Reveal delay={120}>
          <RotatingCube size={220} />
        </Reveal>
      </div>
    </section>
  );
}

const WHY_ITEMS = [
  { icon: Zap, title: "Lightweight", body: "A small class surface — Renderer, Scene, Entity, Transform, Material — nothing to configure before your first frame." },
  { icon: Code, title: "Simple API", body: "Compose a scene the same way you'd describe it: an entity has a mesh, a transform, and a material." },
  { icon: Rocket, title: "Fast setup", body: "Point it at a canvas and you're rendering. No build pipeline or asset compiler to stand up first." },
  { icon: Braces, title: "TypeScript support", body: "Written in TypeScript from the ground up, so your editor knows every class and method as you type." },
  { icon: GraduationCap, title: "Beginner friendly", body: "Small enough to read end to end — a good way to learn what a renderer actually does." },
  { icon: Cpu, title: "WebGL2 powered", body: "Built directly on the WebGL2 context, with no abstraction layer standing between you and the GPU." },
];

const FEATURE_HIGHLIGHTS = [
  { icon: Boxes, title: "Scenes & entities", body: "Compose a scene as a flat list of entities, each carrying its own mesh, transform, and material." },
  { icon: Move, title: "Transform system", body: "Position, rotation, and scale via gl-matrix's vec3 and quat, converted to a matrix on demand." },
  { icon: Palette, title: "Materials", body: "Give any entity a color and it renders in it — swap it at runtime whenever you want." },
  { icon: Layers, title: "Meshes & geometry", body: "Hand it raw positions, normals, UVs, and indices, and get back a GPU-ready mesh." },
  { icon: Target, title: "Collision detection", body: "Built-in GJK collision checks across every entity pair in a scene, with a single update() call." },
  { icon: Mountain, title: "Environment maps", body: "Load a cubemap and render it as a skybox behind your scene." },
];

function HomePage({ onNavigate }) {
  return (
    <>
      <HeroSection onNavigate={onNavigate} />

      <section className="rn-section">
        <div className="rn-shell">
          <Reveal>
            <SectionHeading kicker="Why This Library" title="Built to be read, not just used" lead="Every part of the API maps directly onto a concept you already understand: scenes, entities, transforms, materials." />
          </Reveal>
          <div className="rn-grid-3">
            {WHY_ITEMS.map((f, i) => (
              <Reveal key={f.title} delay={i * 55}>
                <FeatureCard icon={f.icon} title={f.title} body={f.body} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="rn-section" style={{ paddingTop: 0 }}>
        <div className="rn-shell">
          <Reveal>
            <SectionHeading kicker="Feature Highlights" title="What's actually in the box" lead="Straight from the exported API — nothing here is aspirational." />
          </Reveal>
          <div className="rn-grid-3">
            {FEATURE_HIGHLIGHTS.map((f, i) => (
              <Reveal key={f.title} delay={i * 55}>
                <FeatureCard icon={f.icon} title={f.title} body={f.body} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="rn-cta-section">
        <AmbientGlow />
        <div className="rn-shell">
          <Reveal>
            <div className="rn-kicker" style={{ justifyContent: "center", display: "flex" }}>
              Get Started
            </div>
            <h2 className="rn-h2 rn-display">Render your first scene.</h2>
            <p className="rn-lead">Install the library, follow the quick start, and watch a cube spin.</p>
            <div className="rn-cta-btns">
              <button className="rn-btn rn-btn-primary" onClick={() => onNavigate && onNavigate("getting-started")}>
                Getting Started <ArrowRight size={16} />
              </button>
              <button className="rn-btn rn-btn-ghost" onClick={() => onNavigate && onNavigate("docs")}>
                Documentation
              </button>
              <button className="rn-btn rn-btn-ghost" onClick={() => onNavigate && onNavigate("examples")}>
                Examples
              </button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

/* ==================================================================== */
/* PAGE: Getting Started                                                 */
/* ==================================================================== */
const IMPORTS_CODE = `import { Entity, Material, Renderer, Samples, Scene, Transform } from "renderer";\nimport { mat4, quat, vec3 } from "gl-matrix";`;

const FIRST_SCENE_STEPS = [
  {
    num: "01",
    title: "Create the renderer",
    body: "Point it at a canvas element. It grabs a WebGL2 context for you.",
    code: `const canvas = document.getElementById("canvas") as HTMLCanvasElement;\ncanvas.width = 16 * 80;\ncanvas.height = 9 * 80;\n\nconst render = new Renderer(canvas);`,
  },
  {
    num: "02",
    title: "Create a mesh",
    body: "Upload geometry to the GPU. Samples ships a cube preset so you can start without writing vertices yourself.",
    code: `const cubeMesh = render.createMesh(Samples.cubeGeometry);`,
  },
  {
    num: "03",
    title: "Create an entity",
    body: "Combine the mesh with a transform and a material — this is the thing that actually gets drawn.",
    code: `const cube = new Entity(\n  cubeMesh,\n  new Transform({ position: vec3.fromValues(0, 0, -3) }),\n  new Material(vec3.fromValues(0.2, 0.3, 0.9)),\n);`,
  },
  {
    num: "04",
    title: "Create a scene",
    body: "Scenes are just a list. Add whatever entities you want drawn this frame.",
    code: `const scene = new Scene();\nscene.add(cube);`,
  },
  {
    num: "05",
    title: "Set up a camera",
    body: "No Camera class to learn — build a projection matrix directly with gl-matrix.",
    code: `const camera = mat4.perspective(mat4.create(), Math.PI / 2, 16 / 9, 1e-3, 1e3);`,
  },
  {
    num: "06",
    title: "Render loop",
    body: "Update, clear, render, repeat.",
    code: `const angle = Math.PI / 180;\n\nconst loop = () => {\n  quat.rotateY(cube.transform.rotation, cube.transform.rotation, angle);\n  render.clearCanvas(vec3.fromValues(0x18 / 255, 0x18 / 255, 0x18 / 255));\n  render.render(scene, camera);\n\n  window.requestAnimationFrame(loop);\n};\n\nloop();`,
  },
];

function GettingStartedPage() {
  return (
    <>
      <PageHeader kicker="Getting Started" title="Get a cube on screen" lead="renderer is an experimental learning project — not yet meant for production use." />
      <section className="rn-section" style={{ paddingTop: 0 }}>
        <div className="rn-shell">
          <Reveal>
            <div className="rn-subhead">Installation</div>
          </Reveal>
          <Reveal delay={40} style={{ marginBottom: 60 }}>
            <TerminalCard title="terminal" lines={[INSTALL_CMD]} />
          </Reveal>

          <Reveal>
            <div className="rn-subhead">First Scene</div>
            <p className="rn-lead" style={{ marginBottom: 24 }}>
              Everything below is the actual quick-start from the README, broken into steps.
            </p>
          </Reveal>
          <Reveal delay={40} style={{ marginBottom: 8 }}>
            <CodeBlock code={IMPORTS_CODE} />
          </Reveal>

          <div className="rn-steps" style={{ marginTop: 30 }}>
            {FIRST_SCENE_STEPS.map((s, i) => (
              <Reveal key={s.num} delay={i * 60} className="rn-step" as="div">
                <div className="rn-step-num rn-mono">{s.num}</div>
                <div>
                  <h4>{s.title}</h4>
                  <p>{s.body}</p>
                  <CodeBlock code={s.code} />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="rn-section" style={{ paddingTop: 0 }}>
        <div className="rn-shell">
          <Reveal>
            <div className="rn-subhead">Result</div>
          </Reveal>
          <Reveal delay={40}>
            <div className="rn-preview-frame">
              <RotatingCube size={140} />
              <p className="rn-preview-caption">
                What you'll see: a blue cube, rotating in place.
                <br />
                Illustrative — not a live capture.
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

/* ==================================================================== */
/* PAGE: Examples                                                        */
/* ==================================================================== */
const EXAMPLES = [
  {
    icon: RotateCw,
    title: "Rotating cube",
    body: "Update an entity's rotation quaternion inside your render loop for continuous spin.",
    code: `quat.rotateY(cube.transform.rotation, cube.transform.rotation, angle);`,
  },
  {
    icon: Blocks,
    title: "Scene composition",
    body: "A Scene is just an array — add as many entities as you want drawn together.",
    code: `scene.add(cube);\nscene.add(secondEntity);`,
  },
  {
    icon: Move,
    title: "Transform animation",
    body: "Position, rotation, and scale are plain vectors — animate them however your loop wants.",
    code: `entity.transform.position[1] = Math.sin(t) * 2;`,
  },
  {
    icon: Palette,
    title: "Material color swaps",
    body: "Swap an entity's color at runtime by assigning a new Material.",
    code: `entity.material = new Material(vec3.fromValues(1, 0.4, 0.2));`,
  },
  {
    icon: Camera,
    title: "Camera control",
    body: "Camera is just a mat4 you build yourself — move it with gl-matrix's mat4.lookAt or mat4.translate.",
    code: `mat4.lookAt(view, eye, target, up);`,
  },
  {
    icon: Target,
    title: "Collision detection",
    body: "Run broad-phase GJK collision checks across every entity in a scene with one call.",
    code: `collisions.update(scene.entities);`,
  },
];

function ExamplesPage() {
  return (
    <>
      <PageHeader kicker="Examples" title="What you can build with it" lead="Small, focused patterns built entirely from the exported API." />
      <section className="rn-section" style={{ paddingTop: 0 }}>
        <div className="rn-shell">
          <div className="rn-grid-3">
            {EXAMPLES.map((ex, i) => (
              <Reveal key={ex.title} delay={i * 55}>
                <ExampleCard icon={ex.icon} title={ex.title} body={ex.body} code={ex.code} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

/* ==================================================================== */
/* PAGE: API Reference                                                   */
/* ==================================================================== */
function APIReferencePage() {
  return (
    <>
      <PageHeader kicker="API Reference" title="Every public class, explained" lead="Overview, usage, key methods, and how each piece fits into the rendering workflow." />
      <section className="rn-section" style={{ paddingTop: 0 }}>
        <div className="rn-shell">
          <APIExplorer />
        </div>
      </section>
    </>
  );
}

/* ==================================================================== */
/* PAGE: Documentation                                                   */
/* ==================================================================== */
const DOCS_START_HERE = [
  { icon: Rocket, title: "Getting Started", body: "Install the library and render your first scene.", to: "getting-started" },
  { icon: Boxes, title: "Examples", body: "Small, focused patterns built from the real API.", to: "examples" },
  { icon: Code, title: "API Reference", body: "Every exported class, its methods, and how they connect.", to: "api-reference" },
];

const DOCS_TOPICS = [
  { icon: Move, title: "Transforms explained", body: "How position, rotation, and scale become a matrix each frame." },
  { icon: Palette, title: "Working with materials", body: "What a Material actually controls today, and how to change it." },
  { icon: RotateCw, title: "Building a render loop", body: "The update → clear → render → repeat pattern used throughout the docs." },
];

function DocumentationPage({ onNavigate }) {
  return (
    <>
      <PageHeader kicker="Documentation" title="Everything you need to start rendering" lead="Not full docs yet — just the fastest way to find what you need." />
      <section className="rn-section" style={{ paddingTop: 0 }}>
        <div className="rn-shell">
          <Reveal>
            <div className="rn-subhead">Start here</div>
          </Reveal>
          <div className="rn-grid-3" style={{ marginBottom: 60 }}>
            {DOCS_START_HERE.map((c, i) => (
              <Reveal key={c.title} delay={i * 55}>
                <button className="rn-docs-card clickable" onClick={() => onNavigate && onNavigate(c.to)}>
                  <div className="rn-card-icon">
                    <c.icon size={17} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3>{c.title}</h3>
                    <p>{c.body}</p>
                  </div>
                  <ArrowUpRight size={16} className="rn-docs-arrow" />
                </button>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <div className="rn-subhead">Popular topics</div>
          </Reveal>
          <div className="rn-grid-3">
            {DOCS_TOPICS.map((c, i) => (
              <Reveal key={c.title} delay={i * 55}>
                <div className="rn-docs-card">
                  <div className="rn-card-icon">
                    <c.icon size={17} />
                  </div>
                  <div>
                    <h3>{c.title}</h3>
                    <p>{c.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

/* ==================================================================== */
/* PAGE: Showcase                                                        */
/* ==================================================================== */
const SHOWCASE_ITEMS = [
  { icon: GraduationCap, title: "Learning graphics programming", body: "A small enough API to read end to end while you learn what a renderer is actually doing." },
  { icon: LayoutGrid, title: "Interactive visualizations", body: "Turn data into shapes, positions, and colors you can move around in real time." },
  { icon: BookOpen, title: "Educational projects", body: "Course material and tutorials that need a renderer simple enough to explain in one sitting." },
  { icon: Gamepad2, title: "Small games", body: "Simple 3D prototypes and game jam experiments where setup time matters more than features." },
  { icon: FlaskConical, title: "Prototypes", body: "Try an idea in an afternoon before committing to a heavier engine." },
  { icon: Sparkles, title: "Creative coding", body: "Generative and experimental visuals built directly on top of scenes, entities, and transforms." },
];

function ShowcasePage({ onNavigate }) {
  return (
    <>
      <PageHeader kicker="Showcase" title="What people build with it" lead="renderer is built for learning and experimentation — this is where it fits best." />
      <section className="rn-section" style={{ paddingTop: 0 }}>
        <div className="rn-shell">
          <div className="rn-grid-3">
            {SHOWCASE_ITEMS.map((s, i) => (
              <Reveal key={s.title} delay={i * 55}>
                <FeatureCard icon={s.icon} title={s.title} body={s.body} />
              </Reveal>
            ))}
          </div>
          <Reveal delay={90}>
            <div style={{ textAlign: "center", marginTop: 60 }}>
              <button className="rn-btn rn-btn-primary" onClick={() => onNavigate && onNavigate("getting-started")}>
                Get Started <ArrowRight size={16} />
              </button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

/* ==================================================================== */
/* Default export — live preview shell (fakes routing with local state)  */
/* ==================================================================== */
export default function RendererSite() {
  const [page, setPage] = useState("home");

  const renderPage = () => {
    switch (page) {
      case "getting-started":
        return <GettingStartedPage />;
      case "examples":
        return <ExamplesPage />;
      case "api-reference":
        return <APIReferencePage />;
      case "docs":
        return <DocumentationPage onNavigate={setPage} />;
      case "showcase":
        return <ShowcasePage onNavigate={setPage} />;
      default:
        return <HomePage onNavigate={setPage} />;
    }
  };

  return (
    <SiteLayout current={page} onNavigate={setPage}>
      {renderPage()}
    </SiteLayout>
  );
}

export {
  SiteLayout,
  HomePage,
  GettingStartedPage,
  ExamplesPage,
  APIReferencePage,
  DocumentationPage,
  ShowcasePage,
  TopNav,
  Footer,
  SectionHeading,
  PageHeader,
  FeatureCard,
  CodeBlock,
  TerminalCard,
  ExampleCard,
  APIExplorer,
  RotatingCube,
  FloatingGeometry,
};