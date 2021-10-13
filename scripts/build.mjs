import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

import { Project } from '@lerna/project'
import { filterPackages } from '@lerna/filter-packages'

import mri from 'mri'
import { build } from 'esbuild'
import { defaults } from 'lodash-es'

import { getMergedConfig } from './config.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const argv = defaults(mri(process.argv.slice(2)), {
  mode: 'development',
})

const rootPath = resolve(__dirname, '..')

const packages = await getPackages(rootPath, argv._, argv.exclude, argv.showPrivate)

for (const pkg of packages) {
  const { configs } = await getMergedConfig(pkg, argv)

  console.groupCollapsed(`[${pkg.name}]`)
  await Promise.all(configs.map(compile))
  console.groupEnd()
}

/**
 * 
 * @param {import('esbuild').BuildOptions} options 
 */
async function compile(options) {
  const { warnings, errors } = await build(options)

  if (warnings.length > 0) {
    console.warn(warnings)
  }

  if (errors.length > 0) {
    console.error(errors)
  }

  if (options['watch']) {
    console.log('监听文件变化', options['format'])
  }
}

async function getPackages(cwd, include, exclude, showPrivate) {
  const packages = await Project.getPackages(cwd)
  return filterPackages(packages, include, exclude, showPrivate)
}
