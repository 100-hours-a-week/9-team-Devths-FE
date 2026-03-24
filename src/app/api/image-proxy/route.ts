import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_S3_HOSTNAME = /^[\w-]+\.s3\.[\w-]+\.amazonaws\.com$/;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return NextResponse.json({ error: 'Invalid url parameter' }, { status: 400 });
  }

  if (!ALLOWED_S3_HOSTNAME.test(parsed.hostname)) {
    return NextResponse.json({ error: 'Disallowed host' }, { status: 400 });
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return new NextResponse(null, { status: response.status });
    }

    const blob = await response.blob();
    const contentType = response.headers.get('content-type') ?? 'application/octet-stream';

    return new NextResponse(blob, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600, immutable',
      },
    });
  } catch {
    return new NextResponse(null, { status: 502 });
  }
}
