import { NextRequest, NextResponse } from "next/server";
import { professionalDirectory, enrollmentPlan, examSubjects } from "@/storage/database/shared/schema";
import { getDb } from "coze-coding-dev-sdk";
import { like, eq, or, and, SQL } from "drizzle-orm";

// 招考类别映射
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
  "工学": "理工类1",
};

/**
 * 第一级查询：根据专科专业查询可报考的学校列表
 * 参数：keyword（专科专业名称）
 * 返回：学校列表（去重）
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const keyword = searchParams.get("keyword");
    const schoolName = searchParams.get("school"); // 可选，如果指定则查询该学校的专业

    if (!keyword) {
      return NextResponse.json({
        success: false,
        error: "请输入查询关键词",
      });
    }

    const db = await getDb();

    // 1. 查询专业目录中的本科专业
    const directoryRecords = await db
      .select()
      .from(professionalDirectory)
      .where(like(professionalDirectory.专科专业, `%${keyword}%`));

    if (directoryRecords.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        message: "未找到匹配的专科专业",
      });
    }

    // 获取所有本科专业名称
    const undergraduateMajors = directoryRecords.map((r) => r.本科专业);

    // 2. 如果指定了学校，查询该学校的专业列表
    if (schoolName) {
      const results = [];

      for (const record of directoryRecords) {
        // 查询该学校是否有这个本科专业
        const enrollmentRecords = await db
          .select()
          .from(enrollmentPlan)
          .where(
            and(
              eq(enrollmentPlan.院校名称, schoolName),
              like(enrollmentPlan.专业名称, `%${record.本科专业}%`)
            )
          );

        if (enrollmentRecords.length > 0) {
          // 查询考试科目
          const mappedCategory = categoryMapping[record.招考类别];
          const examRecords = await db
            .select()
            .from(examSubjects)
            .where(eq(examSubjects.招考类别, mappedCategory || ""));

          results.push({
            专科专业: record.专科专业,
            本科专业: record.本科专业,
            本科专业类: record.本科专业类,
            招考类别: record.招考类别,
            考试科目: examRecords.length > 0 ? examRecords[0] : null,
            招生计划: enrollmentRecords.map((e) => ({
              专业名称: e.专业名称,
              普通计划数: e.普通计划数,
              专项计划数: e.专项计划数,
            })),
          });
        }
      }

      return NextResponse.json({
        success: true,
        data: {
          level: "major",
          schoolName,
          专业列表: results,
        },
      });
    }

    // 3. 如果没有指定学校，返回学校列表（去重）
    const schoolSet = new Map<string, { 专业数量: number; 招考类别: Set<string> }>();

    for (const major of undergraduateMajors) {
      const enrollmentRecords = await db
        .select()
        .from(enrollmentPlan)
        .where(like(enrollmentPlan.专业名称, `%${major}%`));

      for (const record of enrollmentRecords) {
        if (!schoolSet.has(record.院校名称)) {
          schoolSet.set(record.院校名称, {
            专业数量: 0,
            招考类别: new Set(),
          });
        }
        schoolSet.get(record.院校名称)!.专业数量 += 1;
      }
    }

    // 查询所有本科专业对应的招考类别
    const categorySet = new Set<string>();
    for (const record of directoryRecords) {
      categorySet.add(record.招考类别);
    }

    const schoolList = Array.from(schoolSet.entries())
      .map(([school, info]) => ({
        学校名称: school,
        可报考专业数: info.专业数量,
      }))
      .sort((a, b) => b.可报考专业数 - a.可报考专业数);

    return NextResponse.json({
      success: true,
      data: {
        level: "school",
        专科专业: directoryRecords[0].专科专业,
        学校列表: schoolList,
      },
    });
  } catch (error) {
    console.error("查询失败:", error);
    return NextResponse.json(
      {
        success: false,
        error: "查询失败",
      },
      { status: 500 }
    );
  }
}
