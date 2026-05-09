const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      content = content.replace(/Rs\.\s*Rs\.\s*\{/g, 'Rs. ${');
      content = content.replace(/Rs\.\s*\{/g, 'Rs. ${');

      fs.writeFileSync(fullPath, content);
    }
  }
}
processDir('frontend-react/src');
