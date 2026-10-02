const z = require("zod");

const NewsSchema = z.object({
  mainCategory: z.string().min(1),
  title: z.string().min(5),
  excerpt: z.string().min(10),
  category: z.string().min(3),
  content: z.string().min(50),
  image: z.string().url(),
  imageCredit: z.string().optional(),
  image2: z.string().url().optional().or(z.literal('')),
  imageCredit2: z.string().optional(),
  fullArticleLink: z.string().url().optional().or(z.literal('')),
  dataAiHint: z.string().optional(),
  author: z.string().optional(),
  videoUrl: z.string().url().optional().or(z.literal('')),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  focusKeyword: z.string().optional(),
  secondaryKeywords: z.string().optional(),
  status: z.enum(['draft', 'published']).optional(),
  publishedAt: z.string().optional(),
});

function test() {
  const formData = new Map([
    ["mainCategory", "Futebol"],
    ["title", "Flamengo vence mais uma"],
    ["excerpt", "Este é um subtítulo com mais de 10 caracteres"],
    ["category", "Brasileirão"],
    ["content", "Conteúdo com mais de 50 caracteres para passar no teste de validacao do zod. 1234567890 1234567890 1234567890"],
    ["image", "https://exemplo.com/imagem.png"],
    // O resto ausente para simular "Salvar Rascunho" sem preencher nada opcional
    ["status", "draft"]
  ]);
  
  function get(key) { return formData.get(key) || null; }

  const validatedFields = NewsSchema.safeParse({
    mainCategory: get("mainCategory")?.toString() || "",
    title: get("title")?.toString() || "",
    excerpt: get("excerpt")?.toString() || "",
    category: get("category")?.toString() || "",
    content: get("content")?.toString() || "",
    image: get("image")?.toString() || "",
    imageCredit: get("imageCredit")?.toString() || undefined,
    image2: get("image2")?.toString() || undefined,
    imageCredit2: get("imageCredit2")?.toString() || undefined,
    fullArticleLink: get("fullArticleLink")?.toString() || undefined,
    dataAiHint: get("dataAiHint")?.toString() || undefined,
    author: get("author")?.toString() || undefined,
    videoUrl: get("videoUrl")?.toString() || undefined,
    metaTitle: get("metaTitle")?.toString() || undefined,
    metaDescription: get("metaDescription")?.toString() || undefined,
    focusKeyword: get("focusKeyword")?.toString() || undefined,
    secondaryKeywords: get("secondaryKeywords")?.toString() || undefined,
    status: get("status")?.toString() || "published",
    publishedAt: get("publishedAt")?.toString() || undefined,
  });

  if (!validatedFields.success) {
    console.log("Validation failed!", validatedFields.error.flatten().fieldErrors);
    return;
  }
  
  let publishedDateStr = validatedFields.data.publishedAt;
  let publishedAtVal = "SERVER_TIMESTAMP_MOCK";
  if (publishedDateStr && publishedDateStr.trim() !== '') {
      publishedAtVal = new Date(`${publishedDateStr}-03:00`);
  }

  const dataToSave = {
    ...validatedFields.data,
    author: validatedFields.data.author || 'Redação NRN',
    slug: "teste-slug",
    publishedAt: publishedAtVal,
    views: 0,
    status: validatedFields.data.status || 'published',
  };

  Object.keys(dataToSave).forEach(key => dataToSave[key] === undefined && delete dataToSave[key]);

  console.log("Data to save:", dataToSave);
}

test();
