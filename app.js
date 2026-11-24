/**
 * NEXUS ONE PRO (넥서스원 프로)
 * 기업분석(12만) · 공동주택/관공서 입찰(실시간+건설 1.2만) · 소상공인 상권지도(275만) · 부동산 청약/착공 통합 인텔리전스
 */

const CANARY = 'NEXUSONE-VAULT-OK-V1';
const IDB_NAME = 'nexusone_pro_vault_v1';
const IDB_STORE = 'keys';
const PIPE_KEY = 'nexusone_pro_pipeline_v1';
const OVERRIDE_KEYS = 'nexusone_pro_api_overrides_v1';
const THEME_KEY = 'nexusone_pro_theme_v1';
const OPT_KEY = 'nexusone_pro_options_v1';

const STRATEGY_PRESETS = {
  balanced:  { label: '⚖️ 균형 통합', weights: { corp: 30, bid: 25, sbiz: 25, re: 20 }, desc: '4대 도메인 균형 평가' },
  b2b:       { label: '🛡️ 보안·CCTV·B2B', weights: { corp: 20, bid: 35, sbiz: 35, re: 10 }, desc: '입찰·사전규격 + 신규개업 상권 집중' },
  finance:   { label: '🏢 법인금융·RM', weights: { corp: 55, bid: 15, sbiz: 20, re: 10 }, desc: '고매출·상장·강소법인 중심' },
  franchise: { label: '🏪 프랜차이즈·출점', weights: { corp: 15, bid: 10, sbiz: 55, re: 20 }, desc: '상권밀도·신규개업·신축 배후단지' },
  construct: { label: '🏗️ 건설·분양·입주', weights: { corp: 15, bid: 35, sbiz: 10, re: 40 }, desc: '건축인허가·착공·신축분양·K-apt' },
};

const BIZ_PERSONAS = {
  security: {
    label: '🛡️ 보안·AI CCTV·출입통제',
    short: '보안·CCTV',
    storeDealMan: 360,   // 3년 약정 환산
    corpDealMan: 1200,
    oppDealMan: 4500,
    reDealMan: 6000,
    hook: '무인·AI 영상관제 + 출입통제 + 24시간 출동 결합 패키지',
  },
  telecom: {
    label: '📡 통신·POS·결제·렌탈',
    short: '통신·POS',
    storeDealMan: 280,
    corpDealMan: 900,
    oppDealMan: 2500,
    reDealMan: 2000,
    hook: '초고속 인터넷·POS·키오스크·테이블오더·정수기/렌탈 원스톱 개통',
  },
  construct: {
    label: '🏗️ 건설·전기·소방·시설',
    short: '건설·시설',
    storeDealMan: 180,
    corpDealMan: 2000,
    oppDealMan: 9500,
    reDealMan: 12000,
    hook: '전기·통신·소방·승강기·기계설비 사전 스펙인 및 유지보수 도급',
  },
  finance: {
    label: '💼 법인금융·보험·컨설팅',
    short: '법인금융·RM',
    storeDealMan: 150,
    corpDealMan: 1800,
    oppDealMan: 1500,
    reDealMan: 2500,
    hook: '정책자금·법인절세·퇴직연금·기업신용·대표자 리스크 컨설팅',
  },
  realestate: {
    label: '🏠 분양·중개·입주·인테리어',
    short: '분양·입주',
    storeDealMan: 450,
    corpDealMan: 800,
    oppDealMan: 3000,
    reDealMan: 8000,
    hook: '신축 입주 공동구매·상가 임대차 매칭·인테리어·분양 대행',
  },
};

const DEFAULT_OPTS = {
  preset: 'balanced',
  bizPersona: 'security',
  weights: { corp: 30, bid: 25, sbiz: 25, re: 20 },
  baseMap: 'vbase',       // vbase | vsat | vhyb | vwhite | vmidnight | osm
  defaultRadius: 500,     // 300 | 500 | 1000 | 2000
  markerCap: 1500,        // 800 | 1500 | 3000
  markerColorMode: 'category', // category | new2026 | density
  groupBuildings: true,
  showStoreLabels: false,
  showBcgCharts: true,
  showQuantBadges: true,
  autoHeat: false,
  autoCadastral: false,
  autoZoning: false,
  geminiKey: '',
};

const SBIZ_L1_COLORS = {
  '음식': '#ef4444',
  '소매': '#2563eb',
  '수리·개인': '#8b5cf6',
  '과학·기술': '#059669',
  '교육': '#d97706',
  '보건의료': '#06b6d4',
  '시설관리·임대': '#92400e',
  '부동산': '#ec4899',
  '숙박': '#6366f1',
  '예술·스포츠': '#14b8a6',
};
function sbizCategoryColor(l1) {
  return SBIZ_L1_COLORS[l1] || '#475569';
}
function getStoreB2bPitch(l1, l3, isNew2026) {
  const prefix = isNew2026 ? '🆕 2026 신규개업 골든타임 · ' : '';
  if (l1 === '음식') return `${prefix}POS·키오스크·주방/홀 AI CCTV·출입보안·방역 패키지 제안 적합`;
  if (l1 === '보건의료') return `${prefix}대기실 스마트관제·개인정보/출입통제·전용통신회선·보안솔루션 적합`;
  if (l1 === '교육') return `${prefix}등하원 안심알림·교실/복도 CCTV·스마트출결·화재감지 제안 적합`;
  if (l1 === '소매') return `${prefix}무인매장 관제·도난방지 AI CCTV·결제단말기·통신결합 제안 적합`;
  if (l1 === '과학·기술' || l1 === '시설관리·임대' || l1 === '부동산') return `${prefix}법인 보안·지문/안면 출입통제·오피스 네트워크·렌탈 제안 적합`;
  return `${prefix}매장 보안 CCTV·스마트 출입관리·통신/결제 통합 패키지 제안 적합`;
}

function loadOpts() {
  try {
    const saved = JSON.parse(localStorage.getItem(OPT_KEY) || '{}');
    return {
      ...DEFAULT_OPTS,
      ...saved,
      weights: { ...DEFAULT_OPTS.weights, ...(saved.weights || {}) },
    };
  } catch {
    return { ...DEFAULT_OPTS, weights: { ...DEFAULT_OPTS.weights } };
  }
}
function saveOpts() {
  localStorage.setItem(OPT_KEY, JSON.stringify(S.opts));
}

// ===== GLOBAL APPLICATION STATE =====
const S = {
  vault: null,
  cryptoKey: null,
  core: null,        // { builtAt, stats, vaultKeys, sido, corpMeta, sbizSummary }
  map: null,         // { w, h, regions, sidos }
  fusion: null,      // { builtAt, regions }
  fusionByRid: new Map(),
  opps: [],          // live + vault opportunities
  re: null,          // { listings, starts, complexes }
  builders: null,    // lazy loaded { industries, rows }
  corpLoaded: false,
  corpLoading: false,
  corps: [],         // 120,028 rows
  corpEnrichMap: new Map(),
  corpTags: [],      // [{ id, label, set }]
  corpStatusBytes: null,

  // Sbiz lazy per-sido cache & Pro GIS layers
  sbizCache: new Map(), // slug -> parsed sido object
  sbizActiveSlug: '',
  sbizLiveStores: [],
  leafletMap: null,
  leafletLayer: null,
  leafletTile: null,
  leafletHybrid: null,
  leafletWms: {},       // { cadastral, zoning, emd, bldg }
  leafletHeat: null,
  leafletCatchLayer: null,
  leafletRulerLayer: null,
  gisBase: 'vbase',
  gisLayers: { cadastral: false, zoning: false, emd: false, bldg: false, heat: false },
  gisRadius: 500,
  gisRulerMode: false,
  rulerPts: [],
  catchment: null,      // { lat, lon, radius, stores, stats, vworld }
  lastSbizMatchedIdx: [],

  // UI Navigation, Pro Options & Expert State
  opts: loadOpts(),
  tab: 'overview',
  selectedRid: -1,
  compareRid: -1,
  showSliders: false,
  svgZoom: 1,
  svgPan: { x: 0, y: 0 },
  mapMetric: 'total',
  rankSort: 'total',

  // Corp filters
  corpQ: '', corpSd: '', corpType: '', corpTag: '', corpStatus: '', corpSort: 'rev', corpPage: 1,
  // Bid filters
  bidSub: 'opps', bidQ: '', bidStage: '', bidField: '', bidPage: 1,
  bldQ: '', bldSector: '', bldPage: 1,
  // Sbiz filters & v6 Split-View / YYYYMM state
  sbizQ: '', sbizSgg: '', sbizL1: '', sbizOnly2026: false, sbizView: 'stores', sbizPage: 1,
  sbizYear: '', sbizMonth: '', sbizPeriod: '', sbizSort: 'ymDesc',
  sbizSplitView: true, sbizMapExpanded: false, sbizViewportSync: false, sbizInViewIdx: [],
  // RealEstate filters
  reSub: 'apt', reQ: '', reArea: '', myScore: 55, myBudgetEok: 8,
  // Hub & Pipeline
  pipeline: [],
  pipeStageFilter: '',
  diagResults: [],
  diagTime: '',
};

// ===== DOM & FORMAT HELPERS =====
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = (n) => (Number.isFinite(Number(n)) ? Math.round(Number(n)).toLocaleString('ko-KR') : '0');
const fmtDec = (n, d = 1) => (Number.isFinite(Number(n)) ? Number(n).toLocaleString('ko-KR', { maximumFractionDigits: d }) : '0');

let toastTimer = null;
function toast(msg) {
  const el = $('toast');
  el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add('hidden'), 2600);
}

function normKey(raw) {
  const t = String(raw || '').trim();
  if (!t) return '';
  try { return encodeURIComponent(t.includes('%') ? decodeURIComponent(t) : t); } catch { return encodeURIComponent(t); }
}

function getApiKeys() {
  let ov = {};
  try { ov = JSON.parse(localStorage.getItem(OVERRIDE_KEYS) || '{}'); } catch {}
  const dataGoRaw = ov.dataGo || S.core?.vaultKeys?.dataGo || '';
  const vworldRaw = ov.vworld || S.core?.vaultKeys?.vworld || '';
  return { dataGoRaw, dataGoEnc: normKey(dataGoRaw), vworld: vworldRaw };
}

function maskKey(k) {
  if (!k) return '미등록';
  if (k.length <= 12) return '••••';
  return `${k.slice(0, 7)}…${k.slice(-6)} (${k.length}자)`;
}

function loadPipeline() {
  try { S.pipeline = JSON.parse(localStorage.getItem(PIPE_KEY) || '[]'); } catch { S.pipeline = []; }
  updatePipeBadge();
}
function savePipeline() {
  localStorage.setItem(PIPE_KEY, JSON.stringify(S.pipeline));
  updatePipeBadge();
}
function updatePipeBadge() {
  const b = $('pipeBadge');
  if (b) b.textContent = String(S.pipeline.length);
}

function addToPipeline(item) {
  if (S.pipeline.some((p) => p.id === item.id)) {
    toast('이미 파이프라인에 등록된 항목입니다.');
    return;
  }
  S.pipeline.unshift({
    id: item.id,
    domain: item.domain, // corp | bid | sbiz | re
    title: item.title,
    sub: item.sub || '',
    region: item.region || '',
    valueMan: Number(item.valueMan) || 0,
    stage: '발굴',
    note: '',
    addedAt: new Date().toISOString().slice(0, 10),
  });
  savePipeline();
  toast(`💼 파이프라인에 추가됨: ${item.title}`);
}

// ===== WEBCRYPTO VAULT ENGINE =====
const b64ToBytes = (b64) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

async function deriveKey(password, saltB64, iter) {
  const mat = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: b64ToBytes(saltB64), iterations: iter, hash: 'SHA-256' },
    mat,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );
}

async function verifyKey(key, vault) {
  try {
    const plain = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: b64ToBytes(vault.checkIv) },
      key,
      b64ToBytes(vault.checkCt)
    );
    return new TextDecoder().decode(plain) === CANARY;
  } catch {
    return false;
  }
}

async function gunzipBytes(u8) {
  if (u8[0] === 0x1f && u8[1] === 0x8b && typeof DecompressionStream !== 'undefined') {
    const ds = new DecompressionStream('gzip');
    const res = new Response(new Blob([u8]).stream().pipeThrough(ds));
    return new Uint8Array(await res.arrayBuffer());
  }
  return u8;
}

async function fetchDecryptJson(name) {
  const res = await fetch(`data/${name}.enc?v=${encodeURIComponent(S.vault.builtAt || '1')}`);
  if (!res.ok) throw new Error(`HTTP ${res.status} (${name}.enc)`);
  const buf = new Uint8Array(await res.arrayBuffer());
  const iv = buf.subarray(0, 12);
  const ct = buf.subarray(12);
  const dec = new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, S.cryptoKey, ct));
  const plain = await gunzipBytes(dec);
  return JSON.parse(new TextDecoder().decode(plain));
}

// IndexedDB non-extractable key cache
function openIdb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(IDB_STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function idbGetKey() {
  try {
    const db = await openIdb();
    return await new Promise((res) => {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const r = tx.objectStore(IDB_STORE).get('master');
      r.onsuccess = () => res(r.result || null);
      r.onerror = () => res(null);
    });
  } catch { return null; }
}
async function idbSetKey(key) {
  try {
    const db = await openIdb();
    await new Promise((res, rej) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      tx.objectStore(IDB_STORE).put(key, 'master');
      tx.oncomplete = res;
      tx.onerror = rej;
    });
  } catch {}
}
async function idbClearKey() {
  try {
    const db = await openIdb();
    await new Promise((res) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      tx.objectStore(IDB_STORE).clear();
      tx.oncomplete = res;
      tx.onerror = res;
    });
  } catch {}
}

// ===== VWORLD JSONP HELPER =====
function jsonp(url, timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    const cb = `_nxJsonp_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
    const s = document.createElement('script');
    let done = false;
    const timer = setTimeout(() => {
      if (done) return;
      done = true;
      cleanup();
      reject(new Error('JSONP 시간 초과'));
    }, timeoutMs);
    function cleanup() {
      clearTimeout(timer);
      delete window[cb];
      s.remove();
    }
    window[cb] = (data) => {
      if (done) return;
      done = true;
      cleanup();
      resolve(data);
    };
    s.onerror = () => {
      if (done) return;
      done = true;
      cleanup();
      reject(new Error('JSONP 로드 실패'));
    };
    const sep = url.includes('?') ? '&' : '?';
    s.src = `${url}${sep}callback=${cb}`;
    document.head.appendChild(s);
  });
}

async function queryVworldPoint(lon, lat) {
  const { vworld } = getApiKeys();
  if (!vworld) throw new Error('브이월드 키가 없습니다.');
  const isLocal = /^(127\.0\.0\.1|localhost)$/.test(location.hostname);
  const dom = encodeURIComponent((!isLocal && location.origin && /^https?:/.test(location.origin)) ? location.origin : 'https://heebonpark.github.io');
  const [addrRes, landRes, zoneRes] = await Promise.all([
    jsonp(`https://api.vworld.kr/req/address?service=address&request=getAddress&version=2.0&crs=epsg:4326&point=${lon},${lat}&format=json&type=both&key=${vworld}&domain=${dom}`),
    jsonp(`https://api.vworld.kr/req/data?service=data&request=GetFeature&data=LP_PA_CBND_BUBUN&key=${vworld}&domain=${dom}&geomFilter=POINT(${lon}%20${lat})&size=1&format=json`).catch(() => null),
    jsonp(`https://api.vworld.kr/req/data?service=data&request=GetFeature&data=LT_C_UQ111&key=${vworld}&domain=${dom}&geomFilter=POINT(${lon}%20${lat})&size=5&format=json`).catch(() => null),
  ]);
  const addrText = addrRes?.response?.result?.[0]?.text || '주소 조회 결과 없음';
  const props = landRes?.response?.result?.featureCollection?.features?.[0]?.properties || {};
  const zFeats = zoneRes?.response?.result?.featureCollection?.features || [];
  const zoning = [...new Set(zFeats.map((f) => f?.properties?.uname).filter(Boolean))].join(', ');
  const jigaNum = Number(props.jiga || 0);
  const pyeongMan = jigaNum > 0 ? Math.round((jigaNum * 3.305785) / 10000) : 0;
  return {
    addr: addrText,
    jigaNum,
    jiga: jigaNum > 0 ? `${fmt(jigaNum)}원/㎡` : '미제공',
    pyeongMan,
    zoning: zoning || '미제공',
    pnu: props.pnu || '',
  };
}

async function searchVworldPlace(query) {
  const { vworld } = getApiKeys();
  if (!vworld) throw new Error('브이월드 키가 없습니다.');
  const isLocal = /^(127\.0\.0\.1|localhost)$/.test(location.hostname);
  const dom = encodeURIComponent((!isLocal && location.origin && /^https?:/.test(location.origin)) ? location.origin : 'https://heebonpark.github.io');
  const q = encodeURIComponent(query.trim());
  // Try Place search first, fallback to Address search
  const j1 = await jsonp(`https://api.vworld.kr/req/search?service=search&request=search&version=2.0&crs=EPSG:4326&size=5&page=1&query=${q}&type=place&format=json&key=${vworld}&domain=${dom}`).catch(() => null);
  let item = j1?.response?.result?.items?.[0];
  if (!item) {
    const j2 = await jsonp(`https://api.vworld.kr/req/search?service=search&request=search&version=2.0&crs=EPSG:4326&size=5&page=1&query=${q}&type=address&category=road&format=json&key=${vworld}&domain=${dom}`).catch(() => null);
    item = j2?.response?.result?.items?.[0];
  }
  if (!item?.point) throw new Error('장소·주소를 찾을 수 없습니다.');
  return {
    title: item.title || item.address?.road || item.address?.parcel || query,
    lat: Number(item.point.y),
    lon: Number(item.point.x),
  };
}

function downloadCsv(filename, headers, rows) {
  const escCsv = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const content = '\uFEFF' + headers.map(escCsv).join(',') + '\n' + rows.map((r) => r.map(escCsv).join(',')).join('\n');
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1500);
}

// ===== EXPERT QUANT ENGINE (HHI · LQ · BLUE-OCEAN · LORENZ/GINI · DYNAMIC WEIGHTS) =====
function recomputeFusionQuant() {
  if (!S.fusion?.regions?.length) return;
  const regs = S.fusion.regions;
  const w = S.opts.weights;
  const wSum = Math.max(1, (Number(w.corp) || 0) + (Number(w.bid) || 0) + (Number(w.sbiz) || 0) + (Number(w.re) || 0));

  const totCorp = regs.reduce((a, r) => a + (r.corp.cnt || 0), 0) || 1;
  const totSbiz = regs.reduce((a, r) => a + (r.sbiz.cnt || 0), 0) || 1;
  const totNew26 = regs.reduce((a, r) => a + (r.sbiz.new2026 || 0), 0) || 1;
  const natNewRate = totNew26 / totSbiz;

  // Raw blue-ocean demand-to-competition ratio
  const rawBlue = regs.map((r) => {
    const demand = (r.corp.cnt * 0.5) + (r.sbiz.new2026 * 2.5) + ((r.bid.preSpecCnt + r.bid.archCnt + r.re.aptCnt) * 40);
    const comp = 10 + (r.bid.builderCnt || 0) * 1.4;
    return demand / comp;
  });
  const maxLogBlue = Math.max(1, Math.log1p(Math.max(...rawBlue)));
  const maxNewRate = Math.max(0.01, ...regs.map((r) => (r.sbiz.cnt > 50 ? r.sbiz.new2026 / r.sbiz.cnt : 0)));

  regs.forEach((r, idx) => {
    const customTotal = Math.round(
      (r.scores.corp * w.corp + r.scores.bid * w.bid + r.scores.sbiz * w.sbiz + r.scores.re * w.re) / wSum
    );
    r.scores.total = customTotal;

    const sbizCnt = r.sbiz.cnt || 0;
    const newRatePct = sbizCnt > 0 ? (r.sbiz.new2026 / sbizCnt) * 100 : 0;

    // HHI from topL1 distribution (0..10,000)
    let hhi = 0;
    if (sbizCnt > 0 && r.sbiz.topL1?.length) {
      let accounted = 0;
      for (const [, cnt] of r.sbiz.topL1) {
        const sh = (cnt / sbizCnt) * 100;
        hhi += sh * sh;
        accounted += cnt;
      }
      const rem = Math.max(0, sbizCnt - accounted);
      if (rem > 0) {
        const avgRem = (rem / 4 / sbizCnt) * 100;
        hhi += 4 * avgRem * avgRem;
      }
      hhi = Math.min(10000, Math.round(hhi));
    }

    // Location Quotient (LQ): Corp share vs Sbiz share (1.0 = national avg)
    const shareCorp = r.corp.cnt / totCorp;
    const shareSbiz = sbizCnt / totSbiz;
    const lqCorp = shareSbiz > 0 ? Math.round((shareCorp / shareSbiz) * 100) / 100 : (r.corp.cnt > 0 ? 2.0 : 0);
    const lqNew26 = natNewRate > 0 && sbizCnt > 0 ? Math.round(((r.sbiz.new2026 / sbizCnt) / natNewRate) * 100) / 100 : 0;

    const blueOcean = Math.min(100, Math.round((Math.log1p(rawBlue[idx]) / maxLogBlue) * 100));
    const newRateScore = Math.min(100, Math.round(((sbizCnt > 50 ? (r.sbiz.new2026 / sbizCnt) : 0) / maxNewRate) * 100));
    const lqScore = Math.min(100, Math.round(Math.min(3, lqCorp) / 3 * 100));

    r.quant = {
      newRatePct: Math.round(newRatePct * 10) / 10,
      newRateScore,
      hhi,
      hhiLabel: hhi < 1500 ? '다각화 상권' : hhi < 2500 ? '적정 집중' : '특정업종 과밀',
      lqCorp,
      lqNew26,
      lqScore,
      blueOcean,
    };
  });
}

function computeLorenzGini(values) {
  const arr = values.map((v) => Math.max(0, Number(v) || 0)).sort((a, b) => a - b);
  const n = arr.length;
  const total = arr.reduce((a, b) => a + b, 0);
  if (!n || !total) return { gini: 0, top20Share: 0, points: [[0, 0], [1, 1]] };
  let cum = 0, area = 0;
  const points = [[0, 0]];
  for (let i = 0; i < n; i++) {
    const prevY = cum / total;
    cum += arr[i];
    const currY = cum / total;
    area += (prevY + currY) / 2 / n;
    if (i % Math.max(1, Math.floor(n / 25)) === 0 || i === n - 1) {
      points.push([(i + 1) / n, currY]);
    }
  }
  const gini = Math.max(0, Math.min(1, 1 - 2 * area));
  const top20Cnt = Math.max(1, Math.round(n * 0.2));
  const top20Sum = arr.slice(-top20Cnt).reduce((a, b) => a + b, 0);
  return { gini: Math.round(gini * 1000) / 1000, top20Share: Math.round((top20Sum / total) * 1000) / 10, points };
}

// ===== COMMERCIAL OPPORTUNITY ENGINE (TAM/SAM · PLAYBOOK · EXECUTIVE REPORT) =====
function analyzeCommercialOpp(r, personaKey = S.opts.bizPersona || 'security') {
  const p = BIZ_PERSONAS[personaKey] || BIZ_PERSONAS.security;
  const q = r.quant || { newRatePct: 0, hhi: 0, hhiLabel: '-', lqCorp: 0, lqNew26: 0, blueOcean: 0 };
  const earlyOpps = (r.bid.preSpecCnt || 0) + (r.bid.archCnt || 0);
  const totalOpps = (r.bid.bidCnt || 0) + earlyOpps + (r.bid.aptOppCnt || 0);
  const rePipeline = (r.re.aptCnt || 0) + (r.re.remndrCnt || 0) + (r.re.startCnt || 0);

  // Realistic addressable commercial pool (만원) & 90-day target SAM (conservative capture rate)
  const storePoolMan = Math.round((r.sbiz.new2026 || 0) * p.storeDealMan * 0.15); // 15% 유효 신규개업
  const corpPoolMan = Math.round(((r.corp.strong || 0) * 2 + (r.corp.listed || 0) * 3 + Math.min(200, (r.corp.cnt || 0) * 0.08)) * p.corpDealMan * 0.2);
  const oppPoolMan = Math.round((earlyOpps * 1.5 + (r.bid.bidCnt || 0) + (r.bid.aptOppCnt || 0) * 0.6) * p.oppDealMan * 0.18);
  const rePoolMan = Math.round(rePipeline * p.reDealMan * 0.25);
  const tamMan = storePoolMan + corpPoolMan + oppPoolMan + rePoolMan;
  const sam90Man = Math.round(tamMan * 0.12); // 90일 현실 타깃 수주목표(12%)
  const hotLeads = (r.sbiz.new2026 || 0) + earlyOpps * 5 + (r.corp.strong || 0) * 3 + rePipeline * 4;

  // Commercial Opportunity Grade
  const commScore = Math.min(99, Math.round(
    r.scores.total * 0.55 + (q.blueOcean || 0) * 0.25 + Math.min(100, (q.newRatePct || 0) * 8) * 0.20
  ));
  const grade = commScore >= 84 ? 'S+ 초핵심 수주거점' : commScore >= 75 ? 'S 핵심 영업거점' : commScore >= 64 ? 'A 유망 집중거점' : 'B 선별 공략거점';

  // Primary opportunity driver
  const drivers = [
    { k: '신규개업 상권', v: storePoolMan, desc: `2026 신규개업 +${fmt(r.sbiz.new2026)}개(신규율 ${q.newRatePct}%)` },
    { k: '강소·법인 B2B', v: corpPoolMan, desc: `법인 ${fmt(r.corp.cnt)}사(상장 ${r.corp.listed}·강소 ${r.corp.strong}, LQ ${q.lqCorp})` },
    { k: '사전규격·인허가·단지', v: oppPoolMan, desc: `입찰·사전·인허가·K-apt 총 ${fmt(totalOpps)}건` },
    { k: '신축분양·착공', v: rePoolMan, desc: `신축분양 ${r.re.aptCnt}·착공 ${r.re.startCnt} 현장` },
  ].sort((a, b) => b.v - a.v);

  const topCat = (r.sbiz.topL1 || []).slice(0, 2).map(([k, v]) => `${k}(${fmt(v)})`).join('·') || '복합 상권';
  const summary = `${r.fullName}은(는) <b>${p.short}</b> 관점에서 <b>${grade}(${commScore}점)</b>입니다. 가장 큰 수익원은 <b>${drivers[0].k}</b>(${drivers[0].desc})이며, 2순위 동력은 <b>${drivers[1].k}</b>(${drivers[1].desc})입니다.`;

  const playbook = [
    `<b>[D+7 즉시 착수]</b> ${r.sbiz.new2026 > 0 ? `상권지도에서 <b>2026 신규개업 ${fmt(r.sbiz.new2026)}개소</b> 및 대형상가(${fmt(r.sbiz.bldCnt)}동) 필터 → ${topCat} 중심 초도 방문·리드팩 CSV 추출` : `지역 핵심 상가 ${fmt(r.sbiz.cnt)}개소 중 밀집 건물 위주 집중 방문`}`,
    `<b>[D+30 사전 스펙인]</b> ${earlyOpps + rePipeline > 0 ? `사전규격(${r.bid.preSpecCnt}) · 건축인허가(${r.bid.archCnt}) · 신축착공(${r.re.startCnt}) 발주처/시공사에 <b>${p.hook}</b> 사전 제안서 발송` : `관내 K-apt(${r.bid.aptOppCnt + r.re.kaptCnt}단지) 관리사무소 및 입주자대표회의 교체 수요 점검`}`,
    `<b>[D+60 고단가 법인]</b> ${r.corp.top.length ? `대표 법인(<b>${r.corp.top.slice(0, 3).map((x) => x[0]).join(', ')}</b> 등 ${fmt(r.corp.cnt)}사) 중 국민연금 인원 순증 기업 대상 본사 방문 제안` : `관내 우수 법인 ${fmt(r.corp.cnt)}사 대상 연단위 유지보수·통합계약 제안`}`,
  ];

  const talkTrack = `"안녕하세요, ${r.name} 권역 ${p.short} 전담팀입니다. 최근 ${r.name} 내 ${r.sbiz.new2026 > 0 ? `신규 개업 매장(${fmt(r.sbiz.new2026)}곳)과 ` : ''}${earlyOpps > 0 ? `건축인허가·사전규격 현장(${earlyOpps}건)` : `주요 상업 건물(${fmt(r.sbiz.bldCnt)}동)`}을 중심으로 ${p.hook} 무상 현장진단을 진행 중인데, 10분 맞춤 견적 비교 자료를 전달드려도 될까요?"`;

  const riskNote = r.bid.builderCnt >= 250
    ? `⚠️ 지역 건설·시설 경쟁사 ${fmt(r.bid.builderCnt)}사 밀집(고경쟁) — 단가 경쟁 회피, AI 관제·사전규격 선점·대형건물 패키지 차별화 필수.`
    : (q.hhi >= 2500
      ? `⚠️ 업종 집중도(HHI ${fmt(q.hhi)}) 높음 — 핵심 1~2개 업종(${topCat}) 특화 제안서로 전환율 극대화 권장.`
      : `✅ 경쟁 여력 양호(블루오션 ${q.blueOcean}점 · 지역 건설/시설 ${fmt(r.bid.builderCnt)}사 · HHI ${fmt(q.hhi)} 다각화) — 선제 진입 시 높은 점유율 확보 유리.`);

  return { p, commScore, grade, tamMan, sam90Man, hotLeads, drivers, summary, playbook, talkTrack, riskNote, earlyOpps, totalOpps, rePipeline };
}

function renderCommercialPanelHtml(r) {
  const c = analyzeCommercialOpp(r);
  return `
    <div class="comm-panel">
      <div class="comm-head">
        <div>
          <span style="font-weight:800;font-size:13.5px">💰 상업적 영업기회 분석 & 실행 코멘트</span>
          <span class="tag tag-corp" style="margin-left:6px">${esc(c.grade)}</span>
        </div>
        <div style="display:flex;gap:5px;align-items:center;flex-wrap:wrap">
          <select id="selBizPersona" class="select" style="padding:4px 8px;font-size:11.5px;font-weight:700">
            ${Object.entries(BIZ_PERSONAS).map(([k, v]) => `<option value="${k}" ${S.opts.bizPersona === k ? 'selected' : ''}>${v.label}</option>`).join('')}
          </select>
          <button id="btnOpenExecReport" class="btn btn-sm btn-primary" type="button">📄 정밀 리포트 (PDF)</button>
        </div>
      </div>

      <div class="comm-kpi-row">
        <div class="comm-kpi"><span>추정 단기 영업시장 (TAM)</span><b style="color:var(--c-corp)">${fmtDec(c.tamMan / 10000, 1)}억원</b></div>
        <div class="comm-kpi"><span>90일 현실 수주목표 (12%)</span><b style="color:var(--c-sbiz)">${fmtDec(c.sam90Man / 10000, 1)}억원</b></div>
        <div class="comm-kpi"><span>즉시 공략 핫리드 풀</span><b style="color:var(--c-bid)">${fmt(c.hotLeads)}건</b></div>
      </div>

      <div class="comm-comment-box">${c.summary}</div>

      <div class="comm-playbook">
        ${c.playbook.map((step) => `<div class="comm-step">${step}</div>`).join('')}
      </div>

      <div class="comm-talk">
        <b>🗣️ 현장 오프닝 멘트 (${esc(c.p.short)}):</b> ${esc(c.talkTrack)}
        <div style="margin-top:5px;color:var(--text)">${c.riskNote}</div>
      </div>
    </div>
  `;
}

