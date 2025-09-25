import { NextResponse } from "next/server";
import { ApiResponse, apiSuccessResponse } from "@/lib/utils";

export async function POST(): Promise<NextResponse<ApiResponse<null>>> {
  const response = apiSuccessResponse(null);

  response.cookies.set("token", "", {
    httpOnly: true,
    secure: false,
    maxAge: 0,
    path: "/",
    sameSite: "lax",
  });

  return response;
}
