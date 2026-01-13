import { getDb } from "coze-coding-dev-sdk";
import { professionalDirectory, enrollmentPlan, examSubjects } from "../src/storage/database/shared/schema";
import { eq } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

// 辅助函数：使用Python读取Excel并返回JSON
function readExcelWithPython(pythonCode: string): any[] {
  const tempFile = path.join(os.tmpdir(), `import_excel_${Date.now()}.py`);
  try {
    fs.writeFileSync(tempFile, pythonCode);
    const { execSync } = require("child_process");
    const output = execSync(`python3 ${tempFile}`, { encoding: "utf-8" });
    return JSON.parse(output);
  } finally {
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
    }
  }
}

// 导入专业目录数据
async function importProfessionalDirectory() {
  console.log("开始导入专业目录数据...");

  const db = await getDb();

  const pythonCode = `
import pandas as pd
import sys
import json

df = pd.read_excel('assets/2025内蒙古专升本专业指导目录.xls', header=1)
df = df[['序号', '专科专业', '本科专业类', '本科专业', '招考类别']]
df = df.dropna(subset=['专科专业'])
data = df.to_dict('records')
print(json.dumps(data, ensure_ascii=False))
`;

  const records = readExcelWithPython(pythonCode);

  // 清空旧数据
  await db.delete(professionalDirectory);

  // 批量插入
  for (const record of records) {
    await db.insert(professionalDirectory).values({
      专科专业: record["专科专业"],
      本科专业类: record["本科专业类"],
      本科专业: record["本科专业"],
      招考类别: record["招考类别"],
    });
  }

  console.log(`✅ 专业目录导入完成，共 ${records.length} 条`);
}

// 导入招生计划数据
async function importEnrollmentPlan() {
  console.log("开始导入招生计划数据...");

  const db = await getDb();

  const pythonCode = `
import pandas as pd
import sys
import json

df = pd.read_excel('assets/2025专升本招生计划.xlsx', header=2)
df = df[['院校名称', '专业名称', '普通计划数', '专项计划数']]
df = df.dropna(subset=['院校名称'])
data = df.to_dict('records')
print(json.dumps(data, ensure_ascii=False))
`;

  const records = readExcelWithPython(pythonCode);

  // 清空旧数据
  await db.delete(enrollmentPlan);

  // 批量插入
  for (const record of records) {
    await db.insert(enrollmentPlan).values({
      院校名称: record["院校名称"],
      专业名称: record["专业名称"],
      普通计划数: Number(record["普通计划数"]) || 0,
      专项计划数: Number(record["专项计划数"]) || 0,
    });
  }

  console.log(`✅ 招生计划导入完成，共 ${records.length} 条`);
}

// 导入考试科目数据
async function importExamSubjects() {
  console.log("开始导入考试科目数据...");

  const db = await getDb();

  const pythonCode = `
import pandas as pd
import sys
import json

df = pd.read_excel('assets/招考类别及考试科目对照表.xlsx', header=2)
# 列名包含NaN，需要重新设置列名
df.columns = ['招考类别', '本科招生专业类', '公共基础', '专业基础']
# 删除招考类别为空的行
df = df.dropna(subset=['招考类别'])
# 只保留招考类别不为空且是类别的行（排除NaN）
data = df.to_dict('records')
print(json.dumps(data, ensure_ascii=False))
`;

  const records = readExcelWithPython(pythonCode);

  // 清空旧数据
  await db.delete(examSubjects);

  // 批量插入
  for (const record of records) {
    await db.insert(examSubjects).values({
      招考类别: record["招考类别"],
      本科招生专业类: record["本科招生专业类"] || "",
      公共基础: record["公共基础"] || "",
      专业基础: record["专业基础"] || "",
    });
  }

  console.log(`✅ 考试科目导入完成，共 ${records.length} 条`);
}

// 主函数
async function main() {
  try {
    await importProfessionalDirectory();
    await importEnrollmentPlan();
    await importExamSubjects();
    console.log("\n🎉 所有数据导入完成！");
  } catch (error) {
    console.error("导入失败:", error);
    process.exit(1);
  }
}

main();
