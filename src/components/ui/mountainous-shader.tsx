"use client";

import React, { FC, useRef, useEffect, useState } from "react";

export interface FractalMountainProps {
  /** Animation speed multiplier */
  speed?: number;
  /** Number of FBM octaves */
  octaves?: number;
  /** Noise frequency scale */
  scale?: number;
  /** Canvas container CSS class */
  className?: string;
  /** Accessible label */
  ariaLabel?: string;
}

const vsSource = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const fsSource = `
  precision highp float;

  uniform vec2 iResolution;
  uniform float iTime;
  uniform float u_speed;
  uniform float u_octaves;
  uniform float u_scale;

  // Hash & noise functions
  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p) * fract(p) * (3.0 - 2.0 * fract(p));
    float a = hash(i + vec2(0.0, 0.0));
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  // Fractal Brownian Motion
  float fbm(vec2 p) {
    float v = 0.0;
    float amp = 0.5;
    float freq = u_scale;
    // Loop must have constant bounds in WebGL 1.0
    for (int i = 0; i < 6; i++) {
      if (float(i) >= u_octaves) break;
      v += amp * noise(p * freq);
      freq *= 2.0;
      amp *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = (2.0 * gl_FragCoord.xy - iResolution) / iResolution.y;
    uv.x += iTime * u_speed * 0.2;

    // Landscape height
    float h = fbm(uv * 1.5);

    // Enhanced red sky gradient - deeper, richer reds
    vec3 sky = mix(
      vec3(0.15, 0.0, 0.25),        // Deep purple-red at bottom
      vec3(0.8, 0.05, 0.0),         // Intense red at top
      uv.y + 0.5
    );

    // Mountain silhouette with subtle red tint
    float m = smoothstep(h - 0.01, h, uv.y + 0.2);
    vec3 mountain = vec3(0.08, 0.02, 0.12) * (1.0 - h);

    vec3 color = mix(sky, mountain, m);

    // Enhanced sun glow - more red/orange
    vec2 sunPos = vec2(0.0, 0.25);
    float dist = length(uv - sunPos);
    vec3 sun = vec3(1.0, 0.3, 0.1) * (0.15 / dist);
    color += sun;

    // Atmospheric fog with red tint
    color = mix(color, sky, smoothstep(0.3, 1.5, uv.y + h));

    // Fade to black at the bottom for seamless transition
    // Fixed logic: smoothstep(min, max, val) -> 0.0 when val < min, 1.0 when val > max
    // We want 0.0 (black) at the very bottom (-1.0) and 1.0 (color) higher up.
    float fadeEdge0 = -0.9;
    float fadeEdge1 = -0.4;
    float fade = smoothstep(fadeEdge0, fadeEdge1, uv.y);
    
    // Mix black (0.0) with color based on fade factor
    color = mix(vec3(0.0), color, fade);

    gl_FragColor = vec4(color, 1.0);
  }
`;

const FractalMountains: FC<FractalMountainProps> = ({
  speed = 1,
  octaves = 5,
  scale = 2,
  className = "",
  ariaLabel = "Procedural fractal mountains background",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  // Use a ref to store props so we don't re-init WebGL when they change
  const propsRef = useRef({ speed, octaves, scale });

  useEffect(() => {
    propsRef.current = { speed, octaves, scale };
  }, [speed, octaves, scale]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
      powerPreference: "high-performance",
    });

    if (!gl) {
      setError("WebGL not supported in this browser.");
      return;
    }

    // Shader compile helper
    const compileShader = (type: GLenum, src: string) => {
      const sh = gl.createShader(type);
      if (!sh) return null;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        console.error("Shader compile error:", gl.getShaderInfoLog(sh));
        gl.deleteShader(sh);
        return null;
      }
      return sh;
    };

    // Compile VS and FS
    const vs = compileShader(gl.VERTEX_SHADER, vsSource);
    const fs = compileShader(gl.FRAGMENT_SHADER, fsSource);

    if (!vs || !fs) {
      setError("Shader initialization failed.");
      return;
    }

    // Link program
    const program = gl.createProgram();
    if (!program) return;

    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program link error:", gl.getProgramInfoLog(program));
      setError("Program initialization failed.");
      return;
    }

    // Look up attribute & uniforms
    const posLoc = gl.getAttribLocation(program, "a_position");
    const resLoc = gl.getUniformLocation(program, "iResolution");
    const timeLoc = gl.getUniformLocation(program, "iTime");
    const speedLoc = gl.getUniformLocation(program, "u_speed");
    const octLoc = gl.getUniformLocation(program, "u_octaves");
    const scaleLoc = gl.getUniformLocation(program, "u_scale");

    // Full‐screen quad
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, 1, 1, 1, -1, -1, 1, -1]),
      gl.STATIC_DRAW
    );

    let animationFrameId: number;
    const startTime = Date.now();

    // Render loop
    const render = () => {
      const now = (Date.now() - startTime) * 0.001;
      const { speed, octaves, scale } = propsRef.current;

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(program);

      gl.enableVertexAttribArray(posLoc);
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

      gl.uniform2f(resLoc, canvas.width, canvas.height);
      gl.uniform1f(timeLoc, now);
      gl.uniform1f(speedLoc, speed);
      gl.uniform1f(octLoc, octaves);
      gl.uniform1f(scaleLoc, scale);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animationFrameId = requestAnimationFrame(render);
    };

    // Resize Observer handles size changes more reliably than window resize
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // Cap DPR at 2 for performance, unless on very high end devices
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const width = entry.contentRect.width;
        const height = entry.contentRect.height;

        if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
          canvas.width = width * dpr;
          canvas.height = height * dpr;
        }
      }
    });

    resizeObserver.observe(container);

    // Start loop
    render();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();

      // WebGL Cleanup to prevent memory leaks in strict mode
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buf);
    };
  }, []); // Empty dependency array ensures we only initialize WebGL once

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label={ariaLabel}
      className={`fixed top-0 left-0 w-full h-screen overflow-hidden pointer-events-none ${className}`}
    >
      {error && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center text-white font-mono p-4">
          {error}
        </div>
      )}
      <canvas ref={canvasRef} className="block w-full h-full" />

      {/* Black fade overlay at bottom for seamless transition to page content */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" />
    </div>
  );
};

export default FractalMountains;