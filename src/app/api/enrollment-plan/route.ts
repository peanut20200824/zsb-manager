import { NextRequest, NextResponse } from "next/server";
import { zsbManager } from "@/storage/database";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const keyword = searchParams.get("keyword") || undefined;
    const 院校名称 = searchParams.get("院校名称") || undefined;
    const skip = parseInt(searchParams.get("skip") || "0");
    const limit = parseInt(searchParams.get("limit") || "100");

    const data = await zsbManager.searchEnrollmentPlan({
      keyword,
      院校名称,
      skip,
      limit,
    });

    return NextResponse.json({
      success: true,
      data,
      count: data.length,
    });
  } catch (error) {
    console.error("查询招生计划失败:", error);
    return NextResponse.json(
      {
        success: false,
        error: "查询失败",
      },
      { status: 500 }
    );
  }
}
