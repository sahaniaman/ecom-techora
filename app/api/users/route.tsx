// @/app/api/users/route.ts - Clerk version

import { type NextRequest, NextResponse } from "next/server";


export async function GET(_request: NextRequest) {
    return NextResponse.json("ok");
  } 