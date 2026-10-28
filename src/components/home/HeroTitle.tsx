"use client";

import BlurText from "@/components/reactbits/BlurText";

// The page's one orchestrated motion moment: the headline condenses out of the fog.
export function HeroTitle({ text }: { text: string }) {
  return (
    <h1 className="display max-w-[16ch] text-[2.75rem] text-frost sm:text-[4rem] lg:text-[5.4rem]">
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        <BlurText text={text} animateBy="words" direction="bottom" delay={90} stepDuration={0.45} blur={14} trigger="load" className="inline" />
      </span>
    </h1>
  );
}
