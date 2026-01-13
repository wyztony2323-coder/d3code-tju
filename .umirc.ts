import { defineConfig } from 'umi';
import path from 'path';

export default defineConfig({
  nodeModulesTransform: {
    type: 'none',
  },
  routes: [
    { path: '/', component: '@/pages/index' },
  ],
  fastRefresh: {},
  chainWebpack(config) {
    // 修复 scheduler 模块解析问题
    // 注意：文件应该在 postinstall 脚本中创建，不要在这里创建
    const webpack = require('webpack');
    const fs = require('fs');
    const schedulerPath = require.resolve('scheduler');
    const schedulerDir = path.dirname(schedulerPath);
    const tracingDir = path.join(schedulerDir, 'tracing');
    const tracingIndex = path.join(tracingDir, 'index.js');
    
    // 使用绝对路径设置别名
    const absoluteTracingPath = path.resolve(tracingIndex);
    
    // 方法1: 使用 resolve.alias
    config.resolve.alias
      .set('scheduler', schedulerPath)
      .set('scheduler/tracing', absoluteTracingPath)
      .set('scheduler/tracing.js', absoluteTracingPath);
    
    // 方法2: 使用 NormalModuleReplacementPlugin 强制替换
    config.plugin('scheduler-tracing-fix').use(webpack.NormalModuleReplacementPlugin, [
      /^scheduler\/tracing$/,
      absoluteTracingPath
    ]);
    
    // 方法3: 确保模块解析顺序正确，优先从项目根目录查找
    config.resolve.modules
      .clear()
      .add(path.join(process.cwd(), 'node_modules'))
      .add('node_modules');
    
    // 禁用符号链接解析，确保使用真实路径
    config.resolve.symlinks(false);
    
    // 方法4: 确保 @react-three/fiber 也能找到 scheduler
    // 通过设置 resolve.alias 让所有对 scheduler 的引用都指向根目录的版本
    const rootSchedulerPath = path.join(process.cwd(), 'node_modules', 'scheduler');
    if (fs.existsSync(rootSchedulerPath)) {
      config.resolve.alias
        .set('scheduler$', path.join(rootSchedulerPath, 'index.js'));
    }
  },
});
