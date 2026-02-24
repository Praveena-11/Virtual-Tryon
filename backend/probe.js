// probe2.js — run: node probe2.js
// Uploads real images then tests every possible input format for /call/tryon
const axios    = require('axios');
const https    = require('https');
const FormData = require('form-data');
const fs       = require('fs');
require('dotenv').config();

const SPACE    = 'https://yisol-idm-vton.hf.space';
const HF_TOKEN = process.env.HF_TOKEN;
const authH    = HF_TOKEN ? { Authorization: `Bearer ${HF_TOKEN}` } : {};

// ── 1x1 white JPEG ────────────────────────────────────────────
const TINY_BUF = Buffer.from(
  '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDB' +
  'kSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAAR' +
  'CAABAAEDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABgUEB//EAB4QAAE' +
  'EAwEBAAAAAAAAAAAAAAABAgMEBREhMf/EABQBAQAAAAAAAAAAAAAAAAAAAAD/xAAU' +
  'EQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwXu3OKrZJfgpXgAAAAAAAA' +
  'AAAAAAAAAAAAAB//9k=', 'base64'
);

async function upload(buf, filename) {
  const form = new FormData();
  form.append('files', buf, { filename, contentType: 'image/jpeg' });
  const res = await axios.post(`${SPACE}/upload`, form, {
    headers: { ...form.getHeaders(), ...authH },
    timeout: 30000, maxContentLength: Infinity, maxBodyLength: Infinity
  });
  console.log('[Upload] response:', JSON.stringify(res.data));
  const item = res.data[0];
  if (typeof item === 'string') return { path: item, url: `${SPACE}/file=${item}` };
  return { path: item.path, url: item.url || `${SPACE}/file=${item.path}`, ...item };
}

// Read /info to get exact component types
async function getInfo() {
  try {
    const r = await axios.get(`${SPACE}/info`, { headers: authH, timeout: 15000 });
    const tryon = r.data?.named_endpoints?.['/tryon'];
    console.log('\n[INFO] /tryon endpoint:');
    console.log(JSON.stringify(tryon, null, 2));
    return tryon;
  } catch(e) { console.log('[INFO] failed:', e.message); return null; }
}

function sseRead(eventId, label) {
  return new Promise(resolve => {
    const req = https.request({
      hostname: 'yisol-idm-vton.hf.space',
      path: `/call/tryon/${eventId}`,
      method: 'GET',
      headers: { Accept: 'text/event-stream', ...authH },
      timeout: 90000
    }, res => {
      let buf = '';
      const t = setTimeout(() => { req.destroy(); console.log(`  [${label}] timeout`); resolve('timeout'); }, 85000);
      res.on('data', chunk => {
        buf += chunk.toString();
        const evs = buf.split(/\n\n/); buf = evs.pop();
        for (const ev of evs) {
          let type = '', data = '';
          for (const line of ev.split('\n')) {
            if (line.startsWith('event:')) type = line.slice(6).trim();
            if (line.startsWith('data:'))  data = line.slice(5).trim();
          }
          console.log(`  [${label}] event=${type} data=${data.slice(0, 300)}`);
          if (type === 'complete' || type === 'error') {
            clearTimeout(t); req.destroy(); resolve(type + ':' + data.slice(0, 100));
          }
        }
      });
      res.on('end', () => { clearTimeout(t); resolve('ended'); });
      res.on('error', e => { clearTimeout(t); resolve('err:'+e.message); });
    });
    req.on('error', e => resolve('req-err:'+e.message));
    req.end();
  });
}

async function tryFormat(label, data) {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`FORMAT: ${label}`);
  console.log('data[0]:', JSON.stringify(data[0]).slice(0, 200));
  console.log('data[1]:', JSON.stringify(data[1]).slice(0, 200));
  try {
    const res = await axios.post(`${SPACE}/call/tryon`,
      { data },
      { headers: { 'Content-Type': 'application/json', ...authH }, timeout: 20000 }
    );
    const eventId = res.data?.event_id;
    console.log(`  submit OK, event_id: ${eventId}`);
    if (!eventId) return;
    const result = await sseRead(eventId, label);
    console.log(`  RESULT: ${result}`);
  } catch(e) {
    console.log(`  submit FAILED: ${e.response?.status} ${JSON.stringify(e.response?.data).slice(0,200) || e.message}`);
  }
}

async function main() {
  console.log('Uploading test images...');
  const pf = await upload(TINY_BUF, 'person.jpg');
  const gf = await upload(TINY_BUF, 'garment.jpg');
  console.log('person:', pf);
  console.log('garment:', gf);

  await getInfo();

  const DESC = 'test shirt', MASK=true, CROP=true, STEPS=1, SEED=42;

  // Format A: just path strings
  await tryFormat('A: path strings', [pf.path, gf.path, DESC, MASK, CROP, STEPS, SEED]);

  // Format B: { path } only
  await tryFormat('B: {path} objects', [
    { path: pf.path }, { path: gf.path }, DESC, MASK, CROP, STEPS, SEED
  ]);

  // Format C: full FileData with background_color (Gradio image component)
  await tryFormat('C: FileData + meta', [
    { path: pf.path,  url: pf.url,  orig_name: 'person.jpg',  mime_type: 'image/jpeg', size: TINY_BUF.length, is_stream: false, meta: { _type: 'gradio.FileData' } },
    { path: gf.path,  url: gf.url,  orig_name: 'garment.jpg', mime_type: 'image/jpeg', size: TINY_BUF.length, is_stream: false, meta: { _type: 'gradio.FileData' } },
    DESC, MASK, CROP, STEPS, SEED
  ]);

  // Format D: { image: {path} } wrapper (some Gradio image components)
  await tryFormat('D: {image:{path}} wrapper', [
    { image: { path: pf.path, url: pf.url, orig_name:'person.jpg',  mime_type:'image/jpeg' } },
    { image: { path: gf.path, url: gf.url, orig_name:'garment.jpg', mime_type:'image/jpeg' } },
    DESC, MASK, CROP, STEPS, SEED
  ]);

  // Format E: { background: null, composite: null, layers: [], image: {path} }
  await tryFormat('E: {background,composite,layers,image} (ImageEditor)', [
    { background: { path: pf.path, url: pf.url }, composite: null, layers: [], image: null },
    { background: { path: gf.path, url: gf.url }, composite: null, layers: [], image: null },
    DESC, MASK, CROP, STEPS, SEED
  ]);

  // Format F: url strings only
  await tryFormat('F: url strings', [pf.url, gf.url, DESC, MASK, CROP, STEPS, SEED]);

  // Format G: { url } only
  await tryFormat('G: {url} objects', [
    { url: pf.url }, { url: gf.url }, DESC, MASK, CROP, STEPS, SEED
  ]);

  // Format H: { path, url } minimal
  await tryFormat('H: {path,url} minimal', [
    { path: pf.path, url: pf.url },
    { path: gf.path, url: gf.url },
    DESC, MASK, CROP, STEPS, SEED
  ]);

  console.log('\n\nDone! Look for the format that got event=complete above.');
}

main().catch(console.error);