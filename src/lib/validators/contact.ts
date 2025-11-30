import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(2, "Nom trop court").max(100),
  email: z.string().email("Email invalide"),
  subject: z.string().min(5, "Sujet trop court").max(200),
  message: z.string().min(20, "Message trop court").max(5000),
});

export type ContactInput = z.infer<typeof contactSchema>;
