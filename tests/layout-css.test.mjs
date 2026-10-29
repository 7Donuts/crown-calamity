import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

// The DOM harness has no layout engine, so this resolves the stylesheet cascade for the combat panel
// at fixed viewports. It guards the B1 defect: hud.css (loaded later) made .rune-console relative while
// style.css left a fixed-shelf `bottom` offset behind, which shifted the panel up over the enemy intent.
const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
const sheets = [...html.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map(m => m[1]);

function rulesOf(css, width, height) {
  css = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const out = [];
  const walk = (text, active) => {
    let i = 0;
    while (i < text.length) {
      const open = text.indexOf('{', i);
      if (open < 0) break;
      const head = text.slice(i, open).trim();
      let depth = 1, j = open + 1;
      while (j < text.length && depth) { depth += text[j] === '{' ? 1 : text[j] === '}' ? -1 : 0; j++; }
      const body = text.slice(open + 1, j - 1);
      if (head.startsWith('@media')) {
        const ok = [...head.matchAll(/\((max|min)-(width|height):\s*(\d+)px\)/g)].every(([, k, d, n]) => {
          const v = d === 'width' ? width : height;
          return k === 'max' ? v <= Number(n) : v >= Number(n);
        });
        if (ok && active) walk(body, true);
      } else if (!head.startsWith('@') && active) {
        out.push({ head, decls: Object.fromEntries(body.split(';').map(d => d.split(/:(.+)/).slice(0, 2).map(x => x?.trim())).filter(([k, v]) => k && v)) });
      }
      i = j;
    }
  };
  walk(css, true);
  return out;
}

const spec = sel => [(sel.match(/#/g) || []).length, (sel.match(/\.|\[|:(?!:|not\()/g) || []).length];

async function panelStyle(width, height) {
  // Element under test: <div class="combat-controls rune-console"> inside #app. Only class selectors for it (optionally under #app) are resolved.
  const el = new Set(['.combat-controls', '.rune-console']);
  const cascade = [];
  let order = 0;
  for (const name of sheets) {
    for (const rule of rulesOf(await readFile(new URL(`../dist/${name}`, import.meta.url), 'utf8'), width, height)) {
      for (const sel of rule.head.split(',').map(s => s.trim())) {
        const parts = sel.split(/\s+/);
        if (parts.length > 2 || (parts.length === 2 && parts[0] !== '#app')) continue;
        const target = parts.at(-1);
        if (!/^(\.[\w-]+)+$/.test(target) || ![...target.slice(1).split('.')].every(c => el.has('.' + c))) continue;
        cascade.push({ spec: spec(sel), order: order++, decls: rule.decls });
      }
    }
  }
  cascade.sort((a, b) => a.spec[0] - b.spec[0] || a.spec[1] - b.spec[1] || a.order - b.order);
  const style = {};
  for (const rule of cascade) Object.assign(style, rule.decls);
  return style;
}

test('combat panel never keeps a bottom offset while it is position relative or static', async () => {
  for (const [w, h] of [[360, 740], [390, 844], [430, 932], [1280, 900], [390, 560], [390, 480]]) {
    const style = await panelStyle(w, h);
    const position = style.position || 'static';
    if (position === 'relative' || position === 'static') {
      assert.ok(!style.bottom || style.bottom === 'auto' || /^0(px)?$/.test(style.bottom), `${w}x${h}: ${position} panel keeps bottom: ${style.bottom}, which shifts it over the enemy intent`);
      assert.ok(!style.top || style.top === 'auto' || /^0(px)?$/.test(style.top), `${w}x${h}: top offset ${style.top}`);
    }
  }
});

test('phone combat panel stays in flow and reserves only the bottom navigation, short phones keep the sticky shelf', async () => {
  for (const [w, h] of [[360, 740], [390, 844], [430, 932]]) {
    const style = await panelStyle(w, h);
    assert.equal(style.position, 'relative', `${w}x${h} position`);
    assert.equal(style['max-height'], 'none', `${w}x${h} must not clip the six actions inside an inner scroller`);
    assert.equal(style.overflow, 'visible', `${w}x${h} overflow`);
  }
  const short = await panelStyle(390, 480);
  assert.equal(short.position, 'sticky');
  assert.match(short.bottom, /68px/);
});

test('desktop combat panel is unchanged by the phone rules', async () => {
  const style = await panelStyle(1280, 900);
  assert.equal(style.position, 'relative');
  assert.ok(!style.bottom || /^0|auto/.test(style.bottom));
});
