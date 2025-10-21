#!/usr/bin/env node

/**
 * Tulumbak Port Validation Script
 * 
 * Bu script, projede tanımlı portların doğru şekilde kullanıldığını kontrol eder.
 * Port çakışmalarını önler ve tutarlılığı sağlar.
 */

const fs = require('fs');
const path = require('path');

// Tulumbak port konfigürasyonu
const REQUIRED_PORTS = {
  API: 3001,
  STOREFRONT: 3003,
  ADMIN_DASHBOARD: 3002
};

const PORT_NAMES = {
  3001: 'API',
  3002: 'Admin Dashboard', 
  3003: 'Storefront'
};

// Port kullanım durumunu kontrol et
function checkPortUsage(port) {
  return new Promise((resolve) => {
    const net = require('net');
    const server = net.createServer();
    
    server.listen(port, () => {
      server.once('close', () => {
        resolve(false); // Port kullanılabilir
      });
      server.close();
    });
    
    server.on('error', () => {
      resolve(true); // Port kullanımda
    });
  });
}

// Environment dosyalarını kontrol et
function validateEnvFiles() {
  const errors = [];
  
  // Storefront .env.local kontrolü
  const storeEnvPath = path.join(__dirname, '../apps/store/.env.local');
  if (fs.existsSync(storeEnvPath)) {
    const storeEnv = fs.readFileSync(storeEnvPath, 'utf8');
    if (!storeEnv.includes('PORT=3003')) {
      errors.push('❌ Storefront .env.local: PORT=3003 olmalı');
    }
    if (!storeEnv.includes('NEXT_PUBLIC_API_URL=http://localhost:3001/api')) {
      errors.push('❌ Storefront .env.local: NEXT_PUBLIC_API_URL=http://localhost:3001/api olmalı');
    }
  } else {
    errors.push('⚠️  Storefront .env.local dosyası bulunamadı');
  }
  
  // Admin Dashboard .env.local kontrolü
  const adminEnvPath = path.join(__dirname, '../apps/admin-dashboard/.env.local');
  if (fs.existsSync(adminEnvPath)) {
    const adminEnv = fs.readFileSync(adminEnvPath, 'utf8');
    if (!adminEnv.includes('PORT=3002')) {
      errors.push('❌ Admin Dashboard .env.local: PORT=3002 olmalı');
    }
    if (!adminEnv.includes('NEXT_PUBLIC_API_URL=http://localhost:3001/api')) {
      errors.push('❌ Admin Dashboard .env.local: NEXT_PUBLIC_API_URL=http://localhost:3001/api olmalı');
    }
  } else {
    errors.push('⚠️  Admin Dashboard .env.local dosyası bulunamadı');
  }
  
  return errors;
}

// Package.json port kontrolü
function validatePackageJson() {
  const errors = [];
  
  // Storefront package.json
  const storePackagePath = path.join(__dirname, '../apps/store/package.json');
  if (fs.existsSync(storePackagePath)) {
    const storePackage = JSON.parse(fs.readFileSync(storePackagePath, 'utf8'));
    if (storePackage.scripts?.dev && !storePackage.scripts.dev.includes('--port 3003')) {
      errors.push('❌ Storefront package.json: dev script --port 3003 içermeli');
    }
  }
  
  // Admin Dashboard package.json
  const adminPackagePath = path.join(__dirname, '../apps/admin-dashboard/package.json');
  if (fs.existsSync(adminPackagePath)) {
    const adminPackage = JSON.parse(fs.readFileSync(adminPackagePath, 'utf8'));
    if (adminPackage.scripts?.dev && !adminPackage.scripts.dev.includes('--port 3002')) {
      errors.push('❌ Admin Dashboard package.json: dev script --port 3002 içermeli');
    }
  }
  
  return errors;
}

// Ana kontrol fonksiyonu
async function validatePorts() {
  console.log('🔍 Tulumbak Port Validation başlatılıyor...\n');
  
  const errors = [];
  
  // Environment dosyalarını kontrol et
  console.log('📁 Environment dosyaları kontrol ediliyor...');
  errors.push(...validateEnvFiles());
  
  // Package.json dosyalarını kontrol et
  console.log('📦 Package.json dosyaları kontrol ediliyor...');
  errors.push(...validatePackageJson());
  
  // Port kullanım durumunu kontrol et
  console.log('🔌 Port kullanım durumu kontrol ediliyor...');
  for (const [port, name] of Object.entries(PORT_NAMES)) {
    const isInUse = await checkPortUsage(parseInt(port));
    if (isInUse) {
      console.log(`✅ Port ${port} (${name}): Kullanımda`);
    } else {
      console.log(`⚪ Port ${port} (${name}): Boş`);
    }
  }
  
  // Sonuçları göster
  console.log('\n📊 Validation Sonuçları:');
  if (errors.length === 0) {
    console.log('✅ Tüm port konfigürasyonları doğru!');
    console.log('\n🚀 Çalıştırma komutları:');
    console.log('  API:           cd apps/api && pnpm dev');
    console.log('  Storefront:    cd apps/store && pnpm dev');
    console.log('  Admin:         cd apps/admin-dashboard && pnpm dev');
  } else {
    console.log('❌ Hatalar bulundu:');
    errors.forEach(error => console.log(`  ${error}`));
    console.log('\n🔧 Düzeltme adımları:');
    console.log('  1. .env.local dosyalarını oluşturun');
    console.log('  2. Package.json dev scriptlerini güncelleyin');
    console.log('  3. Port çakışmalarını kontrol edin');
  }
  
  process.exit(errors.length > 0 ? 1 : 0);
}

// Script çalıştır
if (require.main === module) {
  validatePorts().catch(console.error);
}

module.exports = { validatePorts, REQUIRED_PORTS, PORT_NAMES };
