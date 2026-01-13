import { NextResponse } from "next/server";
import { zsbManager } from "@/storage/database";

export async function GET() {
  try {
    const [招考类别列表, 院校名称列表] = await Promise.all([
      zsbManager.getExamCategories(),
      zsbManager.getSchoolNames(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        招考类别列表,
        院校名称列表,
      },
    });
  } catch (error) {
    console.error("获取选项失败:", error);
    return NextResponse.json(
      {
        success: false,
        error: "获取选项失败",
      },
      { status: 500 }
    );
  }
}
