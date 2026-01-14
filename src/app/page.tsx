"use client";

import { useState } from "react";

type SchoolItem = {
  学校名称: string;
  可报考专业数: number;
};

type MajorItem = {
  专科专业: string;
  本科专业: string;
  本科专业类: string;
  招考类别: string;
  考试科目: {
    公共基础: string;
    专业基础: string;
  } | null;
  招生计划: Array<{
    专业名称: string;
    普通计划数: number;
    专项计划数: number;
  }>;
};

export default function Home() {
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState<any>(null);
  const [selectedSchool, setSelectedSchool] = useState<string>("");
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!keyword.trim()) {
      alert("请输入专业名称");
      return;
    }

    setLoading(true);
    setHasSearched(true);
    setSelectedSchool("");

    try {
      const res = await fetch(
        `/api/by-major?keyword=${encodeURIComponent(keyword)}`
      );
      const result = await res.json();

      if (result.success) {
        setResultData(result.data);
      } else {
        alert("查询失败: " + result.error);
      }
    } catch (error) {
      console.error("查询失败:", error);
      alert("查询失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  const handleSchoolClick = async (schoolName: string) => {
    setLoading(true);
    setSelectedSchool(schoolName);

    try {
      const res = await fetch(
        `/api/by-major?keyword=${encodeURIComponent(keyword)}&school=${encodeURIComponent(schoolName)}`
      );
      const result = await res.json();

      if (result.success) {
        setResultData(result.data);
      } else {
        alert("查询失败: " + result.error);
      }
    } catch (error) {
      console.error("查询失败:", error);
      alert("查询失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = async () => {
    setLoading(true);
    setSelectedSchool("");

    try {
      const res = await fetch(
        `/api/by-major?keyword=${encodeURIComponent(keyword)}`
      );
      const result = await res.json();

      if (result.success) {
        setResultData(result.data);
      } else {
        alert("查询失败: " + result.error);
      }
    } catch (error) {
      console.error("查询失败:", error);
      alert("查询失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const resetSearch = () => {
    setKeyword("");
    setResultData(null);
    setSelectedSchool("");
    setHasSearched(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 头部 */}
      <header className="bg-white shadow-md">
        <div className="mx-auto max-w-5xl px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            内蒙古专升本查询系统
          </h1>
          <p className="mt-2 text-gray-600">
            输入专科专业，查询可报考院校及专业
          </p>
        </div>
      </header>

      {/* 主内容 */}
      <main className="mx-auto max-w-5xl px-4 py-8">
        {/* 搜索区域 */}
        <div className="mb-8 rounded-xl bg-white p-6 shadow-lg">
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                专科专业名称
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="输入专科专业，例如：园林技术、计算机应用技术"
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="rounded-lg bg-blue-600 px-8 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {loading ? "查询中..." : "查询"}
                </button>
                {hasSearched && !selectedSchool && (
                  <button
                    onClick={resetSearch}
                    className="rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    重置
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 结果展示 */}
        {hasSearched && resultData && (
          <div>
            {/* 第一级：学校列表 */}
            {resultData.level === "school" && (
              <div>
                <div className="mb-4 flex items-center">
                  <div className="h-2 flex-1 rounded-full bg-gradient-to-r from-blue-500 to-blue-600"></div>
                  <span className="mx-4 text-lg font-semibold text-gray-900">
                    {resultData.专科专业}
                  </span>
                  <div className="h-2 flex-1 rounded-full bg-gradient-to-r from-blue-600 to-blue-500"></div>
                </div>

                <div className="mb-4 text-center text-gray-600">
                  找到 {resultData.学校列表.length} 所可报考院校
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {resultData.学校列表.map((school: SchoolItem, index: number) => (
                    <button
                      key={index}
                      onClick={() => handleSchoolClick(school.学校名称)}
                      className="rounded-xl bg-white p-6 text-left shadow-lg transition-all hover:shadow-xl hover:scale-105"
                    >
                      <div className="mb-2 text-xl font-bold text-gray-900">
                        {school.学校名称}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="mr-2">🏫</span>
                        <span>可报考 {school.可报考专业数} 个专业</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 第二级：专业列表 */}
            {resultData.level === "major" && (
              <div>
                <button
                  onClick={handleBack}
                  disabled={loading}
                  className="mb-6 flex items-center rounded-lg bg-white px-4 py-2 shadow-md transition-colors hover:bg-gray-50 disabled:bg-gray-200"
                >
                  <span className="mr-2">←</span>
                  <span>返回学校列表</span>
                </button>

                <div className="mb-6 rounded-xl bg-blue-600 p-6 text-white shadow-lg">
                  <h2 className="text-2xl font-bold">{resultData.schoolName}</h2>
                  <p className="mt-2 text-blue-100">
                    共 {resultData.专业列表.length} 个可报考专业
                  </p>
                </div>

                <div className="space-y-6">
                  {resultData.专业列表.map((item: MajorItem, index: number) => (
                    <div
                      key={index}
                      className="rounded-xl bg-white p-6 shadow-lg"
                    >
                      {/* 本科专业信息 */}
                      <div className="mb-4 border-b border-gray-200 pb-4">
                        <h3 className="text-xl font-bold text-gray-900">
                          {item.本科专业}
                        </h3>
                        <div className="mt-2 space-y-1 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">专科专业：</span>
                            {item.专科专业}
                          </div>
                          <div>
                            <span className="font-medium">本科专业类：</span>
                            {item.本科专业类}
                          </div>
                          <div>
                            <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                              {item.招考类别}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 考试科目 */}
                      {item.考试科目 && (
                        <div className="mb-4 rounded-lg bg-green-50 p-4">
                          <h4 className="mb-3 font-semibold text-green-900">
                            📚 考试科目
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="font-medium text-gray-700">
                                公共基础：
                              </span>
                              <span className="ml-2 text-gray-900 whitespace-pre-line">
                                {item.考试科目.公共基础}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">
                                专业基础：
                              </span>
                              <span className="ml-2 text-gray-900">
                                {item.考试科目.专业基础}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 招生计划 */}
                      {item.招生计划.length > 0 && (
                        <div className="rounded-lg bg-orange-50 p-4">
                          <h4 className="mb-3 font-semibold text-orange-900">
                            📋 招生计划
                          </h4>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-orange-200">
                                  <th className="px-3 py-2 text-left font-medium text-orange-900">
                                    专业名称
                                  </th>
                                  <th className="px-3 py-2 text-right font-medium text-orange-900">
                                    普通计划
                                  </th>
                                  <th className="px-3 py-2 text-right font-medium text-orange-900">
                                    专项计划
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {item.招生计划.map(
                                  (plan, pIndex: number) => (
                                    <tr
                                      key={pIndex}
                                      className="border-b border-orange-100 last:border-0"
                                    >
                                      <td className="px-3 py-2 font-medium text-gray-900">
                                        {plan.专业名称}
                                      </td>
                                      <td className="px-3 py-2 text-right text-gray-900">
                                        {plan.普通计划数}人
                                      </td>
                                      <td className="px-3 py-2 text-right text-gray-900">
                                        {plan.专项计划数}人
                                      </td>
                                    </tr>
                                  )
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 无结果提示 */}
        {hasSearched && !resultData && (
          <div className="rounded-xl bg-white p-8 text-center shadow-lg">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-xl font-medium text-gray-700">
              未找到匹配的专科专业
            </p>
            <p className="mt-2 text-gray-500">
              请尝试输入完整的专业名称或使用其他关键词
            </p>
          </div>
        )}
      </main>

      {/* 底部 */}
      <footer className="mt-16 border-t border-gray-200 bg-white py-6">
        <div className="mx-auto max-w-5xl px-4 text-center text-sm text-gray-500">
          <p>数据来源：内蒙古自治区教育招生考试中心</p>
          <p className="mt-2">© 2025 内蒙古专升本查询系统</p>
        </div>
      </footer>
    </div>
  );
}
