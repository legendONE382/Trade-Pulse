// Package Extension Script
// Creates a zip file of the extension for easy distribution

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('📦 Packaging TradePulse Chrome Extension...\n');

const packageExtension = () => {
  try {
    // First build the extension
    console.log('🔨 Building extension...');
    execSync('npm run build:extension', { stdio: 'inherit' });
    
    // Create a releases directory if it doesn't exist
    const releasesDir = path.join(__dirname, '../releases');
    if (!fs.existsSync(releasesDir)) {
      fs.mkdirSync(releasesDir, { recursive: true });
    }
    
    // Create zip file
    const distDir = path.join(__dirname, '../dist');
    const zipFileName = `tradepulse-extension-${new Date().toISOString().split('T')[0]}.zip`;
    const zipFilePath = path.join(releasesDir, zipFileName);
    
    console.log(`\n📦 Creating zip file: ${zipFileName}`);
    
    // Use PowerShell to create zip (Windows)
    if (process.platform === 'win32') {
      execSync(`Compress-Archive -Path "${distDir}\\*" -DestinationPath "${zipFilePath}" -Force`, { 
        stdio: 'inherit',
        shell: 'powershell'
      });
    } else {
      // Use zip command on Unix systems
      execSync(`cd ${distDir} && zip -r ${zipFilePath} .`, { stdio: 'inherit' });
    }
    
    console.log('\n✅ Extension packaged successfully!');
    console.log(`📁 Package location: ${zipFilePath}`);
    console.log('\n📤 Upload this file to GitHub Releases for distribution');
    
  } catch (error) {
    console.error('❌ Packaging failed:', error.message);
    process.exit(1);
  }
};

packageExtension();
