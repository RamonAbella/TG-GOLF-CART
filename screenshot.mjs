import puppeteer from 'puppeteer';
import { mkdirSync, readdirSync } from 'fs';
import { join } from 'path';

const url = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] ? `-${process.argv[3]}` : '';
const dir = './temporary screenshots';

mkdirSync(dir, { recursive: true });

const existing = readdirSync(dir).filter(f => f.startsWith('screenshot-') && f.endsWith('.png'));
const nums = existing.map(f => parseInt(f.match(/screenshot-(\d+)/)?.[1] || '0')).filter(Boolean);
const n = nums.length ? Math.max(...nums) + 1 : 1;
const filename = join(dir, `screenshot-${n}${label}.png`);

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
await page.screenshot({ path: filename, fullPage: true });
await browser.close();

console.log(`Screenshot saved: ${filename}`);
