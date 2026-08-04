const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;
  
  content = content.replace(/My Assigned Jobs/g, 'My Drone Spray Jobs');
  content = content.replace(/Assure Partner Portal/g, 'Assure DronePartner Portal');
  content = content.replace(/Partner/g, 'DronePartner');
  content = content.replace(/partner/g, 'dronePartner');
  
  // Quick fixes for spacing
  content = content.replace(/DronePartner Bookings/g, 'Drone Partner Bookings');
  content = content.replace(/DronePartner Portal/g, 'Drone Partner Portal');

  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log('Restored', filePath);
  }
}

function traverseDir(dir) {
  if (!fs.existsSync(dir)) return;
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
