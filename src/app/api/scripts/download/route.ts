import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  // Check auth cookie
  const authCookie = request.cookies.get('argus_auth');
  const authHeader = request.headers.get('authorization');

  if (!authCookie && !authHeader) {
    return NextResponse.json(
      { error: "Authentication required to download scripts" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const file = searchParams.get('file');

  if (!file) {
    return NextResponse.json({ error: "File parameter required" }, { status: 400 });
  }

  const safeFilename = path.basename(file);
  const filePath = path.join(process.cwd(), 'public', 'scripts', safeFilename);

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "Script not found" }, { status: 404 });
  }

  const fileBuffer = fs.readFileSync(filePath);
  return new NextResponse(fileBuffer, {
    headers: {
      'Content-Type': 'text/x-python',
      'Content-Disposition': `attachment; filename="${safeFilename}"`,
    },
  });
}
