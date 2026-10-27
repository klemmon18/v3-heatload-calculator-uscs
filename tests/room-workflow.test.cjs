const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { existsSync } = require('node:fs');
const { once } = require('node:events');
const { chromium } = require('playwright');

const origin = 'http://127.0.0.1:3187';
let server;
let browser;
before(async () => {
  server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '3187', '--strictPort'], { stdio: 'pipe' });
  let logs = '';
  server.stdout.on('data', data => { logs += data; });
  server.stderr.on('data', data => { logs += data; });
  let ready = false;
  for (let i = 0; i < 50; i++) {
    if (server.exitCode !== null) throw new Error(`Test server failed: ${logs}`);
    try { ready = (await fetch(origin)).ok; } catch {}
    if (ready) break;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  assert.ok(ready, `Test server did not become ready: ${logs}`);
  const executablePath = process.env.CHROMIUM_PATH || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined);
  browser = await chromium.launch({ executablePath, headless: true, args: ['--no-sandbox'] });
});
after(async () => {
  await browser?.close();
  if (server && server.exitCode === null) {
    const exited = once(server, 'exit');
    server.kill('SIGTERM');
    await exited;
  }
});

async function freshPage(t) {
  const page = await browser.newPage();
  page.setDefaultTimeout(5000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  // Functional tests are deterministic and do not depend on CDN availability.
  await page.route('**/*', route => route.request().url().startsWith(origin) ? route.continue() : route.abort());
  t.after(async () => { await page.close(); assert.deepEqual(errors, []); });
  await page.goto(origin, { waitUntil: 'networkidle' });
  return page;
}
async function dimensions(page, width, depth, height, lighting = '20') {
  // Stage 1 fixtures explicitly retain their original 20 W lighting load.
  await page.getByLabel('Total Installed Lighting Wattage', { exact: true }).fill(lighting);
  for (const [field, value] of Object.entries({ width, depth, height })) {
    await page.locator(`#room-${field}`).fill(value);
  }
}
const verification = page => page.getByLabel('I confirm all entered information is accurate.', { exact: false });

test('A: fresh room inputs are blank and verification stays disabled', async t => {
  const page = await freshPage(t);
  for (const field of ['width', 'depth', 'height']) assert.equal(await page.locator(`#room-${field}`).inputValue(), '');
  await page.getByRole('button', { name: 'Yes', exact: true }).click();
  assert.equal(await verification(page).isDisabled(), true);
  assert.match(await page.getByRole('alert').filter({ hasText: 'valid positive Width' }).innerText(), /valid positive Width, Depth, and Height/);
  for (let i = 1; i <= 6; i++) assert.equal(await page.getByTestId(`surface-${i}-geometry`).innerText(), 'Enter valid room dimensions above.');
  assert.equal(await page.getByLabel('Shortest Height (ft)').count(), 0);
});

test('B: rectangular geometry is displayed read-only and changes require reverification', async t => {
  const page = await freshPage(t);
  await dimensions(page, '12', '8', '9');
  await page.getByRole('button', { name: 'Yes', exact: true }).click();
  const expected = ['12 × 9 = 108 sq ft', '8 × 9 = 72 sq ft', '12 × 9 = 108 sq ft', '8 × 9 = 72 sq ft', '12 × 8 = 96 sq ft', '12 × 8 = 96 sq ft'];
  for (let i = 1; i <= 6; i++) {
    assert.equal(await page.getByTestId(`surface-${i}-geometry`).innerText(), expected[i - 1]);
    assert.equal(await page.getByTestId(`surface-${i}`).locator('input[type=number]:enabled').count(), 0);
  }
  await verification(page).click();
  assert.match(await page.locator('body').innerText(), /Room Volume: 864 cu.ft/);
  await page.locator('#room-width').fill('13');
  assert.equal(await verification(page).isChecked(), false);
  assert.equal(await page.getByTestId('surface-1-geometry').innerText(), '13 × 9 = 117 sq ft');
  assert.match(await page.locator('body').innerText(), /Engine Standby/);
});

test('C: blank, zero, negative and non-numeric values block verification; decimals succeed', async t => {
  const page = await freshPage(t);
  await page.getByRole('button', { name: 'Yes', exact: true }).click();
  for (const [field, value] of [['width', ''], ['width', '0'], ['depth', '-2'], ['height', 'abc']]) {
    await dimensions(page, '12', '8', '9');
    await page.locator(`#room-${field}`).fill(value);
    assert.equal(await verification(page).isDisabled(), true);
    assert.equal(await page.locator(`#room-${field}`).getAttribute('aria-invalid'), 'true');
    assert.match(await page.locator(`#room-${field}-error`).innerText(), /greater than 0 ft/);
  }
  await dimensions(page, '10.5', '8.25', '9');
  assert.equal(await verification(page).isEnabled(), true);
  assert.equal(await page.getByTestId('surface-5-geometry').innerText(), '10.5 × 8.25 = 86.625 sq ft');
  await verification(page).click();
  assert.match(await page.locator('body').innerText(), /Live Real-Time Engine/);
  await page.locator('#room-height').fill('abc');
  assert.equal(await verification(page).isDisabled(), true);
  assert.match(await page.locator('body').innerText(), /Engine Standby/);
});

test('D: solid-core door regression preserves baseline result and analysis', async t => {
  const page = await freshPage(t);
  await dimensions(page, '10', '10', '8');
  await page.getByRole('button', { name: 'Yes', exact: true }).click();
  const wall = page.getByTestId('surface-1');
  assert.equal(await wall.getByLabel('Exterior', { exact: true }).isChecked(), false);
  for (let i = 1; i <= 4; i++) assert.equal(await page.getByLabel(`Wall Construction for Wall ${i}`, { exact: true }).inputValue(), '19');
  await wall.getByLabel('Door on this wall').check();
  await page.getByLabel('Door width on Wall 1', { exact: true }).fill('3');
  await page.getByLabel('Door height on Wall 1', { exact: true }).fill('7');
  await page.getByLabel('Door material on Wall 1', { exact: true }).selectOption('Solid Core Wood');
  await verification(page).click();
  const text = await page.locator('body').innerText();
  assert.match(text, /1283\s*BTU\/h/);
  assert.match(text, /Room Volume: 800 cu.ft/);
  assert.match(text, /Doors\s+315/);
  assert.match(text, /Walls\/Ceiling\s+629/);
});

test('vaulted measurements stay conditional, update volume, and retain floor conditions', async t => {
  const page = await freshPage(t);
  await dimensions(page, '12', '8', '9');
  await page.getByRole('button', { name: 'Yes', exact: true }).click();
  await page.getByLabel('This ceiling is vaulted or angled').check();
  await page.getByLabel('Shortest Height (ft)').fill('8');
  await page.getByLabel('Tallest Height (ft)').fill('12');
  await verification(page).click();
  assert.match(await page.locator('body').innerText(), /Room Volume: 960 cu.ft/);
  await page.getByLabel('Radiant Heating').check();
  assert.match(await page.locator('body').innerText(), /Radiant floor heating significantly increases cooling load/);
  assert.equal(await verification(page).isChecked(), false);
  await page.getByLabel('This ceiling is vaulted or angled').uncheck();
  assert.equal(await page.getByLabel('Shortest Height (ft)').count(), 0);
  await verification(page).click();
  assert.match(await page.locator('body').innerText(), /Room Volume: 864 cu.ft/);
});

test('Stage 2: full-glass construction uses derived area, hides duplicate controls, and retains doors', async t => {
  const page = await freshPage(t);
  await dimensions(page, '10', '10', '8', '0');
  await page.getByRole('button', { name: 'Yes', exact: true }).click();
  const wall = page.getByTestId('surface-1');
  const construction = page.getByLabel('Wall Construction for Wall 1', { exact: true });
  assert.deepEqual(await construction.locator('option').evaluateAll(options => options.map(option => option.value)),
    ['0', '11', '13', '19', '21', '30', '42', 'Single-pane glass wall', 'Double-pane glass wall']);
  await page.getByLabel('Glass Type for Wall 1', { exact: true }).selectOption('Double Pane');
  await page.getByLabel('Glass width for Wall 1', { exact: true }).fill('4');
  await page.getByLabel('Glass height for Wall 1', { exact: true }).fill('5');
  await construction.selectOption('Double-pane glass wall');
  assert.equal(await wall.getByLabel('Glass Type for Wall 1', { exact: true }).count(), 0);
  assert.equal(await wall.getByLabel('Glass width for Wall 1', { exact: true }).count(), 0);
  assert.equal(await page.getByTestId('surface-1-geometry').innerText(), '10 × 8 = 80 sq ft');
  assert.match(await page.getByTestId('full-glass-1').innerText(), /Glazing area after doors: 80 sq ft/);
  await verification(page).click();
  assert.match(await page.locator('body').innerText(), /Glazing\s+1500/);
  assert.match(await page.locator('body').innerText(), /Walls\/Ceiling\s+527/);
  await wall.getByLabel('Door on this wall').check();
  assert.equal(await verification(page).isChecked(), false);
  assert.match(await page.getByTestId('full-glass-1').innerText(), /Glazing area after doors: 59 sq ft/);
  await verification(page).click();
  assert.match(await page.locator('body').innerText(), /Glazing\s+1106/);
  assert.match(await page.locator('body').innerText(), /Doors\s+315/);
  await wall.getByLabel('Exterior', { exact: true }).check();
  await verification(page).click();
  assert.match(await page.locator('body').innerText(), /Glazing\s+2213/);
  await construction.selectOption('19');
  assert.equal(await page.getByLabel('Glass width for Wall 1', { exact: true }).inputValue(), '4');
  assert.equal(await page.getByLabel('Glass height for Wall 1', { exact: true }).inputValue(), '5');
  assert.equal(await page.getByLabel('Glass Type for Wall 1', { exact: true }).inputValue(), 'Double Pane');
});

test('Stage 2: oversized doors and legacy openings block verification in the live UI', async t => {
  const page = await freshPage(t);
  await dimensions(page, '10', '10', '8', '0');
  await page.getByRole('button', { name: 'Yes', exact: true }).click();
  const wall = page.getByTestId('surface-1');
  await wall.getByLabel('Door on this wall').check();
  await page.getByLabel('Door width on Wall 1', { exact: true }).fill('11');
  await page.getByLabel('Door height on Wall 1', { exact: true }).fill('8');
  for (const construction of ['19', 'Single-pane glass wall', 'Double-pane glass wall']) {
    await page.getByLabel('Wall Construction for Wall 1', { exact: true }).selectOption(construction);
    assert.equal(await verification(page).isDisabled(), true);
    assert.match(await wall.getByRole('alert').innerText(), /door\/opening area exceeds.*80 sq ft/);
  }
  assert.match(await page.getByTestId('full-glass-1').innerText(), /Glazing area after doors: 0 sq ft/);
  await page.getByLabel('Wall Construction for Wall 1', { exact: true }).selectOption('19');
  await page.getByLabel('Door width on Wall 1', { exact: true }).fill('3');
  await page.getByLabel('Door height on Wall 1', { exact: true }).fill('7');
  await page.getByLabel('Glass Type for Wall 1', { exact: true }).selectOption('Single Pane');
  await page.getByLabel('Glass width for Wall 1', { exact: true }).fill('8');
  await page.getByLabel('Glass height for Wall 1', { exact: true }).fill('8');
  assert.equal(await verification(page).isDisabled(), true); // 64 + 21 > 80.
  await wall.getByLabel('Door on this wall').uncheck();
  await page.getByLabel('Glass width for Wall 1', { exact: true }).fill('11');
  assert.equal(await verification(page).isDisabled(), true); // Opening alone > 80.
  await page.getByLabel('Wall Construction for Wall 1', { exact: true }).selectOption('Double-pane glass wall');
  assert.equal(await verification(page).isEnabled(), true); // Hidden legacy values do not double count.
  await verification(page).click();
  await page.locator('#room-width').fill('9');
  assert.equal(await verification(page).isChecked(), false);
});

test('Stage 2: lighting starts blank, explicitly accepts zero/decimals/22, and rejects invalid values', async t => {
  const page = await freshPage(t);
  const lighting = page.getByLabel('Total Installed Lighting Wattage', { exact: true });
  assert.equal(await lighting.inputValue(), '');
  assert.equal(await lighting.getAttribute('required'), '');
  await dimensions(page, '10', '10', '8', '');
  await page.getByRole('button', { name: 'Yes', exact: true }).click();
  assert.equal(await verification(page).isDisabled(), true);
  assert.match(await page.locator('#lighting-help').innerText(), /Enter 0 if the cellar has no installed lighting/);
  for (const value of ['-1', 'abc', '', 'NaN']) {
    await lighting.fill(value);
    assert.equal(await verification(page).isDisabled(), true);
    assert.equal(await lighting.getAttribute('aria-invalid'), 'true');
    assert.match(await page.locator('#lighting-error').innerText(), /0 or a positive number/);
  }
  for (const [value, internal] of [['0', 0], ['22', 23], ['10.5', 11]]) {
    await lighting.fill(value);
    assert.equal(await verification(page).isEnabled(), true);
    await verification(page).click();
    assert.match(await page.locator('body').innerText(), new RegExp(`Internal\\s+${internal}\\b`));
  }
  await lighting.fill('');
  assert.equal(await verification(page).isDisabled(), true);
  assert.match(await page.locator('body').innerText(), /Engine Standby/);
});

test('Stage 2: live solid-core-door totals retain the actual pre-change baseline at 0 and 22 W', async t => {
  const page = await freshPage(t);
  await dimensions(page, '10', '10', '8', '0');
  await page.getByRole('button', { name: 'Yes', exact: true }).click();
  await page.getByTestId('surface-1').getByLabel('Door on this wall').check();
  for (const [watts, load] of [['0', 1257], ['22', 1285]]) {
    await page.getByLabel('Total Installed Lighting Wattage', { exact: true }).fill(watts);
    await verification(page).click();
    assert.match(await page.locator('body').innerText(), new RegExp(`${load}\\s*BTU/h`));
    assert.match(await page.locator('body').innerText(), /Doors\s+315/);
    assert.match(await page.locator('body').innerText(), /Room Volume: 800 cu.ft/);
  }
});
