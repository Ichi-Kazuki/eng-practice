import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { exchangeCodeForTokens, verifyGoogleIdToken } from "@/lib/auth/google";
import { createSessionToken, SESSION_COOKIE_NAME, SESSION_MAX_AGE_SEC } from "@/lib/auth/session";
import { GUEST_COOKIE_NAME } from "@/lib/auth/active-identity";
import { getOrCreateUserByGoogle, mergeGuestDataIntoUser } from "@/lib/users";

const OAUTH_STATE_COOKIE = "oauth_state";

export async function GET(request: NextRequest) {
  const { env } = getCloudflareContext();
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const savedState = request.cookies.get(OAUTH_STATE_COOKIE)?.value;

  if (!code || !state || !savedState || state !== savedState) {
    return NextResponse.json({ error: "無効なログインリクエストです。もう一度お試しください。" }, { status: 400 });
  }

  const redirectUri = new URL("/api/auth/callback", request.url).toString();

  try {
    const tokens = await exchangeCodeForTokens({
      code,
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      redirectUri,
    });

    const profile = await verifyGoogleIdToken(tokens.id_token, env.GOOGLE_CLIENT_ID);
    const user = await getOrCreateUserByGoogle(profile);

    const guestId = request.cookies.get(GUEST_COOKIE_NAME)?.value;
    if (guestId) {
      await mergeGuestDataIntoUser(guestId, user.id);
    }

    const sessionToken = await createSessionToken(
      { userId: user.id, email: user.email, name: user.name, avatarUrl: user.avatarUrl },
      env.SESSION_SECRET
    );

    const response = NextResponse.redirect(new URL("/app", request.url));
    response.cookies.delete({ name: OAUTH_STATE_COOKIE, path: "/api/auth" });
    response.cookies.delete({ name: GUEST_COOKIE_NAME, path: "/" });
    response.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: request.nextUrl.protocol === "https:",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE_SEC,
    });
    return response;
  } catch (err) {
    // Google APIのレスポンス本文・トークン・スタックトレースをユーザーへ返さない。
    // サーバーログにも最小限(エラー名のみ)しか残さない。
    console.error("Google OAuth callback failed:", err instanceof Error ? err.name : "unknown error");
    return NextResponse.json(
      { error: "ログインに失敗しました。もう一度お試しください。" },
      { status: 400 }
    );
  }
}
