"use client";

import { useState } from "react";

type UndergraduateMajorItem = {
  本科专业: string;
  本科专业类: string;
  招考类别: string;
  可报考学校数: number;
};

type SchoolDetailItem = {
  学校名称: string;
  招生计划: Array<{
    专业名称: string;
    普通计划数: number;
    专项计划数: number;
  }>;
  计划总数: number;
};

export default function Home() {
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState<any>(null);
  const [expandedMajor, setExpandedMajor] = useState<string>("");
  const [schoolCache, setSchoolCache] = useState<Map<string, any>>(new Map());
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!keyword.trim()) {
      alert("请输入专业名称");
      return;
    }

    setLoading(true);
    setHasSearched(true);
    setExpandedMajor("");
    setSchoolCache(new Map());

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

  const handleMajorClick = async (major: string) => {
    // 如果已经展开了，就折叠
    if (expandedMajor === major) {
      setExpandedMajor("");
      return;
    }

    setLoading(true);
    setExpandedMajor(major);

    try {
      // 先检查缓存
      if (schoolCache.has(major)) {
        setLoading(false);
        return;
      }

      const res = await fetch(
        `/api/by-major?keyword=${encodeURIComponent(keyword)}&undergraduateMajor=${encodeURIComponent(major)}`
      );
      const result = await res.json();

      if (result.success) {
        setSchoolCache((prev) => new Map(prev).set(major, result.data));
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
    setExpandedMajor("");
    setSchoolCache(new Map());
    setHasSearched(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 头部 */}
      <header className="bg-white shadow-md">
        <div className="mx-auto max-w-5xl px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            内蒙古青于蓝专升本
          </h1>
          <p className="mt-2 text-gray-600">
            输入专科专业，查询可报考本科专业及院校
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
                {hasSearched && (
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
            {/* 显示查询的专业名称 */}
            <div className="mb-4 flex items-center">
              <div className="h-2 flex-1 rounded-full bg-gradient-to-r from-blue-500 to-blue-600"></div>
              <span className="mx-4 text-lg font-semibold text-gray-900">
                {resultData.专科专业}
              </span>
              <div className="h-2 flex-1 rounded-full bg-gradient-to-r from-blue-600 to-blue-500"></div>
            </div>

            {/* 考试科目 - 仅在第一级显示 */}
            {resultData.level === "major" && resultData.考试科目列表 && resultData.考试科目列表.length > 0 && (
              <div className="mb-6 rounded-xl bg-green-50 p-6 shadow-lg">
                <h3 className="mb-4 text-lg font-semibold text-green-900">
                  📚 考试科目
                </h3>
                <div className="space-y-4">
                  {resultData.考试科目列表.map((exam: any, index: number) => (
                    <div key={index} className="rounded-lg bg-white p-4">
                      <div className="mb-2 flex items-center">
                        <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                          {exam.招考类别}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">
                            公共基础：
                          </span>
                          <span className="ml-2 text-gray-600">
                            {exam.考试科目?.公共基础}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">
                            专业综合：
                          </span>
                          <span className="ml-2 text-gray-600">
                            {exam.考试科目?.专业综合}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 本科专业列表 */}
            {resultData.level === "major" && resultData.本科专业列表 && (
              <div className="space-y-4">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                  🎓 可报考本科专业 ({resultData.本科专业列表.length} 个)
                </h3>
                {resultData.本科专业列表.map((major: UndergraduateMajorItem, index: number) => (
                  <div key={index}>
                    {/* 本科专业卡片 */}
                    <div
                      onClick={() => handleMajorClick(major.本科专业)}
                      className={`cursor-pointer rounded-xl border-2 p-5 transition-all hover:shadow-lg ${
                        expandedMajor === major.本科专业
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {major.本科专业}
                          </h3>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                              {major.本科专业类}
                            </span>
                            <span className="rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-800">
                              {major.招考类别}
                            </span>
                            <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                              可报考 {major.可报考学校数} 所学校
                            </span>
                          </div>
                        </div>
                        <div className="ml-4 text-2xl text-gray-400">
                          {expandedMajor === major.本科专业 ? "▼" : "▶"}
                        </div>
                      </div>
                    </div>

                    {/* 展开的学校列表 */}
                    {expandedMajor === major.本科专业 && schoolCache.has(major.本科专业) && (
                      <div className="mt-3 ml-6 space-y-3">
                        {schoolCache.get(major.本科专业)?.学校列表?.map((school: SchoolDetailItem, sIndex: number) => (
                          <div
                            key={sIndex}
                            className="rounded-xl border border-gray-200 bg-white p-5 shadow-md"
                          >
                            <div className="mb-3 flex items-center justify-between">
                              <h4 className="text-base font-semibold text-gray-900">
                                {school.学校名称}
                              </h4>
                              <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                                计划总数：{school.计划总数} 人
                              </span>
                            </div>
                            <div className="space-y-2">
                              {school.招生计划?.map((plan: any, pIndex: number) => (
                                <div
                                  key={pIndex}
                                  className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                                >
                                  <div className="flex-1">
                                    <p className="font-medium text-gray-900">
                                      {plan.专业名称}
                                    </p>
                                  </div>
                                  <div className="flex gap-4">
                                    <div className="text-center">
                                      <p className="text-xs text-gray-500">普通</p>
                                      <p className="text-base font-semibold text-blue-600">
                                        {plan.普通计划数}
                                      </p>
                                    </div>
                                    <div className="text-center">
                                      <p className="text-xs text-gray-500">专项</p>
                                      <p className="text-base font-semibold text-green-600">
                                        {plan.专项计划数}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 无结果提示 */}
        {hasSearched && resultData && resultData.本科专业列表 && resultData.本科专业列表.length === 0 && (
          <div className="rounded-xl bg-white p-8 text-center shadow-lg">
            <div className="text-6xl mb-4">😕</div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">
              未找到相关信息
            </h3>
            <p className="text-gray-600">
              请检查专科专业名称是否正确，或尝试其他关键词
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
