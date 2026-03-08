/**
 * Faixa de logos para uso no layout e nas páginas principais.
 * Arquivos em public/ (PNG com fundo transparente):
 *   logo-cij.png          - Centro Integrado de Joelho
 *   logo-dr-juarez.png    - Dr. Juarez Sebastian
 *   logo-sote.png         - Hospital SOTE
 *   logo-viver.png        - Instituto Viver Roberto Bastos de Alencar
 *   logo-residencia.png   - Residência Ortopedia e Traumatologia 2024
 */

const LOGO_CIJ = "/logo-cij.png";
const LOGO_DR_JUAREZ = "/logo-dr-juarez.png";
const LOGO_SOTE = "/logo-sote.png";
const LOGO_VIVER = "/logo-viver.png";
const LOGO_RESIDENCIA = "/logo-residencia.png";

type LogosStripVariant = "sidebar" | "header" | "footer";
type LogosStripSize = "sm" | "md" | "lg";

const heightMap: Record<LogosStripSize, string> = {
  sm: "h-7 sm:h-8",
  md: "h-10 sm:h-12",
  lg: "h-14 sm:h-16 md:h-20",
};

const residenciaHeightMap: Record<LogosStripSize, string> = {
  sm: "h-9 sm:h-10",
  md: "h-14 sm:h-16",
  lg: "h-20 sm:h-24 md:h-28",
};

const gapMap: Record<LogosStripSize, string> = {
  sm: "gap-3",
  md: "gap-4 sm:gap-6",
  lg: "gap-5 sm:gap-8",
};

const variantToSize: Record<LogosStripVariant, LogosStripSize> = {
  sidebar: "sm",
  header: "md",
  footer: "lg",
};

interface LogosStripProps {
  variant?: LogosStripVariant;
  size?: LogosStripSize;
  showSote?: boolean;
  showViver?: boolean;
  showResidencia?: boolean;
  className?: string;
}

function LogoCard({
  src,
  alt,
  heightClass,
}: {
  src: string;
  alt: string;
  heightClass: string;
}) {
  return (
    <div className="bg-white/90 dark:bg-white/95 rounded-lg px-3 py-2 flex items-center justify-center shadow-sm">
      <img
        src={src}
        alt={alt}
        className={`${heightClass} w-auto object-contain`}
        loading="lazy"
      />
    </div>
  );
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
  const h = heightMap[size];
  const hRes = residenciaHeightMap[size];
  const gap = gapMap[size];

  return (
    <div
      className={`flex items-center justify-center flex-wrap ${gap} ${className}`}
      role="img"
      aria-label="Centro Integrado de Joelho, Dr. Juarez Sebastian e parceiros"
    >
      <LogoCard src={LOGO_CIJ} alt="Centro Integrado de Joelho - C.I.J." heightClass={h} />
      <LogoCard src={LOGO_DR_JUAREZ} alt="Dr. Juarez Sebastian - Ortopedia e Traumatologia" heightClass={h} />
      {showSote && (
        <LogoCard src={LOGO_SOTE} alt="Hospital SOTE" heightClass={h} />
      )}
      {showViver && (
        <LogoCard src={LOGO_VIVER} alt="Instituto Viver - Roberto Bastos de Alencar" heightClass={h} />
      )}
      {showResidencia && (
        <LogoCard src={LOGO_RESIDENCIA} alt="Residência Ortopedia e Traumatologia 2024" heightClass={hRes} />
      )}
    </div>
  );
}
