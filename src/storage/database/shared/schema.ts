import { pgTable, text, integer, index } from "drizzle-orm/pg-core";
import { createSchemaFactory } from "drizzle-zod";
import { z } from "zod";

// 专业指导目录表
export const professionalDirectory = pgTable(
  "professional_directory",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
   专科专业: text("专科专业").notNull(),
    本科专业类: text("本科专业类").notNull(),
    本科专业: text("本科专业").notNull(),
    招考类别: text("招考类别").notNull(),
  },
  (table) => ({
    idx_专科专业: index("professional_directory_专科专业_idx").on(table.专科专业),
    idx_招考类别: index("professional_directory_招考类别_idx").on(table.招考类别),
  })
);

// 招生计划表
export const enrollmentPlan = pgTable(
  "enrollment_plan",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    院校名称: text("院校名称").notNull(),
    专业名称: text("专业名称").notNull(),
    普通计划数: integer("普通计划数").notNull(),
    专项计划数: integer("专项计划数").notNull(),
  },
  (table) => ({
    idx_院校名称: index("enrollment_plan_院校名称_idx").on(table.院校名称),
    idx_专业名称: index("enrollment_plan_专业名称_idx").on(table.专业名称),
  })
);

// 考试科目表
export const examSubjects = pgTable(
  "exam_subjects",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    招考类别: text("招考类别").notNull(),
    本科招生专业类: text("本科招生专业类").notNull(),
    公共基础: text("公共基础").notNull(),
    专业基础: text("专业基础").notNull(),
  },
  (table) => ({
    idx_招考类别: index("exam_subjects_招考类别_idx").on(table.招考类别),
  })
);

// Zod schemas
const { createInsertSchema: createCoercedInsertSchema } = createSchemaFactory({
  coerce: { date: true },
});

export const insertProfessionalDirectorySchema = createCoercedInsertSchema(professionalDirectory);
export const insertEnrollmentPlanSchema = createCoercedInsertSchema(enrollmentPlan);
export const insertExamSubjectsSchema = createCoercedInsertSchema(examSubjects);

// TypeScript types
export type ProfessionalDirectory = typeof professionalDirectory.$inferSelect;
export type EnrollmentPlan = typeof enrollmentPlan.$inferSelect;
export type ExamSubjects = typeof examSubjects.$inferSelect;
export type InsertProfessionalDirectory = z.infer<typeof insertProfessionalDirectorySchema>;
export type InsertEnrollmentPlan = z.infer<typeof insertEnrollmentPlanSchema>;
export type InsertExamSubjects = z.infer<typeof insertExamSubjectsSchema>;




