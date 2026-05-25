import { z } from "zod";

export const CustomerSuccessInputSchema = z.object({
  userMessage: z.string().min(1).max(2000),
  userId: z.string().optional(),
  language: z.enum(["en", "id"]).default("en"),
});

export const CustomerSuccessOutputSchema = z.object({
  reply: z.string().min(1).max(1200),
  intent: z.enum([
    "onboarding",
    "education",
    "troubleshooting",
    "fees",
    "kyc",
    "other",
  ]),
  followUps: z.array(z.string().min(1).max(120)).max(5),
});

export type CustomerSuccessInput = z.infer<typeof CustomerSuccessInputSchema>;
export type CustomerSuccessOutput = z.infer<typeof CustomerSuccessOutputSchema>;

export const CUSTOMER_SUCCESS_SAMPLE_INPUT: CustomerSuccessInput = {
  userMessage: "Saya pemula. Bagaimana cara mulai trading di Indodax?",
  language: "id",
};
