// Temporary design-review answers, stored in the site's own Vercel Blob store (one file per person).
// POST { from, answers: [{id,type,title,status,comment}] }  → saves
// GET                                                        → { ok, rows }
import { put, list } from '@vercel/blob';

const PEOPLE = { michelle: 'Michelle', pa: 'Pa' };
const cut = (v, n) => String(v == null ? '' : v).slice(0, n);

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (req.method === 'POST') {
      const d = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      const key = cut(d.from, 40).toLowerCase().trim();
      if (!PEOPLE[key] || !Array.isArray(d.answers) || !d.answers.length) return res.status(400).json({ ok: false, error: 'missing name or answers' });
      const answers = {};
      d.answers.slice(0, 60).forEach(a => {
        const id = cut(a.id, 60); if (!id) return;
        answers[id] = { id, type: a.type === 'missing' ? 'Question' : 'Design', title: cut(a.title, 200), status: a.status === 'ok' ? 'OK' : a.status === 'change' ? 'CHANGE' : '', comment: cut(a.comment, 2000) };
      });
      await put(`review/${key}.json`, JSON.stringify({ from: PEOPLE[key], received: new Date().toISOString(), answers }), {
        access: 'public', addRandomSuffix: false, allowOverwrite: true, contentType: 'application/json',
      });
      return res.status(200).json({ ok: true });
    }
    if (req.method === 'GET') {
      const { blobs } = await list({ prefix: 'review/' });
      const rows = [];
      for (const b of blobs) {
        const f = await (await fetch(b.url + '?t=' + Date.now())).json();
        Object.values(f.answers || {}).forEach(a => rows.push({ ...a, from: f.from, received: f.received }));
      }
      return res.status(200).json({ ok: true, rows });
    }
    return res.status(405).json({ ok: false, error: 'method not allowed' });
  } catch (err) {
    return res.status(500).json({ ok: false, error: String(err && err.message || err) });
  }
}
