// Chrome Extension Build Script
// This script helps build the TradePulse Chrome extension

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Building TradePulse Chrome Extension...\n');

// Check if icons exist
const checkIcons = () => {
  const iconSizes = ['16', '48', '128'];
  const publicDir = path.join(__dirname, '../public');
  const missingIcons = [];

  iconSizes.forEach(size => {
    const iconPath = path.join(publicDir, `icon-${size}.png`);
    if (!fs.existsSync(iconPath)) {
      missingIcons.push(`icon-${size}.png`);
    }
  });

  if (missingIcons.length > 0) {
    console.log('⚠️  Warning: Missing extension icons:');
    missingIcons.forEach(icon => console.log(`   - ${icon}`));
    console.log('\nTo create icons:');
    console.log('1. Convert public/icon.svg to PNG at sizes: 16x16, 48x48, 128x128');
    console.log('2. Use: https://cloudconvert.com/svg-to-png');
    console.log('3. Save as icon-16.png, icon-48.png, icon-128.png in public folder\n');
    return false;
  }

  console.log('✅ Extension icons found');
  return true;
};

// Copy extension files to dist
const copyExtensionFiles = () => {
  const publicDir = path.join(__dirname, '../public');
  const distDir = path.join(__dirname, '../dist');
  
  const filesToCopy = [
    'manifest.json',
    'popup.html',
    'popup.js',
    'background.js',
    'icon-16.png',
    'icon-48.png',
    'icon-128.png'
  ];

  console.log('📋 Copying extension files to dist/...');
  
  filesToCopy.forEach(file => {
    const srcPath = path.join(publicDir, file);
    const destPath = path.join(distDir, file);
    
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath);
      console.log(`   ✓ ${file}`);
    } else {
      console.log(`   ⚠ ${file} not found (skipping)`);
    }
  });
  
  console.log('✅ Extension files copied\n');
};

// Build the extension
const buildExtension = () => {
  try {
    console.log('📦 Building extension with Vite...\n');
    execSync('npm run build', { stdio: 'inherit' });
    console.log('\n✅ Build completed successfully!');
    
    copyExtensionFiles();
    
    console.log('📁 Extension files are in the dist/ directory');
    console.log('\n🔧 To load the extension in Chrome:');
    console.log('1. Open chrome://extensions/');
    console.log('2. Enable "Developer mode"');
    console.log('3. Click "Load unpacked"');
    console.log('4. Select the dist folder');
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
};

// Run the build process
const iconsExist = checkIcons();
if (iconsExist || process.argv.includes('--force')) {
  buildExtension();
} else {
  console.log('❌ Build cancelled. Please create the missing icons first.');
  console.log('   Run with --force to build anyway (extension may not load properly)');
  process.exit(1);
}
