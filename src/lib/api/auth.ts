export type GoogleAuthResponse =
  | {
      message: string;
      data: {
        isRegistered: true;
        nickname: string;
        profileImage: { id: number; https: string } | null;
        stats: { followerCount: number; followingCount: number };
        interests: string[];
      };
      timestamp: string;
    }
  | {
      message: string;
      data: {
        isRegistered: false;
        email: string;
        tempToken: string;
      };
      timestamp: string;
    };

export async function postGoogleAuth(authCode: string) {
  const res = await fetch('/api/auth/google', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ authCode }),
  });

  const json = (await res.json().catch(() => null)) as GoogleAuthResponse | null;

  const authHeader = res.headers.get('authorization');
  const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  return { res, json, accessToken };
}
