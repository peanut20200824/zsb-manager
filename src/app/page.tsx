"use client";

import { useState, useEffect } from "react";

type TabType = "directory" | "enrollment" | "subjects";

interface TabConfig {
  id: TabType;
  label: string;
}

const tabs: TabConfig[] = [
  { id: "directory", label: "专业目录" },
  { id: "enrollment", label: "招生计划" },
  { id: "subjects", label: "考试科目" },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>("directory");
  const [keyword, setKeyword] = useState("");
  const [filter, setFilter] = useState("");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<{
    招考类别列表: string[];
    院校名称列表: string[];
  }>({ 招考类别列表: [], 院校名称列表: [] });

  // 加载选项数据
  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      const res = await fetch("/api/options");
      const result = await res.json();
      if (result.success) {
        setOptions(result.data);
      }
    } catch (error) {
      console.error("加载选项失败:", error);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      let url = `/api/${activeTab}?`;
      const params: string[] = [];

      if (keyword) {
        params.push(`keyword=${encodeURIComponent(keyword)}`);
      }

      if (activeTab === "directory" && filter) {
        params.push(`招考类别=${encodeURIComponent(filter)}`);
      }

      if (activeTab === "enrollment" && filter) {
        params.push(`院校名称=${encodeURIComponent(filter)}`);
      }

      if (activeTab === "subjects" && filter) {
        params.push(`招考类别=${encodeURIComponent(filter)}`);
      }

      url += params.join("&");

      const res = await fetch(url);
      const result = await res.json();

      if (result.success) {
        setData(result.data);
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

  const resetSearch = () => {
    setKeyword("");
    setFilter("");
    setData([]);
  };

  const renderFilter = () => {
    if (activeTab === "directory") {
      return (
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
        >
          <option value="">全部招考类别</option>
          {options.招考类别列表.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      );
    }

    if (activeTab === "enrollment") {
      return (
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
        >
          <option value="">全部院校</option>
          {options.院校名称列表.map((school) => (
            <option key={school} value={school}>
              {school}
            </option>
          ))}
        </select>
      );
    }

    if (activeTab === "subjects") {
      return (
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
        >
          <option value="">全部招考类别</option>
          {options.招考类别列表.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      );
    }

    return null;
  };

  const renderTable = () => {
    if (data.length === 0) {
      return (
        <div className="flex min-h-[200px] items-center justify-center text-gray-500">
          暂无数据
        </div>
      );
    }

    if (activeTab === "directory") {
      return (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left font-medium">专科专业</th>
                <th className="px-4 py-3 text-left font-medium">本科专业类</th>
                <th className="px-4 py-3 text-left font-medium">本科专业</th>
                <th className="px-4 py-3 text-left font-medium">招考类别</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">{item.专科专业}</td>
                  <td className="px-4 py-3">{item.本科专业类}</td>
                  <td className="px-4 py-3">{item.本科专业}</td>
                  <td className="px-4 py-3">{item.招考类别}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (activeTab === "enrollment") {
      return (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left font-medium">院校名称</th>
                <th className="px-4 py-3 text-left font-medium">专业名称</th>
                <th className="px-4 py-3 text-right font-medium">普通计划数</th>
                <th className="px-4 py-3 text-right font-medium">专项计划数</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">{item.院校名称}</td>
                  <td className="px-4 py-3">{item.专业名称}</td>
                  <td className="px-4 py-3 text-right">{item.普通计划数}</td>
                  <td className="px-4 py-3 text-right">{item.专项计划数}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (activeTab === "subjects") {
      return (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left font-medium">招考类别</th>
                <th className="px-4 py-3 text-left font-medium">本科招生专业类</th>
                <th className="px-4 py-3 text-left font-medium">公共基础</th>
                <th className="px-4 py-3 text-left font-medium">专业基础</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">{item.招考类别}</td>
                  <td className="px-4 py-3">{item.本科招生专业类}</td>
                  <td className="px-4 py-3 whitespace-pre-wrap">{item.公共基础}</td>
                  <td className="px-4 py-3">{item.专业基础}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            内蒙古专升本查询系统
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            2025年普通高等教育专升本考试招生计划查询
          </p>
        </div>
      </header>

      {/* 主内容 */}
      <main className="mx-auto max-w-4xl px-4 py-6">
        {/* 标签页 */}
        <div className="mb-6 flex space-x-1 rounded-lg bg-white p-1 shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                resetSearch();
              }}
              className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 搜索区域 */}
        <div className="mb-6 space-y-4 rounded-lg bg-white p-6 shadow-sm">
          <div className="space-y-4">
            {/* 关键词搜索 */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                关键词搜索
              </label>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                placeholder={
                  activeTab === "directory"
                    ? "输入专科专业或本科专业名称"
                    : activeTab === "enrollment"
                    ? "输入院校名称或专业名称"
                    : "输入招考类别"
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* 筛选条件 */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                筛选条件
              </label>
              {renderFilter()}
            </div>

            {/* 操作按钮 */}
            <div className="flex space-x-3">
              <button
                onClick={handleSearch}
                disabled={loading}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? "查询中..." : "查询"}
              </button>
              <button
                onClick={resetSearch}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                重置
              </button>
            </div>
          </div>
        </div>

        {/* 结果展示 */}
        <div className="rounded-lg bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-medium text-gray-900">
              查询结果
              {data.length > 0 && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  （共 {data.length} 条）
                </span>
              )}
            </h2>
          </div>
          <div className="px-6 py-4">{renderTable()}</div>
        </div>
      </main>

      {/* 底部 */}
      <footer className="mt-12 border-t border-gray-200 bg-white py-6">
        <div className="mx-auto max-w-4xl px-4 text-center text-sm text-gray-500">
          <p>数据来源：内蒙古自治区教育招生考试中心</p>
          <p className="mt-2">© 2025 内蒙古专升本查询系统</p>
        </div>
      </footer>
    </div>
  );
}
