import { resolve } from 'path'
import { existsSync } from 'fs'

import builtinModules from 'builtin-modules'

import { cosmiconfig } from 'cosmiconfig'
import TsLoader from '@endemolshinegroup/cosmiconfig-typescript-loader'

import { dtsPlugin } from 'esbuild-plugin-d.ts'

import { pick } from 'lodash-es'

const moduleName = 'build'
const explorer = cosmiconfig(moduleName, {
  searchPlaces: [
    'package.json',
    `.${moduleName}rc`,
    `.${moduleName}rc.json`,
    `.${moduleName}rc.yaml`,
    `.${moduleName}rc.yml`,
    `.${moduleName}rc.ts`,
    `.${moduleName}rc.js`,
    `${moduleName}.config.ts`,
    `${moduleName}.config.js`,
  ],
  loaders: {
    '.ts': TsLoader.default,
  },
})

export async function getUserConfig(cwd, options) {
  const result = await explorer.search(cwd)
  const userConfig = result ? result.config : {}

  if (typeof userConfig === 'function') {
    return userConfig(cwd, options)
  }

  return userConfig
}

export async function getMergedConfig(pkg, opts = {}) {
  const cwd = pkg['location']

  const userConfig = await getUserConfig(cwd, {
    mode: opts['mode'] || 'development',
  })

  // tsconfig.json 文件路径
  const tsconfigFilePath =
    opts['tsconfig'] || userConfig['tsconfig'] || 'tsconfig.json'

  // todo
  const isTs = existsSync(resolve(cwd, tsconfigFilePath))

  const root = userConfig['root'] || cwd
  const mode = opts['mode'] || userConfig['mode'] || 'development'

  const charset = opts['charset'] || userConfig['charset']
  const outdir = opts['outdir'] || userConfig['outdir'] || 'dist'

  const extraOptions = pick(userConfig, [
    'globalName',
    'entryNames',
    'define',
    'outExtension',
    'minify'
  ])

  const plugins = userConfig['plugins'] || []

  /**
   * @type {import('esbuild').BuildOptions}
   */
  const defaultsOptions = {
    ...userConfig['esbuild'],
    ...extraOptions,
    absWorkingDir: root,
    charset: charset ?? 'utf8',
    target: opts['target'] || userConfig['target'],
    entryPoints: opts['entryPoints'] ||
      userConfig['entryPoints'] || [`src/index.${isTs ? 'ts' : 'js'}`],
    outdir: outdir,
    plugins,
    sourcemap: opts['sourcemap'] || userConfig['sourcemap'],
    tsconfig: tsconfigFilePath,
    write: true,
    bundle: true,
    watch: mode === 'development' || opts['watch'] || userConfig['watch'],
    external: userConfig['external'] || getPackagesDeps(pkg),
  }

  const configs = []

  const formats = opts['formats'] || userConfig['formats'] || ['esm', 'cjs']
  for (const format of formats) {
    if (typeof format === 'string') {
      configs.push({ ...defaultsOptions, format })
    } else {
      const { type, ...otherOptions } = format
      configs.push({ ...defaultsOptions, ...otherOptions, format: type })
    }
  }

  // hack 生成 dts 文件
  // todo 支持 BuildOptions 的 tsconfig 配置
  // todo 支持 tsconfig.json#declarationDir配置
  if (isTs) {
    const config = configs[0]
    config.plugins.unshift(
      dtsPlugin({
        tsconfig: resolve(cwd, config['tsconfig']),
        outDir: resolve(cwd, userConfig['declarationDir'] ?? 'types'),
      }),
    )
  }

  return {
    root,
    mode,
    configs,
  }
}

function getPackagesDeps(pkg) {
  const deps = Array.from(
    new Set(
      [
        Object.keys(pkg.dependencies || {}),
        Object.keys(pkg.peerDependencies || {}),
        Object.keys(pkg.optionalDependencies || {}),
        Object.keys(pkg.devDependencies || {}),
      ].flat(),
    ),
  )
  return deps.concat(builtinModules)
}
