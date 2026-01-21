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

export type GoogleAuthErrorResponse = {
  message: string;
  data: null;
  timestamp: string;
};

type PostGoogleAuthResult = {
  ok: boolean;
  status: number;
  json: GoogleAuthResponse | GoogleAuthErrorResponse | null;
  accessToken: string | null;
};

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function postGoogleAuth(authCode: string): Promise<PostGoogleAuthResult> {
  if (!BASE_URL) {
    throw new Error('NEXT_PUBLIC_API_BASE_URL is not set in .env.local');
  }

  const url = new URL('/api/auth/google', BASE_URL).toString();

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ authCode }),
  });

  const json = (await res.json().catch(() => null)) as
    | GoogleAuthResponse
    | GoogleAuthErrorResponse
    | null;

  const authHeader = res.headers.get('authorization');
  const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  return {
    ok: res.ok,
    status: res.status,
    json,
    accessToken,
  };
}
