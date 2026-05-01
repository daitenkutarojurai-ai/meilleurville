"use client";

import { useEffect, useRef } from "react";

/**
 * MeshGradient — animated WebGL mesh gradient (4 drifting color blobs blended
 * with a fractional Brownian noise field). Falls back to CSS radial gradients
 * if WebGL is unavailable. Honors prefers-reduced-motion (renders one static
 * frame).
 *
 * Tuned for the meilleurville cream + grass-green + amber + pink palette.
 */
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

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

        // Tiny grain
        float g = h(uv * uRes.xy + t * 60.0);
        col += (g - 0.5) * 0.020;

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

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    function resize() {
      if (!canvas) return;
      const w = Math.floor(canvas.clientWidth * dpr);
      const h = Math.floor(canvas.clientHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl!.viewport(0, 0, w, h);
        gl!.uniform2f(uRes, w, h);
      }
    }

    let raf = 0;
    let visible = true;
    const onVis = () => {
      visible = document.visibilityState === "visible";
      if (visible) loop(performance.now());
    };
    document.addEventListener("visibilitychange", onVis);

    const start = performance.now();
    function loop(now: number) {
      resize();
      const t = (now - start) / 1000;
      gl!.uniform1f(uT, t);
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
      if (!reduced && visible) raf = requestAnimationFrame(loop);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    if (reduced) {
      resize();
      gl.uniform1f(uT, 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    } else {
      loop(start);
    }

    return () => {
      cancelAnimationFrame(raf);
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
