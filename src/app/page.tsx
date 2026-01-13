"use client";

import { useState } from "react";

export default function Home() {
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!keyword.trim()) {
      alert("请输入专业名称");
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      const res = await fetch(
        `/api/comprehensive-search?keyword=${encodeURIComponent(keyword)}`
      );
      const result = await res.json();

      if (result.success) {
        setResults(result.data);
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
    setResults([]);
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
            输入专科专业或本科专业，查询可报考院校及考试科目
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
                专业名称
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="输入专科专业或本科专业，例如：园林、机械设计"
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
        {hasSearched && (
          <div className="space-y-6">
            {results.length === 0 ? (
              <div className="rounded-xl bg-white p-8 text-center shadow-lg">
                <div className="text-5xl mb-4">🔍</div>
                <p className="text-xl font-medium text-gray-700">
                  未找到匹配的专业
                </p>
                <p className="mt-2 text-gray-500">
                  请尝试输入完整的专业名称或使用其他关键词
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {results.map((item, index) => (
                  <div
                    key={index}
                    className="rounded-xl bg-white p-6 shadow-lg transition-shadow hover:shadow-xl"
                  >
                    {/* 专科专业和本科专业 */}
                    <div className="mb-6 rounded-lg bg-blue-50 p-4">
                      <div className="mb-2">
                        <span className="text-sm font-medium text-gray-600">
                          专科专业：
                        </span>
                        <span className="ml-2 text-lg font-semibold text-gray-900">
                          {item.专科专业}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">
                          可报考本科专业：
                        </span>
                        <span className="ml-2 text-xl font-bold text-blue-700">
                          {item.本科专业}
                        </span>
                        <span className="ml-3 text-sm text-gray-500">
                          （{item.本科专业类}）
                        </span>
                      </div>
                      <div className="mt-2">
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                          {item.招考类别}
                        </span>
                      </div>
                    </div>

                    {/* 考试科目 */}
                    {item.考试科目 && (
                      <div className="mb-6 rounded-lg bg-green-50 p-4">
                        <h3 className="mb-3 font-semibold text-green-900">
                          📚 考试科目
                        </h3>
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

                    {/* 可报考院校 */}
                    <div className="rounded-lg bg-orange-50 p-4">
                      <h3 className="mb-3 font-semibold text-orange-900">
                        🏫 可报考院校 ({item.可报考院校.length}所)
                      </h3>
                      {item.可报考院校.length === 0 ? (
                        <p className="text-sm text-gray-500">暂无招生计划</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-orange-200">
                                <th className="px-3 py-2 text-left font-medium text-orange-900">
                                  院校名称
                                </th>
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
                              {item.可报考院校.map((school: any, sIndex: number) => (
                                <tr key={sIndex} className="border-b border-orange-100 last:border-0">
                                  <td className="px-3 py-2 font-medium text-gray-900">
                                    {school.院校名称}
                                  </td>
                                  <td className="px-3 py-2 text-gray-700">
                                    {school.专业名称}
                                  </td>
                                  <td className="px-3 py-2 text-right text-gray-900">
                                    {school.普通计划数}人
                                  </td>
                                  <td className="px-3 py-2 text-right text-gray-900">
                                    {school.专项计划数}人
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
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
