import { getDb } from "coze-coding-dev-sdk";
import {
  professionalDirectory,
  enrollmentPlan,
  examSubjects,
  type ProfessionalDirectory,
  type EnrollmentPlan,
  type ExamSubjects,
} from "./shared/schema";
import { eq, like, or, and, SQL } from "drizzle-orm";

/**
 * 专升本数据管理类
 */
export class ZsbManager {
  /**
   * 查询专业目录
   * @param options 查询选项
   */
  async searchProfessionalDirectory(options: {
    keyword?: string;
    招考类别?: string;
    skip?: number;
    limit?: number;
  } = {}): Promise<ProfessionalDirectory[]> {
    const { keyword, 招考类别, skip = 0, limit = 100 } = options;
    const db = await getDb();

    const conditions: SQL[] = [];

    if (keyword) {
      conditions.push(
        or(
          like(professionalDirectory.专科专业, `%${keyword}%`),
          like(professionalDirectory.本科专业, `%${keyword}%`),
          like(professionalDirectory.本科专业类, `%${keyword}%`)
        )!
      );
    }

    if (招考类别) {
      conditions.push(eq(professionalDirectory.招考类别, 招考类别));
    }

    const query = db.select().from(professionalDirectory);

    if (conditions.length > 0) {
      query.where(and(...conditions));
    }

    return query.limit(limit).offset(skip);
  }

  /**
   * 获取所有招考类别
   */
  async getExamCategories(): Promise<string[]> {
    const db = await getDb();
    const result = await db
      .selectDistinct({ 招考类别: professionalDirectory.招考类别 })
      .from(professionalDirectory)
      .orderBy(professionalDirectory.招考类别);
    return result.map((r) => r.招考类别);
  }

  /**
   * 查询招生计划
   * @param options 查询选项
   */
  async searchEnrollmentPlan(options: {
    keyword?: string;
    院校名称?: string;
    skip?: number;
    limit?: number;
  } = {}): Promise<EnrollmentPlan[]> {
    const { keyword, 院校名称, skip = 0, limit = 100 } = options;
    const db = await getDb();

    const conditions: SQL[] = [];

    if (keyword) {
      conditions.push(
        or(
          like(enrollmentPlan.院校名称, `%${keyword}%`),
          like(enrollmentPlan.专业名称, `%${keyword}%`)
        )!
      );
    }

    if (院校名称) {
      conditions.push(eq(enrollmentPlan.院校名称, 院校名称));
    }

    const query = db.select().from(enrollmentPlan);

    if (conditions.length > 0) {
      query.where(and(...conditions));
    }

    return query.limit(limit).offset(skip);
  }

  /**
   * 获取所有院校名称
   */
  async getSchoolNames(): Promise<string[]> {
    const db = await getDb();
    const result = await db
      .selectDistinct({ 院校名称: enrollmentPlan.院校名称 })
      .from(enrollmentPlan)
      .orderBy(enrollmentPlan.院校名称);
    return result.map((r) => r.院校名称);
  }

  /**
   * 统计某个院校的总招生人数
   */
  async getSchoolTotal(院校名称: string): Promise<{
    普通计划数总计: number;
    专项计划数总计: number;
    总计: number;
  }> {
    const db = await getDb();
    const results = await db
      .select({
        普通计划数: enrollmentPlan.普通计划数,
        专项计划数: enrollmentPlan.专项计划数,
      })
      .from(enrollmentPlan)
      .where(eq(enrollmentPlan.院校名称, 院校名称));

    const 普通计划数总计 = results.reduce(
      (sum, r) => sum + (r.普通计划数 || 0),
      0
    );
    const 专项计划数总计 = results.reduce(
      (sum, r) => sum + (r.专项计划数 || 0),
      0
    );

    return {
      普通计划数总计,
      专项计划数总计,
      总计: 普通计划数总计 + 专项计划数总计,
    };
  }

  /**
   * 查询考试科目
   * @param options 查询选项
   */
  async searchExamSubjects(options: {
    招考类别?: string;
    skip?: number;
    limit?: number;
  } = {}): Promise<ExamSubjects[]> {
    const { 招考类别, skip = 0, limit = 100 } = options;
    const db = await getDb();

    const query = db.select().from(examSubjects);

    if (招考类别) {
      query.where(eq(examSubjects.招考类别, 招考类别));
    }

    return query.limit(limit).offset(skip);
  }

  /**
   * 获取所有考试科目记录
   */
  async getAllExamSubjects(): Promise<ExamSubjects[]> {
    const db = await getDb();
    return db.select().from(examSubjects).orderBy(examSubjects.招考类别);
  }
}

export const zsbManager = new ZsbManager();
