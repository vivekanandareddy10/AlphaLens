const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'environments');
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

const targetPath = path.join(dir, 'environment.ts');
const apiUrl = process.env.API_URL || 'http://localhost:5000/api';
const isProd = process.env.NODE_ENV === 'production' || !!process.env.API_URL;

const envConfigFile = `export const environment = {
  production: ${isProd},
  apiUrl: '${apiUrl}'
};
`;

fs.writeFileSync(targetPath, envConfigFile);
console.log(`[AlphaLens Build] environment.ts dynamically created/updated with API_URL: ${apiUrl}`);
