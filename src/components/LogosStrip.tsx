/**
 * Faixa de logos para uso no layout e nas páginas principais.
 * Ficheiros em public/: ver LOGOS-README.txt (logo-cij.png, logo-dr-juarez.png, logo-sote.png).
 */
import { useState } from "react";

type LogosStripVariant = "sidebar" | "header" | "footer";
type LogosStripSize = "sm" | "md" | "lg";

/** Ordem: ficheiro canónico → fallbacks que existem no repositório. */
const LOGO_CIJ_SRCS = ["/logo-cij.png", "/logo-cij.png.jpg", "/logo-cij.jpg"];
const LOGO_DR_SRCS = [
  "/logo-dr-juarez.png",
  "/Editedimage_1765660418828.png",
];
const LOGO_SOTE = "/logo-sote.png";

function LogoWithFallback({
  sources,
  alt,
  className,
}: {
  sources: readonly string[];
  alt: string;
  className: string;
}) {
  const [i, setI] = useState(0);
  if (i >= sources.length) return null;
  return (
    <img
      src={sources[i]}
      alt={alt}
      className={className}
      onError={() => setI((n) => n + 1)}
    />
  );
}

const sizeMap: Record<LogosStripSize, string> = {
  sm: "h-8",   // ~32px – sidebar colapsado, questionários
  md: "h-12",  // ~48px – header páginas públicas, barra superior
  lg: "h-16",  // ~64px – footer, destaque
};

const variantToSize: Record<LogosStripVariant, LogosStripSize> = {
  sidebar: "sm",
  header: "md",
  footer: "lg",
};

const gapMap: Record<LogosStripSize, string> = {
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-8",
};

interface LogosStripProps {
  variant?: LogosStripVariant;
  /** Sobrescreve o tamanho definido pela variant */
  size?: LogosStripSize;
  /** Incluir logo SOTE (parceiro) – útil no footer */
  showSote?: boolean;
  className?: string;
}

export function LogosStrip({
  variant = "header",
  size: sizeProp,
  showSote = false,
  className = "",
}: LogosStripProps) {
  const size = sizeProp ?? variantToSize[variant];
  const imgClass = `${sizeMap[size]} w-auto object-contain`;
  const gapClass = gapMap[size];

  return (
    <div
      className={`flex items-center justify-center flex-wrap opacity-90 hover:opacity-100 transition-opacity ${gapClass} ${className}`}
      role="img"
      aria-label="Centro Integrado de Joelho, Dr. Juarez Sebastian e parceiros"
    >
      <LogoWithFallback
        sources={LOGO_CIJ_SRCS}
        alt="Centro Integrado de Joelho - C.I.J."
        className={imgClass}
      />
      <LogoWithFallback
        sources={LOGO_DR_SRCS}
        alt="Dr. Juarez Sebastian - Ortopedia e Traumatologia - Cirurgia do Joelho"
        className={imgClass}
      />
      {showSote && (
        <LogoWithFallback
          sources={[LOGO_SOTE]}
          alt="Hospital SOTE - Parceiro"
          className={imgClass}
        />
      )}
    </div>
  );
}
