import Image from "next/image";
import { cn } from "@/lib/utils";

const LOGO_SRC = "/newcastle-logo.png";
const FULL_ASPECT = 1.6;

export function NewcastleEmblem({
  size = 56,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src={LOGO_SRC}
      alt="Newcastle Financial Services"
      width={size}
      height={size}
      priority
      unoptimized
      className={cn("object-cover object-left", className)}
    />
  );
}

export function NewcastleLogoFull({
  className,
  size = 68,
}: {
  className?: string;
  size?: number;
}) {
  const width = Math.round(size * FULL_ASPECT);
  return (
    <Image
      src={LOGO_SRC}
      alt="Newcastle Financial Services"
      width={width}
      height={size}
      priority
      unoptimized
      className={cn("object-contain", className)}
    />
  );
}
