// Vercel serverless function: returns recipe-specific OG metadata HTML
// for social crawlers (WhatsApp, Twitter, Facebook, Slack, etc.).
// Real browsers are redirected to the SPA so the app keeps working.

import { createClient } from '@supabase/supabase-js';

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
  // First 2 sentences
  const matches = desc.match(/[^.!?]+[.!?]+/g);
  if (matches && matches.length) {
    return matches.slice(0, 2).join('').trim();
  }
  return desc.length > 200 ? desc.slice(0, 197) + '…' : desc;
}

export default async function handler(req: any, res: any) {
  const slug = (req.query?.slug || '').toString();
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'wintersmenu.com';
  const proto = (req.headers['x-forwarded-proto'] || 'https').toString();
  const canonical = `${proto}://${host}/recept/${slug}`;

  // Try slug, then id
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
  const image =
    recipe?.image_url ||
    `${proto}://${host}/tab_logo.png`;

  const html = `<!doctype html>
<html lang="nl">
<head>
<meta charset="UTF-8" />
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}" />
<link rel="canonical" href="${escapeHtml(canonical)}" />
<meta property="og:type" content="article" />
<meta property="og:site_name" content="${escapeHtml(siteName)}" />
<meta property="og:url" content="${escapeHtml(canonical)}" />
<meta property="og:title" content="${escapeHtml(title)}" />
<meta property="og:description" content="${escapeHtml(description)}" />
<meta property="og:image" content="${escapeHtml(image)}" />
<meta property="og:image:alt" content="${escapeHtml(recipe?.title || siteName)}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escapeHtml(title)}" />
<meta name="twitter:description" content="${escapeHtml(description)}" />
<meta name="twitter:image" content="${escapeHtml(image)}" />
<meta http-equiv="refresh" content="0; url=${escapeHtml(canonical)}" />
</head>
<body>
<p>Doorverwijzen naar <a href="${escapeHtml(canonical)}">${escapeHtml(title)}</a>…</p>
<script>window.location.replace(${JSON.stringify(canonical)});</script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=600, stale-while-revalidate=86400');
  res.status(200).send(html);
}
