import { z } from "zod";
import { nanoid } from "nanoid";
import { TRPCError } from "@trpc/server";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

// List of adult content patterns to block
const adultContentPatterns = [
  /porn/i,
  /xxx/i,
  /adult/i,
  /sex/i,
  /escort/i,
  /nsfw/i,
];

// Function to check if URL contains adult content
const containsAdultContent = (url: string) => {
  return adultContentPatterns.some((pattern) => pattern.test(url));
};

// Validation schema for URLs
const urlSchema = z
  .string()
  .url()
  .min(1)
  .refine((url) => !containsAdultContent(url), {
    message: "URLs containing adult content are not allowed",
  });

export const urlRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        url: urlSchema,
        customSlug: z.string().min(1).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const slug = input.customSlug ?? nanoid(7); // Generate a 7-character slug

      try {
        // Check if slug already exists
        const existing = await ctx.db.shortenedURL.findUnique({
          where: { slug },
        });

        if (existing) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Custom slug already taken",
          });
        }

        return await ctx.db.shortenedURL.create({
          data: {
            slug,
            longUrl: input.url,
            userId: ctx.session.user.id,
          },
        });
      } catch (error) {
        console.error("Error creating shortened URL:", error);

        // Re-throw TRPCError instances
        if (error instanceof TRPCError) {
          throw error;
        }

        // Convert other errors to TRPCError
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create shortened URL",
          cause: error,
        });
      }
    }),

  // Public procedure for non-authenticated users
  createAnon: publicProcedure
    .input(
      z.object({
        url: urlSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const slug = nanoid(7); // Generate a 7-character slug

      try {
        // Check if slug already exists
        const existing = await ctx.db.shortenedURL.findUnique({
          where: { slug },
        });

        if (existing) {
          // Try again with a new slug
          const newSlug = nanoid(7);

          // Double-check the new slug doesn't exist
          const newSlugExists = await ctx.db.shortenedURL.findUnique({
            where: { slug: newSlug },
          });

          if (newSlugExists) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to generate unique slug, please try again",
            });
          }

          return ctx.db.shortenedURL.create({
            data: {
              slug: newSlug,
              longUrl: input.url,
              // No userId for anonymous users
            },
          });
        }

        return await ctx.db.shortenedURL.create({
          data: {
            slug,
            longUrl: input.url,
            // No userId for anonymous users
          },
        });
      } catch (error) {
        console.error("Error creating anonymous shortened URL:", error);

        // Re-throw TRPCError instances
        if (error instanceof TRPCError) {
          throw error;
        }

        // Convert other errors to TRPCError
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create shortened URL",
          cause: error,
        });
      }
    }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      try {
        const url = await ctx.db.shortenedURL.findUnique({
          where: { slug: input.slug },
        });

        if (!url) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "URL not found",
          });
        }

        // Update click count in a separate query
        await ctx.db.shortenedURL.update({
          where: { id: url.id },
          data: { clicks: { increment: 1 } },
        });

        return url;
      } catch (error) {
        console.error("Error getting URL by slug:", error);

        // Re-throw TRPCError instances
        if (error instanceof TRPCError) {
          throw error;
        }

        // Convert other errors to TRPCError
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to retrieve URL",
          cause: error,
        });
      }
    }),

  getUserUrls: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.db.shortenedURL.findMany({
        where: { userId: ctx.session.user.id },
        orderBy: { createdAt: "desc" },
      });
    } catch (error) {
      console.error("Error fetching user URLs:", error);

      // Re-throw TRPCError instances
      if (error instanceof TRPCError) {
        throw error;
      }

      // Convert other errors to TRPCError
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch user URLs",
        cause: error,
      });
    }
  }),

  getUserStats: protectedProcedure.query(async ({ ctx }) => {
    try {
      const userId = ctx.session.user.id;

      // Get total number of URLs created by user
      const totalUrls = await ctx.db.shortenedURL.count({
        where: { userId },
      });

      // Get total number of clicks across all user's URLs
      const result = await ctx.db.shortenedURL.aggregate({
        where: { userId },
        _sum: {
          clicks: true,
        },
      });

      const totalClicks = result._sum.clicks ?? 0;

      return {
        totalUrls,
        totalClicks,
      };
    } catch (error) {
      console.error("Error fetching user stats:", error);

      // Re-throw TRPCError instances
      if (error instanceof TRPCError) {
        throw error;
      }

      // Convert other errors to TRPCError
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch user statistics",
        cause: error,
      });
    }
  }),

  // Analytics endpoints
  getDailyClicksForUrl: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const url = await ctx.db.shortenedURL.findUnique({
          where: { slug: input.slug },
        });

        if (!url) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "URL not found",
          });
        }

        if (url.userId !== ctx.session.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have access to this URL's analytics",
          });
        }

        // Return simple day-based data using the URL's click count
        // In a real app, you would have a separate analytics table tracking daily clicks
        return [{ name: "Total Clicks", clicks: url.clicks }];
      } catch (error) {
        console.error("Error getting daily clicks:", error);

        // Re-throw TRPCError instances
        if (error instanceof TRPCError) {
          throw error;
        }

        // Convert other errors to TRPCError
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch URL analytics",
          cause: error,
        });
      }
    }),

  getMonthlyAnalytics: protectedProcedure.query(async ({ ctx }) => {
    try {
      const userId = ctx.session.user.id;

      // Get user's URLs with actual counts
      const urls = await ctx.db.shortenedURL.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });

      const totalUrls = urls.length;
      const totalClicks = urls.reduce((sum, url) => sum + url.clicks, 0);

      // Return simple analytics based on actual database metrics
      return [{ name: "Your URLs", urls: totalUrls, clicks: totalClicks }];
    } catch (error) {
      console.error("Error getting monthly analytics:", error);

      // Re-throw TRPCError instances
      if (error instanceof TRPCError) {
        throw error;
      }

      // Convert other errors to TRPCError
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch monthly analytics",
        cause: error,
      });
    }
  }),

  getTopReferrers: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const url = await ctx.db.shortenedURL.findUnique({
          where: { slug: input.slug },
        });

        if (!url) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "URL not found",
          });
        }

        if (url.userId !== ctx.session.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have access to this URL's analytics",
          });
        }

        // In a real app, you would track referrers in a separate table
        // For now, just return the total click count as "Direct" traffic
        return [{ name: "Direct", clicks: url.clicks }];
      } catch (error) {
        console.error("Error getting top referrers:", error);

        // Re-throw TRPCError instances
        if (error instanceof TRPCError) {
          throw error;
        }

        // Convert other errors to TRPCError
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch referrer data",
          cause: error,
        });
      }
    }),

  getLocationData: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const url = await ctx.db.shortenedURL.findUnique({
          where: { slug: input.slug },
        });

        if (!url) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "URL not found",
          });
        }

        if (url.userId !== ctx.session.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have access to this URL's analytics",
          });
        }

        // In a real app, you would track location data in a separate table
        // For now, just return the total click count as a single location
        return [{ name: "All Regions", clicks: url.clicks }];
      } catch (error) {
        console.error("Error getting location data:", error);

        // Re-throw TRPCError instances
        if (error instanceof TRPCError) {
          throw error;
        }

        // Convert other errors to TRPCError
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch location data",
          cause: error,
        });
      }
    }),

  getDeviceData: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    // Get total number of clicks across all user's URLs
    const result = await ctx.db.shortenedURL.aggregate({
      where: { userId },
      _sum: {
        clicks: true,
      },
    });

    const totalClicks = result._sum.clicks ?? 0;

    // In a real app, you would track device data in a separate table
    // For now, just return the total click count
    return [{ name: "All Devices", value: totalClicks }];
  }),

  deleteUrl: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // First check if the URL exists and belongs to the user
        const url = await ctx.db.shortenedURL.findUnique({
          where: { id: input.id },
        });

        if (!url) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "URL not found",
          });
        }

        // Check if the URL belongs to the current user
        if (url.userId !== ctx.session.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN", 
            message: "You don't have permission to delete this URL",
          });
        }

        // Delete the URL
        await ctx.db.shortenedURL.delete({
          where: { id: input.id },
        });

        return { success: true };
      } catch (error) {
        console.error("Error deleting URL:", error);

        // Re-throw TRPCError instances
        if (error instanceof TRPCError) {
          throw error;
        }

        // Convert other errors to TRPCError
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete URL",
          cause: error,
        });
      }
    }),
});