function openExecutiveReport(r) {
  const c = analyzeCommercialOpp(r);
  const q = r.quant || {};
  const today = new Date().toISOString().slice(0, 10);
  const localOpps = S.opps.filter((o) => (o._fusionRid === r.rid) || String(o.region || '').includes(r.name)).slice(0, 5);
  const localRe = (S.re.listings || []).filter((l) => (l._fusionRid === r.rid) || String(l.addr || '').includes(r.name)).slice(0, 4);

  $('reportModalTitle').textContent = `📄 [정밀 영업기회 리포트] ${r.fullName}`;
  $('reportPaper').innerHTML = `
    <div class="rep-banner">
      <div>
        <div style="font-size:11px;font-weight:700;color:#a5b4fc;letter-spacing:0.05em">NEXUS ONE PRO · COMMERCIAL OPPORTUNITY REPORT</div>
        <h2>${esc(r.fullName)} — 상업적 영업기회 정밀 리포트</h2>
        <p>적용 업종: ${esc(c.p.label)} · 기준일: ${today} · 전략 모델: ${esc(STRATEGY_PRESETS[S.opts.preset]?.label || '커스텀')}</p>
      </div>
      <div style="text-align:right">
        <div style="font-size:11px;color:#cbd5e1">상업 기회 종합등급</div>
        <div style="font-size:26px;font-weight:900;color:#34d399;line-height:1.1">${c.commScore}<span style="font-size:13px;color:#cbd5e1">/100</span></div>
        <div style="font-size:11.5px;font-weight:700;color:#fde68a">${esc(c.grade)}</div>
      </div>
    </div>

    <div class="rep-grid-4">
      <div class="quant-box"><div class="q-lbl">💰 추정 영업시장(TAM)</div><div class="q-val" style="color:var(--c-corp)">${fmtDec(c.tamMan / 10000, 1)}억원</div><div class="q-sub">유효 상업 파이프라인</div></div>
      <div class="quant-box"><div class="q-lbl">🎯 90일 수주목표(SAM)</div><div class="q-val" style="color:var(--c-sbiz)">${fmtDec(c.sam90Man / 10000, 1)}억원</div><div class="q-sub">보수적 12% 전환 기준</div></div>
      <div class="quant-box"><div class="q-lbl">🔥 즉시 공략 핫리드</div><div class="q-val" style="color:var(--c-bid)">${fmt(c.hotLeads)}건</div><div class="q-sub">2026신규·사전·강소·착공</div></div>
      <div class="quant-box"><div class="q-lbl">💎 블루오션 / LQ / HHI</div><div class="q-val">${q.blueOcean}점</div><div class="q-sub">LQ ${q.lqCorp} · HHI ${fmt(q.hhi)}</div></div>
    </div>

    <div class="rep-sec">
      <h4><span>1. Executive Summary & 핵심 수익원 분석</span><span style="font-size:11.5px;color:var(--muted)">${esc(c.p.short)}</span></h4>
      <div class="comm-comment-box">${c.summary}</div>
      <div style="display:grid;grid-template-columns:1fr 220px;gap:12px;align-items:center">
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>수익원 도메인</th><th>핵심 실데이터 근거</th><th>추정 기회 규모</th></tr></thead>
            <tbody>
              ${c.drivers.map((d) => `<tr><td><b>${esc(d.k)}</b></td><td>${esc(d.desc)}</td><td><b>${fmtDec(d.v / 10000, 1)}억원</b></td></tr>`).join('')}
            </tbody>
          </table>
        </div>
        <div style="display:flex;justify-content:center">${renderRadarSvg(r.scores)}</div>
      </div>
    </div>

    <div class="rep-sec">
      <h4><span>2. 30·60일 단계별 영업 실행 플레이북 & 현장 멘트</span></h4>
      <div class="comm-playbook">${c.playbook.map((s) => `<div class="comm-step">${s}</div>`).join('')}</div>
      <div class="comm-talk">
        <b>🗣️ 현장 영업 오프닝 멘트:</b> ${esc(c.talkTrack)}
        <div style="margin-top:5px;color:var(--text)">${c.riskNote}</div>
      </div>
    </div>

    <div class="rep-sec">
      <h4><span>3. 관내 즉시 공략 우선 타깃 (실데이터 자동 추출)</span></h4>
      <div class="grid-eq-2">
        <div class="domain-box">
          <h4>🏢 대표 법인 TOP 5</h4>
          ${r.corp.top.length ? r.corp.top.map((t) => `<div class="domain-stat-row"><span><b>${esc(t[0])}</b> (${esc(t[4])})</span><span>${t[2] ? fmt(t[2]) + '억' : '-'} · ${t[3] ? fmt(t[3]) + '명' : '-'}</span></div>`).join('') : '<div style="font-size:12px;color:var(--muted)">기업분석 탭에서 전체 조회 가능</div>'}
        </div>
        <div class="domain-box">
          <h4>🏪 핵심 소상공인 업종 TOP 5</h4>
          ${(r.sbiz.topL1 || []).map(([nm, cnt]) => `<div class="domain-stat-row"><span><b>${esc(nm)}</b></span><span>${fmt(cnt)}개 (${r.sbiz.cnt ? Math.round(cnt / r.sbiz.cnt * 100) : 0}%)</span></div>`).join('') || '<div style="font-size:12px;color:var(--muted)">데이터 없음</div>'}
        </div>
      </div>
      ${localOpps.length ? `
        <div class="domain-box" style="margin-top:10px">
          <h4>🎯 관내 포착 입찰 · 사전규격 · 건축인허가 · K-apt (${localOpps.length}건 샘플)</h4>
          ${localOpps.map((o) => `<div class="domain-stat-row"><span><b>${esc(o.title)}</b> (${esc(o.org)})</span><span>${o.budgetMan > 0 ? fmtDec(o.budgetMan / 10000, 1) + '억' : esc(o.stageType)}</span></div>`).join('')}
        </div>
      ` : ''}
      ${localRe.length ? `
        <div class="domain-box" style="margin-top:10px">
          <h4>🏠 관내 신축분양 · 무순위 (${localRe.length}건)</h4>
          ${localRe.map((l) => `<div class="domain-stat-row"><span><b>${esc(l.name)}</b> (${esc(l.builder || '-')})</span><span>${fmt(l.units || 0)}세대 · ${esc(l.moveIn || l.rcptBgn || '')}</span></div>`).join('')}
        </div>
      ` : ''}
    </div>
  `;

  $('reportFoot').innerHTML = `
    <button id="btnRepPrint" class="btn btn-primary btn-sm" type="button">🖨️ PDF 저장 / 인쇄</button>
    <button id="btnRepCopyMd" class="btn btn-emerald btn-sm" type="button">📋 보고서 전문 복사 (Markdown)</button>
    <button id="btnRepCopyKakao" class="btn btn-amber btn-sm" type="button">📱 카카오톡 요약 복사</button>
    <button id="btnRepAddPipe" class="btn btn-sm" type="button" style="margin-left:auto">💼 CRM 등록</button>
  `;

  $('reportBackdrop').classList.remove('hidden');

  $('btnRepPrint').addEventListener('click', () => window.print());
  $('btnRepCopyMd').addEventListener('click', () => {
    const md = `# [상업적 영업기회 정밀 리포트] ${r.fullName}
- **기준일**: ${today} | **업종**: ${c.p.label} | **상업등급**: ${c.grade} (${c.commScore}/100점)
- **추정 영업시장(TAM)**: ${fmtDec(c.tamMan / 10000, 1)}억원 | **90일 수주목표(SAM)**: ${fmtDec(c.sam90Man / 10000, 1)}억원 | **핫리드**: ${fmt(c.hotLeads)}건
- **퀀트 지표**: 블루오션 ${q.blueOcean}점 · 기업 LQ ${q.lqCorp} · 업종 HHI ${fmt(q.hhi)}(${q.hhiLabel}) · 2026 신규율 ${q.newRatePct}%

## 1. 핵심 기회 요약
${c.summary.replace(/<[^>]+>/g, '')}

## 2. 30·60일 영업 실행 플레이북
${c.playbook.map((x, i) => `${i + 1}. ${x.replace(/<[^>]+>/g, '')}`).join('\n')}

## 3. 현장 오프닝 멘트 & 리스크 체크
- **멘트**: ${c.talkTrack}
- **체크**: ${c.riskNote}

## 4. 관내 대표 법인 TOP 5
${r.corp.top.map((t, i) => `${i + 1}. ${t[0]} (${t[4]}, 매출 ${t[2] || '-'}억, 인원 ${t[3] || '-'}명)`).join('\n') || '-'}
`;
    navigator.clipboard?.writeText(md).then(() => toast('📋 정밀 리포트 전문(Markdown)이 복사되었습니다!')).catch(() => toast('복사 실패'));
  });
  $('btnRepCopyKakao').addEventListener('click', () => {
    const txt = `[${r.fullName} 영업기회 요약]\n• 등급: ${c.grade}(${c.commScore}점)\n• 90일목표: ${fmtDec(c.sam90Man / 10000, 1)}억 / 핫리드 ${fmt(c.hotLeads)}건\n• 핵심: ${c.drivers[0].k}(${c.drivers[0].desc})\n• 블루오션 ${q.blueOcean}점·신규율 ${q.newRatePct}%`;
    navigator.clipboard?.writeText(txt).then(() => toast('📱 카카오톡 공유용 요약이 복사되었습니다!')).catch(() => toast('복사 실패'));
  });
  $('btnRepAddPipe').addEventListener('click', () => {
    addToPipeline({
      id: `comm:${r.rid}:${S.opts.bizPersona}`,
      domain: 'corp',
      title: `[상업거점·${c.p.short}] ${r.fullName}`,
      sub: `${c.grade} · 90일목표 ${fmtDec(c.sam90Man / 10000, 1)}억 · 핫리드 ${fmt(c.hotLeads)}건`,
      region: r.fullName,
      valueMan: c.sam90Man,
    });
  });
}

function closeReportModal() { $('reportBackdrop').classList.add('hidden'); }

// ===== CORE BOOTSTRAP =====
async function unlockAndBoot(key) {
  S.cryptoKey = key;
  const [core, map, fusion, oppsObj, reObj] = await Promise.all([
    fetchDecryptJson('core'),
    fetchDecryptJson('map'),
    fetchDecryptJson('fusion'),
    fetchDecryptJson('opportunities'),
    fetchDecryptJson('realestate'),
  ]);
  S.core = core;
  S.map = map;
  S.fusion = fusion;
  S.fusionByRid = new Map((fusion.regions || []).map((r) => [r.rid, r]));
  S.opps = (oppsObj.items || []).map(enrichOpp);
  S.re = reObj;

  // Apply persisted Pro GIS defaults & compute expert quant metrics
  S.gisBase = S.opts.baseMap || 'vbase';
  S.gisRadius = S.opts.defaultRadius || 500;
  S.gisLayers.heat = !!S.opts.autoHeat;
  S.gisLayers.cadastral = !!S.opts.autoCadastral;
  S.gisLayers.zoning = !!S.opts.autoZoning;
  recomputeFusionQuant();

  // Pick initial spotlight region (#1 Fusion Score or 부평구)
  const sorted = [...fusion.regions].sort((a, b) => b.scores.total - a.scores.total);
  S.selectedRid = sorted[0]?.rid ?? 0;

  // Update Nav badges
  $('cntCorp').textContent = `${(core.stats.corpCount / 10000).toFixed(1)}만`;
  $('cntBid').textContent = fmt(S.opps.length);
  $('cntSbiz').textContent = `${(core.stats.sbizCount / 10000).toFixed(0)}만`;
  $('cntRe').textContent = fmt((reObj.listings?.length || 0) + (reObj.starts?.length || 0) + (reObj.complexes?.length || 0));
  $('brandMeta').textContent = `법인 ${fmt(core.stats.corpCount)} · 상가 ${fmt(core.stats.sbizCount)} · 입찰 ${fmt(S.opps.length)} · 청약 ${fmt(reObj.listings?.length || 0)}`;

  $('lockScreen').classList.add('hidden');
  $('appShell').classList.remove('hidden');
  renderCurrentTab();
}

function classifyField(text) {
  const t = String(text || '').toLowerCase();
  if (/cctv|보안|경비|출입통제|무인경비|방범|영상감시/.test(t)) return '보안·CCTV';
  if (/ai|스마트|주차관제|지능형|관제|iot|빅데이터/.test(t)) return 'AI·스마트';
  if (/승강기|엘리베이터|기계설비|냉난방|보일러/.test(t)) return '승강기·설비';
  if (/전기|통신|소방|정보통신|네트워크|구내통신/.test(t)) return '전기·통신·소방';
  if (/시설|청소|미화|위탁관리|조경|소독|용역/.test(t)) return '시설·경비·미화';
  return '건축·리모델링';
}

function calcDday(closeDate) {
  if (!closeDate) return null;
  const d = new Date(String(closeDate).slice(0, 10) + 'T23:59:59');
  if (Number.isNaN(d.getTime())) return null;
  return Math.ceil((d.getTime() - Date.now()) / 86400000);
}

function enrichOpp(o) {
  const field = o.field || classifyField(`${o.title} ${o.method || ''} ${o.org || ''}`);
  const dday = calcDday(o.closeDate);
  let score = 62;
  if (o.stageType === 'prespec') score += 16;
  else if (o.stageType === 'permit') score += 14;
  else if (o.stageType === 'complex') score += 10;
  if (o.budgetMan >= 50000) score += 14;
  else if (o.budgetMan >= 10000) score += 9;
  else if (o.budgetMan > 0) score += 4;
  if (field === '보안·CCTV' || field === 'AI·스마트') score += 8;
  if (dday !== null && dday >= 0 && dday <= 7) score += 7;
  score = Math.min(99, score);
  return { ...o, field, dday, icpScore: score };
}

// ===== LAZY LOADERS =====
async function ensureCorpLoaded(onProgress) {
  if (S.corpLoaded) return true;
  if (S.corpLoading) return false;
  S.corpLoading = true;
  try {
    const names = ['corp_c0', 'corp_c1', 'corp_c2', 'corp_enrich', 'corp_status'];
    const res = [];
    for (let i = 0; i < names.length; i++) {
      onProgress?.(Math.round(((i + 0.5) / names.length) * 100), `${names[i]}.enc 복호화 중 (${i + 1}/${names.length})…`);
      res.push(await fetchDecryptJson(names[i]));
    }
    const [c0, c1, c2, enrich, status] = res;
    S.corps = [...c0, ...c1, ...c2];
    S.corpEnrichMap = new Map(enrich.list || []);
    S.corpTags = Object.entries(enrich.tags || {}).map(([id, obj]) => ({
      id, label: obj.label, set: new Set(obj.b || []),
    }));
    S.corpStatusBytes = status.codesB64 ? b64ToBytes(status.codesB64) : null;
    S.corpLoaded = true;
    onProgress?.(100, '완료!');
    return true;
  } finally {
    S.corpLoading = false;
  }
}

async function ensureBuildersLoaded() {
  if (S.builders) return S.builders;
  S.builders = await fetchDecryptJson('builders');
  return S.builders;
}

async function loadSbizSido(slug) {
  if (S.sbizCache.has(slug)) {
    S.sbizActiveSlug = slug;
    return S.sbizCache.get(slug);
  }
  const sInfo = (S.core.sbizSummary.sidos || []).find((x) => x.slug === slug);
  toast(`🏪 ${sInfo?.name || slug} 상권 볼트 복호화 중 (${((sInfo?.bytes || 0) / 1048576).toFixed(1)} MB)…`);
  const data = await fetchDecryptJson(`sido_${slug}`);
  S.sbizCache.set(slug, data);
  S.sbizActiveSlug = slug;
  S.sbizSgg = '';
  S.sbizL1 = '';
  S.sbizPage = 1;
  toast(`✓ ${data.name} ${fmt(data.n)}개 상가 로드 완료`);
  return data;
}

// ===== TAB ROUTER =====
function switchTab(tab) {
  S.tab = tab;
  document.querySelectorAll('[data-tab]').forEach((el) => {
    el.classList.toggle('active', el.dataset.tab === tab);
  });
  window.scrollTo({ top: 0, behavior: 'instant' });
  renderCurrentTab();
}

function renderCurrentTab() {
  if (S.tab !== 'sbiz' && S.leafletMap) {
    S.leafletMap.remove();
    S.leafletMap = null;
    S.leafletLayer = null;
  }
  if (S.tab === 'overview') renderOverview();
  else if (S.tab === 'corp') renderCorpTab();
  else if (S.tab === 'bid') renderBidTab();
  else if (S.tab === 'sbiz') renderSbizTab();
  else if (S.tab === 'realestate') renderRealEstateTab();
  else if (S.tab === 'hub') renderHubTab();
}

// =========================================================================
// TAB 1: ⚡ 통합 360° 커맨드 센터 (4-WAY CROSS-DOMAIN FUSION + QUANT EXPERT)
// =========================================================================
function getMetricValue(f, metric) {
  if (!f) return 0;
  if (metric === 'newRate') return f.quant?.newRateScore ?? 0;
  if (metric === 'lq') return f.quant?.lqScore ?? 0;
  if (metric === 'blueOcean') return f.quant?.blueOcean ?? 0;
  return f.scores[metric] ?? f.scores.total;
}

function renderOverview() {
  recomputeFusionQuant();
  const st = S.core.stats;
  const reg = S.fusionByRid.get(S.selectedRid) || S.fusion.regions[0];
  const cmpReg = S.compareRid >= 0 && S.compareRid !== reg.rid ? S.fusionByRid.get(S.compareRid) : null;
  const quickRids = ['송파구', '강남구', '부평구', '계양구', '화성시', '수원시', '성남시', '해운대구']
    .map((nm) => S.fusion.regions.find((r) => r.name === nm))
    .filter(Boolean);
  const w = S.opts.weights;
  const wSum = Math.max(1, w.corp + w.bid + w.sbiz + w.re);
  const wPct = (v) => Math.round((v / wSum) * 100);

  // Pareto / Lorenz stats for current rankSort
  const lorenzVals = S.fusion.regions.map((r) => {
    if (S.rankSort === 'corp') return r.corp.cnt;
    if (S.rankSort === 'sbiz') return r.sbiz.cnt;
    if (S.rankSort === 'new26') return r.sbiz.new2026;
    if (S.rankSort === 'bid') return r.bid.bidCnt + r.bid.preSpecCnt + r.bid.archCnt + r.bid.aptOppCnt + r.bid.builderCnt * 0.1;
    if (S.rankSort === 're') return r.re.aptCnt + r.re.remndrCnt + r.re.startCnt + r.re.kaptCnt;
    return r.scores.total;
  });
  const lorenz = computeLorenzGini(lorenzVals);

  $('mainStage').innerHTML = `
    <div class="kpi-strip">
      <div class="kpi-card" style="--kpi-c:var(--c-corp)" data-jump="corp">
        <div class="kpi-label"><span>🏢 기업분석 (DART·국민연금)</span><span class="tag tag-corp">풀DB</span></div>
        <div class="kpi-val">${fmt(st.corpCount)}<span style="font-size:13px;font-weight:600;color:var(--muted)"> 사</span></div>
        <div class="kpi-sub">재무 3개년 · 국민연금 · 국세청 사업자상태</div>
      </div>
      <div class="kpi-card" style="--kpi-c:var(--c-bid)" data-jump="bid">
        <div class="kpi-label"><span>🎯 입찰·사전규격·인허가</span><span class="tag tag-bid">실API</span></div>
        <div class="kpi-val">${fmt(S.opps.length)}<span style="font-size:13px;font-weight:600;color:var(--muted)"> 건</span></div>
        <div class="kpi-sub">건설·시설 ${fmt(st.builderCount)}사 · 사전규격·건축인허가</div>
      </div>
      <div class="kpi-card" style="--kpi-c:var(--c-sbiz)" data-jump="sbiz">
        <div class="kpi-label"><span>🏪 전국 소상공인 상권</span><span class="tag tag-sbiz">16시도</span></div>
        <div class="kpi-val">${(st.sbizCount / 10000).toFixed(1)}<span style="font-size:13px;font-weight:600;color:var(--muted)"> 만개</span></div>
        <div class="kpi-sub">2026 신규개업 ${fmt(st.sbizNew2026)}개 · 건물별 그룹</div>
      </div>
      <div class="kpi-card" style="--kpi-c:var(--c-re)" data-jump="realestate">
        <div class="kpi-label"><span>🏠 부동산 청약·착공·K-apt</span><span class="tag tag-re">6종API</span></div>
        <div class="kpi-val">${fmt((S.re.listings?.length || 0) + (S.re.starts?.length || 0) + (S.re.complexes?.length || 0))}<span style="font-size:13px;font-weight:600;color:var(--muted)"> 건</span></div>
        <div class="kpi-sub">청약분양 ${fmt(S.re.listings?.length || 0)} · 착공 ${fmt(S.re.starts?.length || 0)} · K-apt ${fmt(S.re.complexes?.length || 0)}</div>
      </div>
    </div>

    <!-- EXPERT TOP 10 TECHNIQUES RIBBON -->
    <div class="top10-ribbon">
      <span class="gis-label">🏆 전문가 TOP 10 기법:</span>
      <button class="top10-pill" data-t10="sliders" type="button">① 4축 가중치·5전략</button>
      <button class="top10-pill" data-t10="radar" type="button">② 4-Way 레이더</button>
      <button class="top10-pill" data-t10="hhi" type="button">③ 업종 HHI 집중도</button>
      <button class="top10-pill" data-t10="lq" type="button">④ 입지계수 LQ</button>
      <button class="top10-pill" data-t10="pareto" type="button">⑤ 파레토·지니곡선</button>
      <button class="top10-pill" data-t10="blue" type="button">⑥ 블루오션 지수</button>
      <button class="top10-pill" data-t10="bcg" type="button">⑦ BCG 4분면 매트릭스</button>
      <button class="top10-pill" data-t10="sido" type="button">⑧ 17시도 누적비교</button>
      <button class="top10-pill" data-t10="gis" type="button">⑨ 히트맵·반경·건물스택</button>
      <button class="top10-pill" data-t10="cmp" type="button">⑩ 2지역 비교·전략진단</button>
    </div>

    <!-- EXPERT STRATEGY PRESET BAR -->
    <div class="preset-bar">
      <span class="gis-label">🧠 전문가 전략 모델:</span>
      ${Object.entries(STRATEGY_PRESETS).map(([k, p]) => `
        <button class="chip ${S.opts.preset === k ? 'active' : ''}" data-preset="${k}" title="${esc(p.desc)}">${p.label}</button>
      `).join('')}
      <button id="btnToggleSliders" class="btn btn-sm" style="margin-left:auto" type="button">
        🎚️ 가중치 커스텀 (${wPct(w.corp)}/${wPct(w.bid)}/${wPct(w.sbiz)}/${wPct(w.re)})
      </button>
    </div>

    ${S.showSliders ? `
      <div class="slider-panel">
        <div class="slider-item">
          <label><span style="color:var(--c-corp)">🏢 기업 가중치</span><span>${wPct(w.corp)}%</span></label>
          <input type="range" min="0" max="100" value="${w.corp}" data-w-key="corp" />
        </div>
        <div class="slider-item">
          <label><span style="color:var(--c-bid)">🎯 입찰 가중치</span><span>${wPct(w.bid)}%</span></label>
          <input type="range" min="0" max="100" value="${w.bid}" data-w-key="bid" />
        </div>
        <div class="slider-item">
          <label><span style="color:var(--c-sbiz)">🏪 상권 가중치</span><span>${wPct(w.sbiz)}%</span></label>
          <input type="range" min="0" max="100" value="${w.sbiz}" data-w-key="sbiz" />
        </div>
        <div class="slider-item">
          <label><span style="color:var(--c-re)">🏠 부동산 가중치</span><span>${wPct(w.re)}%</span></label>
          <input type="range" min="0" max="100" value="${w.re}" data-w-key="re" />
        </div>
      </div>
    ` : ''}

    <div class="grid-2">
      <!-- LEFT: Interactive Korea 229 Sigungu Map (Zoom/Pan + 8 Metrics) -->
      <div class="card">
        <div class="card-head">
          <div>
            <h2 class="card-title">🗺️ 대한민국 229 시군구 통합 GIS 히트맵</h2>
            <p class="card-sub">클릭=360° 스캔 · 휠/버튼=확대 · 드래그=이동 · 8대 전문가 지표 전환</p>
          </div>
          <select id="ovMapMetric" class="select">
            <option value="total" ${S.mapMetric === 'total' ? 'selected' : ''}>🏆 통합 융합지수 (가중치 반영)</option>
            <option value="corp" ${S.mapMetric === 'corp' ? 'selected' : ''}>🏢 기업 활력지수</option>
            <option value="bid" ${S.mapMetric === 'bid' ? 'selected' : ''}>🎯 입찰·사전규격·인허가</option>
            <option value="sbiz" ${S.mapMetric === 'sbiz' ? 'selected' : ''}>🏪 상권 밀도</option>
            <option value="newRate" ${S.mapMetric === 'newRate' ? 'selected' : ''}>🆕 2026 신규개업 활력률(%)</option>
            <option value="re" ${S.mapMetric === 're' ? 'selected' : ''}>🏠 청약·착공·K-apt</option>
            <option value="lq" ${S.mapMetric === 'lq' ? 'selected' : ''}>📐 기업 특화 입지계수(LQ)</option>
            <option value="blueOcean" ${S.mapMetric === 'blueOcean' ? 'selected' : ''}>💎 미개척 블루오션 지수</option>
          </select>
        </div>

        <div class="chips" style="margin-bottom:10px">
          ${quickRids.map((r) => `<button class="chip ${r.rid === reg.rid ? 'active' : ''}" data-pick-rid="${r.rid}">${esc(r.sidoShort)} ${esc(r.name)}</button>`).join('')}
        </div>

        <div class="korea-map-box" id="koreaMapBox">
          <div class="map-ctrl-float">
            <button id="btnMapZoomIn" type="button" title="확대">+</button>
            <button id="btnMapZoomOut" type="button" title="축소">−</button>
            <button id="btnMapReset" type="button" title="원래 크기">⟳</button>
          </div>
          <div id="koreaMapTooltip" class="map-tooltip hidden"></div>
          ${renderKoreaSvg(reg.rid, S.compareRid)}
          <div class="map-legend">
            <span>낮음</span>
            <div class="legend-bar" style="background:linear-gradient(90deg,${getPalette(S.mapMetric).join(',')})"></div>
            <span>높음 (상위 거점)</span>
            <span style="margin-left:8px;color:var(--text)">확대 ${Math.round(S.svgZoom * 100)}%</span>
          </div>
        </div>
      </div>

      <!-- RIGHT: Selected District 360° Cross-Domain Spotlight (+ Dual Compare) -->
      <div class="card" id="spotlightCard">
        ${renderSpotlightHtml(reg, cmpReg)}
      </div>
    </div>

    ${cmpReg ? renderCompareMatrixCard(reg, cmpReg) : ''}

    ${S.opts.showBcgCharts ? renderVisualizationsDeck(reg) : ''}

    <!-- TOP 25 RANKING + PARETO/LORENZ EXPERT CARD -->
    <div class="card" style="margin-top:16px">
      <div class="card-head">
        <div>
          <h2 class="card-title">🏆 전국 229 시군구 4-Way 통합 기회 랭킹 TOP 25</h2>
          <p class="card-sub">
            상위 20% 시군구 집중도(파레토): <b>${lorenz.top20Share}%</b> · 지니계수(Gini): <b>${lorenz.gini}</b>
            (${lorenz.gini >= 0.45 ? '고집중·핵심거점 타깃팅 유리' : '전국 분산형 시장'})
          </p>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center">
          <div class="chips">
            ${[
              ['total', '통합점수'],
              ['blueOcean', '💎 블루오션'],
              ['corp', '법인수'],
              ['bid', '입찰·인허가'],
              ['sbiz', '소상공인'],
              ['newRate', '🆕 신규율%'],
              ['re', '청약·착공'],
            ].map(([k, lb]) => `<button class="chip ${S.rankSort === k ? 'active' : ''}" data-rank-sort="${k}">${lb}</button>`).join('')}
          </div>
          <button id="btnExport229Csv" class="btn btn-sm btn-emerald" type="button">📥 229시군구 CSV</button>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 220px;gap:14px;align-items:start" class="rank-lorenz-grid">
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>시군구</th>
                <th>통합(블루오션)</th>
                <th>🏢 법인(LQ)</th>
                <th>🎯 입찰·사전·인허가</th>
                <th>🏪 상가(2026신규율)</th>
                <th>🏠 분양·착공</th>
                <th>비교</th>
              </tr>
            </thead>
            <tbody>
              ${getSortedFusion(S.rankSort).slice(0, 25).map((r, i) => `
                <tr data-pick-rid="${r.rid}" ${r.rid === reg.rid ? 'style="background:var(--c-corp-bg)"' : ''}>
                  <td><b>${i + 1}</b></td>
                  <td><b>${esc(r.fullName)}</b></td>
                  <td><span class="tag tag-corp">${r.scores.total}점</span> <span class="tag tag-sbiz" title="블루오션 지수">💎${r.quant?.blueOcean ?? 0}</span></td>
                  <td>${fmt(r.corp.cnt)} <span style="color:var(--muted)">(LQ ${r.quant?.lqCorp ?? 0})</span></td>
                  <td>${fmt(r.bid.bidCnt + r.bid.preSpecCnt + r.bid.archCnt + r.bid.aptOppCnt)}건</td>
                  <td>${fmt(r.sbiz.cnt)} <span style="color:var(--c-sbiz)">(${r.quant?.newRatePct ?? 0}%)</span></td>
                  <td>분양 ${r.re.aptCnt + r.re.remndrCnt} · 착공 ${r.re.startCnt}</td>
                  <td><button class="btn btn-sm" data-set-cmp="${r.rid}" type="button">${S.compareRid === r.rid ? '✓비교중' : '⚔️비교'}</button></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="domain-box" style="text-align:center">
          <h4 style="justify-content:center;margin-bottom:4px">📈 파레토 · 로렌츠 곡선</h4>
          ${renderLorenzSvg(lorenz)}
          <div style="font-size:11.5px;color:var(--text-2);margin-top:6px;line-height:1.5">
            지니계수 <b>${lorenz.gini}</b><br/>상위 20% 비중 <b>${lorenz.top20Share}%</b>
          </div>
        </div>
      </div>
    </div>
  `;

  // Wire Overview Events
  $('mainStage').querySelectorAll('[data-jump]').forEach((el) => el.addEventListener('click', () => switchTab(el.dataset.jump)));
  $('mainStage').querySelectorAll('[data-t10]').forEach((el) => {
    el.addEventListener('click', () => {
      const k = el.dataset.t10;
      if (k === 'sliders') { S.showSliders = true; renderOverview(); }
      else if (k === 'lq') { S.mapMetric = 'lq'; renderOverview(); }
      else if (k === 'blue') { S.mapMetric = 'blueOcean'; S.rankSort = 'blueOcean'; renderOverview(); }
      else if (k === 'bcg' || k === 'sido') { S.opts.showBcgCharts = true; saveOpts(); renderOverview(); setTimeout(() => $('vizDeck')?.scrollIntoView({ behavior: 'smooth' }), 60); }
      else if (k === 'pareto') { $('btnExport229Csv')?.scrollIntoView({ behavior: 'smooth' }); }
      else if (k === 'gis') { switchTab('sbiz'); }
      else if (k === 'cmp') { $('btnAiStrategy')?.click(); }
      else { $('spotlightCard')?.scrollIntoView({ behavior: 'smooth' }); }
    });
  });
  wireBcgAndSidoCharts();
  $('mainStage').querySelectorAll('[data-preset]').forEach((el) => {
    el.addEventListener('click', () => {
      const k = el.dataset.preset;
      S.opts.preset = k;
      S.opts.weights = { ...STRATEGY_PRESETS[k].weights };
      saveOpts();
      toast(`🧠 전략 프리셋 적용: ${STRATEGY_PRESETS[k].label}`);
      renderOverview();
    });
  });
  $('btnToggleSliders').addEventListener('click', () => { S.showSliders = !S.showSliders; renderOverview(); });
  $('mainStage').querySelectorAll('input[data-w-key]').forEach((inp) => {
    inp.addEventListener('input', () => {
      S.opts.preset = 'custom';
      S.opts.weights[inp.dataset.wKey] = Number(inp.value);
      saveOpts();
      renderOverview();
    });
  });
  $('ovMapMetric').addEventListener('change', (e) => { S.mapMetric = e.target.value; renderOverview(); });
  $('mainStage').querySelectorAll('[data-pick-rid]').forEach((el) => {
    el.addEventListener('click', (e) => {
      if (e.target.closest('[data-set-cmp]')) return;
      S.selectedRid = Number(el.dataset.pickRid);
      renderOverview();
    });
  });
  $('mainStage').querySelectorAll('[data-set-cmp]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = Number(btn.dataset.setCmp);
      S.compareRid = S.compareRid === id ? -1 : id;
      renderOverview();
    });
  });
  $('mainStage').querySelectorAll('[data-rank-sort]').forEach((el) => {
    el.addEventListener('click', () => { S.rankSort = el.dataset.rankSort; renderOverview(); });
  });
  $('btnExport229Csv').addEventListener('click', () => {
    const sorted = getSortedFusion(S.rankSort);
    downloadCsv(
      `nexusone_229_regions_${new Date().toISOString().slice(0, 10)}.csv`,
      ['순위', '시군구', '통합점수', '블루오션', '법인수', '상장사', '강소산단', '기업LQ', '입찰', '사전규격', '건축인허가', '건설사', '소상공인상가', '2026신규개업', '신규개업률(%)', '업종HHI', '청약APT', '무순위', '착공현장'],
      sorted.map((r, i) => [
        i + 1, r.fullName, r.scores.total, r.quant?.blueOcean ?? 0,
        r.corp.cnt, r.corp.listed, r.corp.strong, r.quant?.lqCorp ?? 0,
        r.bid.bidCnt, r.bid.preSpecCnt, r.bid.archCnt, r.bid.builderCnt,
        r.sbiz.cnt, r.sbiz.new2026, r.quant?.newRatePct ?? 0, r.quant?.hhi ?? 0,
        r.re.aptCnt, r.re.remndrCnt, r.re.startCnt,
      ])
    );
    toast('📥 전국 229 시군구 통합 랭킹 CSV 다운로드 완료!');
  });

  // Zoom / Pan controls
  $('btnMapZoomIn').addEventListener('click', () => { S.svgZoom = Math.min(4, +(S.svgZoom + 0.4).toFixed(2)); renderOverview(); });
  $('btnMapZoomOut').addEventListener('click', () => { S.svgZoom = Math.max(1, +(S.svgZoom - 0.4).toFixed(2)); if (S.svgZoom === 1) S.svgPan = { x: 0, y: 0 }; renderOverview(); });
  $('btnMapReset').addEventListener('click', () => { S.svgZoom = 1; S.svgPan = { x: 0, y: 0 }; renderOverview(); });

  wireMapTooltips();
  wireSpotlightButtons(reg, cmpReg);
}

function getSortedFusion(sortKey) {
  const arr = [...S.fusion.regions];
  if (sortKey === 'corp') return arr.sort((a, b) => b.corp.cnt - a.corp.cnt);
  if (sortKey === 'bid') return arr.sort((a, b) => (b.bid.bidCnt + b.bid.preSpecCnt + b.bid.archCnt + b.bid.aptOppCnt + b.bid.builderCnt * 0.1) - (a.bid.bidCnt + a.bid.preSpecCnt + a.bid.archCnt + a.bid.aptOppCnt + a.bid.builderCnt * 0.1));
  if (sortKey === 'sbiz') return arr.sort((a, b) => b.sbiz.cnt - a.sbiz.cnt);
  if (sortKey === 'new26') return arr.sort((a, b) => b.sbiz.new2026 - a.sbiz.new2026);
  if (sortKey === 'newRate') return arr.sort((a, b) => (b.quant?.newRatePct || 0) - (a.quant?.newRatePct || 0));
  if (sortKey === 'blueOcean') return arr.sort((a, b) => (b.quant?.blueOcean || 0) - (a.quant?.blueOcean || 0));
  if (sortKey === 're') return arr.sort((a, b) => (b.re.aptCnt + b.re.remndrCnt + b.re.startCnt + b.re.kaptCnt) - (a.re.aptCnt + a.re.remndrCnt + a.re.startCnt + a.re.kaptCnt));
  return arr.sort((a, b) => b.scores.total - a.scores.total);
}

function getPalette(metric) {
  const palettes = {
    total: ['#e2e8f0', '#c7d2fe', '#818cf8', '#4f46e5', '#312e81'],
    corp: ['#e2e8f0', '#ddd6fe', '#8b5cf6', '#5b21b6', '#3b0764'],
    bid: ['#e2e8f0', '#fde68a', '#f59e0b', '#d97706', '#92400e'],
    sbiz: ['#e2e8f0', '#a7f3d0', '#34d399', '#059669', '#064e3b'],
    newRate: ['#e2e8f0', '#bae6fd', '#38bdf8', '#0284c7', '#0c4a6e'],
    re: ['#e2e8f0', '#fecdd3', '#fb7185', '#e11d48', '#881337'],
    lq: ['#e2e8f0', '#f5d0fe', '#d946ef', '#a21caf', '#701a75'],
    blueOcean: ['#e2e8f0', '#99f6e4', '#14b8a6', '#0f766e', '#134e4a'],
  };
  return palettes[metric] || palettes.total;
}

function scoreColor(val, metric) {
  const t = Math.max(0, Math.min(1, val / 100));
  const pal = getPalette(metric);
  const idx = Math.min(pal.length - 1, Math.floor(t * (pal.length - 0.01)));
  return pal[idx];
}

function renderKoreaSvg(selectedRid, compareRid = -1) {
  const { w, h, regions } = S.map;
  const vw = w / S.svgZoom;
  const vh = h / S.svgZoom;
  const vx = Math.max(0, Math.min(w - vw, (w - vw) / 2 - S.svgPan.x));
  const vy = Math.max(0, Math.min(h - vh, (h - vh) / 2 - S.svgPan.y));
  const paths = regions.map((r) => {
    const f = S.fusionByRid.get(r.id);
    const val = getMetricValue(f, S.mapMetric);
    const fill = scoreColor(val, S.mapMetric);
    const cls = r.id === selectedRid ? 'selected' : (r.id === compareRid ? 'selected' : '');
    const style = r.id === compareRid ? 'stroke:#059669;stroke-width:2.2' : '';
    return `<path d="${r.d}" fill="${fill}" class="${cls}" style="${style}" data-rid="${r.id}"></path>`;
  }).join('');
  return `<svg class="korea-svg" viewBox="${vx.toFixed(1)} ${vy.toFixed(1)} ${vw.toFixed(1)} ${vh.toFixed(1)}" aria-label="대한민국 229 시군구 통합 지도">${paths}</svg>`;
}

function renderLorenzSvg(lorenz) {
  const W = 180, H = 140, P = 20;
  const x = (t) => P + t * (W - P * 2);
  const y = (t) => H - P - t * (H - P * 2);
  const pathD = lorenz.points.map(([px, py], i) => `${i === 0 ? 'M' : 'L'}${x(px).toFixed(1)},${y(py).toFixed(1)}`).join(' ');
  const fillD = `${pathD} L${x(1).toFixed(1)},${y(0).toFixed(1)} L${x(0).toFixed(1)},${y(0).toFixed(1)} Z`;
  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="max-width:100%">
    <line x1="${P}" y1="${H - P}" x2="${W - P}" y2="${P}" stroke="var(--border-strong)" stroke-dasharray="3 3" stroke-width="1"/>
    <path d="${fillD}" fill="rgba(79,70,229,0.16)"/>
    <path d="${pathD}" fill="none" stroke="#4f46e5" stroke-width="2.2"/>
    <rect x="${P}" y="${P}" width="${W - P * 2}" height="${H - P * 2}" fill="none" stroke="var(--border-strong)" stroke-width="1"/>
    <text x="${W / 2}" y="${H - 4}" text-anchor="middle" font-size="9.5" fill="var(--muted)">누적 시군구 비율 (%)</text>
  </svg>`;
}

