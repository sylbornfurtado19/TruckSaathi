import { spawn } from 'child_process';
import { writeFileSync, existsSync } from 'fs';
import http from 'http';

const url = process.argv[2] || 'http://localhost:3000/login';
const outputPath = process.argv[3] || 'screenshot.png';
const action = process.argv[4] || 'none'; // 'none' | 'login' | 'command_palette' | 'notifications'
const waitMs = parseInt(process.argv[5] || '2000', 10);
const width = parseInt(process.argv[6] || '1440', 10);
const height = parseInt(process.argv[7] || '900', 10);

const chromePaths = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
];

const chromePath = chromePaths.find(p => existsSync(p));
if (!chromePath) {
  console.error('No Chrome/Edge browser found.');
  process.exit(1);
}

const port = 9222 + Math.floor(Math.random() * 500);

const browserProcess = spawn(chromePath, [
  '--headless=new',
  '--disable-gpu',
  '--no-first-run',
  '--no-default-browser-check',
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${process.env.TEMP}\\chrome_cdp_${port}`,
  `--window-size=${width},${height}`,
  'about:blank'
], { stdio: 'ignore' });

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getPageWsUrl() {
  for (let i = 0; i < 30; i++) {
    try {
      const list = await new Promise((resolve, reject) => {
        http.get(`http://127.0.0.1:${port}/json/list`, (r) => {
          let data = '';
          r.on('data', chunk => data += chunk);
          r.on('end', () => resolve(JSON.parse(data)));
        }).on('error', reject);
      });
      const page = list.find(t => t.type === 'page' && t.webSocketDebuggerUrl);
      if (page) return page.webSocketDebuggerUrl;
    } catch {
      await sleep(200);
    }
  }
  throw new Error('Timed out waiting for Chrome page target.');
}

async function run() {
  try {
    const wsUrl = await getPageWsUrl();
    const ws = new WebSocket(wsUrl);

    let id = 1;
    const callbacks = new Map();

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && callbacks.has(msg.id)) {
        callbacks.get(msg.id)(msg.result, msg.error);
        callbacks.delete(msg.id);
      }
    };

    await new Promise(resolve => ws.onopen = resolve);

    const send = (method, params = {}) => {
      return new Promise((resolve, reject) => {
        const msgId = id++;
        callbacks.set(msgId, (result, error) => {
          if (error) reject(error);
          else resolve(result);
        });
        ws.send(JSON.stringify({ id: msgId, method, params }));
      });
    };

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: width < 600
    });

    // 1. Initial Navigation
    await send('Page.navigate', { url: 'http://localhost:3000/login' });
    await sleep(1500);

    // 2. Perform Login if requested or if attempting to view internal routes (unless layout-preview)
    const isLayoutPreview = url.includes('layout-preview');
    const isPublic = url === 'http://localhost:3000/login' || url === 'http://localhost:3000/' || url === 'http://localhost:3000';
    if (!isLayoutPreview && !isPublic) {
      await send('Runtime.evaluate', {
        expression: `
          (() => {
            const emailInput = document.querySelector('input[type="email"]');
            const passInput = document.querySelector('input[type="password"]');
            const submitBtn = document.querySelector('button[type="submit"]');
            if (emailInput && passInput && submitBtn) {
              const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
              nativeInputValueSetter.call(emailInput, 'sylborn@trucksaathi.in');
              emailInput.dispatchEvent(new Event('input', { bubbles: true }));
              nativeInputValueSetter.call(passInput, 'TruckSaathi@2026');
              passInput.dispatchEvent(new Event('input', { bubbles: true }));
              submitBtn.click();
              return true;
            }
            return false;
          })()
        `
      });

      // Wait for login redirect to dashboard
      await sleep(2500);

      if (url !== 'http://localhost:3000/login' && url !== 'http://localhost:3000/dashboard') {
        await send('Page.navigate', { url });
        await sleep(1500);
      }
    } else {
      await send('Page.navigate', { url });
      await sleep(1200);
    }

    // 3. Actions like Command Palette or Notifications
    if (action === 'command_palette') {
      await send('Runtime.evaluate', {
        expression: `
          (() => {
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }));
          })()
        `
      });
      await sleep(600);
    } else if (action === 'notifications') {
      await send('Runtime.evaluate', {
        expression: `
          (() => {
            const bell = document.querySelector('button[aria-label="Notifications"]');
            if (bell) bell.click();
          })()
        `
      });
      await sleep(600);
    }

    await sleep(waitMs);

    const shot = await send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: action === 'fullpage'
    });
    const buffer = Buffer.from(shot.data, 'base64');
    writeFileSync(outputPath, buffer);

    console.log(`Screenshot saved successfully: ${outputPath} (${buffer.length} bytes)`);

    ws.close();
  } catch (err) {
    console.error('Screenshot capture failed:', err);
  } finally {
    browserProcess.kill('SIGKILL');
  }
}

run();
