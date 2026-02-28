# TimePlus Blog

一款基于 Next.js 的静态相册博客系统，支持 GitHub App 认证，可部署在 GitHub Pages、Cloudflare Pages 等平台。

## 特性

- 🎨 **TimePlus 主题** - 简约的相册风格设计
- 📝 **Markdown 写作** - 支持 Markdown 格式写作
- 🖼️ **图片相册** - 多图自动展示为相册
- 🔐 **GitHub App 认证** - 安全的 GitHub App 私钥认证
- 🚀 **静态部署** - 支持 GitHub Pages、Cloudflare Pages 等
- 📱 **响应式设计** - 完美适配移动端

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/your-username/timeplus-blog.git
cd timeplus-blog
```

### 2. 安装依赖

```bash
npm install
# 或
pnpm install
```

### 3. 配置环境变量

复制 `.env.example` 为 `.env.local` 并填写配置：

```bash
cp .env.example .env.local
```

主要配置项：
- `NEXT_PUBLIC_GITHUB_OWNER` - GitHub 用户名
- `NEXT_PUBLIC_GITHUB_REPO` - 博客仓库名
- `NEXT_PUBLIC_GITHUB_APP_ID` - GitHub App ID

### 4. 创建 GitHub App

1. 访问 [GitHub Developer Settings](https://github.com/settings/developers)
2. 点击 "New GitHub App"
3. 设置权限：Repository permissions -> Contents -> Read and write
4. 创建并下载私钥 (PEM 格式)
5. 安装 App 到你的博客仓库

### 5. 本地开发

```bash
npm run dev
```

访问 http://localhost:3000

### 6. 构建部署

```bash
npm run build
```

## 部署

### GitHub Pages

1. 修改 `next.config.ts` 中的 `basePath`（如果需要）
2. 运行 `npm run build`
3. 将 `out` 目录内容推送到 gh-pages 分支

### Cloudflare Pages

1. 连接 GitHub 仓库
2. 构建命令：`npm run build:cf`
3. 输出目录：`.open-next`

### Vercel

1. 导入 GitHub 仓库
2. 自动检测 Next.js 配置
3. 部署

## 目录结构

```
timeplus-blog/
├── content/           # 博客内容
│   ├── config.json    # 网站配置
│   └── *.md           # 文章文件
├── public/            # 静态资源
├── src/
│   ├── app/           # Next.js App Router
│   ├── components/    # React 组件
│   ├── lib/           # 工具函数
│   └── types/         # TypeScript 类型
├── photo/             # 原 Typecho 主题（参考）
└── ...
```

## 写文章

1. 访问 `/write` 页面
2. 填写标题、内容（Markdown 格式）
3. 添加图片：使用 `![描述](图片URL)` 格式
4. 发布文章

## 配置网站

访问 `/admin/config` 配置：
- 网站名称和描述
- Logo
- 社交链接
- 备案信息

## 致谢

- [TimePlus](https://github.com/zhheo/TimePlus) - 原 Typecho 主题
- [2025-blog-public](https://github.com/YYsuni/2025-blog-public) - GitHub App 认证参考
- [Next.js](https://nextjs.org/) - React 框架

## License

MIT
