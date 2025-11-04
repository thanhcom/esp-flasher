import { NextResponse } from "next/server";
import { exec } from "child_process";

export async function POST() {
  try {
    exec("pm2 restart esp-flasher", { cwd: "/app" }, (error, stdout, stderr) => {
      if (error) {
        console.error("❌ Restart error:", error);
        return;
      }
      if (stderr) console.warn("⚠️ Restart stderr:", stderr);
      console.log("✅ Restart stdout:", stdout);
    });

    return NextResponse.json({ success: true, message: "Restart command sent" });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
