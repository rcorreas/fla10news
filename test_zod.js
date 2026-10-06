const { z } = require("zod");
const schema = z.preprocess((val) => typeof val === 'string' ? val.replace(/\[\/?img\]/gi, '').trim() : val, z.string().url()).optional().or(z.literal(''));
console.log(schema.safeParse("https://youtu.be/puTOd9TujoY").success);
