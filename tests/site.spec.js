// @ts-check
const { test, expect } = require('/opt/node22/lib/node_modules/playwright/lib/index.js');

const BASE = 'http://localhost:8777';

// === Index page ===
test('index page loads songs', async ({ page }) => {
  await page.goto(BASE + '/index.html');
  await page.waitForSelector('.concert');
  const songs = await page.$$('main a');
  expect(songs.length).toBeGreaterThan(0);
});

test('index page song order matches program', async ({ page }) => {
  await page.goto(BASE + '/index.html');
  await page.waitForSelector('.concert');
  const titles = await page.$$eval('main a', links => links.map(a => a.textContent.trim()));
  expect(titles[0]).toContain('fanfare');
  expect(titles[1]).toContain('violin concerto');
  expect(titles[2]).toContain('firebird');
});

test('index page lists archived concerts last, under a past label', async ({ page }) => {
  await page.goto(BASE + '/index.html');
  await page.waitForSelector('.concert');

  const sections = await page.$$eval('.concert', els => els.map(el => ({
    name: el.querySelector('.concert-name').textContent.trim(),
    archived: el.classList.contains('archived')
  })));
  expect(sections[0].archived).toBe(false);
  expect(sections[sections.length - 1].archived).toBe(true);
  expect(sections[sections.length - 1].name).toBe('transformations');

  const pastLabel = await page.textContent('.past-label');
  expect(pastLabel).toBe('past concerts');
});

test('archived concert songs are still reachable', async ({ page }) => {
  await page.goto(BASE + '/song.html?s=coleman-umoja');
  await page.waitForSelector('.loop');
  const loops = await page.$$('.loop');
  expect(loops.length).toBeGreaterThan(0);
});

// === Song page ===
test('song page loads with valid slug', async ({ page }) => {
  await page.goto(BASE + '/song.html?s=coleman-umoja');
  await page.waitForFunction(() => document.getElementById('song-title').textContent !== 'loading…');
  const title = await page.textContent('#song-title');
  expect(title).toContain('umoja');
});

test('song page shows error for missing slug', async ({ page }) => {
  await page.goto(BASE + '/song.html');
  const title = await page.textContent('#song-title');
  expect(title).toBe('no song specified');
});

test('song page shows error for bad slug', async ({ page }) => {
  await page.goto(BASE + '/song.html?s=nonexistent');
  await page.waitForFunction(() => document.getElementById('song-title').textContent !== 'loading…');
  const title = await page.textContent('#song-title');
  expect(title).toBe('song not found');
});

test('song page renders loop controls', async ({ page }) => {
  await page.goto(BASE + '/song.html?s=brahms-haydn-variations');
  await page.waitForSelector('.loop');
  const loops = await page.$$('.loop');
  expect(loops.length).toBeGreaterThan(0);
});

test('song page with no loops yet can add one', async ({ page }) => {
  await page.goto(BASE + '/song.html?s=copland-fanfare');
  await page.waitForFunction(() => document.getElementById('song-title').textContent !== 'loading\u2026');
  expect(await page.$$('.loop')).toHaveLength(0);
  await page.click('#add-loop');
  const loops = await page.$$('.loop');
  expect(loops.length).toBe(1);
  expect(await page.inputValue('.loop .start')).toBe('0:00');
});

test('song page renders loop labels', async ({ page }) => {
  await page.goto(BASE + '/song.html?s=brahms-haydn-variations');
  await page.waitForSelector('.loop-label');
  const labels = await page.$$('.loop-label');
  expect(labels.length).toBeGreaterThan(0);
  const firstLabel = await labels[0].textContent();
  expect(firstLabel).toContain('Andante');
});

// === Concert page ===
test('concert page plays only the current concert', async ({ page }) => {
  await page.goto(BASE + '/concert.html');
  await page.waitForSelector('#setlist li');
  const items = await page.$$eval('#setlist li', els => els.map(el => el.textContent.trim()));
  expect(items.length).toBe(3);
  expect(items[0]).toContain('fanfare');
  expect(items[2]).toContain('firebird');
  const subtitle = await page.textContent('#concert-subtitle');
  expect(subtitle).toContain('fall 2026');
});

test('concert page start button exists and is clickable', async ({ page }) => {
  await page.goto(BASE + '/concert.html');
  await page.waitForSelector('#start-btn');
  const text = await page.textContent('#start-btn');
  expect(text).toBe('start concert');
});

// === Drone page ===
test('drone page renders 12 note buttons', async ({ page }) => {
  await page.goto(BASE + '/drone.html');
  const notes = await page.$$('.note-btn');
  expect(notes.length).toBe(12);
});

test('drone page has C selected by default', async ({ page }) => {
  await page.goto(BASE + '/drone.html');
  const selected = await page.$('.note-btn.selected');
  const text = await selected.textContent();
  expect(text).toContain('C');
});

test('drone page octave 3 selected by default', async ({ page }) => {
  await page.goto(BASE + '/drone.html');
  const selected = await page.$('.oct-btn.selected');
  const text = await selected.textContent();
  expect(text).toBe('3');
});

test('drone clicking note changes selection', async ({ page }) => {
  await page.goto(BASE + '/drone.html');
  const gBtn = await page.$('.note-btn:nth-child(8)');
  await gBtn.click();
  const isSelected = await gBtn.evaluate(el => el.classList.contains('selected'));
  expect(isSelected).toBe(true);
  const oldSelected = await page.$('.note-btn:nth-child(1)');
  const oldIsSelected = await oldSelected.evaluate(el => el.classList.contains('selected'));
  expect(oldIsSelected).toBe(false);
});

test('drone start creates AudioContext and plays', async ({ page }) => {
  await page.goto(BASE + '/drone.html');
  await page.click('#play-btn');
  await page.waitForTimeout(500);
  const state = await page.evaluate(() => {
    return typeof audioCtx !== 'undefined' && audioCtx ? audioCtx.state : 'none';
  });
  expect(state).toBe('running');
  const btnText = await page.textContent('#play-btn');
  expect(btnText).toBe('stop drone');
});

test('drone stop resets state', async ({ page }) => {
  await page.goto(BASE + '/drone.html');
  await page.click('#play-btn');
  await page.waitForTimeout(300);
  await page.click('#play-btn');
  await page.waitForTimeout(100);
  const btnText = await page.textContent('#play-btn');
  expect(btnText).toBe('start drone');
});

// === Polyrhythm page ===
test('polyrhythm page renders all exercises', async ({ page }) => {
  await page.goto(BASE + '/polyrhythm.html');
  const tracks = await page.$$('.beat-track');
  expect(tracks.length).toBe(6); // mahler: 3, umoja: 2, wave: 1
});

test('polyrhythm mahler start creates AudioContext', async ({ page }) => {
  await page.goto(BASE + '/polyrhythm.html');
  await page.click('#m-start-btn');
  await page.waitForTimeout(500);
  const state = await page.evaluate(() => {
    return typeof audioCtx !== 'undefined' && audioCtx ? audioCtx.state : 'none';
  });
  expect(state).toBe('running');
});

test('polyrhythm exercises are mutually exclusive', async ({ page }) => {
  await page.goto(BASE + '/polyrhythm.html');
  await page.click('#m-start-btn');
  await page.waitForTimeout(300);
  const mText1 = await page.textContent('#m-start-btn');
  expect(mText1).toBe('stop');

  await page.click('#u-start-btn');
  await page.waitForTimeout(300);
  const mText2 = await page.textContent('#m-start-btn');
  expect(mText2).toBe('start');
  const uText = await page.textContent('#u-start-btn');
  expect(uText).toBe('stop');
});
