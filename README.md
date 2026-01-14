# 内蒙古青于蓝专升本查询系统

## 项目简介

内蒙古专升本查询系统，帮助学生查询专科专业可报考的本科专业、院校及招生计划。

## 功能特点

- 📊 **专业查询**：输入专科专业名称，快速查询可报考的本科专业
- 🎓 **两级导航**：点击本科专业展开查看学校列表和招生计划
- 📚 **考试内容**：自动显示对应招考类别的考试科目
- 📱 **响应式设计**：支持手机和电脑访问

## 技术栈

- **前端框架**：Next.js 16 (App Router)
- **UI 组件**：shadcn/ui
- **样式**：Tailwind CSS 4
- **数据库**：PostgreSQL
- **ORM**：Drizzle ORM
- **语言**：TypeScript

## 本地开发

### 环境要求

- Node.js 24+
- pnpm

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

访问：http://localhost:5000

### 构建生产版本

```bash
pnpm build
```

### 启动生产服务器

```bash
pnpm start
```

访问：http://localhost:5000

## 部署到云平台

### 1. Vercel 部署（推荐）

Vercel 是 Next.js 的官方托管平台，部署最简单。

#### 步骤：

1. **安装 Vercel CLI**
   ```bash
   pnpm add -g vercel
   ```

2. **部署到 Vercel**
   ```bash
   vercel
   ```

3. **按照提示操作**：
   - 登录或注册 Vercel 账号
   - 选择项目配置（使用默认即可）
   - 等待部署完成

4. **获取访问地址**：
   部署完成后，Vercel 会提供一个类似 `https://your-app.vercel.app` 的访问地址

### 2. 部署到其他平台

#### Netlify

1. 将代码推送到 GitHub
2. 在 Netlify 中创建新站点
3. 导入 GitHub 仓库
4. 构建设置：
   - Build command: `pnpm build`
   - Publish directory: `.next`

#### Docker 部署

1. 创建 `Dockerfile`（如果还没有）：

```dockerfile
FROM node:24-alpine AS base

# 安装依赖阶段
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# 构建阶段
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN corepack enable pnpm && pnpm build

# 运行阶段
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 5000
ENV PORT=5000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

2. 构建并运行：

```bash
docker build -t zsb-query .
docker run -p 5000:5000 zsb-query
```

## 数据库配置

本项目使用 PostgreSQL 数据库存储数据：

- **专业指导目录表**：存储专科专业到本科专业的映射关系
- **招生计划表**：存储各院校的招生计划
- **考试科目表**：存储各类别的考试科目

数据库通过 `coze-coding-dev-sdk` 自动管理，无需额外配置。

## 数据导入

如需重新导入数据，运行：

```bash
pnpm exec tsx scripts/import-data.ts
```

## 项目结构

```
├── src/
│   ├── app/              # Next.js 应用路由
│   │   ├── api/          # API 路由
│   │   │   └── by-major/ # 按专业查询接口
│   │   └── page.tsx      # 首页
│   ├── components/       # React 组件
│   │   └── ui/          # shadcn/ui 组件
│   └── storage/          # 数据库相关
│       └── database/
│           └── shared/
│               └── schema.ts  # 数据库表结构
├── scripts/
│   └── import-data.ts   # 数据导入脚本
├── assets/             # Excel 数据文件
├── package.json
├── .coze              # Coze 部署配置
└── README.md
```

## 许可证

MIT
