import { NextRequest, NextResponse } from "next/server";
import { zsbManager } from "@/storage/database";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const keyword = searchParams.get("keyword") || undefined;
    const 招考类别 = searchParams.get("招考类别") || undefined;
    const skip = parseInt(searchParams.get("skip") || "0");
    const limit = parseInt(searchParams.get("limit") || "100");

    const data = await zsbManager.searchProfessionalDirectory({
      keyword,
      招考类别,
      skip,
      limit,
    });

    return NextResponse.json({
      success: true,
      data,
      count: data.length,
    });
  } catch (error) {
    console.error("查询专业目录失败:", error);
    return NextResponse.json(
      {
        success: false,
        error: "查询失败",
      },
      { status: 500 }
    );
  }
}