function renderVisualizationsDeck(selReg) {
  const regs = S.fusion.regions;
  // 1) BCG 4-Quadrant Matrix: X = Corp+Sbiz Scale (0..100), Y = New2026+Bid Growth (0..100)
  const W = 480, H = 260, PL = 36, PR = 16, PT = 20, PB = 28;
  const pw = W - PL - PR, ph = H - PT - PB;
  const midX = PL + pw * 0.5, midY = PT + ph * 0.5;
  const maxSbiz = Math.max(1, ...regs.map((r) => r.sbiz.cnt));

  const dots = regs.map((r) => {
    const xv = Math.round((r.scores.corp * 0.5 + r.scores.sbiz * 0.5));
    const yv = Math.round(((r.quant?.newRateScore || 0) * 0.5 + r.scores.bid * 0.3 + r.scores.re * 0.2));
    const cx = PL + (xv / 100) * pw;
    const cy = PT + (1 - yv / 100) * ph;
    const rad = Math.max(3, Math.min(10, 3 + Math.sqrt(r.sbiz.cnt / maxSbiz) * 8));
    let color = '#94a3b8';
    if (xv >= 50 && yv >= 50) color = '#4f46e5';      // ⭐ 핵심 스타
    else if (xv < 50 && yv >= 50) color = '#059669';  // 🚀 고성장 블루오션
    else if (xv >= 50 && yv < 50) color = '#d97706';  // 🏦 성숙 캐시카우
    const isSel = r.rid === selReg.rid;
    return `<circle class="scatter-dot" data-bcg-rid="${r.rid}" data-bcg-x="${xv}" data-bcg-y="${yv}" cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${isSel ? rad + 2.5 : rad.toFixed(1)}" fill="${color}" fill-opacity="${isSel ? 1 : 0.72}" stroke="${isSel ? '#e11d48' : '#ffffff'}" stroke-width="${isSel ? 2.5 : 0.8}"></circle>`;
  }).join('');

  // 2) 17-Sido Stacked 4-Domain Score Comparison
  const sidoAgg = new Map();
  for (const r of regs) {
    let s = sidoAgg.get(r.sd);
    if (!s) {
      s = { sd: r.sd, short: r.sidoShort || r.sidoName, cnt: 0, corp: 0, bid: 0, sbiz: 0, re: 0, total: 0, bestRid: r.rid, bestTotal: -1 };
      sidoAgg.set(r.sd, s);
    }
    s.cnt++;
    s.corp += r.scores.corp; s.bid += r.scores.bid; s.sbiz += r.scores.sbiz; s.re += r.scores.re; s.total += r.scores.total;
    if (r.scores.total > s.bestTotal) { s.bestTotal = r.scores.total; s.bestRid = r.rid; }
  }
  const sidoRows = [...sidoAgg.values()].map((s) => ({
    ...s,
    corpAvg: Math.round(s.corp / s.cnt),
    bidAvg: Math.round(s.bid / s.cnt),
    sbizAvg: Math.round(s.sbiz / s.cnt),
    reAvg: Math.round(s.re / s.cnt),
    totAvg: Math.round(s.total / s.cnt),
  })).sort((a, b) => b.totAvg - a.totAvg);

  return `
    <div id="vizDeck" class="viz-grid-2">
      <!-- ⑦ BCG 4-Quadrant Positioning Matrix -->
      <div class="card">
        <div class="card-head" style="margin-bottom:8px">
          <div>
            <h3 class="card-title">⑦ 229 시군구 BCG 4분면 포지셔닝 매트릭스</h3>
            <p class="card-sub">X축: 기업·상권 규모 · Y축: 신규개업·입찰·공급 성장성 · 점 클릭=360° 스캔</p>
          </div>
        </div>
        <div class="scatter-wrap">
          <div id="bcgTooltip" class="map-tooltip hidden"></div>
          <svg class="scatter-svg" viewBox="0 0 ${W} ${H}">
            <rect x="${PL}" y="${PT}" width="${pw / 2}" height="${ph / 2}" fill="rgba(5,150,105,0.06)"/>
            <rect x="${midX}" y="${PT}" width="${pw / 2}" height="${ph / 2}" fill="rgba(79,70,229,0.07)"/>
            <rect x="${midX}" y="${midY}" width="${pw / 2}" height="${ph / 2}" fill="rgba(217,119,6,0.05)"/>
            <line x1="${midX}" y1="${PT}" x2="${midX}" y2="${PT + ph}" stroke="var(--border-strong)" stroke-dasharray="3 3"/>
            <line x1="${PL}" y1="${midY}" x2="${PL + pw}" y2="${midY}" stroke="var(--border-strong)" stroke-dasharray="3 3"/>
            <rect x="${PL}" y="${PT}" width="${pw}" height="${ph}" fill="none" stroke="var(--border-strong)"/>
            <text x="${PL + 6}" y="${PT + 13}" font-size="9.5" font-weight="800" fill="#059669">🚀 고성장 블루오션</text>
            <text x="${PL + pw - 6}" y="${PT + 13}" text-anchor="end" font-size="9.5" font-weight="800" fill="#4f46e5">⭐ 핵심 스타 거점</text>
            <text x="${PL + 6}" y="${PT + ph - 6}" font-size="9.5" font-weight="700" fill="var(--muted)">🌱 초기·잠재 시장</text>
            <text x="${PL + pw - 6}" y="${PT + ph - 6}" text-anchor="end" font-size="9.5" font-weight="800" fill="#d97706">🏦 성숙 캐시카우</text>
            ${dots}
            <text x="${W / 2}" y="${H - 6}" text-anchor="middle" font-size="10" font-weight="700" fill="var(--muted)">기업 · 상권 규모 지수 →</text>
            <text x="12" y="${H / 2}" text-anchor="middle" font-size="10" font-weight="700" fill="var(--muted)" transform="rotate(-90 12 ${H / 2})">성장·기회 활력 →</text>
          </svg>
        </div>
      </div>

      <!-- ⑧ 17-Sido Stacked 4-Domain Score Comparison -->
      <div class="card">
        <div class="card-head" style="margin-bottom:8px">
          <div>
            <h3 class="card-title">⑧ 전국 17개 시도 4대 도메인 누적 비교</h3>
            <p class="card-sub">시도 클릭 시 해당 권역 최우수 시군구 360° 스캔으로 이동</p>
          </div>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;font-size:11px;margin-bottom:8px">
          <span class="ml-item"><span class="ml-dot" style="background:#4f46e5"></span>기업</span>
          <span class="ml-item"><span class="ml-dot" style="background:#d97706"></span>입찰</span>
          <span class="ml-item"><span class="ml-dot" style="background:#059669"></span>상권</span>
          <span class="ml-item"><span class="ml-dot" style="background:#e11d48"></span>부동산</span>
        </div>
        <div>
          ${sidoRows.slice(0, 12).map((s) => `
            <div class="sido-chart-row" data-sido-best="${s.bestRid}" title="${esc(s.short)} 평균 통합 ${s.totAvg}점 (기업 ${s.corpAvg} · 입찰 ${s.bidAvg} · 상권 ${s.sbizAvg} · 부동산 ${s.reAvg})">
              <b>${esc(s.short)}</b>
              <div class="stacked-bar">
                <div style="width:${s.corpAvg * 0.25}%;background:#4f46e5"></div>
                <div style="width:${s.bidAvg * 0.25}%;background:#d97706"></div>
                <div style="width:${s.sbizAvg * 0.25}%;background:#059669"></div>
                <div style="width:${s.reAvg * 0.25}%;background:#e11d48"></div>
              </div>
              <b style="text-align:right;color:var(--c-accent)">${s.totAvg}</b>
            </div>`).join('')}
        </div>
      </div>
    </div>
  `;
}

function wireBcgAndSidoCharts() {
  const tip = $('bcgTooltip');
  const wrap = tip?.parentElement;
  document.querySelectorAll('[data-bcg-rid]').forEach((dot) => {
    dot.addEventListener('mouseenter', () => {
      const f = S.fusionByRid.get(Number(dot.dataset.bcgRid));
      if (!f || !tip) return;
      tip.innerHTML = `<b>${esc(f.fullName)}</b> · 통합 ${f.scores.total}점<br/>규모 ${dot.dataset.bcgX} · 성장활력 ${dot.dataset.bcgY} · 블루오션 💎${f.quant?.blueOcean ?? 0}`;
      tip.classList.remove('hidden');
    });
    dot.addEventListener('mousemove', (e) => {
      if (!tip || !wrap) return;
      const b = wrap.getBoundingClientRect();
      tip.style.left = `${Math.min(b.width - 210, Math.max(8, e.clientX - b.left + 10))}px`;
      tip.style.top = `${Math.max(8, e.clientY - b.top - 44)}px`;
    });
    dot.addEventListener('mouseleave', () => tip?.classList.add('hidden'));
    dot.addEventListener('click', () => {
      S.selectedRid = Number(dot.dataset.bcgRid);
      renderOverview();
    });
  });
  document.querySelectorAll('[data-sido-best]').forEach((row) => {
    row.addEventListener('click', () => {
      S.selectedRid = Number(row.dataset.sidoBest);
      renderOverview();
    });
  });
}

function wireMapTooltips() {
  const svg = document.querySelector('.korea-svg');
  const tip = $('koreaMapTooltip');
  if (!svg || !tip) return;

  // Drag pan when zoomed
  let dragging = false, sx = 0, sy = 0, ox = 0, oy = 0, moved = false;
  svg.addEventListener('mousedown', (e) => {
    if (S.svgZoom <= 1) return;
    dragging = true; moved = false; sx = e.clientX; sy = e.clientY; ox = S.svgPan.x; oy = S.svgPan.y;
  });
  window.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    const dx = (e.clientX - sx) / S.svgZoom;
    const dy = (e.clientY - sy) / S.svgZoom;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) moved = true;
    S.svgPan = { x: ox + dx, y: oy + dy };
    const { w, h } = S.map;
    const vw = w / S.svgZoom, vh = h / S.svgZoom;
    const vx = Math.max(0, Math.min(w - vw, (w - vw) / 2 - S.svgPan.x));
    const vy = Math.max(0, Math.min(h - vh, (h - vh) / 2 - S.svgPan.y));
    svg.setAttribute('viewBox', `${vx.toFixed(1)} ${vy.toFixed(1)} ${vw.toFixed(1)} ${vh.toFixed(1)}`);
  });
  window.addEventListener('mouseup', () => { dragging = false; });

  svg.querySelectorAll('path[data-rid]').forEach((p) => {
    p.addEventListener('mouseenter', () => {
      const f = S.fusionByRid.get(Number(p.dataset.rid));
      if (!f) return;
      tip.innerHTML = `<b>${esc(f.fullName)}</b> · 통합 ${f.scores.total}점 · 블루오션 💎${f.quant?.blueOcean ?? 0}<br/>법인 ${fmt(f.corp.cnt)} (LQ ${f.quant?.lqCorp ?? 0}) · 상가 ${fmt(f.sbiz.cnt)} (신규 ${f.quant?.newRatePct ?? 0}%)`;
      tip.classList.remove('hidden');
    });
    p.addEventListener('mousemove', (e) => {
      const box = svg.parentElement.getBoundingClientRect();
      tip.style.left = `${Math.min(box.width - 230, Math.max(8, e.clientX - box.left + 12))}px`;
      tip.style.top = `${Math.max(8, e.clientY - box.top - 48)}px`;
    });
    p.addEventListener('mouseleave', () => tip.classList.add('hidden'));
    p.addEventListener('click', () => {
      if (moved) return;
      S.selectedRid = Number(p.dataset.rid);
      renderOverview();
    });
  });
}

function renderRadarSvg(scores, cmpScores = null) {
  const cx = 115, cy = 88, R = 52;
  const axes = [
    { label: '기업', val: scores.corp, cmp: cmpScores?.corp, ang: -Math.PI / 2, color: '#4f46e5', dx: 0, dy: -12 },
    { label: '입찰', val: scores.bid, cmp: cmpScores?.bid, ang: 0, color: '#d97706', dx: 26, dy: 4 },
    { label: '상권', val: scores.sbiz, cmp: cmpScores?.sbiz, ang: Math.PI / 2, color: '#059669', dx: 0, dy: 18 },
    { label: '부동산', val: scores.re, cmp: cmpScores?.re, ang: Math.PI, color: '#e11d48', dx: -28, dy: 4 },
  ];
  const pt = (ang, ratio) => `${(cx + Math.cos(ang) * R * ratio).toFixed(1)},${(cy + Math.sin(ang) * R * ratio).toFixed(1)}`;
  const rings = [0.33, 0.66, 1].map((r) => `<polygon points="${axes.map((a) => pt(a.ang, r)).join(' ')}" fill="none" stroke="var(--border-strong)" stroke-width="0.9" stroke-dasharray="${r < 1 ? '2 2' : ''}"/>`).join('');
  const poly = `<polygon points="${axes.map((a) => pt(a.ang, Math.max(0.12, a.val / 100))).join(' ')}" fill="rgba(79,70,229,0.22)" stroke="#4f46e5" stroke-width="2.2"/>`;
  const cmpPoly = cmpScores ? `<polygon points="${axes.map((a) => pt(a.ang, Math.max(0.12, (a.cmp || 0) / 100))).join(' ')}" fill="rgba(5,150,105,0.16)" stroke="#059669" stroke-width="2" stroke-dasharray="4 2"/>` : '';
  const dots = axes.map((a) => {
    const x = cx + Math.cos(a.ang) * R * Math.max(0.12, a.val / 100);
    const y = cy + Math.sin(a.ang) * R * Math.max(0.12, a.val / 100);
    const lx = cx + Math.cos(a.ang) * R + a.dx;
    const ly = cy + Math.sin(a.ang) * R + a.dy;
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4" fill="${a.color}"/>
      <text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="middle" font-size="10.5" font-weight="700" fill="var(--text-2)">${a.label} ${a.val}</text>`;
  }).join('');
  return `<svg width="230" height="176" viewBox="0 0 230 176" style="max-width:100%">${rings}${cmpPoly}${poly}${dots}</svg>`;
}

function renderSpotlightHtml(r, cmpReg = null) {
  const oppSum = r.bid.bidCnt + r.bid.preSpecCnt + r.bid.archCnt + r.bid.aptOppCnt;
  const q = r.quant || { newRatePct: 0, hhi: 0, hhiLabel: '-', lqCorp: 0, lqNew26: 0, blueOcean: 0 };
  return `
    <div class="card-head">
      <div>
        <h2 class="card-title">⚡ ${esc(r.fullName)} — 360° 전문가 스캔</h2>
        <p class="card-sub">${cmpReg ? `⚔️ 비교 중: <b style="color:var(--c-sbiz)">${esc(cmpReg.fullName)}</b> (점선 레이더)` : '기업 · 입찰 · 상권 · 부동산 4대 데이터 + 퀀트 지표(HHI·LQ·블루오션)'}</p>
      </div>
      <div style="display:flex;gap:5px;flex-wrap:wrap">
        <button id="btnPinCompare" class="btn btn-sm" type="button">${cmpReg ? '✕ 비교 해제' : '⚔️ 비교 고정'}</button>
        <button id="btnAiStrategy" class="btn btn-sm btn-emerald" type="button">✨ 전략 진단</button>
        <button id="btnCopyBrief" class="btn btn-sm btn-primary" type="button">📋 브리핑</button>
        <button id="btnAddRegionPipe" class="btn btn-sm" type="button">+ CRM</button>
      </div>
    </div>

    <div class="fusion-hero">
      <div>
        <div style="font-size:11.5px;font-weight:700;color:var(--muted)">4-WAY 융합 기회 종합지수 (${esc(STRATEGY_PRESETS[S.opts.preset]?.label || '커스텀 가중치')})</div>
        <div style="display:flex;align-items:baseline;gap:8px;margin:4px 0 8px;flex-wrap:wrap">
          <span class="fusion-score-big">${r.scores.total}</span>
          <span style="font-size:13px;font-weight:700;color:var(--muted)">/ 100점</span>
          <span class="tag ${r.scores.total >= 80 ? 'tag-corp' : r.scores.total >= 65 ? 'tag-sbiz' : 'tag-gray'}">
            ${r.scores.total >= 80 ? 'S등급 초핵심' : r.scores.total >= 65 ? 'A등급 유망' : 'B등급 성장'}
          </span>
        </div>
        <div style="font-size:12px;color:var(--text-2);line-height:1.55">
          법인 <b>${fmt(r.corp.cnt)}사</b> · 소상공인 <b>${fmt(r.sbiz.cnt)}개</b>(2026 <b>+${fmt(r.sbiz.new2026)}</b>) · 입찰/인허가 <b>${fmt(oppSum)}건</b> · 청약/착공 <b>${fmt(r.re.aptCnt + r.re.remndrCnt + r.re.startCnt)}건</b>
        </div>
      </div>
      <div style="display:flex;justify-content:center">${renderRadarSvg(r.scores, cmpReg?.scores || null)}</div>
    </div>

    ${S.opts.showQuantBadges ? `
      <div class="quant-strip">
        <div class="quant-box">
          <div class="q-lbl">💎 블루오션 지수</div>
          <div class="q-val" style="color:var(--c-sbiz)">${q.blueOcean}점</div>
          <div class="q-sub">수요 대비 경쟁여력</div>
        </div>
        <div class="quant-box">
          <div class="q-lbl">📐 기업 입지계수(LQ)</div>
          <div class="q-val" style="color:var(--c-corp)">${q.lqCorp}</div>
          <div class="q-sub">${q.lqCorp >= 1.2 ? '법인 특화거점' : q.lqCorp <= 0.8 ? '소비·상권형' : '균형 분포'}</div>
        </div>
        <div class="quant-box">
          <div class="q-lbl">📊 업종 HHI 집중도</div>
          <div class="q-val">${fmt(q.hhi)}</div>
          <div class="q-sub">${esc(q.hhiLabel)}</div>
        </div>
        <div class="quant-box">
          <div class="q-lbl">🆕 2026 신규개업률</div>
          <div class="q-val" style="color:var(--c-bid)">${q.newRatePct}%</div>
          <div class="q-sub">전국대비 LQ ${q.lqNew26}</div>
        </div>
      </div>
    ` : ''}

    <div id="aiStrategyBox"></div>

    <div class="domain-box-grid">
      <div class="domain-box">
        <h4><span style="color:var(--c-corp)">🏢 기업 생태계</span><button class="btn btn-sm" data-go-domain="corp">상세 →</button></h4>
        <div class="domain-stat-row"><span>총 법인 수</span><b>${fmt(r.corp.cnt)}사</b></div>
        <div class="domain-stat-row"><span>상장 · 강소/산단</span><b>상장 ${fmt(r.corp.listed)} · 강소 ${fmt(r.corp.strong)}</b></div>
        <div class="domain-stat-row"><span>확인 매출 / 인원</span><b>${fmt(r.corp.revBillion)}억 · ${fmt(r.corp.empSum)}명</b></div>
        ${r.corp.top.length ? `<div style="margin-top:6px;padding-top:6px;border-top:1px dashed var(--border);font-size:11.5px;color:var(--muted)">
          대표기업: ${r.corp.top.slice(0, 3).map((t) => `<b style="color:var(--text)">${esc(t[0])}</b>`).join(', ')}
        </div>` : ''}
      </div>
      <div class="domain-box">
        <h4><span style="color:var(--c-bid)">🎯 입찰·사전규격·인허가</span><button class="btn btn-sm" data-go-domain="bid">상세 →</button></h4>
        <div class="domain-stat-row"><span>입찰공고 · 사전규격</span><b>입찰 ${fmt(r.bid.bidCnt)} · 사전 ${fmt(r.bid.preSpecCnt)}</b></div>
        <div class="domain-stat-row"><span>건축인허가 · K-apt</span><b>인허가 ${fmt(r.bid.archCnt)} · 단지 ${fmt(r.bid.aptOppCnt)}</b></div>
        <div class="domain-stat-row"><span>포착 예산 / 건설사</span><b>${r.bid.budgetMan > 0 ? `${fmtDec(r.bid.budgetMan / 10000, 1)}억` : '-'} · ${fmt(r.bid.builderCnt)}사</b></div>
      </div>
      <div class="domain-box">
        <h4><span style="color:var(--c-sbiz)">🏪 소상공인 상권</span><button class="btn btn-sm" data-go-domain="sbiz">정밀 GIS →</button></h4>
        <div class="domain-stat-row"><span>총 상가 / 건물 수</span><b>${fmt(r.sbiz.cnt)}개 · ${fmt(r.sbiz.bldCnt)}동</b></div>
        <div class="domain-stat-row"><span>2026 신규개업</span><b style="color:var(--c-sbiz)">+${fmt(r.sbiz.new2026)}개소 (${q.newRatePct}%)</b></div>
        <div style="margin-top:6px;display:flex;flex-wrap:wrap;gap:4px">
          ${(r.sbiz.topL1 || []).slice(0, 4).map(([nm, cnt]) => `<span class="tag tag-sbiz">${esc(nm)} ${fmt(cnt)}</span>`).join('')}
        </div>
      </div>
      <div class="domain-box">
        <h4><span style="color:var(--c-re)">🏠 부동산·청약·착공</span><button class="btn btn-sm" data-go-domain="realestate">상세 →</button></h4>
        <div class="domain-stat-row"><span>신축 APT · 무순위</span><b>APT ${fmt(r.re.aptCnt)} · 줍줍 ${fmt(r.re.remndrCnt)}</b></div>
        <div class="domain-stat-row"><span>착공현장 · K-apt</span><b>착공 ${fmt(r.re.startCnt)} · 단지 ${fmt(r.re.kaptCnt)}</b></div>
        <div class="domain-stat-row"><span>평균 평당가</span><b>${r.re.avgPyeongMan > 0 ? `${fmt(r.re.avgPyeongMan)}만원` : '실시간 조회 가능'}</b></div>
      </div>
    </div>

    ${renderCommercialPanelHtml(r)}
  `;
}

function renderCompareMatrixCard(a, b) {
  const rows = [
    ['4-Way 통합점수', a.scores.total, b.scores.total, '점'],
    ['💎 블루오션 지수', a.quant?.blueOcean || 0, b.quant?.blueOcean || 0, '점'],
    ['🏢 법인 수', a.corp.cnt, b.corp.cnt, '사'],
    ['📐 기업 입지계수(LQ)', a.quant?.lqCorp || 0, b.quant?.lqCorp || 0, ''],
    ['🎯 입찰·사전·인허가·K-apt', a.bid.bidCnt + a.bid.preSpecCnt + a.bid.archCnt + a.bid.aptOppCnt, b.bid.bidCnt + b.bid.preSpecCnt + b.bid.archCnt + b.bid.aptOppCnt, '건'],
    ['🏗️ 건설·시설사', a.bid.builderCnt, b.bid.builderCnt, '사'],
    ['🏪 소상공인 상가', a.sbiz.cnt, b.sbiz.cnt, '개'],
    ['🆕 2026 신규개업률', a.quant?.newRatePct || 0, b.quant?.newRatePct || 0, '%'],
    ['📊 업종 HHI (낮을수록 다각화)', a.quant?.hhi || 0, b.quant?.hhi || 0, '', true],
    ['🏠 신축분양·착공·K-apt', a.re.aptCnt + a.re.remndrCnt + a.re.startCnt + a.re.kaptCnt, b.re.aptCnt + b.re.remndrCnt + b.re.startCnt + b.re.kaptCnt, '건'],
  ];
  return `
    <div class="card" style="margin-top:16px">
      <div class="card-head">
        <div>
          <h3 class="card-title">⚔️ 전문가 2개 지역 정밀 비교 매트릭스</h3>
          <p class="card-sub"><b style="color:var(--c-corp)">${esc(a.fullName)}</b> vs <b style="color:var(--c-sbiz)">${esc(b.fullName)}</b> · 항목별 우위 지역 자동 하이라이트</p>
        </div>
        <button id="btnClearCmpMatrix" class="btn btn-sm" type="button">✕ 비교 닫기</button>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>비교 지표</th><th>🟦 ${esc(a.fullName)}</th><th>🟩 ${esc(b.fullName)}</th><th>차이</th></tr></thead>
          <tbody>
            ${rows.map(([lbl, va, vb, unit, lowerBetter]) => {
              const aWin = lowerBetter ? (va < vb) : (va > vb);
              const bWin = lowerBetter ? (vb < va) : (vb > va);
              const diff = +(va - vb).toFixed(2);
              return `<tr>
                <td><b>${lbl}</b></td>
                <td class="${aWin ? 'compare-win' : ''}">${typeof va === 'number' && !Number.isInteger(va) ? va : fmt(va)}${unit} ${aWin ? '👑' : ''}</td>
                <td class="${bWin ? 'compare-win' : ''}">${typeof vb === 'number' && !Number.isInteger(vb) ? vb : fmt(vb)}${unit} ${bWin ? '👑' : ''}</td>
                <td style="color:var(--muted)">${diff > 0 ? '+' : ''}${typeof diff === 'number' && !Number.isInteger(diff) ? diff : fmt(diff)}${unit}</td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function wireSpotlightButtons(r, cmpReg) {
  $('selBizPersona')?.addEventListener('change', (e) => {
    S.opts.bizPersona = e.target.value;
    saveOpts();
    toast(`💼 영업 업종 모델 변경: ${BIZ_PERSONAS[S.opts.bizPersona]?.label}`);
    renderOverview();
  });
  $('btnOpenExecReport')?.addEventListener('click', () => openExecutiveReport(r));

  $('btnPinCompare')?.addEventListener('click', () => {
    if (cmpReg) { S.compareRid = -1; renderOverview(); }
    else { S.compareRid = r.rid; toast(`⚔️ ${r.fullName} 비교 기준 고정! 지도/표에서 다른 시군구를 클릭하세요.`); }
  });
  $('btnClearCmpMatrix')?.addEventListener('click', () => { S.compareRid = -1; renderOverview(); });

  $('btnAiStrategy')?.addEventListener('click', async () => {
    const box = $('aiStrategyBox');
    const q = r.quant || {};
    const oppSum = r.bid.bidCnt + r.bid.preSpecCnt + r.bid.archCnt + r.bid.aptOppCnt;
    // Rule-based instant expert insight + optional Gemini Live enrichment
    const recs = [];
    if (q.lqCorp >= 1.2) recs.push(`<b>법인 특화 거점(LQ ${q.lqCorp})</b>: 상장 ${r.corp.listed}·강소 ${r.corp.strong}사 중심으로 B2B 법인영업(보안·통신·법인금융) 우선 공략 권장.`);
    if (q.newRatePct >= 8.0) recs.push(`<b>고성장 신규개업 상권(${q.newRatePct}%)</b>: 2026 신규개업 ${fmt(r.sbiz.new2026)}개소 대상 초도 설비·CCTV·POS·결제 패키지 영업 골든타임.`);
    if (r.bid.preSpecCnt + r.bid.archCnt > 0) recs.push(`<b>조기포착 시그널 ${r.bid.preSpecCnt + r.bid.archCnt}건</b>: 사전규격(${r.bid.preSpecCnt})·건축인허가(${r.bid.archCnt}) 선제 스펙인 영업 가능.`);
    if (q.blueOcean >= 70) recs.push(`<b>블루오션 상위권(${q.blueOcean}점)</b>: 수요 대비 지역 건설·시설 경쟁 밀도가 낮아 점유율 확대 효율 우수.`);
    if (r.re.aptCnt + r.re.startCnt > 0) recs.push(`<b>신축 공급 파이프라인</b>: 신축분양 ${r.re.aptCnt}·착공 ${r.re.startCnt} 현장 준공 전 입주·스마트홈 제안 적합.`);
    if (!recs.length) recs.push(`핵심 업종(${(r.sbiz.topL1 || []).slice(0, 2).map(([k]) => k).join('·')}) 및 기축 단지 중심의 타깃 영업 권장.`);

    box.innerHTML = `<div class="catchment-card" style="margin:0 0 12px">
      <div style="font-weight:800;font-size:13px;margin-bottom:6px">✨ ${esc(r.fullName)} 전문가 실행 전략 진단</div>
      <ul style="margin:0;padding-left:18px;font-size:12px;line-height:1.65">${recs.map((x) => `<li>${x}</li>`).join('')}</ul>
      <div id="geminiOut" style="margin-top:8px;font-size:12px;color:var(--text-2)"></div>
    </div>`;

    if (S.opts.geminiKey) {
      const gOut = $('geminiOut');
      gOut.textContent = '🤖 Gemini AI 심층 전략 리포트 생성 중…';
      try {
        const prompt = `한국 B2B 영업·부동산 전문가로서 ${r.fullName} 데이터를 보고 3줄 핵심 실행 전략을 작성해줘: 법인 ${r.corp.cnt}사(상장 ${r.corp.listed}, 강소 ${r.corp.strong}, LQ ${q.lqCorp}), 입찰/사전규격/건축인허가 ${oppSum}건, 소상공인 ${r.sbiz.cnt}개(2026신규 ${r.sbiz.new2026}개, 신규율 ${q.newRatePct}%, HHI ${q.hhi}), 청약 ${r.re.aptCnt}/착공 ${r.re.startCnt}.`;
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(S.opts.geminiKey)}`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        });
        const j = await res.json();
        const txt = j?.candidates?.[0]?.content?.parts?.[0]?.text;
        gOut.innerHTML = txt ? `<div style="padding-top:8px;border-top:1px dashed var(--border)"><b>🤖 Gemini AI 심층 코멘트:</b><br/>${esc(txt).replace(/\n/g, '<br/>')}</div>` : 'Gemini 응답 없음';
      } catch (e) {
        gOut.textContent = `Gemini 호출 오류: ${e.message}`;
      }
    }
  });

  $('btnCopyBrief')?.addEventListener('click', () => {
    const oppSum = r.bid.bidCnt + r.bid.preSpecCnt + r.bid.archCnt + r.bid.aptOppCnt;
    const q = r.quant || {};
    const text = `[넥서스원 PRO 360° 전문가 브리핑] ${r.fullName}
• 4-Way 통합점수: ${r.scores.total}/100 · 블루오션 ${q.blueOcean}점 · 기업LQ ${q.lqCorp} · 업종HHI ${fmt(q.hhi)}(${q.hhiLabel})
• 🏢 기업 생태계: 총 ${fmt(r.corp.cnt)}사 (상장 ${fmt(r.corp.listed)} / 강소·산단 ${fmt(r.corp.strong)} / 대표: ${r.corp.top.slice(0, 3).map((x) => x[0]).join(', ') || '-'})
• 🎯 입찰·인허가: ${fmt(oppSum)}건 (입찰 ${r.bid.bidCnt}, 사전규격 ${r.bid.preSpecCnt}, 건축인허가 ${r.bid.archCnt}, K-apt ${r.bid.aptOppCnt}) · 지역 건설·시설사 ${fmt(r.bid.builderCnt)}사
• 🏪 소상공인 상권: ${fmt(r.sbiz.cnt)}개 상가 / ${fmt(r.sbiz.bldCnt)}동 / 2026 신규 +${fmt(r.sbiz.new2026)}개 (${q.newRatePct}%)
• 🏠 부동산 공급: 신축분양 ${r.re.aptCnt} · 무순위 ${r.re.remndrCnt} · 착공 ${r.re.startCnt} · K-apt ${r.re.kaptCnt}`;
    navigator.clipboard?.writeText(text).then(() => toast('📋 360° 전문가 브리핑이 복사되었습니다!')).catch(() => toast('클립보드 복사 실패'));
  });

  $('btnAddRegionPipe')?.addEventListener('click', () => {
    addToPipeline({
      id: `region:${r.rid}`, domain: 'corp', title: `[360° 거점] ${r.fullName}`,
      sub: `통합 ${r.scores.total}점 · 블루오션 ${r.quant?.blueOcean ?? 0} · 상가 ${fmt(r.sbiz.cnt)}`,
      region: r.fullName, valueMan: r.bid.budgetMan,
    });
  });

  document.querySelectorAll('[data-go-domain]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const dom = btn.dataset.goDomain;
      if (dom === 'corp') { S.corpQ = r.name; S.corpSd = r.sd; S.corpPage = 1; switchTab('corp'); }
      else if (dom === 'bid') { S.bidQ = r.name; S.bidSub = 'opps'; switchTab('bid'); }
      else if (dom === 'sbiz') {
        switchTab('sbiz');
        const loaded = await loadSbizSido(r.sidoSlug);
        const exactSgg = (loaded.dicts?.sgg || []).find((g) => g === r.name || g.endsWith(' ' + r.name)) || '';
        S.sbizSgg = exactSgg;
        renderSbizTab();
      } else if (dom === 'realestate') { S.reQ = r.name.replace(/시$|군$|구$/, ''); switchTab('realestate'); }
    });
  });
}

