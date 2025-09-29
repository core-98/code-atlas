import { NextResponse } from "next/server";

type AuthPayload = {
  code?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AuthPayload;
    const submittedCode = body.code?.trim();
    const secret = process.env.CAREER_SECRET;

    const valid = secret ? submittedCode === secret : true;

    return NextResponse.json({ valid });
  } catch (error) {
    return NextResponse.json({ valid: false }, { status: 400 });
  }
}
