import Image from "next/image";

interface NovaLogoProps {
  size?: number;
  className?: string;
}

/**
 * Reusable Nova AI logo component using the generated logo image.
 */
export default function NovaLogo({ size = 32, className = "" }: NovaLogoProps) {
  return (
    <Image
      src="/logo.png"
      alt="Nova AI"
      width={size}
      height={size}
      className={`rounded-lg ${className}`}
      priority
    />
  );
}
