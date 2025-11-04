import { NextResponse } from "next/server";
import { exec } from "child_process";

export async function POST() {
  try {
    // Thực thi lệnh restart app bằng pm2
    exec("pm2 restart esp-flasher", (error, stdout, stderr) => {
      if (error) {
        console.error("❌ Restart error:", error);
        return;
      }
      if (stderr) console.warn("⚠️ Restart stderr:", stderr);
      console.log("✅ Restart stdout:", stdout);
    });

    // Trả về kết quả cho client
    return NextResponse.json({ success: true, message: "Restart command sent" });
  } catch (err) {
    // Bắt lỗi và phản hồi
    return NextResponse.json(
      { success: false, message: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
