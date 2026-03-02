/**
 * Faixa de logos para uso no layout e nas páginas principais.
 * Arquivos em public/: logo-cij.jpg (ou .png), logo-dr-juarez.png, logo-sote.png (opcional).
 */
type LogosStripVariant = "sidebar" | "header" | "footer";
type LogosStripSize = "sm" | "md" | "lg";

const LOGO_CIJ = "/logo-cij.jpg";
const LOGO_DR_JUAREZ = "/logo-dr-juarez.png";
const LOGO_SOTE = "/logo-sote.png";

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
      <img
        src={LOGO_CIJ}
        alt="Centro Integrado de Joelho - C.I.J."
        className={imgClass}
      />
      <img
        src={LOGO_DR_JUAREZ}
        alt="Dr. Juarez Sebastian - Ortopedia e Traumatologia - Cirurgia do Joelho"
        className={imgClass}
      />
      {showSote && (
        <img
          src={LOGO_SOTE}
          alt="Hospital SOTE - Parceiro"
          className={imgClass}
        />
      )}
    </div>
  );
}
