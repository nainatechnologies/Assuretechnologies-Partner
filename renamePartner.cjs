const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;
  content = content.replace(/Drone Partner/g, 'Partner');
  content = content.replace(/DronePartner/g, 'Partner');
  content = content.replace(/drone partner/gi, 'partner');
  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log('Updated', filePath);
  }
}

function traverseDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') {
        traverseDir(fullPath);
      }
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css') || file.endsWith('.html')) {
        replaceInFile(fullPath);
      }
    }
  }
}

traverseDir('d:/AssureTechnologies/Assure-DronePartner/src');
traverseDir('d:/AssureTechnologies/Assure-DronePartner/public');
