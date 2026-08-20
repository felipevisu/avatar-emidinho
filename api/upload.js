import { put } from '@vercel/blob';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
    // ponytail: 8MB cap, tighten if abused
    if (chunks.reduce((n, c) => n + c.length, 0) > 8 * 1024 * 1024) {
      return res.status(413).json({ error: 'too large' });
    }
  }
  const buffer = Buffer.concat(chunks);
  if (!buffer.length) return res.status(400).json({ error: 'empty body' });

  const { url } = await put('avatar.png', buffer, {
    access: 'public',
    contentType: 'image/png',
    addRandomSuffix: true,
  });
  res.status(200).json({ url });
}
