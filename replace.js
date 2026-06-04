const fs = require('fs');
const path = require('path');

const files = [
  'src/app/videos/[slug]/page.tsx',
  'src/app/autores/[slug]/page.tsx',
  'src/app/page.tsx',
  'src/app/videos/page.tsx',
  'src/app/noticias/[slug]/page.tsx',
  'src/app/noticias/page.tsx',
  'src/app/[category]/page.tsx',
  'src/components/home/main-carousel.tsx',
  'src/app/colunas/[slug]/page.tsx',
  'src/app/colunas/page.tsx',
  'src/app/colunas/caderno/[slug]/page.tsx'
];

const regex = /function formatPublishedTime\(publishedAt: Date\): string \{[\s\S]*?\n\}/;

for (const file of files) {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove the old function
    content = content.replace(regex, '');
    
    // Add import statement at the top if not present
    if (!content.includes('import { formatPublishedTime }')) {
        // Find the first line after imports or just put it after 'lucide-react'
        content = content.replace(/import \{ slugify \} from '@\/lib\/utils';?/, "import { slugify, formatPublishedTime } from '@/lib/utils';");
        
        if (!content.includes('formatPublishedTime')) {
            content = content.replace(/import (.*?) from 'lucide-react';?/, "import $1 from 'lucide-react';\nimport { formatPublishedTime } from '@/lib/utils';");
        }
    }
    
    fs.writeFileSync(filePath, content);
  }
}
