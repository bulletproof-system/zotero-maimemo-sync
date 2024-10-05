# Zotero 注释同步插件

[![zotero target version](https://img.shields.io/badge/Zotero-7-green?style=flat-square&logo=zotero&logoColor=CC2936)](https://www.zotero.org)
[![Using Zotero Plugin Template](https://img.shields.io/badge/Using-Zotero%20Plugin%20Template-blue?style=flat-square&logo=github)](https://github.com/windingwind/zotero-plugin-template)

此插件用于将 Zotero 中的注释同步到墨墨背单词的云词本中。

## 使用说明

### 配置

1. 在 Zotero 中启用插件
2. 在墨墨背单词 APP 中找到**我的**->**更多设置**->**实验功能**->**开放API**，复制 token
3. 打开插件的设置面板, 设置刚刚复制的 token

### 使用

1. 在 Zotero 中添加注释
2. 在侧栏中选择要同步的云词本
3. 选择同步模式
   - 追加，在原本内容后追加**不重复**的注释
   - 覆盖，直接**覆盖**原有内容
4. 选择分割模式
   - 按注释分割
   - 按单词分割
5. 根据颜色过滤注释，如果都不选，默认同步所有注释
6. 点击同步或导出
   - 导出功能仅需要设置**分割模式**和**颜色过滤**

> [!note]
>
> 导出的 `txt` 文件可以导入至其他单词软件，例如[不背单词](https://bbdc.cn/lexis_book_index)

## 感谢

本项目基于以下仓库或 API 实现

- [windingwind/zotero-plugin-template](https://github.com/windingwind/zotero-plugin-template): Zotero 插件模板
- [墨墨开放 API](https://open.maimemo.com/#/)

## 免责声明

在 AGPL 下使用此代码。不提供任何保证。



