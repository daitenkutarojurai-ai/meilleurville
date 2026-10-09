"use client";

import { useEffect, useRef } from "react";

/**
 * MeshGradient — animated WebGL mesh gradient (4 drifting color blobs blended
 * with a fractional Brownian noise field). Falls back to CSS radial gradients
 * if WebGL is unavailable. Honors prefers-reduced-motion (renders one static
 * frame).
 *
 * Tuned for the meilleurville cream + grass-green + amber + pink palette.
 *
 * Budget (audit 2026-10-09). Mounted behind ~80 page templates via
 * AmbientBackground, this used to shade every device pixel (DPR up to 2) with a
 * 5-octave fbm, 60 times a second, for as long as the tab stayed open — the
 * single largest main-thread/GPU cost Lighthouse found on mobile (home: 4.9 s
 * TBT, 27 s of main-thread work). The picture is soft and its motion slow (a
 * blob drifts over ~2 minutes), so none of that was visible:
 *  • RENDER_SCALE: the canvas is drawn at a fraction of its CSS size and
 *    upscaled by the browser — the gradient has no detail to lose;
 *  • FRAME_MS: ~15 fps is indistinguishable from 60 at this speed;
 *  • the first frame waits for idle time, so it never competes with the
 *    page's own load and hydration;
 *  • small screens, Data Saver and low-core devices get one static frame.
 * The pixel-level grain the shader used to add is gone with the resolution
 * drop (it would turn into blotches); the CSS `.grain` overlay provides it.
 */
const RENDER_SCALE = 0.35;
const FRAME_MS = 1000 / 15;

function shouldAnimate(): boolean {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  if (window.matchMedia("(max-width: 767px)").matches) return false;
  const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
  if (nav.connection?.saveData) return false;
  if ((navigator.hardwareConcurrency ?? 8) <= 4) return false;
  return true;
}

