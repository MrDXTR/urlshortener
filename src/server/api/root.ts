import { urlRouter } from "~/server/api/routers/url";
import { apiKeyRouter } from "~/server/api/routers/apiKey";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  url: urlRouter,
  apiKey: apiKeyRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
