import { NextRequest, NextResponse } from "next/server";
import { zsbManager } from "@/storage/database";
import { professionalDirectory, enrollmentPlan, examSubjects } from "@/storage/database/shared/schema";
import { getDb } from "coze-coding-dev-sdk";
import { like, or, eq, and, SQL } from "drizzle-orm";

// 招考类别映射：编号 -> 简化名称
const categoryMapping: Record<string, string> = {
  "01文史哲法类": "文史哲法类",
  "04教育类": "教育类",
  "07理工类1": "理工类1",
  "08理工类2": "理工类2",
  "09农林生物医药类": "农林生物\n医药类",
  "10医学类": "医学类",
  "12经管类": "经管类",
  "13艺术类": "艺术类",
  "医学": "医学类",
  "工学": "理工类1", // 假设工学对应理工类1
};

/**
 * 综合查询接口
 * 输入：专科专业或本科专业
 * 输出：关联的本科专业、招考类别、考试科目、可报考院校
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const keyword = searchParams.get("keyword");

    if (!keyword) {
      return NextResponse.json({
        success: false,
        error: "请输入查询关键词",
      });
    }

    const db = await getDb();

    // 1. 从专业目录表查询
    const directoryRecords = await db
      .select()
      .from(professionalDirectory)
      .where(
        or(
          like(professionalDirectory.专科专业, `%${keyword}%`),
          like(professionalDirectory.本科专业, `%${keyword}%`)
        )!
      );

    if (directoryRecords.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        message: "未找到匹配的专业",
      });
    }

    // 2. 关联查询其他表
    const results = [];

    for (const record of directoryRecords) {
      // 查询考试科目 - 使用映射
      const mappedCategory = categoryMapping[record.招考类别];
      const examRecords = await db
        .select()
        .from(examSubjects)
        .where(eq(examSubjects.招考类别, mappedCategory || ""));

      // 查询招生计划（匹配本科专业）
      const enrollmentRecords = await db
        .select()
        .from(enrollmentPlan)
        .where(like(enrollmentPlan.专业名称, `%${record.本科专业}%`));

      results.push({
        专科专业: record.专科专业,
        本科专业: record.本科专业,
        本科专业类: record.本科专业类,
        招考类别: record.招考类别,
        考试科目: examRecords.length > 0 ? examRecords[0] : null,
        可报考院校: enrollmentRecords.map((e) => ({
          院校名称: e.院校名称,
          专业名称: e.专业名称,
          普通计划数: e.普通计划数,
          专项计划数: e.专项计划数,
        })),
      });
    }

    return NextResponse.json({
      success: true,
      data: results,
      count: results.length,
    });
  } catch (error) {
    console.error("综合查询失败:", error);
    return NextResponse.json(
      {
        success: false,
        error: "查询失败",
      },
      { status: 500 }
    );
  }
}