function whenIdle(cb: () => void): () => void {
  const w = window as Window & {
    requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
    cancelIdleCallback?: (id: number) => void;
  };
  if (w.requestIdleCallback) {
    const id = w.requestIdleCallback(cb, { timeout: 2500 });
    return () => w.cancelIdleCallback?.(id);
  }
  const id = window.setTimeout(cb, 1200);
  return () => window.clearTimeout(id);
}
export function MeshGradient({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fallbackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: false, premultipliedAlpha: true });
    if (!gl) {
      // Reveal CSS fallback
      if (fallbackRef.current) fallbackRef.current.style.opacity = "1";
      return;
    }

    const animate = shouldAnimate();

    const vert = `
      attribute vec2 a;
      varying vec2 v;
      void main() {
        v = a * 0.5 + 0.5;
        gl_Position = vec4(a, 0.0, 1.0);
      }
    `;

    const frag = `
      precision highp float;
      varying vec2 v;
      uniform vec2  uRes;
      uniform float uT;

      // hash + value noise
      float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float n(vec2 p){
        vec2 i = floor(p), f = fract(p);
        float a = h(i), b = h(i + vec2(1.0, 0.0));
        float c = h(i + vec2(0.0, 1.0)), d = h(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
      }
      float fbm(vec2 p){
        float s = 0.0, a = 0.5;
        for (int i = 0; i < 5; i++){ s += a * n(p); p *= 2.02; a *= 0.5; }
        return s;
      }

      // soft blob with smooth falloff
      float blob(vec2 p, vec2 c, float r){
        float d = length(p - c);
        return smoothstep(r, 0.0, d);
      }

      void main(){
        vec2 uv = v;
        float ar = uRes.x / max(uRes.y, 1.0);
        vec2 p = uv;
        p.x *= ar;

        float t = uT * 0.05;

        // Drifting blob centers
        vec2 c1 = vec2(0.18 * ar + 0.12 * sin(t * 1.1),       0.18 + 0.10 * cos(t * 0.9));
        vec2 c2 = vec2(0.78 * ar + 0.10 * cos(t * 0.7 + 1.0), 0.22 + 0.12 * sin(t * 1.3));
        vec2 c3 = vec2(0.30 * ar + 0.15 * sin(t * 0.6 + 2.0), 0.78 + 0.10 * cos(t * 0.8));
        vec2 c4 = vec2(0.82 * ar + 0.10 * cos(t * 1.2 + 3.0), 0.74 + 0.14 * sin(t * 0.5));

        // Distort domain with noise — gives the painterly mesh look
        float warp = fbm(p * 1.4 + t * 0.3);
        p += (warp - 0.5) * 0.18;

        float b1 = blob(p, c1, 0.55);
        float b2 = blob(p, c2, 0.50);
        float b3 = blob(p, c3, 0.55);
        float b4 = blob(p, c4, 0.45);

        // Brand palette in linear-ish RGB
        vec3 cream  = vec3(0.980, 0.984, 0.957); // bg-canvas
        vec3 mint   = vec3(0.500, 0.847, 0.529); // grass green soft
        vec3 amber  = vec3(0.961, 0.620, 0.043); // warm
        vec3 lime   = vec3(0.700, 0.870, 0.300); // lime
        vec3 pink   = vec3(0.925, 0.482, 0.741); // pink

        vec3 col = cream;
        col = mix(col, mint,  b1 * 0.55);
        col = mix(col, amber, b2 * 0.40);
        col = mix(col, lime,  b3 * 0.50);
        col = mix(col, pink,  b4 * 0.30);

        // Subtle vignette
        float vig = smoothstep(1.20, 0.30, length(uv - 0.5));
        col *= mix(0.92, 1.02, vig);

        gl_FragColor = vec4(col, 1.0);
      }
    `;

    function compile(src: string, type: number): WebGLShader | null {
      const sh = gl!.createShader(type);
      if (!sh) return null;
      gl!.shaderSource(sh, src);
      gl!.compileShader(sh);
      if (!gl!.getShaderParameter(sh, gl!.COMPILE_STATUS)) {
        // Fail silently → CSS fallback shows
        gl!.deleteShader(sh);
        return null;
      }
      return sh;
    }

    const vs = compile(vert, gl.VERTEX_SHADER);
    const fs = compile(frag, gl.FRAGMENT_SHADER);
    if (!vs || !fs) {
      if (fallbackRef.current) fallbackRef.current.style.opacity = "1";
      return;
    }
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );
    const aLoc = gl.getAttribLocation(prog, "a");
    gl.enableVertexAttribArray(aLoc);
    gl.vertexAttribPointer(aLoc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "uRes");
    const uT = gl.getUniformLocation(prog, "uT");

    function resize(): boolean {
      if (!canvas) return false;
      const w = Math.max(1, Math.floor(canvas.clientWidth * RENDER_SCALE));
      const h = Math.max(1, Math.floor(canvas.clientHeight * RENDER_SCALE));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl!.viewport(0, 0, w, h);
        gl!.uniform2f(uRes, w, h);
        return true;
      }
      return false;
    }

    let raf = 0;
    let started = false;
    let visible = document.visibilityState === "visible";
    let last = -Infinity;
    const start = performance.now();

    function draw(now: number) {
      gl!.uniform1f(uT, (now - start) / 1000);
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
    }

    function loop(now: number) {
      raf = 0;
      if (!visible) return;
      if (now - last >= FRAME_MS) {
        last = now;
        resize();
        draw(now);
      }
      raf = requestAnimationFrame(loop);
    }

    const onVis = () => {
      visible = document.visibilityState === "visible";
      if (visible && started && animate && !raf) raf = requestAnimationFrame(loop);
    };
    document.addEventListener("visibilitychange", onVis);

    // A static canvas only needs a redraw when its size changes.
    const ro = new ResizeObserver(() => {
      if (started && resize() && !animate) draw(performance.now());
    });
    ro.observe(canvas);

    const cancelIdle = whenIdle(() => {
      started = true;
      // Force the first resize to run (and set uRes) even if the canvas
      // already happens to have the target size.
      canvas.width = 0;
      resize();
      draw(performance.now());
      if (animate && visible) raf = requestAnimationFrame(loop);
    });

    return () => {
      cancelIdle();
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buf);
    };
  }, []);

  return (
    <div className={`relative w-full h-full ${className}`} aria-hidden>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <div
        ref={fallbackRef}
        className="absolute inset-0 bg-aurora"
        style={{ opacity: 0, transition: "opacity 0.4s" }}
      />
    </div>
  );
}
