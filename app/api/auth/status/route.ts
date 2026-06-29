import { NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase/admin";
import { isAuthNotConfiguredError } from "@/lib/firebase/errors";

export async function GET() {
  try {
    await getAdminAuth().listUsers(1);
    return NextResponse.json({ configured: true });
  } catch (error) {
    if (isAuthNotConfiguredError(error)) {
      return NextResponse.json({ configured: false });
    }
    return NextResponse.json({ configured: false, error: "unknown" });
  }
}
