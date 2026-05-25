export const ARCHETYPES = {
  A: {
    code: "A",
    role: "Head of Research",
    problem: "P1 — Pre-trade intelligence",
    folder: "A-head-of-research",
  },
  B: {
    code: "B",
    role: "Customer Success Lead",
    problem: "P2 — Trader experience",
    folder: "B-customer-success-lead",
  },
  C: {
    code: "C",
    role: "Chief Strategist",
    problem: "P3 — Decision support",
    folder: "C-chief-strategist",
  },
  D: {
    code: "D",
    role: "Operations Officer",
    problem: "P4 — Operations monitoring",
    folder: "D-operations-officer",
  },
  E: {
    code: "E",
    role: "Head Trader",
    problem: "P5 — Execution",
    folder: "E-head-trader",
  },
} as const;

export type ArchetypeCode = keyof typeof ARCHETYPES;
export const ARCHETYPE_CODES: ArchetypeCode[] = ["A", "B", "C", "D", "E"];

export function isArchetypeCode(value: string): value is ArchetypeCode {
  return (ARCHETYPE_CODES as string[]).includes(value);
}
