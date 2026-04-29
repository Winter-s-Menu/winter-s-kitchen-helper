// Vercel serverless function: returns the SPA's index.html with
// recipe-specific Open Graph / Twitter / canonical metadata injected
// into the <head>, so social crawlers AND "View Page Source" both
// see the correct preview without breaking the React app.

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const SUPABASE_URL = 'https://xjaldbrcuocjthlxexbz.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqYWxkYnJjdW9janRobHhleGJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzOTk0NTAsImV4cCI6MjA4Nzk3NTQ1MH0.k3yr4RhlR_WqKFuU3c2omWEMvtADzGlAc0otj582Y1M';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function shortDescription(desc: string | null | undefined): string {
  if (!desc) return 'Ontdek recepten, schaal ingrediënten en maak je boodschappenlijst.';
  const matches = desc.match(/[^.!?]+[.!?]+/g);
  if (matches && matches.length) return matches.slice(0, 2).join('').trim();
  return desc.length > 200 ? desc.slice(0, 197) + '…' : desc;
}

// Try a few candidate locations for the built index.html.
// On Vercel static builds with serverless functions, `dist/` is the
// build output and is bundled with the function via outputFileTracing.
let cachedTemplate: string | null = null;
function loadTemplate(): string {
  if (cachedTemplate) return cachedTemplate;
  const candidates = [
    join(process.cwd(), 'dist', 'index.html'),
    join(process.cwd(), 'index.html'),
    join(process.cwd(), 'public', 'index.html'),
  ];
  for (const p of candidates) {
    try {
      cachedTemplate = readFileSync(p, 'utf8');
      return cachedTemplate;
    } catch {
      /* try next */
    }
  }
  // Last-resort minimal template — should not happen in production.
  cachedTemplate = `<!doctype html><html lang="nl"><head><meta charset="UTF-8"/><title>Winter's Menu</title></head><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>`;
  return cachedTemplate;
}

export default async function handler(req: any, res: any) {
  const slug = (req.query?.slug || '').toString();
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'wintersmenu.com';
  const proto = (req.headers['x-forwarded-proto'] || 'https').toString();
  const canonical = `${proto}://${host}/recept/${slug}`;

  let { data: recipe } = await supabase
    .from('recipes')
    .select('id, slug, title, description, image_url')
    .eq('slug', slug)
    .maybeSingle();

  if (!recipe) {
    const byId = await supabase
      .from('recipes')
      .select('id, slug, title, description, image_url')
      .eq('id', slug)
      .maybeSingle();
    recipe = byId.data;
  }

  const siteName = "Winter's Menu";
  const title = recipe?.title ? `${recipe.title} — ${siteName}` : `${siteName} — Ontdek & Kook`;
  const description = shortDescription(recipe?.description);
  const image = recipe?.image_url || `${proto}://${host}/tab_logo.png`;
  const imageAlt = recipe?.title || siteName;
  const imageType =
    image.toLowerCase().endsWith('.png') ? 'image/png'
    : image.toLowerCase().endsWith('.webp') ? 'image/webp'
    : 'image/jpeg';

  const metaTags = `
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="canonical" href="${escapeHtml(canonical)}" />
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="${escapeHtml(siteName)}" />
    <meta property="og:url" content="${escapeHtml(canonical)}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:image" content="${escapeHtml(image)}" />
    <meta property="og:image:secure_url" content="${escapeHtml(image)}" />
    <meta property="og:image:type" content="${imageType}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${escapeHtml(imageAlt)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${escapeHtml(image)}" />
  `.trim();

  let html = loadTemplate();

  // Strip generic tags we want to override so crawlers don't see duplicates.
  html = html
    .replace(/<title>[\s\S]*?<\/title>/i, '')
    .replace(/<meta\s+name=["']description["'][^>]*>/gi, '')
    .replace(/<meta\s+property=["']og:[^"']+["'][^>]*>/gi, '')
    .replace(/<meta\s+name=["']twitter:[^"']+["'][^>]*>/gi, '')
    .replace(/<link\s+rel=["']canonical["'][^>]*>/gi, '');

  // Inject recipe meta as the first thing in <head> so it appears in
  // raw HTML source even before scripts/styles.
  html = html.replace(/<head(\s[^>]*)?>/i, (m) => `${m}\n    ${metaTags}`);

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader(
    'Cache-Control',
    'public, max-age=60, s-maxage=600, stale-while-revalidate=86400',
  );
  res.status(200).send(html);
}
