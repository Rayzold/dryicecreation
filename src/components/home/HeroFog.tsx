"use client";

import dynamic from "next/dynamic";

// WebGL fluid smoke from React Bits. Client-only; the static CSS fog underneath
// stays visible if WebGL2 is unavailable.
const LiquidEther = dynamic(() => import("@/components/reactbits/LiquidEther"), { ssr: false });

export function HeroFog() {
  return (
    <div className="absolute inset-0" aria-hidden="true">
      <div className="fog-static absolute inset-0" />
      <LiquidEther
        colors={["#16354a", "#8fb8c9", "#eaf5f9"]}
        intensity={1.1}
        mouseForce={18}
        cursorSize={110}
        persistence={0.82}
        viscosity={0.15}
        resolution={0.45}
        autoDemo
        autoSpeed={0.35}
        autoIntensity={1.8}
        clickBurst={false}
        className="absolute inset-0 opacity-90"
      />
    </div>
  );
}
