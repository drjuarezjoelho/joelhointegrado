/**
 * Faixa de logos para uso no layout e nas páginas principais.
 * Arquivos em public/:
 *   logo-cij.jpg (ou .png) - Centro Integrado de Joelho
 *   logo-dr-juarez.png     - Dr. Juarez Sebastian
 *   logo-sote.png          - Hospital SOTE (parceiro)
 *   logo-residencia.png    - Residência Ortopedia e Traumatologia (fundo transparente)
 */
type LogosStripVariant = "sidebar" | "header" | "footer";
type LogosStripSize = "sm" | "md" | "lg";

const LOGO_CIJ = "/logo-cij.jpg";
const LOGO_DR_JUAREZ = "/logo-dr-juarez.png";
const LOGO_SOTE = "/logo-sote.png";
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
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-8",
};

interface LogosStripProps {
  variant?: LogosStripVariant;
  size?: LogosStripSize;
  showSote?: boolean;
  showResidencia?: boolean;
  className?: string;
}

export function LogosStrip({
  variant = "header",
  size: sizeProp,
  showSote = false,
  showResidencia = false,
  className = "",
}: LogosStripProps) {
  const size = sizeProp ?? variantToSize[variant];
  const imgClass = `${sizeMap[size]} w-auto object-contain`;
  const residenciaClass = `${residenciaSizeMap[size]} w-auto object-contain`;
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
      {showResidencia && (
        <img
          src={LOGO_RESIDENCIA}
          alt="Residência Ortopedia e Traumatologia 2024 - Hospital SOTE / Instituto Viver"
          className={residenciaClass}
        />
      )}
    </div>
  );
}
