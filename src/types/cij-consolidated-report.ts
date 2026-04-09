export type CijConsolidatedReport = {
  generatedAt?: string;
  sourcePdfs?: { parcial2026?: string; historicalSummary?: string };
  parcial2026?: {
    documentDate?: string | null;
    parseNote?: string;
    executiveSummary?: {
      uniqueSurgeries?: number | null;
      byStatus?: Record<string, number>;
      byHospitalExecutive?: Record<string, number>;
    };
    parsedRowCount?: number;
    aggregates?: {
      byHospital?: Record<string, number>;
      byDoctor?: Record<string, number>;
      bySide?: Record<string, number>;
      bySupplier?: Record<string, number>;
      byTechnique?: Record<string, number>;
      byDiagnosis?: Record<string, number>;
    };
    projectionEnd2026?: {
      snapshotDate?: string | null;
      firstCaseDate?: string;
      lastCaseDateInFile?: string;
      listedCasesInParser?: number;
      executiveUniqueCount?: number | null;
      methods?: {
        densityExtrapolation?: Record<string, unknown>;
        historicalBaseline2025TeamKnee?: Record<string, unknown>;
      };
      recommendedRange?: { low: number; high: number };
    };
  };
  consolidatedFinal?: {
    yearsAvailable?: string[];
    teamKneeByYear?: {
      year: number;
      juarez: number;
      humberto: number;
      joao: number;
    }[];
    teamSurgeryByYear?: {
      year: number;
      juarez: number;
      humberto: number;
      joao: number;
    }[];
    juarezKneeByYear?: { year: number; count: number }[];
    note?: string;
  };
};
