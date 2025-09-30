#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

async function buildProduction() {
    console.log('🏗️  開始生產環境建置...');
    
    try {
        // 1. 清理舊的建置文件
        console.log('\n🧹 1. 清理舊的建置文件...');
        if (fs.existsSync('dist')) {
            fs.rmSync('dist', { recursive: true, force: true });
            console.log('✅ 已清理 dist 目錄');
        }

        // 2. 安裝依賴
        console.log('\n📦 2. 檢查依賴...');
        try {
            execSync('npm ci', { stdio: 'inherit' });
            console.log('✅ 依賴安裝完成');
        } catch (error) {
            console.log('⚠️  使用 npm install 作為備選...');
            execSync('npm install', { stdio: 'inherit' });
        }

        // 3. 建置前端
        console.log('\n🔨 3. 建置前端應用...');
        execSync('npm run build', { stdio: 'inherit' });
        console.log('✅ 前端建置完成');

        // 4. 檢查建置結果
        console.log('\n📋 4. 檢查建置結果...');
        if (fs.existsSync('dist')) {
            const distFiles = fs.readdirSync('dist');
            console.log(`✅ dist 目錄包含 ${distFiles.length} 個文件/目錄:`);
            distFiles.forEach(file => {
                const filePath = path.join('dist', file);
                const stats = fs.statSync(filePath);
                const size = stats.isDirectory() ? '(目錄)' : `(${Math.round(stats.size / 1024)}KB)`;
                console.log(`   - ${file} ${size}`);
            });

            // 檢查關鍵文件
            const criticalFiles = ['index.html', 'assets'];
            criticalFiles.forEach(file => {
                const filePath = path.join('dist', file);
                if (fs.existsSync(filePath)) {
                    console.log(`✅ ${file} 存在`);
                } else {
                    console.log(`❌ ${file} 缺失`);
                }
            });
        } else {
            throw new Error('dist 目錄未生成');
        }

        // 5. 創建部署包
        console.log('\n📦 5. 創建部署包...');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const deployPackage = `wenwen-ai-deploy-${timestamp}.zip`;
        
        try {
            // 使用 PowerShell 創建 ZIP 文件
            const zipCommand = `Compress-Archive -Path "dist\\*" -DestinationPath "${deployPackage}" -Force`;
            execSync(`powershell -Command "${zipCommand}"`, { stdio: 'inherit' });
            console.log(`✅ 部署包已創建: ${deployPackage}`);
        } catch (error) {
            console.log('⚠️  無法創建 ZIP 包，但 dist 目錄已準備好');
        }

        // 6. 生成部署清單
        console.log('\n📝 6. 生成部署清單...');
        const deployManifest = {
            timestamp: new Date().toISOString(),
            version: 'WEN 1.0.6',
            buildType: 'production',
            files: fs.existsSync('dist') ? fs.readdirSync('dist') : [],
            packageSize: deployPackage,
            checksum: '待計算'
        };

        fs.writeFileSync('deploy-manifest.json', JSON.stringify(deployManifest, null, 2));
        console.log('✅ 部署清單已生成: deploy-manifest.json');

        console.log('\n🎉 生產環境建置完成！');
        console.log('📁 建置文件位於: dist/');
        console.log('📦 部署包: ' + (deployPackage || 'dist/ 目錄'));
        console.log('📋 部署清單: deploy-manifest.json');
        
        return true;

    } catch (error) {
        console.error('\n❌ 建置失敗:', error.message);
        return false;
    }
}

buildProduction();
