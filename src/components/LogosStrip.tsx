/**
 * Faixa de logos para uso no layout e nas páginas principais.
 * Arquivos em public/ (todos PNG com fundo de contraste para tema escuro):
 *   logo-cij.png          - Centro Integrado de Joelho
 *   logo-dr-juarez.png    - Dr. Juarez Sebastian
 *   logo-sote.png         - Hospital SOTE
 *   logo-viver.png        - Instituto Viver Roberto Bastos de Alencar
 *   logo-residencia.png   - Residência Ortopedia e Traumatologia 2024
 */
type LogosStripVariant = "sidebar" | "header" | "footer";
type LogosStripSize = "sm" | "md" | "lg";

const LOGO_CIJ = "/logo-cij.png";
const LOGO_DR_JUAREZ = "/logo-dr-juarez.png";
const LOGO_SOTE = "/logo-sote.png";
const LOGO_VIVER = "/logo-viver.png";
const LOGO_RESIDENCIA = "/logo-residencia.png";

const sizeMap: Record<LogosStripSize, string> = {
  sm: "h-8",
  md: "h-12",
  lg: "h-16",
};

const residenciaSizeMap: Record<LogosStripSize, string> = {
  sm: "h-10",
  md: "h-16",
  lg: "h-20",
};

const variantToSize: Record<LogosStripVariant, LogosStripSize> = {
  sidebar: "sm",
  header: "md",
  footer: "lg",
};

const gapMap: Record<LogosStripSize, string> = {
  sm: "gap-3",
  md: "gap-5",
  lg: "gap-6",
};

interface LogosStripProps {
  variant?: LogosStripVariant;
  size?: LogosStripSize;
  showSote?: boolean;
  showViver?: boolean;
  showResidencia?: boolean;
  className?: string;
}

export function LogosStrip({
  variant = "header",
  size: sizeProp,
  showSote = false,
  showViver = false,
  showResidencia = false,
  className = "",
}: LogosStripProps) {
  const size = sizeProp ?? variantToSize[variant];
  const imgClass = `${sizeMap[size]} w-auto object-contain rounded`;
  const residenciaClass = `${residenciaSizeMap[size]} w-auto object-contain rounded`;
  const gapClass = gapMap[size];

  return (
    <div
      className={`flex items-center justify-center flex-wrap ${gapClass} ${className}`}
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
        alt="Dr. Juarez Sebastian - Ortopedia e Traumatologia"
        className={imgClass}
      />
      {showSote && (
        <img
          src={LOGO_SOTE}
          alt="Hospital SOTE"
          className={imgClass}
        />
      )}
      {showViver && (
        <img
          src={LOGO_VIVER}
          alt="Instituto Viver - Roberto Bastos de Alencar"
          className={imgClass}
        />
      )}
      {showResidencia && (
        <img
          src={LOGO_RESIDENCIA}
          alt="Residência Ortopedia e Traumatologia 2024"
          className={residenciaClass}
        />
      )}
    </div>
  );
}
