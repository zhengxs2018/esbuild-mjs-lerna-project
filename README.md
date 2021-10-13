# esbuild-mjs-lerna-project

使用 esbuild 编译 lerna 工程

## 启动项目

只支持 `node>=v14.8.0`

因为使用 `.mjs` 作为脚本，不再需要命令行标志的版本是 `node@v12.17.0`，但文件中还使用了 `Top-Level Await.` 特性，而这个特性的最低要求是 `node@v14.8.0`。

```bash
# 安装依赖
$ yarn install
```

### 编译模块

```bash
# 默认开发模式，监听文件变化并且编译代码
$ yarn build

# 编译代码不监听变化
$ yarn build --mode production

# 按顺序编译模块
$ yarn build package-a package-b ... --mode production
```
