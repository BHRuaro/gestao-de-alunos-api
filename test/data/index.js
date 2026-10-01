import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const caminho = path.join(__dirname, 'testData.json');

const dados = JSON.parse(readFileSync(caminho, 'utf8'));

export default dados;
