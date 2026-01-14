# Vercel 部署指南

## 🚀 快速部署（推荐方式）

### 方式一：通过 Vercel CLI 部署（最简单）

#### 步骤 1：安装 Vercel CLI

```bash
pnpm add -g vercel
```

或者使用 npm：
```bash
npm install -g vercel
```

#### 步骤 2：登录 Vercel

```bash
vercel login
```

按照提示操作：
- 选择你的登录方式（GitHub、GitLab、Bitbucket 或 Email）
- 完成验证

#### 步骤 3：部署项目

在项目根目录执行：

```bash
vercel
```

部署时会提示以下问题，按推荐选择：

1. **Set up and deploy?** → 选择 `Y` (Yes)
2. **Which scope?** → 选择你的用户名或团队
3. **Link to existing project?** → 选择 `N` (No)
4. **What's your project's name?** → 输入 `neimenggu-zsb` 或你喜欢的名字
5. **In which directory is your code located?** → 默认 `./`，直接回车
6. **Want to modify these settings?** → 选择 `N` (No)

#### 步骤 4：等待部署完成

Vercel 会自动：
- 检测 Next.js 项目
- 安装依赖
- 构建项目
- 部署到云端

约 1-2 分钟后，你会看到类似这样的输出：

```
✅ Production: https://neimenggu-zsb.vercel.app
```

#### 步骤 5：测试访问

在浏览器中打开部署成功后显示的网址，确认应用正常运行。

---

### 方式二：通过 Vercel 网页端部署

#### 步骤 1：推送代码到 GitHub

```bash
# 提交当前更改
git add .
git commit -m "准备部署到Vercel"
git push
```

#### 步骤 2：在 Vercel 创建项目

1. 访问 [vercel.com](https://vercel.com)
2. 登录你的账号
3. 点击 "Add New..." → "Project"
4. 点击 "Import" 导入你的 GitHub 仓库

#### 步骤 3：配置项目（通常自动识别）

Vercel 会自动识别 Next.js 项目，配置如下：

```json
Framework Preset: Next.js
Root Directory: ./
Build Command: pnpm run build
Output Directory: .next
Install Command: pnpm install
```

如果配置不正确，可以手动修改。

#### 步骤 4：点击 "Deploy"

点击 "Deploy" 按钮开始部署，约 1-2 分钟后完成。

#### 步骤 5：获取访问地址

部署完成后，Vercel 会提供一个随机生成的网址，例如：
```
https://neimenggu-zsb-abc123.vercel.app
```

---

## 🎯 自定义域名（可选）

### 添加自定义域名

1. 在 Vercel 项目中，点击 "Settings" → "Domains"
2. 输入你的域名，例如 `zsb.example.com`
3. 按照 Vercel 的提示配置 DNS 记录

### 配置 DNS 记录

在域名服务商处添加：

| Type | Name | Value |
|------|------|-------|
| CNAME | zsb | cname.vercel-dns.com |

---

## 🔄 更新部署

### 更新代码后重新部署

**方式一：推送后自动部署**
```bash
git add .
git commit -m "更新功能"
git push
```
Vercel 会自动检测到更新并重新部署。

**方式二：手动部署**
```bash
vercel --prod
```

### 查看部署日志

访问 Vercel Dashboard，点击项目 → "Deployments"，可以查看每次部署的日志。

---

## 🐛 常见问题

### 1. 部署失败 - Build Error

**问题**：构建时出现错误
**解决**：
- 检查 `pnpm run build` 在本地是否正常
- 查看 Vercel 部署日志中的错误信息
- 确保所有依赖都正确安装

### 2. 数据库连接失败

**问题**：部署后无法连接数据库
**解决**：
- Vercel 免费版无后端数据库，需要使用：
  - Vercel Postgres（付费）
  - 或其他云数据库服务（如 Supabase、PlanetScale）
- 当前项目使用 `coze-coding-dev-sdk`，需要配置环境变量

### 3. 端口问题

**问题**：应用无法访问
**解决**：
- 确认 `vercel.json` 配置正确
- 确保 `next.config.ts` 没有特殊配置

### 4. 构建超时

**问题**：构建超过 10 分钟超时
**解决**：
- 免费版构建超时时间为 60 分钟
- 如果超时，检查是否有大文件或复杂操作

---

## 📊 Vercel 免费版限制

Vercel 免费版包含：

- ✅ 无限项目
- ✅ 每月 100GB 带宽
- ✅ 自动 SSL 证书
- ✅ 全球 CDN
- ✅ 每日 100 次构建
- ✅ 100GB-hour 计算时间

对于专升本查询系统，**免费版完全足够使用**！

---

## 🎉 部署成功后

### 分享给他人

部署成功后，你可以：

1. **直接分享网址**：复制 Vercel 提供的网址
2. **生成二维码**：使用二维码生成工具将网址转为二维码
3. **设置自定义域名**（可选）：绑定自己的域名

### 查看访问统计

在 Vercel Dashboard 中可以查看：
- 访问量
- 热门页面
- 性能指标
- 错误日志

---

## 📚 更多资源

- [Vercel 官方文档](https://vercel.com/docs)
- [Next.js 部署指南](https://nextjs.org/docs/deployment)
- [Vercel 社区论坛](https://github.com/orgs/vercel/discussions)

---

## 🆘 需要帮助？

如果遇到问题：
1. 查看 [Vercel 文档](https://vercel.com/docs)
2. 在 Vercel Dashboard 查看部署日志
3. 联系 Vercel 支持（付费用户）

---

**祝部署顺利！🚀**
