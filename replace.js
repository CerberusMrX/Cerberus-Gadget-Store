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
      
      // Replace JSX $ signs
      content = content.replace(/\$({Number)/g, 'Rs. $1');
      content = content.replace(/>\$/g, '>Rs. ');
      content = content.replace(/>\s*\$/g, '>Rs. ');
      content = content.replace(/\$({.*?subtotal.*?})/g, 'Rs. $1');
      content = content.replace(/\$({.*?total.*?})/g, 'Rs. $1');
      content = content.replace(/\$({.*?price.*?})/g, 'Rs. $1');
      content = content.replace(/\$({.*?amount.*?})/g, 'Rs. $1');
      content = content.replace(/\$({.*?fee.*?})/g, 'Rs. $1');
      content = content.replace(/\$({.*?tax.*?})/g, 'Rs. $1');
      content = content.replace(/\$({.*?rev.*?})/g, 'Rs. $1');
      content = content.replace(/\$({.*?shipFee.*?})/g, 'Rs. $1');
      
      content = content.replace(/'\$'/g, "'Rs. '");
      content = content.replace(/`\$\{/g, "`Rs. ${");
      // Handle the case where we mistakenly replace the start of a template literal if it's not a currency format, but here `\$` was likely meant to be a literal `$`
      content = content.replace(/`\\\$\\\${/g, '`Rs. ${'); 
      content = content.replace(/Orders above \$50/g, 'Orders above Rs. 15,000');
      
      // Fix stars in Wishlist and SellerDashboard
      content = content.replace(/{'★'\.repeat\(Math\.floor\((.*?)\)\)}/g, 
        '{[...Array(Math.floor($1))].map((_,i) => <Star key={i} size={14} fill="#f59e0b" color="#f59e0b" />)}');
      content = content.replace(/★ {Number/g, '<Star size={14} fill="#f59e0b" color="#f59e0b" style={{display:"inline", verticalAlign:"text-bottom", marginRight:"2px"}}/> {Number');

      fs.writeFileSync(fullPath, content);
    }
  }
}
processDir('frontend-react/src');
