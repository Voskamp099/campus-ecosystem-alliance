#!/usr/bin/env node

/**
 * 前端资源优化脚本
 * - 压缩 JS 文件
 * - 压缩 CSS 文件
 * - 生成资源清单
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

const ASSETS_DIR = 'public/assets';
const BUILD_DIR = 'public/assets/dist';

// 需要压缩的 JS 文件
const JS_FILES = [
  'site.js',
  'admin.js',
  'user-center.js',
  'utils.js',
  'search.js',
  'category-hub.js',
  'directory-hub.js',
  'directory-apply.js',
  'directory-status.js',
  'nav-auth.js',
  'auth-guard.js',
  'bootstrap.js'
];

// 需要压缩的 CSS 文件
const CSS_FILES = [
  'styles.css',
  'skeleton.css'
];

async function ensureDir(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (error) {
    // 目录已存在
  }
}

async function compressJS(filename) {
  const input = path.join(ASSETS_DIR, filename);
  const output = path.join(BUILD_DIR, filename);
  
  console.log(`压缩 JS: ${filename}`);
  
  try {
    await execAsync(`npx terser ${input} -o ${output} --compress --mangle --ecma 2015`);
    
    // 获取文件大小
    const originalStat = await fs.stat(input);
    const compressedStat = await fs.stat(output);
    const saved = ((1 - compressedStat.size / originalStat.size) * 100).toFixed(1);
    
    console.log(`  原始: ${(originalStat.size / 1024).toFixed(1)}KB`);
    console.log(`  压缩: ${(compressedStat.size / 1024).toFixed(1)}KB`);
    console.log(`  节省: ${saved}%\n`);
    
    return {
      file: filename,
      original: originalStat.size,
      compressed: compressedStat.size,
      saved: saved
    };
  } catch (error) {
    console.error(`  ❌ 压缩失败: ${error.message}`);
    return null;
  }
}

async function compressCSS(filename) {
  const input = path.join(ASSETS_DIR, filename);
  const output = path.join(BUILD_DIR, filename);
  
  console.log(`压缩 CSS: ${filename}`);
  
  try {
    await execAsync(`npx cleancss ${input} -o ${output}`);
    
    // 获取文件大小
    const originalStat = await fs.stat(input);
    const compressedStat = await fs.stat(output);
    const saved = ((1 - compressedStat.size / originalStat.size) * 100).toFixed(1);
    
    console.log(`  原始: ${(originalStat.size / 1024).toFixed(1)}KB`);
    console.log(`  压缩: ${(compressedStat.size / 1024).toFixed(1)}KB`);
    console.log(`  节省: ${saved}%\n`);
    
    return {
      file: filename,
      original: originalStat.size,
      compressed: compressedStat.size,
      saved: saved
    };
  } catch (error) {
    console.error(`  ❌ 压缩失败: ${error.message}`);
    return null;
  }
}

async function generateManifest(jsResults, cssResults) {
  const manifest = {
    version: new Date().toISOString(),
    js: jsResults.filter(r => r !== null),
    css: cssResults.filter(r => r !== null)
  };
  
  const manifestPath = path.join(BUILD_DIR, 'manifest.json');
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`✅ 生成资源清单: ${manifestPath}`);
}

async function main() {
  console.log('🚀 开始前端资源优化...\n');
  
  // 创建构建目录
  await ensureDir(BUILD_DIR);
  
  // 压缩 JS 文件
  console.log('📦 压缩 JavaScript 文件\n');
  const jsResults = [];
  for (const file of JS_FILES) {
    const result = await compressJS(file);
    jsResults.push(result);
  }
  
  // 压缩 CSS 文件
  console.log('🎨 压缩 CSS 文件\n');
  const cssResults = [];
  for (const file of CSS_FILES) {
    const result = await compressCSS(file);
    cssResults.push(result);
  }
  
  // 生成资源清单
  await generateManifest(jsResults, cssResults);
  
  // 统计总节省
  const totalOriginalJS = jsResults.reduce((sum, r) => sum + (r?.original || 0), 0);
  const totalCompressedJS = jsResults.reduce((sum, r) => sum + (r?.compressed || 0), 0);
  const totalOriginalCSS = cssResults.reduce((sum, r) => sum + (r?.original || 0), 0);
  const totalCompressedCSS = cssResults.reduce((sum, r) => sum + (r?.compressed || 0), 0);
  
  const totalOriginal = totalOriginalJS + totalOriginalCSS;
  const totalCompressed = totalCompressedJS + totalCompressedCSS;
  const totalSaved = ((1 - totalCompressed / totalOriginal) * 100).toFixed(1);
  
  console.log('📊 优化统计\n');
  console.log(`总原始大小: ${(totalOriginal / 1024).toFixed(1)}KB`);
  console.log(`总压缩大小: ${(totalCompressed / 1024).toFixed(1)}KB`);
  console.log(`总节省空间: ${totalSaved}%`);
  console.log('\n✨ 优化完成！');
}

main().catch(console.error);
