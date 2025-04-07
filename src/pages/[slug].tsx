import { type GetServerSideProps } from "next";
import { createCaller } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const slug = params?.slug;
  if (typeof slug !== "string") {
    return { notFound: true };
  }

  try {
    const ctx = await createTRPCContext({ headers: new Headers() });
    const caller = createCaller(ctx);
    const url = await caller.url.getBySlug({ slug });

    return {
      redirect: {
        destination: url.longUrl,
        permanent: false,
      },
    };
  } catch (error) {
    return { notFound: true };
  }
};

// This page won't render anything as it will always redirect
export default function SlugPage() {
  return null;
}
