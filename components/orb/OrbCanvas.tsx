"use client";

import { useRef, useState, type MutableRefObject } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { cn } from "@/lib/utils";

export type OrbState = "idle" | "speaking" | "listening" | "thinking";

type Props = {
  state?: OrbState;
  signalRef?: MutableRefObject<number>;
  className?: string;
};

const STATE_LABELS: Record<OrbState, string> = {
  idle: "Athena is present",
  listening: "Athena is listening",
  thinking: "Athena is thinking",
  speaking: "Athena is speaking",
};

const STATE_MOTION: Record<
  OrbState,
  { scale: number; drift: number; energy: number; playbackRate: number }
> = {
  idle: { scale: 0.94, drift: 1.2, energy: 0.22, playbackRate: 0.72 },
  listening: { scale: 1.01, drift: 2.4, energy: 0.5, playbackRate: 0.9 },
  thinking: { scale: 0.97, drift: 4.8, energy: 0.42, playbackRate: 1.16 },
  speaking: { scale: 1.04, drift: 3.4, energy: 0.86, playbackRate: 1.32 },
};

const FIELD_ASPECT = [0.78, 0.9, 0.68];

export default function OrbCanvas({
  state = "idle",
  signalRef,
  className,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const entityRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const fieldARef = useRef<HTMLSpanElement>(null);
  const fieldBRef = useRef<HTMLSpanElement>(null);
  const fieldCRef = useRef<HTMLSpanElement>(null);
  const [mediaFailed, setMediaFailed] = useState(false);

  useGSAP(
    () => {
      const root = rootRef.current;
      const entity = entityRef.current;
      const video = videoRef.current;
      const glow = glowRef.current;
      const fields = [
        fieldARef.current,
        fieldBRef.current,
        fieldCRef.current,
      ].filter((field): field is HTMLSpanElement => Boolean(field));

      if (!root || !entity || !glow || fields.length !== 3) return;

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const finePointer = window.matchMedia(
        "(hover: hover) and (pointer: fine)",
      ).matches;
      const motion = STATE_MOTION[state];

      if (reduceMotion) {
        video?.pause();
        gsap.set(entity, { scale: 0.98, x: 0, y: 0, rotation: 0 });
        gsap.set(glow, { scale: 1, opacity: 0.42 });
        gsap.set(fields, { scale: 1, rotation: 0, opacity: 0.36 });
        return;
      }

      if (video) {
        video.playbackRate = motion.playbackRate;
        video.play().catch(() => undefined);
      }

      const moveX = gsap.quickTo(entity, "x", {
        duration: 0.75,
        ease: "power3.out",
      });
      const moveY = gsap.quickTo(entity, "y", {
        duration: 0.75,
        ease: "power3.out",
      });
      const scaleX = gsap.quickTo(entity, "scaleX", {
        duration: 0.22,
        ease: "power2.out",
      });
      const scaleY = gsap.quickTo(entity, "scaleY", {
        duration: 0.28,
        ease: "power2.out",
      });
      const rotate = gsap.quickTo(entity, "rotation", {
        duration: 0.65,
        ease: "power3.out",
      });
      const glowScale = gsap.quickTo(glow, "scale", {
        duration: 0.32,
        ease: "power2.out",
      });
      const glowOpacity = gsap.quickTo(glow, "opacity", {
        duration: 0.28,
        ease: "power2.out",
      });
      const fieldScales = fields.map((field) => ({
        x: gsap.quickTo(field, "scaleX", {
          duration: 0.38,
          ease: "power2.out",
        }),
        y: gsap.quickTo(field, "scaleY", {
          duration: 0.38,
          ease: "power2.out",
        }),
      }));
      const fieldOpacity = fields.map((field) =>
        gsap.quickTo(field, "opacity", {
          duration: 0.3,
          ease: "power2.out",
        }),
      );

      const fieldLoops = [
        gsap.to(fields[0], {
          rotation: 360,
          duration: state === "thinking" ? 7 : 18,
          repeat: -1,
          ease: "none",
        }),
        gsap.to(fields[1], {
          rotation: -360,
          duration: state === "speaking" ? 9 : 24,
          repeat: -1,
          ease: "none",
        }),
        gsap.to(fields[2], {
          rotation: 360,
          duration: state === "listening" ? 14 : 30,
          repeat: -1,
          ease: "none",
        }),
      ];

      let animationFrame = 0;
      let smoothedEnergy = motion.energy;

      const animate = () => {
        const liveSignal = gsap.utils.clamp(0, 1, signalRef?.current ?? 0);
        const followsSpeech = state === "speaking" || state === "listening";
        const targetEnergy = followsSpeech
          ? Math.max(motion.energy * 0.28, liveSignal)
          : motion.energy + 0.08 * Math.sin(performance.now() * 0.0014);

        smoothedEnergy +=
          (targetEnergy - smoothedEnergy) * (followsSpeech ? 0.2 : 0.06);

        const energy = gsap.utils.clamp(0, 1, smoothedEnergy);
        const time = performance.now() * 0.001;

        scaleX(motion.scale + 0.075 * energy);
        scaleY(motion.scale + 0.035 * energy);
        rotate(Math.sin(time * motion.drift) * (1.2 + 2.6 * energy));
        glowScale(0.92 + 0.22 * energy);
        glowOpacity(0.26 + 0.5 * energy);

        fieldScales.forEach((field, index) => {
          const scale = 0.92 + 0.035 * index + energy * (0.12 + 0.045 * index);
          field.x(scale);
          field.y(scale * FIELD_ASPECT[index]);
        });
        fieldOpacity.forEach((opacity, index) => {
          opacity(0.16 + energy * (0.38 - 0.055 * index));
        });

        if (video) {
          video.playbackRate = gsap.utils.clamp(
            0.6,
            1.5,
            motion.playbackRate + (followsSpeech ? 0.16 * energy : 0),
          );
        }

        animationFrame = requestAnimationFrame(animate);
      };

      const handlePointerMove = (event: PointerEvent) => {
        if (!finePointer) return;
        const bounds = root.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;
        moveX(x * 15);
        moveY(y * 11);
      };
      const handlePointerLeave = () => {
        moveX(0);
        moveY(0);
      };
      const handleVisibility = () => {
        if (!video) return;
        if (document.hidden) video.pause();
        else video.play().catch(() => undefined);
      };

      root.addEventListener("pointermove", handlePointerMove);
      root.addEventListener("pointerleave", handlePointerLeave);
      document.addEventListener("visibilitychange", handleVisibility);
      animationFrame = requestAnimationFrame(animate);

      return () => {
        cancelAnimationFrame(animationFrame);
        fieldLoops.forEach((loop) => loop.kill());
        root.removeEventListener("pointermove", handlePointerMove);
        root.removeEventListener("pointerleave", handlePointerLeave);
        document.removeEventListener("visibilitychange", handleVisibility);
      };
    },
    {
      scope: rootRef,
      dependencies: [state, signalRef, mediaFailed],
      revertOnUpdate: true,
    },
  );

  return (
    <div
      ref={rootRef}
      className={cn("athena-entity", className)}
      data-state={state}
      role="img"
      aria-label={STATE_LABELS[state]}
    >
      <div ref={glowRef} className="athena-entity__glow" aria-hidden="true" />
      <span
        ref={fieldARef}
        className="athena-entity__field athena-entity__field-a"
        aria-hidden="true"
      />
      <span
        ref={fieldBRef}
        className="athena-entity__field athena-entity__field-b"
        aria-hidden="true"
      />
      <span
        ref={fieldCRef}
        className="athena-entity__field athena-entity__field-c"
        aria-hidden="true"
      />

      <div ref={entityRef} className="athena-entity__body" aria-hidden="true">
        {mediaFailed ? (
          <div className="athena-entity__fallback" />
        ) : (
          <video
            ref={videoRef}
            className="athena-entity__video"
            src="/athena-orb-entity.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            disablePictureInPicture
            onError={() => setMediaFailed(true)}
          />
        )}
        <div className="athena-entity__sheen" />
      </div>

      <span className="sr-only" aria-live="polite">
        {STATE_LABELS[state]}
      </span>
    </div>
  );
}
