# TimePlus Blog

一款基于 Next.js 15 的现代化相册博客系统，采用洪墨时光主题风格，支持 GitHub App 认证与存储，可部署在 Vercel、Cloudflare Pages、GitHub Pages 等平台。

![TimePlus Blog](https://img.shields.io/badge/TimePlus-Blog-blue)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![React](https://img.shields.io/badge/React-19-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-06B6D4)

## ✨ 特性

- 🎨 **洪墨时光主题** - 简约优雅的相册风格设计，源自 [TimePlus](https://github.com/zhheo/TimePlus)
- 📝 **Markdown 写作** - 支持 Markdown 格式写作，实时预览
- 🖼️ **图片相册** - 多图自动展示为相册，支持灯箱浏览、滑动切换
- 🔐 **GitHub App 认证** - 安全的 GitHub App 私钥认证机制
- 🔑 **授权码保护** - 创建文章需要授权码，防止未授权发布
- ☁️ **GitHub 存储** - 文章和配置直接存储在 GitHub 仓库中
- 🚀 **多平台部署** - 支持 Vercel、Cloudflare Pages、GitHub Pages 等
- 📱 **响应式设计** - 完美适配桌面端、平板和移动端
- 🌙 **深色模式** - 原生深色主题设计
- 🔍 **图片灯箱** - 支持缩放、滑动切换、手势操作
- 🏷️ **分类管理** - 文章分类展示，支持筛选
- 👤 **关于页面** - 可配置的个人介绍和社交链接
- 🔧 **后台管理** - 完整的文章管理和网站配置后台

## 🚀 快速开始

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
# 或
yarn install
```

### 3. 配置环境变量

复制 `.env.example` 为 `.env.local` 并填写配置：

```bash
cp .env.example .env.local
```

编辑 `.env.local`：

```env
# 管理员认证 (必需)
ADMIN_PASSWORD=your-secure-password
ADMIN_SECRET_KEY=your-secret-key-for-creating-posts
JWT_SECRET=your-jwt-secret-key-change-in-production

# GitHub 配置 (必需)
GITHUB_OWNER=your-github-username
GITHUB_REPO=your-blog-repo
GITHUB_BRANCH=main
GITHUB_APP_ID=your-github-app-id
GITHUB_PRIVATE_KEY=-----BEGIN RSA PRIVATE KEY-----
...
-----END RSA PRIVATE KEY-----
```

**安全提示**: 
- `ADMIN_PASSWORD` 用于登录后台
- `ADMIN_SECRET_KEY` 用于创建文章，建议与密码不同，只告知可信人员

### 4. 创建 GitHub App

1. 访问 [GitHub Developer Settings](https://github.com/settings/developers)
2. 点击 "New GitHub App"
3. 填写基本信息：
   - **GitHub App name**: 你的应用名称
   - **Homepage URL**: 你的网站地址
   - **Webhook**: 取消勾选 "Active"
4. 设置权限：
   - **Repository permissions** -> **Contents** -> **Read and write**
5. 点击 "Create GitHub App"
6. 在应用页面生成并下载私钥 (Private key)
7. 记录 **App ID**
8. 点击 "Install App"，安装到你的博客仓库
9. 将下载的私钥内容复制到 `.env.local` 的 `GITHUB_PRIVATE_KEY`

### 5. 本地开发

```bash
npm run dev
```

访问 http://localhost:3000

后台管理：http://localhost:3000/admin

### 6. 构建部署

```bash
npm run build
```

## 📦 部署指南

### Vercel (推荐)

1. 在 [Vercel](https://vercel.com) 导入 GitHub 仓库
2. 在 Environment Variables 中添加所有环境变量
3. 自动部署

### Cloudflare Pages

1. 连接 GitHub 仓库
2. 构建设置：
   - **Build command**: `npm run build:cf`
   - **Build output directory**: `.open-next`
3. 添加环境变量
4. 部署

### GitHub Pages

1. 修改 `next.config.ts` 添加 `output: 'export'`
2. 运行 `npm run build`
3. 将 `out` 目录内容推送到 `gh-pages` 分支

## 📁 目录结构

```
timeplus-blog/
├── content/              # 博客内容存储
│   ├── config.json       # 网站配置
│   ├── index.json        # 文章索引
│   └── *.md              # 文章文件
├── public/               # 静态资源
│   ├── favicon.ico
│   └── ...
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── admin/        # 后台管理页面
│   │   ├── api/          # API 路由
│   │   ├── write/        # 写文章页面
│   │   ├── page.tsx      # 首页
│   │   └── layout.tsx    # 根布局
│   ├── components/       # React 组件
│   │   ├── Header.tsx    # 导航栏
│   │   ├── Footer.tsx    # 页脚/关于面板
│   │   ├── PhotoOverlay.tsx  # 图片灯箱
│   │   └── ...
│   ├── lib/              # 工具函数
│   │   ├── blog.ts       # 博客数据操作
│   │   ├── github-client.ts  # GitHub API 客户端
│   │   └── ...
│   └── types/            # TypeScript 类型
│       └── blog.ts
├── photo/                # 原 Typecho 主题（参考）
├── .env.example          # 环境变量示例
├── next.config.ts        # Next.js 配置
└── package.json
```

## 📝 使用指南

### 写文章

1. 访问 `/admin` 登录后台
2. 点击 "写文章" 或访问 `/write`
3. 填写文章信息：
   - **标题**: 文章标题
   - **内容**: 支持 Markdown 格式
   - **分类**: 选择或输入分类
   - **标签**: 可选，逗号分隔
   - **设备**: 拍摄设备（可选）
   - **位置**: 拍摄地点（可选）
4. 添加图片：
   - 使用 Markdown 语法：`![描述](图片URL)`
   - 支持多张图片，会自动展示为相册
5. 点击 "发布"

### 配置网站

访问 `/admin/config` 配置：

- **网站名称**: 站点标题
- **网站描述**: 站点副标题
- **Logo**: 网站图标 URL
- **作者**: 作者名称
- **社交链接**:
  - 主页
  - 微博
  - GitHub
  - QQ
  - Telegram
  - Bilibili
  - Email
- **备案信息**: ICP 备案号
- **公安备案**: 公安网备号

### 管理文章

访问 `/admin`：
- 查看所有文章列表
- 编辑文章
- 删除文章
- 查看分类统计

## 🔧 环境变量说明

| 变量名 | 必填 | 说明 |
|--------|------|------|
| `ADMIN_PASSWORD` | ✅ | 管理员登录密码 |
| `ADMIN_SECRET_KEY` | ✅ | 创建文章授权码 |
| `JWT_SECRET` | ✅ | JWT 签名密钥 |
| `GITHUB_OWNER` | ✅ | GitHub 用户名 |
| `GITHUB_REPO` | ✅ | 博客仓库名 |
| `GITHUB_BRANCH` | ✅ | 分支名，默认 main |
| `GITHUB_APP_ID` | ✅ | GitHub App ID |
| `GITHUB_PRIVATE_KEY` | ✅ | GitHub App 私钥 |
| `NEXT_PUBLIC_SITE_NAME` | ❌ | 网站名称 |
| `NEXT_PUBLIC_SITE_DESCRIPTION` | ❌ | 网站描述 |
| `NEXT_PUBLIC_SITE_AUTHOR` | ❌ | 网站作者 |
| `NEXT_PUBLIC_SITE_URL` | ❌ | 网站 URL |
| `BLOG_SLUG_KEY` | ❌ | Slug 生成密钥 |

## 🛠️ 技术栈

- **框架**: [Next.js 15](https://nextjs.org/) (App Router)
- **UI 库**: [React 19](https://react.dev/)
- **语言**: [TypeScript 5](https://www.typescriptlang.org/)
- **样式**: [Tailwind CSS 4](https://tailwindcss.com/)
- **图标**: [Lucide React](https://lucide.dev/) + [Iconify](https://iconify.design/)
- **动画**: [Framer Motion](https://www.framer.com/motion/)
- **Markdown**: [Marked](https://marked.js.org/)
- **状态管理**: [Zustand](https://github.com/pmndrs/zustand)
- **认证**: JWT + GitHub App

## 🎨 主题定制

### 修改颜色

编辑 `src/app/globals.css`：

```css
:root {
  --background: #121212;
  --foreground: #ffffff;
  --accent: #a0a0a1;
}
```

### 修改布局

编辑组件文件：
- `src/components/Header.tsx` - 导航栏
- `src/components/Footer.tsx` - 页脚/关于面板
- `src/components/PhotoOverlay.tsx` - 图片灯箱

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 致谢

- [TimePlus](https://github.com/zhheo/TimePlus) - 原 Typecho 主题作者 [洪墨时光](https://github.com/zhheo)
- [2025-blog-public](https://github.com/YYsuni/2025-blog-public) - GitHub App 认证参考
- [Next.js](https://nextjs.org/) - React 框架
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架

## 📜 许可证

[MIT](LICENSE)

---

**主题**: [洪墨时光](https://github.com/zhheo/TimePlus)  
**魔改**: [异飨客](https://github.com/yxksw)
