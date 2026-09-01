import { NextRequest, NextResponse } from "next/server";

/**
 * Gates Sanity Studio (/studio), the Cloudflare Stream upload API
 * (/api/cloudflare-stream/*), and the admin course preview
 * (/online-learning/preview/*) behind Basic Auth, prompted by the
 * browser's own native login dialog.
 *
 * Sanity's own project login already stops a stranger from actually
 * reading or writing content once inside Studio, but the upload API has
 * no auth of its own at all — without this, anyone who found the URL
 * could mint real Cloudflare Stream uploads on Oliver's account. Gating
 * /studio too means there's exactly one login prompt, not a surprise
 * second one the first time someone tries to upload a video. The course
 * preview route needs the same gate for a different reason: it renders
 * full course content (including unpublished drafts) as if the visitor
 * were a fully-entitled client, bypassing the real Base44 entitlement
 * check entirely — that must never be reachable by an actual visitor.
 *
 * The course preview route accepts a SECOND, separate credential pair
 * (COURSE_PREVIEW_BASIC_AUTH_USER/PASS) on top of the Studio one, so
 * Oliver can hand a preview link + password to a few trusted reviewers
 * without also handing them the Studio login — that would let them edit
 * or delete real content, not just look at a course. /studio and the
 * upload API only ever accept the Studio credentials. If the reviewer
 * credentials aren't set, the preview route still works with the Studio
 * login, same as before this existed.
 *
 * A request that got in on the reviewer credentials (not the Studio ones)
 * is tagged with an `x-course-preview-auth: reviewer` request header, which
 * the preview pages read to check Sanity's `coursePreviewReviewEnabled`
 * toggle (Site Settings → Course Preview Access in Studio) — Oliver's own
 * on/off switch for reviewer access that doesn't need a Vercel visit or a
 * redeploy. Studio-authenticated requests aren't tagged, so Oliver can
 * always see the preview regardless of that toggle.
 *
 * If STUDIO_BASIC_AUTH_USER/PASS aren't set (e.g. a preview deploy that
 * hasn't had them configured yet), this deliberately falls open rather
 * than locking everyone out by accident — Sanity's login is still there
 * as the real gate on content itself.
 *
 * Named `proxy.ts` (not `middleware.ts`) and exports `proxy` (not
 * `middleware`) per this project's Next.js 16 convention — see
 * node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md,
 * required reading per this repo's own AGENTS.md. The matcher config
 * below is unchanged by that rename.
 */
export function proxy(request: NextRequest) {
  const studioUser = process.env.STUDIO_BASIC_AUTH_USER;
  const studioPass = process.env.STUDIO_BASIC_AUTH_PASS;

  if (!studioUser || !studioPass) {
    return NextResponse.next();
  }

  const isCoursePreview = request.nextUrl.pathname.startsWith("/online-learning/preview");
  const reviewerUser = process.env.COURSE_PREVIEW_BASIC_AUTH_USER;
  const reviewerPass = process.env.COURSE_PREVIEW_BASIC_AUTH_PASS;

  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Basic ")) {
    const decoded = Buffer.from(authHeader.slice(6), "base64").toString("utf-8");
    const separatorIndex = decoded.indexOf(":");
    const suppliedUser = separatorIndex === -1 ? decoded : decoded.slice(0, separatorIndex);
    const suppliedPass = separatorIndex === -1 ? "" : decoded.slice(separatorIndex + 1);

    if (suppliedUser === studioUser && suppliedPass === studioPass) {
      return NextResponse.next();
    }

    if (isCoursePreview && reviewerUser && reviewerPass && suppliedUser === reviewerUser && suppliedPass === reviewerPass) {
      const headers = new Headers(request.headers);
      headers.set("x-course-preview-auth", "reviewer");
      return NextResponse.next({ request: { headers } });
    }
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": `Basic realm="${isCoursePreview ? "Course preview" : "Studio"}", charset="UTF-8"`,
    },
  });
}

export const config = {
  matcher: ["/studio/:path*", "/api/cloudflare-stream/:path*", "/online-learning/preview/:path*"],
};
