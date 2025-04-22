import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { createApiKey, revokeApiKey, getUserApiKeys } from "~/lib/api-key";

export const apiKeyRouter = createTRPCRouter({
  // Get all API keys for the current user
  getUserApiKeys: protectedProcedure.query(async ({ ctx }) => {
    try {
      const userId = ctx.session.user.id;
      return await getUserApiKeys(userId);
    } catch (error) {
      console.error("Error fetching user API keys:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch API keys",
        cause: error,
      });
    }
  }),

  // Create a new API key
  createApiKey: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        expiresInDays: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.session.user.id;
        return await createApiKey(userId, input.name, input.expiresInDays);
      } catch (error) {
        console.error("Error creating API key:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create API key",
          cause: error,
        });
      }
    }),

  // Revoke an API key
  revokeApiKey: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.session.user.id;
        await revokeApiKey(input.id, userId);
        return { success: true };
      } catch (error) {
        console.error("Error revoking API key:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to revoke API key",
          cause: error,
        });
      }
    }),
});
