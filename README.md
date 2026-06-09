# 不羁的博客

个人技术博客，基于 Astro 4 + Tailwind CSS 构建。

## 特性

- ✅ 暗黑/亮色模式切换 + 记忆
- ✅ 阅读进度条
- ✅ 返回顶部按钮
- ✅ 文章目录（TOC）侧边栏
- ✅ 搜索功能（Fuse.js）
- ✅ 标签云 + 标签页
- ✅ 多级分类系统
- ✅ 文章归档（按年份分组）
- ✅ 上一篇/下一篇导航
- ✅ 代码块复制按钮
- ✅ 图片灯箱效果
- ✅ RSS 订阅
- ✅ 站点统计（文章数/总字数）
- ✅ 响应式设计

## 快速开始

```bash
npm install
npm run dev
```

打开 http://localhost:4321

## 构建

```bash
npm run build
```

静态文件输出到 `dist/` 目录。

## 部署

GitHub Actions 自动部署到 GitHub Pages（推送至 main 分支时触发）。

## 目录结构

```
src/
  components/      # 组件
  layouts/         # 布局
  pages/           # 页面
  content/blog/    # 文章
  styles/          # 全局样式
public/            # 静态资源
scripts/           # 迁移脚本
```

## 文章 frontmatter

```yaml
---
title: "文章标题"
description: "文章描述"
pubDate: 2020-01-01
updatedDate: 2020-02-01  # 可选
tags: ["标签1", "标签2"]
category: "分类 / 子分类"  # 可选
heroImage: "/blog-placeholder-1.jpg"  # 可选
---
```

## 从 Hexo 迁移

项目包含 `scripts/migrate-old-hexo.mjs` 脚本，可将旧 Hexo 博客的 HTML 导出转换为 Astro Content Collections 格式。
