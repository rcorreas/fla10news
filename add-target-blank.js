const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // This regex looks for <Link ...> or <a ...> tags.
  // It ensures we don't add target="_blank" if it already exists.
  let newContent = content.replace(/<(Link|a)(\s+[^>]+)?>/g, (match, tag, rest) => {
    if (rest && rest.includes('target=')) {
      return match; // Already has a target
    }
    // Add target="_blank" before the closing >
    const closingIdx = match.lastIndexOf('>');
    const selfClosingIdx = match.lastIndexOf('/>');
    
    let insertion = ' target="_blank"';
    if (tag === 'a') {
        insertion += ' rel="noopener noreferrer"';
    }
    
    if (selfClosingIdx !== -1 && selfClosingIdx === match.length - 2) {
      return match.slice(0, selfClosingIdx) + insertion + ' />';
    }
    return match.slice(0, closingIdx) + insertion + '>';
  });

  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log('Updated', filePath);
  }
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      processFile(fullPath);
    }
  }
}

walk('./src');
