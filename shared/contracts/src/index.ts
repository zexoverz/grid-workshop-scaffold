export * from "./archetypes.js";
export * as A from "./research.js";
export * as B from "./customer-success.js";
export * as C from "./strategist.js";
export * as D from "./operations.js";
export * as E from "./trader.js";

import type { z } from "zod";
import * as A from "./research.js";
import * as B from "./customer-success.js";
import * as C from "./strategist.js";
import * as D from "./operations.js";
import * as E from "./trader.js";
import type { ArchetypeCode } from "./archetypes.js";

interface ContractEntry {
  input: z.ZodType;
  output: z.ZodType;
  sample: unknown;
}

export const CONTRACTS: Record<ArchetypeCode, ContractEntry> = {
  A: {
    input: A.ResearchInputSchema,
    output: A.ResearchOutputSchema,
    sample: A.RESEARCH_SAMPLE_INPUT,
  },
  B: {
    input: B.CustomerSuccessInputSchema,
    output: B.CustomerSuccessOutputSchema,
    sample: B.CUSTOMER_SUCCESS_SAMPLE_INPUT,
  },
  C: {
    input: C.StrategistInputSchema,
    output: C.StrategistOutputSchema,
    sample: C.STRATEGIST_SAMPLE_INPUT,
  },
  D: {
    input: D.OperationsInputSchema,
    output: D.OperationsOutputSchema,
    sample: D.OPERATIONS_SAMPLE_INPUT,
  },
  E: {
    input: E.TraderInputSchema,
    output: E.TraderOutputSchema,
    sample: E.TRADER_SAMPLE_INPUT,
  },
};
