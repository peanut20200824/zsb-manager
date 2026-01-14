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
 * 第一级查询：根据专科专业查询可报考的本科专业列表
 * 参数：keyword（专科专业名称）
 * 返回：本科专业列表 + 考试科目
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const keyword = searchParams.get("keyword");
    const undergraduateMajor = searchParams.get("undergraduateMajor"); // 可选，如果指定则查询该本科专业的学校

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

    // 2. 如果指定了本科专业，查询该本科专业的学校列表
    if (undergraduateMajor) {
      const results = [];

      // 查询招生计划中匹配的学校
      const enrollmentRecords = await db
        .select()
        .from(enrollmentPlan)
        .where(like(enrollmentPlan.专业名称, `%${undergraduateMajor}%`));

      // 按学校分组
      const schoolGroupMap = new Map<string, any[]>();

      for (const record of enrollmentRecords) {
        if (!schoolGroupMap.has(record.院校名称)) {
          schoolGroupMap.set(record.院校名称, []);
        }
        schoolGroupMap.get(record.院校名称)!.push({
          专业名称: record.专业名称,
          普通计划数: record.普通计划数,
          专项计划数: record.专项计划数,
        });
      }

      const schoolList = Array.from(schoolGroupMap.entries())
        .map(([school, plans]) => ({
          学校名称: school,
          招生计划: plans,
          计划总数: plans.reduce((sum, p) => sum + p.普通计划数 + p.专项计划数, 0),
        }))
        .sort((a, b) => b.计划总数 - a.计划总数);

      // 获取本科专业信息
      const majorInfo = directoryRecords.find(r => r.本科专业 === undergraduateMajor);

      return NextResponse.json({
        success: true,
        data: {
          level: "school",
          专科专业: majorInfo?.专科专业 || directoryRecords[0].专科专业,
          本科专业: undergraduateMajor,
          本科专业类: majorInfo?.本科专业类 || "",
          招考类别: majorInfo?.招考类别 || "",
          学校列表: schoolList,
        },
      });
    }

    // 3. 如果没有指定本科专业，返回本科专业列表（去重）和考试科目
    // 按本科专业分组
    const majorGroupMap = new Map<string, {
      本科专业类: string;
      招考类别: string;
      可报考学校数: number;
    }>();

    const categorySet = new Set<string>();

    for (const record of directoryRecords) {
      if (!majorGroupMap.has(record.本科专业)) {
        // 查询该本科专业有多少学校招生
        const enrollmentRecords = await db
          .select()
          .from(enrollmentPlan)
          .where(like(enrollmentPlan.专业名称, `%${record.本科专业}%`));

        const schoolCount = new Set(enrollmentRecords.map(e => e.院校名称)).size;

        majorGroupMap.set(record.本科专业, {
          本科专业类: record.本科专业类,
          招考类别: record.招考类别,
          可报考学校数: schoolCount,
        });
      }
      categorySet.add(record.招考类别);
    }

    // 查询考试科目
    const examSubjectsList = [];
    for (const category of Array.from(categorySet)) {
      const mappedCategory = categoryMapping[category];
      if (mappedCategory) {
        const examRecords = await db
          .select()
          .from(examSubjects)
          .where(eq(examSubjects.招考类别, mappedCategory));

        if (examRecords.length > 0) {
          examSubjectsList.push({
            招考类别: category,
            考试科目: examRecords[0],
          });
        }
      }
    }

    const majorList = Array.from(majorGroupMap.entries())
      .map(([major, info]) => ({
        本科专业: major,
        本科专业类: info.本科专业类,
        招考类别: info.招考类别,
        可报考学校数: info.可报考学校数,
      }))
      .sort((a, b) => b.可报考学校数 - a.可报考学校数);

    return NextResponse.json({
      success: true,
      data: {
        level: "major",
        专科专业: directoryRecords[0].专科专业,
        考试科目列表: examSubjectsList,
        本科专业列表: majorList,
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
