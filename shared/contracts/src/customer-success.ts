import { z } from "zod";

export const CustomerSuccessHistoryTurnSchema = z.object({
  role: z.enum(["user", "agent"]),
  content: z.string(),
});
export type CustomerSuccessHistoryTurn = z.infer<typeof CustomerSuccessHistoryTurnSchema>;

export const CustomerSuccessInputSchema = z.object({
  userMessage: z.string(),
  userId: z.string().optional(),
  language: z.string().optional().default("en"),
  history: z.array(CustomerSuccessHistoryTurnSchema).optional().default([]),
});

export const CustomerSuccessOutputSchema = z.object({
  reply: z.string(),
  intent: z.string(),
  followUps: z.array(z.string()),
});

export type CustomerSuccessInput = z.infer<typeof CustomerSuccessInputSchema>;
export type CustomerSuccessOutput = z.infer<typeof CustomerSuccessOutputSchema>;

export const CUSTOMER_SUCCESS_SAMPLE_INPUT: CustomerSuccessInput = {
  userMessage: "Saya pemula. Bagaimana cara mulai trading di Indodax?",
  language: "id",
};
