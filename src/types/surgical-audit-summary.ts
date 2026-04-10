export type SurgicalAuditSummary = {
  extractedAt?: string;
  source?: string;
  yearsAvailable: string[];
  byYear: Record<
    string,
    {
      eventCount: number;
      bySurgeon: Record<
        string,
        { slots: number; surgerySlots: number; kneeSurgerySlots: number }
      >;
      juarezKneeByMonth: Record<string, number>;
      juarezKneeByCategory: Record<string, number>;
    }
  >;
  series: {
    juarezKneeSurgeryCountByYear: { year: number; count: number }[];
    juarezSurgeryCountByYear: { year: number; count: number }[];
    teamKneeSlotsByYear?: {
      year: number;
      juarez: number;
      humberto: number;
      joao: number;
    }[];
    teamSurgerySlotsByYear?: {
      year: number;
      juarez: number;
      humberto: number;
      joao: number;
    }[];
  };
  projection2026: {
    juarezKneeSurgerySlots: {
      linearOnCalendarYear: number;
      averageLast3Years: number;
      recommendedPlanningRange: { low: number; high: number };
      methodsNote: string;
    };
  };
  cijDocumentsMeta: { file: string; eventCount: number }[];
  suggestionsForApproval: string[];
};
