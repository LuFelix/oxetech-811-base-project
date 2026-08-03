const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const prodSeed1 = path.join(__dirname, '../dist/prisma/seed.js');
const prodSeed2 = path.join(__dirname, '../dist/prisma/prisma/seed.js');
const devSeed = path.join(__dirname, 'seed.ts');

try {
  if (fs.existsSync(prodSeed1)) {
    console.log('🌱 Executando seed em modo produção...');
    execSync(`node ${prodSeed1}`, { stdio: 'inherit' });
  } else if (fs.existsSync(prodSeed2)) {
    console.log('🌱 Executando seed em modo produção...');
    execSync(`node ${prodSeed2}`, { stdio: 'inherit' });
  } else if (fs.existsSync(devSeed)) {
    console.log('🌱 Executando seed em modo desenvolvimento...');
    execSync(`npx tsx ${devSeed}`, { stdio: 'inherit' });
  } else {
    console.error('❌ Arquivo de seed não encontrado.');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Erro ao executar o seed:', error.message);
  process.exit(1);
}
