#!/usr/bin/env node

/**
 * Script de teste de performance com Lighthouse
 * Executa auditoria de performance e exibe métricas Core Web Vitals
 *
 * Uso: node scripts/lighthouse-test.js [url]
 * Exemplo: node scripts/lighthouse-test.js http://localhost:3000
 */

const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

const DEFAULT_URL = 'http://localhost:3000';

async function runLighthouse(url) {
  console.log(`\n🚀 Iniciando auditoria Lighthouse em: ${url}\n`);

  let chrome;
  try {
    chrome = await chromeLauncher.launch({
      chromeFlags: ['--headless', '--no-sandbox', '--disable-setuid-sandbox'],
    });

    const options = {
      logLevel: 'error',
      output: 'json',
      onlyCategories: ['performance'],
      port: chrome.port,
      throttling: {
        // Simula conexão 4G rápida
        rttMs: 150,
        throughputKbps: 1.6 * 1024,
        cpuSlowdownMultiplier: 4,
      },
    };

    const runnerResult = await lighthouse(url, options);

    // Extrair métricas
    const { audits, categories } = runnerResult.lhr;
    const { performance } = categories;

    // Extrair métricas individuais
    const lcp = audits['largest-contentful-paint'];
    const fid = audits['max-potential-fid'];
    const cls = audits['cumulative-layout-shift'];
    const fcp = audits['first-contentful-paint'];
    const tti = audits['interactive'];
    const tbt = audits['total-blocking-time'];
    const si = audits['speed-index'];

    console.log('='.repeat(60));
    console.log('📊 RESULTADOS DO TESTE DE PERFORMANCE');
    console.log('='.repeat(60));

    console.log('\n🎯 Pontuação Geral:');
    console.log(`   Performance: ${Math.round(performance.score * 100)}/100`);

    console.log('\n📈 Core Web Vitals:');
    console.log(`   ${getStatus(lcp.numericValue, 2500)} LCP (Largest Contentful Paint)`);
    console.log(`      Valor: ${Math.round(lcp.numericValue)}ms (target: <2500ms)`);

    console.log(`   ${getStatus(fid.numericValue, 100)} FID (First Input Delay - Max Potential)`);
    console.log(`      Valor: ${Math.round(fid.numericValue)}ms (target: <100ms)`);

    console.log(`   ${getStatus(cls.numericValue, 0.1)} CLS (Cumulative Layout Shift)`);
    console.log(`      Valor: ${cls.numericValue.toFixed(3)} (target: <0.1)`);

    console.log('\n📉 Outras Métricas:');
    console.log(`   FCP (First Contentful Paint): ${Math.round(fcp.numericValue)}ms`);
    console.log(`   TTI (Time to Interactive): ${Math.round(tti.numericValue)}ms`);
    console.log(`   TBT (Total Blocking Time): ${Math.round(tbt.numericValue)}ms`);
    console.log(`   SI (Speed Index): ${Math.round(si.numericValue)}ms`);

    console.log('\n✅ Checklist de Validação:');
    console.log(`   ${check(lcp.numericValue < 2500)} LCP < 2.5s`);
    console.log(`   ${check(fid.numericValue < 100)} FID < 100ms`);
    console.log(`   ${check(cls.numericValue < 0.1)} CLS < 0.1`);
    console.log(`   ${check(performance.score >= 0.9)} Performance >= 90`);

    console.log('\n' + '='.repeat(60));

    // Retornar código de erro se falhar em algum critério crítico
    const passed = lcp.numericValue < 2500 && fid.numericValue < 100 && cls.numericValue < 0.1;

    if (!passed) {
      console.log('\n⚠️  ALGUNS CRITÉRIOS NÃO FORAM ATENDIDOS\n');
      process.exit(1);
    } else {
      console.log('\n✅ TODOS OS CRITÉRIOS FORAM ATENDIDOS!\n');
      process.exit(0);
    }
  } catch (error) {
    console.error('\n❌ Erro ao executar Lighthouse:', error.message);
    process.exit(1);
  } finally {
    if (chrome) {
      await chrome.kill();
    }
  }
}

function getStatus(value, threshold) {
  if (value <= threshold) return '✅';
  if (value <= threshold * 1.5) return '⚠️ ';
  return '❌';
}

function check(condition) {
  return condition ? '✅' : '❌';
}

// Executar
const url = process.argv[2] || DEFAULT_URL;
runLighthouse(url);
