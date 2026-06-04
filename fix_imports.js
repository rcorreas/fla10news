const fs = require('fs');
const path = require('path');

const files = [
  'src/app/[category]/page.tsx',
  'src/app/autores/[slug]/page.tsx',
  'src/app/noticias/[slug]/page.tsx',
  'src/app/noticias/page.tsx',
  'src/app/videos/[slug]/page.tsx',
  'src/app/videos/page.tsx',
  'src/components/home/main-carousel.tsx'
];

for (const file of files) {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (!content.includes("from '@/lib/utils'") || !content.includes("formatPublishedTime")) {
        if (!content.includes('import { formatPublishedTime }')) {
             content = `import { formatPublishedTime } from '@/lib/utils';\n` + content;
             fs.writeFileSync(filePath, content);
        }
    } else if (content.includes("from '@/lib/utils'") && !content.match(/import \{[^}]*formatPublishedTime[^}]*\} from '@\/lib\/utils'/)) {
        // has the import but not the function
        content = content.replace(/import \{([^}]+)\} from '@\/lib\/utils';?/, "import { $1, formatPublishedTime } from '@/lib/utils';");
        fs.writeFileSync(filePath, content);
    }
  }
}
