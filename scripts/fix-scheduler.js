const fs = require('fs');
const path = require('path');

// 修复根目录的 scheduler/tracing
function fixSchedulerTracing(schedulerDir) {
  const tracingDir = path.join(schedulerDir, 'tracing');
  const tracingJs = path.join(schedulerDir, 'tracing.js');
  const tracingIndex = path.join(tracingDir, 'index.js');
  const tracingPackage = path.join(tracingDir, 'package.json');

  if (fs.existsSync(tracingJs)) {
    // 创建 tracing 目录
    if (!fs.existsSync(tracingDir)) {
      fs.mkdirSync(tracingDir, { recursive: true });
    }
    
    // 创建 tracing/index.js，使用正确的相对路径
    if (!fs.existsSync(tracingIndex)) {
      fs.writeFileSync(tracingIndex, `'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('../cjs/scheduler-tracing.production.min.js');
} else {
  module.exports = require('../cjs/scheduler-tracing.development.js');
}
`);
    }
    
    // 创建 package.json
    if (!fs.existsSync(tracingPackage)) {
      fs.writeFileSync(tracingPackage, JSON.stringify({
        name: 'scheduler-tracing',
        version: '0.20.2',
        main: 'index.js'
      }, null, 2));
    }
    
    return true;
  }
  return false;
}

// 1. 修复根目录的 scheduler
const rootSchedulerDir = path.join(__dirname, '..', 'node_modules', 'scheduler');
if (fixSchedulerTracing(rootSchedulerDir)) {
  console.log('✓ Fixed root scheduler/tracing module structure');
}

// 2. 修复 @react-three/fiber 的嵌套 scheduler
const fiberSchedulerDir = path.join(__dirname, '..', 'node_modules', '@react-three', 'fiber', 'node_modules', 'scheduler');
if (!fs.existsSync(fiberSchedulerDir)) {
  // 如果不存在，复制整个 scheduler 目录
  const fiberNodeModules = path.join(__dirname, '..', 'node_modules', '@react-three', 'fiber', 'node_modules');
  if (!fs.existsSync(fiberNodeModules)) {
    fs.mkdirSync(fiberNodeModules, { recursive: true });
  }
  
  // 复制 scheduler 目录
  if (fs.existsSync(rootSchedulerDir)) {
    const { execSync } = require('child_process');
    try {
      // Windows 使用 xcopy，Linux/Mac 使用 cp
      if (process.platform === 'win32') {
        execSync(`xcopy /E /I /Y "${rootSchedulerDir}" "${fiberSchedulerDir}"`, { stdio: 'inherit' });
      } else {
        execSync(`cp -r "${rootSchedulerDir}" "${fiberSchedulerDir}"`, { stdio: 'inherit' });
      }
      console.log('✓ Copied scheduler to @react-three/fiber/node_modules');
    } catch (e) {
      // 如果命令失败，使用 fs 手动复制
      console.log('Using fs to copy scheduler...');
      function copyDir(src, dest) {
        if (!fs.existsSync(dest)) {
          fs.mkdirSync(dest, { recursive: true });
        }
        const entries = fs.readdirSync(src, { withFileTypes: true });
        for (const entry of entries) {
          const srcPath = path.join(src, entry.name);
          const destPath = path.join(dest, entry.name);
          if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
          } else {
            fs.copyFileSync(srcPath, destPath);
          }
        }
      }
      copyDir(rootSchedulerDir, fiberSchedulerDir);
      console.log('✓ Copied scheduler to @react-three/fiber/node_modules (using fs)');
    }
  }
}

// 3. 修复嵌套的 scheduler/tracing
if (fs.existsSync(fiberSchedulerDir)) {
  if (fixSchedulerTracing(fiberSchedulerDir)) {
    console.log('✓ Fixed @react-three/fiber scheduler/tracing module structure');
  }
}

console.log('✓ All scheduler fixes applied');