// =========================================================================
// TAB 2: 🏢 기업분석 PRO (120,028개 법인 + 재무·국민연금·국세청)
// =========================================================================
function renderCorpTab() {
  if (!S.corpLoaded) {
    $('mainStage').innerHTML = `
      <div class="card" style="max-width:560px;margin:24px auto;text-align:center;padding:28px">
        <div style="font-size:36px;margin-bottom:8px">🏢</div>
        <h2 style="margin:0 0 6px">전국 법인 120,028사 암호화 DB 복호화</h2>
        <p style="color:var(--muted);font-size:13px;margin:0 0 14px">DART 개황 · 3개년 재무 · 국민연금 · 국세청 상태 (9.5 MB)를 브라우저 메모리로 안전하게 로드합니다.</p>
        <div class="progress-bar"><div id="corpProgFill" class="progress-fill" style="width:10%"></div></div>
        <div id="corpProgMsg" style="font-size:12px;color:var(--muted)">준비 중…</div>
      </div>
    `;
    ensureCorpLoaded((pct, msg) => {
      const f = $('corpProgFill'), m = $('corpProgMsg');
      if (f) f.style.width = `${pct}%`;
      if (m) m.textContent = msg;
    }).then(() => { if (S.tab === 'corp') renderCorpTab(); })
      .catch((e) => toast(`기업 DB 로드 실패: ${e.message}`));
    return;
  }

  const sidos = S.core.sido || [];
  const corpTypes = S.core.corpMeta.corp || [];
  const inds = S.core.corpMeta.industries || [];
  const q = S.corpQ.trim().toLowerCase();
  const tagObj = S.corpTag ? S.corpTags.find((t) => t.id === S.corpTag) : null;

  const filtered = [];
  for (let i = 0; i < S.corps.length; i++) {
    const r = S.corps[i];
    if (S.corpSd && String(r[16]) !== S.corpSd) continue;
    if (S.corpType !== '' && String(r[5]) !== S.corpType) continue;
    const bizClean = String(r[6] || '').replace(/\D/g, '');
    if (tagObj && !tagObj.set.has(bizClean)) continue;
    const stCode = S.corpStatusBytes ? S.corpStatusBytes[i] : 0;
    if (S.corpStatus && String(stCode) !== S.corpStatus) continue;
    if (q) {
      const hay = `${r[0]} ${r[4]} ${r[6]} ${r[7]} ${inds[r[12]] || ''}`.toLowerCase();
      if (!hay.includes(q)) continue;
    }
    const enr = S.corpEnrichMap.get(bizClean);
    filtered.push({ i, r, bizClean, enr, stCode });
  }

  if (S.corpSort === 'rev') filtered.sort((a, b) => (b.enr?.[0] || 0) - (a.enr?.[0] || 0));
  else if (S.corpSort === 'emp') filtered.sort((a, b) => (b.enr?.[12] || b.enr?.[9] || 0) - (a.enr?.[12] || a.enr?.[9] || 0));
  else if (S.corpSort === 'net') filtered.sort((a, b) => ((b.enr?.[13] || 0) - (b.enr?.[14] || 0)) - ((a.enr?.[13] || 0) - (a.enr?.[14] || 0)));
  else if (S.corpSort === 'est') filtered.sort((a, b) => (b.r[13] || 0) - (a.r[13] || 0));

  const perPage = 40;
  const maxPage = Math.max(1, Math.ceil(filtered.length / perPage));
  S.corpPage = Math.min(S.corpPage, maxPage);
  const pageRows = filtered.slice((S.corpPage - 1) * perPage, S.corpPage * perPage);
  const stLabel = (c) => (c === 1 ? '<span class="tag tag-sbiz">계속</span>' : c === 2 ? '<span class="tag tag-bid">휴업</span>' : c === 3 ? '<span class="tag tag-re">폐업</span>' : '<span class="tag tag-gray">미확인</span>');

  $('mainStage').innerHTML = `
    <div class="card">
      <div class="card-head">
        <div>
          <h2 class="card-title">🏢 전국 기업분석 PRO <span class="tag tag-corp">${fmt(filtered.length)}사</span></h2>
          <p class="card-sub">DART 법인 120,028사 · 3개년 재무 · 국민연금 고용·급여 · 국세청 사업자상태 통합 조회</p>
        </div>
        <button id="btnCorpReset" class="btn btn-sm" type="button">초기화</button>
      </div>

      <div class="toolbar">
        <input id="fCorpQ" class="input" style="flex:1;min-width:190px" value="${esc(S.corpQ)}" placeholder="기업명 · 대표자 · 사업자번호 · 주소 · 업종 검색" />
        <select id="fCorpSd" class="select">
          <option value="">전국 시도</option>
          ${sidos.map((s) => `<option value="${s.sd}" ${S.corpSd === s.sd ? 'selected' : ''}>${esc(s.n)}</option>`).join('')}
        </select>
        <select id="fCorpType" class="select">
          <option value="">전체 시장</option>
          ${corpTypes.map((c, idx) => `<option value="${idx}" ${S.corpType === String(idx) ? 'selected' : ''}>${esc(c)}</option>`).join('')}
        </select>
        <select id="fCorpTag" class="select">
          <option value="">전체 태그</option>
          ${S.corpTags.map((t) => `<option value="${t.id}" ${S.corpTag === t.id ? 'selected' : ''}>${esc(t.label)} (${fmt(t.set.size)})</option>`).join('')}
        </select>
        <select id="fCorpStatus" class="select">
          <option value="">국세청 전체</option>
          <option value="1" ${S.corpStatus === '1' ? 'selected' : ''}>계속사업자</option>
          <option value="2" ${S.corpStatus === '2' ? 'selected' : ''}>휴업자</option>
          <option value="3" ${S.corpStatus === '3' ? 'selected' : ''}>폐업자</option>
        </select>
        <select id="fCorpSort" class="select">
          <option value="rev" ${S.corpSort === 'rev' ? 'selected' : ''}>매출 높은순</option>
          <option value="emp" ${S.corpSort === 'emp' ? 'selected' : ''}>국민연금 인원순</option>
          <option value="net" ${S.corpSort === 'net' ? 'selected' : ''}>최근 순증(채용)순</option>
          <option value="est" ${S.corpSort === 'est' ? 'selected' : ''}>최근 설립순</option>
        </select>
      </div>

      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>기업명</th><th>시장</th><th>대표자</th><th>업종</th><th>매출액</th><th>국민연금(순증)</th><th>국세청</th><th>소재지</th>
            </tr>
          </thead>
          <tbody>
            ${pageRows.map((x) => {
              const rev = x.enr?.[0] ? `${fmtDec(x.enr[0] / 1e8, 1)}억` : '-';
              const emp = x.enr?.[12] || x.enr?.[9] || 0;
              const net = (x.enr?.[13] || 0) - (x.enr?.[14] || 0);
              return `
                <tr data-corp-idx="${x.i}">
                  <td><b>${esc(x.r[0])}</b>${x.r[3] ? ` <span class="mono" style="font-size:11px;color:var(--muted)">${esc(x.r[3])}</span>` : ''}</td>
                  <td><span class="tag ${x.r[5] <= 1 ? 'tag-corp' : 'tag-gray'}">${esc(corpTypes[x.r[5]] || '기타')}</span></td>
                  <td>${esc(x.r[4] || '-')}</td>
                  <td style="max-width:170px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(inds[x.r[12]] || '-')}</td>
                  <td><b>${rev}</b></td>
                  <td>${emp ? `${fmt(emp)}명` : '-'}${net ? ` <span style="color:${net > 0 ? 'var(--c-sbiz)' : 'var(--c-re)'}">(${net > 0 ? '+' : ''}${net})</span>` : ''}</td>
                  <td>${stLabel(x.stCode)}</td>
                  <td style="max-width:210px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--muted)">${esc(x.r[7] || '-')}</td>
                </tr>`;
            }).join('') || '<tr><td colspan="8" style="text-align:center;padding:24px;color:var(--muted)">조건에 맞는 법인이 없습니다.</td></tr>'}
          </tbody>
        </table>
      </div>

      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px">
        <span style="font-size:12px;color:var(--muted)">페이지 ${S.corpPage} / ${fmt(maxPage)} (총 ${fmt(filtered.length)}사)</span>
        <div style="display:flex;gap:6px">
          <button id="corpPrev" class="btn btn-sm" ${S.corpPage <= 1 ? 'disabled' : ''}>← 이전</button>
          <button id="corpNext" class="btn btn-sm" ${S.corpPage >= maxPage ? 'disabled' : ''}>다음 →</button>
        </div>
      </div>
    </div>
  `;

  let timer = null;
  $('fCorpQ').addEventListener('input', (e) => { clearTimeout(timer); timer = setTimeout(() => { S.corpQ = e.target.value; S.corpPage = 1; renderCorpTab(); }, 220); });
  $('fCorpSd').addEventListener('change', (e) => { S.corpSd = e.target.value; S.corpPage = 1; renderCorpTab(); });
  $('fCorpType').addEventListener('change', (e) => { S.corpType = e.target.value; S.corpPage = 1; renderCorpTab(); });
  $('fCorpTag').addEventListener('change', (e) => { S.corpTag = e.target.value; S.corpPage = 1; renderCorpTab(); });
  $('fCorpStatus').addEventListener('change', (e) => { S.corpStatus = e.target.value; S.corpPage = 1; renderCorpTab(); });
  $('fCorpSort').addEventListener('change', (e) => { S.corpSort = e.target.value; S.corpPage = 1; renderCorpTab(); });
  $('btnCorpReset').addEventListener('click', () => { S.corpQ = ''; S.corpSd = ''; S.corpType = ''; S.corpTag = ''; S.corpStatus = ''; S.corpPage = 1; renderCorpTab(); });
  $('corpPrev').addEventListener('click', () => { if (S.corpPage > 1) { S.corpPage--; renderCorpTab(); } });
  $('corpNext').addEventListener('click', () => { if (S.corpPage < maxPage) { S.corpPage++; renderCorpTab(); } });
  $('mainStage').querySelectorAll('tr[data-corp-idx]').forEach((tr) => {
    tr.addEventListener('click', () => openCorpDrawer(Number(tr.dataset.corpIdx)));
  });
}

function openCorpDrawer(idx) {
  const r = S.corps[idx];
  if (!r) return;
  const bizClean = String(r[6] || '').replace(/\D/g, '');
  const enr = S.corpEnrichMap.get(bizClean);
  const inds = S.core.corpMeta.industries || [];
  const corpTypes = S.core.corpMeta.corp || [];
  const tags = S.corpTags.filter((t) => t.set.has(bizClean)).map((t) => t.label);
  const reg = S.fusionByRid.get(r[15]);

  // 3-year revenue SVG bars
  let chartHtml = '<div style="font-size:12px;color:var(--muted)">재무 데이터 미수록 법인</div>';
  if (enr && (enr[0] || enr[1] || enr[2])) {
    const vals = [
      { yr: '전전기', rev: (enr[2] || 0) / 1e8, op: (enr[5] || 0) / 1e8 },
      { yr: '전기', rev: (enr[1] || 0) / 1e8, op: (enr[4] || 0) / 1e8 },
      { yr: '당기', rev: (enr[0] || 0) / 1e8, op: (enr[3] || 0) / 1e8 },
    ];
    const maxV = Math.max(1, ...vals.map((v) => Math.abs(v.rev)));
    chartHtml = `
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;align-items:end;height:120px;padding:12px 10px 4px;background:var(--surface-2);border-radius:10px;border:1px solid var(--border)">
        ${vals.map((v) => {
          const h = Math.max(8, Math.round(Math.abs(v.rev) / maxV * 70));
          return `<div style="text-align:center">
            <div style="font-size:11px;font-weight:700">${v.rev ? fmtDec(v.rev, 0) + '억' : '-'}</div>
            <div style="height:${h}px;background:linear-gradient(180deg,#4f46e5,#818cf8);border-radius:6px 6px 2px 2px;margin:4px auto;width:44px"></div>
            <div style="font-size:11px;color:var(--muted)">${v.yr}</div>
          </div>`;
        }).join('')}
      </div>
    `;
  }

  openDrawer({
    title: `${r[0]}`,
    sub: `${corpTypes[r[5]] || '기타법인'} · ${inds[r[12]] || '업종 미상'}`,
    body: `
      <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px">
        <span class="tag tag-corp">사업자 ${esc(r[6] || '-')}</span>
        ${r[3] ? `<span class="tag tag-gray">종목 ${esc(r[3])}</span>` : ''}
        ${tags.map((t) => `<span class="tag tag-sbiz">✦ ${esc(t)}</span>`).join('')}
      </div>
      <div class="domain-box" style="margin-bottom:12px">
        <div class="domain-stat-row"><span>대표이사</span><b>${esc(r[4] || '-')}</b></div>
        <div class="domain-stat-row"><span>설립일</span><b>${r[13] ? String(r[13]).replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3') : '-'}</b></div>
        <div class="domain-stat-row"><span>주소</span><b style="text-align:right;max-width:70%">${esc(r[7] || '-')}</b></div>
        <div class="domain-stat-row"><span>전화 / 홈페이지</span><b>${esc(r[8] || '-')} ${r[10] ? `· <a href="https://${esc(r[10].replace(/^https?:\/\//, ''))}" target="_blank" rel="noopener">웹사이트</a>` : ''}</b></div>
      </div>

      <h4 style="margin:12px 0 6px;font-size:13px">📊 3개년 매출 추이 (DART)</h4>
      ${chartHtml}

      ${enr ? `<div class="domain-box" style="margin-top:12px">
        <div class="domain-stat-row"><span>당기 영업이익 / 순이익</span><b>${enr[3] ? fmtDec(enr[3] / 1e8, 1) + '억' : '-'} / ${enr[6] ? fmtDec(enr[6] / 1e8, 1) + '억' : '-'}</b></div>
        <div class="domain-stat-row"><span>국민연금 가입자</span><b>${fmt(enr[12] || enr[9] || 0)}명 (신규 +${fmt(enr[13] || 0)} / 퇴사 -${fmt(enr[14] || 0)})</b></div>
        <div class="domain-stat-row"><span>추정 평균연봉 / 월급</span><b>${enr[10] ? fmtDec(enr[10] / 1e4, 0) + '만원' : (enr[15] ? `월 ${fmtDec(enr[15] / 1e4, 0)}만원` : '-')}</b></div>
      </div>` : ''}

      ${(() => {
        const revNow = enr?.[0] || 0, revPrev = enr?.[1] || 0;
        const yoy = revPrev > 0 ? Math.round(((revNow - revPrev) / revPrev) * 1000) / 10 : null;
        const emp = enr?.[12] || enr?.[9] || 0;
        const netHire = (enr?.[13] || 0) - (enr?.[14] || 0);
        const stCode = S.corpStatusBytes ? S.corpStatusBytes[idx] : 1;
        const p = BIZ_PERSONAS[S.opts.bizPersona] || BIZ_PERSONAS.security;
        let tier = '🟡 WARM (일반 B2B 공략)', msg = [];
        if (stCode === 2 || stCode === 3) { tier = '⛔ HOLD (휴·폐업 주의)'; msg.push('국세청 휴/폐업 이력 확인 — 여신·장기약정 계약 전 실시간 상태 재검증 필수.'); }
        else {
          if (yoy !== null && yoy >= 15) msg.push(`매출 YoY <b>+${yoy}% 고성장</b> — 사업장 확장·설비 증설 예산 집행 가능성 높음.`);
          if (netHire >= 3) msg.push(`국민연금 인원 <b>+${netHire}명 순증</b>(총 ${fmt(emp)}명) — 출입통제·오피스 보안/통신·법인금융 확장 시그널.`);
          if (tags.length) msg.push(`<b>${esc(tags.join(', '))}</b> 인증 기업 — 신용·결제 안정성 우수, 고단가 장기 계약 타깃.`);
          if (r[5] <= 1) msg.push('상장법인 — 본사/지점 통합 B2B 제안 및 파트너십 적합.');
          if ((yoy >= 10 || netHire >= 2 || tags.length || r[5] <= 1 || revNow >= 1e10)) tier = '🔥 HOT (최우선 B2B 타깃)';
          if (!msg.length) msg.push(`소재지(${reg?.name || '관내'}) 기반 방문·전화 컨택으로 ${p.hook} 교체 주기 점검 권장.`);
        }
        return `<div class="comm-panel" style="margin-top:12px">
          <div class="comm-head" style="margin-bottom:6px"><span style="font-weight:800;font-size:12.5px">💼 법인 상업 영업기회 코멘트 (${esc(p.short)})</span><span class="tag ${tier.includes('HOT') ? 'tag-re' : tier.includes('HOLD') ? 'tag-gray' : 'tag-bid'}">${tier}</span></div>
          <div style="font-size:12px;line-height:1.55">${msg.map((m) => `• ${m}`).join('<br/>')}</div>
        </div>`;
      })()}

      <div id="ntsLiveBox" style="margin-top:12px"></div>
    `,
    foot: `
      <button id="dwPipe" class="btn btn-primary btn-sm">💼 파이프라인 담기</button>
      ${bizClean.length === 10 ? `<button id="dwNts" class="btn btn-emerald btn-sm">🧾 국세청 실시간 상태 조회</button>` : ''}
      ${reg ? `<button id="dw360" class="btn btn-sm">⚡ ${esc(reg.name)} 360° 보기</button>` : ''}
    `,
    onMount: () => {
      $('dwPipe')?.addEventListener('click', () => addToPipeline({
        id: `corp:${bizClean || idx}`, domain: 'corp', title: r[0],
        sub: `${r[4] || ''} · ${inds[r[12]] || ''}`, region: reg?.fullName || r[7] || '',
        valueMan: enr?.[0] ? Math.round(enr[0] / 1e4) : 0,
      }));
      $('dw360')?.addEventListener('click', () => { closeDrawer(); S.selectedRid = reg.rid; switchTab('overview'); });
      $('dwNts')?.addEventListener('click', async () => {
        const box = $('ntsLiveBox');
        box.innerHTML = '<div class="tag tag-gray">국세청 API 실시간 조회 중…</div>';
        try {
          const { dataGoEnc } = getApiKeys();
          const res = await fetch(`https://api.odcloud.kr/api/nts-businessman/v1/status?serviceKey=${dataGoEnc}&returnType=JSON`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ b_no: [bizClean] }),
          });
          const j = await res.json();
          const d = j?.data?.[0];
          box.innerHTML = d ? `<div class="diag-card ok"><div class="diag-title">🟢 국세청 실시간 상태: ${esc(d.b_stt || '확인')}</div><div class="diag-detail">과세유형: ${esc(d.tax_type || '-')} · 폐업일: ${esc(d.end_dt || '해당없음')}</div></div>` : '<div class="diag-card err">조회 결과 없음</div>';
        } catch (e) {
          box.innerHTML = `<div class="diag-card err">조회 오류: ${esc(e.message)}</div>`;
        }
      });
    },
  });
}

// =========================================================================
// TAB 3: 🎯 입찰 · 사전규격 · 건축인허가 · 건설사(12,198사)
// =========================================================================
function renderBidTab() {
  const isOpps = S.bidSub === 'opps';
  $('mainStage').innerHTML = `
    <div class="card">
      <div class="card-head">
        <div>
          <h2 class="card-title">🎯 공동주택 · 관공서 입찰 & 사전규격 PRO</h2>
          <p class="card-sub">나라장터 입찰(02) · 사전규격(ao) · 국토부 건축인허가 · K-apt · 건설·시설관리 12,198사 통합</p>
        </div>
        <div class="chips">
          <button class="chip ${isOpps ? 'active' : ''}" data-bid-sub="opps">📡 실시간 입찰·사전규격·인허가 (${fmt(S.opps.length)})</button>
          <button class="chip ${!isOpps ? 'active' : ''}" data-bid-sub="builders">🏗️ 건설·시설관리 DB (${fmt(S.core.stats.builderCount)}사)</button>
        </div>
      </div>

      <div id="bidBody"></div>
    </div>
  `;

  $('mainStage').querySelectorAll('[data-bid-sub]').forEach((b) => {
    b.addEventListener('click', () => { S.bidSub = b.dataset.bidSub; renderBidTab(); });
  });

  if (isOpps) renderBidOppsBody();
  else renderBidBuildersBody();
}

function renderBidOppsBody() {
  const q = S.bidQ.trim().toLowerCase();
  const list = S.opps.filter((o) => {
    if (S.bidStage && o.stageType !== S.bidStage) return false;
    if (S.bidField && o.field !== S.bidField) return false;
    if (q && !`${o.title} ${o.org} ${o.region} ${o.source} ${o.field}`.toLowerCase().includes(q)) return false;
    return true;
  }).sort((a, b) => b.icpScore - a.icpScore);

  const perPage = 30;
  const maxPage = Math.max(1, Math.ceil(list.length / perPage));
  S.bidPage = Math.min(S.bidPage, maxPage);
  const pageItems = list.slice((S.bidPage - 1) * perPage, S.bidPage * perPage);

  const stageLabel = (st) => ({
    bid: '<span class="tag tag-bid">입찰공고</span>',
    prespec: '<span class="tag tag-corp">🔭 사전규격</span>',
    permit: '<span class="tag tag-re">🏗️ 건축인허가</span>',
    complex: '<span class="tag tag-sbiz">🏘️ K-apt 단지</span>',
  }[st] || '<span class="tag tag-gray">기회</span>');

  $('bidBody').innerHTML = `
    <div class="toolbar">
      <input id="fBidQ" class="input" style="flex:1;min-width:190px" value="${esc(S.bidQ)}" placeholder="공고명 · 발주처 · 지역 · CCTV/승강기/전기 키워드" />
      <select id="fBidStage" class="select">
        <option value="">전체 단계 (${fmt(S.opps.length)})</option>
        <option value="bid" ${S.bidStage === 'bid' ? 'selected' : ''}>입찰공고</option>
        <option value="prespec" ${S.bidStage === 'prespec' ? 'selected' : ''}>🔭 사전규격 (조기포착)</option>
        <option value="permit" ${S.bidStage === 'permit' ? 'selected' : ''}>🏗️ 국토부 건축인허가</option>
        <option value="complex" ${S.bidStage === 'complex' ? 'selected' : ''}>🏘️ K-apt 공동주택</option>
      </select>
      <select id="fBidField" class="select">
        <option value="">전체 분야</option>
        ${['보안·CCTV', 'AI·스마트', '시설·경비·미화', '전기·통신·소방', '건축·리모델링', '승강기·설비'].map((f) => `<option value="${f}" ${S.bidField === f ? 'selected' : ''}>${f}</option>`).join('')}
      </select>
      <button id="btnLiveG2b" class="btn btn-amber btn-sm" type="button">🔄 나라장터 입찰·사전규격 실시간 수집</button>
    </div>

    <div class="item-list">
      ${pageItems.map((o) => `
        <div class="item-card" data-opp-id="${esc(o.id)}">
          <div class="item-card-main">
            <div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:5px">
              ${stageLabel(o.stageType)}
              <span class="tag tag-gray">${esc(o.field)}</span>
              ${o.dday !== null && o.dday >= 0 && o.dday <= 7 ? `<span class="tag tag-re">D-${o.dday} 긴급</span>` : ''}
            </div>
            <div class="item-card-title">${esc(o.title)}</div>
            <div class="item-card-meta">
              <span>🏛️ ${esc(o.org || '-')}</span>
              <span>📍 ${esc(o.region || '전국')}</span>
              <span>📅 공고 ${esc(o.pubDate || '-')} ${o.closeDate ? `· 마감 ${esc(o.closeDate)}` : ''}</span>
            </div>
          </div>
          <div class="item-card-right">
            <span class="tag tag-sbiz">ICP ${o.icpScore}점</span>
            <div style="font-weight:800;font-size:14px;color:var(--c-bid)">${o.budgetMan > 0 ? `${fmtDec(o.budgetMan / 10000, 1)}억` : '예산 미기재'}</div>
          </div>
        </div>
      `).join('') || '<div style="text-align:center;padding:28px;color:var(--muted)">조건에 맞는 영업기회가 없습니다.</div>'}
    </div>

    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px">
      <span style="font-size:12px;color:var(--muted)">페이지 ${S.bidPage} / ${maxPage} (총 ${fmt(list.length)}건)</span>
      <div style="display:flex;gap:6px">
        <button id="bidPrev" class="btn btn-sm" ${S.bidPage <= 1 ? 'disabled' : ''}>← 이전</button>
        <button id="bidNext" class="btn btn-sm" ${S.bidPage >= maxPage ? 'disabled' : ''}>다음 →</button>
      </div>
    </div>
  `;

  let t = null;
  $('fBidQ').addEventListener('input', (e) => { clearTimeout(t); t = setTimeout(() => { S.bidQ = e.target.value; S.bidPage = 1; renderBidOppsBody(); }, 200); });
  $('fBidStage').addEventListener('change', (e) => { S.bidStage = e.target.value; S.bidPage = 1; renderBidOppsBody(); });
  $('fBidField').addEventListener('change', (e) => { S.bidField = e.target.value; S.bidPage = 1; renderBidOppsBody(); });
  $('bidPrev').addEventListener('click', () => { if (S.bidPage > 1) { S.bidPage--; renderBidOppsBody(); } });
  $('bidNext').addEventListener('click', () => { if (S.bidPage < maxPage) { S.bidPage++; renderBidOppsBody(); } });
  $('btnLiveG2b').addEventListener('click', fetchLiveG2bAndPrespec);
  $('bidBody').querySelectorAll('[data-opp-id]').forEach((card) => {
    card.addEventListener('click', () => {
      const o = S.opps.find((x) => x.id === card.dataset.oppId);
      if (o) openOppDrawer(o);
    });
  });
}

async function fetchLiveG2bAndPrespec() {
  const { dataGoEnc } = getApiKeys();
  if (!dataGoEnc) return toast('공공데이터포털 키가 없습니다.');
  toast('🔄 나라장터 입찰(02) + 사전규격(ao) 실시간 수집 중…');
  const now = new Date();
  const bgn = new Date(now.getTime() - 3 * 86400000);
  const ymd = (d) => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const bgnDt = ymd(bgn) + '0000', endDt = ymd(now) + '2359';
  const urls = [
    ['bid', `https://apis.data.go.kr/1230000/ad/BidPublicInfoService02/getBidPblancListInfoServc02?serviceKey=${dataGoEnc}&numOfRows=30&pageNo=1&type=json&inqryDiv=1&inqryBgnDt=${bgnDt}&inqryEndDt=${endDt}`],
    ['bid', `https://apis.data.go.kr/1230000/ad/BidPublicInfoService02/getBidPblancListInfoCnstwk02?serviceKey=${dataGoEnc}&numOfRows=30&pageNo=1&type=json&inqryDiv=1&inqryBgnDt=${bgnDt}&inqryEndDt=${endDt}`],
    ['prespec', `https://apis.data.go.kr/1230000/ao/HrcspSsstndrdInfoService/getPublicPrcureThngInfoServc?serviceKey=${dataGoEnc}&numOfRows=30&pageNo=1&type=json&inqryDiv=1&inqryBgnDt=${bgnDt}&inqryEndDt=${endDt}`],
    ['prespec', `https://apis.data.go.kr/1230000/ao/HrcspSsstndrdInfoService/getPublicPrcureThngInfoCnstwk?serviceKey=${dataGoEnc}&numOfRows=30&pageNo=1&type=json&inqryDiv=1&inqryBgnDt=${bgnDt}&inqryEndDt=${endDt}`],
  ];
  const map = new Map(S.opps.map((o) => [o.id, o]));
  let added = 0;
  await Promise.all(urls.map(async ([st, u]) => {
    try {
      const r = await fetch(u);
      const j = await r.json();
      const raw = j?.response?.body?.items;
      const arr = Array.isArray(raw) ? raw : (raw?.item ? (Array.isArray(raw.item) ? raw.item : [raw.item]) : []);
      for (const it of arr) {
        const isPre = st === 'prespec';
        const id = isPre ? `pre-${it.bfSpecRgstNo || it.prdctClsfcNoNm}` : `g2b-${it.bidNtceNo}-${it.bidNtceOrd || '00'}`;
        if (map.has(id)) continue;
        const budgetWon = Number(isPre ? it.asignBdgtAmt : (it.presmptPrce || it.asignBdgtAmt || 0)) || 0;
        const obj = enrichOpp({
          id,
          source: isPre ? '나라장터 사전규격(실시간)' : '나라장터 입찰(실시간)',
          stageType: st,
          title: isPre ? `[사전규격] ${it.prdctClsfcNoNm || it.bsnsDivNm || ''}` : (it.bidNtceNm || ''),
          org: it.dminsttNm || it.orderInsttNm || it.ntceInsttNm || '',
          region: it.dminsttOfclAddr || it.ntceInsttNm || '전국',
          budgetMan: Math.round(budgetWon / 10000),
          pubDate: String(it.bidNtceDt || it.rcptDt || '').slice(0, 10),
          closeDate: String(it.bidClseDt || it.opninRgstClseDt || '').slice(0, 10),
          method: it.bidMethdNm || (isPre ? '사전규격 의견수렴' : ''),
          url: it.bidNtceDtlUrl || 'https://www.g2b.go.kr/',
        });
        map.set(id, obj);
        added++;
      }
    } catch {}
  }));
  S.opps = [...map.values()];
  $('cntBid').textContent = fmt(S.opps.length);
  toast(`✓ 실시간 수집 완료 (+${added}건 신규 병합, 총 ${fmt(S.opps.length)}건)`);
  if (S.tab === 'bid') renderBidTab();
}

