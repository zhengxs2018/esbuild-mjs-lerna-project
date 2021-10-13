export default {
  target: 'node12',
  entryPoints: ['./src/index.ts'],
  tsconfig: 'tsconfig.json',
  formats: [
    {
      type: 'cjs',
      // 覆盖
      tsconfig: 'tsconfig.cjs.json',
    },
    {
      type: 'esm',
      // 修改输出文件后缀 
      outExtension: {
        '.js': '.mjs',
      },
    },
  ]
}
