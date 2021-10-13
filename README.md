# esbuild-mjs-lerna-project

使用 esbuild 编译 lerna 工程

## 启动项目

必须使用 `node>=12` 的版本

```bash
# 安装依赖
$ yarn install
```

### 编译模块

```bash
# 监听文件变化并且编译代码
$ yarn build --mode production

# 按顺序编译模块
$ yarn build package-a package-b ... --mode production
```