function openOppDrawer(o) {
  const reg = S.fusionByRid.get(o._fusionRid ?? o.rid);
  openDrawer({
    title: o.title,
    sub: `${o.source} · ${o.field}`,
    body: `
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px">
        <span class="tag tag-sbiz">ICP 적합도 ${o.icpScore}점</span>
        <span class="tag tag-bid">${o.budgetMan > 0 ? `예산 ${fmtDec(o.budgetMan / 10000, 1)}억 (${fmt(o.budgetMan)}만원)` : '예산 미기재'}</span>
        ${o.dday !== null && o.dday >= 0 ? `<span class="tag tag-re">마감 D-${o.dday}</span>` : ''}
      </div>
      <div class="domain-box">
        <div class="domain-stat-row"><span>발주/관리기관</span><b>${esc(o.org || '-')}</b></div>
        <div class="domain-stat-row"><span>지역</span><b>${esc(o.region || '전국')}</b></div>
        <div class="domain-stat-row"><span>방식/구분</span><b>${esc(o.method || '-')}</b></div>
        <div class="domain-stat-row"><span>공고일 / 마감일</span><b>${esc(o.pubDate || '-')} / ${esc(o.closeDate || '-')}</b></div>
      </div>
      ${o.meta ? `<div class="domain-box" style="margin-top:10px"><h4>추가 메타정보</h4>${Object.entries(o.meta).map(([k, v]) => `<div class="domain-stat-row"><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join('')}</div>` : ''}
      ${(() => {
        const p = BIZ_PERSONAS[S.opts.bizPersona] || BIZ_PERSONAS.security;
        let strat = '';
        if (o.stageType === 'prespec') strat = '🔭 <b>사전규격 조기포착 골든타임</b>: 본공고 1~3주 전입니다. 발주 담당자에게 자사 강점 사양(AI 관제·인증·유지보수 조건)이 반영되도록 규격 의견서 및 기술 자료를 즉시 전달하세요.';
        else if (o.stageType === 'permit') strat = '🏗️ <b>건축인허가 선제 스펙인 기회</b>: 착공 전 설계·시공 단계입니다. 건축주·시공사·전기/통신 협력사에 초도 보안·통신·설비 패키지 사전 견적을 제안하세요.';
        else if (o.stageType === 'complex') strat = '🏘️ <b>공동주택(K-apt) 교체·위탁 영업</b>: 관리사무소장·입주자대표회의 대상으로 노후 CCTV/주차관제/승강기 무상 진단 리포트와 장기수선충당금 절감안을 제시하세요.';
        else strat = `🎯 <b>진행 입찰공고${o.dday !== null && o.dday <= 7 ? ` (D-${o.dday} 긴급)` : ''}</b>: 과업지시서·참가자격(면허/실적)·기초금액을 즉시 확인하고, 부족 면허는 지역 건설·시설 DB(12,198사)와 공동도급 검토를 권장합니다.`;
        return `<div class="comm-panel" style="margin-top:12px">
          <div class="comm-head" style="margin-bottom:6px"><span style="font-weight:800;font-size:12.5px">🎯 수주 공략 코멘트 (${esc(p.short)})</span><span class="tag tag-sbiz">ICP ${o.icpScore}점</span></div>
          <div style="font-size:12px;line-height:1.55">${strat}</div>
        </div>`;
      })()}
    `,
    foot: `
      <button id="dwOppPipe" class="btn btn-primary btn-sm">💼 파이프라인 담기</button>
      ${o.url ? `<a class="btn btn-amber btn-sm" href="${esc(o.url)}" target="_blank" rel="noopener">🔗 원문 공고 열기</a>` : ''}
      ${reg ? `<button id="dwOpp360" class="btn btn-sm">⚡ ${esc(reg.name)} 360° 보기</button>` : ''}
    `,
    onMount: () => {
      $('dwOppPipe')?.addEventListener('click', () => addToPipeline({
        id: `opp:${o.id}`, domain: 'bid', title: o.title, sub: `${o.org} · ${o.field}`, region: o.region, valueMan: o.budgetMan,
      }));
      $('dwOpp360')?.addEventListener('click', () => { closeDrawer(); S.selectedRid = reg.rid; switchTab('overview'); });
    },
  });
}

async function renderBidBuildersBody() {
  if (!S.builders) {
    $('bidBody').innerHTML = '<div style="padding:24px;text-align:center;color:var(--muted)">🏗️ 건설·시설관리 12,198사 볼트 복호화 중…</div>';
    await ensureBuildersLoaded();
  }
  const rows = S.builders.rows || [];
  const inds = S.builders.industries || [];
  const q = S.bldQ.trim().toLowerCase();
  const list = rows.filter((r) => {
    if (S.bldSector && r[13] !== S.bldSector) return false;
    if (q && !`${r[0]} ${r[2]} ${r[4]} ${r[5]} ${inds[r[8]] || ''}`.toLowerCase().includes(q)) return false;
    return true;
  });
  const perPage = 40;
  const maxPage = Math.max(1, Math.ceil(list.length / perPage));
  S.bldPage = Math.min(S.bldPage, maxPage);
  const pageRows = list.slice((S.bldPage - 1) * perPage, S.bldPage * perPage);

  $('bidBody').innerHTML = `
    <div class="toolbar">
      <input id="fBldQ" class="input" style="flex:1;min-width:190px" value="${esc(S.bldQ)}" placeholder="건설사 · 전기·통신 · 시설관리사명 · 주소 검색" />
      <select id="fBldSec" class="select">
        <option value="">전체 업종 (${fmt(rows.length)}사)</option>
        <option value="general" ${S.bldSector === 'general' ? 'selected' : ''}>종합건설</option>
        <option value="special" ${S.bldSector === 'special' ? 'selected' : ''}>전문건설</option>
        <option value="elec" ${S.bldSector === 'elec' ? 'selected' : ''}>전기·통신·소방</option>
        <option value="facility" ${S.bldSector === 'facility' ? 'selected' : ''}>시설·경비·관리</option>
      </select>
    </div>
    <div class="table-wrap">
      <table class="data-table">
        <thead><tr><th>기업명</th><th>분야</th><th>대표자</th><th>매출액</th><th>국민연금</th><th>주소</th><th>액션</th></tr></thead>
        <tbody>
          ${pageRows.map((r) => `
            <tr>
              <td><b>${esc(r[0])}</b></td>
              <td><span class="tag tag-bid">${esc(r[13] || '-')}</span></td>
              <td>${esc(r[2] || '-')}</td>
              <td><b>${r[14] ? fmtDec(r[14], 1) + '억' : '-'}</b></td>
              <td>${r[17] ? fmt(r[17]) + '명' : '-'}</td>
              <td style="max-width:220px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--muted)">${esc(r[5] || '-')}</td>
              <td><button class="btn btn-sm" data-add-bld="${esc(r[4] || r[0])}">+ 담기</button></td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px">
      <span style="font-size:12px;color:var(--muted)">페이지 ${S.bldPage} / ${maxPage} (총 ${fmt(list.length)}사)</span>
      <div style="display:flex;gap:6px">
        <button id="bldPrev" class="btn btn-sm" ${S.bldPage <= 1 ? 'disabled' : ''}>← 이전</button>
        <button id="bldNext" class="btn btn-sm" ${S.bldPage >= maxPage ? 'disabled' : ''}>다음 →</button>
      </div>
    </div>
  `;
  let t = null;
  $('fBldQ').addEventListener('input', (e) => { clearTimeout(t); t = setTimeout(() => { S.bldQ = e.target.value; S.bldPage = 1; renderBidBuildersBody(); }, 200); });
  $('fBldSec').addEventListener('change', (e) => { S.bldSector = e.target.value; S.bldPage = 1; renderBidBuildersBody(); });
  $('bldPrev').addEventListener('click', () => { if (S.bldPage > 1) { S.bldPage--; renderBidBuildersBody(); } });
  $('bldNext').addEventListener('click', () => { if (S.bldPage < maxPage) { S.bldPage++; renderBidBuildersBody(); } });
  $('bidBody').querySelectorAll('[data-add-bld]').forEach((b) => {
    b.addEventListener('click', () => {
      const row = pageRows.find((r) => (r[4] || r[0]) === b.dataset.addBld);
      if (row) addToPipeline({ id: `bld:${row[4] || row[0]}`, domain: 'bid', title: row[0], sub: `건설·시설 (${row[13]}) · ${row[2]}`, region: row[5] || '', valueMan: Math.round((row[14] || 0) * 10000) });
    });
  });
}

// =========================================================================
// TAB 4: 🏪 소상공인 상권지도 PRO (전국 275만 · VWorld 디지털트윈 GIS · 반경분석)
// =========================================================================
const VWORLD_WMS_CFG = {
  cadastral: { layers: 'lp_pa_cbnd_bonbun,lp_pa_cbnd_bubun', styles: '', opacity: 0.88, minZoom: 14, label: '📐 연속지적도' },
  zoning:    { layers: 'lt_c_uq111', styles: 'lt_c_uq111', opacity: 0.44, minZoom: 11, label: '🏙️ 용도지역' },
  emd:       { layers: 'lt_c_ademd_info', styles: 'lt_c_ademd', opacity: 0.82, minZoom: 11, label: '🏘️ 읍면동경계' },
  bldg:      { layers: 'lt_c_bldginfo', styles: '', opacity: 0.72, minZoom: 15, label: '🏢 건물' },
};

function haversineM(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = (d) => d * Math.PI / 180;
  const dLat = toRad(lat2 - lat1), dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function createCanvasHeatLayer(points) {
  const Heat = L.Layer.extend({
    initialize(pts) { this._pts = pts || []; },
    setPoints(pts) { this._pts = pts || []; this._redraw(); },
    onAdd(map) {
      this._map = map;
      this._canvas = L.DomUtil.create('canvas', 'leaflet-heat-canvas');
      this._canvas.style.cssText = 'position:absolute;top:0;left:0;pointer-events:none;z-index:240;';
      map.getPanes().overlayPane.appendChild(this._canvas);
      map.on('moveend zoomend resize', this._redraw, this);
      this._redraw();
    },
    onRemove(map) {
      map.off('moveend zoomend resize', this._redraw, this);
      this._canvas?.remove();
    },
    _redraw() {
      if (!this._map || !this._canvas) return;
      const size = this._map.getSize();
      const topLeft = this._map.containerPointToLayerPoint([0, 0]);
      L.DomUtil.setPosition(this._canvas, topLeft);
      this._canvas.width = size.x;
      this._canvas.height = size.y;
      const ctx = this._canvas.getContext('2d');
      ctx.clearRect(0, 0, size.x, size.y);
      if (!this._pts.length) return;
      const bounds = this._map.getBounds().pad(0.15);
      const r = Math.max(12, Math.min(28, this._map.getZoom() * 1.4));
      for (let i = 0; i < this._pts.length; i++) {
        const [lat, lon, w] = this._pts[i];
        if (!bounds.contains([lat, lon])) continue;
        const p = this._map.latLngToContainerPoint([lat, lon]);
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
        grad.addColorStop(0, `rgba(239,68,68,${Math.min(0.28, 0.08 * (w || 1))})`);
        grad.addColorStop(0.5, `rgba(245,158,11,${Math.min(0.18, 0.05 * (w || 1))})`);
        grad.addColorStop(1, 'rgba(16,185,129,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    },
  });
  return new Heat(points);
}

function cleanSbizLabel(val) {
  const s = String(val || '');
  if (s.includes('>')) return s.slice(s.lastIndexOf('>') + 1).trim();
  const parts = s.trim().split(/\s+/);
  return parts[parts.length - 1] || s;
}

function cleanDupAddr(s) {
  return String(s || '').trim().replace(/^(\S+)\s+\1\s+/, '$1 ');
}

function parseSbizStore(sido, i) {
  const parts = String(sido.strs[i] || '').split('\x1f');
  const id = parts[0] || '';
  const ymRaw = id.slice(6, 12);
  const regYm = /^\d{6}$/.test(ymRaw) ? `${ymRaw.slice(0, 4)}.${ymRaw.slice(4, 6)}` : '';
  const regYear = /^\d{4}/.test(ymRaw) ? Number(ymRaw.slice(0, 4)) : 0;
  const sggRaw = sido.dicts.sgg[sido.cols.sgg[i]] || '';
  const dongRaw = sido.dicts.dong[sido.cols.dong[i]] || '';
  const sgg = cleanSbizLabel(sggRaw);
  const dong = cleanSbizLabel(dongRaw);
  const road = cleanDupAddr(parts[3] || '');
  const jibun = parts[6] || '';
  const floorRaw = sido.dicts.floor?.[sido.cols.floor?.[i]] || '';
  const floor = floorRaw && floorRaw !== '(미상)' ? `${floorRaw}층` : '';
  const zip = sido.dicts.zip?.[sido.cols.zip?.[i]] || '';
  const ksic = cleanSbizLabel(sido.dicts.ksic?.[sido.cols.ksic?.[i]] || '');
  const isNew2026 = regYear === 2026;
  const ageLabel = isNew2026 ? '🆕 2026 신규' : (regYear >= 2024 ? '성장기(1~2년)' : (regYear > 0 ? '안정기(3년+)' : ''));
  return {
    i,
    id,
    regYm,
    ageLabel,
    name: parts[1] || '',
    branch: parts[2] || '',
    road,
    bld: parts[4] || '',
    floor,
    ho: parts[5] || '',
    zip,
    jibun,
    addr: road || (jibun ? `${sgg} ${jibun}`.trim() : `${sgg} ${dong}`.trim()),
    l1: cleanSbizLabel(sido.dicts.l1[sido.cols.l1[i]] || ''),
    l2: cleanSbizLabel(sido.dicts.l2[sido.cols.l2[i]] || ''),
    l3: cleanSbizLabel(sido.dicts.l3[sido.cols.l3[i]] || ''),
    ksic,
    sgg,
    dong,
    bldId: sido.bldId[i] || 0,
    lat: sido.lat[i] / 1e6,
    lon: sido.lon[i] / 1e6,
    isNew2026,
  };
}

function regYmBadgeHtml(regYm) {
  if (!regYm) return '<span class="ym-badge ym-old">-</span>';
  const y = regYm.slice(0, 4);
  const cls = y === '2026' ? 'ym-2026' : y === '2025' ? 'ym-2025' : y === '2024' ? 'ym-2024' : 'ym-old';
  return `<span class="ym-badge ${cls}">${y === '2026' ? '🆕' : '📅'} ${esc(regYm)}</span>`;
}
function regYearColor(regYm) {
  const y = String(regYm || '').slice(0, 4);
  if (y === '2026') return '#f59e0b';
  if (y === '2025') return '#2563eb';
  if (y === '2024') return '#059669';
  return '#64748b';
}

function renderSbizTab() {
  const sidos = S.core.sbizSummary.sidos || [];
  const active = S.sbizActiveSlug ? S.sbizCache.get(S.sbizActiveSlug) : null;

  $('mainStage').innerHTML = `
    <div class="card" style="margin-bottom:14px">
      <div class="card-head">
        <div>
          <h2 class="card-title">🏪 전국 소상공인 상권 · 디지털트윈 GIS PRO <span class="tag tag-sbiz">총 ${fmt(S.core.stats.sbizCount)}개</span></h2>
          <p class="card-sub">등재연월(년·월) 정밀 구분조회 · 지도+리스트 실시간 연동 · 브이월드 위성/지적도/히트맵/반경 상권진단</p>
        </div>
        <div style="display:flex;gap:5px;flex-wrap:wrap">
          <button id="btnSbizFit" class="btn btn-sm" type="button" title="현재 필터 상가 전체가 보이도록 지도 맞춤">🎯 결과 맞춤</button>
          <button id="btnSbizGps" class="btn btn-sm" type="button" title="내 GPS 현재 위치로 이동 후 반경 분석">📍 내 위치</button>
          <button id="btnSbizLiveRadius" class="btn btn-emerald btn-sm" type="button">📡 반경 실시간 API</button>
          <button id="btnSbizVworld" class="btn btn-sm" type="button">📍 중심 반경분석</button>
        </div>
      </div>

      <div class="sido-grid">
        ${sidos.map((s) => {
          const isLoaded = S.sbizCache.has(s.slug);
          const isAct = S.sbizActiveSlug === s.slug;
          return `<button class="sido-btn ${isLoaded ? 'loaded' : ''} ${isAct ? 'active' : ''}" data-load-sido="${s.slug}">
            <div class="s-nm"><span>${esc(s.short)}</span><span>${(s.bytes / 1048576).toFixed(1)}MB</span></div>
            <div class="s-cnt">${fmt(s.count)}개 · +${fmt(s.new2026)}신규</div>
          </button>`;
        }).join('')}
      </div>

      <!-- PRO GIS CONTROL DECK -->
      <div class="gis-deck">
        <div class="gis-row">
          <span class="gis-label">🗺️ 배경지도:</span>
          ${[
            ['vbase', '브이월드 기본'],
            ['vsat', '🛰️ 항공위성'],
            ['vhyb', '🛰️ 위성+도로'],
            ['vwhite', '백지도'],
            ['vmidnight', '🌙 다크'],
            ['osm', 'OSM'],
          ].map(([k, lb]) => `<button class="toggle-pill ${S.gisBase === k ? 'on' : ''}" data-gis-base="${k}" type="button">${lb}</button>`).join('')}
        </div>
        <div class="gis-row">
          <span class="gis-label">🛰️ 국토부 GIS·히트맵:</span>
          <button class="toggle-pill ${S.gisLayers.heat ? 'on-emerald' : ''}" data-gis-layer="heat" type="button">🔥 상권 밀도 히트맵</button>
          <button class="toggle-pill ${S.gisLayers.cadastral ? 'on-emerald' : ''}" data-gis-layer="cadastral" type="button">📐 연속지적도 (줌14+)</button>
          <button class="toggle-pill ${S.gisLayers.zoning ? 'on-emerald' : ''}" data-gis-layer="zoning" type="button">🏙️ 용도지역 (줌11+)</button>
          <button class="toggle-pill ${S.gisLayers.emd ? 'on-emerald' : ''}" data-gis-layer="emd" type="button">🏘️ 읍면동경계</button>
          <button class="toggle-pill ${S.gisLayers.bldg ? 'on-emerald' : ''}" data-gis-layer="bldg" type="button">🏢 건물 (줌15+)</button>
        </div>
        <div class="gis-row">
          <span class="gis-label">🎨 마커·뷰 옵션:</span>
          ${[
            ['category', '업종 8색'],
            ['regYear', '📅 등재연도별'],
            ['new2026', '🆕 2026 신규'],
            ['density', '🏢 건물 밀집도'],
          ].map(([k, lb]) => `<button class="toggle-pill ${S.opts.markerColorMode === k ? 'on' : ''}" data-mk-mode="${k}" type="button">${lb}</button>`).join('')}
          <button class="toggle-pill ${S.opts.groupBuildings ? 'on-emerald' : ''}" id="btnToggleGroupBld" type="button">🏢 동일건물 그룹핑</button>
          <button class="toggle-pill ${S.opts.showStoreLabels ? 'on-emerald' : ''}" id="btnToggleLabels" type="button">🏷️ 라벨(줌16+)</button>
          <button class="toggle-pill ${S.gisRulerMode ? 'on' : ''}" id="btnToggleRuler" type="button">📏 거리측정</button>
          <button class="toggle-pill ${S.sbizSplitView ? 'on' : ''}" id="btnToggleSplit" type="button">↔️ 지도+리스트 분할</button>
          <button class="toggle-pill ${S.sbizViewportSync ? 'on-emerald' : ''}" id="btnToggleVpSync" type="button">👁️ 지도화면 리스트연동</button>
          <button class="toggle-pill ${S.sbizMapExpanded ? 'on' : ''}" id="btnToggleExpand" type="button">🖥️ 지도확장</button>
        </div>
        <div class="gis-row">
          <span class="gis-label">🎯 클릭 반경분석:</span>
          ${[300, 500, 1000, 2000].map((r) => `<button class="toggle-pill ${S.gisRadius === r ? 'on' : ''}" data-gis-rad="${r}" type="button">${r >= 1000 ? `${r / 1000}km` : `${r}m`}</button>`).join('')}
          <div style="display:flex;gap:5px;margin-left:auto;flex:1;min-width:210px;max-width:340px">
            <input id="fGisPlace" class="input" style="flex:1;padding:5px 9px;font-size:12px" placeholder="📍 장소·주소 이동 (예: 부평역, 강남역)" />
            <button id="btnGisPlaceGo" class="btn btn-sm btn-primary" type="button">이동</button>
          </div>
        </div>
      </div>

      ${active ? renderSbizControlsHtml(active) : `
        <div style="padding:12px 14px;border-radius:11px;background:var(--c-sbiz-bg);font-size:13px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:10px">
          <span>💡 시도를 선택하면 275만 상권 데이터 + 등재연월(년·월) 조회 + 지도·리스트 실시간 연동이 활성화됩니다.</span>
          <div style="display:flex;gap:6px">
            <button class="btn btn-emerald btn-sm" data-load-sido="incheon">인천 열기 (6.7MB)</button>
            <button class="btn btn-sm" data-load-sido="sejong">세종 열기 (0.7MB)</button>
          </div>
        </div>
      `}

      ${active ? `<div id="sbizYmTimeline"></div>` : ''}

      <div id="sbizWorkspace" class="sbiz-workspace ${S.sbizSplitView && active ? 'split' : ''}">
        <div>
          <div id="sbizMap" class="leaflet-box ${S.sbizMapExpanded ? 'expanded' : ''}"></div>
          <div id="sbizMarkerLegend" class="marker-legend"></div>
        </div>
        <div id="sbizListCard"></div>
      </div>

      <div id="sbizCatchmentBox"></div>
    </div>
  `;

  $('mainStage').querySelectorAll('[data-load-sido]').forEach((b) => {
    b.addEventListener('click', async () => {
      await loadSbizSido(b.dataset.loadSido);
      S.catchment = null;
      S.sbizYear = ''; S.sbizMonth = ''; S.sbizPeriod = '';
      renderSbizTab();
    });
  });

  initSbizLeaflet(active);

  // Wire Pro GIS controls
  $('mainStage').querySelectorAll('[data-gis-base]').forEach((b) => {
    b.addEventListener('click', () => {
      S.gisBase = b.dataset.gisBase;
      $('mainStage').querySelectorAll('[data-gis-base]').forEach((x) => x.classList.toggle('on', x.dataset.gisBase === S.gisBase));
      applyGisBaseMap();
    });
  });
  $('mainStage').querySelectorAll('[data-gis-layer]').forEach((b) => {
    b.addEventListener('click', () => {
      const k = b.dataset.gisLayer;
      S.gisLayers[k] = !S.gisLayers[k];
      b.classList.toggle('on-emerald', S.gisLayers[k]);
      applyGisOverlays(active);
      if (S.gisLayers[k] && (k === 'cadastral' || k === 'bldg') && S.leafletMap && S.leafletMap.getZoom() < 15) {
        S.leafletMap.setZoom(15);
        toast(`${VWORLD_WMS_CFG[k].label} 표시를 위해 줌 15로 자동 확대했습니다.`);
      }
    });
  });
  $('mainStage').querySelectorAll('[data-gis-rad]').forEach((b) => {
    b.addEventListener('click', () => {
      S.gisRadius = Number(b.dataset.gisRad);
      $('mainStage').querySelectorAll('[data-gis-rad]').forEach((x) => x.classList.toggle('on', Number(x.dataset.gisRad) === S.gisRadius));
      if (S.catchment) runRadiusCatchment(S.catchment.lat, S.catchment.lon, active);
    });
  });

  $('mainStage').querySelectorAll('[data-mk-mode]').forEach((b) => {
    b.addEventListener('click', () => {
      S.opts.markerColorMode = b.dataset.mkMode;
      saveOpts();
      $('mainStage').querySelectorAll('[data-mk-mode]').forEach((x) => x.classList.toggle('on', x.dataset.mkMode === S.opts.markerColorMode));
      renderMarkerLegend();
      if (active) renderViewportSbizMarkers(active);
    });
  });
  $('btnToggleGroupBld')?.addEventListener('click', (e) => {
    S.opts.groupBuildings = !S.opts.groupBuildings;
    saveOpts();
    e.currentTarget.classList.toggle('on-emerald', S.opts.groupBuildings);
    renderMarkerLegend();
    if (active) renderViewportSbizMarkers(active);
  });
  $('btnToggleLabels')?.addEventListener('click', (e) => {
    S.opts.showStoreLabels = !S.opts.showStoreLabels;
    saveOpts();
    e.currentTarget.classList.toggle('on-emerald', S.opts.showStoreLabels);
    if (active) renderViewportSbizMarkers(active);
  });
  $('btnToggleRuler')?.addEventListener('click', (e) => {
    S.gisRulerMode = !S.gisRulerMode;
    S.rulerPts = [];
    S.leafletRulerLayer?.clearLayers();
    e.currentTarget.classList.toggle('on', S.gisRulerMode);
    toast(S.gisRulerMode ? '📏 거리측정 ON: 지도에서 2개 지점을 차례로 클릭하세요.' : '📏 거리측정 OFF (클릭 반경분석 복귀)');
  });
  $('btnToggleSplit')?.addEventListener('click', (e) => {
    S.sbizSplitView = !S.sbizSplitView;
    e.currentTarget.classList.toggle('on', S.sbizSplitView);
    $('sbizWorkspace')?.classList.toggle('split', S.sbizSplitView && !!active);
    setTimeout(() => S.leafletMap?.invalidateSize(), 120);
  });
  $('btnToggleVpSync')?.addEventListener('click', (e) => {
    S.sbizViewportSync = !S.sbizViewportSync;
    S.sbizPage = 1;
    e.currentTarget.classList.toggle('on-emerald', S.sbizViewportSync);
    toast(S.sbizViewportSync ? '👁️ 지도 화면 연동 ON: 지도를 움직이면 리스트가 현재 화면 상가로 자동 갱신됩니다.' : '👁️ 지도 화면 연동 OFF (전체 필터 리스트 표시)');
    if (active) { renderViewportSbizMarkers(active); renderSbizListPanel(active); }
  });
  $('btnToggleExpand')?.addEventListener('click', (e) => {
    S.sbizMapExpanded = !S.sbizMapExpanded;
    e.currentTarget.classList.toggle('on', S.sbizMapExpanded);
    $('sbizMap')?.classList.toggle('expanded', S.sbizMapExpanded);
    setTimeout(() => S.leafletMap?.invalidateSize(), 120);
  });
  $('btnSbizFit')?.addEventListener('click', () => {
    if (!active || !S.leafletMap || !S.lastSbizMatchedIdx.length) return toast('먼저 시도를 열어 상가를 조회하세요.');
    const step = Math.max(1, Math.floor(S.lastSbizMatchedIdx.length / 500));
    const bounds = [];
    for (let k = 0; k < S.lastSbizMatchedIdx.length; k += step) {
      const la = active.lat[S.lastSbizMatchedIdx[k]] / 1e6, lo = active.lon[S.lastSbizMatchedIdx[k]] / 1e6;
      if (la && lo) bounds.push([la, lo]);
    }
    if (bounds.length) S.leafletMap.fitBounds(bounds, { maxZoom: 16, padding: [24, 24] });
  });
  $('btnSbizGps')?.addEventListener('click', () => {
    if (!navigator.geolocation) return toast('브라우저에서 GPS 위치 정보를 지원하지 않습니다.');
    toast('📍 현재 GPS 위치 확인 중…');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        S.leafletMap?.setView([latitude, longitude], 16);
        runRadiusCatchment(latitude, longitude, active, '내 현재 위치');
      },
      (err) => toast(`GPS 조회 실패: ${err.message}`),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  });
  renderMarkerLegend();

  const doPlaceJump = async () => {
    const q = $('fGisPlace')?.value.trim();
    if (!q || !S.leafletMap) return;
    toast(`📍 '${q}' 위치 검색 중…`);
    try {
      const pt = await searchVworldPlace(q);
      S.leafletMap.setView([pt.lat, pt.lon], 16);
      runRadiusCatchment(pt.lat, pt.lon, active, pt.title);
      toast(`✓ '${pt.title}' 이동 및 반경 ${S.gisRadius}m 분석 완료`);
    } catch (e) {
      toast(`위치 검색 실패: ${e.message}`);
    }
  };
  $('btnGisPlaceGo').addEventListener('click', doPlaceJump);
  $('fGisPlace').addEventListener('keydown', (e) => { if (e.key === 'Enter') doPlaceJump(); });

  $('btnSbizLiveRadius').addEventListener('click', async () => {
    if (!S.leafletMap) return;
    const c = S.leafletMap.getCenter();
    const { dataGoEnc } = getApiKeys();
    toast(`📡 소상공인 반경 ${S.gisRadius}m 실시간 API 조회 중…`);
    try {
      const r = await fetch(`https://apis.data.go.kr/B553077/api/open/sdsc2/storeListInRadius?serviceKey=${dataGoEnc}&pageNo=1&numOfRows=100&radius=${S.gisRadius}&cx=${c.lng.toFixed(6)}&cy=${c.lat.toFixed(6)}&type=json`);
      const j = await r.json();
      const items = j?.body?.items || [];
      S.sbizLiveStores = items;
      plotLiveSbizMarkers(items);
      toast(`✓ 반경 ${S.gisRadius}m 실시간 상가 ${items.length}개 표시됨!`);
    } catch (e) {
      toast(`실시간 상권 조회 오류: ${e.message}`);
    }
  });

  $('btnSbizVworld').addEventListener('click', () => {
    if (!S.leafletMap) return;
    const c = S.leafletMap.getCenter();
    runRadiusCatchment(c.lat, c.lng, active);
  });

  if (active) {
    wireSbizFilters(active);
    updateSbizView(active);
  }
  if (S.catchment) renderCatchmentHud();
}

function getSbizDateSummary(active) {
  if (active._dateSum) return active._dateSum;
  const yrMap = new Map(), ymMap = new Map();
  for (let i = 0; i < active.n; i++) {
    const ym = String(active.strs[i] || '').slice(6, 12);
    if (/^\d{6}$/.test(ym)) {
      ymMap.set(ym, (ymMap.get(ym) || 0) + 1);
      const y = ym.slice(0, 4);
      yrMap.set(y, (yrMap.get(y) || 0) + 1);
    }
  }
  const years = [...yrMap.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  const yms = [...ymMap.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  active._dateSum = { years, yms, recent3: new Set(yms.slice(0, 3).map(([k]) => k)) };
  return active._dateSum;
}

function renderSbizControlsHtml(active) {
  const sggs = (active.dicts.sgg || []).filter(Boolean);
  const l1s = (active.dicts.l1 || []).filter(Boolean);
  const ds = getSbizDateSummary(active);
  const availMonths = S.sbizYear
    ? ds.yms.filter(([ym]) => ym.startsWith(S.sbizYear)).map(([ym, cnt]) => [ym.slice(4, 6), cnt])
    : Array.from({ length: 12 }, (_, idx) => [String(idx + 1).padStart(2, '0'), null]);

  return `
    <div class="toolbar" style="margin-bottom:8px">
      <input id="fSbizQ" class="input" style="flex:1;min-width:170px" value="${esc(S.sbizQ)}" placeholder="상호명 · 건물명 · 도로명 검색 (${esc(active.name)})" />
      <select id="fSbizSgg" class="select">
        <option value="">전체 시군구</option>
        ${sggs.map((g) => `<option value="${esc(g)}" ${S.sbizSgg === g ? 'selected' : ''}>${esc(cleanSbizLabel(g))}</option>`).join('')}
      </select>
      <select id="fSbizL1" class="select">
        <option value="">전체 업종</option>
        ${l1s.map((l) => `<option value="${esc(l)}" ${S.sbizL1 === l ? 'selected' : ''}>${esc(l)}</option>`).join('')}
      </select>
      <select id="fSbizYear" class="select" title="등재 연도 구분">
        <option value="">📅 전체 연도</option>
        ${ds.years.map(([y, cnt]) => `<option value="${y}" ${S.sbizYear === y ? 'selected' : ''}>${y}년 (${fmt(cnt)})</option>`).join('')}
      </select>
      <select id="fSbizMonth" class="select" title="등재 월 구분">
        <option value="">전체 월</option>
        ${availMonths.map(([m, cnt]) => `<option value="${m}" ${S.sbizMonth === m ? 'selected' : ''}>${m}월${cnt !== null ? ` (${fmt(cnt)})` : ''}</option>`).join('')}
      </select>
      <select id="fSbizSort" class="select" title="리스트 정렬">
        <option value="ymDesc" ${S.sbizSort === 'ymDesc' ? 'selected' : ''}>📅 최신 등재순</option>
        <option value="ymAsc" ${S.sbizSort === 'ymAsc' ? 'selected' : ''}>📅 오래된 등재순</option>
        <option value="name" ${S.sbizSort === 'name' ? 'selected' : ''}>🔤 상호명순</option>
      </select>
    </div>
    <div class="toolbar" style="margin-bottom:8px;justify-content:space-between">
      <div class="chips">
        ${[
          ['', '전체 기간'],
          ['recent3m', '🔥 최근 3개월'],
          ['2026', '🆕 2026년'],
          ['2025', '📅 2025년'],
          ['2024', '📅 2024년'],
          ['old', '🏛️ 2022~23'],
        ].map(([k, lb]) => `<button class="chip ${(S.sbizPeriod === k && !S.sbizMonth) ? 'active' : ''}" data-sbiz-period="${k}" type="button">${lb}</button>`).join('')}
      </div>
      <div class="chips">
        <button class="chip ${S.sbizView === 'stores' ? 'active' : ''}" data-sbiz-view="stores">📋 개별 상가 리스트</button>
        <button class="chip ${S.sbizView === 'buildings' ? 'active' : ''}" data-sbiz-view="buildings">🏢 대형상가 건물별</button>
      </div>
    </div>
  `;
}

function applyGisBaseMap() {
  if (!S.leafletMap) return;
  if (S.leafletTile) { S.leafletMap.removeLayer(S.leafletTile); S.leafletTile = null; }
  if (S.leafletHybrid) { S.leafletMap.removeLayer(S.leafletHybrid); S.leafletHybrid = null; }
  const { vworld } = getApiKeys();
  const mode = S.gisBase;
  if (mode === 'osm' || !vworld) {
    S.leafletTile = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(S.leafletMap);
    return;
  }
  const vwTile = (t, ext = 'png', maxN = 19) => L.tileLayer(
    `https://api.vworld.kr/req/wmts/1.0.0/${encodeURIComponent(vworld)}/${t}/{z}/{y}/{x}.${ext}`,
    { maxZoom: 20, maxNativeZoom: maxN, minZoom: 6, attribution: '© VWorld 국토교통부' }
  );
  if (mode === 'vsat' || mode === 'vhyb') {
    S.leafletTile = vwTile('Satellite', 'jpeg', 19).addTo(S.leafletMap);
    if (mode === 'vhyb') {
      S.leafletHybrid = L.tileLayer(`https://api.vworld.kr/req/wmts/1.0.0/${encodeURIComponent(vworld)}/Hybrid/{z}/{y}/{x}.png`, { maxZoom: 20, maxNativeZoom: 19, zIndex: 260 }).addTo(S.leafletMap);
    }
  } else if (mode === 'vwhite') {
    S.leafletTile = vwTile('white', 'png', 18).addTo(S.leafletMap);
  } else if (mode === 'vmidnight') {
    S.leafletTile = vwTile('midnight', 'png', 18).addTo(S.leafletMap);
  } else {
    S.leafletTile = vwTile('Base', 'png', 19).addTo(S.leafletMap);
  }
}

function applyGisOverlays(active) {
  if (!S.leafletMap) return;
  const { vworld } = getApiKeys();
  const isLocal = /^(127\.0\.0\.1|localhost)$/.test(location.hostname);
  const dom = (!isLocal && location.origin && /^https?:/.test(location.origin)) ? location.origin : 'https://heebonpark.github.io';

  for (const [k, cfg] of Object.entries(VWORLD_WMS_CFG)) {
    if (S.gisLayers[k] && vworld) {
      if (!S.leafletWms[k]) {
        S.leafletWms[k] = L.tileLayer.wms('https://api.vworld.kr/req/wms', {
          layers: cfg.layers, styles: cfg.styles, format: 'image/png', transparent: true,
          version: '1.3.0', key: vworld, domain: dom, opacity: cfg.opacity, maxZoom: 20, minZoom: cfg.minZoom, zIndex: 250,
        }).addTo(S.leafletMap);
      }
    } else if (S.leafletWms[k]) {
      S.leafletMap.removeLayer(S.leafletWms[k]);
      delete S.leafletWms[k];
    }
  }

  // Canvas KDE Density Heatmap
  if (S.gisLayers.heat && active) {
    const pts = [];
    const idxs = S.lastSbizMatchedIdx.length ? S.lastSbizMatchedIdx : Array.from({ length: active.n }, (_, i) => i);
    const step = Math.max(1, Math.floor(idxs.length / 4000));
    for (let k = 0; k < idxs.length; k += step) {
      const idx = idxs[k];
      const la = active.lat[idx] / 1e6, lo = active.lon[idx] / 1e6;
      if (la && lo) pts.push([la, lo, (active.strs[idx] || '').slice(6, 10) === '2026' ? 2 : 1]);
    }
    if (!S.leafletHeat) S.leafletHeat = createCanvasHeatLayer(pts).addTo(S.leafletMap);
    else S.leafletHeat.setPoints(pts);
  } else if (S.leafletHeat) {
    S.leafletMap.removeLayer(S.leafletHeat);
    S.leafletHeat = null;
  }
}

function renderMarkerLegend() {
  const el = $('sbizMarkerLegend');
  if (!el) return;
  const mode = S.opts.markerColorMode || 'category';
  if (mode === 'regYear') {
    el.innerHTML = `
      <span class="gis-label">범례(등재연도):</span>
      <span class="ml-item"><span class="ml-dot" style="background:#f59e0b"></span>🆕 2026년</span>
      <span class="ml-item"><span class="ml-dot" style="background:#2563eb"></span>📅 2025년</span>
      <span class="ml-item"><span class="ml-dot" style="background:#059669"></span>📅 2024년</span>
      <span class="ml-item"><span class="ml-dot" style="background:#64748b"></span>🏛️ 2022~23년</span>
      ${S.opts.groupBuildings ? `<span class="ml-item" style="margin-left:auto;color:var(--muted)">숫자배지=최신등재 연도색</span>` : ''}
    `;
  } else if (mode === 'new2026') {
    el.innerHTML = `
      <span class="gis-label">범례(2026신규):</span>
      <span class="ml-item"><span class="ml-dot" style="background:#f59e0b"></span>🆕 2026 신규개업</span>
      <span class="ml-item"><span class="ml-dot" style="background:#10b981"></span>기존 영업 상가</span>
      ${S.opts.groupBuildings ? `<span class="ml-item"><span class="ml-dot" style="background:#4f46e5"></span>숫자 배지 = 동일건물 다중입점 (금테=2026신규 포함)</span>` : ''}
    `;
  } else if (mode === 'density') {
    el.innerHTML = `
      <span class="gis-label">범례(건물밀집):</span>
      <span class="ml-item"><span class="ml-dot" style="background:#10b981"></span>단독(1개)</span>
      <span class="ml-item"><span class="ml-dot" style="background:#3b82f6"></span>소형상가(2~4개)</span>
      <span class="ml-item"><span class="ml-dot" style="background:#8b5cf6"></span>중형빌딩(5~14개)</span>
      <span class="ml-item"><span class="ml-dot" style="background:#e11d48"></span>대형상가(15개+)</span>
    `;
  } else {
    el.innerHTML = `
      <span class="gis-label">범례(업종8색):</span>
      ${Object.entries(SBIZ_L1_COLORS).slice(0, 8).map(([nm, c]) => `<span class="ml-item"><span class="ml-dot" style="background:${c}"></span>${nm}</span>`).join('')}
      ${S.opts.groupBuildings ? `<span class="ml-item" style="margin-left:auto;color:var(--muted)">숫자배지=동일건물 다중입점 · 금테=2026신규</span>` : ''}
    `;
  }
}

function initSbizLeaflet(active) {
  const el = $('sbizMap');
  if (!el || typeof L === 'undefined') return;
  const sInfo = (S.core.sbizSummary.sidos || []).find((x) => x.slug === S.sbizActiveSlug);
  const lat = sInfo?.lat || 37.4925;
  const lon = sInfo?.lon || 126.7239;
  S.leafletWms = {};
  S.leafletHeat = null;
  S.leafletMap = L.map(el, { preferCanvas: true }).setView([lat, lon], active ? 13 : 12);
  applyGisBaseMap();
  S.leafletLayer = L.layerGroup().addTo(S.leafletMap);
  S.leafletCatchLayer = L.layerGroup().addTo(S.leafletMap);
  S.leafletRulerLayer = L.layerGroup().addTo(S.leafletMap);
  applyGisOverlays(active);

  // Viewport-aware dynamic marker redraw (+ optional live list sync!) on pan/zoom
  let mvTimer = null;
  S.leafletMap.on('moveend zoomend', () => {
    clearTimeout(mvTimer);
    mvTimer = setTimeout(() => {
      const curActive = S.sbizActiveSlug ? S.sbizCache.get(S.sbizActiveSlug) : null;
      if (curActive && S.lastSbizMatchedIdx.length) {
        renderViewportSbizMarkers(curActive);
        if (S.sbizViewportSync) { S.sbizPage = 1; renderSbizListPanel(curActive); }
      }
    }, 120);
  });

  // Interactive Map Click -> 2-Point Distance Ruler OR Instant Radius Catchment Analysis!
  S.leafletMap.on('click', (e) => {
    if (S._justClickedMarker) { S._justClickedMarker = false; return; }
    if (S.gisRulerMode) {
      S.rulerPts.push([e.latlng.lat, e.latlng.lng]);
      if (S.rulerPts.length > 2) { S.rulerPts = [S.rulerPts[2]]; S.leafletRulerLayer.clearLayers(); }
      L.circleMarker([e.latlng.lat, e.latlng.lng], { radius: 6, color: '#fff', fillColor: '#4f46e5', fillOpacity: 1, weight: 2 }).addTo(S.leafletRulerLayer);
      if (S.rulerPts.length === 2) {
        const [p1, p2] = S.rulerPts;
        const dist = haversineM(p1[0], p1[1], p2[0], p2[1]);
        const walkMin = Math.max(1, Math.round(dist / 70));
        const lbl = dist >= 1000 ? `${(dist / 1000).toFixed(2)}km (도보 약 ${walkMin}분)` : `${Math.round(dist)}m (도보 약 ${walkMin}분)`;
        L.polyline([p1, p2], { color: '#4f46e5', weight: 3, dashArray: '6 4' }).addTo(S.leafletRulerLayer);
        L.popup({ closeButton: true }).setLatLng([(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2])
          .setContent(`<div style="font-weight:800;font-size:13px">📏 직선거리: ${lbl}</div>`)
          .openOn(S.leafletMap);
        toast(`📏 측정 완료: ${lbl}`);
      }
      return;
    }
    const curActive = S.sbizActiveSlug ? S.sbizCache.get(S.sbizActiveSlug) : null;
    runRadiusCatchment(e.latlng.lat, e.latlng.lng, curActive);
  });
}

function buildSingleStorePopup(st) {
  const displayName = `${st.name}${st.branch ? ' ' + st.branch : ''}`.trim() || '(상호 미기재)';
  const catColor = sbizCategoryColor(st.l1);
  const pitch = getStoreB2bPitch(st.l1, st.l3, st.isNew2026);
  const bldLine = [st.bld, st.floor, st.ho ? `${st.ho}호` : ''].filter(Boolean).join(' · ');
  const naverUrl = `https://map.naver.com/p/search/${encodeURIComponent(`${st.sgg} ${st.name}`)}`;
  return `
    <div style="min-width:255px;max-width:300px;line-height:1.45;font-size:12px">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;margin-bottom:4px">
        <b style="font-size:14px;color:#0f172a">${esc(displayName)}</b>
        ${st.ageLabel ? `<span style="padding:1px 6px;border-radius:5px;font-size:10.5px;font-weight:800;white-space:nowrap;background:${st.isNew2026 ? '#fef3c7;color:#b45309' : '#f1f5f9;color:#475569'}">${esc(st.ageLabel)}</span>` : ''}
      </div>
      <div style="font-size:11.5px;font-weight:700;color:${catColor};margin-bottom:3px">
        ${esc(st.l1)} &gt; ${esc(st.l2)} &gt; ${esc(st.l3)}
      </div>
      ${st.ksic ? `<div style="font-size:11px;color:#64748b">표준산업(KSIC): <b>${esc(st.ksic)}</b>${st.regYm ? ` · 등재 ${esc(st.regYm)}` : ''}</div>` : ''}
      <div style="margin-top:5px;padding-top:5px;border-top:1px solid #e2e8f0;color:#334155;font-size:11.5px">
        <div>📍 <b>${esc(st.addr)}</b></div>
        ${bldLine ? `<div style="color:#475569">🏢 ${esc(bldLine)}${st.zip ? ` (우편 ${esc(st.zip)})` : ''}</div>` : (st.zip ? `<div style="color:#64748b">📮 우편번호 ${esc(st.zip)}</div>` : '')}
        ${st.jibun ? `<div style="color:#64748b;font-size:11px">지번: ${esc(st.jibun)}</div>` : ''}
      </div>
      <div class="nx-pitch-box">💡 <b>영업 포인트:</b> ${esc(pitch)}</div>
      <div style="display:flex;flex-wrap:wrap;gap:5px;margin-top:8px">
        <button type="button" onclick="window._nxPipeStore('${esc(st.id)}','${esc(displayName)}','${esc(st.l1 + '·' + st.l3)}','${esc(st.addr)}')" style="padding:4px 8px;border:none;border-radius:6px;background:#4f46e5;color:#fff;font-size:11px;font-weight:700;cursor:pointer">💼 CRM 담기</button>
        <button type="button" onclick="window._nxCatchHere(${st.lat},${st.lon},'${esc(displayName)}')" style="padding:4px 8px;border:1px solid #059669;border-radius:6px;background:#ecfdf5;color:#047857;font-size:11px;font-weight:700;cursor:pointer">🎯 반경·공시지가</button>
        <a href="${naverUrl}" target="_blank" rel="noopener" style="padding:4px 8px;border:1px solid #cbd5e1;border-radius:6px;background:#fff;color:#0f172a;font-size:11px;font-weight:700;text-decoration:none">🧭 네이버지도</a>
      </div>
    </div>
  `;
}

function buildMultiTenantPopup(group) {
  const first = group.stores[0];
  const bldTitle = group.bldName || first.addr;
  const newCnt = group.newCnt;
  const l1Cnts = new Map();
  for (const s of group.stores) l1Cnts.set(s.l1 || '기타', (l1Cnts.get(s.l1 || '기타') || 0) + 1);
  const topCats = [...l1Cnts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
  const naverUrl = `https://map.naver.com/p/search/${encodeURIComponent(first.addr)}`;
  // Sort 2026 new openings to top
  const sorted = [...group.stores].sort((a, b) => (b.isNew2026 ? 1 : 0) - (a.isNew2026 ? 1 : 0));

  return `
    <div style="min-width:270px;max-width:320px;line-height:1.4;font-size:12px">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;margin-bottom:3px">
        <b style="font-size:13.5px;color:#0f172a">🏢 ${esc(bldTitle)}</b>
        <span style="padding:2px 7px;border-radius:999px;background:#4f46e5;color:#fff;font-size:11px;font-weight:800;white-space:nowrap">${fmt(group.stores.length)}개 입점</span>
      </div>
      <div style="font-size:11px;color:#475569">📍 ${esc(first.addr)}${first.zip ? ` (${esc(first.zip)})` : ''}</div>
      <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:5px">
        ${newCnt ? `<span style="padding:1px 6px;border-radius:5px;background:#fef3c7;color:#b45309;font-size:10.5px;font-weight:800">🆕 2026 신규 ${newCnt}개</span>` : ''}
        ${topCats.map(([nm, c]) => `<span style="padding:1px 6px;border-radius:5px;background:#f1f5f9;color:${sbizCategoryColor(nm)};font-size:10.5px;font-weight:700">${esc(nm)} ${c}</span>`).join('')}
      </div>
      <div class="nx-pop-list">
        ${sorted.slice(0, 40).map((st) => {
          const dn = `${st.name}${st.branch ? ' ' + st.branch : ''}`.trim() || '(상호 미기재)';
          const fl = [st.floor, st.ho ? `${st.ho}호` : ''].filter(Boolean).join(' ');
          return `<div class="nx-pop-row">
            <div style="min-width:0">
              <div style="font-weight:700;font-size:11.5px;color:#0f172a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
                ${st.isNew2026 ? '<span style="color:#d97706">🆕</span> ' : ''}${esc(dn)}
              </div>
              <div style="font-size:10.5px;color:#64748b">${esc(st.l1)}·${esc(st.l3)}${fl ? ` · ${esc(fl)}` : ''}${st.regYm ? ` · ${esc(st.regYm)}` : ''}</div>
            </div>
            <button type="button" onclick="window._nxPipeStore('${esc(st.id)}','${esc(dn)}','${esc(st.l1 + '·' + st.l3)}','${esc(st.addr)}')" style="padding:2px 6px;border:1px solid #cbd5e1;border-radius:5px;background:#fff;color:#4f46e5;font-size:10.5px;font-weight:800;cursor:pointer;flex-shrink:0">+CRM</button>
          </div>`;
        }).join('')}
        ${sorted.length > 40 ? `<div style="text-align:center;font-size:10.5px;color:#64748b;padding:4px">외 ${sorted.length - 40}개 입점 (반경 리드팩 CSV로 전체 추출 가능)</div>` : ''}
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:5px;margin-top:6px">
        <button type="button" onclick="window._nxPipeStore('bld:${esc(bldTitle)}','[다중건물] ${esc(bldTitle)}','총 ${group.stores.length}개 입점 (신규 ${newCnt})','${esc(first.addr)}')" style="padding:4px 8px;border:none;border-radius:6px;background:#4f46e5;color:#fff;font-size:11px;font-weight:700;cursor:pointer">💼 건물 CRM</button>
        <button type="button" onclick="window._nxCatchHere(${group.lat},${group.lon},'${esc(bldTitle)}')" style="padding:4px 8px;border:1px solid #059669;border-radius:6px;background:#ecfdf5;color:#047857;font-size:11px;font-weight:700;cursor:pointer">🎯 반경·공시지가</button>
        <a href="${naverUrl}" target="_blank" rel="noopener" style="padding:4px 8px;border:1px solid #cbd5e1;border-radius:6px;background:#fff;color:#0f172a;font-size:11px;font-weight:700;text-decoration:none">🧭 네이버</a>
      </div>
    </div>
  `;
}

function renderViewportSbizMarkers(active) {
  if (!S.leafletMap || !S.leafletLayer || !active) return;
  S.leafletLayer.clearLayers();
  const bounds = S.leafletMap.getBounds().pad(0.08);
  const minLa = Math.floor(bounds.getSouth() * 1e6);
  const maxLa = Math.ceil(bounds.getNorth() * 1e6);
  const minLo = Math.floor(bounds.getWest() * 1e6);
  const maxLo = Math.ceil(bounds.getEast() * 1e6);

  const inView = [];
  for (let k = 0; k < S.lastSbizMatchedIdx.length; k++) {
    const idx = S.lastSbizMatchedIdx[k];
    const la = active.lat[idx], lo = active.lon[idx];
    if (la >= minLa && la <= maxLa && lo >= minLo && lo <= maxLo) inView.push(idx);
  }
  S.sbizInViewIdx = inView;

  const cap = S.opts.markerCap || 1500;
  const zoom = S.leafletMap.getZoom();
  const mode = S.opts.markerColorMode || 'category';
  const showLbl = S.opts.showStoreLabels && zoom >= 16;

  // Smart Same-Coordinate Building Grouping (solves 171-store stacking at 1 building!)
  if (S.opts.groupBuildings) {
    const groups = new Map();
    const scanStep = inView.length > 18000 ? Math.ceil(inView.length / 18000) : 1;
    for (let k = 0; k < inView.length; k += scanStep) {
      const idx = inView[k];
      const ck = `${active.lat[idx]},${active.lon[idx]}`;
      let g = groups.get(ck);
      if (!g) {
        g = { lat: active.lat[idx] / 1e6, lon: active.lon[idx] / 1e6, stores: [], newCnt: 0, bldName: '', maxYm: '' };
        groups.set(ck, g);
      }
      const st = parseSbizStore(active, idx);
      g.stores.push(st);
      if (st.isNew2026) g.newCnt++;
      if (st.regYm && st.regYm > g.maxYm) g.maxYm = st.regYm;
      if (!g.bldName && st.bld) g.bldName = st.bld;
    }

    const gArr = [...groups.values()].sort((a, b) => b.stores.length - a.stores.length);
    const drawLimit = Math.min(gArr.length, cap);
    const baseRad = zoom >= 16 ? 6.5 : zoom >= 14 ? 5.5 : 4.5;

    for (let k = 0; k < drawLimit; k++) {
      const g = gArr[k];
      if (!g.lat || !g.lon) continue;

      if (g.stores.length === 1) {
        const st = g.stores[0];
        const dn = `${st.name}${st.branch ? ' ' + st.branch : ''}`.trim() || '(상호 미기재)';
        let fillColor = sbizCategoryColor(st.l1);
        if (mode === 'regYear') fillColor = regYearColor(st.regYm);
        else if (mode === 'new2026') fillColor = st.isNew2026 ? '#f59e0b' : '#10b981';
        else if (mode === 'density') fillColor = '#10b981';
        const mk = L.circleMarker([g.lat, g.lon], {
          radius: st.isNew2026 ? baseRad + 1.5 : baseRad,
          color: st.isNew2026 ? '#f59e0b' : '#ffffff',
          fillColor,
          fillOpacity: 0.92,
          weight: st.isNew2026 ? 2.2 : 1.5,
        });
        mk.bindTooltip(`${esc(dn)} · ${esc(st.l3 || st.l1)}${st.regYm ? ` · 📅${esc(st.regYm)}` : ''}`, {
          direction: 'top', offset: [0, -6], permanent: showLbl && k < 60, className: showLbl ? 'nx-store-label' : '',
        });
        mk.bindPopup(() => buildSingleStorePopup(st), { maxWidth: 320 });
        mk.on('click', (ev) => { S._justClickedMarker = true; L.DomEvent.stopPropagation(ev); });
        mk.addTo(S.leafletLayer);
      } else {
        const cnt = g.stores.length;
        const size = cnt >= 30 ? 32 : cnt >= 10 ? 27 : cnt >= 5 ? 24 : 21;
        let bg = '#4f46e5';
        if (mode === 'regYear') bg = regYearColor(g.maxYm);
        else if (mode === 'density') bg = cnt >= 15 ? '#e11d48' : cnt >= 5 ? '#8b5cf6' : '#3b82f6';
        else if (mode === 'new2026') bg = g.newCnt > 0 ? '#d97706' : '#059669';
        else bg = sbizCategoryColor(g.stores[0].l1);
        const icon = L.divIcon({
          className: '',
          html: `<div class="nx-bld-pin ${g.newCnt > 0 ? 'has-new' : ''}" style="width:${size}px;height:${size}px;background:${bg}">${cnt > 99 ? '99+' : cnt}</div>`,
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        });
        const mk = L.marker([g.lat, g.lon], { icon });
        const tipLbl = `🏢 ${esc(g.bldName || g.stores[0].name)} · ${cnt}개 입점${g.maxYm ? ` · 최근 ${esc(g.maxYm)}` : ''}${g.newCnt ? ` (🆕2026 ${g.newCnt})` : ''}`;
        mk.bindTooltip(tipLbl, { direction: 'top', offset: [0, -size / 2], permanent: showLbl && k < 45, className: showLbl ? 'nx-store-label' : '' });
        mk.bindPopup(() => buildMultiTenantPopup(g), { maxWidth: 330 });
        mk.on('click', (ev) => { S._justClickedMarker = true; L.DomEvent.stopPropagation(ev); });
        mk.addTo(S.leafletLayer);
      }
    }

    const statEl = $('sbizViewportStat');
    if (statEl) {
      statEl.textContent = `화면 내 ${fmt(inView.length)}개 → ${fmt(drawLimit)}개 마커 (줌 ${zoom})`;
    }
    return;
  }

  // Non-grouped individual markers mode
  const step = Math.max(1, Math.floor(inView.length / cap));
  const baseRad = zoom >= 16 ? 6.5 : zoom >= 14 ? 5.5 : 4.5;
  for (let k = 0; k < inView.length; k += step) {
    const st = parseSbizStore(active, inView[k]);
    if (!st.lat || !st.lon) continue;
    const dn = `${st.name}${st.branch ? ' ' + st.branch : ''}`.trim() || '(상호 미기재)';
    const fillColor = mode === 'regYear' ? regYearColor(st.regYm) : (mode === 'new2026' ? (st.isNew2026 ? '#f59e0b' : '#10b981') : sbizCategoryColor(st.l1));
    const mk = L.circleMarker([st.lat, st.lon], {
      radius: st.isNew2026 ? baseRad + 1.5 : baseRad,
      color: '#ffffff', fillColor, fillOpacity: 0.92, weight: 1.5,
    });
    mk.bindTooltip(`${esc(dn)} · ${esc(st.l3 || st.l1)}${st.regYm ? ` · 📅${esc(st.regYm)}` : ''}`, { direction: 'top', offset: [0, -6] });
    mk.bindPopup(() => buildSingleStorePopup(st), { maxWidth: 320 });
    mk.on('click', (ev) => { S._justClickedMarker = true; L.DomEvent.stopPropagation(ev); });
    mk.addTo(S.leafletLayer);
  }
  const statEl = $('sbizViewportStat');
  if (statEl) {
    statEl.textContent = `화면 내 ${fmt(inView.length)}개 중 ${fmt(Math.min(inView.length, Math.ceil(inView.length / step)))}개 마커 (줌 ${zoom})`;
  }
}

async function runRadiusCatchment(lat, lon, active, label = '') {
  if (!S.leafletMap || !S.leafletCatchLayer) return;
  const rad = S.gisRadius;
  S.leafletCatchLayer.clearLayers();
  L.circle([lat, lon], { radius: rad, color: '#059669', fillColor: '#10b981', fillOpacity: 0.14, weight: 2, dashArray: '5 4' }).addTo(S.leafletCatchLayer);
  L.circleMarker([lat, lon], { radius: 7, color: '#fff', fillColor: '#e11d48', fillOpacity: 1, weight: 2.5 }).addTo(S.leafletCatchLayer);

  const stores = [];
  const l1Map = new Map();
  const bldSet = new Set();
  let new2026 = 0;

  if (active) {
    // Fast bounding-box pre-filter before Haversine
    const dLat = rad / 111000;
    const dLon = rad / (111000 * Math.cos(lat * Math.PI / 180));
    const minLa = (lat - dLat) * 1e6, maxLa = (lat + dLat) * 1e6;
    const minLo = (lon - dLon) * 1e6, maxLo = (lon + dLon) * 1e6;
    for (let i = 0; i < active.n; i++) {
      const laI = active.lat[i], loI = active.lon[i];
      if (laI < minLa || laI > maxLa || loI < minLo || loI > maxLo) continue;
      if (haversineM(lat, lon, laI / 1e6, loI / 1e6) <= rad) {
        const st = parseSbizStore(active, i);
        stores.push(st);
        if (st.isNew2026) new2026++;
        if (st.bldId) bldSet.add(st.bldId);
        l1Map.set(st.l1 || '기타', (l1Map.get(st.l1 || '기타') || 0) + 1);
      }
    }
  }

  let hhi = 0;
  if (stores.length) {
    for (const c of l1Map.values()) {
      const sh = (c / stores.length) * 100;
      hhi += sh * sh;
    }
    hhi = Math.round(hhi);
  }
  const topL1 = [...l1Map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  const newRate = stores.length ? Math.round((new2026 / stores.length) * 1000) / 10 : 0;

  S.catchment = {
    lat, lon, radius: rad, label, stores,
    stats: { cnt: stores.length, new2026, newRate, bldCnt: bldSet.size, hhi, topL1 },
    vworld: null,
  };
  renderCatchmentHud();

  try {
    S.catchment.vworld = await queryVworldPoint(lon.toFixed(6), lat.toFixed(6));
    renderCatchmentHud();
  } catch {}
}

function renderCatchmentHud() {
  const box = $('sbizCatchmentBox');
  if (!box || !S.catchment) return;
  const { lat, lon, radius, label, stores, stats, vworld } = S.catchment;
  const maxBar = Math.max(1, ...(stats.topL1 || []).map(([, c]) => c));
  const areaKm2 = (Math.PI * (radius / 1000) ** 2);
  const density = areaKm2 > 0 ? Math.round(stats.cnt / areaKm2) : 0;
  const p = BIZ_PERSONAS[S.opts.bizPersona] || BIZ_PERSONAS.security;
  const estCatchMan = Math.round((stats.new2026 * p.storeDealMan * 0.25) + (stats.cnt * p.storeDealMan * 0.03));
  const locGrade = (stats.cnt >= 250 || stats.new2026 >= 25) ? 'S등급 초핵심 상권' : (stats.cnt >= 80 || stats.new2026 >= 8) ? 'A등급 유망 상권' : (stats.cnt >= 20 ? 'B등급 생활권 상권' : 'C등급 초기·저밀도');
  const topCatTxt = (stats.topL1 || []).slice(0, 2).map(([nm, c]) => `${nm}(${Math.round(c / Math.max(1, stats.cnt) * 100)}%)`).join(' · ') || '분석 중';
  const catchComment = stats.cnt > 0
    ? `<b>${locGrade}</b> — 반경 내 총 <b>${fmt(stats.cnt)}개 상가(${fmt(stats.bldCnt)}동)</b> 중 2026 신규개업 <b>+${fmt(stats.new2026)}개(신규율 ${stats.newRate}%)</b>가 포착되었습니다. 핵심 업종은 <b>${esc(topCatTxt)}</b>이며, <b>${esc(p.short)}</b> 기준 추정 단기 영업가치는 약 <b>${fmtDec(estCatchMan / 10000, 2)}억원</b>입니다. ${stats.hhi >= 2500 ? '특정 업종 집중도(HHI)가 높아 핵심 업종 전용 패키지 영업이 유리합니다.' : '다각화된 복합 상권으로 다중입점 대형건물(숫자 배지)부터 순회 방문을 권장합니다.'}`
    : '해당 시도를 상단에서 불러오시면 반경 내 정확한 상업적 영업기회·추정 매출·신규개업 코멘트가 자동 산출됩니다.';

  box.innerHTML = `
    <div class="catchment-card">
      <div class="card-head" style="margin-bottom:8px">
        <div>
          <h3 class="card-title">🎯 반경 ${radius >= 1000 ? `${radius / 1000}km` : `${radius}m`} 상권 정밀 진단 <span class="tag tag-corp">${locGrade}</span> ${label ? `(${esc(label)})` : ''}</h3>
          <p class="card-sub">
            ${vworld ? `📍 <b>${esc(vworld.addr)}</b> · 용도지역 <b>${esc(vworld.zoning)}</b> · 공시지가 <b>${esc(vworld.jiga)}</b>${vworld.pyeongMan ? ` (평당 약 ${fmt(vworld.pyeongMan)}만원)` : ''}` : `📍 좌표 (${lat.toFixed(5)}, ${lon.toFixed(5)}) · 브이월드 필지·공시지가 조회 중…`}
          </p>
        </div>
        <div style="display:flex;gap:5px;flex-wrap:wrap">
          <button id="btnCatchReport" class="btn btn-sm btn-primary" type="button">📄 반경 리포트 (PDF)</button>
          ${stores.length ? `<button id="btnCatchCsv" class="btn btn-sm btn-emerald" type="button">📥 리드팩 CSV (${fmt(stores.length)})</button>` : ''}
          <button id="btnCatchPipe" class="btn btn-sm" type="button">💼 CRM 담기</button>
        </div>
      </div>

      <div class="comm-comment-box" style="margin-bottom:10px">${catchComment}</div>

      <div class="quant-strip" style="margin-bottom:8px">
        <div class="quant-box"><div class="q-lbl">반경 내 상가 (밀도)</div><div class="q-val" style="color:var(--c-sbiz)">${fmt(stats.cnt)}개</div><div class="q-sub">${fmt(density)}개/㎢ · ${fmt(stats.bldCnt)}동</div></div>
        <div class="quant-box"><div class="q-lbl">🆕 2026 신규개업</div><div class="q-val" style="color:var(--c-bid)">+${fmt(stats.new2026)}개</div><div class="q-sub">신규율 ${stats.newRate}%</div></div>
        <div class="quant-box"><div class="q-lbl">📊 업종 HHI 집중도</div><div class="q-val">${fmt(stats.hhi)}</div><div class="q-sub">${stats.hhi < 1800 ? '다각화 상권' : stats.hhi < 2800 ? '적정 집중' : '특정업종 과밀'}</div></div>
        <div class="quant-box"><div class="q-lbl">💰 추정 평당 공시지가</div><div class="q-val" style="color:var(--c-corp)">${vworld?.pyeongMan ? `${fmt(vworld.pyeongMan)}만` : '-'}</div><div class="q-sub">${esc(vworld?.zoning || '조회 중')}</div></div>
      </div>

      ${stats.topL1.length ? `
        <div style="margin-top:6px">
          ${stats.topL1.map(([nm, cnt]) => `
            <div class="bar-row">
              <span style="width:92px;font-weight:700">${esc(nm)}</span>
              <div class="bar-track"><div class="bar-fill" style="width:${Math.round(cnt / maxBar * 100)}%"></div></div>
              <span style="width:76px;text-align:right;font-weight:700">${fmt(cnt)}개 (${Math.round(cnt / stats.cnt * 100)}%)</span>
            </div>`).join('')}
        </div>
      ` : '<div style="font-size:12px;color:var(--muted)">상단에서 해당 시도를 로드하면 반경 내 정확한 상가·신규개업·HHI 분석이 표시됩니다.</div>'}
    </div>
  `;

  $('btnCatchReport')?.addEventListener('click', () => {
    const today = new Date().toISOString().slice(0, 10);
    const newStores = stores.filter((s) => s.isNew2026).slice(0, 12);
    $('reportModalTitle').textContent = `📄 [반경 ${radius}m 상권 영업기회 리포트] ${vworld?.addr || label || ''}`;
    $('reportPaper').innerHTML = `
      <div class="rep-banner">
        <div>
          <div style="font-size:11px;font-weight:700;color:#6ee7b7;letter-spacing:0.05em">NEXUS ONE PRO · MICRO-CATCHMENT REPORT</div>
          <h2>${esc(vworld?.addr || label || `${lat.toFixed(5)}, ${lon.toFixed(5)}`)} (반경 ${radius}m)</h2>
          <p>적용 업종: ${esc(p.label)} · 기준일: ${today} · 용도지역: ${esc(vworld?.zoning || '-')} · 공시지가: ${esc(vworld?.jiga || '-')}</p>
        </div>
        <div style="text-align:right">
          <div style="font-size:11px;color:#cbd5e1">반경 상권 등급</div>
          <div style="font-size:20px;font-weight:900;color:#fde68a">${esc(locGrade)}</div>
          <div style="font-size:11.5px;color:#a7f3d0">추정 가치 ${fmtDec(estCatchMan / 10000, 2)}억원</div>
        </div>
      </div>
      <div class="rep-grid-4">
        <div class="quant-box"><div class="q-lbl">총 입점 상가</div><div class="q-val" style="color:var(--c-sbiz)">${fmt(stats.cnt)}개</div><div class="q-sub">${fmt(density)}개/㎢ · ${fmt(stats.bldCnt)}동</div></div>
        <div class="quant-box"><div class="q-lbl">🆕 2026 신규개업</div><div class="q-val" style="color:var(--c-bid)">+${fmt(stats.new2026)}개</div><div class="q-sub">신규율 ${stats.newRate}%</div></div>
        <div class="quant-box"><div class="q-lbl">📊 업종 HHI</div><div class="q-val">${fmt(stats.hhi)}</div><div class="q-sub">${stats.hhi < 1800 ? '다각화' : stats.hhi < 2800 ? '적정 집중' : '과밀'}</div></div>
        <div class="quant-box"><div class="q-lbl">💰 평당 공시지가</div><div class="q-val" style="color:var(--c-corp)">${vworld?.pyeongMan ? `${fmt(vworld.pyeongMan)}만` : '-'}</div><div class="q-sub">${esc(vworld?.zoning || '-')}</div></div>
      </div>
      <div class="rep-sec">
        <h4><span>1. 상업적 영업기회 분석 코멘트</span></h4>
        <div class="comm-comment-box">${catchComment}</div>
        <div class="comm-talk"><b>💡 추천 제안 패키지:</b> ${esc(p.hook)}</div>
      </div>
      <div class="rep-sec">
        <h4><span>2. 반경 내 🆕 2026 신규개업 우선 방문 리스트 (${newStores.length}개 샘플)</span></h4>
        ${newStores.length ? `<div class="table-wrap"><table class="data-table"><thead><tr><th>상호명</th><th>업종</th><th>층/건물</th><th>도로명주소</th><th>등재</th></tr></thead><tbody>
          ${newStores.map((st) => `<tr><td><b>${esc(st.name)}</b> ${esc(st.branch)}</td><td>${esc(st.l1)}·${esc(st.l3)}</td><td>${esc([st.bld, st.floor].filter(Boolean).join(' ') || '-')}</td><td>${esc(st.addr)}</td><td>${esc(st.regYm)}</td></tr>`).join('')}
        </tbody></table></div>` : '<div style="font-size:12px;color:var(--muted)">반경 내 2026 신규개업 데이터가 없습니다.</div>'}
      </div>
    `;
    $('reportFoot').innerHTML = `
      <button id="btnCatchRepPrint" class="btn btn-primary btn-sm" type="button">🖨️ PDF 저장 / 인쇄</button>
      <button id="btnCatchRepCopy" class="btn btn-emerald btn-sm" type="button">📋 리포트 텍스트 복사</button>
    `;
    $('reportBackdrop').classList.remove('hidden');
    $('btnCatchRepPrint').addEventListener('click', () => window.print());
    $('btnCatchRepCopy').addEventListener('click', () => {
      const txt = `[반경 ${radius}m 상권 리포트] ${vworld?.addr || label || ''}\n• 등급: ${locGrade} · 상가 ${fmt(stats.cnt)}개(${fmt(stats.bldCnt)}동) · 2026신규 +${stats.new2026}개(${stats.newRate}%)\n• HHI: ${stats.hhi} · 용도지역: ${vworld?.zoning || '-'} · 공시지가: ${vworld?.jiga || '-'}\n• 추정 영업가치(${p.short}): ${fmtDec(estCatchMan / 10000, 2)}억원`;
      navigator.clipboard?.writeText(txt).then(() => toast('📋 반경 리포트가 복사되었습니다!'));
    });
  });

  $('btnCatchCsv')?.addEventListener('click', () => {
    downloadCsv(
      `nexusone_catchment_${radius}m_${new Date().toISOString().slice(0, 10)}.csv`,
      ['상호명', '지점명', '업종대분류', '업종소분류', '시군구', '행정동', '도로명주소', '건물명', '2026신규', '위도', '경도'],
      stores.map((st) => [st.name, st.branch, st.l1, st.l3, st.sgg, st.dong, st.road || st.jibun, st.bld, st.isNew2026 ? 'Y' : 'N', st.lat, st.lon])
    );
    toast(`📥 반경 ${radius}m 상가 리드팩 ${fmt(stores.length)}건 CSV 추출 완료!`);
  });
  $('btnCatchPipe')?.addEventListener('click', () => {
    addToPipeline({
      id: `catch:${lat.toFixed(4)},${lon.toFixed(4)},${radius}`,
      domain: 'sbiz',
      title: `[반경 ${radius}m] ${vworld?.addr || label || `${lat.toFixed(4)},${lon.toFixed(4)}`}`,
      sub: `상가 ${fmt(stats.cnt)}개 · 2026신규 +${stats.new2026} · HHI ${stats.hhi}`,
      region: vworld?.addr || '',
      valueMan: 0,
    });
  });
}

function plotLiveSbizMarkers(items) {
  if (!S.leafletMap || !S.leafletLayer) return;
  items.forEach((it) => {
    const lat = Number(it.lat), lon = Number(it.lon);
    if (!lat || !lon) return;
    L.circleMarker([lat, lon], { radius: 6, color: '#e11d48', fillColor: '#fb7185', fillOpacity: 0.85, weight: 1.5 })
      .bindPopup(`<b>${esc(it.bizesNm)}</b> ${esc(it.brchNm || '')}<br/><small>${esc(it.indsLclsNm)} &gt; ${esc(it.indsSclsNm)}</small><br/><small>${esc(it.rdnmAdr || it.lnoAdr || '')}</small>`)
      .addTo(S.leafletLayer);
  });
}

function wireSbizFilters(active) {
  let t = null;
  $('fSbizQ')?.addEventListener('input', (e) => { clearTimeout(t); t = setTimeout(() => { S.sbizQ = e.target.value; S.sbizPage = 1; updateSbizView(active); }, 220); });
  $('fSbizSgg')?.addEventListener('change', (e) => { S.sbizSgg = e.target.value; S.sbizPage = 1; updateSbizView(active); });
  $('fSbizL1')?.addEventListener('change', (e) => { S.sbizL1 = e.target.value; S.sbizPage = 1; updateSbizView(active); });
  $('fSbizYear')?.addEventListener('change', (e) => {
    S.sbizYear = e.target.value;
    S.sbizPeriod = S.sbizYear === '2026' ? '2026' : S.sbizYear === '2025' ? '2025' : S.sbizYear === '2024' ? '2024' : '';
    S.sbizPage = 1;
    renderSbizTab();
  });
  $('fSbizMonth')?.addEventListener('change', (e) => {
    S.sbizMonth = e.target.value;
    S.sbizPage = 1;
    updateSbizView(active);
  });
  $('fSbizSort')?.addEventListener('change', (e) => {
    S.sbizSort = e.target.value;
    S.sbizPage = 1;
    updateSbizView(active);
  });
  document.querySelectorAll('[data-sbiz-period]').forEach((b) => {
    b.addEventListener('click', () => {
      const p = b.dataset.sbizPeriod;
      S.sbizPeriod = p;
      S.sbizMonth = '';
      S.sbizYear = (p === '2026' || p === '2025' || p === '2024') ? p : '';
      S.sbizPage = 1;
      renderSbizTab();
    });
  });
  document.querySelectorAll('[data-sbiz-view]').forEach((b) => {
    b.addEventListener('click', () => {
      S.sbizView = b.dataset.sbizView;
      document.querySelectorAll('[data-sbiz-view]').forEach((x) => x.classList.toggle('active', x.dataset.sbizView === S.sbizView));
      renderSbizListPanel(active);
    });
  });
}

function renderSbizYmTimeline(active, baseMatchedNoDate) {
  const el = $('sbizYmTimeline');
  if (!el) return;
  const ymMap = new Map();
  for (let k = 0; k < baseMatchedNoDate.length; k++) {
    const ym = String(active.strs[baseMatchedNoDate[k]] || '').slice(6, 12);
    if (/^\d{6}$/.test(ym)) ymMap.set(ym, (ymMap.get(ym) || 0) + 1);
  }
  const bars = [...ymMap.entries()].sort((a, b) => b[0].localeCompare(a[0])).slice(0, 18).reverse();
  if (!bars.length) { el.innerHTML = ''; return; }
  const maxC = Math.max(1, ...bars.map(([, c]) => c));
  const curSelYm = (S.sbizYear && S.sbizMonth) ? `${S.sbizYear}${S.sbizMonth}` : '';

  el.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;font-size:11.5px;margin-bottom:4px;padding:0 2px">
      <span><b>📈 월별 등재(개업) 추이</b> <span style="color:var(--muted)">(막대 클릭 시 해당 년·월 즉시 필터)</span></span>
      ${curSelYm ? `<button id="btnClearYmBar" class="btn btn-sm" style="padding:2px 7px;font-size:11px" type="button">✕ ${curSelYm.slice(0, 4)}.${curSelYm.slice(4, 6)} 해제</button>` : `<span style="color:var(--muted)">최근 ${bars.length}개월</span>`}
    </div>
    <div class="ym-timeline">
      ${bars.map(([ym, cnt]) => {
        const h = Math.max(6, Math.round((cnt / maxC) * 38));
        const isAct = curSelYm === ym;
        const is26 = ym.startsWith('2026');
        return `<div class="ym-col ${is26 ? 'is2026' : ''} ${isAct ? 'active' : ''}" data-pick-ym="${ym}" title="${ym.slice(0, 4)}년 ${ym.slice(4, 6)}월 등재: ${fmt(cnt)}개">
          <div class="ym-cnt">${cnt >= 1000 ? (cnt / 1000).toFixed(1) + 'k' : cnt}</div>
          <div class="ym-bar" style="height:${h}px"></div>
          <div class="ym-lbl">${ym.slice(2, 4)}.${ym.slice(4, 6)}</div>
        </div>`;
      }).join('')}
    </div>
  `;

  el.querySelectorAll('[data-pick-ym]').forEach((col) => {
    col.addEventListener('click', () => {
      const ym = col.dataset.pickYm;
      const y = ym.slice(0, 4), m = ym.slice(4, 6);
      if (S.sbizYear === y && S.sbizMonth === m) {
        S.sbizYear = ''; S.sbizMonth = ''; S.sbizPeriod = '';
      } else {
        S.sbizYear = y; S.sbizMonth = m; S.sbizPeriod = '';
      }
      S.sbizPage = 1;
      renderSbizTab();
    });
  });
  $('btnClearYmBar')?.addEventListener('click', () => {
    S.sbizYear = ''; S.sbizMonth = ''; S.sbizPeriod = ''; S.sbizPage = 1;
    renderSbizTab();
  });
}

function updateSbizView(active) {
  const sggIdx = S.sbizSgg ? active.dicts.sgg.indexOf(S.sbizSgg) : -1;
  const l1Idx = S.sbizL1 ? active.dicts.l1.indexOf(S.sbizL1) : -1;
  const q = S.sbizQ.trim().toLowerCase();
  const n = active.n;
  const ds = getSbizDateSummary(active);

  const baseNoDate = [];
  const matchedIdx = [];

  for (let i = 0; i < n; i++) {
    if (sggIdx >= 0 && active.cols.sgg[i] !== sggIdx) continue;
    if (l1Idx >= 0 && active.cols.l1[i] !== l1Idx) continue;
    const raw = active.strs[i] || '';
    if (q && !raw.toLowerCase().includes(q)) continue;
    baseNoDate.push(i);

    const ym = raw.slice(6, 12);
    const yr = ym.slice(0, 4);
    const mo = ym.slice(4, 6);
    if (S.sbizPeriod === 'recent3m' && !ds.recent3.has(ym)) continue;
    if (S.sbizPeriod === 'old' && yr !== '2022' && yr !== '2023') continue;
    if (S.sbizYear && yr !== S.sbizYear) continue;
    if (S.sbizMonth && mo !== S.sbizMonth) continue;
    matchedIdx.push(i);
  }

  // Sort matchedIdx (default: newest 등재연월 first!)
  if (S.sbizSort === 'ymDesc') {
    matchedIdx.sort((a, b) => (active.strs[b] || '').slice(6, 12).localeCompare((active.strs[a] || '').slice(6, 12)));
  } else if (S.sbizSort === 'ymAsc') {
    matchedIdx.sort((a, b) => (active.strs[a] || '').slice(6, 12).localeCompare((active.strs[b] || '').slice(6, 12)));
  } else if (S.sbizSort === 'name') {
    matchedIdx.sort((a, b) => {
      const sa = active.strs[a] || '', sb = active.strs[b] || '';
      return sa.slice(sa.indexOf('\x1f') + 1).localeCompare(sb.slice(sb.indexOf('\x1f') + 1), 'ko');
    });
  }

  S.lastSbizMatchedIdx = matchedIdx;
  renderSbizYmTimeline(active, baseNoDate);

  if (S.leafletMap && matchedIdx.length > 0 && (S.sbizSgg || S.sbizQ)) {
    const sampleStep = Math.max(1, Math.floor(matchedIdx.length / 400));
    const bounds = [];
    for (let k = 0; k < matchedIdx.length; k += sampleStep) {
      const la = active.lat[matchedIdx[k]] / 1e6, lo = active.lon[matchedIdx[k]] / 1e6;
      if (la && lo) bounds.push([la, lo]);
    }
    if (bounds.length) S.leafletMap.fitBounds(bounds, { maxZoom: 16, padding: [24, 24] });
  }
  renderViewportSbizMarkers(active);
  if (S.gisLayers.heat) applyGisOverlays(active);
  renderSbizListPanel(active);
}

function renderSbizListPanel(active) {
  const card = $('sbizListCard');
  if (!card || !active) return;
  const sourceIdx = (S.sbizViewportSync && S.sbizInViewIdx.length) ? S.sbizInViewIdx : S.lastSbizMatchedIdx;
  const dateTag = S.sbizYear || S.sbizMonth
    ? `${S.sbizYear || '전체'}년 ${S.sbizMonth ? S.sbizMonth + '월' : '전체'}`
    : (S.sbizPeriod === 'recent3m' ? '최근 3개월' : S.sbizPeriod === 'old' ? '2022~23년' : '전체 기간');

  if (S.sbizView === 'buildings') {
    const bMap = new Map();
    for (const idx of sourceIdx) {
      const bid = active.bldId[idx];
      if (!bid) continue;
      let b = bMap.get(bid);
      const ymRaw = (active.strs[idx] || '').slice(6, 12);
      const ymFmt = /^\d{6}$/.test(ymRaw) ? `${ymRaw.slice(0, 4)}.${ymRaw.slice(4, 6)}` : '';
      if (!b) {
        const st = parseSbizStore(active, idx);
        b = { bid, bld: st.bld || st.addr, road: st.addr, sgg: st.sgg, dong: st.dong, lat: st.lat, lon: st.lon, cnt: 0, new26: 0, maxYm: ymFmt };
        bMap.set(bid, b);
      }
      b.cnt++;
      if (ymRaw.startsWith('2026')) b.new26++;
      if (ymFmt > b.maxYm) b.maxYm = ymFmt;
    }
    const topBlds = [...bMap.values()].sort((a, b) => b.cnt - a.cnt).slice(0, 80);
    card.innerHTML = `
      <div class="sbiz-side-list">
        <div class="card-head" style="padding:11px 13px;margin:0;border-bottom:1px solid var(--border)">
          <h3 class="card-title" style="font-size:14px">🏢 대형상가·밀집건물 TOP ${topBlds.length} <span class="tag tag-sbiz">${fmt(sourceIdx.length)}개</span></h3>
          <span style="font-size:11px;color:var(--muted)">${esc(dateTag)}</span>
        </div>
        <div class="sbiz-side-scroll">
          <table class="data-table">
            <thead><tr><th>건물명 / 도로명</th><th>최근등재</th><th>입점(2026)</th><th>액션</th></tr></thead>
            <tbody>
              ${topBlds.map((b) => `
                <tr>
                  <td><b>${esc(b.bld)}</b><div style="font-size:11px;color:var(--muted)">${esc(b.sgg)} ${esc(b.dong)} · ${esc(b.road)}</div></td>
                  <td>${regYmBadgeHtml(b.maxYm)}</td>
                  <td><span class="tag tag-sbiz">${fmt(b.cnt)}개</span>${b.new26 ? ` <span class="tag tag-bid">+${b.new26}</span>` : ''}</td>
                  <td>
                    <button class="btn btn-sm" data-fly="${b.lat},${b.lon}">📍</button>
                    <button class="btn btn-sm" data-pipe-bld="${esc(b.bld)}|${esc(b.sgg)}|${b.cnt}">+CRM</button>
                  </td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
    card.querySelectorAll('[data-fly]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const [la, lo] = btn.dataset.fly.split(',').map(Number);
        S.leafletMap?.setView([la, lo], 17);
        runRadiusCatchment(la, lo, active);
      });
    });
    card.querySelectorAll('[data-pipe-bld]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const [bld, sgg, cnt] = btn.dataset.pipeBld.split('|');
        addToPipeline({ id: `sbizbld:${sgg}:${bld}`, domain: 'sbiz', title: `[대형상가] ${bld}`, sub: `입점 ${cnt}개소 · 보안/통신/시설 영업타깃`, region: `${active.name} ${sgg}`, valueMan: 0 });
      });
    });
    return;
  }

  const perPage = 40;
  const maxPage = Math.max(1, Math.ceil(sourceIdx.length / perPage));
  S.sbizPage = Math.min(S.sbizPage, maxPage);
  const pageStores = sourceIdx.slice((S.sbizPage - 1) * perPage, S.sbizPage * perPage).map((idx) => parseSbizStore(active, idx));

  card.innerHTML = `
    <div class="sbiz-side-list">
      <div class="card-head" style="padding:10px 12px;margin:0;border-bottom:1px solid var(--border)">
        <div>
          <h3 class="card-title" style="font-size:14px">📋 ${esc(active.name)} 상가 리스트 <span class="tag tag-sbiz">${fmt(sourceIdx.length)}개</span></h3>
          <div style="font-size:11px;color:var(--muted);margin-top:2px">
            <span id="sbizViewportStat">기준: ${esc(dateTag)}${S.sbizViewportSync ? ' · 👁️ 지도화면 연동중' : ''}</span>
          </div>
        </div>
        <button id="btnSbizListCsv" class="btn btn-sm btn-emerald" type="button">📥 CSV</button>
      </div>
      <div class="sbiz-side-scroll">
        <table class="data-table">
          <thead><tr><th>상호명 / 주소·건물</th><th>등재일</th><th>업종</th><th>CRM</th></tr></thead>
          <tbody>
            ${pageStores.map((st) => {
              const dn = `${st.name}${st.branch ? ' ' + st.branch : ''}`.trim() || '(상호 미기재)';
              const bldSub = [st.bld, st.floor, st.ho ? `${st.ho}호` : ''].filter(Boolean).join(' ');
              return `
              <tr data-fly-store="${st.lat},${st.lon}" data-store-nm="${esc(dn)}">
                <td>
                  <div style="font-weight:800;font-size:12.5px">${esc(dn)}</div>
                  <div style="font-size:11px;color:var(--muted);max-width:240px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(st.addr)}${bldSub ? ` (${esc(bldSub)})` : ''}</div>
                </td>
                <td>${regYmBadgeHtml(st.regYm)}</td>
                <td>
                  <span class="tag tag-sbiz" style="font-size:10.5px">${esc(st.l1)}</span>
                  <div style="font-size:10.5px;color:var(--muted);margin-top:2px">${esc(st.l3 || st.ksic)}</div>
                </td>
                <td><button class="btn btn-sm" data-list-crm="${esc(st.id)}|${esc(dn)}|${esc(st.l1 + '·' + st.l3)}|${esc(st.addr)}" type="button">+</button></td>
              </tr>`;
            }).join('') || '<tr><td colspan="4" style="text-align:center;padding:24px;color:var(--muted)">선택한 년·월 / 조건에 해당하는 상가가 없습니다.</td></tr>'}
          </tbody>
        </table>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;border-top:1px solid var(--border);background:var(--surface-2)">
        <span style="font-size:11.5px;color:var(--muted)">페이지 ${S.sbizPage} / ${fmt(maxPage)} (${esc(dateTag)})</span>
        <div style="display:flex;gap:5px">
          <button id="sbPrev" class="btn btn-sm" ${S.sbizPage <= 1 ? 'disabled' : ''}>← 이전</button>
          <button id="sbNext" class="btn btn-sm" ${S.sbizPage >= maxPage ? 'disabled' : ''}>다음 →</button>
        </div>
      </div>
    </div>
  `;

  $('sbPrev')?.addEventListener('click', () => { if (S.sbizPage > 1) { S.sbizPage--; renderSbizListPanel(active); } });
  $('sbNext')?.addEventListener('click', () => { if (S.sbizPage < maxPage) { S.sbizPage++; renderSbizListPanel(active); } });
  $('btnSbizListCsv')?.addEventListener('click', () => {
    const cap = Math.min(sourceIdx.length, 30000);
    const rows = [];
    for (let k = 0; k < cap; k++) {
      const st = parseSbizStore(active, sourceIdx[k]);
      rows.push([st.name, st.branch, st.regYm, st.ageLabel, st.l1, st.l2, st.l3, st.ksic, st.sgg, st.dong, st.addr, st.bld, st.floor, st.ho, st.zip, st.lat, st.lon]);
    }
    downloadCsv(
      `nexusone_sbiz_${active.slug}_${S.sbizYear || 'all'}${S.sbizMonth || ''}_${new Date().toISOString().slice(0, 10)}.csv`,
      ['상호명', '지점명', '등재연월', '구분', '대분류', '중분류', '소분류', 'KSIC', '시군구', '행정동', '도로명주소', '건물명', '층', '호', '우편번호', '위도', '경도'],
      rows
    );
    toast(`📥 ${fmt(rows.length)}개 상가 리스트(등재연월 포함) CSV 다운로드 완료!`);
  });
  card.querySelectorAll('[data-list-crm]').forEach((b) => {
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      const [id, dn, sub, addr] = b.dataset.listCrm.split('|');
      addToPipeline({ id: `sbiz:${id}`, domain: 'sbiz', title: dn, sub, region: addr, valueMan: 0 });
    });
  });
  card.querySelectorAll('[data-fly-store]').forEach((tr) => {
    tr.addEventListener('click', () => {
      const [la, lo] = tr.dataset.flyStore.split(',').map(Number);
      S.leafletMap?.setView([la, lo], 17);
      runRadiusCatchment(la, lo, active, tr.dataset.storeNm || '');
    });
  });
}

// =========================================================================
// TAB 5: 🏠 부동산 · 청약 · 분양가 · 착공 PRO (홈레이더 엔진)
// =========================================================================
function renderRealEstateTab() {
  const listings = S.re.listings || [];
  const starts = S.re.starts || [];
  const complexes = S.re.complexes || [];
  const archPermits = S.opps.filter((o) => o.stageType === 'permit');

  $('mainStage').innerHTML = `
    <div class="card">
      <div class="card-head">
        <div>
          <h2 class="card-title">🏠 부동산 · 청약 · 분양가 · 착공 PRO</h2>
          <p class="card-sub">청약홈 6종 실시간 API · 내 청약가점/예산 적합도 · 지자체 착공 + 국토부 건축인허가 통합</p>
        </div>
        <button id="btnReRefresh" class="btn btn-rose btn-sm" type="button">🔄 청약홈 6종 API 실시간 새로고침</button>
      </div>

      <div class="toolbar">
        <div class="chips" style="margin-right:auto">
          <button class="chip ${S.reSub === 'apt' ? 'active' : ''}" data-re-sub="apt">🏢 APT 분양 (${listings.filter((x) => x.kind === 'apt').length})</button>
          <button class="chip ${S.reSub === 'remndr' ? 'active' : ''}" data-re-sub="remndr">🎯 무순위·오피스텔 (${listings.filter((x) => x.kind !== 'apt').length})</button>
          <button class="chip ${S.reSub === 'starts' ? 'active' : ''}" data-re-sub="starts">🏗️ 착공·건축인허가 (${starts.length + archPermits.length})</button>
          <button class="chip ${S.reSub === 'kapt' ? 'active' : ''}" data-re-sub="kapt">🏘️ K-apt 기축단지 (${complexes.length})</button>
        </div>
        <input id="fReQ" class="input" style="min-width:170px" value="${esc(S.reQ)}" placeholder="단지명 · 지역 · 시공사 검색" />
        <label style="font-size:12px;font-weight:700;display:inline-flex;align-items:center;gap:4px">
          내 가점 <input id="fMyScore" class="input" type="number" min="0" max="84" value="${S.myScore}" style="width:64px;padding:6px 8px" />
        </label>
        <label style="font-size:12px;font-weight:700;display:inline-flex;align-items:center;gap:4px">
          예산(억) <input id="fMyBudget" class="input" type="number" min="1" max="100" value="${S.myBudgetEok}" style="width:64px;padding:6px 8px" />
        </label>
      </div>

      <div id="reBody"></div>
    </div>
  `;

  $('mainStage').querySelectorAll('[data-re-sub]').forEach((b) => {
    b.addEventListener('click', () => { S.reSub = b.dataset.reSub; renderRealEstateTab(); });
  });
  let t = null;
  $('fReQ').addEventListener('input', (e) => { clearTimeout(t); t = setTimeout(() => { S.reQ = e.target.value; renderReSubBody(); }, 180); });
  $('fMyScore').addEventListener('change', (e) => { S.myScore = Number(e.target.value) || 0; renderReSubBody(); });
  $('fMyBudget').addEventListener('change', (e) => { S.myBudgetEok = Number(e.target.value) || 0; renderReSubBody(); });
  $('btnReRefresh').addEventListener('click', refreshLiveRealEstate);

  renderReSubBody();
}

function renderReSubBody() {
  const q = S.reQ.trim().toLowerCase();
  const box = $('reBody');

  if (S.reSub === 'apt' || S.reSub === 'remndr') {
    const items = (S.re.listings || []).filter((l) => {
      if (S.reSub === 'apt' && l.kind !== 'apt') return false;
      if (S.reSub === 'remndr' && l.kind === 'apt') return false;
      if (q && !`${l.name} ${l.addr} ${l.area} ${l.builder}`.toLowerCase().includes(q)) return false;
      return true;
    }).slice(0, 60);

    box.innerHTML = `<div class="item-list">
      ${items.map((l) => {
        const minEok = l.minPriceMan ? l.minPriceMan / 10000 : (l.maxPriceMan ? l.maxPriceMan / 10000 : 0);
        const fitBudget = !minEok || minEok <= S.myBudgetEok;
        const cut = l.minScore || l.avgScore || 0;
        const fitScore = !cut || S.myScore >= cut;
        return `<div class="item-card" data-re-id="${esc(l.id)}">
          <div class="item-card-main">
            <div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:5px">
              <span class="tag ${l.kind === 'apt' ? 'tag-re' : 'tag-bid'}">${l.kind === 'apt' ? 'APT 분양' : (l.kind === 'remndr' ? '🎯 무순위(줍줍)' : '오피스텔/도시형')}</span>
              <span class="tag tag-gray">${esc(l.area || '-')}</span>
              ${minEok ? `<span class="tag ${fitBudget ? 'tag-sbiz' : 'tag-gray'}">${fitBudget ? '✓ 예산적합' : '예산초과'}</span>` : ''}
              ${cut ? `<span class="tag ${fitScore ? 'tag-corp' : 'tag-gray'}">당첨가점 ${cut}점</span>` : ''}
            </div>
            <div class="item-card-title">${esc(l.name)}</div>
            <div class="item-card-meta">
              <span>📍 ${esc(l.addr || '-')}</span>
              <span>🏗️ ${esc(l.builder || '-')} · ${fmt(l.units || 0)}세대</span>
              <span>📅 접수 ${esc(l.rcptBgn || l.pubDate || '-')} ~ ${esc(l.rcptEnd || '')}</span>
            </div>
          </div>
          <div class="item-card-right">
            <div style="font-weight:800;font-size:14px;color:var(--c-re)">${minEok ? `${fmtDec(minEok, 2)}억~` : '분양가 조회'}</div>
            <div style="font-size:11.5px;color:var(--muted)">${l.avgPyeongMan ? `평당 ${fmt(l.avgPyeongMan)}만` : (l.maxCmpet ? `최고 ${l.maxCmpet}:1` : '')}</div>
          </div>
        </div>`;
      }).join('') || '<div style="text-align:center;padding:24px;color:var(--muted)">검색 결과가 없습니다.</div>'}
    </div>`;

    box.querySelectorAll('[data-re-id]').forEach((el) => {
      el.addEventListener('click', () => {
        const l = S.re.listings.find((x) => x.id === el.dataset.reId);
        if (!l) return;
        openDrawer({
          title: l.name,
          sub: `${l.area || ''} · ${l.builder || '시공사 미기재'}`,
          body: `
            <div class="domain-box">
              <div class="domain-stat-row"><span>위치</span><b>${esc(l.addr || '-')}</b></div>
              <div class="domain-stat-row"><span>공급규모</span><b>${fmt(l.units || 0)}세대</b></div>
              <div class="domain-stat-row"><span>청약접수</span><b>${esc(l.rcptBgn || '-')} ~ ${esc(l.rcptEnd || '-')}</b></div>
              <div class="domain-stat-row"><span>입주예정</span><b>${esc(l.moveIn || '-')}</b></div>
              <div class="domain-stat-row"><span>최저~최고 분양가</span><b>${l.minPriceMan ? `${fmtDec(l.minPriceMan / 10000, 2)}억 ~ ${fmtDec((l.maxPriceMan || l.minPriceMan) / 10000, 2)}억` : '상세 미제공'}</b></div>
              <div class="domain-stat-row"><span>평당가 / 최고경쟁률</span><b>${l.avgPyeongMan ? fmt(l.avgPyeongMan) + '만원/평' : '-'} / ${l.maxCmpet ? l.maxCmpet + ':1' : '-'}</b></div>
            </div>
            ${Array.isArray(l.models) && l.models.length ? `<h4 style="margin:12px 0 6px;font-size:13px">📐 주택형별 분양가</h4>
              <div class="table-wrap"><table class="data-table"><thead><tr><th>타입</th><th>세대</th><th>최고분양가</th><th>평당가</th></tr></thead><tbody>
              ${l.models.map((m) => `<tr><td><b>${esc(m.type || m.HOUSE_TY || '-')}</b></td><td>${fmt(m.units || m.SUPLY_HSHLDCO || 0)}</td><td>${m.priceMan ? fmtDec(m.priceMan / 10000, 2) + '억' : '-'}</td><td>${m.pyeongMan ? fmt(m.pyeongMan) + '만' : '-'}</td></tr>`).join('')}
              </tbody></table></div>` : ''}
          `,
          foot: `
            <button id="dwRePipe" class="btn btn-primary btn-sm">💼 파이프라인 담기</button>
            ${l.url ? `<a class="btn btn-rose btn-sm" href="${esc(l.url)}" target="_blank" rel="noopener">🔗 청약홈 공고</a>` : ''}
          `,
          onMount: () => {
            $('dwRePipe')?.addEventListener('click', () => addToPipeline({
              id: `re:${l.id}`, domain: 're', title: l.name, sub: `${l.builder || ''} · ${fmt(l.units || 0)}세대`, region: l.addr || l.area || '', valueMan: l.minPriceMan || 0,
            }));
          },
        });
      });
    });
    return;
  }

  if (S.reSub === 'starts') {
    const archPermits = S.opps.filter((o) => o.stageType === 'permit').map((o) => ({
      id: o.id, source: '국토부 건축인허가', name: o.title, addr: o.region, builder: o.org, startDate: o.pubDate, usage: o.method,
    }));
    const combined = [...starts, ...archPermits].filter((s) => !q || `${s.name} ${s.addr} ${s.builder} ${s.source}`.toLowerCase().includes(q)).slice(0, 80);
    box.innerHTML = `<div class="table-wrap"><table class="data-table">
      <thead><tr><th>출처</th><th>현장명 / 허가건</th><th>시공사 / 기관</th><th>주소</th><th>일자</th><th>액션</th></tr></thead>
      <tbody>${combined.map((s) => `
        <tr>
          <td><span class="tag ${s.source.includes('국토부') ? 'tag-corp' : 'tag-re'}">${esc(s.source)}</span></td>
          <td><b>${esc(s.name)}</b></td>
          <td>${esc(s.builder || '-')}</td>
          <td style="max-width:210px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--muted)">${esc(s.addr || '-')}</td>
          <td>${esc(s.startDate || '-')}</td>
          <td><button class="btn btn-sm" data-add-st="${esc(s.id)}">+ 담기</button></td>
        </tr>`).join('')}
      </tbody></table></div>`;
    box.querySelectorAll('[data-add-st]').forEach((b) => {
      b.addEventListener('click', () => {
        const s = combined.find((x) => x.id === b.dataset.addSt);
        if (s) addToPipeline({ id: `start:${s.id}`, domain: 're', title: s.name, sub: `${s.source} · ${s.builder || ''}`, region: s.addr || '', valueMan: 0 });
      });
    });
    return;
  }

  // K-apt complexes
  const list = (S.re.complexes || []).filter((c) => !q || `${c.name} ${c.sido} ${c.sgg} ${c.dong}`.toLowerCase().includes(q)).slice(0, 80);
  box.innerHTML = `<div class="table-wrap"><table class="data-table">
    <thead><tr><th>단지코드</th><th>단지명</th><th>시도 · 시군구 · 동</th><th>액션</th></tr></thead>
    <tbody>${list.map((c) => `
      <tr>
        <td class="mono" style="font-size:11.5px">${esc(c.code)}</td>
        <td><b>${esc(c.name)}</b></td>
        <td>${esc(c.sido)} ${esc(c.sgg)} ${esc(c.dong)}</td>
        <td><button class="btn btn-sm" data-add-kapt="${esc(c.code)}">+ 담기</button></td>
      </tr>`).join('')}
    </tbody></table></div>`;
  box.querySelectorAll('[data-add-kapt]').forEach((b) => {
    b.addEventListener('click', () => {
      const c = list.find((x) => x.code === b.dataset.addKapt);
      if (c) addToPipeline({ id: `kapt:${c.code}`, domain: 're', title: c.name, sub: `K-apt 기축단지 (${c.code})`, region: `${c.sido} ${c.sgg} ${c.dong}`, valueMan: 0 });
    });
  });
}

async function refreshLiveRealEstate() {
  const { dataGoEnc } = getApiKeys();
  if (!dataGoEnc) return toast('공공데이터포털 키가 없습니다.');
  toast('🔄 청약홈 APT·무순위·오피스텔·분양가·경쟁률 6종 실시간 갱신 중…');
  try {
    const [apt, rem, urb, mdl, cmp] = await Promise.all([
      fetch(`https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1/getAPTLttotPblancDetail?page=1&perPage=60&serviceKey=${dataGoEnc}`).then((r) => r.json()),
      fetch(`https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1/getRemndrLttotPblancDetail?page=1&perPage=30&serviceKey=${dataGoEnc}`).then((r) => r.json()),
      fetch(`https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1/getUrbtyOfctlLttotPblancDetail?page=1&perPage=30&serviceKey=${dataGoEnc}`).then((r) => r.json()),
      fetch(`https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1/getAPTLttotPblancMdl?page=1&perPage=250&serviceKey=${dataGoEnc}`).then((r) => r.json()),
      fetch(`https://api.odcloud.kr/api/ApplyhomeInfoCmpetRtSvc/v1/getAPTLttotPblancCmpet?page=1&perPage=200&serviceKey=${dataGoEnc}`).then((r) => r.json()),
    ]);
    const mdlMap = new Map();
    for (const m of (mdl?.data || [])) {
      const k = String(m.HOUSE_MANAGE_NO || '');
      if (!mdlMap.has(k)) mdlMap.set(k, []);
      const priceMan = Number(String(m.LTTOT_TOP_AMOUNT || '').replace(/\D/g, '')) || 0;
      const areaM2 = Number(m.SUPLY_AR || m.EXCLUSE_AR || 0);
      const pyeongMan = (priceMan && areaM2) ? Math.round(priceMan / (areaM2 / 3.3058)) : 0;
      mdlMap.get(k).push({ type: m.HOUSE_TY, units: Number(m.SUPLY_HSHLDCO || 0), priceMan, pyeongMan });
    }
    const cmpMap = new Map();
    for (const c of (cmp?.data || [])) {
      const k = String(c.HOUSE_MANAGE_NO || '');
      const rt = parseFloat(c.CMPET_RATE || '0') || 0;
      if (rt > (cmpMap.get(k) || 0)) cmpMap.set(k, rt);
    }
    const normList = (arr, kind) => (arr || []).map((x) => {
      const mno = String(x.HOUSE_MANAGE_NO || '');
      const models = mdlMap.get(mno) || [];
      const prices = models.map((m) => m.priceMan).filter(Boolean);
      const pyeongs = models.map((m) => m.pyeongMan).filter(Boolean);
      return {
        id: `${kind}:${mno}`,
        manageNo: mno,
        kind,
        name: x.HOUSE_NM || '',
        area: x.SUBSCRPT_AREA_CODE_NM || '',
        addr: x.HSSPLY_ADRES || '',
        units: Number(x.TOT_SUPLY_HSHLDCO || 0),
        builder: x.CNSTRCT_ENTRPS_NM || x.BSNS_MBY_NM || '',
        pubDate: x.RCRIT_PBLANC_DE || '',
        rcptBgn: x.RCEPT_BGNDE || x.SUBSCRPT_RCEPT_BGNDE || '',
        rcptEnd: x.RCEPT_ENDDE || x.SUBSCRPT_RCEPT_ENDDE || '',
        moveIn: x.MVN_PREARNGE_YM || '',
        url: x.PBLANC_URL || '',
        models,
        minPriceMan: prices.length ? Math.min(...prices) : 0,
        maxPriceMan: prices.length ? Math.max(...prices) : 0,
        avgPyeongMan: pyeongs.length ? Math.round(pyeongs.reduce((a, b) => a + b, 0) / pyeongs.length) : 0,
        maxCmpet: cmpMap.get(mno) || 0,
      };
    });
    S.re.listings = [...normList(apt?.data, 'apt'), ...normList(rem?.data, 'remndr'), ...normList(urb?.data, 'urbty')];
    toast(`✓ 청약홈 최신 ${S.re.listings.length}건 실시간 반영 완료!`);
    if (S.tab === 'realestate') renderRealEstateTab();
  } catch (e) {
    toast(`청약홈 갱신 오류: ${e.message}`);
  }
}

// =========================================================================
// TAB 6: 🔌 통합 API 10종 진단 · 파이프라인 CRM · 전문앱 허브
// =========================================================================
function renderHubTab() {
  const { dataGoRaw, vworld } = getApiKeys();
  const stages = ['발굴', '검토', '답사·컨택', '제안·청약', '계약·성사', '보류'];
  const pipeFiltered = S.pipeStageFilter ? S.pipeline.filter((p) => p.stage === S.pipeStageFilter) : S.pipeline;
  const totalValMan = pipeFiltered.reduce((a, p) => a + (Number(p.valueMan) || 0), 0);

  $('mainStage').innerHTML = `
    <!-- 1. 10-API DIAGNOSTIC BOARD -->
    <div class="card" style="margin-bottom:16px">
      <div class="card-head">
        <div>
          <h2 class="card-title">🩺 통합 10종 공공·GIS API 실시간 연결 진단</h2>
          <p class="card-sub">암호화 볼트 내장 키 자동 적용 · 공공데이터: <span class="mono">${esc(maskKey(dataGoRaw))}</span> · 브이월드: <span class="mono">${esc(maskKey(vworld))}</span></p>
        </div>
        <button id="btnRunDiag10" class="btn btn-primary" type="button">🩺 전체 10종 API 실시간 진단 실행</button>
      </div>

      <div id="diagBoard" class="diag-grid">
        ${S.diagResults.length ? S.diagResults.map((d) => `
          <div class="diag-card ${d.ok ? 'ok' : 'err'}">
            <div class="diag-title">${d.ok ? '🟢' : '🔴'} ${esc(d.name)}</div>
            <div class="diag-status">${esc(d.status)}</div>
            <div class="diag-detail">${esc(d.detail)}</div>
          </div>`).join('') : `<div style="grid-column:1/-1;padding:14px;border-radius:10px;background:var(--surface-2);color:var(--muted);font-size:13px">
            상단 <b>[🩺 전체 10종 API 실시간 진단 실행]</b>을 누르면 브이월드(2) · 나라장터(2) · K-apt(1) · 청약홈(3) · 소상공인(1) · 지자체착공(1) 연결 상태를 즉시 검증합니다.
          </div>`}
      </div>
    </div>

    <!-- 2. UNIFIED 4-DOMAIN PIPELINE CRM -->
    <div class="card" style="margin-bottom:16px">
      <div class="card-head">
        <div>
          <h2 class="card-title">💼 4대 도메인 통합 영업·투자 파이프라인 CRM <span class="tag tag-corp">${fmt(S.pipeline.length)}건</span></h2>
          <p class="card-sub">기업 · 입찰 · 대형상가 · 신축분양에서 담은 타깃을 한곳에서 관리합니다 · 합계 규모 <b>${fmtDec(totalValMan / 10000, 1)}억원</b></p>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          <button id="btnPipeCsv" class="btn btn-sm">📥 CSV 내보내기</button>
          <button id="btnPipeJson" class="btn btn-sm">💾 JSON 백업</button>
        </div>
      </div>

      <div class="chips" style="margin-bottom:12px">
        <button class="chip ${!S.pipeStageFilter ? 'active' : ''}" data-ps="">전체 (${S.pipeline.length})</button>
        ${stages.map((st) => `<button class="chip ${S.pipeStageFilter === st ? 'active' : ''}" data-ps="${st}">${st} (${S.pipeline.filter((p) => p.stage === st).length})</button>`).join('')}
      </div>

      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>도메인</th><th>타깃명</th><th>지역</th><th>단계</th><th>메모</th><th>삭제</th></tr></thead>
          <tbody>
            ${pipeFiltered.map((p) => `
              <tr>
                <td><span class="tag tag-${p.domain}">${({ corp: '🏢 기업', bid: '🎯 입찰', sbiz: '🏪 상권', re: '🏠 부동산' })[p.domain] || p.domain}</span></td>
                <td><b>${esc(p.title)}</b><div style="font-size:11px;color:var(--muted)">${esc(p.sub)}</div></td>
                <td>${esc(p.region || '-')}</td>
                <td>
                  <select class="select" style="padding:4px 6px;font-size:12px" data-pipe-stage="${esc(p.id)}">
                    ${stages.map((st) => `<option value="${st}" ${p.stage === st ? 'selected' : ''}>${st}</option>`).join('')}
                  </select>
                </td>
                <td><input class="input" style="padding:5px 8px;font-size:12px;width:160px" value="${esc(p.note || '')}" placeholder="영업/투자 메모" data-pipe-note="${esc(p.id)}" /></td>
                <td><button class="btn btn-sm" data-pipe-del="${esc(p.id)}">✕</button></td>
              </tr>`).join('') || '<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--muted)">아직 담은 파이프라인 항목이 없습니다. 각 탭에서 [+ 파이프라인] 버튼을 눌러 추가하세요.</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>

    <!-- 3. INDIVIDUAL PRO APPS LAUNCHPAD -->
    <div class="card">
      <div class="card-head">
        <div>
          <h2 class="card-title">🚀 개별 전문 앱 바로가기 (동일 비밀번호 연동)</h2>
          <p class="card-sub">각 도메인별 풀-특화 단독 앱도 새 탭에서 바로 열 수 있습니다.</p>
        </div>
      </div>
      <div class="grid-4">
        <a class="domain-box" href="https://heebonpark.github.io/ca-v8x4k2/" target="_blank" rel="noopener">
          <h4 style="color:var(--c-corp)">🏢 기업분석앱 ↗</h4>
          <div style="font-size:12px;color:var(--muted)">12만 법인 · EDA · 브이월드</div>
        </a>
        <a class="domain-box" href="https://heebonpark.github.io/bid-p9m3r7/" target="_blank" rel="noopener">
          <h4 style="color:var(--c-bid)">🎯 입찰·영업기회 ↗</h4>
          <div style="font-size:12px;color:var(--muted)">나라장터 · 사전규격 · 건설사</div>
        </a>
        <a class="domain-box" href="https://heebonpark.github.io/sbiz-m4q8w2/" target="_blank" rel="noopener">
          <h4 style="color:var(--c-sbiz)">🏪 소상공인지도 ↗</h4>
          <div style="font-size:12px;color:var(--muted)">275만 상가 · 16시도 GIS</div>
        </a>
        <a class="domain-box" href="https://heebonpark.github.io/hr-k7m2x9/" target="_blank" rel="noopener">
          <h4 style="color:var(--c-re)">🏠 홈레이더 ↗</h4>
          <div style="font-size:12px;color:var(--muted)">청약 · 분양가 · 경쟁률 · 착공</div>
        </a>
      </div>
    </div>
  `;

  $('btnRunDiag10').addEventListener('click', runFull10ApiDiag);
  $('mainStage').querySelectorAll('[data-ps]').forEach((b) => {
    b.addEventListener('click', () => { S.pipeStageFilter = b.dataset.ps; renderHubTab(); });
  });
  $('mainStage').querySelectorAll('[data-pipe-stage]').forEach((sel) => {
    sel.addEventListener('change', () => {
      const p = S.pipeline.find((x) => x.id === sel.dataset.pipeStage);
      if (p) { p.stage = sel.value; savePipeline(); renderHubTab(); }
    });
  });
  $('mainStage').querySelectorAll('[data-pipe-note]').forEach((inp) => {
    inp.addEventListener('change', () => {
      const p = S.pipeline.find((x) => x.id === inp.dataset.pipeNote);
      if (p) { p.note = inp.value; savePipeline(); toast('메모 저장됨'); }
    });
  });
  $('mainStage').querySelectorAll('[data-pipe-del]').forEach((b) => {
    b.addEventListener('click', () => {
      S.pipeline = S.pipeline.filter((x) => x.id !== b.dataset.pipeDel);
      savePipeline();
      renderHubTab();
    });
  });
  $('btnPipeCsv').addEventListener('click', () => {
    const header = '도메인,타깃명,세부정보,지역,단계,예상규모(만원),메모,등록일\n';
    const rows = S.pipeline.map((p) => [p.domain, p.title, p.sub, p.region, p.stage, p.valueMan, p.note, p.addedAt].map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + header + rows], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `nexusone_pipeline_${new Date().toISOString().slice(0, 10)}.csv`; a.click();
  });
  $('btnPipeJson').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(S.pipeline, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `nexusone_pipeline_${new Date().toISOString().slice(0, 10)}.json`; a.click();
  });
}

async function runFull10ApiDiag() {
  const btn = $('btnRunDiag10');
  if (btn) { btn.disabled = true; btn.textContent = '🩺 10종 실시간 진단 중…'; }
  const { dataGoEnc, vworld } = getApiKeys();
  const isLocal = /^(127\.0\.0\.1|localhost)$/.test(location.hostname);
  const dom = encodeURIComponent((!isLocal && location.origin && /^https?:/.test(location.origin)) ? location.origin : 'https://heebonpark.github.io');
  const now = new Date();
  const bgn = new Date(now.getTime() - 2 * 86400000);
  const ymd = (d) => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const bgnDt = ymd(bgn) + '0000', endDt = ymd(now) + '2359';

  const checks = [
    {
      name: '1. 브이월드 지오코더',
      fn: async () => {
        const j = await jsonp(`https://api.vworld.kr/req/address?service=address&request=getAddress&version=2.0&crs=epsg:4326&point=126.7239,37.4925&format=json&type=both&key=${vworld}&domain=${dom}`);
        const ok = j?.response?.status === 'OK';
        return { ok, status: ok ? '정상 연결 (JSONP)' : '오류', detail: j?.response?.result?.[0]?.text || j?.response?.error?.text || '응답 확인' };
      },
    },
    {
      name: '2. 브이월드 지적·공시지가',
      fn: async () => {
        const [j, z] = await Promise.all([
          jsonp(`https://api.vworld.kr/req/data?service=data&request=GetFeature&data=LP_PA_CBND_BUBUN&key=${vworld}&domain=${dom}&geomFilter=POINT(126.7239%2037.4925)&size=1&format=json`),
          jsonp(`https://api.vworld.kr/req/data?service=data&request=GetFeature&data=LT_C_UQ111&key=${vworld}&domain=${dom}&geomFilter=POINT(126.7239%2037.4925)&size=3&format=json`).catch(() => null),
        ]);
        const ok = j?.response?.status === 'OK';
        const jiga = j?.response?.result?.featureCollection?.features?.[0]?.properties?.jiga;
        const uname = z?.response?.result?.featureCollection?.features?.[0]?.properties?.uname || '';
        return { ok, status: ok ? '정상 연결 (JSONP)' : '오류', detail: [uname, jiga ? `${fmt(jiga)}원/㎡` : ''].filter(Boolean).join(' · ') || j?.response?.error?.text || '지적 조회 응답' };
      },
    },
    {
      name: '3. 나라장터 입찰 (02)',
      url: `https://apis.data.go.kr/1230000/ad/BidPublicInfoService02/getBidPblancListInfoServc02?serviceKey=${dataGoEnc}&numOfRows=1&pageNo=1&type=json&inqryDiv=1&inqryBgnDt=${bgnDt}&inqryEndDt=${endDt}`,
      parse: (j) => `조회 가능 ${fmt(j?.response?.body?.totalCount || 0)}건`,
    },
    {
      name: '4. 나라장터 사전규격 (ao)',
      url: `https://apis.data.go.kr/1230000/ao/HrcspSsstndrdInfoService/getPublicPrcureThngInfoServc?serviceKey=${dataGoEnc}&numOfRows=1&pageNo=1&type=json&inqryDiv=1&inqryBgnDt=${bgnDt}&inqryEndDt=${endDt}`,
      parse: (j) => `조회 가능 ${fmt(j?.response?.body?.totalCount || 0)}건`,
    },
    {
      name: '5. K-apt 공동주택 (V4)',
      url: `https://apis.data.go.kr/1613000/AptListService4/getSigunguAptList4?serviceKey=${dataGoEnc}&sigunguCode=28237&pageNo=1&numOfRows=1&type=json`,
      parse: (j) => `부평구 단지 ${fmt(j?.response?.body?.totalCount || 0)}개`,
    },
    {
      name: '6. 청약홈 APT 분양',
      url: `https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1/getAPTLttotPblancDetail?page=1&perPage=1&serviceKey=${dataGoEnc}`,
      parse: (j) => `총 ${fmt(j?.totalCount || 0)}건`,
    },
    {
      name: '7. 청약홈 경쟁률·가점',
      url: `https://api.odcloud.kr/api/ApplyhomeInfoCmpetRtSvc/v1/getAPTLttotPblancCmpet?page=1&perPage=1&serviceKey=${dataGoEnc}`,
      parse: (j) => `총 ${fmt(j?.totalCount || 0)}건`,
    },
    {
      name: '8. 청약홈 무순위·줍줍',
      url: `https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1/getRemndrLttotPblancDetail?page=1&perPage=1&serviceKey=${dataGoEnc}`,
      parse: (j) => `총 ${fmt(j?.totalCount || 0)}건`,
    },
    {
      name: '9. 소상공인 상가 반경조회',
      url: `https://apis.data.go.kr/B553077/api/open/sdsc2/storeListInRadius?serviceKey=${dataGoEnc}&pageNo=1&numOfRows=1&radius=500&cx=126.7235&cy=37.4922&type=json`,
      parse: (j) => `반경 500m 상가 ${fmt(j?.body?.totalCount || 0)}개`,
    },
    {
      name: '10. 지자체 착공현황 (계양·송파)',
      url: `https://api.odcloud.kr/api/15100714/v1/uddi:58a57b5e-1fda-4b69-bd16-e31a58fc6798?page=1&perPage=1&serviceKey=${dataGoEnc}`,
      parse: (j) => `착공 데이터 ${fmt(j?.totalCount || 0)}건`,
    },
  ];

  S.diagResults = await Promise.all(checks.map(async (c) => {
    const t0 = performance.now();
    try {
      if (c.fn) {
        const res = await c.fn();
        return { name: c.name, ok: res.ok, status: `${res.status} · ${Math.round(performance.now() - t0)}ms`, detail: res.detail };
      }
      const r = await fetch(c.url);
      const ms = Math.round(performance.now() - t0);
      if (!r.ok) return { name: c.name, ok: false, status: `HTTP ${r.status} · ${ms}ms`, detail: '활용신청 미승인 또는 인증키 오류' };
      const j = await r.json();
      return { name: c.name, ok: true, status: `정상 연결 (HTTP 200 · ${ms}ms)`, detail: c.parse(j) };
    } catch (e) {
      return { name: c.name, ok: false, status: '연결 실패', detail: e.message };
    }
  }));

  const okCnt = S.diagResults.filter((x) => x.ok).length;
  toast(`🩺 10종 API 진단 완료: ${okCnt}/10 정상 연결`);
  if (S.tab === 'hub') renderHubTab();
}

// =========================================================================
// GLOBAL OMNI-SEARCH (4-DOMAIN CROSS SEARCH)
// =========================================================================
function wireOmniSearch() {
  const inp = $('omniInput'), drop = $('omniDrop'), clr = $('omniClear');
  let t = null;

  function renderOmni(rawQ) {
    const q = rawQ.trim().toLowerCase();
    clr.classList.toggle('hidden', !q);
    if (!q || !S.fusion) { drop.classList.add('hidden'); return; }

    const regions = S.fusion.regions.filter((r) => r.fullName.toLowerCase().includes(q)).slice(0, 4);
    const opps = S.opps.filter((o) => `${o.title} ${o.org} ${o.region}`.toLowerCase().includes(q)).slice(0, 4);
    const reItems = (S.re.listings || []).filter((l) => `${l.name} ${l.addr} ${l.builder}`.toLowerCase().includes(q)).slice(0, 4);

    // Search loaded Sbiz stores (parsed cleanly via \x1f)
    const sbizHits = [];
    for (const [slug, sidoObj] of S.sbizCache.entries()) {
      for (let i = 0; i < sidoObj.n && sbizHits.length < 4; i++) {
        if (String(sidoObj.strs[i] || '').toLowerCase().includes(q)) {
          const st = parseSbizStore(sidoObj, i);
          sbizHits.push({ slug, st });
        }
      }
      if (sbizHits.length >= 4) break;
    }

    // Search loaded corps, or fallback to topCorps inside fusion index!
    let corps = [];
    if (S.corpLoaded) {
      for (let i = 0; i < S.corps.length && corps.length < 4; i++) {
        if (`${S.corps[i][0]} ${S.corps[i][4]} ${S.corps[i][6]}`.toLowerCase().includes(q)) corps.push({ idx: i, name: S.corps[i][0], sub: S.corps[i][7] });
      }
    } else {
      for (const r of S.fusion.regions) {
        for (const tc of r.corp.top) {
          if (String(tc[0]).toLowerCase().includes(q) && corps.length < 4) corps.push({ idx: -1, name: tc[0], sub: `${r.fullName} · ${tc[5] || ''}`, rid: r.rid });
        }
      }
    }

    if (!regions.length && !opps.length && !reItems.length && !corps.length && !sbizHits.length) {
      drop.innerHTML = `<div style="padding:14px;text-align:center;color:var(--muted);font-size:12.5px">'${esc(rawQ)}'에 대한 통합 검색 결과가 없습니다.</div>`;
      drop.classList.remove('hidden');
      return;
    }

    drop.innerHTML = `
      ${regions.length ? `<div class="omni-group-title"><span>⚡ 360° 시군구 통합분석</span><span>${regions.length}</span></div>
        ${regions.map((r) => `<div class="omni-item" data-omni-rid="${r.rid}"><div class="omni-item-main"><div class="omni-item-title">${esc(r.fullName)}</div><div class="omni-item-sub">법인 ${fmt(r.corp.cnt)} · 상가 ${fmt(r.sbiz.cnt)} · 통합 ${r.scores.total}점</div></div><span class="tag tag-corp">360°</span></div>`).join('')}` : ''}
      ${corps.length ? `<div class="omni-group-title"><span>🏢 기업분석</span><span>${S.corpLoaded ? '12만 전체' : '대표기업'}</span></div>
        ${corps.map((c) => `<div class="omni-item" data-omni-corp="${c.idx}" data-omni-q="${esc(c.name)}"><div class="omni-item-main"><div class="omni-item-title">${esc(c.name)}</div><div class="omni-item-sub">${esc(c.sub || '')}</div></div><span class="tag tag-corp">기업</span></div>`).join('')}` : ''}
      ${sbizHits.length ? `<div class="omni-group-title"><span>🏪 소상공인 상가</span><span>${sbizHits.length}</span></div>
        ${sbizHits.map((h) => `<div class="omni-item" data-omni-sbiz="${esc(h.slug)}|${h.st.lat}|${h.st.lon}|${esc(h.st.name)}"><div class="omni-item-main"><div class="omni-item-title">${esc(h.st.name)} ${esc(h.st.branch)}</div><div class="omni-item-sub">${esc(h.st.l1)}·${esc(h.st.l3)} · ${esc(h.st.addr)}</div></div><span class="tag tag-sbiz">상가</span></div>`).join('')}` : ''}
      ${opps.length ? `<div class="omni-group-title"><span>🎯 입찰·사전규격·인허가</span><span>${opps.length}</span></div>
        ${opps.map((o) => `<div class="omni-item" data-omni-opp="${esc(o.id)}"><div class="omni-item-main"><div class="omni-item-title">${esc(o.title)}</div><div class="omni-item-sub">${esc(o.org)} · ${esc(o.region)}</div></div><span class="tag tag-bid">입찰</span></div>`).join('')}` : ''}
      ${reItems.length ? `<div class="omni-group-title"><span>🏠 청약·신축분양</span><span>${reItems.length}</span></div>
        ${reItems.map((l) => `<div class="omni-item" data-omni-re="${esc(l.name)}"><div class="omni-item-main"><div class="omni-item-title">${esc(l.name)}</div><div class="omni-item-sub">${esc(l.addr)} · ${esc(l.builder)}</div></div><span class="tag tag-re">청약</span></div>`).join('')}` : ''}
    `;
    drop.classList.remove('hidden');

    drop.querySelectorAll('[data-omni-sbiz]').forEach((el) => el.addEventListener('click', () => {
      drop.classList.add('hidden');
      const [slug, la, lo, nm] = el.dataset.omniSbiz.split('|');
      S.sbizActiveSlug = slug;
      S.sbizQ = nm;
      switchTab('sbiz');
      setTimeout(() => { S.leafletMap?.setView([Number(la), Number(lo)], 17); }, 150);
    }));

    drop.querySelectorAll('[data-omni-rid]').forEach((el) => el.addEventListener('click', () => {
      S.selectedRid = Number(el.dataset.omniRid); drop.classList.add('hidden'); switchTab('overview');
    }));
    drop.querySelectorAll('[data-omni-corp]').forEach((el) => el.addEventListener('click', () => {
      drop.classList.add('hidden');
      const idx = Number(el.dataset.omniCorp);
      if (idx >= 0) openCorpDrawer(idx);
      else { S.corpQ = el.dataset.omniQ; switchTab('corp'); }
    }));
    drop.querySelectorAll('[data-omni-opp]').forEach((el) => el.addEventListener('click', () => {
      drop.classList.add('hidden');
      const o = S.opps.find((x) => x.id === el.dataset.omniOpp);
      if (o) openOppDrawer(o);
    }));
    drop.querySelectorAll('[data-omni-re]').forEach((el) => el.addEventListener('click', () => {
      drop.classList.add('hidden'); S.reQ = el.dataset.omniRe; S.reSub = 'apt'; switchTab('realestate');
    }));
  }

  inp.addEventListener('input', (e) => { clearTimeout(t); t = setTimeout(() => renderOmni(e.target.value), 140); });
  inp.addEventListener('focus', () => { if (inp.value.trim()) renderOmni(inp.value); });
  clr.addEventListener('click', () => { inp.value = ''; renderOmni(''); });
  document.addEventListener('click', (e) => { if (!e.target.closest('.omni-wrap')) drop.classList.add('hidden'); });
}

// ===== DRAWER & PRO OPTIONS MODAL =====
function openDrawer({ title, sub, body, foot, onMount }) {
  $('drawerHeadContent').innerHTML = `<h3 style="margin:0;font-size:16px;font-weight:800">${esc(title)}</h3><div style="font-size:12px;color:var(--muted);margin-top:2px">${esc(sub || '')}</div>`;
  $('drawerBody').innerHTML = body || '';
  $('drawerFoot').innerHTML = foot || '';
  $('drawerBackdrop').classList.remove('hidden');
  onMount?.();
}
function closeDrawer() { $('drawerBackdrop').classList.add('hidden'); }

function openOptionsModal() {
  let ov = {};
  try { ov = JSON.parse(localStorage.getItem(OVERRIDE_KEYS) || '{}'); } catch {}
  const o = S.opts;
  $('optionsBody').innerHTML = `
    <div class="opt-section">
      <h4>💼 영업 업종 페르소나 & 기본 전략 모델 · 4축 가중치</h4>
      <div class="opt-field" style="margin-bottom:10px">
        <label>내 주력 영업 업종 (상업 기회 코멘트 · 추정 파이프라인 · 리포트 자동 맞춤)</label>
        <select id="optBizPersona" class="select">
          ${Object.entries(BIZ_PERSONAS).map(([k, v]) => `<option value="${k}" ${o.bizPersona === k ? 'selected' : ''}>${v.label} — ${esc(v.hook)}</option>`).join('')}
        </select>
      </div>
      <div class="chips" style="margin-bottom:10px">
        ${Object.entries(STRATEGY_PRESETS).map(([k, p]) => `<button class="chip ${o.preset === k ? 'active' : ''}" data-opt-preset="${k}" type="button">${p.label}</button>`).join('')}
      </div>
      <div class="opt-grid">
        <div class="opt-field"><label>🏢 기업 가중치</label><input id="optWCorp" class="input" type="number" min="0" max="100" value="${o.weights.corp}" /></div>
        <div class="opt-field"><label>🎯 입찰 가중치</label><input id="optWBid" class="input" type="number" min="0" max="100" value="${o.weights.bid}" /></div>
        <div class="opt-field"><label>🏪 상권 가중치</label><input id="optWSbiz" class="input" type="number" min="0" max="100" value="${o.weights.sbiz}" /></div>
        <div class="opt-field"><label>🏠 부동산 가중치</label><input id="optWRe" class="input" type="number" min="0" max="100" value="${o.weights.re}" /></div>
      </div>
    </div>

    <div class="opt-section">
      <h4>🗺️ 정밀 GIS 지도 & 반경분석 옵션</h4>
      <div class="opt-grid">
        <div class="opt-field">
          <label>기본 배경지도</label>
          <select id="optBaseMap" class="select">
            <option value="vbase" ${o.baseMap === 'vbase' ? 'selected' : ''}>🗺️ 브이월드 정밀 기본도</option>
            <option value="vsat" ${o.baseMap === 'vsat' ? 'selected' : ''}>🛰️ 브이월드 항공위성</option>
            <option value="vhyb" ${o.baseMap === 'vhyb' ? 'selected' : ''}>🛰️ 위성 + 도로명 하이브리드</option>
            <option value="vwhite" ${o.baseMap === 'vwhite' ? 'selected' : ''}>⬜ 브이월드 백지도</option>
            <option value="vmidnight" ${o.baseMap === 'vmidnight' ? 'selected' : ''}>🌙 브이월드 다크</option>
            <option value="osm" ${o.baseMap === 'osm' ? 'selected' : ''}>🌐 OpenStreetMap</option>
          </select>
        </div>
        <div class="opt-field">
          <label>기본 클릭 반경분석 거리</label>
          <select id="optRadius" class="select">
            <option value="300" ${o.defaultRadius === 300 ? 'selected' : ''}>300m (초역세권)</option>
            <option value="500" ${o.defaultRadius === 500 ? 'selected' : ''}>500m (도보 7분 표준)</option>
            <option value="1000" ${o.defaultRadius === 1000 ? 'selected' : ''}>1km (생활권 상권)</option>
            <option value="2000" ${o.defaultRadius === 2000 ? 'selected' : ''}>2km (광역 영업권)</option>
          </select>
        </div>
        <div class="opt-field">
          <label>지도 마커 밀도 한도</label>
          <select id="optMarkerCap" class="select">
            <option value="800" ${o.markerCap === 800 ? 'selected' : ''}>고속 (최대 800개)</option>
            <option value="1500" ${o.markerCap === 1500 ? 'selected' : ''}>표준 (최대 1,500개)</option>
            <option value="3000" ${o.markerCap === 3000 ? 'selected' : ''}>정밀 (최대 3,000개)</option>
          </select>
        </div>
        <div class="opt-field">
          <label>마커 색상 모드</label>
          <select id="optMarkerMode" class="select">
            <option value="category" ${o.markerColorMode === 'category' ? 'selected' : ''}>🎨 업종 대분류 8색</option>
            <option value="new2026" ${o.markerColorMode === 'new2026' ? 'selected' : ''}>🆕 2026 신규개업 강조</option>
            <option value="density" ${o.markerColorMode === 'density' ? 'selected' : ''}>🏢 건물 입점 밀집도</option>
          </select>
        </div>
        <div class="opt-field" style="grid-column:1/-1;display:grid;grid-template-columns:repeat(2,1fr);gap:6px;padding-top:6px">
          <label style="margin:0;cursor:pointer;display:flex;align-items:center;gap:6px"><input id="optGroupBld" type="checkbox" ${o.groupBuildings ? 'checked' : ''} /> 🏢 동일건물 다중입점 배지 그룹핑</label>
          <label style="margin:0;cursor:pointer;display:flex;align-items:center;gap:6px"><input id="optLabels" type="checkbox" ${o.showStoreLabels ? 'checked' : ''} /> 🏷️ 확대 시(줌16+) 상호 라벨 표시</label>
          <label style="margin:0;cursor:pointer;display:flex;align-items:center;gap:6px"><input id="optBcg" type="checkbox" ${o.showBcgCharts ? 'checked' : ''} /> 📊 BCG 4분면·17시도 차트 표시</label>
          <label style="margin:0;cursor:pointer;display:flex;align-items:center;gap:6px"><input id="optQuant" type="checkbox" ${o.showQuantBadges ? 'checked' : ''} /> 📐 퀀트 지표(HHI·LQ·블루오션) 표시</label>
          <label style="margin:0;cursor:pointer;display:flex;align-items:center;gap:6px"><input id="optHeat" type="checkbox" ${o.autoHeat ? 'checked' : ''} /> 🔥 상권 밀도 히트맵 자동 켜기</label>
          <label style="margin:0;cursor:pointer;display:flex;align-items:center;gap:6px"><input id="optCad" type="checkbox" ${o.autoCadastral ? 'checked' : ''} /> 📐 연속지적도 기본 켜기</label>
          <label style="margin:0;cursor:pointer;display:flex;align-items:center;gap:6px"><input id="optZone" type="checkbox" ${o.autoZoning ? 'checked' : ''} /> 🏙️ 용도지역 기본 켜기</label>
        </div>
      </div>
    </div>

    <div class="opt-section">
      <h4>🔑 API 키 오버라이드 & AI 전략 엔진 (브라우저 로컬 전용)</h4>
      <div style="display:grid;gap:8px">
        <div class="opt-field">
          <label>공공데이터포털 인증키 (비워두면 암호화 볼트 내장키 자동 사용)</label>
          <input id="optKeyDataGo" class="input mono" type="password" value="${esc(ov.dataGo || '')}" placeholder="볼트 내장키 사용 중: ${esc(maskKey(S.core?.vaultKeys?.dataGo || ''))}" />
        </div>
        <div class="opt-field">
          <label>브이월드 인증키 (비워두면 볼트 내장키 자동 사용)</label>
          <input id="optKeyVworld" class="input mono" type="password" value="${esc(ov.vworld || '')}" placeholder="볼트 내장키 사용 중: ${esc(maskKey(S.core?.vaultKeys?.vworld || ''))}" />
        </div>
        <div class="opt-field">
          <label>Gemini AI API 키 (선택 · 입력 시 [✨ 전략 진단]에서 AI 심층 코멘트 생성)</label>
          <input id="optKeyGemini" class="input mono" type="password" value="${esc(o.geminiKey || '')}" placeholder="AIzaSy... (선택 사항)" />
        </div>
      </div>
    </div>
  `;

  $('optionsFoot').innerHTML = `
    <button id="btnOptSave" class="btn btn-primary btn-sm" type="button">💾 옵션 저장 및 즉시 적용</button>
    <button id="btnOptExport" class="btn btn-sm" type="button">📤 설정 JSON 백업</button>
    <button id="btnOptReset" class="btn btn-sm" type="button" style="margin-left:auto">↺ 기본값 복원</button>
  `;

  $('optionsBackdrop').classList.remove('hidden');

  $('optionsBody').querySelectorAll('[data-opt-preset]').forEach((b) => {
    b.addEventListener('click', () => {
      const k = b.dataset.optPreset;
      const w = STRATEGY_PRESETS[k].weights;
      $('optWCorp').value = w.corp; $('optWBid').value = w.bid; $('optWSbiz').value = w.sbiz; $('optWRe').value = w.re;
      $('optionsBody').querySelectorAll('[data-opt-preset]').forEach((x) => x.classList.toggle('active', x.dataset.optPreset === k));
      S.opts.preset = k;
    });
  });

  $('btnOptSave').addEventListener('click', () => {
    S.opts.bizPersona = $('optBizPersona')?.value || 'security';
    S.opts.weights = {
      corp: Math.max(0, Number($('optWCorp').value) || 0),
      bid: Math.max(0, Number($('optWBid').value) || 0),
      sbiz: Math.max(0, Number($('optWSbiz').value) || 0),
      re: Math.max(0, Number($('optWRe').value) || 0),
    };
    S.opts.baseMap = $('optBaseMap').value;
    S.opts.defaultRadius = Number($('optRadius').value) || 500;
    S.opts.markerCap = Number($('optMarkerCap').value) || 1500;
    S.opts.markerColorMode = $('optMarkerMode').value;
    S.opts.groupBuildings = $('optGroupBld').checked;
    S.opts.showStoreLabels = $('optLabels').checked;
    S.opts.showBcgCharts = $('optBcg').checked;
    S.opts.showQuantBadges = $('optQuant').checked;
    S.opts.autoHeat = $('optHeat').checked;
    S.opts.autoCadastral = $('optCad').checked;
    S.opts.autoZoning = $('optZone').checked;
    S.opts.geminiKey = $('optKeyGemini').value.trim();
    saveOpts();

    const newOv = {};
    if ($('optKeyDataGo').value.trim()) newOv.dataGo = $('optKeyDataGo').value.trim();
    if ($('optKeyVworld').value.trim()) newOv.vworld = $('optKeyVworld').value.trim();
    if (Object.keys(newOv).length) localStorage.setItem(OVERRIDE_KEYS, JSON.stringify(newOv));
    else localStorage.removeItem(OVERRIDE_KEYS);

    S.gisBase = S.opts.baseMap;
    S.gisRadius = S.opts.defaultRadius;
    S.gisLayers.heat = S.opts.autoHeat;
    S.gisLayers.cadastral = S.opts.autoCadastral;
    S.gisLayers.zoning = S.opts.autoZoning;
    recomputeFusionQuant();
    closeOptionsModal();
    toast('✓ 전문가 옵션이 저장 및 적용되었습니다!');
    renderCurrentTab();
  });

  $('btnOptExport').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify({ opts: S.opts, pipelineCount: S.pipeline.length }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `nexusone_options_${new Date().toISOString().slice(0, 10)}.json`; a.click();
  });

  $('btnOptReset').addEventListener('click', () => {
    S.opts = { ...DEFAULT_OPTS, weights: { ...DEFAULT_OPTS.weights } };
    saveOpts();
    localStorage.removeItem(OVERRIDE_KEYS);
    S.gisBase = S.opts.baseMap;
    S.gisRadius = S.opts.defaultRadius;
    recomputeFusionQuant();
    closeOptionsModal();
    toast('↺ 모든 전문가 옵션이 기본값으로 복원되었습니다.');
    renderCurrentTab();
  });
}
function closeOptionsModal() { $('optionsBackdrop').classList.add('hidden'); }

// ===== THEME & INIT =====
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(THEME_KEY, theme);
  $('btnTheme').textContent = theme === 'dark' ? '☀️' : '🌙';
}

async function init() {
  applyTheme(localStorage.getItem(THEME_KEY) || 'light');
  loadPipeline();

  $('btnTheme').addEventListener('click', () => applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));
  $('btnOptions').addEventListener('click', openOptionsModal);
  $('optionsClose').addEventListener('click', closeOptionsModal);
  $('optionsBackdrop').addEventListener('click', (e) => { if (e.target === $('optionsBackdrop')) closeOptionsModal(); });
  $('reportClose').addEventListener('click', closeReportModal);
  $('reportBackdrop').addEventListener('click', (e) => { if (e.target === $('reportBackdrop')) closeReportModal(); });
  $('brandHome').addEventListener('click', () => switchTab('overview'));
  $('btnGoPipe').addEventListener('click', () => switchTab('hub'));
  $('drawerClose').addEventListener('click', closeDrawer);
  $('drawerBackdrop').addEventListener('click', (e) => { if (e.target === $('drawerBackdrop')) closeDrawer(); });
  document.querySelectorAll('[data-tab]').forEach((b) => b.addEventListener('click', () => switchTab(b.dataset.tab)));

  $('btnLockOut').addEventListener('click', async () => {
    await idbClearKey();
    location.reload();
  });

  // Wire popup action helpers for Leaflet markers
  window._nxPipeStore = (id, title, sub, region) => {
    addToPipeline({ id: `sbiz:${id}`, domain: 'sbiz', title, sub, region, valueMan: 0 });
  };
  window._nxCatchHere = (lat, lon, label) => {
    const curActive = S.sbizActiveSlug ? S.sbizCache.get(S.sbizActiveSlug) : null;
    S.leafletMap?.closePopup();
    runRadiusCatchment(lat, lon, curActive, label);
  };

  wireOmniSearch();

  // Load vault manifest
  try {
    const r = await fetch('data/vault.json', { cache: 'no-store' });
    S.vault = await r.json();
  } catch (e) {
    $('lockErr').textContent = '볼트 메타데이터(data/vault.json)를 찾을 수 없습니다.';
    return;
  }

  // Try auto-unlock from IndexedDB non-extractable key
  const cachedKey = await idbGetKey();
  if (cachedKey && await verifyKey(cachedKey, S.vault)) {
    try {
      await unlockAndBoot(cachedKey);
      return;
    } catch {}
  }

  // Manual password submit
  $('lockForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const pw = $('lockPw').value;
    const btn = $('lockBtn'), err = $('lockErr');
    btn.disabled = true; btn.textContent = '🔓 PBKDF2 키 유도 및 복호화 중…'; err.textContent = '';
    try {
      const key = await deriveKey(pw, S.vault.salt, S.vault.iter);
      if (!await verifyKey(key, S.vault)) {
        err.textContent = '비밀번호가 일치하지 않습니다.';
        btn.disabled = false; btn.textContent = '🔐 통합 볼트 잠금 해제';
        return;
      }
      if ($('lockRemember').checked) await idbSetKey(key);
      await unlockAndBoot(key);
    } catch (ex) {
      err.textContent = `잠금 해제 실패: ${ex.message}`;
      btn.disabled = false; btn.textContent = '🔐 통합 볼트 잠금 해제';
    }
  });

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
}

init();
