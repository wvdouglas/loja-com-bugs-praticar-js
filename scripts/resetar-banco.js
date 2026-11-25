// Volta o banco ao estado inicial (com os dados "problemáticos" originais).
const fs = require('fs');
const path = require('path');

const origem = path.join(__dirname, '..', 'data', 'db.seed.json');
const destino = path.join(__dirname, '..', 'data', 'db.json');

fs.copyFileSync(origem, destino);
console.log('✅ Banco resetado: data/db.json restaurado a partir de data/db.seed.json');
