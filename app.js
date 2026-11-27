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
    const saved = JSON.parse(localStorage.getItem(tStorageKey(OPT_KEY)) || '{}');
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
  try { localStorage.setItem(tStorageKey(OPT_KEY), JSON.stringify(S.opts)); } catch {}
}

// ===== V26 MASTER / BUYER MULTI-TENANT ENGINE · SALES CRM · TOP 10 EXPERT OPTIONS =====
const LEGACY_ADMIN_KEY = 'nx1_admin_sales_v1';
const MASTER_CFG_KEY = 'nx1_master_cfg_v26';
const MASTER_REG_KEY = 'nx1_seller_registry_v26';
const MASTER_AUDIT_KEY = 'nx1_audit_log_v26';
const MASTER_CONSENT_LOG_KEY = 'nx1_consent_log_v32';
const BUYER_DEFAULT_PW = 'admin';
const BUYER_DEFAULT_PW_HASH = '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918'; // sha256('admin')
const MASTER_DEFAULT_PIN_HASH = '849a1538e94c65c43747c85670b73eb5477b2c87f9e33fdd66e47f49c504427f'; // sha256('nx1master')

const INDIVIDUAL_PRO_APPS = [
  { key: 'corp', name: '🏢 기업분석앱 ↗', desc: '12만 법인 · EDA · 브이월드', color: 'var(--c-corp)', url: 'https://heebonpark.github.io/ca-v8x4k2/' },
  { key: 'bid', name: '🎯 입찰·영업기회 ↗', desc: '나라장터 · 사전규격 · 건설사', color: 'var(--c-bid)', url: 'https://heebonpark.github.io/bid-p9m3r7/' },
  { key: 'sbiz', name: '🏪 소상공인지도 ↗', desc: '275만 상가 · 16시도 GIS', color: 'var(--c-sbiz)', url: 'https://heebonpark.github.io/sbiz-m4q8w2/' },
  { key: 're', name: '🏠 홈레이더 ↗', desc: '청약 · 분양가 · 경쟁률 · 착공', color: 'var(--c-re)', url: 'https://heebonpark.github.io/hr-k7m2x9/' },
];

const SALES_PACKAGES = {
  standard: {
    label: '🟢 STANDARD',
    priceMan: 29,
    sub: '입찰 실무형 (크몽 29만원)',
    tabs: { overview: false, corp: false, bid: true, sbiz: false, realestate: false, hub: true },
    features: { bidDetail: true, bidSim: true, bidAwards: false, bidPartners: false, bidA4: false, bid1km: false },
    appLinks: { showSection: false, corp: false, bid: false, sbiz: false, re: false },
  },
  deluxe: {
    label: '🔵 DELUXE',
    priceMan: 59,
    sub: '입찰+기업 통합형 (크몽 59만원)',
    tabs: { overview: true, corp: true, bid: true, sbiz: false, realestate: false, hub: true },
    features: { bidDetail: true, bidSim: true, bidAwards: true, bidPartners: true, bidA4: true, bid1km: false },
    appLinks: { showSection: false, corp: false, bid: false, sbiz: false, re: false },
  },
  premium: {
    label: '🟣 PREMIUM',
    priceMan: 119,
    sub: '4대 도메인 전체 (크몽 119만원)',
    tabs: { overview: true, corp: true, bid: true, sbiz: true, realestate: true, hub: true },
    features: { bidDetail: true, bidSim: true, bidAwards: true, bidPartners: true, bidA4: true, bid1km: true },
    appLinks: { showSection: false, corp: false, bid: false, sbiz: false, re: false },
  },
  enterprise: {
    label: '👑 ENTERPRISE / 마스터',
    priceMan: 250,
    sub: '화이트라벨 B2B · 개별앱 포함 (250만원+)',
    tabs: { overview: true, corp: true, bid: true, sbiz: true, realestate: true, hub: true },
    features: { bidDetail: true, bidSim: true, bidAwards: true, bidPartners: true, bidA4: true, bid1km: true },
    appLinks: { showSection: true, corp: true, bid: true, sbiz: true, re: true },
  },
};

const EXPERT_TECHNIQUES_10 = [
  { key: 'signedToken', num: 1, title: '🔐 무결성 서명 라이선스 토큰', desc: '판매링크(?lic=)에 위변조 방지 서명 체크섬 강제 · URL 임의 수정 시 즉시 차단' },
  { key: 'tenantIsolation', num: 2, title: '🧩 멀티테넌트 스토리지 완전 격리', desc: '판매자 마스터와 구매자 설정·파이프라인·서류함 키 분리 · 마스터 모드 오염 원천 차단' },
  { key: 'forcePwChange', num: 3, title: '🔑 구매자 초기 비번(admin) 강제 변경', desc: '구매자 최초 접속/초기화 시 보안 안내 배너 + admin 로그인 즉시 새 비밀번호 설정 강제' },
  { key: 'oneTimeReset', num: 4, title: '♻️ 1회용 원격 비밀번호 초기화 링크', desc: '만료시간·논스 서명 토큰으로 원격 고객사 기기의 구매자 관리자 비번을 admin으로 안전 초기화' },
  { key: 'expiryEngine', num: 5, title: '⏳ 구독 만료일 · D-7 갱신 알림 엔진', desc: '만료 D-7부터 상단 갱신 안내 배너 노출 · 만료 시 잠금 또는 읽기전용 자동 전환' },
  { key: 'rbacStrict', num: 6, title: '🎭 3단계 RBAC 권한 경계 분리', desc: '판매자 마스터 / 구매자 사내관리자 / 일반직원 권한 완전 분리 · 단축키 마스터 PIN 보호' },
  { key: 'a4Watermark', num: 7, title: '🎨 화이트라벨 & A4 PDF 동적 워터마크', desc: '고객사 브랜드명·라이선스 코드·담당부서를 잠금화면·헤더·A4 검토서에 자동 각인' },
  { key: 'revocationGuard', num: 8, title: '🚫 원격 라이선스 정지 (Kill-Switch)', desc: '판매현황에서 정지 처리된 라이선스 접근 차단 + 판매자 갱신 연락처 안내 화면 표시' },
  { key: 'auditTrail', num: 9, title: '📜 보안 감사 로그 (Audit Trail)', desc: '라이선스 발급·비번변경·초기화·정지·접근 이력을 타임스탬프와 함께 자동 기록·CSV 출력' },
  { key: 'deliveryKit', num: 10, title: '📦 원클릭 고객 납품 키트 생성기', desc: '구매사 전용 A4 납품확인서 + 카톡 전달용 안내문(전용링크·초기비번 admin 가이드) 자동 생성' },
];

function defaultExpertOpts() {
  return {
    signedToken: true,
    tenantIsolation: true,
    forcePwChange: true,
    oneTimeReset: true,
    expiryEngine: true,
    rbacStrict: true,
    a4Watermark: true,
    revocationGuard: true,
    auditTrail: true,
    deliveryKit: true,
    expiryMode: 'lock',     // lock | readonly
    resetHours: 72,         // 24 | 72 | 168
  };
}

function signTokenStr(str) {
  let h1 = 0x811c9dc5;
  let h2 = 0x27d4eb2d;
  const src = `NX1-LIC-SIG-V26-KR::${str}::SALT9`;
  for (let i = 0; i < src.length; i++) {
    const ch = src.charCodeAt(i);
    h1 ^= ch;
    h1 = Math.imul(h1, 0x01000193);
    h2 ^= (ch + (i & 255));
    h2 = Math.imul(h2, 0x85ebca6b);
  }
  const a = (h1 >>> 0).toString(36).padStart(6, '0').slice(-6);
  const b = (h2 >>> 0).toString(36).padStart(6, '0').slice(-6);
  return `${a}${b}`;
}

async function sha256Hex(text) {
  const s = String(text ?? '');
  try {
    if (crypto?.subtle) {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
      return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
    }
  } catch {}
  return `fb_${signTokenStr(s)}`;
}

function toBase64Url(obj) {
  const bytes = new TextEncoder().encode(JSON.stringify(obj));
  let bin = '';
  bytes.forEach((b) => { bin += String.fromCharCode(b); });
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(b64) {
  const pad = b64.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((b64.length + 3) % 4);
  const bin = atob(pad);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return JSON.parse(new TextDecoder().decode(bytes));
}

function createClientSampleConfig() {
  return {
    licId: 'HB-2026-DLX-001',
    companyName: '㈜한빛안전건설',
    sellerName: '본사 직판 (마스터)',
    sellerCode: 'SLR-001',
    pkg: 'deluxe',
    priceMan: 59,
    brandTitle: '한빛 입찰레이더',
    brandBadge: 'PRO',
    brandSub: '㈜한빛안전건설 전용 · 실시간 나라장터·투찰분석·12만 기업 인텔리전스',
    expiryDate: '',
    expiryMode: 'lock',
    forcePwChange: true,
    a4Watermark: true,
    rbacStrict: true,
    hideAdminBtn: false,
    tabs: { ...SALES_PACKAGES.deluxe.tabs },
    features: { ...SALES_PACKAGES.deluxe.features },
    appLinks: { showSection: false, corp: false, bid: false, sbiz: false, re: false },
  };
}

function defaultAdminConfig() {
  return {
    licId: 'MASTER',
    companyName: '넥서스원 본사 (마스터)',
    sellerName: '본사 직판 (마스터)',
    sellerCode: 'SLR-001',
    pkg: 'enterprise',
    priceMan: 250,
    brandTitle: '넥서스원',
    brandBadge: 'PRO',
    brandSub: '',
    expiryDate: '',
    expiryMode: 'lock',
    forcePwChange: true,
    a4Watermark: false,
    rbacStrict: true,
    hideAdminBtn: false,
    tabs: { ...SALES_PACKAGES.enterprise.tabs },
    features: { ...SALES_PACKAGES.enterprise.features },
    appLinks: { ...SALES_PACKAGES.enterprise.appLinks },
  };
}

function peekRegistryRawSafe() {
  try {
    return JSON.parse(localStorage.getItem(MASTER_REG_KEY) || 'null');
  } catch {
    return null;
  }
}

function encodeSignedLicense(cfg, expertOpts = null) {
  const rawReg = peekRegistryRawSafe();
  const eo = expertOpts || (rawReg?.expertOpts ? { ...defaultExpertOpts(), ...rawReg.expertOpts } : defaultExpertOpts());
  const cp = { ...defaultConsentPolicy(), ...(rawReg?.consentPolicy || {}) };
  const al = cfg.appLinks || {};
  const enabledApps = al.showSection ? INDIVIDUAL_PRO_APPS.filter((a) => al[a.key]).map((a) => a.key) : [];
  const compact = {
    v: 26,
    id: cfg.licId || `NX-${new Date().getFullYear()}-${String(Math.floor(100 + Math.random() * 900))}`,
    co: cfg.companyName || cfg.brandTitle || '고객사',
    sl: cfg.sellerName || '본사 직판 (마스터)',
    sc: cfg.sellerCode || 'SLR-001',
    p: cfg.pkg || 'deluxe',
    bt: cfg.brandTitle || '넥서스원',
    bb: cfg.brandBadge ?? 'PRO',
    bs: cfg.brandSub || '',
    t: Object.entries(cfg.tabs || {}).filter(([, v]) => v).map(([k]) => k),
    f: Object.entries(cfg.features || {}).filter(([, v]) => v).map(([k]) => k),
    als: al.showSection ? 1 : 0,
    al: enabledApps,
    sd: cfg.startDate || '',
    exp: cfg.expiryDate || '',
    em: cfg.expiryMode || eo.expiryMode || 'lock',
    fp: (cfg.forcePwChange !== undefined ? cfg.forcePwChange : eo.forcePwChange) ? 1 : 0,
    wm: (cfg.a4Watermark !== undefined ? cfg.a4Watermark : eo.a4Watermark) ? 1 : 0,
    rb: (cfg.rbacStrict !== undefined ? cfg.rbacStrict : eo.rbacStrict) ? 1 : 0,
    fr: cfg.isFree ? 1 : 0,
    ft: cfg.freeType || '',
    sm: cfg.simpleFreeMode ? 1 : 0,
    ce: (cfg.consentEnabled !== undefined ? cfg.consentEnabled : (cp.enabled !== false)) ? 1 : 0,
    cv: cfg.consentVersion || cp.version || '2026.11-v1',
  };
  const b64 = toBase64Url(compact);
  return `${b64}.${signTokenStr(b64)}`;
}

function decodeSignedLicense(token, requireSig = true) {
  try {
    const parts = String(token || '').split('.');
    if (parts.length !== 2) return { ok: false, reason: 'FORMAT' };
    const [b64, sig] = parts;
    if (requireSig && signTokenStr(b64) !== sig) return { ok: false, reason: 'TAMPERED' };
    const c = fromBase64Url(b64);
    const base = defaultAdminConfig();
    base.licId = c.id || 'CLIENT-001';
    base.companyName = c.co || c.bt || '구매 고객사';
    base.sellerName = c.sl || '본사 직판 (마스터)';
    base.sellerCode = c.sc || 'SLR-001';
    if (c.p) base.pkg = c.p;
    if (typeof c.bt === 'string' && c.bt) base.brandTitle = c.bt;
    if (typeof c.bb === 'string') base.brandBadge = c.bb;
    if (typeof c.bs === 'string') base.brandSub = c.bs;
    base.startDate = c.sd || '';
    base.expiryDate = c.exp || '';
    base.expiryMode = c.em || 'lock';
    base.isFree = Boolean(c.fr);
    base.freeType = c.ft || '';
    base.simpleFreeMode = Boolean(c.sm);
    base.consentEnabled = c.ce !== 0;
    base.consentVersion = c.cv || '';
    base.forcePwChange = base.simpleFreeMode ? false : (c.fp !== 0);
    base.a4Watermark = c.wm !== 0;
    base.rbacStrict = c.rb !== 0;
    base.hideAdminBtn = base.simpleFreeMode; // Simple staff/friend mode hides admin button cleanly!
    if (Array.isArray(c.t)) Object.keys(base.tabs).forEach((k) => { base.tabs[k] = c.t.includes(k); });
    if (Array.isArray(c.f)) Object.keys(base.features).forEach((k) => { base.features[k] = c.f.includes(k); });
    const showSec = Boolean(c.als);
    base.appLinks = {
      showSection: showSec,
      corp: showSec && Array.isArray(c.al) && c.al.includes('corp'),
      bid: showSec && Array.isArray(c.al) && c.al.includes('bid'),
      sbiz: showSec && Array.isArray(c.al) && c.al.includes('sbiz'),
      re: showSec && Array.isArray(c.al) && c.al.includes('re'),
    };
    return { ok: true, cfg: base };
  } catch {
    return { ok: false, reason: 'DECODE_ERR' };
  }
}

function decodeLegacyCfg(b64) {
  try {
    const c = fromBase64Url(b64);
    const base = defaultAdminConfig();
    base.licId = c.id || (c.bt && c.bt.includes('한빛') ? 'HB-2026-DLX-001' : `LEGACY-${signTokenStr(b64).slice(0, 6).toUpperCase()}`);
    base.companyName = c.co || (c.bt && c.bt.includes('한빛') ? '㈜한빛안전건설' : (c.bt || '구매 고객사'));
    base.sellerName = c.sl || '본사 직판 (마스터)';
    if (c.p) base.pkg = c.p;
    if (typeof c.bt === 'string' && c.bt) base.brandTitle = c.bt;
    if (typeof c.bb === 'string') base.brandBadge = c.bb;
    if (typeof c.bs === 'string') base.brandSub = c.bs;
    base.hideAdminBtn = false;
    base.forcePwChange = true;
    base.a4Watermark = true;
    if (Array.isArray(c.t)) Object.keys(base.tabs).forEach((k) => { base.tabs[k] = c.t.includes(k); });
    if (Array.isArray(c.f)) Object.keys(base.features).forEach((k) => { base.features[k] = c.f.includes(k); });
    const showSec = c.als !== undefined ? Boolean(c.als) : false;
    base.appLinks = {
      showSection: showSec,
      corp: showSec && Array.isArray(c.al) && c.al.includes('corp'),
      bid: showSec && Array.isArray(c.al) && c.al.includes('bid'),
      sbiz: showSec && Array.isArray(c.al) && c.al.includes('sbiz'),
      re: showSec && Array.isArray(c.al) && c.al.includes('re'),
    };
    return base;
  } catch { return null; }
}

function buildRemoteResetToken(licId, hours = 72) {
  const payload = {
    id: licId,
    n: `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    exp: Date.now() + Math.max(1, Number(hours) || 72) * 3600 * 1000,
  };
  const b64 = toBase64Url(payload);
  return `${b64}.${signTokenStr(`RST:${b64}`)}`;
}

function verifyRemoteResetToken(token, expectedLicId) {
  try {
    const parts = String(token || '').split('.');
    if (parts.length !== 2) return { ok: false, msg: '초기화 토큰 형식이 올바르지 않습니다.' };
    const [b64, sig] = parts;
    if (signTokenStr(`RST:${b64}`) !== sig) return { ok: false, msg: '초기화 토큰 서명이 위변조되었습니다.' };
    const p = fromBase64Url(b64);
    if (p.id !== expectedLicId) return { ok: false, msg: '다른 고객사 라이선스용 초기화 토큰입니다.' };
    if (Date.now() > Number(p.exp || 0)) return { ok: false, msg: '만료된 비밀번호 초기화 링크입니다. 판매자에게 재발급을 요청하세요.' };
    return { ok: true, nonce: p.n, exp: p.exp };
  } catch {
    return { ok: false, msg: '초기화 토큰 해석에 실패했습니다.' };
  }
}

// ===== SELLER CRM REGISTRY (DELIVERED CUSTOMERS · PAYMENT · TAX INVOICE · SELLERS · TOP 10 OPTIONS) =====
const SALES_CHANNELS = ['크몽', '본사직판', '유튜브/쇼츠', '지인소개', '블로그/검색', '파트너/대리점', '전시회/세미나', '기타'];
const FACILITY_TYPES = ['건설·안전시설', '전기·통신·소방', '보안·CCTV·출입통제', '공동주택·시설관리', '법인영업/RM', '프랜차이즈·상권', '부동산·분양', '기타'];
const PAY_STATUSES = ['입금완료', '미수(대기)', '부분입금', '환불·취소'];
const PAY_METHODS = ['계좌이체', '크몽정산', '법인카드', '현금영수증', '후불/어음'];
const TAX_STATUSES = ['발급완료', '미발급', '발급요청', '해당없음(크몽/카드)'];
const TAX_QUICK_LINKS = [
  { key: 'hometax', icon: '🏛️', name: '국세청 홈택스', sub: '전자세금계산서·부가세·현금영수증', url: 'https://www.hometax.go.kr/', color: '#2563eb' },
  { key: 'bizcheck', icon: '🔍', name: '사업자 휴·폐업 조회', sub: '거래처 사업자등록·과세유형 확인', url: 'https://teht.hometax.go.kr/websquare/websquare.html?w2xPath=/ui/ab/a/a/UTEABAAA13.xml', color: '#0284c7' },
  { key: 'wetax', icon: '🏦', name: '위택스 (지방세)', sub: '지방소득세 신고 · 완납증명', url: 'https://www.wetax.go.kr/', color: '#059669' },
  { key: 'gov24', icon: '📜', name: '정부24 (증명서)', sub: '국세·지방세 납세증명·사업자증명', url: 'https://www.gov.kr/', color: '#4f46e5' },
  { key: 'iros', icon: '🏢', name: '인터넷등기소', sub: '법인등기부등본 열람 · 발급', url: 'https://www.iros.go.kr/', color: '#7c3aed' },
  { key: '4insure', icon: '🛡️', name: '4대사회보험센터', sub: '4대보험 완납증명서 · 가입내역', url: 'https://www.4insure.or.kr/', color: '#0d9488' },
  { key: 'cardsales', icon: '💳', name: '여신금융협회', sub: '신용카드 매출 · 입금정산 조회', url: 'https://www.cardsales.or.kr/', color: '#d97706' },
  { key: 'popbill', icon: '⚡', name: '팝빌 (Popbill)', sub: '국세청 전자세금계산서 API 연동', url: 'https://www.popbill.com/', color: '#e11d48' },
  { key: 'bolta', icon: '⚡', name: '볼타 (Bolta)', sub: '클라우드 전자세금계산서 REST API', url: 'https://bolta.io/', color: '#6366f1' },
  { key: 'barobill', icon: '⚡', name: '바로빌 (Barobill)', sub: '세금계산서 · 계좌입금조회 API', url: 'https://www.barobill.co.kr/', color: '#0f766e' },
];
const FREE_RECIPIENT_TYPES = [
  { key: 'staff', label: '👨‍💼 사내 직원', prefix: 'FREE-STF', defaultDays: 0 },
  { key: 'friend', label: '🤝 지인 / 가족', prefix: 'FREE-VIP', defaultDays: 0 },
  { key: 'trial', label: '🎁 무료 체험판', prefix: 'FREE-TRL', defaultDays: 14 },
  { key: 'partner', label: '🤝 파트너 / 협력사', prefix: 'FREE-PRT', defaultDays: 90 },
];
const SUSPEND_REASONS = [
  '대금 미납 / 연체로 인한 직권 중지',
  '계약(체험) 사용기간 만료',
  '임직원 퇴사 / 권한 회수',
  '약관 위반 / 무단 링크 공유',
  '고객사 요청에 의한 일시 중지',
];

function defaultRemoteSyncConfig() {
  return {
    repo: 'heebonpark/nx1-p7k9v3',
    branch: 'main',
    path: 'data/license_control.json',
    token: '',
  };
}

// ===== V32 FIRST-LOGIN PRIVACY, TERMS & SECURITY CONSENT GOVERNANCE =====
function defaultConsentPolicy() {
  return {
    enabled: true,
    skipForMaster: false,
    version: '2026.11-v1',
    title: '개인정보보호 및 서비스 이용약관 동의 안내',
    cpoName: '개인정보보호책임자 (관리자)',
    cpoContact: '본사 담당자 문의',
    customNotice: '본 플랫폼은 서버 평문 0바이트·AES-256-GCM 브라우저 로컬 암호화 원칙으로 동작하며, 조회된 공공·기업 데이터는 합법적인 B2B 영업 및 입찰 검토 목적으로만 활용해야 합니다.',
  };
}

function consentStateKey(tid) {
  return `nx1_consent_${tid || 'MASTER'}_v32`;
}

function loadConsentState(tid) {
  try { return JSON.parse(localStorage.getItem(consentStateKey(tid)) || 'null'); } catch { return null; }
}

function saveConsentState(tid, rec) {
  try { localStorage.setItem(consentStateKey(tid), JSON.stringify(rec)); } catch {}
}

function loadConsentLogs() {
  try { return JSON.parse(localStorage.getItem(MASTER_CONSENT_LOG_KEY) || '[]'); } catch { return []; }
}

function appendConsentLog(rec) {
  try {
    const list = loadConsentLogs();
    list.unshift(rec);
    localStorage.setItem(MASTER_CONSENT_LOG_KEY, JSON.stringify(list.slice(0, 300)));
  } catch {}
}

function getEffectiveConsentPolicy() {
  const reg = loadSellerRegistry();
  const base = { ...defaultConsentPolicy(), ...(reg.consentPolicy || {}), ...(typeof S !== 'undefined' && S?.remoteConsentPolicy ? S.remoteConsentPolicy : {}) };
  if (typeof S !== 'undefined' && S?.isBuyerMode) {
    if (S.admin?.consentEnabled === false && !S.remoteConsentPolicy) base.enabled = false;
    if (S.admin?.consentVersion && S.admin.consentVersion > base.version) base.version = S.admin.consentVersion;
  }
  return base;
}

function openConsentModal(opts = {}) {
  const preview = Boolean(opts.preview);
  const readOnly = Boolean(opts.readOnly);
  const cp = getEffectiveConsentPolicy();
  const tid = S.tenantId || 'MASTER';
  const curRec = loadConsentState(tid);
  const brandLabel = `${S.admin?.brandTitle || '넥서스원'} ${S.admin?.brandBadge || 'PRO'}`.trim();
  const defaultSigner = curRec?.signer || (S.isBuyerMode ? (S.admin?.companyName || '') : '마스터 관리자');

  $('consentModalTitle').textContent = `📋 ${cp.title || '개인정보보호 및 서비스 이용약관 동의'}`;
  $('consentModalSub').textContent = `${brandLabel} · 약관 버전 ${cp.version}${preview ? ' (관리자 미리보기)' : ''}${readOnly ? ' (동의 완료 내역 열람)' : ''}`;
  $('consentClosePreview')?.classList.toggle('hidden', !(preview || readOnly));

  const checkedAll = readOnly && Boolean(curRec);
  $('consentBody').innerHTML = `
    <div class="domain-box" style="margin-bottom:10px;border-color:rgba(79,70,229,.35);background:rgba(79,70,229,.05)">
      <div style="font-size:12px;line-height:1.55;color:var(--text-2)">
        <b>🛡️ 안내사항</b>: ${esc(cp.customNotice)}<br>
        <span style="font-size:11px;color:var(--muted)">• 개인정보보호책임자(CPO): <b>${esc(cp.cpoName)}</b> (${esc(cp.cpoContact)}) · 라이선스: <code>${esc(tid)}</code></span>
      </div>
    </div>

    ${readOnly && curRec ? `
      <div class="domain-box" style="margin-bottom:10px;border-color:rgba(16,185,129,.4);background:rgba(16,185,129,.06);font-size:12px">
        ✅ <b>동의 완료 기록</b> — 동의자: <b>${esc(curRec.signer)}</b> · 일시: <b>${esc(curRec.agreedAt)}</b> · 버전: <code>${esc(curRec.version)}</code> · 마케팅 수신: <b>${curRec.marketing ? '동의' : '미동의'}</b>
      </div>` : ''}

    <div class="domain-box" style="margin-bottom:10px;background:var(--surface-2)">
      <label style="display:flex;align-items:center;gap:8px;font-size:13px;font-weight:800;cursor:pointer">
        <input id="cAllAgree" type="checkbox" ${checkedAll ? 'checked disabled' : ''} style="width:16px;height:16px" />
        <span>전체 약관 및 개인정보보호·보안서약에 모두 동의합니다. (선택 포함)</span>
      </label>
    </div>

    <div style="display:grid;gap:8px;margin-bottom:10px">
      <div class="domain-box">
        <label style="display:flex;align-items:center;gap:7px;font-size:12.5px;font-weight:700;cursor:pointer">
          <input id="cReqPrivacy" type="checkbox" class="c-req" ${checkedAll ? 'checked disabled' : ''} />
          <span style="color:#e11d48">[필수]</span> <span>개인정보 수집·이용 및 개인정보보호법 준수 동의</span>
        </label>
        <details style="margin-top:5px;font-size:11.5px;color:var(--muted)">
          <summary style="cursor:pointer;font-weight:700;color:var(--c-corp)">전문 보기</summary>
          <div style="margin-top:5px;padding:7px 9px;background:var(--surface-2);border-radius:7px;line-height:1.55">
            1. <b>수집·보관 항목</b>: 접속 브라우저 내 사내 설정, 동의자 성명/부서, 동의 일시, CRM 파이프라인 및 서류함 메모.<br>
            2. <b>보안 원칙</b>: 모든 핵심 데이터는 <b>AES-256-GCM 클라이언트 암호화 및 브라우저 로컬 스토리지</b>에만 보관되며 외부 서버에 평문 전송되지 않습니다.<br>
            3. <b>보유·파기</b>: 이용 종료 또는 브라우저 캐시·스토리지 초기화 시 즉시 파기됩니다. (개인정보보호법 제15조 준수)
          </div>
        </details>
      </div>

      <div class="domain-box">
        <label style="display:flex;align-items:center;gap:7px;font-size:12.5px;font-weight:700;cursor:pointer">
          <input id="cReqTerms" type="checkbox" class="c-req" ${checkedAll ? 'checked disabled' : ''} />
          <span style="color:#e11d48">[필수]</span> <span>서비스 이용약관 및 라이선스 범위 준수 동의</span>
        </label>
        <details style="margin-top:5px;font-size:11.5px;color:var(--muted)">
          <summary style="cursor:pointer;font-weight:700;color:var(--c-corp)">전문 보기</summary>
          <div style="margin-top:5px;padding:7px 9px;background:var(--surface-2);border-radius:7px;line-height:1.55">
            1. 발급된 전용 링크 및 라이선스는 계약된 고객사·임직원(또는 지정 수령인)의 내부 업무 용도로만 사용할 수 있습니다.<br>
            2. 전용 링크의 무단 재배포, 제3자 양도, URL 토큰 위변조 시도 시 관리자 직권으로 즉시 사용이 중지될 수 있습니다.<br>
            3. 기간 제한 라이선스는 지정된 시작일~종료일 범위 내에서만 제공됩니다.
          </div>
        </details>
      </div>

      <div class="domain-box">
        <label style="display:flex;align-items:center;gap:7px;font-size:12.5px;font-weight:700;cursor:pointer">
          <input id="cReqSecurity" type="checkbox" class="c-req" ${checkedAll ? 'checked disabled' : ''} />
          <span style="color:#e11d48">[필수]</span> <span>공공·기업·상권 데이터 적법 활용 및 보안서약</span>
        </label>
        <details style="margin-top:5px;font-size:11.5px;color:var(--muted)">
          <summary style="cursor:pointer;font-weight:700;color:var(--c-corp)">전문 보기</summary>
          <div style="margin-top:5px;padding:7px 9px;background:var(--surface-2);border-radius:7px;line-height:1.55">
            1. 나라장터·DART·국민연금·소상공인·부동산 공공데이터 및 추정매출 지표는 의사결정 참고용이며, 최종 투찰·계약 책임은 이용자에게 있습니다.<br>
            2. 조회된 연락처·기업정보를 불법 스팸, 무차별 대량 발송, 개인정보 침해 용도로 활용하지 않을 것을 서약합니다.
          </div>
        </details>
      </div>

      <div class="domain-box">
        <label style="display:flex;align-items:center;gap:7px;font-size:12px;cursor:pointer">
          <input id="cOptMkt" type="checkbox" ${readOnly ? `${curRec?.marketing ? 'checked' : ''} disabled` : ''} />
          <span style="color:var(--muted)">[선택]</span> <span>신규 기능 업데이트 · 업그레이드 · 세무/입찰 가이드 안내 수신 동의</span>
        </label>
      </div>
    </div>

    ${!readOnly ? `
      <label style="font-size:11.5px;color:var(--muted);display:block">동의 확인자 성명 / 부서 (동의 이력 보관용)
        <input id="cSigner" class="input" value="${esc(defaultSigner)}" placeholder="예: 홍길동 팀장 / 영업기획팀" style="width:100%;margin-top:3px;font-size:12px" />
      </label>` : ''}
  `;

  $('consentFoot').innerHTML = readOnly
    ? `<button id="btnConsentCloseOk" class="btn btn-primary btn-sm" type="button" style="margin-left:auto">확인 닫기</button>`
    : (preview
      ? `<button id="btnConsentCloseOk" class="btn btn-primary btn-sm" type="button" style="margin-left:auto">미리보기 닫기</button>`
      : `
        <button id="btnConsentDecline" class="btn btn-sm" type="button">🚪 미동의 (로그아웃)</button>
        <button id="btnConsentAccept" class="btn btn-primary btn-sm" type="button" disabled style="margin-left:auto">✅ 필수 항목 동의하고 시작하기</button>
      `);

  $('consentBackdrop')?.classList.remove('hidden');

  const closeModal = () => $('consentBackdrop')?.classList.add('hidden');
  $('consentClosePreview')?.addEventListener('click', closeModal);
  $('btnConsentCloseOk')?.addEventListener('click', closeModal);

  if (!readOnly && !preview) {
    const reqBoxes = Array.from($('consentBody').querySelectorAll('.c-req'));
    const optBox = $('cOptMkt');
    const allBox = $('cAllAgree');
    const acceptBtn = $('btnConsentAccept');
    const syncConsentBtns = () => {
      const allReq = reqBoxes.every((cb) => cb.checked);
      if (acceptBtn) acceptBtn.disabled = !allReq;
      if (allBox) allBox.checked = allReq && Boolean(optBox?.checked);
    };
    allBox?.addEventListener('change', () => {
      const on = allBox.checked;
      reqBoxes.forEach((cb) => { cb.checked = on; });
      if (optBox) optBox.checked = on;
      syncConsentBtns();
    });
    [...reqBoxes, optBox].forEach((cb) => cb?.addEventListener('change', syncConsentBtns));

    $('btnConsentDecline')?.addEventListener('click', async () => {
      appendAudit('CONSENT_DECLINED', tid, `약관 버전 ${cp.version} 미동의 — 잠금 화면 복귀`);
      await idbClearKey();
      location.reload();
    });

    acceptBtn?.addEventListener('click', () => {
      if (!reqBoxes.every((cb) => cb.checked)) {
        toast('필수 항목 3가지를 모두 체크해 주세요.');
        return;
      }
      const signer = $('cSigner')?.value.trim() || (S.isBuyerMode ? (S.admin?.companyName || '구매자') : '마스터 관리자');
      const rec = {
        tenantId: tid,
        brand: brandLabel,
        signer,
        version: cp.version,
        agreedAt: new Date().toLocaleString('ko-KR'),
        privacy: true,
        terms: true,
        security: true,
        marketing: Boolean(optBox?.checked),
      };
      saveConsentState(tid, rec);
      appendConsentLog(rec);
      appendAudit('CONSENT_AGREED', tid, `약관 ${cp.version} 동의 완료 (동의자: ${signer}, 마케팅: ${rec.marketing ? 'Y' : 'N'})`);
      closeModal();
      toast(`✅ 개인정보보호 및 이용약관(${cp.version}) 동의가 완료되었습니다.`);
    });
  }
}

function maybePromptConsentOnLogin() {
  if (S.isBuyerMode && ['TAMPERED', 'REVOKED', 'NOT_STARTED', 'EXPIRED_LOCK'].includes(S.licenseStatus?.state)) return;
  const cp = getEffectiveConsentPolicy();
  if (!cp.enabled) return;
  if (!S.isBuyerMode && cp.skipForMaster) return;
  const cur = loadConsentState(S.tenantId || 'MASTER');
  if (cur && cur.version === cp.version && cur.privacy && cur.terms && cur.security) return;
  openConsentModal({ preview: false, readOnly: false });
}

function nextSeqId(list, prefix, field = 'licId') {
  let maxN = 0;
  const pfx = `${prefix}-`;
  (list || []).forEach((item) => {
    const val = String(item?.[field] || '');
    if (val.startsWith(pfx)) {
      const m = val.slice(pfx.length).match(/(\d+)$/);
      if (m) maxN = Math.max(maxN, parseInt(m[1], 10));
    }
  });
  return `${prefix}-${String(maxN + 1).padStart(3, '0')}`;
}

function buildLicenseControlPayload(reg) {
  const overrides = { ...(reg.controlOverrides || {}) };
  const allItems = [...(reg.sales || []), ...(reg.freeDist || [])];
  allItems.forEach((x) => {
    const isRev = x.status === 'revoked' || (reg.revoked || []).includes(x.licId);
    if (isRev || x.startDate || x.expiryDate || x.suspendReason || overrides[x.licId]) {
      overrides[x.licId] = {
        status: isRev ? 'suspended' : 'active',
        reason: isRev ? (x.suspendReason || overrides[x.licId]?.reason || '관리자 직권으로 사용이 중지되었습니다.') : '',
        startDate: x.startDate || '',
        expiryDate: x.expiryDate || '',
        updatedAt: new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 19).replace('T', ' '),
      };
    }
  });
  return {
    updatedAt: new Date(Date.now() + 9 * 3600 * 1000).toISOString(),
    version: 1,
    consentPolicy: reg.consentPolicy ? { ...defaultConsentPolicy(), ...reg.consentPolicy } : defaultConsentPolicy(),
    overrides,
  };
}

function downloadLicenseControlJson(reg) {
  const payload = buildLicenseControlPayload(reg);
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'license_control.json';
  a.click();
}

async function publishLicenseControlToGithub(reg) {
  const rs = { ...defaultRemoteSyncConfig(), ...(reg.remoteSync || {}) };
  if (!rs.token || !rs.repo) {
    return { ok: false, noToken: true, msg: '원격 동기화 GitHub 토큰이 설정되지 않았습니다.' };
  }
  const apiUrl = `https://api.github.com/repos/${rs.repo}/contents/${rs.path}`;
  const headers = {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${rs.token}`,
    'Content-Type': 'application/json',
  };
  let sha = '';
  try {
    const getRes = await fetch(`${apiUrl}?ref=${encodeURIComponent(rs.branch || 'main')}`, { headers, cache: 'no-store' });
    if (getRes.ok) {
      const meta = await getRes.json();
      sha = meta.sha || '';
    }
  } catch {}
  const jsonText = JSON.stringify(buildLicenseControlPayload(reg), null, 2) + '\n';
  const bytes = new TextEncoder().encode(jsonText);
  let bin = '';
  bytes.forEach((b) => { bin += String.fromCharCode(b); });
  const body = {
    message: `chore(license): update remote license_control.json (${new Date().toISOString().slice(0, 16)})`,
    content: btoa(bin),
    branch: rs.branch || 'main',
    ...(sha ? { sha } : {}),
  };
  const putRes = await fetch(apiUrl, { method: 'PUT', headers, body: JSON.stringify(body) });
  if (!putRes.ok) {
    const errJ = await putRes.json().catch(() => ({}));
    return { ok: false, msg: errJ.message || `GitHub API HTTP ${putRes.status}` };
  }
  return { ok: true, msg: '원격 license_control.json 동기화 완료! (약 20초 내 전 고객 기기 반영)' };
}

function evaluateLicensePolicy(adminCfg, reg, remoteOverrides = null) {
  const eo = reg?.expertOpts || defaultExpertOpts();
  const tid = adminCfg?.licId || 'CLIENT-001';
  const saleRec = (reg?.sales || []).find((x) => x.licId === tid);
  const freeRec = (reg?.freeDist || []).find((x) => x.licId === tid);
  const localOv = (reg?.controlOverrides || {})[tid] || null;
  const remoteOv = remoteOverrides ? (remoteOverrides[tid] || null) : null;

  // Remote override takes priority for cross-device authority control; fallback to local registry
  const effStatus = remoteOv?.status || localOv?.status || ((saleRec?.status === 'revoked' || freeRec?.status === 'revoked' || (reg?.revoked || []).includes(tid)) ? 'suspended' : 'active');
  const effReason = remoteOv?.reason || localOv?.reason || saleRec?.suspendReason || freeRec?.suspendReason || '';
  const effStart = (remoteOv && remoteOv.startDate !== undefined && remoteOv.startDate !== '') ? remoteOv.startDate : (localOv?.startDate || saleRec?.startDate || freeRec?.startDate || adminCfg.startDate || '');
  const effExpiry = (remoteOv && remoteOv.expiryDate !== undefined && remoteOv.expiryDate !== '') ? remoteOv.expiryDate : (localOv?.expiryDate || saleRec?.expiryDate || freeRec?.expiryDate || adminCfg.expiryDate || '');

  adminCfg._effStart = effStart;
  adminCfg._effExpiry = effExpiry;

  // 1) Authority Suspend (Kill-Switch)
  if (eo.revocationGuard !== false && (effStatus === 'suspended' || effStatus === 'revoked')) {
    return {
      state: 'REVOKED',
      reason: effReason || '관리자 직권으로 사용이 일시 중지되었습니다.',
      msg: `라이선스(${tid})가 관리자 직권으로 중지되었습니다.${effReason ? ` (사유: ${effReason})` : ''} 담당자(${adminCfg.sellerName || '본사'})에게 재개를 문의해 주세요.`,
    };
  }

  // 2) Usage Period Enforcement (Start Date ~ Expiry Date)
  if (eo.expiryEngine !== false) {
    const todayIso = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
    if (effStart && todayIso < effStart) {
      const waitDays = Math.ceil((new Date(`${effStart}T00:00:00+09:00`).getTime() - Date.now()) / 86400000);
      return {
        state: 'NOT_STARTED',
        daysUntil: Math.max(1, waitDays),
        msg: `본 라이선스(${tid})는 ${effStart}부터 사용 가능합니다. (개통까지 D-${Math.max(1, waitDays)}일)`,
      };
    }
    if (effExpiry) {
      const diffDays = Math.ceil((new Date(`${effExpiry}T23:59:59+09:00`).getTime() - Date.now()) / 86400000);
      if (todayIso > effExpiry) {
        return {
          state: adminCfg.expiryMode === 'readonly' ? 'EXPIRED_RO' : 'EXPIRED_LOCK',
          daysLeft: diffDays,
          msg: `사용 허용 기간(${effStart ? `${effStart} ~ ` : ''}${effExpiry})이 만료되었습니다. 담당 판매자(${adminCfg.sellerName || '본사'})에게 기간 연장을 요청해 주세요.`,
        };
      }
      if (diffDays <= 7) {
        return {
          state: 'EXPIRING_SOON',
          daysLeft: Math.max(0, diffDays),
          msg: `사용기간 만료 D-${Math.max(0, diffDays)}일 (${effStart ? `${effStart} ~ ` : '~'}${effExpiry}) · 담당자(${adminCfg.sellerName || '본사'})에게 연장을 문의하세요.`,
        };
      }
      return {
        state: 'ACTIVE_LIMITED',
        daysLeft: diffDays,
        msg: `이용기간: ${effStart ? `${effStart} ~ ` : '~'}${effExpiry} (잔여 D-${diffDays}일)`,
      };
    }
  }
  return { state: 'OK', msg: '' };
}

async function fetchAndApplyRemoteLicenseControl() {
  if (!S.isBuyerMode || S.licenseStatus?.state === 'TAMPERED') return;
  try {
    const r = await fetch(`data/license_control.json?t=${Date.now()}`, { cache: 'no-store' });
    if (!r.ok) return;
    const j = await r.json();
    if (!j || typeof j.overrides !== 'object') return;
    S.remoteControl = j;
    if (j.consentPolicy && typeof j.consentPolicy === 'object') {
      S.remoteConsentPolicy = j.consentPolicy;
    }
    const prevState = S.licenseStatus?.state;
    S.licenseStatus = evaluateLicensePolicy(S.admin, loadSellerRegistry(), j.overrides);
    const curState = S.licenseStatus?.state;
    renderTenantBar();
    if (['REVOKED', 'NOT_STARTED', 'EXPIRED_LOCK'].includes(curState)) {
      renderLicenseLockWallIfNeeded();
    } else {
      setShellLockState(false);
      if (['REVOKED', 'NOT_STARTED', 'EXPIRED_LOCK'].includes(prevState)) {
        renderCurrentTab();
        toast('▶️ 관리자 직권 재개가 반영되어 정상 이용이 복구되었습니다.');
      }
      if (j.consentPolicy) maybePromptConsentOnLogin();
    }
  } catch {}
}

function addDaysKstIso(days) {
  const n = Number(days) || 0;
  if (n <= 0) return '';
  return new Date(Date.now() + (9 * 3600 + n * 86400) * 1000).toISOString().slice(0, 10);
}

function defaultTaxConfig() {
  return {
    provider: 'popbill', // popbill | barobill | smartbill | bolta | hometax_csv
    supplierBizNo: '',
    supplierName: '넥서스원',
    supplierCeo: '',
    supplierAddr: '',
    supplierBizType: '정보통신업',
    supplierBizClass: '소프트웨어 개발 및 공급업',
    supplierEmail: '',
    proxyEndpoint: '',
    apiToken: '',
  };
}

function calcTaxAmounts(priceMan, vatMode = 'sep') {
  const baseWon = Math.max(0, Math.round((Number(priceMan) || 0) * 10000));
  if (vatMode === 'inc') {
    const supply = Math.round(baseWon / 1.1);
    const vat = baseWon - supply;
    return { supply, vat, total: baseWon };
  }
  const vat = Math.round(baseWon * 0.1);
  return { supply: baseWon, vat, total: baseWon + vat };
}

function buildTaxApiPayload(sale, taxCfg) {
  const tc = { ...defaultTaxConfig(), ...(taxCfg || {}) };
  const amt = calcTaxAmounts(sale.priceMan, sale.vatMode || 'sep');
  const writeDate = String(sale.taxDate || sale.saleDate || sale.issuedAt || new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10)).replace(/-/g, '');
  const purposeType = sale.payStatus === '입금완료' ? '영수' : '청구';
  return {
    provider: tc.provider,
    mgtKey: `${sale.licId}-${writeDate}`,
    writeDate,
    issueType: '정발행',
    taxType: '과세',
    purposeType,
    invoicer: {
      corpNum: String(tc.supplierBizNo || '').replace(/\D/g, ''),
      corpName: tc.supplierName || '넥서스원',
      ceoName: tc.supplierCeo || '',
      addr: tc.supplierAddr || '',
      bizType: tc.supplierBizType || '정보통신업',
      bizClass: tc.supplierBizClass || '소프트웨어 개발 및 공급업',
      email: tc.supplierEmail || '',
    },
    invoicee: {
      corpNum: String(sale.bizNo || '').replace(/\D/g, ''),
      corpName: sale.companyName || '',
      ceoName: sale.contactName || '',
      addr: sale.address || '',
      email: sale.taxEmail || sale.email || '',
    },
    supplyCostTotal: amt.supply,
    taxTotal: amt.vat,
    totalAmount: amt.total,
    detailList: [
      {
        serialNum: 1,
        purchaseDT: writeDate,
        itemName: `${sale.brandTitle || '넥서스원'} ${sale.brandBadge || 'PRO'} (${String(sale.pkg || 'deluxe').toUpperCase()} 라이선스)`,
        spec: sale.licId,
        qty: 1,
        unitCost: amt.supply,
        supplyCost: amt.supply,
        tax: amt.vat,
      },
    ],
  };
}

function downloadHometaxBatchCsv(salesList, taxCfg) {
  const tc = { ...defaultTaxConfig(), ...(taxCfg || {}) };
  const hd = [
    '전자세금계산서종류(01일반)', '작성일자(YYYYMMDD)', '공급자등록번호(-제외)', '공급자상호', '공급자성명',
    '공급자사업장주소', '공급자업태', '공급자종목', '공급자이메일',
    '공급받는자등록번호(-제외)', '공급받는자상호', '공급받는자성명', '공급받는자주소', '공급받는자이메일',
    '공급가액합계', '세액합계', '총합계', '품목명', '규격(라이선스)', '수량', '단가', '공급가액', '세액', '영수/청구구분', '비고',
  ].join(',') + '\n';
  const rows = salesList.map((s) => {
    const p = buildTaxApiPayload(s, tc);
    const d = p.detailList[0];
    return [
      '01', p.writeDate, p.invoicer.corpNum, p.invoicer.corpName, p.invoicer.ceoName,
      p.invoicer.addr, p.invoicer.bizType, p.invoicer.bizClass, p.invoicer.email,
      p.invoicee.corpNum, p.invoicee.corpName, p.invoicee.ceoName, p.invoicee.addr, p.invoicee.email,
      p.supplyCostTotal, p.taxTotal, p.totalAmount, d.itemName, d.spec, d.qty, d.unitCost, d.supplyCost, d.tax,
      p.purposeType === '영수' ? '01(영수)' : '02(청구)', s.memo || '',
    ].map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',');
  }).join('\n');
  const blob = new Blob(['\uFEFF' + hd + rows], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `hometax_batch_tax_invoice_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
}

function defaultSellerRegistry() {
  const sampleCfg = createClientSampleConfig();
  return {
    sellers: [
      { id: 'SLR-001', name: '본사 직판 (마스터)', channel: '본사 직판', phone: '010-0000-0000', commissionPct: 0, memo: '대표 마스터 채널' },
      { id: 'SLR-002', name: '크몽 공식 스토어', channel: '크몽 플랫폼', phone: '크몽 1:1 메시지', commissionPct: 15, memo: '온라인 패키지 판매' },
    ],
    sales: [
      {
        licId: sampleCfg.licId,
        companyName: sampleCfg.companyName,
        contactName: '김한빛 부장',
        phone: '010-4821-7700',
        email: 'bid@hanbitsafety.co.kr',
        address: '경기도 수원시 영통구 광교중앙로 145',
        bizType: '건설·안전시설',
        bizNo: '124-86-54321',
        brandTitle: sampleCfg.brandTitle,
        brandBadge: sampleCfg.brandBadge,
        brandSub: sampleCfg.brandSub,
        pkg: sampleCfg.pkg,
        priceMan: 59,
        vatMode: 'sep',
        payStatus: '입금완료',
        payDate: '2026-11-26',
        payMethod: '계좌이체',
        paidMan: 64.9,
        depositor: '㈜한빛안전건설 (기업은행)',
        taxStatus: '발급완료',
        taxDate: '2026-11-26',
        ntsConfirmNo: '20261126-41000000-00001024',
        taxEmail: 'tax@hanbitsafety.co.kr',
        sellerCode: 'SLR-001',
        sellerName: '본사 직판 (마스터)',
        saleDate: '2026-11-26',
        issuedAt: '2026-11-26',
        channel: '크몽',
        expiryDate: '',
        status: 'active', // active | revoked
        resetCount: 0,
        lastResetAt: '',
        memo: '실제 판매 납품 샘플 · DELUXE 화이트라벨 · 세금계산서 발행 완료',
        cfg: sampleCfg,
        signedUrl: `${location.origin}${location.pathname}?lic=${encodeSignedLicense(sampleCfg, defaultExpertOpts())}`,
      },
    ],
    freeDist: [],
    revoked: [],
    controlOverrides: {},
    remoteSync: defaultRemoteSyncConfig(),
    consentPolicy: defaultConsentPolicy(),
    expertOpts: defaultExpertOpts(),
    taxConfig: defaultTaxConfig(),
    masterPinHash: MASTER_DEFAULT_PIN_HASH,
  };
}

function loadSellerRegistry() {
  try {
    const raw = JSON.parse(localStorage.getItem(MASTER_REG_KEY) || 'null');
    if (raw && Array.isArray(raw.sales)) {
      const normalizedSales = raw.sales.map((x) => {
        const isSample = x.licId === 'HB-2026-DLX-001';
        return {
          contactName: isSample ? '김한빛 부장' : '',
          phone: isSample ? '010-4821-7700' : '',
          email: isSample ? 'bid@hanbitsafety.co.kr' : '',
          address: isSample ? '경기도 수원시 영통구 광교중앙로 145' : '',
          bizType: isSample ? '건설·안전시설' : '',
          bizNo: isSample ? '124-86-54321' : '',
          channel: isSample ? '크몽' : '본사직판',
          saleDate: x.saleDate || x.issuedAt || '',
          startDate: x.startDate || '',
          suspendReason: x.suspendReason || '',
          vatMode: 'sep',
          payStatus: isSample ? '입금완료' : '미수(대기)',
          payDate: isSample ? '2026-11-26' : '',
          payMethod: isSample ? '계좌이체' : '계좌이체',
          paidMan: isSample ? 64.9 : 0,
          depositor: isSample ? '㈜한빛안전건설 (기업은행)' : '',
          taxStatus: isSample ? '발급완료' : '미발급',
          taxDate: isSample ? '2026-11-26' : '',
          ntsConfirmNo: isSample ? '20261126-41000000-00001024' : '',
          taxEmail: isSample ? 'tax@hanbitsafety.co.kr' : (x.email || ''),
          ...x,
        };
      });
      return {
        sellers: Array.isArray(raw.sellers) && raw.sellers.length ? raw.sellers : defaultSellerRegistry().sellers,
        sales: normalizedSales,
        freeDist: Array.isArray(raw.freeDist) ? raw.freeDist : [],
        revoked: Array.isArray(raw.revoked) ? raw.revoked : [],
        controlOverrides: (raw.controlOverrides && typeof raw.controlOverrides === 'object') ? raw.controlOverrides : {},
        remoteSync: { ...defaultRemoteSyncConfig(), ...(raw.remoteSync || {}) },
        consentPolicy: { ...defaultConsentPolicy(), ...(raw.consentPolicy || {}) },
        expertOpts: { ...defaultExpertOpts(), ...(raw.expertOpts || {}) },
        taxConfig: { ...defaultTaxConfig(), ...(raw.taxConfig || {}) },
        masterPinHash: raw.masterPinHash || MASTER_DEFAULT_PIN_HASH,
      };
    }
  } catch {}
  const initReg = defaultSellerRegistry();
  try { localStorage.setItem(MASTER_REG_KEY, JSON.stringify(initReg)); } catch {}
  return initReg;
}

function saveSellerRegistry(reg) {
  try { localStorage.setItem(MASTER_REG_KEY, JSON.stringify(reg)); } catch {}
}

function appendAudit(action, target, detail, actor = '') {
  try {
    const reg = loadSellerRegistry();
    if (!reg.expertOpts?.auditTrail) return;
    const isBuyer = typeof S !== 'undefined' && S?.isBuyerMode;
    const key = isBuyer ? `nx1_tenant_${S.tenantId}_audit_v26` : MASTER_AUDIT_KEY;
    const list = JSON.parse(localStorage.getItem(key) || '[]');
    list.unshift({
      ts: new Date().toLocaleString('ko-KR'),
      actor: actor || (isBuyer ? `구매자(${S.tenantId})` : '판매자 마스터'),
      action,
      target: String(target || ''),
      detail: String(detail || ''),
    });
    localStorage.setItem(key, JSON.stringify(list.slice(0, 200)));
  } catch {}
}

function loadAuditLog(tenantId = null) {
  try {
    const key = tenantId ? `nx1_tenant_${tenantId}_audit_v26` : MASTER_AUDIT_KEY;
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch { return []; }
}

// ===== BUYER SELF-ADMIN ISOLATED STORAGE =====
function buyerStorageKey(licId) {
  return `nx1_tenant_${licId || 'DEFAULT'}_buyer_v26`;
}

function defaultBuyerState() {
  return {
    pwHash: BUYER_DEFAULT_PW_HASH, // default 'admin'
    mustChangePw: true,
    pwChangedAt: '',
    notice: '',
    deptName: '',
    contact: '',
    startTab: '',
    usedResetNonces: [],
  };
}

function loadBuyerState(licId) {
  try {
    const saved = JSON.parse(localStorage.getItem(buyerStorageKey(licId)) || 'null');
    if (saved) return { ...defaultBuyerState(), ...saved };
  } catch {}
  return defaultBuyerState();
}

function saveBuyerState(licId, st) {
  try { localStorage.setItem(buyerStorageKey(licId), JSON.stringify(st)); } catch {}
}

// ===== BOOTSTRAP TENANT CONTEXT RESOLUTION (NEVER POLLUTES MASTER!) =====
function resolveInitialContext() {
  const params = new URLSearchParams(location.search);
  const reg = loadSellerRegistry();
  const eo = reg.expertOpts || defaultExpertOpts();

  // Explicit master escape hatch (?master=1) or clean root URL -> ALWAYS Master Mode!
  const urlLic = params.get('lic');
  const urlCfg = params.get('cfg');
  const urlPkg = params.get('pkg');
  const forceMaster = params.get('master') === '1';

  if (forceMaster || (!urlLic && !urlCfg && urlPkg !== 'sample')) {
    // Auto-heal legacy v23~v25 buyer pollution in localStorage!
    try { localStorage.removeItem(LEGACY_ADMIN_KEY); } catch {}
    let masterCfg = defaultAdminConfig();
    if (!forceMaster && urlPkg && SALES_PACKAGES[urlPkg]) {
      masterCfg.pkg = urlPkg;
      masterCfg.tabs = { ...SALES_PACKAGES[urlPkg].tabs };
      masterCfg.features = { ...SALES_PACKAGES[urlPkg].features };
      masterCfg.appLinks = { ...SALES_PACKAGES[urlPkg].appLinks };
    } else if (!forceMaster) {
      try {
        const savedM = JSON.parse(localStorage.getItem(MASTER_CFG_KEY) || 'null');
        if (savedM && savedM.licId === 'MASTER') {
          masterCfg = {
            ...masterCfg, ...savedM,
            tabs: { ...masterCfg.tabs, ...(savedM.tabs || {}) },
            features: { ...masterCfg.features, ...(savedM.features || {}) },
            appLinks: { ...masterCfg.appLinks, ...(savedM.appLinks || {}) },
          };
        }
      } catch {}
    }
    return { isBuyerMode: false, tenantId: 'MASTER', admin: masterCfg, licenseStatus: { state: 'OK', msg: '' }, justResetPw: false, resetErr: '' };
  }

  // Buyer Mode (?lic=... | legacy ?cfg=... | ?pkg=sample) -> 100% isolated from Master!
  let adminCfg = null;
  let licenseStatus = { state: 'OK', msg: '' };

  if (urlLic) {
    const res = decodeSignedLicense(urlLic, eo.signedToken !== false);
    if (res.ok) {
      adminCfg = res.cfg;
    } else {
      adminCfg = createClientSampleConfig();
      adminCfg.brandTitle = '라이선스 검증 오류';
      adminCfg.brandBadge = 'LOCKED';
      licenseStatus = {
        state: 'TAMPERED',
        msg: '라이선스 토큰 서명 무결성 검증에 실패했습니다. URL이 변조되었거나 손상되었습니다.',
      };
    }
  } else if (urlCfg) {
    adminCfg = decodeLegacyCfg(urlCfg) || createClientSampleConfig();
  } else if (urlPkg === 'sample') {
    adminCfg = createClientSampleConfig();
  }

  const tid = adminCfg.licId || 'CLIENT-001';

  // Evaluate local Authority Suspend & Usage Period (Start Date ~ Expiry Date)
  if (licenseStatus.state === 'OK') {
    licenseStatus = evaluateLicensePolicy(adminCfg, reg, null);
  }

  // Process Remote 1-Time Password Reset Link (&rst=...)
  let justResetPw = false;
  let resetErr = '';
  const urlRst = params.get('rst');
  if (urlRst && licenseStatus.state !== 'TAMPERED') {
    const vr = verifyRemoteResetToken(urlRst, tid);
    const bSt = loadBuyerState(tid);
    if (!vr.ok) {
      resetErr = vr.msg;
    } else if ((bSt.usedResetNonces || []).includes(vr.nonce)) {
      resetErr = '이미 사용 완료된 1회용 비밀번호 초기화 링크입니다.';
    } else {
      bSt.pwHash = BUYER_DEFAULT_PW_HASH;
      bSt.mustChangePw = true;
      bSt.pwChangedAt = '';
      bSt.usedResetNonces = [...(bSt.usedResetNonces || []).slice(-19), vr.nonce];
      saveBuyerState(tid, bSt);
      justResetPw = true;
      try {
        const cleanUrl = new URL(location.href);
        cleanUrl.searchParams.delete('rst');
        history.replaceState(null, '', cleanUrl.toString());
      } catch {}
    }
  }

  return { isBuyerMode: true, tenantId: tid, admin: adminCfg, licenseStatus, justResetPw, resetErr };
}

const BOOT_CTX = resolveInitialContext();

function tStorageKey(baseKey) {
  if (!BOOT_CTX.isBuyerMode) return baseKey;
  try {
    const eo = loadSellerRegistry().expertOpts;
    if (eo && eo.tenantIsolation === false) return baseKey;
  } catch {}
  return `${baseKey}__${BOOT_CTX.tenantId}`;
}

function saveAdminConfig() {
  if (S.isBuyerMode) return; // Buyer mode NEVER overwrites Master config!
  try {
    S.admin.licId = 'MASTER';
    localStorage.setItem(MASTER_CFG_KEY, JSON.stringify(S.admin));
  } catch {}
}

function applyLockScreenBranding() {
  const cfg = S.admin || defaultAdminConfig();
  const h1 = document.querySelector('#lockScreen .lock-brand h1');
  const p = document.querySelector('#lockScreen .lock-brand p');
  if (h1) h1.textContent = `${cfg.brandTitle || '넥서스원'}${cfg.brandBadge ? ` ${cfg.brandBadge}` : ''}`;
  if (p) p.textContent = cfg.brandSub || '기업 · 입찰 · 상권 · 부동산 4대 도메인 융합 플랫폼';
  const pills = document.querySelectorAll('#lockScreen .lock-pill');
  const pillTabs = ['corp', 'sbiz', 'bid', 'realestate'];
  pills.forEach((el, idx) => {
    const k = pillTabs[idx];
    if (k) el.classList.toggle('hidden', !cfg.tabs[k]);
  });
  document.title = `${cfg.brandTitle || '넥서스원'} ${cfg.brandBadge || 'PRO'} — 통합 영업 인텔리전스`;
}

function renderTenantBar() {
  const bar = $('nxTenantBar');
  if (!bar) return;
  if (!S.isBuyerMode) {
    bar.classList.add('hidden');
    bar.innerHTML = '';
    return;
  }
  const bSt = loadBuyerState(S.tenantId);
  const rows = [];
  if (S.licenseStatus?.state === 'EXPIRED_RO') {
    rows.push(`<div class="nx-tbar-row nx-tbar-danger"><span>⛔ <b>[사용기간 만료 · 읽기전용]</b> ${esc(S.licenseStatus.msg)}</span><span>라이선스: <code>${esc(S.tenantId)}</code></span></div>`);
  } else if (S.licenseStatus?.state === 'EXPIRING_SOON') {
    rows.push(`<div class="nx-tbar-row nx-tbar-warn"><span>⏳ <b>[사용기간 만료 임박]</b> ${esc(S.licenseStatus.msg)}</span><span>라이선스: <code>${esc(S.tenantId)}</code></span></div>`);
  } else if (S.licenseStatus?.state === 'ACTIVE_LIMITED') {
    rows.push(`<div class="nx-tbar-row nx-tbar-info"><span>📅 <b>${esc(S.licenseStatus.msg)}</b></span><span style="font-size:11px;color:var(--muted)">라이선스: <code>${esc(S.tenantId)}</code></span></div>`);
  }
  if (bSt.mustChangePw && S.admin.forcePwChange !== false) {
    rows.push(`
      <div class="nx-tbar-row nx-tbar-warn">
        <span>🔐 <b>[구매자 초기 보안 안내]</b> 사내 관리자 기본 비밀번호(<code>admin</code>)가 적용되어 있습니다. 보안을 위해 비밀번호를 변경한 후 사용해 주세요.</span>
        <button id="btnTenantChangePwNow" type="button" class="btn btn-amber btn-sm">🔑 지금 비밀번호 변경</button>
      </div>`);
  }
  if (bSt.notice) {
    rows.push(`<div class="nx-tbar-row nx-tbar-info"><span>📢 <b>사내 공지</b>: ${esc(bSt.notice)}</span><span style="font-size:11px;color:var(--muted)">${esc(bSt.deptName || S.admin.companyName || '')}${bSt.contact ? ` · ${esc(bSt.contact)}` : ''}</span></div>`);
  }
  if (!rows.length) {
    bar.classList.add('hidden');
    bar.innerHTML = '';
    return;
  }
  bar.innerHTML = rows.join('');
  bar.classList.remove('hidden');
  $('btnTenantChangePwNow')?.addEventListener('click', () => openBuyerAdminModal());
}

function isLicenseBlocked() {
  const st = S.licenseStatus?.state;
  return Boolean(S.isBuyerMode && ['TAMPERED', 'REVOKED', 'NOT_STARTED', 'EXPIRED_LOCK'].includes(st));
}

function setShellLockState(locked) {
  const inp = $('omniInput');
  const drop = $('omniDrop');
  if (inp) {
    inp.disabled = locked;
    if (locked) { inp.value = ''; inp.placeholder = '🔒 라이선스 제한 상태 (관리자 문의)'; }
    else if (inp.placeholder.startsWith('🔒')) inp.placeholder = '통합 크로스 검색: 지역(부평·강남·송파) · 기업명 · 입찰 · 상권 · 분양단지…';
  }
  if (locked && drop) drop.classList.add('hidden');
  ['desktopNav', 'mobileNav'].forEach((id) => {
    const el = $(id);
    if (el) {
      el.style.pointerEvents = locked ? 'none' : '';
      el.style.opacity = locked ? '0.4' : '';
    }
  });
}

function renderLicenseLockWallIfNeeded() {
  const st = S.licenseStatus?.state;
  if (!isLicenseBlocked()) {
    setShellLockState(false);
    return false;
  }
  setShellLockState(true);
  const stage = $('mainStage');
  if (!stage) return true;
  const titleMap = {
    TAMPERED: '🛡️ 라이선스 서명 무결성 검증 실패',
    REVOKED: '🚫 관리자 직권 사용 중지 안내',
    NOT_STARTED: '🗓️ 사용 시작일 전 안내 (예약 개통)',
    EXPIRED_LOCK: '⏳ 사용 허용 기간 만료 안내',
  };
  const iconMap = { TAMPERED: '🛡️', REVOKED: '🚫', NOT_STARTED: '🗓️', EXPIRED_LOCK: '⏳' };
  const periodTxt = (S.admin._effStart || S.admin._effExpiry)
    ? `${S.admin._effStart || '즉시'} ~ ${S.admin._effExpiry || '영구'}`
    : '영구 이용';
  stage.innerHTML = `
    <div class="nx-license-wall">
      <div style="font-size:38px;margin-bottom:8px">${iconMap[st] || '🔒'}</div>
      <h2 style="margin:0 0 8px;font-size:19px;font-weight:900">${titleMap[st]}</h2>
      <p style="font-size:13px;color:var(--text-2);margin:0 0 14px">${esc(S.licenseStatus.msg)}</p>
      <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:10px;padding:10px 12px;font-size:12px;text-align:left;margin-bottom:14px;line-height:1.6">
        <div><b>라이선스 ID</b>: <code>${esc(S.tenantId)}</code></div>
        <div><b>고객사 / 수령인</b>: ${esc(S.admin.companyName || S.admin.brandTitle)}</div>
        <div><b>허용 사용기간</b>: ${esc(periodTxt)}</div>
        ${S.licenseStatus.reason ? `<div><b>중지 사유</b>: <span style="color:#be123c;font-weight:700">${esc(S.licenseStatus.reason)}</span></div>` : ''}
        <div><b>담당 관리자</b>: ${esc(S.admin.sellerName || '본사 직판')}</div>
      </div>
      <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
        <button id="btnWallRecheck" type="button" class="btn btn-emerald btn-sm">🔄 재개 여부 다시 확인</button>
        <button id="btnWallMasterBack" type="button" class="btn btn-primary btn-sm">🛡️ 판매자 마스터 모드 복귀</button>
      </div>
    </div>`;
  $('btnWallRecheck')?.addEventListener('click', async () => {
    toast('🔄 원격 라이선스 상태를 확인 중입니다…');
    await fetchAndApplyRemoteLicenseControl();
  });
  $('btnWallMasterBack')?.addEventListener('click', () => openMasterEscapePrompt());
  return true;
}

function applyAdminConfig(rerender = false) {
  const cfg = S.admin || defaultAdminConfig();
  const enabledTabs = Object.keys(cfg.tabs).filter((k) => cfg.tabs[k]);
  if (!enabledTabs.length) { cfg.tabs.bid = true; enabledTabs.push('bid'); }

  document.querySelectorAll('[data-tab]').forEach((el) => {
    const k = el.dataset.tab;
    el.classList.toggle('hidden', !cfg.tabs[k]);
  });

  const btEl = $('brandTitleEl');
  if (btEl) {
    btEl.innerHTML = `${esc(cfg.brandTitle || '넥서스원')}${cfg.brandBadge ? ` <span class="pro-chip">${esc(cfg.brandBadge)}</span>` : ''}`;
  }
  if (cfg.brandSub && $('brandMeta')) {
    $('brandMeta').textContent = cfg.brandSub;
  } else if (S.core && S.re && $('brandMeta')) {
    const parts = [];
    if (cfg.tabs.corp) parts.push(`법인 ${fmt(S.core.stats.corpCount)}`);
    if (cfg.tabs.sbiz) parts.push(`상가 ${fmt(S.core.stats.sbizCount)}`);
    if (cfg.tabs.bid) parts.push(`입찰 ${fmt(S.opps.length)}`);
    if (cfg.tabs.realestate) parts.push(`청약 ${fmt(S.re.listings?.length || 0)}`);
    $('brandMeta').textContent = parts.join(' · ') || '맞춤형 B2B 영업 인텔리전스';
  }
  applyLockScreenBranding();

  const admBtn = $('btnAdminSales');
  if (admBtn) {
    if (S.isBuyerMode) {
      if (cfg.simpleFreeMode) {
        admBtn.classList.add('hidden');
      } else {
        admBtn.classList.remove('hidden');
        const bSt = loadBuyerState(S.tenantId);
        const dot = (bSt.mustChangePw && cfg.forcePwChange !== false) ? '<span class="nx-pulse-dot" title="초기 비밀번호 변경 필요"></span>' : '';
        admBtn.innerHTML = `🏢 <span class="hide-xs">사내관리</span>${dot}`;
        admBtn.title = '구매자 자체 관리자 · 비밀번호 변경 · 사내 공지 및 라이선스 정보';
      }
    } else {
      admBtn.classList.remove('hidden');
      admBtn.innerHTML = `🛡️ <span class="hide-xs">관리자</span>`;
      admBtn.title = '판매자 마스터 콘솔 · 판매링크 발급 · 현황 · 무료배포 · 비번초기화 · TOP 10 옵션 (Ctrl+Shift+A)';
    }
  }

  renderTenantBar();
  if (renderLicenseLockWallIfNeeded()) return;

  if (!cfg.tabs[S.tab]) {
    S.tab = enabledTabs[0];
    document.querySelectorAll('[data-tab]').forEach((el) => el.classList.toggle('active', el.dataset.tab === S.tab));
    if (rerender) renderCurrentTab();
  } else if (rerender) {
    renderCurrentTab();
  }
}

// ===== MASTER ESCAPE / AUTH PROMPT (WHEN CTRL+SHIFT+A PRESSED IN BUYER MODE) =====
function openMasterEscapePrompt() {
  $('adminModalTitle').textContent = '🔐 판매자 마스터 모드 전환 인증';
  $('adminModalSub').textContent = '구매자 전용 화면에서는 판매자 마스터 PIN 또는 볼트 비밀번호 확인 후 마스터 모드로 복귀할 수 있습니다.';
  $('adminBody').innerHTML = `
    <div class="domain-box">
      <div style="font-size:12.5px;margin-bottom:10px;color:var(--text-2)">
        현재 <b>${esc(S.admin.companyName || S.admin.brandTitle)}</b> 구매자 격리 세션(<code>${esc(S.tenantId)}</code>)에서 실행 중입니다.<br>
        기본 주소(<code>${esc(location.origin + location.pathname)}</code>)로 이동해도 마스터 모드가 자동 복원됩니다.
      </div>
      <label style="font-size:11.5px;color:var(--muted);display:block;margin-bottom:6px">판매자 마스터 PIN (기본: <code>nx1master</code> 또는 볼트 마스터 비밀번호)
        <input id="masterEscPin" class="input" type="password" placeholder="마스터 PIN 입력" style="width:100%;margin-top:4px" />
      </label>
      <div id="masterEscErr" style="color:#e11d48;font-size:12px;min-height:18px"></div>
    </div>`;
  $('adminFoot').innerHTML = `
    <button id="btnMasterEscGo" class="btn btn-primary btn-sm" type="button">🔄 인증 후 넥서스원 기본(마스터) 모드로 복귀</button>
    <button id="btnMasterEscClose" class="btn btn-sm" type="button">닫기</button>
  `;
  $('adminBackdrop')?.classList.remove('hidden');
  $('btnMasterEscClose')?.addEventListener('click', () => $('adminBackdrop')?.classList.add('hidden'));
  const verifyAndReturn = async () => {
    const pin = $('masterEscPin')?.value || '';
    if (!pin) { $('masterEscErr').textContent = 'PIN 또는 볼트 비밀번호를 입력하세요.'; return; }
    const reg = loadSellerRegistry();
    const pinHash = await sha256Hex(pin);
    let ok = pinHash === (reg.masterPinHash || MASTER_DEFAULT_PIN_HASH);
    if (!ok && S.vault) {
      try {
        const k = await deriveKey(pin, S.vault.salt, S.vault.iter);
        ok = await verifyKey(k, S.vault);
      } catch {}
    }
    if (!ok) {
      $('masterEscErr').textContent = '판매자 마스터 인증 정보가 일치하지 않습니다.';
      appendAudit('MASTER_AUTH_FAIL', S.tenantId, '구매자 모드에서 마스터 전환 PIN 불일치');
      return;
    }
    location.href = `${location.origin}${location.pathname}?master=1`;
  };
  $('btnMasterEscGo')?.addEventListener('click', verifyAndReturn);
  $('masterEscPin')?.addEventListener('keydown', (e) => { if (e.key === 'Enter') verifyAndReturn(); });
}

// ===== BUYER SELF-ADMIN MODAL (INITIAL PW: admin -> MANDATORY CHANGE -> SELF SETTINGS) =====
function openBuyerAdminModal() {
  const cfg = S.admin;
  const bSt = loadBuyerState(S.tenantId);
  const enabledTabs = Object.keys(cfg.tabs).filter((k) => cfg.tabs[k]);
  const tabLabels = { overview: '⚡ 통합 360°', corp: '🏢 기업분석', bid: '🎯 입찰·사전규격', sbiz: '🏪 상권지도', realestate: '🏠 청약·착공', hub: '🔌 API·CRM' };

  $('adminModalTitle').textContent = `🏢 ${cfg.brandTitle || '고객사'} · 구매자 자체 관리자`;
  $('adminModalSub').textContent = `${cfg.companyName || ''} (${S.tenantId}) · 사내 보안 비밀번호·공지·A4 결재 브랜딩 관리`;

  // STEP 1: Buyer Admin Login Gate
  if (!S.buyerAuthed) {
    $('adminBody').innerHTML = `
      ${bSt.mustChangePw ? `
        <div class="domain-box" style="margin-bottom:12px;border-color:rgba(245,158,11,.5);background:rgba(245,158,11,.08)">
          <div style="font-weight:800;font-size:13px;color:#b45309;margin-bottom:4px">🔐 초기 관리자 비밀번호 안내 (최초 1회 변경 필수)</div>
          <div style="font-size:12px;color:var(--text-2);line-height:1.55">
            구매자 자체 관리자 기본 비밀번호는 <b><code>admin</code></b> 입니다.<br>
            <b><code>admin</code></b>으로 로그인하시면 즉시 <b>새 비밀번호 설정 화면</b>으로 이동하며, 변경 후 안전하게 사내 관리 기능을 이용하실 수 있습니다.
          </div>
        </div>` : ''}
      <div class="domain-box">
        <label style="font-size:12px;font-weight:700;display:block;margin-bottom:6px">사내 관리자 비밀번호 입력
          <input id="buyerLoginPw" class="input" type="password" placeholder="${bSt.mustChangePw ? '초기 비밀번호: admin' : '사내 관리자 비밀번호 입력'}" style="width:100%;margin-top:5px" autocomplete="current-password" />
        </label>
        <div id="buyerLoginErr" style="color:#e11d48;font-size:12px;min-height:18px;margin-top:4px"></div>
        <div style="font-size:11.5px;color:var(--muted);margin-top:8px;padding-top:8px;border-top:1px dashed var(--border)">
          ❓ 비밀번호를 분실하셨나요? 담당 판매자(<b>${esc(cfg.sellerName || '본사 직판')}</b>)에게 <b>원격 비밀번호 초기화 링크</b> 발급을 요청해 주세요.
        </div>
      </div>`;
    $('adminFoot').innerHTML = `
      <button id="btnBuyerLoginSubmit" class="btn btn-primary btn-sm" type="button">🔓 사내 관리자 로그인</button>
      <button id="btnBuyerModalClose" class="btn btn-sm" type="button">닫기</button>
    `;
    $('adminBackdrop')?.classList.remove('hidden');
    $('btnBuyerModalClose')?.addEventListener('click', () => $('adminBackdrop')?.classList.add('hidden'));
    const doLogin = async () => {
      const pw = $('buyerLoginPw')?.value || '';
      if (!pw) { $('buyerLoginErr').textContent = '비밀번호를 입력하세요.'; return; }
      const h = await sha256Hex(pw);
      if (h !== bSt.pwHash) {
        $('buyerLoginErr').textContent = bSt.mustChangePw
          ? '비밀번호가 일치하지 않습니다. (초기 기본 비밀번호: admin)'
          : '비밀번호가 일치하지 않습니다. 분실 시 담당 판매자에게 초기화를 요청하세요.';
        appendAudit('BUYER_LOGIN_FAIL', S.tenantId, '구매자 사내관리자 로그인 실패');
        return;
      }
      S.buyerAuthed = true;
      appendAudit('BUYER_LOGIN_OK', S.tenantId, bSt.mustChangePw ? '초기 비밀번호(admin) 로그인 — 변경 단계 진입' : '사내관리자 정상 로그인');
      openBuyerAdminModal();
    };
    $('btnBuyerLoginSubmit')?.addEventListener('click', doLogin);
    $('buyerLoginPw')?.addEventListener('keydown', (e) => { if (e.key === 'Enter') doLogin(); });
    setTimeout(() => $('buyerLoginPw')?.focus(), 40);
    return;
  }

  // STEP 2: Mandatory First-Login Password Rotation Gate
  if (bSt.mustChangePw && cfg.forcePwChange !== false) {
    $('adminBody').innerHTML = `
      <div class="domain-box" style="margin-bottom:12px;border-color:rgba(225,29,72,.4);background:rgba(225,29,72,.06)">
        <div style="font-weight:800;font-size:13.5px;color:#be123c;margin-bottom:4px">🔑 보안 필수: 초기 비밀번호(admin)를 지금 변경해 주세요</div>
        <div style="font-size:12px;color:var(--text-2)">
          현재 초기 기본값(<code>admin</code>)이 설정되어 있습니다. 사내 전용 비밀번호(4자 이상, <code>admin</code> 불가)로 변경 완료 후 관리자 메뉴를 사용할 수 있습니다.
        </div>
      </div>
      <div class="domain-box">
        <div style="display:grid;gap:9px">
          <label style="font-size:12px;font-weight:700">새 사내 관리자 비밀번호 (4자 이상)
            <input id="buyerNewPw1" class="input" type="password" placeholder="새 비밀번호 입력 (admin 제외)" style="width:100%;margin-top:4px" autocomplete="new-password" />
          </label>
          <label style="font-size:12px;font-weight:700">새 비밀번호 확인
            <input id="buyerNewPw2" class="input" type="password" placeholder="새 비밀번호 다시 입력" style="width:100%;margin-top:4px" autocomplete="new-password" />
          </label>
          <div id="buyerForceErr" style="color:#e11d48;font-size:12px;min-height:18px"></div>
        </div>
      </div>`;
    $('adminFoot').innerHTML = `
      <button id="btnBuyerForceSave" class="btn btn-primary btn-sm" type="button">✅ 비밀번호 변경 완료 및 관리자 진입</button>
      <button id="btnBuyerForceCancel" class="btn btn-sm" type="button">나중에</button>
    `;
    $('adminBackdrop')?.classList.remove('hidden');
    $('btnBuyerForceCancel')?.addEventListener('click', () => { S.buyerAuthed = false; $('adminBackdrop')?.classList.add('hidden'); });
    const doRotate = async () => {
      const p1 = $('buyerNewPw1')?.value || '';
      const p2 = $('buyerNewPw2')?.value || '';
      if (p1.length < 4) { $('buyerForceErr').textContent = '비밀번호는 최소 4자 이상이어야 합니다.'; return; }
      if (p1.toLowerCase() === BUYER_DEFAULT_PW) { $('buyerForceErr').textContent = '초기 기본값(admin)과 다른 비밀번호를 입력하세요.'; return; }
      if (p1 !== p2) { $('buyerForceErr').textContent = '새 비밀번호와 확인 입력이 일치하지 않습니다.'; return; }
      bSt.pwHash = await sha256Hex(p1);
      bSt.mustChangePw = false;
      bSt.pwChangedAt = new Date().toLocaleString('ko-KR');
      saveBuyerState(S.tenantId, bSt);
      appendAudit('BUYER_PW_CHANGED', S.tenantId, '초기 비밀번호(admin) → 사내 전용 비밀번호 변경 완료');
      applyAdminConfig(false);
      toast('🔐 사내 관리자 비밀번호가 안전하게 변경되었습니다!');
      openBuyerAdminModal();
    };
    $('btnBuyerForceSave')?.addEventListener('click', doRotate);
    $('buyerNewPw2')?.addEventListener('keydown', (e) => { if (e.key === 'Enter') doRotate(); });
    setTimeout(() => $('buyerNewPw1')?.focus(), 40);
    return;
  }

  // STEP 3: Full Buyer Self-Admin Workspace (Strictly scoped to Buyer Permissions!)
  const auditList = loadAuditLog(S.tenantId).slice(0, 12);
  $('adminBody').innerHTML = `
    <div class="domain-box" style="margin-bottom:10px;background:rgba(79,70,229,.05);border-color:rgba(79,70,229,.28)">
      <h4 style="margin:0 0 8px">📋 계약 라이선스 정보 (읽기 전용 · 위변조 서명 검증됨)</h4>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:8px;font-size:12px">
        <div><span style="color:var(--muted)">구매 고객사</span><br><b>${esc(cfg.companyName || cfg.brandTitle)}</b></div>
        <div><span style="color:var(--muted)">라이선스 코드</span><br><code>${esc(S.tenantId)}</code></div>
        <div><span style="color:var(--muted)">계약 패키지</span><br><b>${esc(SALES_PACKAGES[cfg.pkg]?.label || cfg.pkg)}</b></div>
        <div><span style="color:var(--muted)">만료일 / 담당 판매자</span><br><b>${esc(cfg.expiryDate || '영구 소장')}</b> · ${esc(cfg.sellerName || '본사')}</div>
      </div>
      <div style="margin-top:8px;display:flex;gap:5px;flex-wrap:wrap;align-items:center">
        ${enabledTabs.map((k) => `<span class="nx-lic-badge nx-lic-active">✓ ${tabLabels[k] || k}</span>`).join('')}
        ${(() => {
          const cRec = loadConsentState(S.tenantId);
          return `<button id="btnByViewConsent" type="button" class="btn btn-sm" style="margin-left:auto;font-size:11px">📋 개인정보·약관 동의내역${cRec ? ` (${esc(cRec.version)})` : ''}</button>`;
        })()}
      </div>
    </div>

    <div class="domain-box" style="margin-bottom:10px">
      <h4 style="margin:0 0 8px">🏢 사내 맞춤 운영 설정</h4>
      <div style="display:grid;gap:8px">
        <label style="font-size:11.5px;color:var(--muted)">사내 상단 공지 배너 (비워두면 숨김)
          <input id="byNotice" class="input" value="${esc(bSt.notice || '')}" placeholder="예: 이번 주 금요일 14시 입찰 검토회의 · 투찰가는 내서류함에 사전 등록" style="width:100%;margin-top:3px;font-size:12px" />
        </label>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <label style="font-size:11.5px;color:var(--muted)">담당 부서명 (A4 검토서 워터마크·하단 표기)
            <input id="byDept" class="input" value="${esc(bSt.deptName || '')}" placeholder="예: 영업기획팀 / 공무팀" style="width:100%;margin-top:3px;font-size:12px" />
          </label>
          <label style="font-size:11.5px;color:var(--muted)">사내 관리자 연락처
            <input id="byContact" class="input" value="${esc(bSt.contact || '')}" placeholder="예: 내선 204 / bid@company.co.kr" style="width:100%;margin-top:3px;font-size:12px" />
          </label>
        </div>
        <label style="font-size:11.5px;color:var(--muted)">임직원 기본 시작 화면 (계약 허용 도메인 중 선택)
          <select id="byStartTab" class="select" style="width:100%;margin-top:3px;font-size:12px">
            <option value="">기본 순서 유지</option>
            ${enabledTabs.map((k) => `<option value="${k}" ${bSt.startTab === k ? 'selected' : ''}>${tabLabels[k] || k}</option>`).join('')}
          </select>
        </label>
      </div>
    </div>

    <div class="domain-box" style="margin-bottom:10px">
      <h4 style="margin:0 0 8px">🔑 사내 관리자 비밀번호 변경 <span style="font-size:11px;font-weight:600;color:var(--muted)">(최근 변경: ${esc(bSt.pwChangedAt || '미변경')})</span></h4>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px">
        <input id="byCurPw" class="input" type="password" placeholder="현재 비밀번호" style="font-size:12px" />
        <input id="byChgPw1" class="input" type="password" placeholder="새 비밀번호 (4자+)" style="font-size:12px" />
        <input id="byChgPw2" class="input" type="password" placeholder="새 비밀번호 확인" style="font-size:12px" />
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:7px;gap:8px">
        <span id="byPwMsg" style="font-size:11.5px;color:var(--muted)"></span>
        <button id="btnByChgPw" class="btn btn-amber btn-sm" type="button">🔐 비밀번호 변경 적용</button>
      </div>
    </div>

    <div class="domain-box">
      <h4 style="margin:0 0 6px">📜 최근 사내 보안·설정 감사 로그 (${auditList.length}건)</h4>
      <div style="max-height:130px;overflow-y:auto;font-size:11.5px">
        ${auditList.length ? auditList.map((a) => `<div style="display:flex;justify-content:space-between;gap:8px;padding:4px 0;border-bottom:1px solid var(--border)"><span><b>${esc(a.action)}</b> · ${esc(a.detail)}</span><span style="color:var(--muted);white-space:nowrap">${esc(a.ts)}</span></div>`).join('') : '<div style="color:var(--muted)">기록된 이력이 없습니다.</div>'}
      </div>
    </div>
  `;

  $('adminFoot').innerHTML = `
    <button id="btnBySave" class="btn btn-primary btn-sm" type="button">✅ 사내 설정 저장</button>
    <button id="btnByLogout" class="btn btn-sm" type="button" style="margin-left:auto">🔒 사내 관리자 로그아웃</button>
  `;
  $('adminBackdrop')?.classList.remove('hidden');

  $('btnByViewConsent')?.addEventListener('click', () => {
    const cRec = loadConsentState(S.tenantId);
    openConsentModal({ readOnly: Boolean(cRec), preview: false });
  });

  $('btnBySave')?.addEventListener('click', () => {
    bSt.notice = $('byNotice')?.value.trim() || '';
    bSt.deptName = $('byDept')?.value.trim() || '';
    bSt.contact = $('byContact')?.value.trim() || '';
    bSt.startTab = $('byStartTab')?.value || '';
    saveBuyerState(S.tenantId, bSt);
    appendAudit('BUYER_CFG_SAVED', S.tenantId, `공지:${bSt.notice ? 'Y' : 'N'}, 부서:${bSt.deptName || '-'}, 시작탭:${bSt.startTab || '기본'}`);
    renderTenantBar();
    toast('✅ 사내 맞춤 설정이 저장되었습니다.');
  });

  $('btnByChgPw')?.addEventListener('click', async () => {
    const cur = $('byCurPw')?.value || '';
    const n1 = $('byChgPw1')?.value || '';
    const n2 = $('byChgPw2')?.value || '';
    const msg = $('byPwMsg');
    if (await sha256Hex(cur) !== bSt.pwHash) { msg.style.color = '#e11d48'; msg.textContent = '현재 비밀번호가 일치하지 않습니다.'; return; }
    if (n1.length < 4) { msg.style.color = '#e11d48'; msg.textContent = '새 비밀번호는 4자 이상이어야 합니다.'; return; }
    if (n1.toLowerCase() === BUYER_DEFAULT_PW) { msg.style.color = '#e11d48'; msg.textContent = '기본 비밀번호(admin)는 사용할 수 없습니다.'; return; }
    if (n1 !== n2) { msg.style.color = '#e11d48'; msg.textContent = '새 비밀번호 확인이 일치하지 않습니다.'; return; }
    bSt.pwHash = await sha256Hex(n1);
    bSt.mustChangePw = false;
    bSt.pwChangedAt = new Date().toLocaleString('ko-KR');
    saveBuyerState(S.tenantId, bSt);
    appendAudit('BUYER_PW_CHANGED', S.tenantId, '사내 관리자 비밀번호 변경');
    msg.style.color = '#059669';
    msg.textContent = '✓ 비밀번호가 성공적으로 변경되었습니다.';
    $('byCurPw').value = ''; $('byChgPw1').value = ''; $('byChgPw2').value = '';
    toast('🔐 사내 관리자 비밀번호 변경 완료');
  });

  $('btnByLogout')?.addEventListener('click', () => {
    S.buyerAuthed = false;
    $('adminBackdrop')?.classList.add('hidden');
    toast('🔒 사내 관리자에서 로그아웃했습니다.');
  });
}

// ===== TURNKEY DELIVERY KIT POPUP (EXPERT TECHNIQUE #10) =====
function openDeliveryKitModal(sale) {
  const pkgInfo = SALES_PACKAGES[sale.pkg] || SALES_PACKAGES.deluxe;
  const tabNames = { overview: '통합 360°', corp: '기업분석(12만)', bid: '입찰·사전규격', sbiz: '상권지도(275만)', realestate: '청약·착공', hub: 'API·CRM' };
  const activeTabs = Object.entries(sale.cfg?.tabs || {}).filter(([, v]) => v).map(([k]) => tabNames[k] || k).join(' · ');
  const kakaoTxt = `[${sale.brandTitle} ${sale.brandBadge || 'PRO'} 납품 완료 안내]\n• 고객사(시설): ${sale.companyName}${sale.contactName ? ` (${sale.contactName})` : ''}\n• 연락처/이메일: ${sale.phone || '-'} / ${sale.email || '-'}\n• 주소: ${sale.address || '-'}\n• 라이선스: ${sale.licId} (${pkgInfo.label})\n• 판매일자/경로: ${sale.saleDate || sale.issuedAt || '-'} (${sale.channel || '본사직판'})\n• 사용기간: ${sale.expiryDate || '영구 소장'}\n• 전용 접속 링크:\n${sale.signedUrl}\n\n🔐 최초 접속 및 관리자 설정 (2단계)\n1) 앱 잠금화면: 별도 보안 채널로 전달받은 [통합 볼트 비밀번호] 입력 (영문 소문자)\n2) 잠금 해제 후 우측 상단 [🏢 사내관리] → 초기 비밀번호 admin 입력 후 새 비밀번호로 변경\n• 담당 판매자: ${sale.sellerName || '본사 직판'}`;

  $('adminModalTitle').textContent = `📦 고객 납품 키트 · ${sale.companyName}`;
  $('adminModalSub').textContent = `라이선스 ${sale.licId} · 담당자 ${sale.contactName || '-'} · 카톡 전달 문구 복사 & 확인`;
  $('adminBody').innerHTML = `
    <div class="domain-box" style="margin-bottom:10px">
      <h4 style="margin:0 0 8px">1. 납품 고객 · 시설 요약 및 전용 서명 링크</h4>
      <input class="input mono" readonly value="${esc(sale.signedUrl)}" style="width:100%;font-size:11.5px;margin-bottom:6px" onclick="this.select()" />
      <div style="font-size:11.5px;color:var(--muted);line-height:1.6">
        • 고객명 / 연락처 / 이메일: <b>${esc(sale.contactName || '-')}</b> · ${esc(sale.phone || '-')} · ${esc(sale.email || '-')}<br>
        • 시설 주소 / 업종: <b>${esc(sale.address || '-')}</b> (${esc(sale.bizType || '-')})<br>
        • 판매일자 / 판매경로 / 비고: <b>${esc(sale.saleDate || sale.issuedAt || '-')}</b> · ${esc(sale.channel || '-')} · ${esc(sale.memo || '-')}<br>
        • 포함 도메인: <b>${esc(activeTabs)}</b> · 구매자 초기 비번: <code>admin</code> (첫 로그인 시 강제 변경)
      </div>
    </div>
    <div class="domain-box">
      <h4 style="margin:0 0 6px">2. 카카오톡 · 이메일 납품 안내문 (바로 복사)</h4>
      <textarea id="kitKakaoArea" class="input" rows="11" style="width:100%;font-size:12px;line-height:1.5;font-family:inherit">${esc(kakaoTxt)}</textarea>
    </div>
  `;
  $('adminFoot').innerHTML = `
    <button id="btnKitCopyTxt" class="btn btn-emerald btn-sm" type="button">📱 납품 안내문 전체 복사</button>
    <button id="btnKitOpenNew" class="btn btn-primary btn-sm" type="button">👁️ 새 탭에서 구매자 화면 확인</button>
    <button id="btnKitBack" class="btn btn-sm" type="button" style="margin-left:auto">← 납품 고객 현황으로</button>
  `;
  $('btnKitCopyTxt')?.addEventListener('click', () => {
    navigator.clipboard?.writeText($('kitKakaoArea')?.value || kakaoTxt);
    toast('📱 납품 안내문(링크 + 고객정보 + 초기비번 admin 가이드)이 복사되었습니다!');
  });
  $('btnKitOpenNew')?.addEventListener('click', () => window.open(sale.signedUrl, '_blank', 'noopener'));
  $('btnKitBack')?.addEventListener('click', () => openAdminSalesModal('status'));
}

// ===== DELIVERED CUSTOMER DETAIL / INLINE EDITOR MODAL =====
function openCustomerEditModal(licId) {
  const reg = loadSellerRegistry();
  const s = reg.sales.find((x) => x.licId === licId);
  if (!s) return;

  $('adminModalTitle').textContent = `✏️ 납품 시설 고객 정보 수정 · ${s.companyName}`;
  $('adminModalSub').textContent = `라이선스 ${s.licId} · 고객명 · 연락처 · 주소 · 이메일 · 판매일자 · 판매경로 · 비고 관리`;
  $('adminBody').innerHTML = `
    <div class="domain-box" style="margin-bottom:10px">
      <h4 style="margin:0 0 8px">🏢 납품 시설 · 고객 상세 정보</h4>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:8px">
        <label style="font-size:11px;color:var(--muted)">고객사 / 시설명 *
          <input id="edCompName" class="input" value="${esc(s.companyName || '')}" style="width:100%;margin-top:2px;font-size:12px" />
        </label>
        <label style="font-size:11px;color:var(--muted)">고객명 (담당자)
          <input id="edContactName" class="input" value="${esc(s.contactName || '')}" placeholder="예: 홍길동 팀장" style="width:100%;margin-top:2px;font-size:12px" />
        </label>
        <label style="font-size:11px;color:var(--muted)">시설 / 업종 구분
          <select id="edBizType" class="select" style="width:100%;margin-top:2px;font-size:12px">
            <option value="">선택</option>
            ${FACILITY_TYPES.map((f) => `<option value="${esc(f)}" ${s.bizType === f ? 'selected' : ''}>${esc(f)}</option>`).join('')}
          </select>
        </label>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
        <label style="font-size:11px;color:var(--muted)">연락처 (휴대폰 / 대표번호)
          <input id="edPhone" class="input" value="${esc(s.phone || '')}" placeholder="010-0000-0000" style="width:100%;margin-top:2px;font-size:12px" />
        </label>
        <label style="font-size:11px;color:var(--muted)">이메일
          <input id="edEmail" class="input" type="email" value="${esc(s.email || '')}" placeholder="name@company.co.kr" style="width:100%;margin-top:2px;font-size:12px" />
        </label>
      </div>
      <label style="font-size:11px;color:var(--muted);display:block;margin-bottom:8px">시설 / 사업장 주소
        <input id="edAddress" class="input" value="${esc(s.address || '')}" placeholder="예: 서울시 강남구 테헤란로 123, 5층" style="width:100%;margin-top:2px;font-size:12px" />
      </label>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr 110px;gap:8px;margin-bottom:8px">
        <label style="font-size:11px;color:var(--muted)">판매일자
          <input id="edSaleDate" class="input" type="date" value="${esc(s.saleDate || s.issuedAt || '')}" style="width:100%;margin-top:2px;font-size:12px" />
        </label>
        <label style="font-size:11px;color:var(--muted)">판매경로
          <select id="edChannel" class="select" style="width:100%;margin-top:2px;font-size:12px">
            ${SALES_CHANNELS.map((c) => `<option value="${esc(c)}" ${(s.channel || '본사직판') === c ? 'selected' : ''}>${esc(c)}</option>`).join('')}
          </select>
        </label>
        <label style="font-size:11px;color:var(--muted)">담당 판매자
          <select id="edSeller" class="select" style="width:100%;margin-top:2px;font-size:12px">
            ${reg.sellers.map((sl) => `<option value="${esc(sl.id)}" ${s.sellerCode === sl.id ? 'selected' : ''}>${esc(sl.name)}</option>`).join('')}
          </select>
        </label>
        <label style="font-size:11px;color:var(--muted)">판매금액(만원)
          <input id="edPrice" class="input" type="number" min="0" value="${Number(s.priceMan) || 0}" style="width:100%;margin-top:2px;font-size:12px" />
        </label>
      </div>
      <div style="display:grid;grid-template-columns:150px 1fr;gap:8px;margin-bottom:10px">
        <label style="font-size:11px;color:var(--muted)">만료일 (비우면 영구)
          <input id="edExpiry" class="input" type="date" value="${esc(s.expiryDate || '')}" style="width:100%;margin-top:2px;font-size:12px" />
        </label>
        <label style="font-size:11px;color:var(--muted)">비고 (계약·세금계산서·시설 특이사항)
          <input id="edMemo" class="input" value="${esc(s.memo || '')}" placeholder="세금계산서 발행, 추가 요청사항 등" style="width:100%;margin-top:2px;font-size:12px" />
        </label>
      </div>
    </div>

    <div class="domain-box" style="margin-bottom:10px;border-color:rgba(16,185,129,.35);background:rgba(16,185,129,.04)">
      <h4 style="margin:0 0 8px">💳 판매대금 입금정보 (공급가 · 부가세 · 입금 추적)</h4>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:8px;margin-bottom:8px">
        <label style="font-size:11px;color:var(--muted)">입금 상태
          <select id="edPayStatus" class="select" style="width:100%;margin-top:2px;font-size:12px">
            ${PAY_STATUSES.map((p) => `<option value="${esc(p)}" ${(s.payStatus || '미수(대기)') === p ? 'selected' : ''}>${esc(p)}</option>`).join('')}
          </select>
        </label>
        <label style="font-size:11px;color:var(--muted)">입금일자
          <input id="edPayDate" class="input" type="date" value="${esc(s.payDate || '')}" style="width:100%;margin-top:2px;font-size:12px" />
        </label>
        <label style="font-size:11px;color:var(--muted)">결제 / 입금수단
          <select id="edPayMethod" class="select" style="width:100%;margin-top:2px;font-size:12px">
            ${PAY_METHODS.map((m) => `<option value="${esc(m)}" ${(s.payMethod || '계좌이체') === m ? 'selected' : ''}>${esc(m)}</option>`).join('')}
          </select>
        </label>
        <label style="font-size:11px;color:var(--muted)">부가세 구분
          <select id="edVatMode" class="select" style="width:100%;margin-top:2px;font-size:12px">
            <option value="sep" ${(s.vatMode || 'sep') === 'sep' ? 'selected' : ''}>부가세 별도 (+10%)</option>
            <option value="inc" ${s.vatMode === 'inc' ? 'selected' : ''}>부가세 포함</option>
          </select>
        </label>
      </div>
      <div style="display:grid;grid-template-columns:140px 1fr;gap:8px;align-items:end">
        <label style="font-size:11px;color:var(--muted)">실입금액(만원)
          <input id="edPaidMan" class="input" type="number" step="0.1" min="0" value="${Number(s.paidMan) || 0}" style="width:100%;margin-top:2px;font-size:12px" />
        </label>
        <label style="font-size:11px;color:var(--muted)">입금자명 / 입금계좌 메모
          <input id="edDepositor" class="input" value="${esc(s.depositor || '')}" placeholder="예: ㈜한빛안전건설 (기업은행 법인계좌)" style="width:100%;margin-top:2px;font-size:12px" />
        </label>
      </div>
      <div id="edTaxCalcPreview" style="margin-top:6px;font-size:11.5px;color:#047857;font-weight:700"></div>
    </div>

    <div class="domain-box" style="border-color:rgba(79,70,229,.35);background:rgba(79,70,229,.04)">
      <h4 style="margin:0 0 8px">🧾 전자세금계산서 발급정보 (국세청 홈택스 · API 연동)</h4>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:8px">
        <label style="font-size:11px;color:var(--muted)">공급받는자 사업자등록번호
          <input id="edBizNo" class="input mono" value="${esc(s.bizNo || '')}" placeholder="000-00-00000" style="width:100%;margin-top:2px;font-size:12px" />
        </label>
        <label style="font-size:11px;color:var(--muted)">세금계산서 발급여부
          <select id="edTaxStatus" class="select" style="width:100%;margin-top:2px;font-size:12px">
            ${TAX_STATUSES.map((t) => `<option value="${esc(t)}" ${(s.taxStatus || '미발급') === t ? 'selected' : ''}>${esc(t)}</option>`).join('')}
          </select>
        </label>
        <label style="font-size:11px;color:var(--muted)">작성 / 발급일자
          <input id="edTaxDate" class="input" type="date" value="${esc(s.taxDate || '')}" style="width:100%;margin-top:2px;font-size:12px" />
        </label>
      </div>
      <div style="display:grid;grid-template-columns:1.2fr 1fr;gap:8px;margin-bottom:8px">
        <label style="font-size:11px;color:var(--muted)">국세청 승인번호 (24자리)
          <input id="edNtsNo" class="input mono" value="${esc(s.ntsConfirmNo || '')}" placeholder="예: 20261126-41000000-00001024" style="width:100%;margin-top:2px;font-size:12px" />
        </label>
        <label style="font-size:11px;color:var(--muted)">세금계산서 수신 이메일
          <input id="edTaxEmail" class="input" type="email" value="${esc(s.taxEmail || s.email || '')}" placeholder="tax@company.co.kr" style="width:100%;margin-top:2px;font-size:12px" />
        </label>
      </div>
      <div style="display:flex;gap:5px;flex-wrap:wrap;padding-top:6px;border-top:1px dashed var(--border)">
        <button id="btnEdCopyBizHometax" class="btn btn-sm" type="button">📋 사업자번호 복사 + 🏛️ 홈택스 ↗</button>
        <a class="btn btn-sm" href="${TAX_QUICK_LINKS[1].url}" target="_blank" rel="noopener">🔍 휴·폐업 상태조회 ↗</a>
        <a class="btn btn-sm" href="${TAX_QUICK_LINKS[2].url}" target="_blank" rel="noopener">🏦 위택스 ↗</a>
        <a class="btn btn-sm" href="${TAX_QUICK_LINKS[3].url}" target="_blank" rel="noopener">📜 정부24 ↗</a>
      </div>
    </div>
  `;
  $('adminFoot').innerHTML = `
    <button id="btnEdSave" class="btn btn-primary btn-sm" type="button">✅ 고객 · 입금 · 세금계산서 저장</button>
    <button id="btnEdHometaxCsv" class="btn btn-emerald btn-sm" type="button">📥 이 건 홈택스 CSV</button>
    <button id="btnEdCancel" class="btn btn-sm" type="button" style="margin-left:auto">← 목록으로</button>
  `;
  const refreshTaxPreview = () => {
    const a = calcTaxAmounts($('edPrice')?.value, $('edVatMode')?.value || 'sep');
    const el = $('edTaxCalcPreview');
    if (el) el.textContent = `💰 공급가액 ${fmt(a.supply)}원 + 부가세(10%) ${fmt(a.vat)}원 = 합계 ${fmt(a.total)}원 (${fmtDec(a.total / 10000, 1)}만원)`;
  };
  refreshTaxPreview();
  $('edPrice')?.addEventListener('input', refreshTaxPreview);
  $('edVatMode')?.addEventListener('change', refreshTaxPreview);
  $('btnEdCopyBizHometax')?.addEventListener('click', () => {
    const bno = ($('edBizNo')?.value || '').trim();
    if (bno) navigator.clipboard?.writeText(bno);
    window.open('https://www.hometax.go.kr/', '_blank', 'noopener');
    toast(bno ? `📋 사업자번호(${bno}) 복사 완료! 홈택스에서 붙여넣기(Ctrl+V) 하세요.` : '🏛️ 국세청 홈택스를 새 탭으로 열었습니다.');
  });
  $('btnEdHometaxCsv')?.addEventListener('click', () => {
    downloadHometaxBatchCsv([s], reg.taxConfig);
    toast('📥 국세청 홈택스 일괄발급용 CSV 다운로드 완료');
  });
  $('btnEdCancel')?.addEventListener('click', () => openAdminSalesModal('status'));
  $('btnEdSave')?.addEventListener('click', () => {
    s.companyName = $('edCompName')?.value.trim() || s.companyName;
    s.contactName = $('edContactName')?.value.trim() || '';
    s.bizType = $('edBizType')?.value || '';
    s.phone = $('edPhone')?.value.trim() || '';
    s.email = $('edEmail')?.value.trim() || '';
    s.address = $('edAddress')?.value.trim() || '';
    s.saleDate = $('edSaleDate')?.value || s.issuedAt || '';
    s.issuedAt = s.saleDate || s.issuedAt;
    s.channel = $('edChannel')?.value || '본사직판';
    s.sellerCode = $('edSeller')?.value || s.sellerCode;
    s.sellerName = reg.sellers.find((x) => x.id === s.sellerCode)?.name || s.sellerName;
    s.priceMan = Math.max(0, Number($('edPrice')?.value) || 0);
    s.expiryDate = $('edExpiry')?.value || '';
    s.memo = $('edMemo')?.value.trim() || '';
    s.payStatus = $('edPayStatus')?.value || '미수(대기)';
    s.payDate = $('edPayDate')?.value || '';
    s.payMethod = $('edPayMethod')?.value || '계좌이체';
    s.vatMode = $('edVatMode')?.value || 'sep';
    s.paidMan = Math.max(0, Number($('edPaidMan')?.value) || 0);
    s.depositor = $('edDepositor')?.value.trim() || '';
    s.bizNo = $('edBizNo')?.value.trim() || '';
    s.taxStatus = $('edTaxStatus')?.value || '미발급';
    s.taxDate = $('edTaxDate')?.value || '';
    s.ntsConfirmNo = $('edNtsNo')?.value.trim() || '';
    s.taxEmail = $('edTaxEmail')?.value.trim() || s.email || '';
    if (s.cfg) {
      s.cfg.companyName = s.companyName;
      s.cfg.sellerCode = s.sellerCode;
      s.cfg.sellerName = s.sellerName;
      s.cfg.expiryDate = s.expiryDate;
      s.signedUrl = `${location.origin}${location.pathname}?lic=${encodeSignedLicense(s.cfg, reg.expertOpts)}`;
    }
    saveSellerRegistry(reg);
    appendAudit('CUSTOMER_UPDATED', s.licId, `${s.companyName} (입금:${s.payStatus} · 세금:${s.taxStatus} · ${s.channel})`);
    toast(`✅ ${s.companyName} 고객 · 입금 · 세금계산서 정보가 저장되었습니다!`);
    openAdminSalesModal('status');
  });
}

// ===== AUTHORITY CONTROL MODAL (SUSPEND · RESUME · USAGE PERIOD · REMOTE SYNC) =====
function openAuthorityControlModal(licId, isFree = false) {
  const reg = loadSellerRegistry();
  const list = isFree ? (reg.freeDist || []) : (reg.sales || []);
  const item = list.find((x) => x.licId === licId);
  if (!item) return;
  const eo = reg.expertOpts || defaultExpertOpts();
  const todayIso = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
  const isSuspended = item.status === 'revoked' || (reg.revoked || []).includes(licId);
  const displayName = isFree ? `${item.recipientName}${item.affiliation ? ` (${item.affiliation})` : ''}` : item.companyName;
  const rs = { ...defaultRemoteSyncConfig(), ...(reg.remoteSync || {}) };

  $('adminModalTitle').textContent = `🚦 직권 중지 · 재개 · 사용기간 제한 — ${displayName}`;
  $('adminModalSub').textContent = `라이선스 ${licId} · 관리자 직권 즉시 중지/재개 및 허용 사용기간(시작일~종료일) 정밀 통제`;

  $('adminBody').innerHTML = `
    <div class="domain-box" style="margin-bottom:10px;border-color:${isSuspended ? 'rgba(225,29,72,.45)' : 'rgba(16,185,129,.45)'};background:${isSuspended ? 'rgba(225,29,72,.05)' : 'rgba(16,185,129,.05)'}">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
        <div>
          <span style="font-size:12px;color:var(--muted)">현재 라이선스 상태</span><br>
          <b style="font-size:15px;color:${isSuspended ? '#be123c' : '#047857'}">${isSuspended ? '🚫 관리자 직권 중지됨 (접근 차단 상태)' : '✅ 정상 이용 가능 상태'}</b>
          ${isSuspended && item.suspendReason ? `<div style="font-size:12px;color:#be123c;margin-top:3px">중지 사유: ${esc(item.suspendReason)}</div>` : ''}
        </div>
        <div style="text-align:right;font-size:12px">
          <div><b>허용 기간</b>: ${esc(item.startDate || '즉시')} ~ ${esc(item.expiryDate || '영구')}</div>
          <div style="color:var(--muted)">${isFree ? '무료 배포' : `유료 납품 (${esc((item.pkg || '').toUpperCase())})`}</div>
        </div>
      </div>
    </div>

    <div class="domain-box" style="margin-bottom:10px">
      <h4 style="margin:0 0 8px">1. 📅 사용기간 제한 설정 (시작일 ~ 종료일)</h4>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
        <label style="font-size:11.5px;color:var(--muted)">사용 시작일 (비우면 즉시 개통 / 미래 날짜 시 예약 개통)
          <input id="acStartDate" class="input" type="date" value="${esc(item.startDate || '')}" style="width:100%;margin-top:3px;font-size:12px" />
        </label>
        <label style="font-size:11.5px;color:var(--muted)">사용 종료(만료)일 (비우면 영구 이용)
          <input id="acExpiryDate" class="input" type="date" value="${esc(item.expiryDate || '')}" style="width:100%;margin-top:3px;font-size:12px" />
        </label>
      </div>
      <div style="display:flex;gap:5px;flex-wrap:wrap;align-items:center;margin-bottom:8px">
        <span style="font-size:11px;color:var(--muted)">빠른 기간 제한:</span>
        <button type="button" class="btn btn-sm" data-ac-days="7">7일</button>
        <button type="button" class="btn btn-sm" data-ac-days="14">14일</button>
        <button type="button" class="btn btn-sm" data-ac-days="30">30일</button>
        <button type="button" class="btn btn-sm" data-ac-days="90">90일</button>
        <button type="button" class="btn btn-sm" data-ac-days="365">1년(365일)</button>
        <button type="button" class="btn btn-emerald btn-sm" id="btnAcPlus30">+30일 연장</button>
        <button type="button" class="btn btn-sm" data-ac-days="0">♾️ 기간제한 해제(영구)</button>
      </div>
      <button id="btnAcSavePeriod" class="btn btn-primary btn-sm" type="button">📅 사용기간 제한 적용 & 서명링크 갱신</button>
    </div>

    <div class="domain-box" style="margin-bottom:10px;border-color:rgba(225,29,72,.35)">
      <h4 style="margin:0 0 8px">2. 🚦 관리자 직권 중지 · 직권 재개</h4>
      <div style="display:grid;grid-template-columns:1fr 1.2fr;gap:8px;margin-bottom:10px">
        <label style="font-size:11.5px;color:var(--muted)">중지 사유 프리셋
          <select id="acReasonPreset" class="select" style="width:100%;margin-top:3px;font-size:12px">
            <option value="">직접 입력 또는 선택…</option>
            ${SUSPEND_REASONS.map((r) => `<option value="${esc(r)}" ${item.suspendReason === r ? 'selected' : ''}>${esc(r)}</option>`).join('')}
          </select>
        </label>
        <label style="font-size:11.5px;color:var(--muted)">고객 화면에 표시될 중지 사유
          <input id="acReason" class="input" value="${esc(item.suspendReason || '')}" placeholder="예: 대금 미납으로 인한 관리자 직권 중지" style="width:100%;margin-top:3px;font-size:12px" />
        </label>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button id="btnAcSuspend" class="btn btn-rose btn-sm" type="button">🚫 관리자 직권 사용 중지</button>
        <button id="btnAcResume" class="btn btn-emerald btn-sm" type="button">▶️ 관리자 직권 사용 재개</button>
      </div>
    </div>

    <div class="domain-box" style="background:rgba(79,70,229,.04);border-color:rgba(79,70,229,.3)">
      <h4 style="margin:0 0 6px">3. ☁️ 원격 고객 PC·스마트폰 즉시 반영 (<code>data/license_control.json</code>)</h4>
      <div style="font-size:11.5px;color:var(--text-2);line-height:1.5;margin-bottom:8px">
        • 동일 브라우저에서는 위 버튼 클릭 즉시 반영됩니다.<br>
        • <b>다른 PC/모바일의 원격 고객 기기</b>까지 즉시 중지·재개·기간변경을 반영하려면 <b>[☁️ 원격 고객 기기 즉시 동기화]</b>(TOP 10 탭에서 GitHub 토큰 1회 등록) 또는 <b>[📥 license_control.json 다운로드]</b> 후 리포지토리 <code>data/</code>에 업로드하세요.
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center">
        <button id="btnAcRemotePush" class="btn btn-primary btn-sm" type="button">☁️ 원격 고객 기기 즉시 동기화${rs.token ? ' (토큰 연결됨)' : ''}</button>
        <button id="btnAcDownloadJson" class="btn btn-sm" type="button">📥 license_control.json 다운로드</button>
        <button id="btnAcGoSyncCfg" class="btn btn-sm" type="button">⚙️ 원격 동기화 토큰 설정</button>
      </div>
    </div>
  `;

  $('adminFoot').innerHTML = `
    <button id="btnAcPreview" class="btn btn-sm" type="button">👁️ 새 탭에서 고객 화면 확인</button>
    <button id="btnAcBack" class="btn btn-primary btn-sm" type="button" style="margin-left:auto">← ${isFree ? '무료배포 목록' : '납품고객 목록'}으로</button>
  `;

  const syncOverride = (statusStr, reasonStr) => {
    item.startDate = $('acStartDate')?.value || '';
    item.expiryDate = $('acExpiryDate')?.value || '';
    if (statusStr === 'suspended') {
      item.status = 'revoked';
      item.suspendReason = reasonStr || '관리자 직권으로 사용이 중지되었습니다.';
      item.suspendedAt = new Date().toLocaleString('ko-KR');
    } else if (statusStr === 'active') {
      item.status = 'active';
      item.suspendReason = '';
      item.resumedAt = new Date().toLocaleString('ko-KR');
    }
    const revokedSet = new Set(reg.revoked || []);
    if (item.status === 'revoked') revokedSet.add(licId);
    else revokedSet.delete(licId);
    reg.revoked = [...revokedSet];
    if (!reg.controlOverrides) reg.controlOverrides = {};
    reg.controlOverrides[licId] = {
      status: item.status === 'revoked' ? 'suspended' : 'active',
      reason: item.status === 'revoked' ? (item.suspendReason || '') : '',
      startDate: item.startDate || '',
      expiryDate: item.expiryDate || '',
      updatedAt: new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 19).replace('T', ' '),
    };
    if (item.cfg) {
      item.cfg.startDate = item.startDate;
      item.cfg.expiryDate = item.expiryDate;
      item.signedUrl = `${location.origin}${location.pathname}?lic=${encodeSignedLicense(item.cfg, eo)}`;
    }
    saveSellerRegistry(reg);
  };

  $('acReasonPreset')?.addEventListener('change', (e) => {
    if (e.target.value && $('acReason')) $('acReason').value = e.target.value;
  });

  $('adminBody').querySelectorAll('[data-ac-days]').forEach((b) => {
    b.addEventListener('click', () => {
      const d = Number(b.dataset.acDays) || 0;
      if ($('acExpiryDate')) $('acExpiryDate').value = d > 0 ? addDaysKstIso(d) : '';
      if (d === 0 && $('acStartDate')) $('acStartDate').value = '';
    });
  });

  $('btnAcPlus30')?.addEventListener('click', () => {
    const cur = $('acExpiryDate')?.value || '';
    const baseMs = (cur && cur >= todayIso) ? new Date(`${cur}T12:00:00+09:00`).getTime() : Date.now();
    if ($('acExpiryDate')) $('acExpiryDate').value = new Date(baseMs + 30 * 86400 * 1000).toISOString().slice(0, 10);
  });

  $('btnAcSavePeriod')?.addEventListener('click', () => {
    syncOverride(null, '');
    appendAudit('PERIOD_UPDATED', licId, `${displayName} 사용기간 → ${item.startDate || '즉시'} ~ ${item.expiryDate || '영구'}`);
    navigator.clipboard?.writeText(item.signedUrl);
    toast(`📅 ${displayName} 사용기간(${item.startDate || '즉시'} ~ ${item.expiryDate || '영구'}) 적용 & 갱신 링크 복사 완료!`);
    openAuthorityControlModal(licId, isFree);
  });

  $('btnAcSuspend')?.addEventListener('click', () => {
    const rsn = $('acReason')?.value.trim() || $('acReasonPreset')?.value || '관리자 직권으로 사용이 중지되었습니다.';
    syncOverride('suspended', rsn);
    appendAudit('AUTHORITY_SUSPENDED', licId, `${displayName} 직권 중지 (사유: ${rsn})`);
    toast(`🚫 ${displayName} 라이선스가 관리자 직권으로 중지되었습니다!`);
    openAuthorityControlModal(licId, isFree);
  });

  $('btnAcResume')?.addEventListener('click', () => {
    syncOverride('active', '');
    appendAudit('AUTHORITY_RESUMED', licId, `${displayName} 직권 사용 재개`);
    toast(`▶️ ${displayName} 라이선스가 관리자 직권으로 정상 재개되었습니다!`);
    openAuthorityControlModal(licId, isFree);
  });

  $('btnAcRemotePush')?.addEventListener('click', async () => {
    const btn = $('btnAcRemotePush');
    if (btn) { btn.disabled = true; btn.textContent = '☁️ 원격 동기화 중…'; }
    const res = await publishLicenseControlToGithub(reg);
    if (btn) { btn.disabled = false; btn.textContent = `☁️ 원격 고객 기기 즉시 동기화${rs.token ? ' (토큰 연결됨)' : ''}`; }
    if (res.ok) {
      appendAudit('REMOTE_CONTROL_SYNCED', licId, res.msg);
      toast(`☁️ ${res.msg}`);
    } else if (res.noToken) {
      downloadLicenseControlJson(reg);
      toast('ℹ️ 원격 토큰 미설정: license_control.json 파일을 다운로드했습니다. (자동 동기화는 ⚙️ 토큰 설정에서 1회 입력)');
    } else {
      toast(`⚠️ 원격 동기화 실패: ${res.msg}`);
    }
  });

  $('btnAcDownloadJson')?.addEventListener('click', () => {
    downloadLicenseControlJson(reg);
    toast('📥 license_control.json 다운로드 완료 (data/license_control.json에 반영하세요)');
  });

  $('btnAcGoSyncCfg')?.addEventListener('click', () => openAdminSalesModal('expert'));
  $('btnAcPreview')?.addEventListener('click', () => window.open(item.signedUrl, '_blank', 'noopener'));
  $('btnAcBack')?.addEventListener('click', () => openAdminSalesModal(isFree ? 'free' : 'status'));
}

// ===== SELLER MASTER CONSOLE (7 TABS: ISSUE · STATUS/CRM · FREE · TAX/API · SELLERS · TOP 10 · AUDIT) =====
function openAdminSalesModal(tabKey = null) {
  if (S.isBuyerMode) {
    openBuyerAdminModal();
    return;
  }
  if (tabKey) S.adminModalTab = tabKey;
  const activeTab = S.adminModalTab || 'issue';
  const reg = loadSellerRegistry();
  const eo = reg.expertOpts || defaultExpertOpts();

  $('adminModalTitle').textContent = '🛡️ 넥서스원 PRO · 판매자 마스터 통합 콘솔';
  $('adminModalSub').textContent = '마스터 기본 모드 보호 · 판매링크 발급 · 판매자/현황 CRM · 원격 비밀번호 초기화 · 전문가 기법 TOP 10';

  const pendingTaxCnt = reg.sales.filter((x) => x.taxStatus === '미발급' || x.taxStatus === '발급요청').length;
  const freeCnt = (reg.freeDist || []).length;
  const tabBarHtml = `
    <div class="nx-adm-tabs">
      <button type="button" class="nx-adm-tab ${activeTab === 'issue' ? 'active' : ''}" data-adm-nav="issue">🚀 판매링크 발급</button>
      <button type="button" class="nx-adm-tab ${activeTab === 'status' ? 'active' : ''}" data-adm-nav="status">📊 납품고객·입금·세금 (${reg.sales.length})</button>
      <button type="button" class="nx-adm-tab ${activeTab === 'free' ? 'active' : ''}" data-adm-nav="free">🎁 무료배포·이력 (${freeCnt})</button>
      <button type="button" class="nx-adm-tab ${activeTab === 'tax' ? 'active' : ''}" data-adm-nav="tax">🧾 세금계산서·API${pendingTaxCnt ? ` (${pendingTaxCnt})` : ''}</button>
      <button type="button" class="nx-adm-tab ${activeTab === 'sellers' ? 'active' : ''}" data-adm-nav="sellers">🧑‍💼 판매자 (${reg.sellers.length})</button>
      <button type="button" class="nx-adm-tab ${activeTab === 'expert' ? 'active' : ''}" data-adm-nav="expert">💎 TOP 10</button>
      <button type="button" class="nx-adm-tab ${activeTab === 'audit' ? 'active' : ''}" data-adm-nav="audit">📜 감사로그</button>
    </div>`;

  // ---------- TAB 1: ISSUE SIGNED SALES LINK ----------
  if (activeTab === 'issue') {
    const todayKst = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
    const draft = S.salesDraft || {
      ...createClientSampleConfig(),
      licId: nextSeqId(reg.sales, `NX-${new Date().getFullYear()}`, 'licId'),
      companyName: '',
      contactName: '',
      phone: '',
      email: '',
      address: '',
      bizType: '건설·안전시설',
      bizNo: '',
      saleDate: todayKst,
      channel: '크몽',
      vatMode: 'sep',
      payStatus: '입금완료',
      payDate: todayKst,
      payMethod: '계좌이체',
      paidMan: 64.9,
      depositor: '',
      taxStatus: '미발급',
      taxDate: '',
      ntsConfirmNo: '',
      brandTitle: '',
      brandBadge: 'PRO',
      brandSub: '',
      priceMan: 59,
      sellerCode: reg.sellers[0]?.id || 'SLR-001',
      expiryDate: '',
      memo: '',
    };
    S.salesDraft = draft;
    if (!draft.appLinks) draft.appLinks = { showSection: false, corp: false, bid: false, sbiz: false, re: false };

    const tabMeta = [
      ['overview', '⚡ 통합 360° 커맨드', '229 시군구 융합지도·BCG'],
      ['corp', '🏢 기업분석 (12만사)', 'DART공시+국민연금 추정매출'],
      ['bid', '🎯 입찰·사전규격·레이더', '나라장터·당일·건설사 1.2만'],
      ['sbiz', '🏪 상권지도 (275만)', '브이월드 GIS·지적도·반경'],
      ['realestate', '🏠 청약·착공·인허가', '신축분양·인허가·K-apt'],
      ['hub', '🔌 API진단 · CRM', '파이프라인·라이브 진단'],
    ];
    const featMeta = [
      ['bidDetail', '📎 입찰 상세 · 첨부 직링크', '공고문/과업지시서 다운로드'],
      ['bidSim', '🎯 A값·1,365조합·적격심사', '순공사 98% 경고·적격판정'],
      ['bidAwards', '📊 과거 낙찰 분포도', '평균 낙찰률·최빈구간'],
      ['bidPartners', '🤝 지역 협력 파트너 TOP 5', '건설·시설사 12,198 매칭'],
      ['bidA4', '📑 A4 검토서 & 캘린더', '1P 결재 PDF + 워터마크'],
      ['bid1km', '🗺️ 현장 반경 1km 상권점프', '브이월드 좌표·상권 연동'],
    ];

    $('adminBody').innerHTML = `${tabBarHtml}
      <div class="domain-box" style="margin-bottom:10px;border-color:rgba(16,185,129,.4);background:rgba(16,185,129,.06)">
        <div style="font-size:12px;line-height:1.5">
          ✅ <b>마스터 보호 모드 작동 중</b>: 여기서 판매링크를 발급하거나 미리보기(새 탭)를 열어도 <b>본인의 넥서스원 PRO 기본 모드는 절대 덮어써지지 않습니다.</b><br>
          🔑 발급된 구매자 전용 링크에는 <b>구매자 자체 관리자 (초기 비밀번호 <code>admin</code> · 첫 로그인 시 변경 강제)</b>가 자동 탑재됩니다.
        </div>
      </div>

      <div class="domain-box" style="margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;margin-bottom:8px;flex-wrap:wrap">
          <h4 style="margin:0">1. 판매 패키지 프리셋</h4>
          <button id="admLoadSampleDraft" type="button" class="btn btn-amber btn-sm">📦 ㈜한빛안전건설 납품 샘플 불러오기</button>
        </div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px">
          ${Object.entries(SALES_PACKAGES).map(([k, p]) => `
            <button type="button" data-adm-pkg="${k}" class="btn btn-sm ${draft.pkg === k ? 'btn-primary' : ''}" style="justify-content:flex-start;flex-direction:column;align-items:flex-start;padding:7px 9px;height:auto;text-align:left">
              <span style="font-weight:800;font-size:12px">${p.label}</span>
              <span style="font-size:10.5px;opacity:.85">${p.priceMan}만원</span>
            </button>`).join('')}
        </div>
      </div>

      <div class="domain-box" style="margin-bottom:10px">
        <h4 style="margin:0 0 8px">2. 납품 시설 고객 정보 · 판매일자 · 판매경로 · 계약</h4>
        <div style="display:grid;grid-template-columns:1.2fr 1fr 1fr;gap:6px;margin-bottom:6px">
          <label style="font-size:11px;color:var(--muted)">고객사 / 시설명 *
            <input id="dCompName" class="input" value="${esc(draft.companyName || '')}" placeholder="예: ㈜대한안전건설" style="width:100%;margin-top:2px;padding:6px 8px;font-size:12px" />
          </label>
          <label style="font-size:11px;color:var(--muted)">고객명 (담당자)
            <input id="dContactName" class="input" value="${esc(draft.contactName || '')}" placeholder="예: 김담당 부장" style="width:100%;margin-top:2px;padding:6px 8px;font-size:12px" />
          </label>
          <label style="font-size:11px;color:var(--muted)">시설 / 업종 구분
            <select id="dBizType" class="select" style="width:100%;margin-top:2px;padding:6px 8px;font-size:12px">
              <option value="">선택</option>
              ${FACILITY_TYPES.map((f) => `<option value="${esc(f)}" ${draft.bizType === f ? 'selected' : ''}>${esc(f)}</option>`).join('')}
            </select>
          </label>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1.4fr;gap:6px;margin-bottom:6px">
          <label style="font-size:11px;color:var(--muted)">연락처 (휴대폰 / 전화)
            <input id="dPhone" class="input" value="${esc(draft.phone || '')}" placeholder="010-1234-5678" style="width:100%;margin-top:2px;padding:6px 8px;font-size:12px" />
          </label>
          <label style="font-size:11px;color:var(--muted)">이메일
            <input id="dEmail" class="input" type="email" value="${esc(draft.email || '')}" placeholder="bid@company.co.kr" style="width:100%;margin-top:2px;padding:6px 8px;font-size:12px" />
          </label>
          <label style="font-size:11px;color:var(--muted)">시설 / 사업장 주소
            <input id="dAddress" class="input" value="${esc(draft.address || '')}" placeholder="예: 경기도 수원시 영통구 광교중앙로 145" style="width:100%;margin-top:2px;padding:6px 8px;font-size:12px" />
          </label>
        </div>
        <div style="display:grid;grid-template-columns:1.2fr 84px 125px 125px 110px;gap:6px;margin-bottom:6px">
          <label style="font-size:11px;color:var(--muted)">화이트라벨 브랜드명 *
            <input id="dBrandTitle" class="input" value="${esc(draft.brandTitle || '')}" placeholder="예: 대한 입찰레이더" style="width:100%;margin-top:2px;padding:6px 8px;font-size:12px" />
          </label>
          <label style="font-size:11px;color:var(--muted)">배지
            <input id="dBrandBadge" class="input" value="${esc(draft.brandBadge || '')}" placeholder="PRO" style="width:100%;margin-top:2px;padding:6px 8px;font-size:12px" />
          </label>
          <label style="font-size:11px;color:var(--muted)">판매일자
            <input id="dSaleDate" class="input" type="date" value="${esc(draft.saleDate || todayKst)}" style="width:100%;margin-top:2px;padding:5px 7px;font-size:12px" />
          </label>
          <label style="font-size:11px;color:var(--muted)">판매경로
            <select id="dChannel" class="select" style="width:100%;margin-top:2px;padding:6px 8px;font-size:12px">
              ${SALES_CHANNELS.map((c) => `<option value="${esc(c)}" ${(draft.channel || '크몽') === c ? 'selected' : ''}>${esc(c)}</option>`).join('')}
            </select>
          </label>
          <label style="font-size:11px;color:var(--muted)">판매금액(만원)
            <input id="dPrice" class="input" type="number" min="0" value="${Number(draft.priceMan) || 0}" style="width:100%;margin-top:2px;padding:6px 8px;font-size:12px" />
          </label>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 125px 125px;gap:6px;margin-bottom:6px">
          <label style="font-size:11px;color:var(--muted)">라이선스 코드
            <input id="dLicId" class="input mono" value="${esc(draft.licId)}" style="width:100%;margin-top:2px;padding:6px 8px;font-size:12px" />
          </label>
          <label style="font-size:11px;color:var(--muted)">담당 판매자
            <select id="dSeller" class="select" style="width:100%;margin-top:2px;padding:6px 8px;font-size:12px">
              ${reg.sellers.map((sl) => `<option value="${esc(sl.id)}" ${draft.sellerCode === sl.id ? 'selected' : ''}>${esc(sl.name)} (${sl.commissionPct}%)</option>`).join('')}
            </select>
          </label>
          <label style="font-size:11px;color:var(--muted)">사용 시작일 (비우면 즉시)
            <input id="dStartDate" class="input" type="date" value="${esc(draft.startDate || '')}" style="width:100%;margin-top:2px;padding:5px 7px;font-size:12px" />
          </label>
          <label style="font-size:11px;color:var(--muted)">사용 만료일 (비우면 영구)
            <input id="dExpiry" class="input" type="date" value="${esc(draft.expiryDate || '')}" style="width:100%;margin-top:2px;padding:5px 7px;font-size:12px" />
          </label>
        </div>
        <div style="display:flex;gap:5px;align-items:center;flex-wrap:wrap;margin-bottom:6px;font-size:11px;color:var(--muted)">
          <span>📅 사용기간 빠른 제한:</span>
          <button type="button" class="btn btn-sm" data-issue-days="7">7일</button>
          <button type="button" class="btn btn-sm" data-issue-days="30">30일(1개월)</button>
          <button type="button" class="btn btn-sm" data-issue-days="90">90일(3개월)</button>
          <button type="button" class="btn btn-sm" data-issue-days="365">1년(365일)</button>
          <button type="button" class="btn btn-sm" data-issue-days="0">♾️ 영구</button>
        </div>
        <div style="display:grid;grid-template-columns:1.2fr 1fr;gap:6px;margin-bottom:6px">
          <label style="font-size:11px;color:var(--muted)">상단 서브타이틀
            <input id="dBrandSub" class="input" value="${esc(draft.brandSub || '')}" placeholder="예: ㈜대한안전건설 전용 · 실시간 입찰·기업 분석" style="width:100%;margin-top:2px;padding:6px 8px;font-size:12px" />
          </label>
          <label style="font-size:11px;color:var(--muted)">비고 (세금계산서 · 설치 · 특이사항)
            <input id="dMemo" class="input" value="${esc(draft.memo || '')}" placeholder="예: 크몽 주문 #12345 / 세금계산서 발행" style="width:100%;margin-top:2px;padding:6px 8px;font-size:12px" />
          </label>
        </div>
        <div style="display:grid;grid-template-columns:1fr 110px 120px 105px 110px 115px;gap:6px;padding-top:6px;border-top:1px dashed var(--border)">
          <label style="font-size:11px;color:var(--muted)">고객 사업자번호
            <input id="dBizNo" class="input mono" value="${esc(draft.bizNo || '')}" placeholder="000-00-00000" style="width:100%;margin-top:2px;padding:5px 7px;font-size:11.5px" />
          </label>
          <label style="font-size:11px;color:var(--muted)">입금상태
            <select id="dPayStatus" class="select" style="width:100%;margin-top:2px;padding:5px 6px;font-size:11.5px">
              ${PAY_STATUSES.map((p) => `<option value="${esc(p)}" ${(draft.payStatus || '입금완료') === p ? 'selected' : ''}>${esc(p)}</option>`).join('')}
            </select>
          </label>
          <label style="font-size:11px;color:var(--muted)">입금일자
            <input id="dPayDate" class="input" type="date" value="${esc(draft.payDate || '')}" style="width:100%;margin-top:2px;padding:4px 6px;font-size:11.5px" />
          </label>
          <label style="font-size:11px;color:var(--muted)">입금수단
            <select id="dPayMethod" class="select" style="width:100%;margin-top:2px;padding:5px 6px;font-size:11.5px">
              ${PAY_METHODS.map((m) => `<option value="${esc(m)}" ${(draft.payMethod || '계좌이체') === m ? 'selected' : ''}>${esc(m)}</option>`).join('')}
            </select>
          </label>
          <label style="font-size:11px;color:var(--muted)">부가세 구분
            <select id="dVatMode" class="select" style="width:100%;margin-top:2px;padding:5px 6px;font-size:11.5px">
              <option value="sep" ${(draft.vatMode || 'sep') === 'sep' ? 'selected' : ''}>부가세 별도</option>
              <option value="inc" ${draft.vatMode === 'inc' ? 'selected' : ''}>부가세 포함</option>
            </select>
          </label>
          <label style="font-size:11px;color:var(--muted)">세금계산서
            <select id="dTaxStatus" class="select" style="width:100%;margin-top:2px;padding:5px 6px;font-size:11.5px">
              ${TAX_STATUSES.map((t) => `<option value="${esc(t)}" ${(draft.taxStatus || '미발급') === t ? 'selected' : ''}>${esc(t)}</option>`).join('')}
            </select>
          </label>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">
        <div class="domain-box">
          <h4 style="margin:0 0 6px">3. 허용 도메인(탭)</h4>
          <div style="display:grid;gap:5px">
            ${tabMeta.map(([k, lb, desc]) => `
              <label style="display:flex;gap:6px;align-items:center;font-size:11.5px;cursor:pointer">
                <input type="checkbox" data-adm-tab="${k}" ${draft.tabs[k] ? 'checked' : ''} />
                <b>${lb}</b> <span style="color:var(--muted);font-size:10.5px">${desc}</span>
              </label>`).join('')}
          </div>
        </div>
        <div class="domain-box">
          <h4 style="margin:0 0 6px">4. 입찰 프리미엄 기능</h4>
          <div style="display:grid;gap:5px">
            ${featMeta.map(([k, lb, desc]) => `
              <label style="display:flex;gap:6px;align-items:center;font-size:11.5px;cursor:pointer">
                <input type="checkbox" data-adm-feat="${k}" ${draft.features[k] ? 'checked' : ''} />
                <b>${lb}</b> <span style="color:var(--muted);font-size:10.5px">${desc}</span>
              </label>`).join('')}
          </div>
        </div>
      </div>

      <div class="domain-box" style="border-color:#fde68a;background:rgba(245,158,11,.04)">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:6px;flex-wrap:wrap">
          <h4 style="margin:0">5. 🚀 개별 전문 앱 바로가기 노출 통제</h4>
          <label style="display:flex;align-items:center;gap:6px;font-size:12px;font-weight:800;cursor:pointer">
            <input id="admAppLinksMaster" type="checkbox" ${draft.appLinks.showSection ? 'checked' : ''} />
            <span>구매자에게 바로가기 섹션 표시</span>
          </label>
        </div>
        <div id="admAppLinksGrid" style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;opacity:${draft.appLinks.showSection ? '1' : '.45'}">
          ${INDIVIDUAL_PRO_APPS.map((a) => `
            <label style="display:flex;gap:5px;align-items:center;padding:5px 7px;border:1px solid var(--border);border-radius:7px;cursor:pointer;background:var(--bg);font-size:11px">
              <input type="checkbox" data-adm-app="${a.key}" ${draft.appLinks[a.key] ? 'checked' : ''} ${draft.appLinks.showSection ? '' : 'disabled'} />
              <b>${a.name.replace(' ↗', '')}</b>
            </label>`).join('')}
        </div>
      </div>
    `;

    $('adminFoot').innerHTML = `
      <button id="btnIssueAndCopy" class="btn btn-primary btn-sm" type="button">✨ 판매 등록 + 서명 판매링크 발급·복사</button>
      <button id="btnIssuePreview" class="btn btn-emerald btn-sm" type="button">👁️ 새 탭에서 구매자 미리보기</button>
      <button id="btnMasterSelfReset" class="btn btn-sm" type="button" style="margin-left:auto">🔄 내 화면 마스터 기본값 유지</button>
    `;

    const syncDraft = () => {
      draft.companyName = $('dCompName')?.value.trim() || '신규 고객사';
      draft.contactName = $('dContactName')?.value.trim() || '';
      draft.bizType = $('dBizType')?.value || '';
      draft.phone = $('dPhone')?.value.trim() || '';
      draft.email = $('dEmail')?.value.trim() || '';
      draft.address = $('dAddress')?.value.trim() || '';
      draft.saleDate = $('dSaleDate')?.value || todayKst;
      draft.channel = $('dChannel')?.value || '크몽';
      draft.brandTitle = $('dBrandTitle')?.value.trim() || draft.companyName;
      draft.brandBadge = $('dBrandBadge')?.value.trim() || '';
      draft.brandSub = $('dBrandSub')?.value.trim() || `${draft.companyName} 전용 · 맞춤형 B2B 영업 인텔리전스`;
      draft.licId = $('dLicId')?.value.trim() || `NX-${new Date().getFullYear()}-${String(reg.sales.length + 1).padStart(3, '0')}`;
      draft.sellerCode = $('dSeller')?.value || reg.sellers[0]?.id || 'SLR-001';
      draft.sellerName = reg.sellers.find((x) => x.id === draft.sellerCode)?.name || '본사 직판 (마스터)';
      draft.priceMan = Math.max(0, Number($('dPrice')?.value) || 0);
      draft.startDate = $('dStartDate')?.value || '';
      draft.expiryDate = $('dExpiry')?.value || '';
      draft.memo = $('dMemo')?.value.trim() || '';
      draft.bizNo = $('dBizNo')?.value.trim() || '';
      draft.payStatus = $('dPayStatus')?.value || '입금완료';
      draft.payDate = $('dPayDate')?.value || '';
      draft.payMethod = $('dPayMethod')?.value || '계좌이체';
      draft.vatMode = $('dVatMode')?.value || 'sep';
      draft.taxStatus = $('dTaxStatus')?.value || '미발급';
      const calcA = calcTaxAmounts(draft.priceMan, draft.vatMode);
      draft.paidMan = draft.payStatus === '입금완료' ? Number((calcA.total / 10000).toFixed(1)) : 0;
      $('adminBody').querySelectorAll('[data-adm-tab]').forEach((el) => { draft.tabs[el.dataset.admTab] = el.checked; });
      $('adminBody').querySelectorAll('[data-adm-feat]').forEach((el) => { draft.features[el.dataset.admFeat] = el.checked; });
      const showSec = Boolean($('admAppLinksMaster')?.checked);
      draft.appLinks = { showSection: showSec, corp: false, bid: false, sbiz: false, re: false };
      $('adminBody').querySelectorAll('[data-adm-app]').forEach((el) => { draft.appLinks[el.dataset.admApp] = showSec && el.checked; });
      draft.forcePwChange = eo.forcePwChange !== false;
      draft.a4Watermark = eo.a4Watermark !== false;
      draft.rbacStrict = eo.rbacStrict !== false;
      draft.expiryMode = eo.expiryMode || 'lock';
    };

    $('adminBody').querySelectorAll('[data-issue-days]').forEach((b) => {
      b.addEventListener('click', () => {
        const d = Number(b.dataset.issueDays) || 0;
        const iso = d > 0 ? addDaysKstIso(d) : '';
        draft.expiryDate = iso;
        if ($('dExpiry')) $('dExpiry').value = iso;
        toast(d > 0 ? `📅 사용 만료일이 ${d}일 뒤(${iso})로 제한되었습니다.` : '♾️ 영구 사용으로 설정되었습니다.');
      });
    });

    $('admAppLinksMaster')?.addEventListener('change', (e) => {
      const on = e.target.checked;
      const g = $('admAppLinksGrid');
      if (g) g.style.opacity = on ? '1' : '.45';
      $('adminBody').querySelectorAll('[data-adm-app]').forEach((cb) => { cb.disabled = !on; });
    });

    $('admLoadSampleDraft')?.addEventListener('click', () => {
      S.salesDraft = {
        ...createClientSampleConfig(),
        contactName: '김한빛 부장',
        phone: '010-4821-7700',
        email: 'bid@hanbitsafety.co.kr',
        address: '경기도 수원시 영통구 광교중앙로 145',
        bizType: '건설·안전시설',
        saleDate: todayKst,
        channel: '크몽',
        memo: '실제 판매 납품 샘플 · DELUXE · 세금계산서 발행',
      };
      openAdminSalesModal('issue');
      toast('📦 ㈜한빛안전건설 납품 고객 샘플을 초안에 불러왔습니다.');
    });

    $('adminBody').querySelectorAll('[data-adm-pkg]').forEach((b) => {
      b.addEventListener('click', () => {
        syncDraft();
        const k = b.dataset.admPkg;
        draft.pkg = k;
        draft.priceMan = SALES_PACKAGES[k].priceMan;
        draft.tabs = { ...SALES_PACKAGES[k].tabs };
        draft.features = { ...SALES_PACKAGES[k].features };
        draft.appLinks = { ...SALES_PACKAGES[k].appLinks };
        openAdminSalesModal('issue');
      });
    });

    $('btnIssueAndCopy')?.addEventListener('click', () => {
      syncDraft();
      const base = `${location.origin}${location.pathname}`;
      const signedUrl = `${base}?lic=${encodeSignedLicense(draft, eo)}`;
      const saleObj = {
        licId: draft.licId,
        companyName: draft.companyName,
        contactName: draft.contactName,
        phone: draft.phone,
        email: draft.email,
        address: draft.address,
        bizType: draft.bizType,
        bizNo: draft.bizNo || '',
        brandTitle: draft.brandTitle,
        brandBadge: draft.brandBadge,
        brandSub: draft.brandSub,
        pkg: draft.pkg,
        priceMan: draft.priceMan,
        vatMode: draft.vatMode || 'sep',
        payStatus: draft.payStatus || '입금완료',
        payDate: draft.payDate || '',
        payMethod: draft.payMethod || '계좌이체',
        paidMan: draft.paidMan || 0,
        depositor: draft.depositor || '',
        taxStatus: draft.taxStatus || '미발급',
        taxDate: draft.taxStatus === '발급완료' ? (draft.saleDate || todayKst) : '',
        ntsConfirmNo: '',
        taxEmail: draft.email || '',
        sellerCode: draft.sellerCode,
        sellerName: draft.sellerName,
        saleDate: draft.saleDate || todayKst,
        issuedAt: draft.saleDate || todayKst,
        channel: draft.channel || '크몽',
        startDate: draft.startDate || '',
        expiryDate: draft.expiryDate,
        suspendReason: '',
        status: 'active',
        resetCount: 0,
        lastResetAt: '',
        memo: draft.memo,
        cfg: JSON.parse(JSON.stringify(draft)),
        signedUrl,
      };
      const idx = reg.sales.findIndex((x) => x.licId === saleObj.licId);
      if (idx >= 0) reg.sales[idx] = saleObj;
      else reg.sales.unshift(saleObj);
      saveSellerRegistry(reg);
      appendAudit('LICENSE_ISSUED', saleObj.licId, `${saleObj.companyName} (${saleObj.pkg.toUpperCase()} · ${saleObj.priceMan}만원 · 판매자 ${saleObj.sellerName})`);
      navigator.clipboard?.writeText(signedUrl);
      S.salesDraft = null;
      toast(`✨ ${saleObj.companyName} 판매 등록 & 서명 판매링크 복사 완료!`);
      openAdminSalesModal('status');
    });

    $('btnIssuePreview')?.addEventListener('click', () => {
      syncDraft();
      const url = `${location.origin}${location.pathname}?lic=${encodeSignedLicense(draft, eo)}`;
      window.open(url, '_blank', 'noopener');
      toast('👁️ 새 탭에서 구매자 격리 미리보기를 열었습니다. (마스터 모드 유지됨)');
    });

    $('btnMasterSelfReset')?.addEventListener('click', () => {
      S.admin = defaultAdminConfig();
      saveAdminConfig();
      try { localStorage.removeItem(LEGACY_ADMIN_KEY); } catch {}
      applyAdminConfig(true);
      toast('🔄 넥서스원 PRO 마스터 기본 모드가 확인되었습니다.');
    });
  }

  // ---------- TAB 2: SALES STATUS CRM, PAYMENT, TAX INVOICE & PASSWORD RESET ----------
  else if (activeTab === 'status') {
    const todayIso = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
    const totalSales = reg.sales.length;
    const totalRevMan = reg.sales.reduce((s, x) => s + (Number(x.priceMan) || 0), 0);
    const paidSumMan = reg.sales.reduce((s, x) => {
      if (x.payStatus === '입금완료') return s + (Number(x.paidMan) || Number((calcTaxAmounts(x.priceMan, x.vatMode).total / 10000).toFixed(1)));
      if (x.payStatus === '부분입금') return s + (Number(x.paidMan) || 0);
      return s;
    }, 0);
    const unpaidCnt = reg.sales.filter((x) => x.payStatus === '미수(대기)' || x.payStatus === '부분입금').length;
    const unpaidTaxCnt = reg.sales.filter((x) => x.taxStatus === '미발급' || x.taxStatus === '발급요청').length;

    $('adminBody').innerHTML = `${tabBarHtml}
      <div class="nx-adm-kpi4">
        <div class="nx-adm-kpi"><div class="l">총 납품 고객 / 공급가</div><div class="v">${fmt(totalSales)}건 · ${fmt(totalRevMan)}만</div><div class="s">등록 라이선스 기준</div></div>
        <div class="nx-adm-kpi"><div class="l">💰 실입금 완료액</div><div class="v" style="color:#059669">${fmtDec(paidSumMan, 1)}만원</div><div class="s">부가세 포함 입금합계</div></div>
        <div class="nx-adm-kpi"><div class="l">⏳ 미수 · 부분입금</div><div class="v" style="color:#d97706">${fmt(unpaidCnt)}건</div><div class="s">입금 확인 대기</div></div>
        <div class="nx-adm-kpi"><div class="l">🧾 세금계산서 미발급</div><div class="v" style="color:${unpaidTaxCnt ? '#e11d48' : '#059669'}">${fmt(unpaidTaxCnt)}건</div><div class="s">국세청 발급 대상</div></div>
      </div>

      <div style="display:flex;gap:6px;margin-bottom:8px;flex-wrap:wrap">
        <input id="crmQ" class="input" placeholder="고객사 · 고객명 · 연락처 · 사업자번호 · 주소 · 승인번호 · 비고 검색…" style="flex:1;min-width:190px;padding:6px 10px;font-size:12px" />
        <select id="crmChannelFilter" class="select" style="font-size:11.5px;padding:6px 8px">
          <option value="">전체 판매경로</option>
          ${SALES_CHANNELS.map((c) => `<option value="${esc(c)}">${esc(c)}</option>`).join('')}
        </select>
        <select id="crmPayFilter" class="select" style="font-size:11.5px;padding:6px 8px">
          <option value="">전체 입금상태</option>
          ${PAY_STATUSES.map((p) => `<option value="${esc(p)}">${esc(p)}</option>`).join('')}
        </select>
        <select id="crmTaxFilter" class="select" style="font-size:11.5px;padding:6px 8px">
          <option value="">전체 세금계산서</option>
          ${TAX_STATUSES.map((t) => `<option value="${esc(t)}">${esc(t)}</option>`).join('')}
        </select>
        <select id="crmStatusFilter" class="select" style="font-size:11.5px;padding:6px 8px">
          <option value="">전체 상태</option>
          <option value="active">정상 활성</option>
          <option value="revoked">정지됨</option>
          <option value="expired">만료됨</option>
        </select>
      </div>

      <div class="table-wrap" style="max-height:365px;overflow-y:auto">
        <table class="data-table" style="font-size:11.5px">
          <thead>
            <tr>
              <th>고객사 / 고객명 / 업종</th>
              <th>연락처 / 이메일 / 주소</th>
              <th>판매일자 · 경로 · 금액</th>
              <th>💳 입금정보</th>
              <th>🧾 세금계산서</th>
              <th>관리 액션</th>
            </tr>
          </thead>
          <tbody id="crmTableBody"></tbody>
        </table>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;flex-wrap:wrap;margin-top:8px">
        <div style="font-size:11px;color:var(--muted)">💡 <b>✏️ 수정</b>에서 고객·입금·세금정보 편집 · <b>🚦 직권·기간</b>에서 중지/재개/기간제한 제어</div>
        <div style="display:flex;gap:4px;flex-wrap:wrap">
          <a class="btn btn-sm" href="https://www.hometax.go.kr/" target="_blank" rel="noopener">🏛️ 홈택스 ↗</a>
          <a class="btn btn-sm" href="${TAX_QUICK_LINKS[1].url}" target="_blank" rel="noopener">🔍 사업자조회 ↗</a>
          <a class="btn btn-sm" href="https://www.wetax.go.kr/" target="_blank" rel="noopener">🏦 위택스 ↗</a>
          <a class="btn btn-sm" href="https://www.gov.kr/" target="_blank" rel="noopener">📜 정부24 ↗</a>
          <a class="btn btn-sm" href="https://www.cardsales.or.kr/" target="_blank" rel="noopener">💳 카드매출 ↗</a>
        </div>
      </div>
    `;

    $('adminFoot').innerHTML = `
      <button id="btnCrmCsv" class="btn btn-emerald btn-sm" type="button">📥 고객·입금·세금 CSV (26컬럼)</button>
      <button id="btnCrmHometax" class="btn btn-amber btn-sm" type="button">🧾 미발급 홈택스 CSV</button>
      <button id="btnCrmBackup" class="btn btn-sm" type="button">📤 JSON 백업</button>
      <button id="btnCrmRestore" class="btn btn-sm" type="button">📂 JSON 복원</button>
      <input id="crmRestoreFile" type="file" accept=".json" style="display:none" />
      <button id="btnCrmNew" class="btn btn-primary btn-sm" type="button" style="margin-left:auto">➕ 신규 납품 고객 등록</button>
    `;

    const drawRows = () => {
      const q = ($('crmQ')?.value || '').trim().toLowerCase();
      const cf = $('crmChannelFilter')?.value || '';
      const pf = $('crmPayFilter')?.value || '';
      const tf = $('crmTaxFilter')?.value || '';
      const sf = $('crmStatusFilter')?.value || '';
      const filtered = reg.sales.filter((x) => {
        const isExp = Boolean(x.expiryDate && x.expiryDate < todayIso);
        const effSt = x.status === 'revoked' ? 'revoked' : (isExp ? 'expired' : 'active');
        if (sf && effSt !== sf) return false;
        if (cf && (x.channel || '') !== cf) return false;
        if (pf && (x.payStatus || '미수(대기)') !== pf) return false;
        if (tf && (x.taxStatus || '미발급') !== tf) return false;
        const hay = `${x.companyName} ${x.contactName || ''} ${x.phone || ''} ${x.email || ''} ${x.address || ''} ${x.bizType || ''} ${x.bizNo || ''} ${x.channel || ''} ${x.payStatus || ''} ${x.depositor || ''} ${x.taxStatus || ''} ${x.ntsConfirmNo || ''} ${x.brandTitle} ${x.licId} ${x.sellerName} ${x.saleDate || x.issuedAt || ''} ${x.memo || ''}`.toLowerCase();
        if (q && !hay.includes(q)) return false;
        return true;
      });
      const tb = $('crmTableBody');
      if (!tb) return;
      tb.innerHTML = filtered.map((x) => {
        const isExp = Boolean(x.expiryDate && x.expiryDate < todayIso);
        const isRev = x.status === 'revoked';
        const stBadge = isRev
          ? '<span class="nx-lic-badge nx-lic-revoked">🚫 정지</span>'
          : (isExp ? '<span class="nx-lic-badge nx-lic-expired">⏳ 만료</span>' : '<span class="nx-lic-badge nx-lic-active">✓ 정상</span>');
        const payBadge = x.payStatus === '입금완료'
          ? '<span class="nx-lic-badge nx-lic-active">✓ 입금완료</span>'
          : (x.payStatus === '부분입금' ? '<span class="nx-lic-badge nx-lic-expired">◐ 부분입금</span>'
            : (x.payStatus === '환불·취소' ? '<span class="nx-lic-badge nx-lic-revoked">✕ 환불</span>'
              : '<span class="nx-lic-badge nx-lic-expired">⏳ 미수</span>'));
        const taxBadge = x.taxStatus === '발급완료'
          ? '<span class="nx-lic-badge nx-lic-active">🧾 발급완료</span>'
          : (x.taxStatus === '해당없음(크몽/카드)' ? '<span class="tag tag-gray" style="font-size:10px">해당없음</span>'
            : `<span class="nx-lic-badge nx-lic-revoked">⚠️ ${esc(x.taxStatus || '미발급')}</span>`);
        const amt = calcTaxAmounts(x.priceMan, x.vatMode || 'sep');
        const bLocal = loadBuyerState(x.licId);
        const pwTag = bLocal.mustChangePw ? '<span style="color:#d97706;font-size:10px">초기(admin)</span>' : '<span style="color:#059669;font-size:10px">비번변경됨</span>';
        return `
          <tr>
            <td>
              <b>${esc(x.companyName)}</b> ${stBadge}
              <div style="font-size:11px;color:var(--text-2)">👤 ${esc(x.contactName || '미입력')}${x.bizType ? ` · <span style="color:var(--c-corp)">${esc(x.bizType)}</span>` : ''}</div>
              <div style="font-size:10px;color:var(--muted)"><code>${esc(x.licId)}</code> · ${pwTag}</div>
            </td>
            <td style="min-width:165px">
              <div>${x.phone ? `<a href="tel:${esc(x.phone)}" style="color:var(--text);font-weight:700;text-decoration:none">📞 ${esc(x.phone)}</a>` : '<span style="color:var(--muted)">연락처 미입력</span>'}</div>
              <div style="font-size:10.5px">${x.email ? `<a href="mailto:${esc(x.email)}" style="color:var(--c-corp);text-decoration:none">✉️ ${esc(x.email)}</a>` : '<span style="color:var(--muted)">이메일 미입력</span>'}</div>
              <div style="font-size:10px;color:var(--muted);max-width:190px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${esc(x.address || '')}">📍 ${esc(x.address || '주소 미입력')}</div>
            </td>
            <td>
              <b>${esc(x.saleDate || x.issuedAt || '-')}</b> <span class="tag tag-gray" style="padding:1px 5px;font-size:10px">${esc(x.channel || '본사직판')}</span>
              <div style="font-size:11px;font-weight:800;color:var(--c-corp)">${esc((x.pkg || '').toUpperCase())} · 합계 ${fmtDec(amt.total / 10000, 1)}만</div>
              <div style="font-size:10px;color:var(--muted)">공급 ${fmt(amt.supply)} + 세액 ${fmt(amt.vat)}</div>
            </td>
            <td>
              ${payBadge}
              <div style="font-size:10.5px;margin-top:2px">${esc(x.payDate || '미입금')} · ${esc(x.payMethod || '계좌이체')}</div>
              <div style="font-size:10px;color:var(--muted);max-width:130px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${esc(x.depositor || '')}">${esc(x.depositor || (x.paidMan ? `실입금 ${x.paidMan}만` : '-'))}</div>
            </td>
            <td>
              ${taxBadge}
              <div style="font-size:10px;margin-top:2px;color:var(--muted)">사업자: <code>${esc(x.bizNo || '미입력')}</code></div>
              <div style="font-size:10px;color:var(--muted);max-width:135px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${esc(x.ntsConfirmNo || '')}">${x.ntsConfirmNo ? `승인 ${esc(x.ntsConfirmNo)}` : (x.taxDate ? `발급 ${esc(x.taxDate)}` : esc(x.memo || '-'))}</div>
            </td>
            <td>
              <div style="display:flex;gap:3px;flex-wrap:wrap">
                <button type="button" class="btn btn-primary btn-sm" data-crm-edit="${esc(x.licId)}" title="고객·입금·세금계산서 수정">✏️ 수정</button>
                <button type="button" class="btn ${isRev ? 'btn-emerald' : 'btn-rose'} btn-sm" data-crm-auth="${esc(x.licId)}" title="직권 중지 · 직권 재개 · 사용기간 제한">${isRev ? '▶️ 재개·기간' : '🚦 직권·기간'}</button>
                <button type="button" class="btn btn-sm" data-crm-copy="${esc(x.licId)}" title="판매링크 복사">🔗</button>
                <button type="button" class="btn btn-amber btn-sm" data-crm-reset="${esc(x.licId)}" title="구매자 비밀번호 admin 초기화">🔑 비번</button>
                <button type="button" class="btn btn-sm" data-crm-prev="${esc(x.licId)}" title="구매자 미리보기">👁️</button>
                <button type="button" class="btn btn-sm" data-crm-kit="${esc(x.licId)}" title="납품 키트">📦</button>
                <button type="button" class="btn btn-sm" data-crm-del="${esc(x.licId)}" title="삭제">🗑️</button>
              </div>
            </td>
          </tr>`;
      }).join('') || '<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--muted)">조건에 맞는 납품 고객 이력이 없습니다.</td></tr>';

      tb.querySelectorAll('[data-crm-edit]').forEach((b) => b.addEventListener('click', () => openCustomerEditModal(b.dataset.crmEdit)));
      tb.querySelectorAll('[data-crm-auth]').forEach((b) => b.addEventListener('click', () => openAuthorityControlModal(b.dataset.crmAuth, false)));
      tb.querySelectorAll('[data-crm-copy]').forEach((b) => b.addEventListener('click', () => {
        const s = reg.sales.find((x) => x.licId === b.dataset.crmCopy);
        if (s) { navigator.clipboard?.writeText(s.signedUrl); toast(`🔗 ${s.companyName} 판매링크가 복사되었습니다.`); }
      }));
      tb.querySelectorAll('[data-crm-prev]').forEach((b) => b.addEventListener('click', () => {
        const s = reg.sales.find((x) => x.licId === b.dataset.crmPrev);
        if (s) window.open(s.signedUrl, '_blank', 'noopener');
      }));
      tb.querySelectorAll('[data-crm-kit]').forEach((b) => b.addEventListener('click', () => {
        const s = reg.sales.find((x) => x.licId === b.dataset.crmKit);
        if (s) openDeliveryKitModal(s);
      }));
      tb.querySelectorAll('[data-crm-reset]').forEach((b) => b.addEventListener('click', () => {
        const s = reg.sales.find((x) => x.licId === b.dataset.crmReset);
        if (!s) return;
        const bSt = loadBuyerState(s.licId);
        bSt.pwHash = BUYER_DEFAULT_PW_HASH;
        bSt.mustChangePw = true;
        bSt.pwChangedAt = '';
        saveBuyerState(s.licId, bSt);
        const rstTok = buildRemoteResetToken(s.licId, eo.resetHours || 72);
        const rstUrl = `${s.signedUrl}${s.signedUrl.includes('?') ? '&' : '?'}rst=${rstTok}`;
        s.resetCount = (s.resetCount || 0) + 1;
        s.lastResetAt = new Date().toLocaleString('ko-KR');
        saveSellerRegistry(reg);
        appendAudit('ADMIN_PW_RESET', s.licId, `${s.companyName} 구매자 비번 admin 초기화 및 1회용 원격 리셋링크 발급`);
        navigator.clipboard?.writeText(rstUrl);
        drawRows();
        toast(`🔑 ${s.companyName} 비번이 admin으로 초기화되었고, 원격 초기화 링크가 복사되었습니다!`);
      }));
      tb.querySelectorAll('[data-crm-rev]').forEach((b) => b.addEventListener('click', () => {
        const s = reg.sales.find((x) => x.licId === b.dataset.crmRev);
        if (!s) return;
        const nextRev = s.status !== 'revoked';
        s.status = nextRev ? 'revoked' : 'active';
        reg.revoked = reg.sales.filter((x) => x.status === 'revoked').map((x) => x.licId);
        saveSellerRegistry(reg);
        appendAudit(nextRev ? 'LICENSE_REVOKED' : 'LICENSE_RESTORED', s.licId, `${s.companyName} 상태 → ${s.status}`);
        openAdminSalesModal('status');
        toast(nextRev ? `🚫 ${s.companyName} 라이선스가 정지되었습니다.` : `▶️ ${s.companyName} 라이선스가 정상 복구되었습니다.`);
      }));
      tb.querySelectorAll('[data-crm-del]').forEach((b) => b.addEventListener('click', () => {
        const id = b.dataset.crmDel;
        reg.sales = reg.sales.filter((x) => x.licId !== id);
        reg.revoked = reg.revoked.filter((x) => x !== id);
        saveSellerRegistry(reg);
        appendAudit('LICENSE_DELETED', id, '판매 현황 레코드 삭제');
        openAdminSalesModal('status');
        toast('🗑️ 판매 이력이 삭제되었습니다.');
      }));
    };

    drawRows();
    $('crmQ')?.addEventListener('input', drawRows);
    $('crmChannelFilter')?.addEventListener('change', drawRows);
    $('crmPayFilter')?.addEventListener('change', drawRows);
    $('crmTaxFilter')?.addEventListener('change', drawRows);
    $('crmStatusFilter')?.addEventListener('change', drawRows);
    $('btnCrmNew')?.addEventListener('click', () => openAdminSalesModal('issue'));
    $('btnCrmHometax')?.addEventListener('click', () => {
      const targets = reg.sales.filter((x) => x.taxStatus === '미발급' || x.taxStatus === '발급요청');
      if (!targets.length) { toast('ℹ️ 미발급·발급요청 상태의 세금계산서 대상이 없습니다.'); return; }
      downloadHometaxBatchCsv(targets, reg.taxConfig);
      toast(`🧾 미발급 ${targets.length}건 홈택스 일괄발급 CSV 다운로드 완료!`);
    });
    $('btnCrmCsv')?.addEventListener('click', () => {
      const hd = '라이선스ID,고객사(시설명),고객명(담당자),연락처,이메일,주소,시설업종,사업자등록번호,브랜드,패키지,공급가액(원),부가세(원),합계금액(원),입금상태,입금일자,입금수단,실입금액(만원),입금자계좌,세금계산서발급여부,발급일자,국세청승인번호,판매일자,판매경로,담당판매자,비고,판매링크\n';
      const rows = reg.sales.map((x) => {
        const a = calcTaxAmounts(x.priceMan, x.vatMode || 'sep');
        return [
          x.licId, x.companyName, x.contactName || '', x.phone || '', x.email || '', x.address || '', x.bizType || '', x.bizNo || '',
          x.brandTitle, x.pkg, a.supply, a.vat, a.total,
          x.payStatus || '미수(대기)', x.payDate || '', x.payMethod || '', x.paidMan || 0, x.depositor || '',
          x.taxStatus || '미발급', x.taxDate || '', x.ntsConfirmNo || '',
          x.saleDate || x.issuedAt || '', x.channel || '본사직판', x.sellerName, x.memo || '', x.signedUrl,
        ].map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',');
      }).join('\n');
      const blob = new Blob(['\uFEFF' + hd + rows], { type: 'text/csv;charset=utf-8' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `nexusone_delivered_accounting_${new Date().toISOString().slice(0, 10)}.csv`; a.click();
      toast('📥 고객·입금·세금계산서 CSV (26개 전체컬럼) 다운로드 완료');
    });
    $('btnCrmBackup')?.addEventListener('click', () => {
      const safeReg = JSON.parse(JSON.stringify(reg));
      if (safeReg.remoteSync) safeReg.remoteSync.token = '';
      if (safeReg.taxConfig) safeReg.taxConfig.apiToken = '';
      const blob = new Blob([JSON.stringify(safeReg, null, 2)], { type: 'application/json' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `nexusone_crm_backup_${new Date().toISOString().slice(0, 10)}.json`; a.click();
      toast('📤 납품 고객·입금·세금·무료배포 CRM JSON 백업 완료 (보안상 API/GitHub 토큰 제외)');
    });
    $('btnCrmRestore')?.addEventListener('click', () => $('crmRestoreFile')?.click());
    $('crmRestoreFile')?.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(String(reader.result || '{}'));
          if (!Array.isArray(parsed.sales)) throw new Error('유효한 CRM 백업 JSON 형식이 아닙니다.');
          const curReg = loadSellerRegistry();
          parsed.remoteSync = {
            ...defaultRemoteSyncConfig(),
            ...(parsed.remoteSync || {}),
            token: (parsed.remoteSync && parsed.remoteSync.token) ? parsed.remoteSync.token : (curReg.remoteSync?.token || ''),
          };
          parsed.taxConfig = {
            ...defaultTaxConfig(),
            ...(parsed.taxConfig || {}),
            apiToken: (parsed.taxConfig && parsed.taxConfig.apiToken) ? parsed.taxConfig.apiToken : (curReg.taxConfig?.apiToken || ''),
          };
          saveSellerRegistry(parsed);
          appendAudit('CRM_RESTORED', 'MASTER', `JSON 백업 복원 (유료 ${parsed.sales.length}건 · 무료 ${(parsed.freeDist || []).length}건)`);
          openAdminSalesModal('status');
          toast(`📂 CRM 백업 복원 완료! (유료 ${parsed.sales.length}건 · 무료 ${(parsed.freeDist || []).length}건 · 로컬 토큰 유지)`);
        } catch (err) {
          toast(`⚠️ 복원 실패: ${err.message}`);
        }
      };
      reader.readAsText(file);
    });
  }

  // ---------- TAB 6 (NEW): TAX INVOICE & NTS API INTEGRATION CENTER ----------
  else if (activeTab === 'tax') {
    const tc = { ...defaultTaxConfig(), ...(reg.taxConfig || {}) };
    const pendingList = reg.sales.filter((x) => x.taxStatus === '미발급' || x.taxStatus === '발급요청');
    const workerSnippet = `// Cloudflare Worker 프록시 예시 (팝빌 Popbill / 바로빌 Barobill 중계 -> 국세청 자동전송)
export default {
  async fetch(req, env) {
    if (req.method === 'OPTIONS') return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' } });
    if (req.headers.get('Authorization') !== 'Bearer ' + env.NX1_API_TOKEN) return new Response('Unauthorized', { status: 401 });
    const p = await req.json();
    // 1) 중계사(Popbill/Barobill/Bolta) 공식 REST API로 전자서명·발행 요청 (공동인증서는 ASP에 1회 등록)
    // 2) 국세청 승인번호(ntsConfirmNum)를 수신하여 아래 JSON으로 반환:
    const res = await fetch(env.ASP_ISSUE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + env.ASP_SECRET_KEY },
      body: JSON.stringify(p),
    });
    const data = await res.json();
    return new Response(JSON.stringify({ ok: res.ok, ntsConfirmNo: data.ntsConfirmNum || data.issuanceKey || '', raw: data }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
};`;

    $('adminBody').innerHTML = `${tabBarHtml}
      <div class="domain-box" style="margin-bottom:10px;border-color:rgba(37,99,235,.35);background:rgba(37,99,235,.04)">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;margin-bottom:7px;flex-wrap:wrap">
          <h4 style="margin:0">🏛️ 세무 · 국세청 · 정산 실무 바로가기 (원클릭 10종)</h4>
          <span style="font-size:11px;color:var(--muted)">새 탭에서 공식 포털 즉시 열기</span>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(168px,1fr));gap:6px">
          ${TAX_QUICK_LINKS.map((lk) => `
            <a href="${lk.url}" target="_blank" rel="noopener" style="display:block;padding:7px 9px;border:1px solid var(--border);border-radius:9px;background:var(--surface);text-decoration:none;color:var(--text);transition:border-color .15s">
              <div style="font-size:12px;font-weight:800;color:${lk.color}">${lk.icon} ${esc(lk.name)} ↗</div>
              <div style="font-size:10.5px;color:var(--muted);margin-top:2px;line-height:1.3">${esc(lk.sub)}</div>
            </a>`).join('')}
        </div>
      </div>

      <div class="domain-box" style="margin-bottom:10px;border-color:rgba(79,70,229,.35);background:rgba(79,70,229,.04)">
        <h4 style="margin:0 0 8px">1. 공급자(판매자) 사업자정보 & 국세청 중계 API 설정</h4>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:6px;margin-bottom:6px">
          <label style="font-size:11px;color:var(--muted)">공급자 사업자번호
            <input id="txSupBiz" class="input mono" value="${esc(tc.supplierBizNo)}" placeholder="000-00-00000" style="width:100%;margin-top:2px;font-size:12px" />
          </label>
          <label style="font-size:11px;color:var(--muted)">공급자 상호
            <input id="txSupName" class="input" value="${esc(tc.supplierName)}" placeholder="예: 넥서스원" style="width:100%;margin-top:2px;font-size:12px" />
          </label>
          <label style="font-size:11px;color:var(--muted)">대표자 성명
            <input id="txSupCeo" class="input" value="${esc(tc.supplierCeo)}" placeholder="예: 박희본" style="width:100%;margin-top:2px;font-size:12px" />
          </label>
          <label style="font-size:11px;color:var(--muted)">공급자 이메일
            <input id="txSupEmail" class="input" value="${esc(tc.supplierEmail)}" placeholder="tax@nexusone.kr" style="width:100%;margin-top:2px;font-size:12px" />
          </label>
        </div>
        <div style="display:grid;grid-template-columns:1.5fr 1fr 1fr;gap:6px;margin-bottom:6px">
          <label style="font-size:11px;color:var(--muted)">공급자 사업장 주소
            <input id="txSupAddr" class="input" value="${esc(tc.supplierAddr)}" placeholder="사업자등록증 소재지" style="width:100%;margin-top:2px;font-size:12px" />
          </label>
          <label style="font-size:11px;color:var(--muted)">업태
            <input id="txSupType" class="input" value="${esc(tc.supplierBizType)}" style="width:100%;margin-top:2px;font-size:12px" />
          </label>
          <label style="font-size:11px;color:var(--muted)">종목
            <input id="txSupClass" class="input" value="${esc(tc.supplierBizClass)}" style="width:100%;margin-top:2px;font-size:12px" />
          </label>
        </div>
        <div style="display:grid;grid-template-columns:180px 1.4fr 1fr auto;gap:6px;align-items:end">
          <label style="font-size:11px;color:var(--muted)">발급 연동 방식
            <select id="txProvider" class="select" style="width:100%;margin-top:2px;font-size:12px">
              <option value="popbill" ${tc.provider === 'popbill' ? 'selected' : ''}>팝빌 (Popbill · 추천)</option>
              <option value="barobill" ${tc.provider === 'barobill' ? 'selected' : ''}>바로빌 (Barobill)</option>
              <option value="bolta" ${tc.provider === 'bolta' ? 'selected' : ''}>볼타 (Bolta REST)</option>
              <option value="smartbill" ${tc.provider === 'smartbill' ? 'selected' : ''}>스마트빌 (SmartBill)</option>
              <option value="hometax_csv" ${tc.provider === 'hometax_csv' ? 'selected' : ''}>홈택스 엑셀 일괄발급(무료)</option>
            </select>
          </label>
          <label style="font-size:11px;color:var(--muted)">API 프록시 Endpoint (Cloudflare Worker / 사내서버)
            <input id="txEndpoint" class="input mono" value="${esc(tc.proxyEndpoint)}" placeholder="https://tax-proxy.your-domain.workers.dev/issue" style="width:100%;margin-top:2px;font-size:11.5px" />
          </label>
          <label style="font-size:11px;color:var(--muted)">프록시 인증 토큰 (로컬 전용)
            <input id="txToken" class="input mono" type="password" value="${esc(tc.apiToken)}" placeholder="Bearer Token" style="width:100%;margin-top:2px;font-size:11.5px" />
          </label>
          <button id="btnSaveTaxCfg" class="btn btn-primary btn-sm" type="button" style="height:34px">저장</button>
        </div>
      </div>

      <div class="domain-box" style="margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:8px;flex-wrap:wrap">
          <h4 style="margin:0">2. 세금계산서 발급 대기열 (미발급·발급요청 ${pendingList.length}건)</h4>
          <button id="btnTaxBatchCsv" class="btn btn-emerald btn-sm" type="button">📥 미발급 전체 홈택스 일괄발급 CSV</button>
        </div>
        <div class="table-wrap" style="max-height:175px;overflow-y:auto">
          <table class="data-table" style="font-size:11.5px">
            <thead><tr><th>고객사 / 사업자번호</th><th>공급가 / 부가세 / 합계</th><th>입금상태 / 수신이메일</th><th>발급 액션</th></tr></thead>
            <tbody>
              ${pendingList.map((x) => {
                const a = calcTaxAmounts(x.priceMan, x.vatMode || 'sep');
                return `
                  <tr>
                    <td><b>${esc(x.companyName)}</b><div style="font-size:10.5px;color:var(--muted)"><code>${esc(x.bizNo || '사업자번호 미입력')}</code> · ${esc(x.licId)}</div></td>
                    <td><b>${fmt(a.total)}원</b><div style="font-size:10px;color:var(--muted)">공급 ${fmt(a.supply)} + 세액 ${fmt(a.vat)}</div></td>
                    <td>${esc(x.payStatus || '미수')}<div style="font-size:10.5px;color:var(--c-corp)">${esc(x.taxEmail || x.email || '이메일 미입력')}</div></td>
                    <td>
                      <div style="display:flex;gap:4px;flex-wrap:wrap">
                        <button type="button" class="btn btn-primary btn-sm" data-tx-api="${esc(x.licId)}">🚀 API 발행</button>
                        <button type="button" class="btn btn-sm" data-tx-json="${esc(x.licId)}">📋 JSON</button>
                        <button type="button" class="btn btn-emerald btn-sm" data-tx-done="${esc(x.licId)}">✅ 수기발급 완료</button>
                      </div>
                    </td>
                  </tr>`;
              }).join('') || '<tr><td colspan="4" style="text-align:center;padding:16px;color:#059669;font-weight:700">✓ 현재 미발급 세금계산서가 없습니다. 모든 발행이 완료되었습니다!</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>

      <div class="domain-box">
        <h4 style="margin:0 0 8px">3. 📚 국세청 전자세금계산서 API 연동 실전 가이드 (중계사업자 표준 구조)</h4>
        <div style="font-size:11.5px;line-height:1.55;color:var(--text-2);margin-bottom:8px">
          <b>⚠️ 핵심 원칙</b>: 국세청 홈택스 자체는 일반 사업자에게 <b>직접 발행 Open API를 제공하지 않습니다.</b> 실무에서는 국세청 지정 전자세금계산서 중계사업자(ASP)의 공식 API를 호출하면 중계사가 공동인증서 전자서명 후 <b>국세청으로 즉시 자동 전송</b>하는 표준 구조를 사용합니다.<br>
          <b>💡 즉시 0원 대안</b>: 월 발행건수가 적을 때는 위 <b>[📥 홈택스 일괄발급 CSV]</b>를 내려받아 홈택스 <code>조회/발급 → 전자세금계산서 → 일괄발급</code>에 업로드하면 <b>수수료 0원</b>으로 발행 가능합니다.
        </div>
        <div class="table-wrap" style="margin-bottom:8px">
          <table class="data-table" style="font-size:11px">
            <thead><tr><th>중계 API 사업자</th><th>예상 건당 단가</th><th>인증서 · 특징</th><th>추천 대상</th></tr></thead>
            <tbody>
              <tr><td><b>팝빌 (Popbill)</b></td><td>약 100~200원/건</td><td>국내 점유율 1위 · 공동인증서 1회 등록 · Node/Python SDK 완비</td><td><b>가장 표준 · 안정성 최우선</b></td></tr>
              <tr><td><b>볼타 (Bolta)</b></td><td>월정액/건당 선택</td><td>모던 REST JSON API · 공동인증서 클라우드 자동관리 · 개발 최단</td><td><b>빠른 SaaS/Worker 연동 추천</b></td></tr>
              <tr><td><b>바로빌 (Barobill)</b></td><td>약 100~180원/건</td><td>세금계산서+현금영수증+계좌조회 통합 · 테스트 샌드박스 무료</td><td>계좌 입금 자동매칭까지 확장 시</td></tr>
              <tr><td><b>홈택스 일괄발급</b></td><td><b>0원 (무료)</b></td><td>본 앱 CSV 출력 → 홈택스 엑셀 일괄업로드 (API 개발 불필요)</td><td>월 30건 미만 초기 판매 단계</td></tr>
            </tbody>
          </table>
        </div>
        <div style="font-size:11.5px;line-height:1.55;margin-bottom:6px">
          <b>🛠️ 5단계 API 연동 절차</b>: ① 중계사(팝빌/볼타/바로빌) 사업자 가입 및 테스트키 발급 → ② 전자세금계산서용 공동인증서 1회 등록 → ③ 아래 Cloudflare Worker 프록시(무료 플랜 일 10만회) 배포 및 Secret 환경변수(<code>ASP_SECRET_KEY</code>, <code>NX1_API_TOKEN</code>) 등록 → ④ 위 <code>API 프록시 Endpoint</code>에 Worker URL 입력 후 저장 → ⑤ 대기열에서 <b>[🚀 API 발행]</b> 클릭 시 국세청 자동전송 + 승인번호 자동 기록!
        </div>
        <pre id="txWorkerCode" style="margin:0;padding:8px 10px;border-radius:8px;background:var(--surface-2);border:1px solid var(--border);font-size:10.5px;overflow-x:auto;max-height:135px">${esc(workerSnippet)}</pre>
      </div>
    `;

    $('adminFoot').innerHTML = `
      <button id="btnCopyWorkerCode" class="btn btn-emerald btn-sm" type="button">📋 Cloudflare Worker 프록시 코드 복사</button>
      <a class="btn btn-sm" href="https://www.hometax.go.kr" target="_blank" rel="noopener">🏛️ 국세청 홈택스 열기 ↗</a>
      <button id="btnTaxBack" class="btn btn-primary btn-sm" type="button" style="margin-left:auto">← 납품고객·입금 목록으로</button>
    `;

    $('btnTaxBack')?.addEventListener('click', () => openAdminSalesModal('status'));
    $('btnCopyWorkerCode')?.addEventListener('click', () => {
      navigator.clipboard?.writeText(workerSnippet);
      toast('📋 Cloudflare Worker 국세청 API 프록시 코드가 복사되었습니다!');
    });
    $('btnTaxBatchCsv')?.addEventListener('click', () => {
      const targets = pendingList.length ? pendingList : reg.sales;
      downloadHometaxBatchCsv(targets, reg.taxConfig);
      toast(`📥 홈택스 일괄발급 CSV (${targets.length}건) 다운로드 완료!`);
    });
    $('btnSaveTaxCfg')?.addEventListener('click', () => {
      reg.taxConfig = {
        provider: $('txProvider')?.value || 'popbill',
        supplierBizNo: $('txSupBiz')?.value.trim() || '',
        supplierName: $('txSupName')?.value.trim() || '넥서스원',
        supplierCeo: $('txSupCeo')?.value.trim() || '',
        supplierAddr: $('txSupAddr')?.value.trim() || '',
        supplierBizType: $('txSupType')?.value.trim() || '정보통신업',
        supplierBizClass: $('txSupClass')?.value.trim() || '소프트웨어 개발 및 공급업',
        supplierEmail: $('txSupEmail')?.value.trim() || '',
        proxyEndpoint: $('txEndpoint')?.value.trim() || '',
        apiToken: $('txToken')?.value.trim() || '',
      };
      saveSellerRegistry(reg);
      appendAudit('TAX_CFG_SAVED', 'MASTER', `공급자:${reg.taxConfig.supplierName} · 연동:${reg.taxConfig.provider}`);
      toast('✅ 공급자 정보 및 국세청 API 연동 설정이 저장되었습니다!');
    });

    $('adminBody').querySelectorAll('[data-tx-json]').forEach((b) => b.addEventListener('click', () => {
      const s = reg.sales.find((x) => x.licId === b.dataset.txJson);
      if (!s) return;
      const payload = buildTaxApiPayload(s, reg.taxConfig);
      navigator.clipboard?.writeText(JSON.stringify(payload, null, 2));
      toast(`📋 ${s.companyName} 전자세금계산서 API 요청 JSON이 복사되었습니다!`);
    }));

    $('adminBody').querySelectorAll('[data-tx-done]').forEach((b) => b.addEventListener('click', () => {
      const s = reg.sales.find((x) => x.licId === b.dataset.txDone);
      if (!s) return;
      const todayIso = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
      s.taxStatus = '발급완료';
      s.taxDate = s.taxDate || todayIso;
      if (!s.ntsConfirmNo) s.ntsConfirmNo = `${todayIso.replace(/-/g, '')}-HOMETAX-MANUAL`;
      saveSellerRegistry(reg);
      appendAudit('TAX_INVOICE_MANUAL_DONE', s.licId, `${s.companyName} 홈택스 수기발급 완료 처리`);
      openAdminSalesModal('tax');
      toast(`✅ ${s.companyName} 세금계산서 발급완료 처리되었습니다!`);
    }));

    $('adminBody').querySelectorAll('[data-tx-api]').forEach((b) => b.addEventListener('click', async () => {
      const s = reg.sales.find((x) => x.licId === b.dataset.txApi);
      if (!s) return;
      const curTc = reg.taxConfig || defaultTaxConfig();
      const payload = buildTaxApiPayload(s, curTc);
      if (!curTc.proxyEndpoint) {
        navigator.clipboard?.writeText(JSON.stringify(payload, null, 2));
        toast('ℹ️ API 프록시 Endpoint 미설정 상태입니다. 표준 API 요청 JSON을 복사했으니 위 가이드대로 프록시를 연결하거나 [홈택스 CSV]로 즉시 발행하세요.');
        return;
      }
      b.disabled = true; b.textContent = '전송 중…';
      try {
        const res = await fetch(curTc.proxyEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(curTc.apiToken ? { Authorization: `Bearer ${curTc.apiToken}` } : {}),
          },
          body: JSON.stringify(payload),
        });
        const j = await res.json().catch(() => ({}));
        if (!res.ok || j.ok === false) throw new Error(j.message || `HTTP ${res.status}`);
        const todayIso = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
        s.taxStatus = '발급완료';
        s.taxDate = todayIso;
        s.ntsConfirmNo = j.ntsConfirmNo || j.ntsConfirmNum || `${todayIso.replace(/-/g, '')}-API-OK`;
        saveSellerRegistry(reg);
        appendAudit('TAX_INVOICE_API_ISSUED', s.licId, `${s.companyName} 국세청 API 발행 완료 (승인번호: ${s.ntsConfirmNo})`);
        openAdminSalesModal('tax');
        toast(`🧾 ${s.companyName} 국세청 전자세금계산서 API 발행 완료!`);
      } catch (err) {
        b.disabled = false; b.textContent = '🚀 API 발행';
        toast(`⚠️ API 발행 실패: ${err.message}`);
      }
    }));
  }

  // ---------- TAB: FREE DISTRIBUTION (STAFF · FRIENDS · TRIALS) & HISTORY MANAGEMENT ----------
  else if (activeTab === 'free') {
    const todayIso = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
    const list = reg.freeDist || [];
    const totalFree = list.length;
    const activeFree = list.filter((x) => x.status === 'active' && (!x.expiryDate || x.expiryDate >= todayIso)).length;
    const expSoonOrDone = list.filter((x) => {
      if (x.status !== 'active' || !x.expiryDate) return false;
      const d = Math.ceil((new Date(`${x.expiryDate}T23:59:59+09:00`).getTime() - Date.now()) / 86400000);
      return d <= 7;
    }).length;
    const revOrConv = list.filter((x) => x.status === 'revoked' || x.status === 'converted').length;

    const fd = S.freeDraft || {
      freeType: 'staff',
      recipientName: '',
      affiliation: '',
      phone: '',
      email: '',
      pkg: 'premium',
      expiryDate: '',
      simpleFreeMode: true,
      showAppLinks: false,
      memo: '',
      tabs: { ...SALES_PACKAGES.premium.tabs },
    };
    S.freeDraft = fd;
    const tabLabelsShort = [['overview', '통합360°'], ['corp', '기업분석'], ['bid', '입찰'], ['sbiz', '상권지도'], ['realestate', '청약'], ['hub', '허브']];

    $('adminBody').innerHTML = `${tabBarHtml}
      <div class="nx-adm-kpi4">
        <div class="nx-adm-kpi"><div class="l">🎁 총 무료 배포</div><div class="v">${fmt(totalFree)}건</div><div class="s">직원 · 지인 · 체험 합계</div></div>
        <div class="nx-adm-kpi"><div class="l">✅ 활성 이용 중</div><div class="v" style="color:#059669">${fmt(activeFree)}건</div><div class="s">유료 매출과 완전 분리</div></div>
        <div class="nx-adm-kpi"><div class="l">⏳ 만료임박 · 만료</div><div class="v" style="color:#d97706">${fmt(expSoonOrDone)}건</div><div class="s">D-7 이내 또는 기간종료</div></div>
        <div class="nx-adm-kpi"><div class="l">🚫 회수 · 💎 유료전환</div><div class="v" style="color:var(--c-corp)">${fmt(revOrConv)}건</div><div class="s">퇴사 회수 / 구매 전환</div></div>
      </div>

      <div class="domain-box" style="margin-bottom:10px;border-color:rgba(16,185,129,.4);background:rgba(16,185,129,.04)">
        <h4 style="margin:0 0 8px">⚡ 10초 무료 배포 링크 발급 (직원 · 지인 · 체험판 · 파트너)</h4>
        <div style="display:grid;grid-template-columns:150px 1fr 1fr 1fr 1fr;gap:6px;margin-bottom:6px">
          <label style="font-size:11px;color:var(--muted)">배포 대상 구분
            <select id="fdType" class="select" style="width:100%;margin-top:2px;padding:5px 7px;font-size:12px">
              ${FREE_RECIPIENT_TYPES.map((t) => `<option value="${t.key}" ${fd.freeType === t.key ? 'selected' : ''}>${t.label}</option>`).join('')}
            </select>
          </label>
          <label style="font-size:11px;color:var(--muted)">수령인 성명 *
            <input id="fdName" class="input" value="${esc(fd.recipientName)}" placeholder="예: 홍길동 대리 / 김지인" style="width:100%;margin-top:2px;padding:5px 7px;font-size:12px" />
          </label>
          <label style="font-size:11px;color:var(--muted)">소속 / 관계
            <input id="fdAffil" class="input" value="${esc(fd.affiliation)}" placeholder="예: 영업1팀 / 대학동기" style="width:100%;margin-top:2px;padding:5px 7px;font-size:12px" />
          </label>
          <label style="font-size:11px;color:var(--muted)">연락처
            <input id="fdPhone" class="input" value="${esc(fd.phone)}" placeholder="010-0000-0000" style="width:100%;margin-top:2px;padding:5px 7px;font-size:12px" />
          </label>
          <label style="font-size:11px;color:var(--muted)">이메일 (선택)
            <input id="fdEmail" class="input" type="email" value="${esc(fd.email)}" placeholder="user@email.com" style="width:100%;margin-top:2px;padding:5px 7px;font-size:12px" />
          </label>
        </div>

        <div style="display:grid;grid-template-columns:160px 1.2fr 1fr;gap:6px;margin-bottom:6px;align-items:end">
          <label style="font-size:11px;color:var(--muted)">허용 기능 프리셋
            <select id="fdPkg" class="select" style="width:100%;margin-top:2px;padding:5px 7px;font-size:12px">
              <option value="premium" ${fd.pkg === 'premium' ? 'selected' : ''}>🟣 4대 도메인 전체 (추천)</option>
              <option value="deluxe" ${fd.pkg === 'deluxe' ? 'selected' : ''}>🔵 입찰 + 기업분석</option>
              <option value="standard" ${fd.pkg === 'standard' ? 'selected' : ''}>🟢 입찰 실무 전용</option>
            </select>
          </label>
          <div>
            <div style="font-size:11px;color:var(--muted);margin-bottom:3px">사용기간 빠른 설정 (만료일 자동계산)</div>
            <div style="display:flex;gap:4px;flex-wrap:wrap;align-items:center">
              <button type="button" class="btn btn-sm" data-fd-days="7">7일</button>
              <button type="button" class="btn btn-sm" data-fd-days="14">14일</button>
              <button type="button" class="btn btn-sm" data-fd-days="30">30일</button>
              <button type="button" class="btn btn-sm" data-fd-days="90">90일</button>
              <button type="button" class="btn btn-sm" data-fd-days="0">영구</button>
              <input id="fdExpiry" class="input" type="date" value="${esc(fd.expiryDate || '')}" style="padding:4px 6px;font-size:11.5px;width:130px" />
            </div>
          </div>
          <label style="font-size:11px;color:var(--muted)">배포 사유 / 메모
            <input id="fdMemo" class="input" value="${esc(fd.memo)}" placeholder="예: 신규입사 영업지원 / 지인 무료증정" style="width:100%;margin-top:2px;padding:5px 7px;font-size:12px" />
          </label>
        </div>

        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;padding-top:6px;border-top:1px dashed var(--border)">
          <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;font-size:11.5px">
            ${tabLabelsShort.map(([k, lb]) => `<label style="display:inline-flex;align-items:center;gap:3px;cursor:pointer"><input type="checkbox" data-fd-tab="${k}" ${fd.tabs[k] ? 'checked' : ''} />${lb}</label>`).join('')}
            <label style="display:inline-flex;align-items:center;gap:4px;cursor:pointer;color:#047857;font-weight:700"><input id="fdSimpleMode" type="checkbox" ${fd.simpleFreeMode ? 'checked' : ''} />🔓 간편모드(비번배너 숨김)</label>
            <label style="display:inline-flex;align-items:center;gap:4px;cursor:pointer"><input id="fdAppLinks" type="checkbox" ${fd.showAppLinks ? 'checked' : ''} />개별앱 표시</label>
          </div>
          <div style="display:flex;gap:6px">
            <button id="btnFdPreview" class="btn btn-sm" type="button">👁️ 미리보기</button>
            <button id="btnFdIssue" class="btn btn-emerald btn-sm" type="button">🎁 무료 배포 등록 + 링크 복사</button>
          </div>
        </div>
      </div>

      <div style="display:flex;gap:6px;margin-bottom:8px;flex-wrap:wrap">
        <input id="freeQ" class="input" placeholder="수령인 · 소속/관계 · 연락처 · 배포번호 · 메모 검색…" style="flex:1;min-width:190px;padding:6px 10px;font-size:12px" />
        <select id="freeTypeFilter" class="select" style="font-size:11.5px;padding:6px 8px">
          <option value="">전체 대상 구분</option>
          ${FREE_RECIPIENT_TYPES.map((t) => `<option value="${t.key}">${t.label}</option>`).join('')}
        </select>
        <select id="freeStatusFilter" class="select" style="font-size:11.5px;padding:6px 8px">
          <option value="">전체 상태</option>
          <option value="active">활성 이용 중</option>
          <option value="expired">만료됨</option>
          <option value="revoked">회수(정지)</option>
          <option value="converted">유료전환됨</option>
        </select>
      </div>

      <div class="table-wrap" style="max-height:280px;overflow-y:auto">
        <table class="data-table" style="font-size:11.5px">
          <thead>
            <tr>
              <th>배포번호 · 구분</th>
              <th>수령인 / 소속·관계 / 연락처</th>
              <th>허용 범위 · 배포일 / 만료</th>
              <th>상태 · 메모</th>
              <th>관리 액션 (링크 · 카톡 · 연장 · 회수 · 유료전환)</th>
            </tr>
          </thead>
          <tbody id="freeTableBody"></tbody>
        </table>
      </div>
    `;

    $('adminFoot').innerHTML = `
      <button id="btnFreeCsv" class="btn btn-emerald btn-sm" type="button">📥 무료 배포이력 CSV 다운로드</button>
      <button id="btnFreeToPaid" class="btn btn-sm" type="button" style="margin-left:auto">📊 유료 납품현황으로 이동</button>
    `;

    const buildFreeCfg = (obj) => ({
      licId: obj.licId,
      companyName: `${obj.recipientName}${obj.affiliation ? ` (${obj.affiliation})` : ''}`,
      sellerName: '본사 무료배포 (마스터)',
      sellerCode: 'SLR-001',
      pkg: obj.pkg || 'premium',
      priceMan: 0,
      brandTitle: '넥서스원',
      brandBadge: obj.freeType === 'trial' ? 'TRIAL' : (obj.freeType === 'staff' ? 'STAFF' : 'VIP'),
      brandSub: `${obj.recipientName}${obj.affiliation ? ` · ${obj.affiliation}` : ''} 전용 무료배포 라이선스`,
      expiryDate: obj.expiryDate || '',
      expiryMode: eo.expiryMode || 'lock',
      isFree: true,
      freeType: obj.freeType,
      simpleFreeMode: Boolean(obj.simpleFreeMode),
      forcePwChange: !obj.simpleFreeMode,
      a4Watermark: true,
      rbacStrict: true,
      tabs: { ...obj.tabs },
      features: { ...(SALES_PACKAGES[obj.pkg]?.features || SALES_PACKAGES.premium.features) },
      appLinks: obj.showAppLinks
        ? { showSection: true, corp: true, bid: true, sbiz: true, re: true }
        : { showSection: false, corp: false, bid: false, sbiz: false, re: false },
    });

    const syncFreeDraft = () => {
      fd.freeType = $('fdType')?.value || 'staff';
      fd.recipientName = $('fdName')?.value.trim() || '';
      fd.affiliation = $('fdAffil')?.value.trim() || '';
      fd.phone = $('fdPhone')?.value.trim() || '';
      fd.email = $('fdEmail')?.value.trim() || '';
      fd.pkg = $('fdPkg')?.value || 'premium';
      fd.expiryDate = $('fdExpiry')?.value || '';
      fd.memo = $('fdMemo')?.value.trim() || '';
      fd.simpleFreeMode = Boolean($('fdSimpleMode')?.checked);
      fd.showAppLinks = Boolean($('fdAppLinks')?.checked);
      $('adminBody').querySelectorAll('[data-fd-tab]').forEach((el) => { fd.tabs[el.dataset.fdTab] = el.checked; });
    };

    $('fdType')?.addEventListener('change', () => {
      syncFreeDraft();
      const meta = FREE_RECIPIENT_TYPES.find((t) => t.key === fd.freeType);
      if (meta && meta.defaultDays > 0 && !fd.expiryDate) {
        fd.expiryDate = addDaysKstIso(meta.defaultDays);
        if ($('fdExpiry')) $('fdExpiry').value = fd.expiryDate;
      }
    });
    $('fdPkg')?.addEventListener('change', () => {
      syncFreeDraft();
      fd.tabs = { ...(SALES_PACKAGES[fd.pkg]?.tabs || SALES_PACKAGES.premium.tabs) };
      $('adminBody').querySelectorAll('[data-fd-tab]').forEach((el) => { el.checked = Boolean(fd.tabs[el.dataset.fdTab]); });
    });
    $('adminBody').querySelectorAll('[data-fd-days]').forEach((b) => {
      b.addEventListener('click', () => {
        const d = Number(b.dataset.fdDays) || 0;
        const iso = d > 0 ? addDaysKstIso(d) : '';
        fd.expiryDate = iso;
        if ($('fdExpiry')) $('fdExpiry').value = iso;
        toast(d > 0 ? `📅 만료일이 ${d}일 뒤(${iso})로 설정되었습니다.` : '♾️ 영구 무료 배포로 설정되었습니다.');
      });
    });

    $('btnFdPreview')?.addEventListener('click', () => {
      syncFreeDraft();
      const typeMeta = FREE_RECIPIENT_TYPES.find((t) => t.key === fd.freeType) || FREE_RECIPIENT_TYPES[0];
      const tempCfg = buildFreeCfg({
        ...fd,
        recipientName: fd.recipientName || '미리보기 사용자',
        licId: `${typeMeta.prefix}-PREVIEW`,
      });
      window.open(`${location.origin}${location.pathname}?lic=${encodeSignedLicense(tempCfg, eo)}`, '_blank', 'noopener');
    });

    $('btnFdIssue')?.addEventListener('click', () => {
      syncFreeDraft();
      if (!fd.recipientName) { toast('수령인 성명을 입력해 주세요.'); $('fdName')?.focus(); return; }
      const typeMeta = FREE_RECIPIENT_TYPES.find((t) => t.key === fd.freeType) || FREE_RECIPIENT_TYPES[0];
      const licId = nextSeqId(reg.freeDist || [], typeMeta.prefix, 'licId');
      const cfg = buildFreeCfg({ ...fd, licId });
      const signedUrl = `${location.origin}${location.pathname}?lic=${encodeSignedLicense(cfg, eo)}`;
      const rec = {
        licId,
        freeType: fd.freeType,
        freeLabel: typeMeta.label,
        recipientName: fd.recipientName,
        affiliation: fd.affiliation,
        phone: fd.phone,
        email: fd.email,
        pkg: fd.pkg,
        tabs: { ...fd.tabs },
        simpleFreeMode: fd.simpleFreeMode,
        showAppLinks: fd.showAppLinks,
        issuedAt: todayIso,
        expiryDate: fd.expiryDate,
        status: 'active', // active | revoked | converted
        memo: fd.memo,
        cfg,
        signedUrl,
      };
      if (!Array.isArray(reg.freeDist)) reg.freeDist = [];
      reg.freeDist.unshift(rec);
      saveSellerRegistry(reg);
      appendAudit('FREE_DIST_ISSUED', licId, `${typeMeta.label} · ${rec.recipientName}(${rec.affiliation || '-'}) · 만료:${rec.expiryDate || '영구'}`);
      navigator.clipboard?.writeText(signedUrl);
      S.freeDraft = null;
      toast(`🎁 ${rec.recipientName} 무료 배포 등록 & 서명 링크 복사 완료!`);
      openAdminSalesModal('free');
    });

    const drawFreeRows = () => {
      const q = ($('freeQ')?.value || '').trim().toLowerCase();
      const tf = $('freeTypeFilter')?.value || '';
      const sf = $('freeStatusFilter')?.value || '';
      const filtered = (reg.freeDist || []).filter((x) => {
        const isExp = Boolean(x.expiryDate && x.expiryDate < todayIso && x.status === 'active');
        const effSt = isExp ? 'expired' : (x.status || 'active');
        if (tf && x.freeType !== tf) return false;
        if (sf && effSt !== sf) return false;
        const hay = `${x.licId} ${x.recipientName} ${x.affiliation || ''} ${x.phone || ''} ${x.email || ''} ${x.freeLabel || ''} ${x.memo || ''}`.toLowerCase();
        if (q && !hay.includes(q)) return false;
        return true;
      });
      const tb = $('freeTableBody');
      if (!tb) return;
      tb.innerHTML = filtered.map((x) => {
        const isExp = Boolean(x.expiryDate && x.expiryDate < todayIso && x.status === 'active');
        const isRev = x.status === 'revoked';
        const isConv = x.status === 'converted';
        const dLeft = x.expiryDate ? Math.ceil((new Date(`${x.expiryDate}T23:59:59+09:00`).getTime() - Date.now()) / 86400000) : null;
        const stBadge = isConv
          ? '<span class="nx-lic-badge nx-lic-active" style="background:rgba(79,70,229,.15);color:#4f46e5">💎 유료전환</span>'
          : (isRev ? '<span class="nx-lic-badge nx-lic-revoked">🚫 회수(정지)</span>'
            : (isExp ? '<span class="nx-lic-badge nx-lic-expired">⏳ 만료됨</span>'
              : '<span class="nx-lic-badge nx-lic-active">✓ 활성</span>'));
        const typeLabel = FREE_RECIPIENT_TYPES.find((t) => t.key === x.freeType)?.label || x.freeLabel || '무료배포';
        return `
          <tr>
            <td><code>${esc(x.licId)}</code><div style="font-size:10.5px;font-weight:700;margin-top:2px">${esc(typeLabel)}</div></td>
            <td>
              <b>${esc(x.recipientName)}</b> <span style="font-size:11px;color:var(--muted)">${esc(x.affiliation || '')}</span>
              <div style="font-size:10.5px">${x.phone ? `<a href="tel:${esc(x.phone)}" style="color:var(--text);text-decoration:none">📞 ${esc(x.phone)}</a>` : ''}${x.email ? ` · <a href="mailto:${esc(x.email)}" style="color:var(--c-corp);text-decoration:none">✉️ ${esc(x.email)}</a>` : ''}</div>
            </td>
            <td>
              <span style="font-weight:700;color:var(--c-corp)">${esc((x.pkg || 'premium').toUpperCase())}</span>${x.simpleFreeMode ? ' · <span style="font-size:10px;color:#059669">간편모드</span>' : ''}
              <div style="font-size:10.5px;color:var(--muted)">배포 ${esc(x.issuedAt || '-')} · ${x.expiryDate ? `만료 ${esc(x.expiryDate)} (${dLeft >= 0 ? `D-${dLeft}` : '종료'})` : '♾️ 영구 무료'}</div>
            </td>
            <td style="max-width:150px">
              ${stBadge}
              <div style="font-size:10.5px;color:var(--muted);margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${esc(x.memo || '')}">${esc(x.memo || '-')}</div>
            </td>
            <td>
              <div style="display:flex;gap:3px;flex-wrap:wrap">
                <button type="button" class="btn btn-sm" data-fr-copy="${esc(x.licId)}" title="무료 배포 링크 복사">🔗</button>
                <button type="button" class="btn btn-emerald btn-sm" data-fr-kakao="${esc(x.licId)}" title="카톡 안내문 복사">📱 카톡</button>
                <button type="button" class="btn btn-sm" data-fr-ext="${esc(x.licId)}" title="만료일 +30일 연장 및 새 링크 복사">📅 +30일</button>
                <button type="button" class="btn ${isRev ? 'btn-emerald' : 'btn-rose'} btn-sm" data-fr-auth="${esc(x.licId)}" title="직권 중지 · 재개 · 사용기간 제한">${isRev ? '▶️ 재개·기간' : '🚦 직권·기간'}</button>
                <button type="button" class="btn btn-primary btn-sm" data-fr-conv="${esc(x.licId)}" title="유료 판매 등록으로 전환">💰 유료전환</button>
                <button type="button" class="btn btn-sm" data-fr-del="${esc(x.licId)}" title="이력 삭제">🗑️</button>
              </div>
            </td>
          </tr>`;
      }).join('') || '<tr><td colspan="5" style="text-align:center;padding:22px;color:var(--muted)">아직 등록된 무료 배포 이력이 없습니다. 위에서 직원·지인·체험판 링크를 10초 만에 발급해 보세요.</td></tr>';

      tb.querySelectorAll('[data-fr-copy]').forEach((b) => b.addEventListener('click', () => {
        const r = (reg.freeDist || []).find((x) => x.licId === b.dataset.frCopy);
        if (r) { navigator.clipboard?.writeText(r.signedUrl); toast(`🔗 ${r.recipientName} 무료 배포 링크가 복사되었습니다.`); }
      }));
      tb.querySelectorAll('[data-fr-kakao]').forEach((b) => b.addEventListener('click', () => {
        const r = (reg.freeDist || []).find((x) => x.licId === b.dataset.frKakao);
        if (!r) return;
        const msg = `[넥서스원 PRO 무료 이용 링크 안내]\n안녕하세요, ${r.recipientName}님! 😊\n넥서스원 PRO(${String(r.pkg || 'premium').toUpperCase()}) 무료 이용 전용 링크를 보내드립니다.\n• 배포번호: ${r.licId}\n• 이용기간: ${r.expiryDate ? `${r.expiryDate}까지` : '영구 무료'}\n• 전용 접속 링크:\n${r.signedUrl}\n\n(브라우저에서 바로 실행되며, 홈 화면에 추가하면 앱처럼 사용하실 수 있습니다.)`;
        navigator.clipboard?.writeText(msg);
        toast(`📱 ${r.recipientName}님용 카카오톡 안내문이 복사되었습니다!`);
      }));
      tb.querySelectorAll('[data-fr-ext]').forEach((b) => b.addEventListener('click', () => {
        const r = (reg.freeDist || []).find((x) => x.licId === b.dataset.frExt);
        if (!r) return;
        const baseMs = (r.expiryDate && r.expiryDate >= todayIso) ? new Date(`${r.expiryDate}T12:00:00+09:00`).getTime() : Date.now();
        const nextIso = new Date(baseMs + 30 * 86400 * 1000).toISOString().slice(0, 10);
        r.expiryDate = nextIso;
        r.status = 'active';
        if (r.cfg) r.cfg.expiryDate = nextIso;
        else r.cfg = buildFreeCfg(r);
        r.signedUrl = `${location.origin}${location.pathname}?lic=${encodeSignedLicense(r.cfg, eo)}`;
        saveSellerRegistry(reg);
        appendAudit('FREE_DIST_EXTENDED', r.licId, `${r.recipientName} 만료일 → ${nextIso} (+30일 연장)`);
        navigator.clipboard?.writeText(r.signedUrl);
        openAdminSalesModal('free');
        toast(`📅 ${r.recipientName} 만료일 +30일(${nextIso}) 연장 & 갱신 링크 복사 완료!`);
      }));
      tb.querySelectorAll('[data-fr-rev]').forEach((b) => b.addEventListener('click', () => {
        const r = (reg.freeDist || []).find((x) => x.licId === b.dataset.frRev);
        if (!r) return;
        const nextRev = r.status !== 'revoked';
        r.status = nextRev ? 'revoked' : 'active';
        const revokedSet = new Set(reg.revoked || []);
        if (nextRev) revokedSet.add(r.licId);
        else revokedSet.delete(r.licId);
        reg.revoked = [...revokedSet];
        saveSellerRegistry(reg);
        appendAudit(nextRev ? 'FREE_DIST_REVOKED' : 'FREE_DIST_RESTORED', r.licId, `${r.recipientName} 무료배포 → ${r.status}`);
        openAdminSalesModal('free');
        toast(nextRev ? `🚫 ${r.recipientName} 무료 배포 권한이 회수(정지)되었습니다.` : `▶️ ${r.recipientName} 무료 배포 권한이 복구되었습니다.`);
      }));
      tb.querySelectorAll('[data-fr-auth]').forEach((b) => b.addEventListener('click', () => openAuthorityControlModal(b.dataset.frAuth, true)));
      tb.querySelectorAll('[data-fr-conv]').forEach((b) => b.addEventListener('click', () => {
        const r = (reg.freeDist || []).find((x) => x.licId === b.dataset.frConv);
        if (!r) return;
        r.status = 'converted';
        saveSellerRegistry(reg);
        appendAudit('FREE_DIST_CONVERTED', r.licId, `${r.recipientName} 무료배포 → 유료판매 발급 초안 이관`);
        S.salesDraft = {
          ...createClientSampleConfig(),
          licId: `NX-${new Date().getFullYear()}-${String(reg.sales.length + 1).padStart(3, '0')}`,
          companyName: r.affiliation || r.recipientName,
          contactName: r.recipientName,
          phone: r.phone || '',
          email: r.email || '',
          address: '',
          bizType: '건설·안전시설',
          saleDate: todayIso,
          channel: r.freeType === 'friend' ? '지인소개' : '본사직판',
          pkg: r.pkg || 'deluxe',
          priceMan: SALES_PACKAGES[r.pkg]?.priceMan || 59,
          brandTitle: `${r.affiliation || r.recipientName} 인텔리전스`,
          brandBadge: 'PRO',
          brandSub: '',
          sellerCode: reg.sellers[0]?.id || 'SLR-001',
          expiryDate: '',
          memo: `무료배포(${r.licId})에서 유료 전환`,
          tabs: { ...(SALES_PACKAGES[r.pkg]?.tabs || SALES_PACKAGES.deluxe.tabs) },
          features: { ...(SALES_PACKAGES[r.pkg]?.features || SALES_PACKAGES.deluxe.features) },
        };
        openAdminSalesModal('issue');
        toast(`💰 ${r.recipientName} 정보를 유료 판매링크 발급 화면으로 불러왔습니다!`);
      }));
      tb.querySelectorAll('[data-fr-del]').forEach((b) => b.addEventListener('click', () => {
        const id = b.dataset.frDel;
        reg.freeDist = (reg.freeDist || []).filter((x) => x.licId !== id);
        reg.revoked = (reg.revoked || []).filter((x) => x !== id);
        saveSellerRegistry(reg);
        appendAudit('FREE_DIST_DELETED', id, '무료 배포 이력 삭제');
        openAdminSalesModal('free');
        toast('🗑️ 무료 배포 이력이 삭제되었습니다.');
      }));
    };

    drawFreeRows();
    $('freeQ')?.addEventListener('input', drawFreeRows);
    $('freeTypeFilter')?.addEventListener('change', drawFreeRows);
    $('freeStatusFilter')?.addEventListener('change', drawFreeRows);
    $('btnFreeToPaid')?.addEventListener('click', () => openAdminSalesModal('status'));
    $('btnFreeCsv')?.addEventListener('click', () => {
      const hd = '배포번호,대상구분,수령인,소속관계,연락처,이메일,허용등급,간편모드,개별앱표시,배포일자,만료일자,상태,메모,전용링크\n';
      const rows = (reg.freeDist || []).map((x) => [
        x.licId, x.freeLabel || x.freeType, x.recipientName, x.affiliation || '', x.phone || '', x.email || '',
        x.pkg, x.simpleFreeMode ? 'Y' : 'N', x.showAppLinks ? 'Y' : 'N',
        x.issuedAt || '', x.expiryDate || '영구', x.status || 'active', x.memo || '', x.signedUrl,
      ].map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
      const blob = new Blob(['\uFEFF' + hd + rows], { type: 'text/csv;charset=utf-8' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `nexusone_free_distribution_${todayIso}.csv`; a.click();
      toast('📥 무료 배포 이력 CSV 다운로드 완료');
    });
  }

  // ---------- TAB 3: SELLER / RESELLER MANAGEMENT ----------
  else if (activeTab === 'sellers') {
    $('adminBody').innerHTML = `${tabBarHtml}
      <div class="domain-box" style="margin-bottom:10px">
        <h4 style="margin:0 0 8px">➕ 신규 판매자 / 영업담당 / 파트너 채널 등록</h4>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr 90px auto;gap:6px;align-items:end">
          <label style="font-size:11px;color:var(--muted)">판매자명 *<input id="slName" class="input" placeholder="예: 김영업 팀장" style="width:100%;margin-top:2px;font-size:12px" /></label>
          <label style="font-size:11px;color:var(--muted)">채널/소속<input id="slChannel" class="input" placeholder="예: 경기지사 / 크몽" style="width:100%;margin-top:2px;font-size:12px" /></label>
          <label style="font-size:11px;color:var(--muted)">연락처<input id="slPhone" class="input" placeholder="010-1234-5678" style="width:100%;margin-top:2px;font-size:12px" /></label>
          <label style="font-size:11px;color:var(--muted)">수수료(%)<input id="slComm" class="input" type="number" min="0" max="80" value="20" style="width:100%;margin-top:2px;font-size:12px" /></label>
          <button id="btnAddSeller" class="btn btn-primary btn-sm" type="button" style="height:34px">등록</button>
        </div>
      </div>

      <div class="table-wrap">
        <table class="data-table" style="font-size:12px">
          <thead><tr><th>코드</th><th>판매자명</th><th>채널 / 연락처</th><th>수수료율</th><th>판매건수</th><th>누적 매출</th><th>예상 정산액</th><th>삭제</th></tr></thead>
          <tbody>
            ${reg.sellers.map((sl) => {
              const mySales = reg.sales.filter((x) => x.sellerCode === sl.id || x.sellerName === sl.name);
              const rev = mySales.reduce((s, x) => s + (Number(x.priceMan) || 0), 0);
              const commWon = Math.round(rev * (Number(sl.commissionPct) || 0) / 100);
              return `
                <tr>
                  <td><code>${esc(sl.id)}</code></td>
                  <td><b>${esc(sl.name)}</b></td>
                  <td>${esc(sl.channel || '-')} <span style="color:var(--muted)">· ${esc(sl.phone || '-')}</span></td>
                  <td><b>${Number(sl.commissionPct) || 0}%</b></td>
                  <td>${fmt(mySales.length)}건</td>
                  <td style="font-weight:800;color:var(--c-corp)">${fmt(rev)}만원</td>
                  <td style="font-weight:800;color:#059669">${fmt(commWon)}만원</td>
                  <td>${sl.id === 'SLR-001' ? '<span style="font-size:10.5px;color:var(--muted)">기본</span>' : `<button type="button" class="btn btn-sm" data-sl-del="${esc(sl.id)}">✕</button>`}</td>
                </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
    $('adminFoot').innerHTML = `<button id="btnSlGoIssue" class="btn btn-primary btn-sm" type="button">🚀 판매링크 발급으로 이동</button>`;
    $('btnSlGoIssue')?.addEventListener('click', () => openAdminSalesModal('issue'));
    $('btnAddSeller')?.addEventListener('click', () => {
      const name = $('slName')?.value.trim();
      if (!name) { toast('판매자명을 입력하세요.'); return; }
      const newSl = {
        id: nextSeqId(reg.sellers || [], 'SLR', 'id'),
        name,
        channel: $('slChannel')?.value.trim() || '파트너',
        phone: $('slPhone')?.value.trim() || '-',
        commissionPct: Math.max(0, Math.min(80, Number($('slComm')?.value) || 0)),
        memo: '',
      };
      reg.sellers.push(newSl);
      saveSellerRegistry(reg);
      appendAudit('SELLER_ADDED', newSl.id, `${newSl.name} (${newSl.channel}, 수수료 ${newSl.commissionPct}%)`);
      openAdminSalesModal('sellers');
      toast(`🧑‍💼 판매자 '${newSl.name}' 등록 완료!`);
    });
    $('adminBody').querySelectorAll('[data-sl-del]').forEach((b) => b.addEventListener('click', () => {
      const id = b.dataset.slDel;
      reg.sellers = reg.sellers.filter((x) => x.id !== id);
      saveSellerRegistry(reg);
      appendAudit('SELLER_DELETED', id, '판매자 삭제');
      openAdminSalesModal('sellers');
    }));
  }

  // ---------- TAB 4: TOP 10 EXPERT TECHNIQUES & SECURITY OPTIONS ----------
  else if (activeTab === 'expert') {
    $('adminBody').innerHTML = `${tabBarHtml}
      <div class="domain-box" style="margin-bottom:10px">
        <h4 style="margin:0 0 8px">💎 SaaS 화이트라벨 · 보안·라이선스 전문가 기법 TOP 10 (실시간 ON/OFF 옵션)</h4>
        <div class="nx-expert-grid">
          ${EXPERT_TECHNIQUES_10.map((t) => `
            <label class="nx-expert-item ${eo[t.key] ? 'on' : ''}">
              <input type="checkbox" data-exp-opt="${t.key}" ${eo[t.key] ? 'checked' : ''} style="margin-top:3px" />
              <span>
                <b style="font-size:12px;display:block">${t.num}. ${t.title}</b>
                <span style="font-size:11px;color:var(--muted);line-height:1.4;display:block;margin-top:2px">${t.desc}</span>
              </span>
            </label>`).join('')}
        </div>
      </div>

      <div class="domain-box" style="margin-bottom:10px">
        <h4 style="margin:0 0 8px">⚙️ 세부 운영 정책 옵션</h4>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <label style="font-size:11.5px;color:var(--muted)">라이선스 만료 시 동작 정책
            <select id="expExpiryMode" class="select" style="width:100%;margin-top:3px;font-size:12px">
              <option value="lock" ${eo.expiryMode === 'lock' ? 'selected' : ''}>🔒 화면 잠금 + 갱신 연락처 표시 (권장)</option>
              <option value="readonly" ${eo.expiryMode === 'readonly' ? 'selected' : ''}>📖 읽기전용 유예 + 상단 만료 배너</option>
            </select>
          </label>
          <label style="font-size:11.5px;color:var(--muted)">1회용 원격 비번 초기화 링크 유효시간
            <select id="expResetHours" class="select" style="width:100%;margin-top:3px;font-size:12px">
              <option value="24" ${Number(eo.resetHours) === 24 ? 'selected' : ''}>24시간 (고보안)</option>
              <option value="72" ${Number(eo.resetHours) === 72 ? 'selected' : ''}>72시간 (표준 권장)</option>
              <option value="168" ${Number(eo.resetHours) === 168 ? 'selected' : ''}>7일 (주말 대응)</option>
            </select>
          </label>
        </div>
      </div>

      <div class="domain-box" style="margin-bottom:10px;border-color:rgba(16,185,129,.4);background:rgba(16,185,129,.04)">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:8px;flex-wrap:wrap">
          <h4 style="margin:0">📋 개인정보보호 · 이용약관 최초 로그인 동의 관리</h4>
          <div style="display:flex;gap:10px;flex-wrap:wrap;font-size:11.5px;font-weight:700">
            <label style="display:inline-flex;align-items:center;gap:4px;cursor:pointer"><input id="cpEnabled" type="checkbox" ${(reg.consentPolicy?.enabled !== false) ? 'checked' : ''} /> 최초 로그인 동의 팝업 ON</label>
            <label style="display:inline-flex;align-items:center;gap:4px;cursor:pointer"><input id="cpSkipMaster" type="checkbox" ${reg.consentPolicy?.skipForMaster ? 'checked' : ''} /> 마스터 본인은 건너뛰기</label>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:130px 1.2fr 1fr 1fr;gap:6px;margin-bottom:6px">
          <label style="font-size:11px;color:var(--muted)">약관 버전 (변경 시 재동의)
            <input id="cpVersion" class="input mono" value="${esc(reg.consentPolicy?.version || '2026.11-v1')}" style="width:100%;margin-top:2px;font-size:11.5px" />
          </label>
          <label style="font-size:11px;color:var(--muted)">팝업 제목
            <input id="cpTitle" class="input" value="${esc(reg.consentPolicy?.title || '개인정보보호 및 서비스 이용약관 동의 안내')}" style="width:100%;margin-top:2px;font-size:11.5px" />
          </label>
          <label style="font-size:11px;color:var(--muted)">개인정보보호책임자(CPO)
            <input id="cpCpoName" class="input" value="${esc(reg.consentPolicy?.cpoName || '개인정보보호책임자 (관리자)')}" style="width:100%;margin-top:2px;font-size:11.5px" />
          </label>
          <label style="font-size:11px;color:var(--muted)">CPO 연락처 / 이메일
            <input id="cpCpoContact" class="input" value="${esc(reg.consentPolicy?.cpoContact || '본사 담당자 문의')}" style="width:100%;margin-top:2px;font-size:11.5px" />
          </label>
        </div>
        <label style="font-size:11px;color:var(--muted);display:block;margin-bottom:7px">동의 팝업 상단 핵심 안내문
          <input id="cpNotice" class="input" value="${esc(reg.consentPolicy?.customNotice || '')}" style="width:100%;margin-top:2px;font-size:11.5px" />
        </label>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">
          <button id="btnSaveConsentPol" class="btn btn-primary btn-sm" type="button">✅ 동의 정책 저장</button>
          <button id="btnPreviewConsent" class="btn btn-sm" type="button">👁️ 동의 팝업 미리보기</button>
          <button id="btnResetMyConsent" class="btn btn-amber btn-sm" type="button">🔄 재동의 초기화 (테스트)</button>
          <button id="btnConsentCsv" class="btn btn-emerald btn-sm" type="button" style="margin-left:auto">📥 동의 이력 CSV (${loadConsentLogs().length}건)</button>
        </div>
        ${(() => {
          const cLogs = loadConsentLogs().slice(0, 6);
          return cLogs.length ? `
            <div class="table-wrap" style="max-height:130px;overflow-y:auto">
              <table class="data-table" style="font-size:11px">
                <thead><tr><th>동의 일시</th><th>라이선스</th><th>동의자</th><th>약관버전</th><th>필수/마케팅</th></tr></thead>
                <tbody>
                  ${cLogs.map((l) => `<tr><td>${esc(l.agreedAt)}</td><td><code>${esc(l.tenantId)}</code></td><td><b>${esc(l.signer)}</b></td><td><code>${esc(l.version)}</code></td><td>필수3/3 · 마케팅 ${l.marketing ? '동의' : '미동의'}</td></tr>`).join('')}
                </tbody>
              </table>
            </div>` : '<div style="font-size:11px;color:var(--muted)">아직 기록된 동의 이력이 없습니다.</div>';
        })()}
      </div>

      <div class="domain-box" style="margin-bottom:10px;border-color:rgba(79,70,229,.35);background:rgba(79,70,229,.04)">
        <h4 style="margin:0 0 6px">☁️ 원격 직권 중지 · 재개 · 기간변경 동기화 설정 (전 고객 기기 실시간 반영)</h4>
        <div style="font-size:11px;color:var(--muted);margin-bottom:7px">GitHub Personal Access Token (<code>nx1-p7k9v3</code> Contents Read/Write 권한)을 1회 입력해 두면, 직권 중지·재개·기간변경 시 1클릭으로 <code>data/license_control.json</code>이 전 고객 기기에 원격 반영됩니다. (토큰은 본인 브라우저 로컬에만 저장)</div>
        <div style="display:grid;grid-template-columns:1fr 90px 1.2fr auto;gap:6px;align-items:end;margin-bottom:6px">
          <label style="font-size:11px;color:var(--muted)">GitHub 저장소
            <input id="rsRepo" class="input mono" value="${esc(reg.remoteSync?.repo || 'heebonpark/nx1-p7k9v3')}" style="width:100%;margin-top:2px;font-size:11.5px" />
          </label>
          <label style="font-size:11px;color:var(--muted)">브랜치
            <input id="rsBranch" class="input mono" value="${esc(reg.remoteSync?.branch || 'main')}" style="width:100%;margin-top:2px;font-size:11.5px" />
          </label>
          <label style="font-size:11px;color:var(--muted)">GitHub PAT 토큰 (로컬 전용)
            <input id="rsToken" class="input mono" type="password" value="${esc(reg.remoteSync?.token || '')}" placeholder="github_pat_..." style="width:100%;margin-top:2px;font-size:11.5px" />
          </label>
          <button id="btnSaveRs" class="btn btn-primary btn-sm" type="button" style="height:34px">저장</button>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          <button id="btnRsPushNow" class="btn btn-emerald btn-sm" type="button">☁️ 지금 전 고객 기기 원격 동기화</button>
          <button id="btnRsDownload" class="btn btn-sm" type="button">📥 license_control.json 수동 다운로드</button>
        </div>
      </div>

      <div class="domain-box">
        <h4 style="margin:0 0 6px">🔐 판매자 마스터 전환 PIN 변경 (구매자 화면에서 Ctrl+Shift+A 복귀용)</h4>
        <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center">
          <input id="expNewMasterPin" class="input" type="password" placeholder="새 마스터 PIN (기본: nx1master, 4자+)" style="flex:1;min-width:200px;font-size:12px" />
          <button id="btnSaveMasterPin" class="btn btn-amber btn-sm" type="button">🔑 마스터 PIN 변경</button>
        </div>
      </div>
    `;

    $('adminFoot').innerHTML = `
      <button id="btnSaveExpertOpts" class="btn btn-primary btn-sm" type="button">✅ TOP 10 전문가 옵션 저장</button>
      <button id="btnResetExpertOpts" class="btn btn-sm" type="button" style="margin-left:auto">↺ 권장 기본값(10개 전체 ON)</button>
    `;

    $('btnSaveConsentPol')?.addEventListener('click', () => {
      reg.consentPolicy = {
        enabled: Boolean($('cpEnabled')?.checked),
        skipForMaster: Boolean($('cpSkipMaster')?.checked),
        version: $('cpVersion')?.value.trim() || '2026.11-v1',
        title: $('cpTitle')?.value.trim() || '개인정보보호 및 서비스 이용약관 동의 안내',
        cpoName: $('cpCpoName')?.value.trim() || '개인정보보호책임자 (관리자)',
        cpoContact: $('cpCpoContact')?.value.trim() || '본사 담당자 문의',
        customNotice: $('cpNotice')?.value.trim() || defaultConsentPolicy().customNotice,
      };
      saveSellerRegistry(reg);
      appendAudit('CONSENT_POLICY_SAVED', 'MASTER', `활성:${reg.consentPolicy.enabled ? 'Y' : 'N'}, 버전:${reg.consentPolicy.version}`);
      toast(`✅ 동의 정책(${reg.consentPolicy.version})이 저장되었습니다!`);
      openAdminSalesModal('expert');
    });
    $('btnPreviewConsent')?.addEventListener('click', () => openConsentModal({ preview: true }));
    $('btnResetMyConsent')?.addEventListener('click', () => {
      try { localStorage.removeItem(consentStateKey(S.tenantId || 'MASTER')); } catch {}
      $('adminBackdrop')?.classList.add('hidden');
      toast('🔄 동의 기록이 초기화되었습니다. 최초 로그인 동의 팝업을 표시합니다.');
      setTimeout(() => openConsentModal({ preview: false, readOnly: false }), 150);
    });
    $('btnConsentCsv')?.addEventListener('click', () => {
      const logs = loadConsentLogs();
      const hd = '동의일시,라이선스ID,브랜드,동의자,약관버전,개인정보동의,이용약관동의,보안서약동의,마케팅수신동의\n';
      const rows = logs.map((l) => [l.agreedAt, l.tenantId, l.brand, l.signer, l.version, l.privacy ? 'Y' : 'N', l.terms ? 'Y' : 'N', l.security ? 'Y' : 'N', l.marketing ? 'Y' : 'N'].map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
      const blob = new Blob(['\uFEFF' + hd + rows], { type: 'text/csv;charset=utf-8' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `nexusone_consent_logs_${new Date().toISOString().slice(0, 10)}.csv`; a.click();
      toast('📥 개인정보·약관 동의 이력 CSV 다운로드 완료');
    });

    $('btnSaveRs')?.addEventListener('click', () => {
      reg.remoteSync = {
        ...defaultRemoteSyncConfig(),
        repo: $('rsRepo')?.value.trim() || 'heebonpark/nx1-p7k9v3',
        branch: $('rsBranch')?.value.trim() || 'main',
        token: $('rsToken')?.value.trim() || '',
      };
      saveSellerRegistry(reg);
      toast('✅ 원격 직권 제어 동기화 설정이 저장되었습니다.');
    });
    $('btnRsPushNow')?.addEventListener('click', async () => {
      reg.remoteSync = {
        ...defaultRemoteSyncConfig(),
        repo: $('rsRepo')?.value.trim() || 'heebonpark/nx1-p7k9v3',
        branch: $('rsBranch')?.value.trim() || 'main',
        token: $('rsToken')?.value.trim() || '',
      };
      saveSellerRegistry(reg);
      const res = await publishLicenseControlToGithub(reg);
      if (res.ok) { appendAudit('REMOTE_CONTROL_SYNCED', 'ALL', res.msg); toast(`☁️ ${res.msg}`); }
      else toast(`⚠️ ${res.msg}`);
    });
    $('btnRsDownload')?.addEventListener('click', () => {
      downloadLicenseControlJson(reg);
      toast('📥 license_control.json 다운로드 완료');
    });

    $('btnSaveExpertOpts')?.addEventListener('click', () => {
      $('adminBody').querySelectorAll('[data-exp-opt]').forEach((el) => { eo[el.dataset.expOpt] = el.checked; });
      eo.expiryMode = $('expExpiryMode')?.value || 'lock';
      eo.resetHours = Number($('expResetHours')?.value) || 72;
      reg.expertOpts = eo;
      saveSellerRegistry(reg);
      appendAudit('EXPERT_OPTS_SAVED', 'MASTER', `활성 옵션 ${EXPERT_TECHNIQUES_10.filter((t) => eo[t.key]).length}/10, 만료정책:${eo.expiryMode}`);
      toast('✅ 전문가 기법 TOP 10 옵션이 저장 및 적용되었습니다!');
      openAdminSalesModal('expert');
    });

    $('btnResetExpertOpts')?.addEventListener('click', () => {
      reg.expertOpts = defaultExpertOpts();
      saveSellerRegistry(reg);
      toast('↺ 전문가 기법 TOP 10 권장 기본값으로 복원되었습니다.');
      openAdminSalesModal('expert');
    });

    $('btnSaveMasterPin')?.addEventListener('click', async () => {
      const np = $('expNewMasterPin')?.value.trim() || '';
      if (np.length < 4) { toast('마스터 PIN은 4자 이상 입력하세요.'); return; }
      reg.masterPinHash = await sha256Hex(np);
      saveSellerRegistry(reg);
      appendAudit('MASTER_PIN_CHANGED', 'MASTER', '판매자 마스터 전환 PIN 변경 완료');
      $('expNewMasterPin').value = '';
      toast('🔐 판매자 마스터 PIN이 안전하게 변경되었습니다!');
    });
  }

  // ---------- TAB 5: SECURITY AUDIT TRAIL ----------
  else if (activeTab === 'audit') {
    const logs = loadAuditLog(null);
    $('adminBody').innerHTML = `${tabBarHtml}
      <div class="table-wrap" style="max-height:400px;overflow-y:auto">
        <table class="data-table" style="font-size:11.5px">
          <thead><tr><th>일시</th><th>주체</th><th>이벤트</th><th>대상</th><th>상세 내용</th></tr></thead>
          <tbody>
            ${logs.map((l) => `
              <tr>
                <td style="white-space:nowrap;color:var(--muted)">${esc(l.ts)}</td>
                <td>${esc(l.actor)}</td>
                <td><b>${esc(l.action)}</b></td>
                <td><code>${esc(l.target)}</code></td>
                <td>${esc(l.detail)}</td>
              </tr>`).join('') || '<tr><td colspan="5" style="text-align:center;padding:24px;color:var(--muted)">아직 기록된 보안 감사 로그가 없습니다.</td></tr>'}
          </tbody>
        </table>
      </div>
    `;
    $('adminFoot').innerHTML = `
      <button id="btnAuditCsv" class="btn btn-emerald btn-sm" type="button">📥 감사 로그 CSV</button>
      <button id="btnAuditClear" class="btn btn-sm" type="button" style="margin-left:auto">🗑️ 로그 비우기</button>
    `;
    $('btnAuditCsv')?.addEventListener('click', () => {
      const hd = '일시,주체,이벤트,대상,상세내용\n';
      const rows = logs.map((l) => [l.ts, l.actor, l.action, l.target, l.detail].map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
      const blob = new Blob(['\uFEFF' + hd + rows], { type: 'text/csv;charset=utf-8' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `nexusone_audit_${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    });
    $('btnAuditClear')?.addEventListener('click', () => {
      localStorage.removeItem(MASTER_AUDIT_KEY);
      openAdminSalesModal('audit');
      toast('🗑️ 감사 로그가 초기화되었습니다.');
    });
  }

  // Wire top navigation tabs inside Master Console
  $('adminBody').querySelectorAll('[data-adm-nav]').forEach((b) => {
    b.addEventListener('click', () => openAdminSalesModal(b.dataset.admNav));
  });
  $('adminBackdrop')?.classList.remove('hidden');
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
  leafletGpsLayer: null,
  gisBase: 'vbase',
  gisLayers: { cadastral: false, zoning: false, emd: false, bldg: false, heat: false },
  gisOpacity: 80,
  gisWalkRings: false,
  gisRadius: 500,
  gisRulerMode: false,
  rulerPts: [],
  gpsPos: null,         // { lat, lon, acc, ts }
  gpsWatching: false,
  gpsWatchId: null,
  catchment: null,      // { lat, lon, radius, stores, stats, vworld, blds, nearbyOpps }
  compareCatchment: null, // Pinned Site A for A/B comparison
  sbizBookmarks: (() => { try { return JSON.parse(localStorage.getItem(tStorageKey('nx1_sbiz_bm_v38')) || '[]'); } catch { return []; } })(),
  lastSbizMatchedIdx: [],

  // UI Navigation, Pro Options, Admin Sales Config & Expert State
  opts: loadOpts(),
  isBuyerMode: BOOT_CTX.isBuyerMode,
  tenantId: BOOT_CTX.tenantId,
  licenseStatus: BOOT_CTX.licenseStatus,
  buyerAuthed: false,
  adminModalTab: 'issue',
  salesDraft: null,
  admin: BOOT_CTX.admin,
  tab: 'overview',
  selectedRid: -1,
  compareRid: -1,
  showSliders: false,
  svgZoom: 1,
  svgPan: { x: 0, y: 0 },
  mapMetric: 'total',
  rankSort: 'total',

  // Corp filters
  corpQ: '', corpSd: '', corpType: '', corpTag: '', corpStatus: '', corpRevMin: '', corpSort: 'rev', corpPage: 1,
  corpIndMult: new Map(),
  // Universal Collapsible Panel / Mobile Bottom-Sheet State (v37)
  ovOptOpen: window.innerWidth > 820,
  ovVizOpen: window.innerWidth > 820,
  corpFilterOpen: window.innerWidth > 820,
  // Bid filters & v8~v15 Early-Detection Radar GIS Map + Practical Suite state
  bidSub: 'map', bidQ: '', bidStage: '', bidField: '', bidUrgency: '', bidBudgetMin: 0, bidSd: '', bidPage: 1,
  bidHideCancelled: true, bidMyKwOnly: false, bidMyBizOnly: false,
  bidFilterOpen: window.innerWidth > 820,
  bidMapOptOpen: window.innerWidth > 820,
  sbizSidoOpen: window.innerWidth > 820,
  sbizGisOpen: window.innerWidth > 820,
  sbizFilterOpen: window.innerWidth > 820,
  sbizYmOpen: window.innerWidth > 820,
  reFilterOpen: window.innerWidth > 820,
  reOnlyFit: false,
  hubDiagOpen: window.innerWidth > 820,
  hubTaxOpen: window.innerWidth > 820,
  bidMyKeywords: (() => { try { return localStorage.getItem('nx1_bid_my_kw_v1') || 'CCTV,관제,보안,소방,승강기,시설,경비,미화,전기,통신,보험'; } catch { return 'CCTV,관제,보안,소방,승강기,시설,경비,미화,전기,통신,보험'; } })(),
  myBiz: (() => { try { return JSON.parse(localStorage.getItem('nx1_mybiz_v1') || '{}') || {}; } catch { return {}; } })(),
  qualProfile: (() => { try { return Object.assign({ credit: 'BBB', perfEok: 15, bonus: 1.5, cutoff: 95 }, JSON.parse(localStorage.getItem('nx1_qual_profile_v1') || '{}') || {}); } catch { return { credit: 'BBB', perfEok: 15, bonus: 1.5, cutoff: 95 }; } })(),
  bidMapMode: 'cluster', bidMapBase: 'vbase', bidWms: { cadastral: false, zoning: false },
  bidLeafletMap: null, bidLeafletLayer: null, bidLeafletTile: null, bidLeafletHybrid: null, bidLeafletWms: {},
  bidSync: { syncing: false, lastAt: '', added: 0, liveTotal: 0 },
  awardCache: { loading: false, loaded: false, list: [] },
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
  try { S.pipeline = JSON.parse(localStorage.getItem(tStorageKey(PIPE_KEY)) || '[]'); } catch { S.pipeline = []; }
  updatePipeBadge();
}
function savePipeline() {
  try { localStorage.setItem(tStorageKey(PIPE_KEY), JSON.stringify(S.pipeline)); } catch {}
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

// IndexedDB non-extractable key cache (timeout-guarded for iOS/iPadOS & KakaoTalk WebView)
function openIdb(timeoutMs = 1500) {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') { reject(new Error('No IDB')); return; }
    let settled = false;
    const timer = setTimeout(() => {
      if (!settled) { settled = true; reject(new Error('IDB timeout')); }
    }, timeoutMs);
    const done = (fn, val) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      fn(val);
    };
    try {
      const req = indexedDB.open(IDB_NAME, 1);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains(IDB_STORE)) {
          req.result.createObjectStore(IDB_STORE);
        }
      };
      req.onsuccess = () => done(resolve, req.result);
      req.onerror = () => done(reject, req.error || new Error('IDB open error'));
      req.onblocked = () => done(reject, new Error('IDB blocked'));
    } catch (e) {
      done(reject, e);
    }
  });
}
async function idbGetKey() {
  let db = null;
  try {
    db = await openIdb(1500);
    return await new Promise((res) => {
      const timer = setTimeout(() => res(null), 1500);
      const tx = db.transaction(IDB_STORE, 'readonly');
      const r = tx.objectStore(IDB_STORE).get('master');
      r.onsuccess = () => { clearTimeout(timer); res(r.result || null); };
      r.onerror = () => { clearTimeout(timer); res(null); };
    });
  } catch { return null; } finally {
    try { db?.close(); } catch {}
  }
}
async function idbSetKey(key) {
  let db = null;
  try {
    db = await openIdb(1500);
    await new Promise((res) => {
      const timer = setTimeout(res, 1500);
      const tx = db.transaction(IDB_STORE, 'readwrite');
      tx.objectStore(IDB_STORE).put(key, 'master');
      tx.oncomplete = () => { clearTimeout(timer); res(); };
      tx.onerror = () => { clearTimeout(timer); res(); };
      tx.onabort = () => { clearTimeout(timer); res(); };
    });
  } catch {} finally {
    try { db?.close(); } catch {}
  }
}
async function idbClearKey() {
  let db = null;
  try {
    db = await openIdb(1500);
    await new Promise((res) => {
      const timer = setTimeout(res, 1500);
      const tx = db.transaction(IDB_STORE, 'readwrite');
      tx.objectStore(IDB_STORE).clear();
      tx.oncomplete = () => { clearTimeout(timer); res(); };
      tx.onerror = () => { clearTimeout(timer); res(); };
      tx.onabort = () => { clearTimeout(timer); res(); };
    });
  } catch {} finally {
    try { db?.close(); } catch {}
  }
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
    addr: item.address?.road || item.address?.parcel || '',
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
        <div style="font-size:11px;font-weight:700;color:#a5b4fc;letter-spacing:0.05em">${esc((S.admin?.brandTitle || 'NEXUS ONE').toUpperCase())} ${esc(S.admin?.brandBadge || 'PRO')} · COMMERCIAL OPPORTUNITY REPORT${S.isBuyerMode && S.admin?.a4Watermark !== false ? ` · LICENSED TO ${esc(S.admin.companyName || '')} (${esc(S.tenantId)})` : ''}</div>
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

  // Apply URL deep link (?tab=bid|sbiz|corp|realestate|hub) or Buyer Admin configured startTab
  const urlTab = new URLSearchParams(location.search).get('tab');
  const buyerStartTab = S.isBuyerMode ? loadBuyerState(S.tenantId).startTab : '';
  const initTab = (urlTab && ['overview', 'corp', 'bid', 'sbiz', 'realestate', 'hub'].includes(urlTab))
    ? urlTab
    : (buyerStartTab && S.admin?.tabs?.[buyerStartTab] ? buyerStartTab : '');
  if (initTab) {
    S.tab = initTab;
    document.querySelectorAll('[data-tab]').forEach((el) => el.classList.toggle('active', el.dataset.tab === initTab));
  }

  // Enrich all loaded opportunities with accurate 229-sigungu rid & WGS84 coords
  S.opps = S.opps.map((o) => attachOppGeo(o));

  $('lockScreen').classList.add('hidden');
  $('appShell').classList.remove('hidden');
  applyAdminConfig(false);
  if (!renderLicenseLockWallIfNeeded()) {
    renderCurrentTab();
  }
  if (S.isBuyerMode) {
    fetchAndApplyRemoteLicenseControl();
    if (!window._nxRemotePolicyTimer) {
      window._nxRemotePolicyTimer = setInterval(fetchAndApplyRemoteLicenseControl, 300000);
    }
  }
  if (BOOT_CTX.justResetPw) {
    appendAudit('REMOTE_PW_RESET', S.tenantId, '1회용 원격 초기화 링크로 구매자 비밀번호 admin 초기화 완료');
    toast('🔑 원격 비밀번호 초기화 완료! 초기 비밀번호(admin)로 로그인 후 새 비밀번호를 설정하세요.');
    setTimeout(() => openBuyerAdminModal(), 350);
  } else if (BOOT_CTX.resetErr) {
    toast(`⚠️ ${BOOT_CTX.resetErr}`);
  } else {
    maybePromptConsentOnLogin();
  }

  // Auto background real-time sync (same live APIs as KakaoTalk Alert Bot!)
  setTimeout(() => fetchLiveG2bAndPrespec({ silent: true }), 400);
}

// ===== OPP REGION MATCHER & WGS84 COORD MAPPER (229 SIGUNGU AFFINE) =====
function regionCentroidLatLon(rid) {
  const reg = S.map?.regions?.[rid];
  if (!reg?.c) return [37.5665, 126.9780];
  const [x, y] = reg.c;
  return [
    Math.round((-0.0058438 * y + 38.61497) * 1e5) / 1e5,
    Math.round((0.0073628 * x + 124.59339) * 1e5) / 1e5,
  ];
}

const OPP_SIDO_TO_SD = {
  '서울특별시': '11', '서울': '11', '부산광역시': '21', '부산': '21', '대구광역시': '22', '대구': '22',
  '인천광역시': '23', '인천': '23', '광주광역시': '24', '광주': '24', '대전광역시': '25', '대전': '25',
  '울산광역시': '26', '울산': '26', '세종특별자치시': '29', '세종': '29', '경기도': '31', '경기': '31',
  '강원특별자치도': '32', '강원': '32', '충청북도': '33', '충북': '33', '충청남도': '34', '충남': '34',
  '전북특별자치도': '35', '전북': '35', '전라남도': '36', '전남': '36', '경상북도': '37', '경북': '37',
  '경상남도': '38', '경남': '38', '제주특별자치도': '39', '제주': '39',
};

function matchOppRid(o) {
  if (typeof o._fusionRid === 'number' && o._fusionRid >= 0 && S.fusionByRid.has(o._fusionRid)) return o._fusionRid;
  const txt = `${o.region || ''} ${o.org || ''} ${o.title || ''}`;
  let sd = '';
  for (const [k, v] of Object.entries(OPP_SIDO_TO_SD)) {
    if (txt.includes(k)) { sd = v; break; }
  }
  const regs = S.fusion?.regions || [];
  if (sd === '29') {
    const sej = regs.find((r) => r.sd === '29');
    if (sej) return sej.rid;
  }
  if (sd) {
    for (const r of regs) {
      if (r.sd === sd && r.name && txt.includes(r.name)) return r.rid;
    }
    for (const r of regs) {
      if (r.sd !== sd) continue;
      const sh = r.name.replace(/시$|군$|구$/, '');
      if (sh.length >= 2 && txt.includes(sh)) return r.rid;
    }
    const firstOfSd = regs.find((r) => r.sd === sd);
    if (firstOfSd) return firstOfSd.rid;
  }
  // Fallback: unique sigungu name match anywhere in text
  for (const r of regs) {
    if (r.name && r.name.length >= 3 && txt.includes(r.name)) return r.rid;
  }
  return (typeof o.rid === 'number' && o.rid >= 0 && S.fusionByRid.has(o.rid)) ? o.rid : -1;
}

function attachOppGeo(o) {
  const rid = matchOppRid(o);
  const reg = S.fusionByRid.get(rid);
  let lat = o.lat || 0, lon = o.lon || 0;
  if ((!lat || !lon) && rid >= 0) {
    const [la, lo] = regionCentroidLatLon(rid);
    // Deterministic tiny scatter (~400m) so pins in same sigungu don't stack on 1 pixel
    let h = 0;
    const key = String(o.id || o.title || '');
    for (let i = 0; i < key.length; i++) h = ((h << 5) - h + key.charCodeAt(i)) | 0;
    const ang = (Math.abs(h) % 360) * Math.PI / 180;
    const rad = 0.002 + ((Math.abs(h >> 8) % 100) / 100) * 0.012;
    lat = +(la + Math.sin(ang) * rad).toFixed(5);
    lon = +(lo + Math.cos(ang) * rad * 1.25).toFixed(5);
  }
  return {
    ...o,
    _fusionRid: rid,
    _sd: reg?.sd || '',
    _regionFull: reg?.fullName || o.region || '전국',
    lat,
    lon,
  };
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
    // Calibrate empirical Revenue-to-Payroll multiplier per industry from DART-disclosed corps
    const indRatios = new Map();
    for (let i = 0; i < S.corps.length; i++) {
      const r = S.corps[i];
      const biz = String(r[6] || '').replace(/\D/g, '');
      const e = S.corpEnrichMap.get(biz);
      if (e && e[0] > 0 && (e[12] || e[9]) >= 5 && e[15] > 1000000) {
        const ratio = e[0] / ((e[12] || e[9]) * e[15] * 12);
        if (ratio >= 0.8 && ratio <= 30) {
          const indId = r[12];
          if (!indRatios.has(indId)) indRatios.set(indId, []);
          indRatios.get(indId).push(ratio);
        }
      }
    }
    const multMap = new Map();
    for (const [indId, arr] of indRatios.entries()) {
      if (arr.length >= 3) {
        arr.sort((a, b) => a - b);
        const med = arr[Math.floor(arr.length / 2)];
        multMap.set(indId, Math.max(1.8, Math.min(10.5, Number((med * 0.72).toFixed(2)))));
      }
    }
    S.corpIndMult = multMap;
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
  if (renderLicenseLockWallIfNeeded()) {
    toast('🔒 현재 라이선스가 제한 상태입니다.');
    return;
  }
  if (S.isBuyerMode && S.admin?.tabs && !S.admin.tabs[tab]) {
    toast('🔒 현재 계약 패키지에 포함되지 않은 도메인입니다. 업그레이드는 담당 판매자에게 문의해 주세요.');
    return;
  }
  S.tab = tab;
  document.querySelectorAll('[data-tab]').forEach((el) => {
    el.classList.toggle('active', el.dataset.tab === tab);
  });
  window.scrollTo({ top: 0, behavior: 'instant' });
  renderCurrentTab();
}

function renderCurrentTab() {
  if (renderLicenseLockWallIfNeeded()) return;
  if (S.tab !== 'sbiz') {
    if (S.gpsWatchId !== null && navigator.geolocation) {
      try { navigator.geolocation.clearWatch(S.gpsWatchId); } catch {}
      S.gpsWatchId = null;
      S.gpsWatching = false;
    }
    if (S.leafletMap) {
      S.leafletMap.remove();
      S.leafletMap = null;
      S.leafletLayer = null;
      S.leafletGpsLayer = null;
    }
  }
  if (S.tab !== 'bid' && S.bidLeafletMap) {
    S.bidLeafletMap.remove();
    S.bidLeafletMap = null;
    S.bidLeafletLayer = null;
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

    <!-- COLLAPSIBLE STRATEGY · WEIGHTS · TOP 10 DECK (v37 Mobile-First) -->
    <div class="nx-collapse-bar" style="margin-top:10px">
      <button id="btnOvOptToggle" class="btn btn-sm ${S.ovOptOpen ? 'btn-primary' : ''}" type="button">
        🧠 전략·가중치·TOP 10 옵션 <span class="tag tag-corp" style="margin-left:4px">${esc(STRATEGY_PRESETS[S.opts.preset]?.label || '커스텀')}</span> ${S.ovOptOpen ? '▴' : '▾'}
      </button>
      <button id="btnToggleSlidersQuick" class="btn btn-sm ${S.showSliders ? 'btn-primary' : ''}" type="button">
        🎚️ 가중치 (${wPct(w.corp)}/${wPct(w.bid)}/${wPct(w.sbiz)}/${wPct(w.re)})
      </button>
      ${S.opts.showBcgCharts ? `
        <button id="btnOvVizToggle" class="btn btn-sm ${S.ovVizOpen ? 'btn-primary' : ''}" type="button" style="margin-left:auto">
          📊 BCG·17시도 차트 ${S.ovVizOpen ? '▴' : '▾'}
        </button>` : ''}
    </div>

    <div id="ovOptDeck" class="nx-collapsible-panel ${S.ovOptOpen ? '' : 'collapsed'}">
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

        <div class="chips nx-swipe-chips" style="margin-bottom:10px">
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

    ${S.opts.showBcgCharts ? `<div id="ovVizWrap" class="nx-collapsible-panel ${S.ovVizOpen ? '' : 'collapsed'}">${renderVisualizationsDeck(reg)}</div>` : ''}

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
        <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;max-width:100%">
          <div class="chips nx-swipe-chips">
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
  $('btnOvOptToggle')?.addEventListener('click', () => { S.ovOptOpen = !S.ovOptOpen; renderOverview(); });
  $('btnToggleSlidersQuick')?.addEventListener('click', () => { S.showSliders = !S.showSliders; renderOverview(); });
  $('btnOvVizToggle')?.addEventListener('click', () => { S.ovVizOpen = !S.ovVizOpen; renderOverview(); });
  $('mainStage').querySelectorAll('[data-jump]').forEach((el) => el.addEventListener('click', () => switchTab(el.dataset.jump)));
  $('mainStage').querySelectorAll('[data-t10]').forEach((el) => {
    el.addEventListener('click', () => {
      const k = el.dataset.t10;
      if (k === 'sliders') { S.showSliders = true; renderOverview(); }
      else if (k === 'lq') { S.mapMetric = 'lq'; renderOverview(); }
      else if (k === 'blue') { S.mapMetric = 'blueOcean'; S.rankSort = 'blueOcean'; renderOverview(); }
      else if (k === 'bcg' || k === 'sido') { S.opts.showBcgCharts = true; S.ovVizOpen = true; saveOpts(); renderOverview(); setTimeout(() => $('vizDeck')?.scrollIntoView({ behavior: 'smooth' }), 60); }
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
  $('btnToggleSliders')?.addEventListener('click', () => { S.showSliders = !S.showSliders; renderOverview(); });
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
function fallbackSectorMult(indName) {
  const s = String(indName || '');
  if (/도매|중개|무역|유통|상품/.test(s)) return 7.2;
  if (/건설|토목|건축|부동산|시공/.test(s)) return 5.4;
  if (/제조|기계|전자|반도체|화학|금속|자동차|식품/.test(s)) return 4.8;
  if (/운수|물류|창고|운송/.test(s)) return 4.4;
  if (/소프트웨어|정보|통신|컴퓨터|프로그래밍|연구|엔지니어링|전문/.test(s)) return 3.0;
  if (/경비|청소|시설|인력|파견|용역|미화/.test(s)) return 1.9;
  return 4.0;
}

function resolveCorpRevenue(r, enr, inds) {
  if (!enr) return { won: 0, kind: 'none', label: '', mult: 0, payroll: 0, emp: 0, wage: 0 };
  const dartWon = enr[0] || enr[1] || enr[2] || 0;
  if (dartWon > 0) {
    return { won: dartWon, kind: 'dart', label: '공시', mult: 0, payroll: 0, emp: enr[12] || enr[9] || 0, wage: enr[15] || 0 };
  }
  const emp = enr[12] || enr[9] || 0;
  if (emp > 0) {
    const wage = enr[15] > 500000 ? enr[15] : (enr[10] > 6000000 ? Math.round(enr[10] / 12) : 3400000);
    const mult = S.corpIndMult?.get(r[12]) || fallbackSectorMult(inds[r[12]] || '');
    const payroll = emp * wage * 12;
    const estWon = Math.round(payroll * mult);
    return { won: estWon, kind: 'est', label: '추정', mult, payroll, emp, wage };
  }
  return { won: 0, kind: 'none', label: '', mult: 0, payroll: 0, emp: 0, wage: 0 };
}

function fmtRevEok(won) {
  if (!won || won <= 0) return '-';
  const eok = won / 1e8;
  if (eok >= 10000) return `${fmtDec(eok / 10000, 1)}조`;
  if (eok >= 100) return `${fmt(Math.round(eok))}억`;
  if (eok >= 1) return `${fmtDec(eok, 1)}억`;
  return `${fmt(Math.round(won / 1e4))}만`;
}

function renderCorpTab() {
  if (!S.corpLoaded) {
    $('mainStage').innerHTML = `
      <div class="card" style="max-width:560px;margin:24px auto;text-align:center;padding:28px">
        <div style="font-size:36px;margin-bottom:8px">🏢</div>
        <h2 style="margin:0 0 6px">전국 법인 120,028사 암호화 DB 복호화</h2>
        <p style="color:var(--muted);font-size:13px;margin:0 0 14px">DART 개황 · 3개년 재무 · 국민연금 고용·급여 · 국세청 상태 (9.5 MB)를 브라우저 메모리로 안전하게 로드합니다.</p>
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
  let dartCnt = 0, estCnt = 0, totalRevEok = 0;
  for (let i = 0; i < S.corps.length; i++) {
    const r = S.corps[i];
    if (S.corpSd) {
      const rowSd = S.fusionByRid.get(r[15])?.sd || sidos[r[16]]?.sd || '';
      if (rowSd !== S.corpSd) continue;
    }
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
    const revInfo = resolveCorpRevenue(r, enr, inds);
    if (S.corpRevMin === 'dart' && revInfo.kind !== 'dart') continue;
    else if (S.corpRevMin === 'any' && revInfo.won <= 0) continue;
    else if (S.corpRevMin && !isNaN(Number(S.corpRevMin))) {
      if (revInfo.won < Number(S.corpRevMin) * 1e8) continue;
    }
    if (revInfo.kind === 'dart') dartCnt++;
    else if (revInfo.kind === 'est') estCnt++;
    if (revInfo.won > 0) totalRevEok += revInfo.won / 1e8;
    filtered.push({ i, r, bizClean, enr, stCode, revInfo });
  }

  if (S.corpSort === 'rev') filtered.sort((a, b) => (b.revInfo.won || 0) - (a.revInfo.won || 0));
  else if (S.corpSort === 'dartRev') filtered.sort((a, b) => (b.enr?.[0] || 0) - (a.enr?.[0] || 0));
  else if (S.corpSort === 'emp') filtered.sort((a, b) => (b.enr?.[12] || b.enr?.[9] || 0) - (a.enr?.[12] || a.enr?.[9] || 0));
  else if (S.corpSort === 'net') filtered.sort((a, b) => ((b.enr?.[13] || 0) - (b.enr?.[14] || 0)) - ((a.enr?.[13] || 0) - (a.enr?.[14] || 0)));
  else if (S.corpSort === 'est') filtered.sort((a, b) => (b.r[13] || 0) - (a.r[13] || 0));

  const perPage = 40;
  const maxPage = Math.max(1, Math.ceil(filtered.length / perPage));
  S.corpPage = Math.min(S.corpPage, maxPage);
  const pageRows = filtered.slice((S.corpPage - 1) * perPage, S.corpPage * perPage);
  const stLabel = (c) => (c === 1 ? '<span class="tag tag-sbiz">계속</span>' : c === 2 ? '<span class="tag tag-bid">휴업</span>' : c === 3 ? '<span class="tag tag-re">폐업</span>' : '<span class="tag tag-gray">미확인</span>');

  const corpRevLabels = { dart: '💰 DART 공시매출만', any: '📊 공시+추정 매출 보유', 10: '10억+', 50: '50억+', 100: '100억+', 500: '500억+', 1000: '1,000억+' };
  const corpStLabels = { 1: '계속사업자', 2: '휴업자', 3: '폐업자' };
  const corpActiveTags = [];
  if (S.corpSd) corpActiveTags.push(['sd', `📍 ${sidos.find((s) => s.sd === S.corpSd)?.n || S.corpSd}`]);
  if (S.corpRevMin) corpActiveTags.push(['rev', corpRevLabels[S.corpRevMin] || `${S.corpRevMin}억+`]);
  if (S.corpType !== '') corpActiveTags.push(['type', `시장: ${corpTypes[Number(S.corpType)] || S.corpType}`]);
  if (S.corpTag) corpActiveTags.push(['tag', `태그: ${S.corpTags.find((t) => t.id === S.corpTag)?.label || S.corpTag}`]);
  if (S.corpStatus) corpActiveTags.push(['status', `국세청: ${corpStLabels[S.corpStatus] || S.corpStatus}`]);
  const corpFilterCnt = corpActiveTags.length;

  $('mainStage').innerHTML = `
    <div class="card">
      <div class="card-head">
        <div>
          <h2 class="card-title">🏢 전국 기업분석 PRO <span class="tag tag-corp">${fmt(filtered.length)}사</span></h2>
          <p class="card-sub">DART 공시매출 (${fmt(dartCnt)}사) + 국민연금 실급여·업종보정 추정매출 (${fmt(estCnt)}사) · 총 ${fmt(dartCnt + estCnt)}사 매출 분석 지원</p>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          <button id="btnCorpCsv" class="btn btn-emerald btn-sm" type="button">📥 조건결과 CSV</button>
          <button id="btnCorpReset" class="btn btn-sm" type="button">초기화</button>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:8px;margin-bottom:10px">
        <div class="domain-box" style="padding:8px 10px"><div style="font-size:11px;color:var(--muted)">조회 법인</div><b style="font-size:15px">${fmt(filtered.length)}사</b></div>
        <div class="domain-box" style="padding:8px 10px"><div style="font-size:11px;color:var(--muted)">DART 공시매출</div><b style="font-size:15px;color:#059669">${fmt(dartCnt)}사</b></div>
        <div class="domain-box" style="padding:8px 10px"><div style="font-size:11px;color:var(--muted)">국민연금 추정매출</div><b style="font-size:15px;color:#4f46e5">${fmt(estCnt)}사</b></div>
        <div class="domain-box" style="padding:8px 10px"><div style="font-size:11px;color:var(--muted)">합산 매출 규모</div><b style="font-size:15px">${totalRevEok >= 10000 ? `${fmtDec(totalRevEok / 10000, 1)}조원` : `${fmt(Math.round(totalRevEok))}억원`}</b></div>
      </div>

      <div class="nx-filter-bar">
        <input id="fCorpQ" class="input nx-q-inp" value="${esc(S.corpQ)}" placeholder="🔍 기업명 · 대표자 · 사업자번호 · 주소 · 업종 검색" />
        <button id="btnCorpQuickAny" type="button" class="toggle-pill ${S.corpRevMin === 'any' ? 'on' : ''}">📊 매출보유</button>
        <button id="btnCorpQuickDart" type="button" class="toggle-pill ${S.corpRevMin === 'dart' ? 'on-emerald' : ''}">💰 공시만</button>
        <button id="btnCorpFilterToggle" type="button" class="btn btn-sm ${S.corpFilterOpen ? 'btn-primary' : ''}">
          🎛️ 상세조건${corpFilterCnt > 0 ? `<span class="nx-filter-badge">${corpFilterCnt}</span>` : ''} ${S.corpFilterOpen ? '▴' : '▾'}
        </button>
      </div>

      ${corpActiveTags.length ? `
        <div class="nx-active-pills">
          ${corpActiveTags.map(([k, lb]) => `<button type="button" class="nx-active-pill" data-clear-cf="${k}">${esc(lb)} <span>✕</span></button>`).join('')}
          <button type="button" class="toggle-pill" id="btnCorpResetPills" style="padding:2px 8px;font-size:11px">🔄 초기화</button>
        </div>` : ''}

      <div id="corpFilterPanelWrap" class="nx-filter-panel-wrap ${S.corpFilterOpen ? 'open' : ''}">
        <div class="nx-sheet-scrim" id="corpFilterScrim"></div>
        <div id="corpFilterPanel" class="gis-deck nx-collapsible-panel ${S.corpFilterOpen ? '' : 'collapsed'}" style="margin-bottom:10px">
          <div class="nx-sheet-head">
            <span>🎛️ 기업분석 검색 · 선택 조건</span>
            <button type="button" class="icon-btn" id="btnCorpFilterClose" style="padding:3px 9px">✕</button>
          </div>
          <div class="nx-sheet-body">
            <div class="nx-opt-grid-2">
              <label class="nx-opt-field">📍 지역 (시도)
                <select id="fCorpSd" class="select">
                  <option value="">전국 시도</option>
                  ${sidos.map((s) => `<option value="${s.sd}" ${S.corpSd === s.sd ? 'selected' : ''}>${esc(s.n)}</option>`).join('')}
                </select>
              </label>
              <label class="nx-opt-field">💰 매출 규모
                <select id="fCorpRev" class="select">
                  <option value="" ${S.corpRevMin === '' ? 'selected' : ''}>전체 매출</option>
                  <option value="dart" ${S.corpRevMin === 'dart' ? 'selected' : ''}>💰 DART 공시매출만</option>
                  <option value="any" ${S.corpRevMin === 'any' ? 'selected' : ''}>📊 공시+추정 매출 보유</option>
                  <option value="10" ${S.corpRevMin === '10' ? 'selected' : ''}>10억 이상</option>
                  <option value="50" ${S.corpRevMin === '50' ? 'selected' : ''}>50억 이상</option>
                  <option value="100" ${S.corpRevMin === '100' ? 'selected' : ''}>100억 이상</option>
                  <option value="500" ${S.corpRevMin === '500' ? 'selected' : ''}>500억 이상</option>
                  <option value="1000" ${S.corpRevMin === '1000' ? 'selected' : ''}>1,000억 이상</option>
                </select>
              </label>
              <label class="nx-opt-field">🏛️ 상장 / 시장 구분
                <select id="fCorpType" class="select">
                  <option value="">전체 시장</option>
                  ${corpTypes.map((c, idx) => `<option value="${idx}" ${S.corpType === String(idx) ? 'selected' : ''}>${esc(c)}</option>`).join('')}
                </select>
              </label>
              <label class="nx-opt-field">🏷️ 강소·인증 태그
                <select id="fCorpTag" class="select">
                  <option value="">전체 태그</option>
                  ${S.corpTags.map((t) => `<option value="${t.id}" ${S.corpTag === t.id ? 'selected' : ''}>${esc(t.label)} (${fmt(t.set.size)})</option>`).join('')}
                </select>
              </label>
              <label class="nx-opt-field">🧾 국세청 사업자상태
                <select id="fCorpStatus" class="select">
                  <option value="">국세청 전체</option>
                  <option value="1" ${S.corpStatus === '1' ? 'selected' : ''}>계속사업자</option>
                  <option value="2" ${S.corpStatus === '2' ? 'selected' : ''}>휴업자</option>
                  <option value="3" ${S.corpStatus === '3' ? 'selected' : ''}>폐업자</option>
                </select>
              </label>
              <label class="nx-opt-field">↕️ 정렬 기준
                <select id="fCorpSort" class="select">
                  <option value="rev" ${S.corpSort === 'rev' ? 'selected' : ''}>매출 높은순 (공시+추정)</option>
                  <option value="dartRev" ${S.corpSort === 'dartRev' ? 'selected' : ''}>DART 공시매출순</option>
                  <option value="emp" ${S.corpSort === 'emp' ? 'selected' : ''}>국민연금 인원순</option>
                  <option value="net" ${S.corpSort === 'net' ? 'selected' : ''}>최근 순증(채용)순</option>
                  <option value="est" ${S.corpSort === 'est' ? 'selected' : ''}>최근 설립순</option>
                </select>
              </label>
            </div>
          </div>
          <div class="nx-sheet-foot">
            <button type="button" class="btn btn-sm" id="btnCorpSheetReset" style="flex:1">🔄 초기화</button>
            <button type="button" class="btn btn-primary btn-sm" id="btnCorpSheetApply" style="flex:2">✅ ${fmt(filtered.length)}사 결과 보기</button>
          </div>
        </div>
      </div>

      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>기업명</th><th>시장</th><th>대표자</th><th>업종</th><th>매출액 (공시/추정)</th><th>국민연금(순증)</th><th>국세청</th><th>소재지</th>
            </tr>
          </thead>
          <tbody>
            ${pageRows.map((x) => {
              const ri = x.revInfo;
              const revHtml = ri.kind === 'dart'
                ? `<b style="color:#059669">${fmtRevEok(ri.won)}</b> <span style="font-size:10px;padding:1px 5px;border-radius:4px;background:rgba(16,185,129,.14);color:#047857;font-weight:700">공시</span>`
                : (ri.kind === 'est'
                  ? `<b style="color:#4f46e5" title="국민연금 ${fmt(ri.emp)}명 × 월 ${fmtDec(ri.wage / 1e4, 0)}만 × 12 × 업종배수 ${ri.mult}x">~${fmtRevEok(ri.won)}</b> <span style="font-size:10px;padding:1px 5px;border-radius:4px;background:rgba(79,70,229,.12);color:#4f46e5;font-weight:700">추정</span>`
                  : '<span style="color:var(--muted)">-</span>');
              const emp = x.enr?.[12] || x.enr?.[9] || 0;
              const net = (x.enr?.[13] || 0) - (x.enr?.[14] || 0);
              return `
                <tr data-corp-idx="${x.i}">
                  <td><b>${esc(x.r[0])}</b>${x.r[3] ? ` <span class="mono" style="font-size:11px;color:var(--muted)">${esc(x.r[3])}</span>` : ''}</td>
                  <td><span class="tag ${x.r[5] <= 1 ? 'tag-corp' : 'tag-gray'}">${esc(corpTypes[x.r[5]] || '기타')}</span></td>
                  <td>${esc(x.r[4] || '-')}</td>
                  <td style="max-width:170px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(inds[x.r[12]] || '-')}</td>
                  <td style="white-space:nowrap">${revHtml}</td>
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
  const resetCorpAll = () => {
    S.corpQ = ''; S.corpSd = ''; S.corpRevMin = ''; S.corpType = ''; S.corpTag = ''; S.corpStatus = ''; S.corpPage = 1;
    if (window.innerWidth <= 820) S.corpFilterOpen = false;
    renderCorpTab();
  };
  const toggleCorpPanel = (forceVal) => {
    S.corpFilterOpen = typeof forceVal === 'boolean' ? forceVal : !S.corpFilterOpen;
    $('corpFilterPanelWrap')?.classList.toggle('open', S.corpFilterOpen);
    $('corpFilterPanel')?.classList.toggle('collapsed', !S.corpFilterOpen);
    const b = $('btnCorpFilterToggle');
    if (b) {
      b.classList.toggle('btn-primary', S.corpFilterOpen);
      b.innerHTML = b.innerHTML.replace(/[▴▾]/, S.corpFilterOpen ? '▴' : '▾');
    }
  };
  $('btnCorpFilterToggle')?.addEventListener('click', () => toggleCorpPanel());
  $('btnCorpFilterClose')?.addEventListener('click', () => toggleCorpPanel(false));
  $('corpFilterScrim')?.addEventListener('click', () => toggleCorpPanel(false));
  $('btnCorpSheetApply')?.addEventListener('click', () => toggleCorpPanel(false));
  $('btnCorpSheetReset')?.addEventListener('click', resetCorpAll);
  $('btnCorpResetPills')?.addEventListener('click', resetCorpAll);
  $('btnCorpQuickAny')?.addEventListener('click', () => { S.corpRevMin = S.corpRevMin === 'any' ? '' : 'any'; S.corpPage = 1; renderCorpTab(); });
  $('btnCorpQuickDart')?.addEventListener('click', () => { S.corpRevMin = S.corpRevMin === 'dart' ? '' : 'dart'; S.corpPage = 1; renderCorpTab(); });
  $('mainStage').querySelectorAll('[data-clear-cf]').forEach((b) => {
    b.addEventListener('click', () => {
      const k = b.dataset.clearCf;
      if (k === 'sd') S.corpSd = '';
      else if (k === 'rev') S.corpRevMin = '';
      else if (k === 'type') S.corpType = '';
      else if (k === 'tag') S.corpTag = '';
      else if (k === 'status') S.corpStatus = '';
      S.corpPage = 1;
      renderCorpTab();
    });
  });

  $('fCorpQ').addEventListener('input', (e) => { clearTimeout(timer); timer = setTimeout(() => { S.corpQ = e.target.value; S.corpPage = 1; renderCorpTab(); }, 220); });
  $('fCorpSd').addEventListener('change', (e) => { S.corpSd = e.target.value; S.corpPage = 1; renderCorpTab(); });
  $('fCorpRev').addEventListener('change', (e) => { S.corpRevMin = e.target.value; S.corpPage = 1; renderCorpTab(); });
  $('fCorpType').addEventListener('change', (e) => { S.corpType = e.target.value; S.corpPage = 1; renderCorpTab(); });
  $('fCorpTag').addEventListener('change', (e) => { S.corpTag = e.target.value; S.corpPage = 1; renderCorpTab(); });
  $('fCorpStatus').addEventListener('change', (e) => { S.corpStatus = e.target.value; S.corpPage = 1; renderCorpTab(); });
  $('fCorpSort').addEventListener('change', (e) => { S.corpSort = e.target.value; S.corpPage = 1; renderCorpTab(); });
  $('btnCorpReset').addEventListener('click', resetCorpAll);
  $('btnCorpCsv').addEventListener('click', () => {
    downloadCsv(
      `기업분석_${getTodayKstIso()}.csv`,
      ['기업명', '시장', '대표자', '사업자번호', '업종', '매출액(억)', '매출구분', '국민연금인원', '전화번호', '주소'],
      filtered.slice(0, 5000).map((x) => [
        x.r[0], corpTypes[x.r[5]] || '기타', x.r[4] || '', x.r[6] || '', inds[x.r[12]] || '',
        x.revInfo.won > 0 ? Number((x.revInfo.won / 1e8).toFixed(1)) : '', x.revInfo.label || '-',
        x.enr?.[12] || x.enr?.[9] || 0, x.r[8] || '', x.r[7] || '',
      ])
    );
    toast(`📥 기업분석 조건결과 ${fmt(Math.min(filtered.length, 5000))}사 CSV 다운로드 완료`);
  });
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
  const revInfo = resolveCorpRevenue(r, enr, inds);

  // 3-year DART revenue SVG bars OR NPS Payroll-Calibrated Estimated Revenue card
  let chartHtml = '<div style="font-size:12px;color:var(--muted)">DART 공시 및 국민연금 급여 데이터 미수록 법인</div>';
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
  } else if (revInfo.kind === 'est') {
    chartHtml = `
      <div class="domain-box" style="border-color:#c7d2fe;background:rgba(79,70,229,.05)">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
          <span style="font-size:12px;font-weight:800;color:#4f46e5">📊 국민연금 실급여 기반 추정 연매출</span>
          <b style="font-size:16px;color:#4f46e5">약 ${fmtRevEok(revInfo.won)}원</b>
        </div>
        <div style="font-size:11.5px;color:var(--muted);line-height:1.55">
          • 산출 근거: 국민연금 <b>${fmt(revInfo.emp)}명</b> × 월평균급여 <b>${fmtDec(revInfo.wage / 1e4, 0)}만원</b> × 12개월 (연 인건비 약 ${fmtRevEok(revInfo.payroll)}원) × 동종업계 DART 실측 배수 <b>${revInfo.mult}x</b><br/>
          • 비상장·비외감 법인의 영업 규모 가늠용 실측 보정 추정치입니다.
        </div>
      </div>`;
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

      <h4 style="margin:12px 0 6px;font-size:13px">📊 매출 분석 (${revInfo.kind === 'dart' ? 'DART 3개년 공시' : (revInfo.kind === 'est' ? '국민연금 실급여 추정' : '미수록')})</h4>
      ${chartHtml}

      ${enr ? `<div class="domain-box" style="margin-top:12px">
        <div class="domain-stat-row"><span>매출액 (${revInfo.label || '미수록'})</span><b style="color:${revInfo.kind === 'dart' ? '#059669' : '#4f46e5'}">${revInfo.won > 0 ? `${revInfo.kind === 'est' ? '~' : ''}${fmtRevEok(revInfo.won)}원` : '-'}${revInfo.won > 0 && (enr[12] || enr[9]) > 0 ? ` (1인당 ${fmtDec((revInfo.won / (enr[12] || enr[9])) / 1e8, 1)}억)` : ''}</b></div>
        <div class="domain-stat-row"><span>당기 영업이익 / 순이익</span><b>${enr[3] ? `${fmtDec(enr[3] / 1e8, 1)}억${enr[0] > 0 ? ` (${(enr[3] / enr[0] * 100).toFixed(1)}%)` : ''}` : '-'} / ${enr[6] ? fmtDec(enr[6] / 1e8, 1) + '억' : '-'}</b></div>
        <div class="domain-stat-row"><span>국민연금 가입자</span><b>${fmt(enr[12] || enr[9] || 0)}명 (신규 +${fmt(enr[13] || 0)} / 퇴사 -${fmt(enr[14] || 0)})</b></div>
        <div class="domain-stat-row"><span>추정 평균연봉 / 월급</span><b>${enr[10] ? fmtDec(enr[10] / 1e4, 0) + '만원' : (enr[15] ? `월 ${fmtDec(enr[15] / 1e4, 0)}만원 (연 ${fmtDec(enr[15] * 12 / 1e4, 0)}만원)` : '-')}</b></div>
      </div>` : ''}

      ${(() => {
        const revNow = revInfo.won || 0, revPrev = enr?.[1] || 0;
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
// TAB 3: 🎯 입찰 · 사전규격 · 건축인허가 · 조기포착 레이더 지도 + 건설사(12,198사)
// =========================================================================
const OPP_STAGE_META = {
  prespec: { label: '🔭 사전규격', color: '#7c3aed', tagCls: 'tag-corp', early: true },
  permit:  { label: '🏗️ 건축인허가', color: '#e11d48', tagCls: 'tag-re', early: true },
  newbuild:{ label: '🏠 신축분양', color: '#db2777', tagCls: 'tag-re', early: true },
  complex: { label: '🏘️ K-apt 단지', color: '#059669', tagCls: 'tag-sbiz', early: false },
  bid:     { label: '📢 입찰공고', color: '#d97706', tagCls: 'tag-bid', early: false },
};

function getTodayKstIso() {
  const d = new Date(Date.now() + 9 * 3600000);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}
function isTodayOpp(o, todayIso = getTodayKstIso()) {
  return String(o?.pubDate || '').slice(0, 10) === todayIso;
}
function todayTimeTag(o, todayIso = getTodayKstIso()) {
  if (!isTodayOpp(o, todayIso)) return '';
  const hhmm = String(o?.pubDateTime || '').slice(11, 16);
  return `<span class="tag tag-bid">📅 오늘${hhmm ? ' ' + hhmm : ''}</span>`;
}
function oppDateStr(o) {
  const pub = o?.pubDateTime || o?.pubDate || '-';
  const cls = o?.closeDate
    ? `${o.closeDate}${o.dday !== null && o.dday >= 0 ? ` (D-${o.dday})` : (o.dday !== null && o.dday < 0 ? ' (마감)' : '')}`
    : '-';
  return `📅 공고 ${pub} · ⏰ 마감 ${cls}`;
}
function isCancelledOpp(o) {
  return /취소/.test(o?.detail?.ntceKind || '') || /\(취소공고\)|\[취소공고\]/.test(o?.title || '');
}
function getMyBidKwList() {
  return String(S.bidMyKeywords || '').split(/[,\n/|]+/).map((x) => x.trim().toLowerCase()).filter(Boolean);
}
function matchesMyBidKeywords(o, kwList = getMyBidKwList()) {
  if (!kwList.length) return true;
  const hay = `${o.title || ''} ${o.org || ''} ${o.field || ''} ${o.detail?.categoryNm || ''}`.toLowerCase();
  return kwList.some((k) => hay.includes(k));
}

function getFilteredOpps() {
  const q = S.bidQ.trim().toLowerCase();
  const todayIso = getTodayKstIso();
  const kwList = S.bidMyKwOnly ? getMyBidKwList() : null;
  const res = S.opps.filter((o) => {
    if (S.bidMyBizOnly && !S.myBiz[o.id]) return false;
    if (S.bidHideCancelled && isCancelledOpp(o)) return false;
    if (kwList && !matchesMyBidKeywords(o, kwList)) return false;
    if (S.bidStage === 'early') {
      if (!OPP_STAGE_META[o.stageType]?.early) return false;
    } else if (S.bidStage && o.stageType !== S.bidStage) {
      return false;
    }
    if (S.bidField && o.field !== S.bidField) return false;
    if (S.bidSd && o._sd !== S.bidSd) return false;
    if (S.bidBudgetMin > 0 && (Number(o.budgetMan) || 0) < S.bidBudgetMin) return false;
    if (S.bidUrgency === 'todayBid' && !(o.stageType === 'bid' && isTodayOpp(o, todayIso))) return false;
    if (S.bidUrgency === 'today' && !isTodayOpp(o, todayIso)) return false;
    if (S.bidUrgency === 'd3' && !(o.dday !== null && o.dday >= 0 && o.dday <= 3)) return false;
    if (S.bidUrgency === 'd7' && !(o.dday !== null && o.dday >= 0 && o.dday <= 7)) return false;
    if (S.bidUrgency === 'live' && !o.isLive) return false;
    if (q && !`${o.title} ${o.org} ${o.region} ${o._regionFull || ''} ${o.source} ${o.field}`.toLowerCase().includes(q)) return false;
    return true;
  });
  if (S.bidUrgency === 'todayBid' || S.bidUrgency === 'today') {
    return res.sort((a, b) => String(b.pubDateTime || b.pubDate || '').localeCompare(String(a.pubDateTime || a.pubDate || '')) || b.icpScore - a.icpScore);
  }
  return res.sort((a, b) => (b.isLive ? 1 : 0) - (a.isLive ? 1 : 0) || b.icpScore - a.icpScore);
}

function renderBidTab() {
  if (S.bidSub !== 'map' && S.bidLeafletMap) {
    S.bidLeafletMap.remove();
    S.bidLeafletMap = null;
    S.bidLeafletLayer = null;
  }
  const todayIso = getTodayKstIso();
  const todayBidCnt = S.opps.filter((o) => o.stageType === 'bid' && isTodayOpp(o, todayIso)).length;
  const earlyCnt = S.opps.filter((o) => OPP_STAGE_META[o.stageType]?.early).length;
  const liveCnt = S.opps.filter((o) => o.isLive).length;
  const syncTxt = S.bidSync.syncing
    ? '🔄 카톡 알림봇 동일 소스(나라장터 입찰·사전규격·청약홈) 실시간 동기화 중…'
    : (S.bidSync.lastAt
      ? `🟢 카톡 알림봇 동일 소스 실시간 동기화 완료 (${S.bidSync.lastAt} · 당일 입찰 ${fmt(todayBidCnt)}건 · 실시간 ${fmt(liveCnt)}건 · 조기포착 ${fmt(earlyCnt)}건)`
      : `📡 볼트 스냅샷 로드됨 (자동 실시간 동기화 대기 중 · 조기포착 ${fmt(earlyCnt)}건)`);

  $('mainStage').innerHTML = `
    <div class="card">
      <div class="card-head">
        <div>
          <h2 class="card-title">🎯 공동주택 · 관공서 입찰 & 조기포착 레이더 PRO</h2>
          <p class="card-sub">카톡 알림봇 동일 실시간 소스(나라장터 02 · 사전규격 ao · 청약홈) + 국토부 건축인허가 · K-apt · 건설사 12,198사</p>
        </div>
        <div class="chips nx-swipe-chips">
          <button class="chip ${S.bidSub === 'map' ? 'active' : ''}" data-bid-sub="map">🗺️ 조기포착·입찰 지도 (${fmt(S.opps.length)})</button>
          <button class="chip ${S.bidSub === 'opps' ? 'active' : ''}" data-bid-sub="opps">📋 전체 리스트</button>
          <button class="chip ${S.bidSub === 'builders' ? 'active' : ''}" data-bid-sub="builders">🏗️ 건설·시설사 (${fmt(S.core.stats.builderCount)}사)</button>
        </div>
      </div>

      ${S.bidSub !== 'builders' ? `
        <div class="bid-sync-bar">
          <span>${syncTxt}</span>
          <div style="display:flex;gap:6px;flex-wrap:wrap">
            <button id="btnTodayBidOnly" class="btn btn-sm ${S.bidUrgency === 'todayBid' ? 'btn-emerald' : 'btn-primary'}" type="button">📅 당일 입찰만 (${fmt(todayBidCnt)}건)${S.bidUrgency === 'todayBid' ? ' ✓' : ''}</button>
            <button id="btnLiveG2b" class="btn btn-amber btn-sm" type="button" ${S.bidSync.syncing ? 'disabled' : ''}>🔄 지금 즉시 실시간 수집</button>
            <button id="btnBidCsv" class="btn btn-emerald btn-sm" type="button">📥 조건결과 CSV</button>
          </div>
        </div>
      ` : ''}

      <div id="bidBody"></div>
    </div>
  `;

  $('mainStage').querySelectorAll('[data-bid-sub]').forEach((b) => {
    b.addEventListener('click', () => { S.bidSub = b.dataset.bidSub; renderBidTab(); });
  });
  $('btnTodayBidOnly')?.addEventListener('click', () => {
    if (S.bidUrgency === 'todayBid') {
      S.bidUrgency = '';
      toast('📅 당일 입찰 필터 해제 (전체 기간 표시)');
    } else {
      S.bidStage = '';
      S.bidUrgency = 'todayBid';
      toast(`📅 오늘(${todayIso}) 등록 입찰공고만 표시합니다`);
    }
    S.bidPage = 1;
    renderBidTab();
  });
  $('btnLiveG2b')?.addEventListener('click', () => fetchLiveG2bAndPrespec({ silent: false }));
  $('btnBidCsv')?.addEventListener('click', () => {
    const list = getFilteredOpps();
    downloadCsv(
      `nexusone_bids_early_${new Date().toISOString().slice(0, 10)}.csv`,
      ['단계', '출처', '공고/현장명', '발주처/기관', '지역', '분야', '예산(만원)', 'ICP점수', '공고일', '마감일', '실시간여부', 'URL'],
      list.map((o) => [OPP_STAGE_META[o.stageType]?.label || o.stageType, o.source, o.title, o.org, o._regionFull || o.region, o.field, o.budgetMan || 0, o.icpScore, o.pubDate || '', o.closeDate || '', o.isLive ? 'LIVE' : 'VAULT', o.url || ''])
    );
    toast(`📥 조건 필터 결과 ${fmt(list.length)}건 CSV 다운로드 완료!`);
  });

  if (S.bidSub === 'map') renderBidMapWorkspace();
  else if (S.bidSub === 'opps') renderBidOppsBody();
  else renderBidBuildersBody();
}

function renderBidFilterDeckHtml() {
  const sidos = S.core.sido || [];
  const todayIso = getTodayKstIso();
  const kwList = getMyBidKwList();
  const activePool = S.bidHideCancelled ? S.opps.filter((o) => !isCancelledOpp(o)) : S.opps;
  const cnts = {
    all: activePool.length,
    early: activePool.filter((o) => OPP_STAGE_META[o.stageType]?.early).length,
    prespec: activePool.filter((o) => o.stageType === 'prespec').length,
    permit: activePool.filter((o) => o.stageType === 'permit').length,
    newbuild: activePool.filter((o) => o.stageType === 'newbuild').length,
    complex: activePool.filter((o) => o.stageType === 'complex').length,
    bid: activePool.filter((o) => o.stageType === 'bid').length,
    todayBid: activePool.filter((o) => o.stageType === 'bid' && isTodayOpp(o, todayIso)).length,
    todayAll: activePool.filter((o) => isTodayOpp(o, todayIso)).length,
    d3: activePool.filter((o) => o.dday !== null && o.dday >= 0 && o.dday <= 3).length,
    live: activePool.filter((o) => o.isLive).length,
    cancelled: S.opps.filter((o) => isCancelledOpp(o)).length,
    myKw: activePool.filter((o) => matchesMyBidKeywords(o, kwList)).length,
    myBiz: activePool.filter((o) => Boolean(S.myBiz[o.id])).length,
  };
  const activeTags = [];
  const stageLabels = { early: '⚡ 조기포착 전체', prespec: '🔭 사전규격', permit: '🏗️ 건축인허가', newbuild: '🏠 신축분양', complex: '🏘️ K-apt', bid: '📢 입찰공고' };
  const urgLabels = { todayBid: '📅 당일 입찰만', today: '🗓️ 당일 전체', d3: '🚨 D-3 긴급', d7: '⏰ D-7 이번주', live: '🟢 실시간' };
  if (S.bidStage) activeTags.push(['stage', stageLabels[S.bidStage] || S.bidStage]);
  if (S.bidUrgency) activeTags.push(['urg', urgLabels[S.bidUrgency] || S.bidUrgency]);
  if (S.bidMyKwOnly) activeTags.push(['myKw', '⭐ 내 키워드만']);
  if (S.bidMyBizOnly) activeTags.push(['myBiz', '📁 내서류함']);
  if (S.bidField) activeTags.push(['field', `분야: ${S.bidField}`]);
  if (S.bidBudgetMin > 0) activeTags.push(['budget', `💰 ${S.bidBudgetMin / 10000}억+`]);
  if (S.bidSd) activeTags.push(['sd', `📍 ${(sidos.find((x) => x.sd === S.bidSd)?.n || S.bidSd)}`]);
  const filterCnt = activeTags.length;

  return `
    <div class="nx-filter-bar">
      <input id="fBidQ" class="input nx-q-inp" value="${esc(S.bidQ)}" placeholder="🔍 공고명 · 발주처 · 지역 · CCTV 검색" />
      <button type="button" class="toggle-pill ${S.bidUrgency === 'todayBid' ? 'on-emerald' : ''}" id="btnBidQuickToday">📅 당일입찰 (${cnts.todayBid})</button>
      <button type="button" class="toggle-pill ${S.bidMyKwOnly ? 'on' : ''}" id="btnBidQuickKw">⭐ 키워드 (${cnts.myKw})</button>
      <button type="button" class="toggle-pill ${S.bidMyBizOnly ? 'on' : ''}" id="btnBidQuickBiz">📁 서류함 (${cnts.myBiz})</button>
      <button type="button" class="btn btn-sm ${S.bidFilterOpen ? 'btn-primary' : ''}" id="btnBidFilterToggle">
        🎛️ 단계·상세필터${filterCnt > 0 ? `<span class="nx-filter-badge">${filterCnt}</span>` : ''} ${S.bidFilterOpen ? '▴' : '▾'}
      </button>
      ${S.bidSub === 'map' ? `<button type="button" class="btn btn-sm ${S.bidMapOptOpen ? 'btn-primary' : ''}" id="btnBidMapOptToggle">🗺️ 지도옵션 ${S.bidMapOptOpen ? '▴' : '▾'}</button>` : ''}
    </div>

    ${activeTags.length ? `
      <div class="nx-active-pills">
        ${activeTags.map(([k, lb]) => `<button type="button" class="nx-active-pill" data-clear-bf="${k}">${esc(lb)} <span>✕</span></button>`).join('')}
        <button type="button" class="toggle-pill" id="btnBidResetAll" style="padding:2px 8px;font-size:11px">🔄 전체 초기화</button>
      </div>` : ''}

    <div id="bidFilterPanelWrap" class="nx-filter-panel-wrap ${S.bidFilterOpen ? 'open' : ''}">
      <div class="nx-sheet-scrim" id="bidFilterScrim"></div>
      <div class="gis-deck nx-collapsible-panel ${S.bidFilterOpen ? '' : 'collapsed'}" id="bidFilterPanel" style="margin-bottom:10px">
        <div class="nx-sheet-head">
          <span>🎛️ 조기포착 단계 · 상세 필터</span>
          <button type="button" class="icon-btn" id="btnBidFilterClose" style="padding:3px 9px">✕</button>
        </div>
        <div class="nx-sheet-body">
          <div class="gis-row">
            <span class="gis-label">🎯 조기포착·단계:</span>
            ${[
              ['', `전체 (${cnts.all})`],
              ['early', `⚡ 조기포착 전체 (${cnts.early})`],
              ['prespec', `🔭 사전규격 (${cnts.prespec})`],
              ['permit', `🏗️ 건축인허가 (${cnts.permit})`],
              ['newbuild', `🏠 신축분양 (${cnts.newbuild})`],
              ['complex', `🏘️ K-apt (${cnts.complex})`],
              ['bid', `📢 입찰공고 (${cnts.bid})`],
            ].map(([k, lb]) => `<button class="toggle-pill ${S.bidStage === k ? 'on' : ''}" data-bid-st="${k}" type="button">${lb}</button>`).join('')}
          </div>
          <div class="gis-row">
            <span class="gis-label">🚨 당일·긴급·실시간:</span>
            ${[
              ['', '전체'],
              ['todayBid', `📅 당일 입찰만 (${cnts.todayBid})`],
              ['today', `🗓️ 당일 전체 (${cnts.todayAll})`],
              ['d3', `🚨 D-3 긴급 (${cnts.d3})`],
              ['d7', '⏰ D-7 이번주'],
              ['live', `🟢 카톡동일 실시간 (${cnts.live})`],
            ].map(([k, lb]) => `<button class="toggle-pill ${S.bidUrgency === k ? 'on-emerald' : ''}" data-bid-urg="${k}" type="button">${lb}</button>`).join('')}
            <button id="btnBidMyKw" class="toggle-pill ${S.bidMyKwOnly ? 'on' : ''}" type="button" title="관심 키워드: ${esc(S.bidMyKeywords)}">⭐ 내 키워드만 (${cnts.myKw})</button>
            <button id="btnBidEditKw" class="toggle-pill" type="button" title="관심 키워드 편집">⚙️ 키워드</button>
            <button id="btnBidMyBiz" class="toggle-pill ${S.bidMyBizOnly ? 'on' : ''}" type="button" title="내서류함(투찰관리) 저장 공고만 보기">📁 내서류함 (${cnts.myBiz})</button>
            <button id="btnBidHideCancel" class="toggle-pill ${S.bidHideCancelled ? 'on-emerald' : ''}" type="button">🚫 취소공고 제외 (${cnts.cancelled})</button>
            <select id="fBidField" class="select" style="padding:5px 8px;font-size:12px">
              <option value="">전체 분야</option>
              ${['보안·CCTV', 'AI·스마트', '시설·경비·미화', '전기·통신·소방', '건축·리모델링', '승강기·설비'].map((f) => `<option value="${f}" ${S.bidField === f ? 'selected' : ''}>${f}</option>`).join('')}
            </select>
            <select id="fBidBudget" class="select" style="padding:5px 8px;font-size:12px">
              <option value="0" ${S.bidBudgetMin === 0 ? 'selected' : ''}>전체 예산</option>
              <option value="10000" ${S.bidBudgetMin === 10000 ? 'selected' : ''}>💰 1억 이상</option>
              <option value="50000" ${S.bidBudgetMin === 50000 ? 'selected' : ''}>💎 5억 이상</option>
              <option value="100000" ${S.bidBudgetMin === 100000 ? 'selected' : ''}>🏆 10억 이상</option>
            </select>
            <select id="fBidSd" class="select" style="padding:5px 8px;font-size:12px">
              <option value="">전국 시도</option>
              ${sidos.map((s) => `<option value="${s.sd}" ${S.bidSd === s.sd ? 'selected' : ''}>${esc(s.n)}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="nx-sheet-foot">
          <button type="button" class="btn btn-sm" id="btnBidSheetReset" style="flex:1">🔄 초기화</button>
          <button type="button" class="btn btn-primary btn-sm" id="btnBidSheetApply" style="flex:2">✅ 적용하고 보기</button>
        </div>
      </div>
    </div>
  `;
}

function wireBidFilterControls(onUpdate) {
  let t = null;
  const rerenderDeckAndUpdate = () => {
    if (S.bidSub === 'map') renderBidMapWorkspace();
    else renderBidOppsBody();
  };
  const closeFilterSheet = () => {
    S.bidFilterOpen = false;
    $('bidFilterPanelWrap')?.classList.remove('open');
    $('bidFilterPanel')?.classList.add('collapsed');
    const b = $('btnBidFilterToggle');
    if (b) { b.classList.remove('btn-primary'); b.innerHTML = b.innerHTML.replace('▴', '▾'); }
  };
  const resetAllFilters = () => {
    S.bidStage = ''; S.bidUrgency = ''; S.bidMyKwOnly = false; S.bidMyBizOnly = false;
    S.bidField = ''; S.bidBudgetMin = 0; S.bidSd = ''; S.bidQ = ''; S.bidPage = 1;
    if (window.innerWidth <= 820) S.bidFilterOpen = false;
    toast('🔄 입찰 필터가 초기화되었습니다.');
    rerenderDeckAndUpdate();
  };

  $('btnBidFilterToggle')?.addEventListener('click', () => {
    S.bidFilterOpen = !S.bidFilterOpen;
    $('bidFilterPanelWrap')?.classList.toggle('open', S.bidFilterOpen);
    $('bidFilterPanel')?.classList.toggle('collapsed', !S.bidFilterOpen);
    const b = $('btnBidFilterToggle');
    if (b) {
      b.classList.toggle('btn-primary', S.bidFilterOpen);
      b.innerHTML = b.innerHTML.replace(/[▴▾]/, S.bidFilterOpen ? '▴' : '▾');
    }
  });
  $('btnBidFilterClose')?.addEventListener('click', closeFilterSheet);
  $('bidFilterScrim')?.addEventListener('click', closeFilterSheet);
  $('btnBidSheetApply')?.addEventListener('click', () => { closeFilterSheet(); rerenderDeckAndUpdate(); });
  $('btnBidSheetReset')?.addEventListener('click', resetAllFilters);
  $('btnBidResetAll')?.addEventListener('click', resetAllFilters);

  const toggleBidMapOpt = (forceVal) => {
    S.bidMapOptOpen = typeof forceVal === 'boolean' ? forceVal : !S.bidMapOptOpen;
    $('bidMapOptPanelWrap')?.classList.toggle('open', S.bidMapOptOpen);
    $('bidMapOptDeck')?.classList.toggle('collapsed', !S.bidMapOptOpen);
    const b = $('btnBidMapOptToggle');
    if (b) {
      b.classList.toggle('btn-primary', S.bidMapOptOpen);
      b.textContent = `🗺️ 지도옵션 ${S.bidMapOptOpen ? '▴' : '▾'}`;
    }
  };
  $('btnBidMapOptToggle')?.addEventListener('click', () => toggleBidMapOpt());
  $('btnBidMapOptClose')?.addEventListener('click', () => toggleBidMapOpt(false));
  $('bidMapOptScrim')?.addEventListener('click', () => toggleBidMapOpt(false));
  $('btnBidMapOptDone')?.addEventListener('click', () => toggleBidMapOpt(false));

  $('btnBidQuickToday')?.addEventListener('click', () => {
    S.bidUrgency = S.bidUrgency === 'todayBid' ? '' : 'todayBid';
    if (S.bidUrgency === 'todayBid' && S.bidStage && S.bidStage !== 'bid') S.bidStage = '';
    S.bidPage = 1;
    rerenderDeckAndUpdate();
  });
  $('btnBidQuickKw')?.addEventListener('click', () => {
    S.bidMyKwOnly = !S.bidMyKwOnly;
    S.bidPage = 1;
    toast(S.bidMyKwOnly ? `⭐ 내 관심 키워드 필터 ON` : '⭐ 내 관심 키워드 필터 해제');
    rerenderDeckAndUpdate();
  });
  $('btnBidQuickBiz')?.addEventListener('click', () => {
    S.bidMyBizOnly = !S.bidMyBizOnly;
    S.bidPage = 1;
    toast(S.bidMyBizOnly ? `📁 내서류함 저장 공고만 표시 (${Object.keys(S.myBiz).length}건)` : '📁 내서류함 필터 해제');
    rerenderDeckAndUpdate();
  });
  $('bidBody').querySelectorAll('[data-clear-bf]').forEach((b) => {
    b.addEventListener('click', () => {
      const k = b.dataset.clearBf;
      if (k === 'stage') S.bidStage = '';
      else if (k === 'urg') S.bidUrgency = '';
      else if (k === 'myKw') S.bidMyKwOnly = false;
      else if (k === 'myBiz') S.bidMyBizOnly = false;
      else if (k === 'field') S.bidField = '';
      else if (k === 'budget') S.bidBudgetMin = 0;
      else if (k === 'sd') S.bidSd = '';
      S.bidPage = 1;
      rerenderDeckAndUpdate();
    });
  });

  $('fBidQ')?.addEventListener('input', (e) => { clearTimeout(t); t = setTimeout(() => { S.bidQ = e.target.value; S.bidPage = 1; onUpdate(); }, 180); });
  $('fBidField')?.addEventListener('change', (e) => { S.bidField = e.target.value; S.bidPage = 1; onUpdate(); });
  $('fBidBudget')?.addEventListener('change', (e) => { S.bidBudgetMin = Number(e.target.value) || 0; S.bidPage = 1; onUpdate(); });
  $('fBidSd')?.addEventListener('change', (e) => { S.bidSd = e.target.value; S.bidPage = 1; onUpdate(); });
  $('bidBody').querySelectorAll('[data-bid-st]').forEach((b) => {
    b.addEventListener('click', () => {
      S.bidStage = b.dataset.bidSt;
      S.bidPage = 1;
      $('bidBody').querySelectorAll('[data-bid-st]').forEach((x) => x.classList.toggle('on', x.dataset.bidSt === S.bidStage));
      onUpdate();
    });
  });
  $('btnBidMyKw')?.addEventListener('click', () => {
    S.bidMyKwOnly = !S.bidMyKwOnly;
    S.bidPage = 1;
    $('btnBidMyKw')?.classList.toggle('on', S.bidMyKwOnly);
    $('btnBidQuickKw')?.classList.toggle('on', S.bidMyKwOnly);
    toast(S.bidMyKwOnly ? `⭐ 내 관심 키워드 필터 ON (${getMyBidKwList().join(', ')})` : '⭐ 내 관심 키워드 필터 해제');
    onUpdate();
  });
  $('btnBidEditKw')?.addEventListener('click', () => {
    const next = prompt('내 관심 입찰 키워드를 쉼표(,)로 구분해 입력하세요:', S.bidMyKeywords);
    if (next === null) return;
    S.bidMyKeywords = next.trim() || 'CCTV,관제,보안,소방,승강기,시설,경비,미화,전기,통신,보험';
    try { localStorage.setItem('nx1_bid_my_kw_v1', S.bidMyKeywords); } catch {}
    S.bidMyKwOnly = true;
    S.bidPage = 1;
    toast(`✅ 내 관심 키워드 저장 완료 (${getMyBidKwList().length}개)`);
    renderBidTab();
  });
  $('btnBidHideCancel')?.addEventListener('click', () => {
    S.bidHideCancelled = !S.bidHideCancelled;
    S.bidPage = 1;
    toast(S.bidHideCancelled ? '🚫 취소공고 자동 숨김 ON' : '👁️ 취소공고 포함 전체 표시');
    renderBidTab();
  });
  $('btnBidMyBiz')?.addEventListener('click', () => {
    S.bidMyBizOnly = !S.bidMyBizOnly;
    S.bidPage = 1;
    $('btnBidMyBiz')?.classList.toggle('on', S.bidMyBizOnly);
    $('btnBidQuickBiz')?.classList.toggle('on', S.bidMyBizOnly);
    toast(S.bidMyBizOnly ? `📁 내서류함 저장 공고만 표시 (${Object.keys(S.myBiz).length}건)` : '📁 내서류함 필터 해제');
    onUpdate();
  });
  $('bidBody').querySelectorAll('[data-bid-urg]').forEach((b) => {
    b.addEventListener('click', () => {
      S.bidUrgency = b.dataset.bidUrg;
      if (S.bidUrgency === 'todayBid' && S.bidStage && S.bidStage !== 'bid') {
        S.bidStage = '';
        $('bidBody').querySelectorAll('[data-bid-st]').forEach((x) => x.classList.toggle('on', x.dataset.bidSt === S.bidStage));
      }
      S.bidPage = 1;
      $('bidBody').querySelectorAll('[data-bid-urg]').forEach((x) => x.classList.toggle('on-emerald', x.dataset.bidUrg === S.bidUrgency));
      $('btnBidQuickToday')?.classList.toggle('on-emerald', S.bidUrgency === 'todayBid');
      const topBtn = $('btnTodayBidOnly');
      if (topBtn) {
        topBtn.classList.toggle('btn-emerald', S.bidUrgency === 'todayBid');
        topBtn.classList.toggle('btn-primary', S.bidUrgency !== 'todayBid');
      }
      onUpdate();
    });
  });
}

function renderBidMapWorkspace() {
  $('bidBody').innerHTML = `
    ${renderBidFilterDeckHtml()}

    <div id="bidMapOptPanelWrap" class="nx-filter-panel-wrap ${S.bidMapOptOpen ? 'open' : ''}">
      <div class="nx-sheet-scrim" id="bidMapOptScrim"></div>
      <div id="bidMapOptDeck" class="gis-deck nx-collapsible-panel ${S.bidMapOptOpen ? '' : 'collapsed'}" style="margin-bottom:10px;padding:7px 11px">
        <div class="nx-sheet-head">
          <span>🗺️ 입찰 레이더 지도 · 지적도 옵션</span>
          <button type="button" class="icon-btn" id="btnBidMapOptClose" style="padding:3px 9px">✕</button>
        </div>
        <div class="nx-sheet-body">
          <div class="gis-row">
            <span class="gis-label">🗺️ 레이더 지도:</span>
            ${[
              ['vbase', '브이월드 기본'],
              ['vhyb', '🛰️ 위성+도로'],
              ['vmidnight', '🌙 다크'],
              ['osm', 'OSM'],
            ].map(([k, lb]) => `<button class="toggle-pill ${S.bidMapBase === k ? 'on' : ''}" data-bm-base="${k}" type="button">${lb}</button>`).join('')}
            <button class="toggle-pill ${S.bidWms.cadastral ? 'on-emerald' : ''}" data-bm-wms="cadastral" type="button">📐 연속지적도</button>
            <button class="toggle-pill ${S.bidWms.zoning ? 'on-emerald' : ''}" data-bm-wms="zoning" type="button">🏙️ 용도지역</button>
            <span class="gis-label" style="margin-left:6px">표시:</span>
            <button class="toggle-pill ${S.bidMapMode === 'cluster' ? 'on' : ''}" data-bm-mode="cluster" type="button">🔵 시군구 집계</button>
            <button class="toggle-pill ${S.bidMapMode === 'pins' ? 'on' : ''}" data-bm-mode="pins" type="button">📍 개별 공고핀</button>
            <button id="btnBidMapFit" class="btn btn-sm" style="margin-left:auto" type="button">🎯 결과 맞춤</button>
          </div>
        </div>
        <div class="nx-sheet-foot">
          <button type="button" class="btn btn-primary btn-sm" id="btnBidMapOptDone" style="flex:1">✅ 지도 옵션 적용</button>
        </div>
      </div>
    </div>

    <div class="bid-workspace">
      <div>
        <div id="bidLeafletBox" class="leaflet-box"></div>
        <div class="marker-legend">
          <span class="gis-label">범례:</span>
          <span class="ml-item"><span class="ml-dot" style="background:#7c3aed"></span>🔭 사전규격(조기포착)</span>
          <span class="ml-item"><span class="ml-dot" style="background:#e11d48"></span>🏗️ 건축인허가·신축분양</span>
          <span class="ml-item"><span class="ml-dot" style="background:#059669"></span>🏘️ K-apt 단지</span>
          <span class="ml-item"><span class="ml-dot" style="background:#d97706"></span>📢 입찰공고 (빨간테=D-3긴급)</span>
          <span id="bidMapStat" style="margin-left:auto;color:var(--muted);font-weight:700"></span>
        </div>
      </div>

      <div class="bid-side-list">
        <div class="card-head" style="padding:10px 12px;margin:0;border-bottom:1px solid var(--border)">
          <h3 class="card-title" style="font-size:14px">📡 조건 매칭 공고 <span id="bidMatchCnt" class="tag tag-bid">0건</span></h3>
          <span style="font-size:11px;color:var(--muted)">클릭 시 지도 이동 · 상세보기</span>
        </div>
        <div id="bidSideScroll" class="bid-side-scroll"></div>
      </div>
    </div>
  `;

  initBidLeaflet();
  wireBidFilterControls(updateBidMapAndList);

  $('bidBody').querySelectorAll('[data-bm-base]').forEach((b) => {
    b.addEventListener('click', () => {
      S.bidMapBase = b.dataset.bmBase;
      $('bidBody').querySelectorAll('[data-bm-base]').forEach((x) => x.classList.toggle('on', x.dataset.bmBase === S.bidMapBase));
      applyBidBaseMap();
    });
  });
  $('bidBody').querySelectorAll('[data-bm-wms]').forEach((b) => {
    b.addEventListener('click', () => {
      const k = b.dataset.bmWms;
      S.bidWms[k] = !S.bidWms[k];
      b.classList.toggle('on-emerald', S.bidWms[k]);
      applyBidWms();
    });
  });
  $('bidBody').querySelectorAll('[data-bm-mode]').forEach((b) => {
    b.addEventListener('click', () => {
      S.bidMapMode = b.dataset.bmMode;
      $('bidBody').querySelectorAll('[data-bm-mode]').forEach((x) => x.classList.toggle('on', x.dataset.bmMode === S.bidMapMode));
      updateBidMapAndList(false);
    });
  });
  $('btnBidMapFit').addEventListener('click', () => updateBidMapAndList(true));

  updateBidMapAndList(true);
}

function initBidLeaflet() {
  const el = $('bidLeafletBox');
  if (!el || typeof L === 'undefined') return;
  if (S.bidLeafletMap) { S.bidLeafletMap.remove(); S.bidLeafletMap = null; }
  S.bidLeafletWms = {};
  S.bidLeafletMap = L.map(el, { preferCanvas: true }).setView([36.85, 127.4], 7);
  applyBidBaseMap();
  S.bidLeafletLayer = L.layerGroup().addTo(S.bidLeafletMap);
  applyBidWms();
}

function applyBidBaseMap() {
  if (!S.bidLeafletMap) return;
  if (S.bidLeafletTile) { S.bidLeafletMap.removeLayer(S.bidLeafletTile); S.bidLeafletTile = null; }
  if (S.bidLeafletHybrid) { S.bidLeafletMap.removeLayer(S.bidLeafletHybrid); S.bidLeafletHybrid = null; }
  const { vworld } = getApiKeys();
  const mode = S.bidMapBase;
  if (mode === 'osm' || !vworld) {
    S.bidLeafletTile = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(S.bidLeafletMap);
    return;
  }
  const vw = (t, ext = 'png', maxN = 19) => L.tileLayer(`https://api.vworld.kr/req/wmts/1.0.0/${encodeURIComponent(vworld)}/${t}/{z}/{y}/{x}.${ext}`, { maxZoom: 20, maxNativeZoom: maxN, attribution: '© VWorld 국토교통부' });
  if (mode === 'vhyb') {
    S.bidLeafletTile = vw('Satellite', 'jpeg', 19).addTo(S.bidLeafletMap);
    S.bidLeafletHybrid = vw('Hybrid', 'png', 19).setZIndex(260).addTo(S.bidLeafletMap);
  } else if (mode === 'vmidnight') {
    S.bidLeafletTile = vw('midnight', 'png', 18).addTo(S.bidLeafletMap);
  } else {
    S.bidLeafletTile = vw('Base', 'png', 19).addTo(S.bidLeafletMap);
  }
}

function applyBidWms() {
  if (!S.bidLeafletMap) return;
  const { vworld } = getApiKeys();
  const isLocal = /^(127\.0\.0\.1|localhost)$/.test(location.hostname);
  const dom = (!isLocal && location.origin && /^https?:/.test(location.origin)) ? location.origin : 'https://heebonpark.github.io';
  for (const k of ['cadastral', 'zoning']) {
    const cfg = VWORLD_WMS_CFG[k];
    if (S.bidWms[k] && vworld) {
      if (!S.bidLeafletWms[k]) {
        S.bidLeafletWms[k] = L.tileLayer.wms('https://api.vworld.kr/req/wms', {
          layers: cfg.layers, styles: cfg.styles, format: 'image/png', transparent: true,
          version: '1.3.0', key: vworld, domain: dom, opacity: cfg.opacity, maxZoom: 20, minZoom: cfg.minZoom, zIndex: 250,
        }).addTo(S.bidLeafletMap);
      }
    } else if (S.bidLeafletWms[k]) {
      S.bidLeafletMap.removeLayer(S.bidLeafletWms[k]);
      delete S.bidLeafletWms[k];
    }
  }
}

function buildOppMapPopup(o) {
  const sm = OPP_STAGE_META[o.stageType] || OPP_STAGE_META.bid;
  return `
    <div style="min-width:240px;max-width:300px;line-height:1.45;font-size:12px">
      <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:4px">
        <span style="padding:1px 6px;border-radius:5px;background:${sm.color};color:#fff;font-size:10.5px;font-weight:800">${sm.label}</span>
        <span style="padding:1px 6px;border-radius:5px;background:#ecfdf5;color:#047857;font-size:10.5px;font-weight:800">ICP ${o.icpScore}점</span>
        ${o.isLive ? '<span style="padding:1px 6px;border-radius:5px;background:#dbeafe;color:#1d4ed8;font-size:10.5px;font-weight:800">🟢실시간</span>' : ''}
        ${o.dday !== null && o.dday >= 0 && o.dday <= 3 ? `<span style="padding:1px 6px;border-radius:5px;background:#ffe4e6;color:#be123c;font-size:10.5px;font-weight:800">🚨D-${o.dday}</span>` : ''}
      </div>
      <div style="font-weight:800;font-size:13px;color:#0f172a;margin-bottom:4px">${esc(o.title)}</div>
      <div style="font-size:11.5px;color:#475569">🏛️ ${esc(o.org || '-')}</div>
      <div style="font-size:11.5px;color:#475569">📍 ${esc(o._regionFull || o.region || '전국')} · 💰 <b>${o.budgetMan > 0 ? fmtDec(o.budgetMan / 10000, 1) + '억' : '미기재'}</b></div>
      <div style="font-size:11px;color:#1e293b;font-weight:700;margin-top:2px">${esc(oppDateStr(o))}</div>
      <div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:8px">
        <button type="button" onclick="window._nxOpenOpp('${esc(o.id)}')" style="padding:4px 8px;border:none;border-radius:6px;background:#4f46e5;color:#fff;font-size:11px;font-weight:700;cursor:pointer">📄 상세·공략</button>
        <button type="button" onclick="window._nxPipeOpp('${esc(o.id)}')" style="padding:4px 8px;border:1px solid #059669;border-radius:6px;background:#ecfdf5;color:#047857;font-size:11px;font-weight:700;cursor:pointer">💼 CRM</button>
        ${o.url ? `<a href="${esc(o.url)}" target="_blank" rel="noopener" style="padding:4px 8px;border:1px solid #cbd5e1;border-radius:6px;background:#fff;color:#0f172a;font-size:11px;font-weight:700;text-decoration:none">🔗 원문</a>` : ''}
      </div>
    </div>
  `;
}

function updateBidMapAndList(fitBounds = false) {
  const list = getFilteredOpps();
  const mapped = list.filter((o) => o.lat && o.lon);
  const unmappedCnt = list.length - mapped.length;

  const cntEl = $('bidMatchCnt');
  if (cntEl) cntEl.textContent = `${fmt(list.length)}건`;
  const statEl = $('bidMapStat');
  if (statEl) statEl.textContent = `지도 표시 ${fmt(mapped.length)}건${unmappedCnt ? ` (전국/미지정 ${unmappedCnt}건)` : ''}`;

  // Plot on Leaflet Map
  if (S.bidLeafletMap && S.bidLeafletLayer) {
    S.bidLeafletLayer.clearLayers();
    const bounds = [];

    if (S.bidMapMode === 'cluster') {
      // Group by sigungu rid
      const byRid = new Map();
      for (const o of mapped) {
        const rid = o._fusionRid >= 0 ? o._fusionRid : -1;
        let g = byRid.get(rid);
        if (!g) {
          const [la, lo] = rid >= 0 ? regionCentroidLatLon(rid) : [o.lat, o.lon];
          const reg = S.fusionByRid.get(rid);
          g = { rid, name: reg?.fullName || o.region || '전국', lat: la, lon: lo, items: [], earlyCnt: 0, urgentCnt: 0, liveCnt: 0 };
          byRid.set(rid, g);
        }
        g.items.push(o);
        if (OPP_STAGE_META[o.stageType]?.early) g.earlyCnt++;
        if (o.dday !== null && o.dday >= 0 && o.dday <= 3) g.urgentCnt++;
        if (o.isLive) g.liveCnt++;
      }

      for (const g of byRid.values()) {
        bounds.push([g.lat, g.lon]);
        const cnt = g.items.length;
        const size = cnt >= 40 ? 36 : cnt >= 15 ? 31 : cnt >= 5 ? 26 : 22;
        const bg = g.earlyCnt > 0 ? '#7c3aed' : (g.items[0].stageType === 'complex' ? '#059669' : '#d97706');
        const ringCls = g.urgentCnt > 0 ? 'urgent-ring' : (g.earlyCnt > 0 ? 'early-ring' : '');
        const icon = L.divIcon({
          className: '',
          html: `<div class="nx-bid-pin ${ringCls}" style="width:${size}px;height:${size}px;background:${bg}">${cnt > 99 ? '99+' : cnt}</div>`,
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        });
        const mk = L.marker([g.lat, g.lon], { icon });
        mk.bindTooltip(`<b>${esc(g.name)}</b> · 총 ${cnt}건 (조기포착 ${g.earlyCnt}${g.urgentCnt ? ` · 🚨D-3 ${g.urgentCnt}` : ''})`, { direction: 'top', offset: [0, -size / 2] });
        mk.bindPopup(() => {
          const cPre = g.items.filter((x) => x.stageType === 'prespec').length;
          const cPer = g.items.filter((x) => x.stageType === 'permit').length;
          const cNb = g.items.filter((x) => x.stageType === 'newbuild').length;
          const cKap = g.items.filter((x) => x.stageType === 'complex').length;
          const cBid = g.items.filter((x) => x.stageType === 'bid').length;
          return `<div style="min-width:265px;max-width:320px;font-size:12px">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
              <b style="font-size:13.5px">📍 ${esc(g.name)}</b>
              <span style="padding:2px 7px;border-radius:999px;background:#7c3aed;color:#fff;font-size:11px;font-weight:800">${cnt}건</span>
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:6px;font-size:10.5px;font-weight:700">
              ${cPre ? `<span style="padding:1px 6px;border-radius:4px;background:#ede9fe;color:#6d28d9">🔭사전 ${cPre}</span>` : ''}
              ${cPer ? `<span style="padding:1px 6px;border-radius:4px;background:#ffe4e6;color:#be123c">🏗️인허가 ${cPer}</span>` : ''}
              ${cNb ? `<span style="padding:1px 6px;border-radius:4px;background:#fce7f3;color:#be185d">🏠신축 ${cNb}</span>` : ''}
              ${cKap ? `<span style="padding:1px 6px;border-radius:4px;background:#d1fae5;color:#047857">🏘️K-apt ${cKap}</span>` : ''}
              ${cBid ? `<span style="padding:1px 6px;border-radius:4px;background:#fef3c7;color:#b45309">📢입찰 ${cBid}</span>` : ''}
            </div>
            <div class="nx-pop-list">
              ${g.items.slice(0, 25).map((it) => {
                const sm = OPP_STAGE_META[it.stageType] || OPP_STAGE_META.bid;
                return `<div class="nx-pop-row" style="cursor:pointer" onclick="window._nxOpenOpp('${esc(it.id)}')">
                  <div style="min-width:0">
                    <div style="font-weight:700;font-size:11.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(it.title)}</div>
                    <div style="font-size:10.5px;color:#64748b"><span style="color:${sm.color};font-weight:700">${sm.label}</span> · ${esc(it.org || '-')} · ${it.budgetMan > 0 ? fmtDec(it.budgetMan / 10000, 1) + '억' : '미기재'}</div>
                    <div style="font-size:10px;color:#334155;font-weight:600;margin-top:1px">${esc(oppDateStr(it))}</div>
                  </div>
                </div>`;
              }).join('')}
            </div>
            <button type="button" onclick="window._nxZoomBidPins(${g.lat},${g.lon},'${esc(g.name.split(' ').pop() || '')}')" style="width:100%;margin-top:6px;padding:5px 8px;border:none;border-radius:7px;background:#4f46e5;color:#fff;font-size:11.5px;font-weight:700;cursor:pointer">🔍 이 지역 개별 핀 확대 보기</button>
          </div>`;
        }, { maxWidth: 330 });
        mk.addTo(S.bidLeafletLayer);
      }
    } else {
      // Individual colored pins by stage
      for (const o of mapped.slice(0, 800)) {
        bounds.push([o.lat, o.lon]);
        const sm = OPP_STAGE_META[o.stageType] || OPP_STAGE_META.bid;
        const isUrgent = o.dday !== null && o.dday >= 0 && o.dday <= 3;
        const mk = L.circleMarker([o.lat, o.lon], {
          radius: sm.early || isUrgent ? 7 : 5.5,
          color: isUrgent ? '#ef4444' : '#ffffff',
          fillColor: sm.color,
          fillOpacity: 0.92,
          weight: isUrgent ? 2.6 : 1.6,
        });
        mk.bindTooltip(`<b>${sm.label} ${esc(o.title)}</b><br><span style="font-size:11px">${esc(oppDateStr(o))}</span>`, { direction: 'top', offset: [0, -7] });
        mk.bindPopup(() => buildOppMapPopup(o), { maxWidth: 320 });
        mk.addTo(S.bidLeafletLayer);
      }
    }

    if (fitBounds && bounds.length) {
      S.bidLeafletMap.fitBounds(bounds, { maxZoom: 13, padding: [26, 26] });
    }
  }

  // Right-hand synchronized list
  const scroll = $('bidSideScroll');
  if (!scroll) return;
  const todayIso = getTodayKstIso();
  scroll.innerHTML = list.slice(0, 80).map((o) => {
    const sm = OPP_STAGE_META[o.stageType] || OPP_STAGE_META.bid;
    return `
      <div class="item-card" style="padding:10px 11px" data-map-opp="${esc(o.id)}">
        <div class="item-card-main">
          <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:4px">
            <span class="tag ${sm.tagCls}">${sm.label}</span>
            ${todayTimeTag(o, todayIso)}
            <span class="tag tag-gray">${esc(o.field)}</span>
            ${o.isLive ? '<span class="tag tag-sbiz">🟢실시간</span>' : ''}
            ${o.detail?.ntceKind && /취소/.test(o.detail.ntceKind) ? '<span class="tag tag-re">⛔취소공고</span>' : (o.detail?.ntceKind && /변경|정정/.test(o.detail.ntceKind) ? '<span class="tag tag-bid">📝변경</span>' : '')}
            ${o.attachments?.length ? `<span class="tag tag-corp">📎첨부 ${o.attachments.length}</span>` : ''}
            ${o.dday !== null && o.dday >= 0 && o.dday <= 7 ? `<span class="tag tag-re">D-${o.dday}</span>` : ''}
          </div>
          <div style="font-weight:800;font-size:12.5px;margin-bottom:2px;line-height:1.35">${esc(o.title)}</div>
          <div style="font-size:11px;color:var(--muted)">🏛️ ${esc(o.org || '-')} · 📍 ${esc(o._regionFull || o.region || '전국')}</div>
          <div style="font-size:11px;color:var(--text);font-weight:600;margin-top:3px">${esc(oppDateStr(o))}</div>
        </div>
        <div class="item-card-right" style="min-width:68px">
          <span class="tag tag-sbiz">ICP ${o.icpScore}</span>
          <div style="font-weight:800;font-size:12.5px;color:var(--c-bid)">${o.budgetMan > 0 ? `${fmtDec(o.budgetMan / 10000, 1)}억` : '-'}</div>
        </div>
      </div>`;
  }).join('') || '<div style="text-align:center;padding:28px;color:var(--muted)">선택한 조건에 맞는 공고/조기포착 건이 없습니다.</div>';

  scroll.querySelectorAll('[data-map-opp]').forEach((el) => {
    el.addEventListener('click', () => {
      const o = S.opps.find((x) => x.id === el.dataset.mapOpp);
      if (!o) return;
      if (o.lat && o.lon && S.bidLeafletMap) {
        S.bidLeafletMap.setView([o.lat, o.lon], 13);
      }
      openOppDrawer(o);
    });
  });
}

function renderBidOppsBody() {
  const list = getFilteredOpps();
  const perPage = 30;
  const maxPage = Math.max(1, Math.ceil(list.length / perPage));
  S.bidPage = Math.min(S.bidPage, maxPage);
  const pageItems = list.slice((S.bidPage - 1) * perPage, S.bidPage * perPage);

  $('bidBody').innerHTML = `
    ${renderBidFilterDeckHtml()}

    <div class="item-list">
      ${pageItems.map((o) => {
        const sm = OPP_STAGE_META[o.stageType] || OPP_STAGE_META.bid;
        return `
        <div class="item-card" data-opp-id="${esc(o.id)}">
          <div class="item-card-main">
            <div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:5px">
              <span class="tag ${sm.tagCls}">${sm.label}</span>
              ${todayTimeTag(o)}
              <span class="tag tag-gray">${esc(o.field)}</span>
              ${o.isLive ? '<span class="tag tag-sbiz">🟢 카톡동일 실시간</span>' : ''}
              ${o.detail?.ntceKind && /취소/.test(o.detail.ntceKind) ? '<span class="tag tag-re">⛔ 취소공고</span>' : (o.detail?.ntceKind && /변경|정정/.test(o.detail.ntceKind) ? '<span class="tag tag-bid">📝 변경공고</span>' : '')}
              ${o.attachments?.length ? `<span class="tag tag-corp">📎 첨부 ${o.attachments.length}건</span>` : ''}
              ${o.dday !== null && o.dday >= 0 && o.dday <= 7 ? `<span class="tag tag-re">D-${o.dday} 긴급</span>` : ''}
            </div>
            <div class="item-card-title">${esc(o.title)}</div>
            <div class="item-card-meta">
              <span>🏛️ ${esc(o.org || '-')}</span>
              <span>📍 ${esc(o._regionFull || o.region || '전국')}</span>
              <span>${esc(oppDateStr(o))}</span>
            </div>
          </div>
          <div class="item-card-right">
            <span class="tag tag-sbiz">ICP ${o.icpScore}점</span>
            <div style="font-weight:800;font-size:14px;color:var(--c-bid)">${o.budgetMan > 0 ? `${fmtDec(o.budgetMan / 10000, 1)}억` : '예산 미기재'}</div>
          </div>
        </div>`;
      }).join('') || '<div style="text-align:center;padding:28px;color:var(--muted)">조건에 맞는 영업기회가 없습니다.</div>'}
    </div>

    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px">
      <span style="font-size:12px;color:var(--muted)">페이지 ${S.bidPage} / ${maxPage} (총 ${fmt(list.length)}건)</span>
      <div style="display:flex;gap:6px">
        <button id="bidPrev" class="btn btn-sm" ${S.bidPage <= 1 ? 'disabled' : ''}>← 이전</button>
        <button id="bidNext" class="btn btn-sm" ${S.bidPage >= maxPage ? 'disabled' : ''}>다음 →</button>
      </div>
    </div>
  `;

  wireBidFilterControls(renderBidOppsBody);
  $('bidPrev').addEventListener('click', () => { if (S.bidPage > 1) { S.bidPage--; renderBidOppsBody(); } });
  $('bidNext').addEventListener('click', () => { if (S.bidPage < maxPage) { S.bidPage++; renderBidOppsBody(); } });
  $('bidBody').querySelectorAll('[data-opp-id]').forEach((card) => {
    card.addEventListener('click', () => {
      const o = S.opps.find((x) => x.id === card.dataset.oppId);
      if (o) openOppDrawer(o);
    });
  });
}

async function fetchG2bNewestItems(baseUrl, todayBgnDt, yestBgnDt, endDt) {
  const extract = (j) => {
    const raw = j?.response?.body?.items;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw.item)) return raw.item;
    return raw.item ? [raw.item] : [];
  };
  const collectWindow = async (bgn, end, maxPages = 3) => {
    const r1 = await fetch(`${baseUrl}&numOfRows=999&pageNo=1&type=json&inqryDiv=1&inqryBgnDt=${bgn}&inqryEndDt=${end}`);
    if (!r1.ok) return [];
    const j1 = await r1.json();
    const total = Number(j1?.response?.body?.totalCount || 0);
    let out = extract(j1);
    if (total > 999) {
      const pages = Math.min(maxPages, Math.ceil(total / 999));
      const extras = await Promise.all(
        Array.from({ length: pages - 1 }, (_, i) => i + 2).map(async (p) => {
          try {
            const rp = await fetch(`${baseUrl}&numOfRows=999&pageNo=${p}&type=json&inqryDiv=1&inqryBgnDt=${bgn}&inqryEndDt=${end}`);
            return rp.ok ? extract(await rp.json()) : [];
          } catch { return []; }
        })
      );
      for (const arr of extras) out = out.concat(arr);
    }
    return out;
  };
  // G2B API sorts by bidNtceNo (NOT strictly bidNtceDt) -> fetch 100% of TODAY (00:00~now) with numOfRows=999 so ZERO KakaoTalk alerts can ever be missed on middle pages!
  const [todayItems, yestItems] = await Promise.all([
    collectWindow(todayBgnDt, endDt, 4),
    collectWindow(yestBgnDt, todayBgnDt, 1),
  ]);
  const merged = [...todayItems, ...yestItems];
  merged.sort((a, b) => String(b.bidNtceDt || b.rcptDt || '').localeCompare(String(a.bidNtceDt || a.rcptDt || '')));
  return merged;
}

function extractG2bDetail(it, isPre) {
  const attachments = [];
  const seenUrl = new Set();
  const pushFile = (name, url) => {
    const u = String(url || '').trim();
    if (!u || seenUrl.has(u)) return;
    seenUrl.add(u);
    attachments.push({ name: String(name || '첨부서류').trim(), url: u });
  };
  if (isPre) {
    for (let i = 1; i <= 5; i++) {
      if (it[`specDocFileUrl${i}`]) pushFile(`사전규격 첨부문서 #${i}`, it[`specDocFileUrl${i}`]);
    }
  } else {
    for (let i = 1; i <= 10; i++) {
      const u = it[`ntceSpecDocUrl${i}`];
      if (u) pushFile(it[`ntceSpecFileNm${i}`] || `공고 첨부서류 #${i}`, u);
    }
    if (it.stdNtceDocUrl) pushFile('표준공고서', it.stdNtceDocUrl);
  }
  const telRaw = String(it.ntceInsttOfclTelNo || it.ofclTelNo || '').trim();
  const telClean = telRaw && !/^\*+$/.test(telRaw) ? telRaw : '';
  const clsPath = [it.pubPrcrmntLrgClsfcNm, it.pubPrcrmntMidClsfcNm, it.pubPrcrmntClsfcNm].filter(Boolean).join(' > ');
  const priceMthd = it.prearngPrceDcsnMthdNm
    ? `${it.prearngPrceDcsnMthdNm}${it.totPrdprcNum ? ` (${it.totPrdprcNum}개 중 ${it.drwtPrdprcNum || 4}개 추첨)` : ''}`
    : '';
  return {
    attachments,
    detail: {
      bidNo: isPre ? (it.bfSpecRgstNo || '') : `${it.bidNtceNo || ''}${it.bidNtceOrd ? '-' + it.bidNtceOrd : ''}`,
      ntceKind: isPre ? '사전규격공개' : (it.ntceKindNm || '등록공고'),
      refNo: it.refNo || '',
      chgRsn: it.chgNtceRsn || '',
      contractMethod: it.cntrctCnclsMthdNm || '',
      awardMethod: it.sucsfbidMthdNm || '',
      awardRate: it.sucsfbidLwltRate ? `${it.sucsfbidLwltRate}%` : '',
      priceMethod: priceMthd,
      presmptWon: Number(it.presmptPrce || 0) || 0,
      asignWon: Number(it.asignBdgtAmt || 0) || 0,
      vatWon: Number(it.VAT || 0) || 0,
      jointMethod: it.cmmnSpldmdMethdNm || '',
      industryLimit: it.indstrytyLmtYn ? (it.indstrytyLmtYn === 'Y' ? '제한 있음 (공고문 확인)' : '제한 없음') : '',
      rebid: it.rbidPermsnYn ? (it.rbidPermsnYn === 'Y' ? '허용' : '불가') : '',
      categoryNm: clsPath || it.srvceDivNm || it.bsnsDivNm || '',
      bidBeginDt: it.bidBeginDt || '',
      bidClseDt: it.bidClseDt || it.opninRgstClseDt || '',
      opengDt: it.opengDt || '',
      opengPlce: it.opengPlce || '',
      qualDt: it.bidQlfctRgstDt || '',
      dlvrDt: it.dlvrTmlmtDt || '',
      ofclNm: it.ntceInsttOfclNm || it.ofclNm || '',
      ofclTel: telClean,
      ofclEmail: it.ntceInsttOfclEmailAdrs || '',
      bfSpecNo: it.bfSpecRgstNo || '',
      prdctSpec: it.prdctSpecNm || '',
    },
  };
}

function fileIconForName(name) {
  const s = String(name || '').toLowerCase();
  if (s.endsWith('.pdf')) return '📄';
  if (s.endsWith('.hwp') || s.endsWith('.hwpx') || s.endsWith('.doc') || s.endsWith('.docx')) return '📝';
  if (s.endsWith('.xls') || s.endsWith('.xlsx') || s.endsWith('.csv')) return '📊';
  if (s.endsWith('.zip') || s.endsWith('.7z') || s.endsWith('.rar')) return '🗜️';
  return '📎';
}

async function fetchSingleBidDetailLive(bidNtceNo) {
  const { dataGoEnc } = getApiKeys();
  if (!dataGoEnc || !bidNtceNo) return null;
  const cleanNo = String(bidNtceNo).split('-')[0].trim();
  const ops = ['getBidPblancListInfoServc02', 'getBidPblancListInfoCnstwk02', 'getBidPblancListInfoThng02'];
  for (const op of ops) {
    try {
      const r = await fetch(`https://apis.data.go.kr/1230000/ad/BidPublicInfoService02/${op}?serviceKey=${dataGoEnc}&inqryDiv=2&bidNtceNo=${encodeURIComponent(cleanNo)}&pageNo=1&numOfRows=5&type=json`);
      if (!r.ok) continue;
      const j = await r.json();
      const raw = j?.response?.body?.items;
      const arr = Array.isArray(raw) ? raw : (raw?.item ? (Array.isArray(raw.item) ? raw.item : [raw.item]) : []);
      if (arr.length) return extractG2bDetail(arr[0], false);
    } catch {}
  }
  return null;
}

async function fetchLiveG2bAndPrespec({ silent = false } = {}) {
  const { dataGoEnc } = getApiKeys();
  if (!dataGoEnc) { if (!silent) toast('공공데이터포털 키가 없습니다.'); return; }
  if (S.bidSync.syncing) return;
  S.bidSync.syncing = true;
  if (!silent) toast('🔄 카톡 알림봇 동일 소스(오늘 00시~현재 전수 + 어제 최신 입찰·사전규격·청약홈) 동기화 중…');

  const nowMs = Date.now();
  const kst = (ms) => {
    const d = new Date(ms + 9 * 3600000);
    const pad = (n) => String(n).padStart(2, '0');
    const ymd = `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}`;
    return { ymd, dt: `${ymd}${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}` };
  };
  const todayBgnDt = `${kst(nowMs).ymd}0000`, yestBgnDt = `${kst(nowMs - 24 * 3600000).ymd}0000`, endDt = kst(nowMs + 10 * 60000).dt;

  const g2bUrls = [
    ['bid', `https://apis.data.go.kr/1230000/ad/BidPublicInfoService02/getBidPblancListInfoServc02?serviceKey=${dataGoEnc}`],
    ['bid', `https://apis.data.go.kr/1230000/ad/BidPublicInfoService02/getBidPblancListInfoCnstwk02?serviceKey=${dataGoEnc}`],
    ['bid', `https://apis.data.go.kr/1230000/ad/BidPublicInfoService02/getBidPblancListInfoThng02?serviceKey=${dataGoEnc}`],
    ['prespec', `https://apis.data.go.kr/1230000/ao/HrcspSsstndrdInfoService/getPublicPrcureThngInfoServc?serviceKey=${dataGoEnc}`],
    ['prespec', `https://apis.data.go.kr/1230000/ao/HrcspSsstndrdInfoService/getPublicPrcureThngInfoCnstwk?serviceKey=${dataGoEnc}`],
    ['prespec', `https://apis.data.go.kr/1230000/ao/HrcspSsstndrdInfoService/getPublicPrcureThngInfoThng?serviceKey=${dataGoEnc}`],
  ];

  const map = new Map(S.opps.map((o) => [o.id, o]));
  let added = 0;

  await Promise.all([
    ...g2bUrls.map(async ([st, baseUrl]) => {
      try {
        const arr = await fetchG2bNewestItems(baseUrl, todayBgnDt, yestBgnDt, endDt);
        for (const it of arr) {
          const isPre = st === 'prespec';
          const id = isPre ? `pre-${it.bfSpecRgstNo || it.prdctClsfcNoNm}` : `g2b-${it.bidNtceNo}-${it.bidNtceOrd || '00'}`;
          const budgetWon = Number(isPre ? it.asignBdgtAmt : (it.presmptPrce || it.asignBdgtAmt || 0)) || 0;
          const extra = extractG2bDetail(it, isPre);
          const obj = attachOppGeo(enrichOpp({
            id,
            isLive: true,
            source: isPre ? '나라장터 사전규격(실시간)' : '나라장터 입찰(실시간)',
            stageType: st,
            title: isPre ? `[사전규격] ${it.prdctClsfcNoNm || it.bsnsDivNm || ''}` : (it.bidNtceNm || ''),
            org: it.dminsttNm || it.orderInsttNm || it.ntceInsttNm || '',
            region: it.dminsttOfclAddr || it.ntceInsttNm || '전국',
            budgetMan: Math.round(budgetWon / 10000),
            pubDate: String(it.bidNtceDt || it.rcptDt || '').slice(0, 10),
            pubDateTime: String(it.bidNtceDt || it.rcptDt || '').slice(0, 16),
            closeDate: String(it.bidClseDt || it.opninRgstClseDt || '').slice(0, 10),
            method: it.bidMethdNm || (isPre ? '사전규격 의견수렴' : ''),
            url: it.bidNtceDtlUrl || 'https://www.g2b.go.kr/',
            attachments: extra.attachments,
            detail: extra.detail,
          }));
          if (!map.has(id)) added++;
          map.set(id, obj);
        }
      } catch {}
    }),
    // Also sync Applyhome 신축분양 (same early-detection source as KakaoTalk bot!)
    (async () => {
      try {
        const r = await fetch(`https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1/getAPTLttotPblancDetail?page=1&perPage=30&serviceKey=${dataGoEnc}`);
        if (!r.ok) return;
        const j = await r.json();
        for (const it of (j?.data || [])) {
          const id = `newbuild-${it.HOUSE_MANAGE_NO || it.PBLANC_NO}`;
          const obj = attachOppGeo(enrichOpp({
            id,
            isLive: true,
            source: '청약홈 신축분양(실시간)',
            stageType: 'newbuild',
            title: `[신축분양] ${it.HOUSE_NM || ''} (${it.TOT_SUPLY_HSHLDCO || 0}세대 · 입주 ${it.MVN_PREARNGE_YM || '-'})`,
            org: it.CNSTRCT_ENTRPS_NM || it.BSNS_MBY_NM || '시공사',
            region: it.HSSPLY_ADRES || it.SUBSCRPT_AREA_CODE_NM || '전국',
            budgetMan: 0,
            pubDate: it.RCRIT_PBLANC_DE || '',
            closeDate: it.RCEPT_ENDDE || '',
            method: '신축 공동주택 선제 스펙인',
            url: it.PBLANC_URL || 'https://www.applyhome.co.kr/',
          }));
          if (!map.has(id)) added++;
          map.set(id, obj);
        }
      } catch {}
    })(),
  ]);

  S.opps = [...map.values()];
  const hhmm = new Date().toTimeString().slice(0, 5);
  S.bidSync = { syncing: false, lastAt: hhmm, added, liveTotal: S.opps.filter((o) => o.isLive).length };
  $('cntBid').textContent = fmt(S.opps.length);
  if (!silent) toast(`✓ 실시간 동기화 완료 (+${added}건 신규, 총 ${fmt(S.opps.length)}건)`);
  if (S.tab === 'bid') renderBidTab();
}

function downloadOppIcs(o) {
  const dt = o.detail || {};
  const toIcsDt = (str, fallbackHour = '100000') => {
    const m = String(str || '').match(/(\d{4})-(\d{2})-(\d{2})(?:[\sT](\d{2}):(\d{2})(?::(\d{2}))?)?/);
    if (!m) return null;
    return `${m[1]}${m[2]}${m[3]}T${m[4] ? `${m[4]}${m[5]}${m[6] || '00'}` : fallbackHour}`;
  };
  const escIcs = (s) => String(s || '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
  const events = [];
  const addEv = (uidSuffix, summary, dtStr, desc, withAlarm) => {
    const start = toIcsDt(dtStr);
    if (!start) return;
    const endH = String(Math.min(23, Number(start.slice(9, 11)) + 1)).padStart(2, '0');
    const end = `${start.slice(0, 9)}${endH}${start.slice(11)}`;
    events.push([
      'BEGIN:VEVENT',
      `UID:${escIcs(o.id)}-${uidSuffix}@nexusone.pro`,
      `DTSTART;TZID=Asia/Seoul:${start}`,
      `DTEND;TZID=Asia/Seoul:${end}`,
      `SUMMARY:${escIcs(summary)}`,
      `LOCATION:${escIcs(dt.opengPlce || o.org || '나라장터')}`,
      `DESCRIPTION:${escIcs(desc)}`,
      ...(withAlarm ? [
        'BEGIN:VALARM', 'TRIGGER:-P1D', 'ACTION:DISPLAY', `DESCRIPTION:${escIcs(summary)} (1일 전 알림)`, 'END:VALARM',
        'BEGIN:VALARM', 'TRIGGER:-PT3H', 'ACTION:DISPLAY', `DESCRIPTION:${escIcs(summary)} (3시간 전 알림)`, 'END:VALARM',
      ] : []),
      'END:VEVENT',
    ].join('\r\n'));
  };
  const baseDesc = `발주기관: ${o.org || '-'}\n공고번호: ${dt.bidNo || o.id}\n예산: ${o.budgetMan > 0 ? fmtDec(o.budgetMan / 10000, 1) + '억' : '미기재'}\n낙찰하한율: ${dt.awardRate || '-'}\n원문: ${o.url || ''}`;
  if (dt.qualDt) addEv('qual', `[참가자격마감] ${o.title}`, dt.qualDt, baseDesc, true);
  if (dt.bidClseDt || o.closeDate) addEv('close', `[입찰마감] ${o.title}`, dt.bidClseDt || o.closeDate, baseDesc, true);
  if (dt.opengDt) addEv('open', `[개찰] ${o.title}`, dt.opengDt, baseDesc, false);
  if (!events.length) { toast('등록된 마감·개찰 일정이 없어 캘린더를 생성할 수 없습니다.'); return; }
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//NexusOne PRO//Bid Schedule//KO', 'CALSCALE:GREGORIAN',
    ...events,
    'END:VCALENDAR',
  ].join('\r\n');
  const blob = new Blob(['\uFEFF' + ics], { type: 'text/calendar;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${String(dt.bidNo || o.id).replace(/[^a-zA-Z0-9_-]/g, '')}_입찰일정.ics`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  toast(`📅 입찰 일정 ${events.length}건 캘린더(.ics) 다운로드 완료!`);
}

function findBidPartnerBuilders(o, limit = 5) {
  const rows = S.builders?.rows;
  const inds = S.builders?.industries || [];
  if (!rows?.length) return [];
  const f = String(o.field || '');
  const wantSec = /보안|AI|전기|통신|소방/.test(f) ? 'elec'
    : /시설|경비|미화/.test(f) ? 'facility'
    : /승강기|설비/.test(f) ? 'special'
    : 'general';
  const targetRid = o._fusionRid ?? -1;
  const targetSd = o._sd || '';
  const scored = [];
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    if (r[12] === 2 || r[12] === 3) continue; // 휴·폐업 제외
    let pts = 0;
    const sameRid = targetRid >= 0 && r[10] === targetRid;
    const reg = r[10] >= 0 ? S.fusionByRid.get(r[10]) : null;
    const sameSd = Boolean(targetSd && reg?.sd === targetSd);
    if (sameRid) pts += 50;
    else if (sameSd) pts += 25;
    else continue; // 지역 미일치는 후보 제외 (광역 단위 추천)
    if (r[13] === wantSec) pts += 35;
    else if ((wantSec === 'elec' && r[13] === 'special') || (wantSec === 'general' && r[13] === 'special')) pts += 15;
    const rev = Number(r[14]) || 0;
    const emp = Number(r[17]) || 0;
    if (rev > 0) pts += Math.min(25, Math.log10(rev + 1) * 9);
    if (emp > 0) pts += Math.min(10, Math.log10(emp + 1) * 5);
    if (r[6]) pts += 5; // 전화번호 보유 우대
    scored.push({ r, pts, sameRid, ind: inds[r[8]] || r[13] });
  }
  scored.sort((a, b) => b.pts - a.pts || (Number(b.r[14]) || 0) - (Number(a.r[14]) || 0));
  return scored.slice(0, limit);
}

// ===== K-BID GRADE ENGINE (v19): G2B 기초금액·A값·순공사원가 · 복수예가 15개(1,365조합) · 적격심사 · 내서류함 =====
async function fetchBidBsisAmountLive(bidNtceNo) {
  const { dataGoEnc } = getApiKeys();
  if (!dataGoEnc || !bidNtceNo) return null;
  const cleanNo = String(bidNtceNo).split('-')[0].trim();
  const ops = [
    'getBidPblancListInfoCnstwkBsisAmount02',
    'getBidPblancListInfoServcBsisAmount02',
    'getBidPblancListInfoThngBsisAmount02',
  ];
  const results = await Promise.all(ops.map(async (op) => {
    try {
      const u = `https://apis.data.go.kr/1230000/ad/BidPublicInfoService02/${op}?serviceKey=${dataGoEnc}&inqryDiv=2&bidNtceNo=${encodeURIComponent(cleanNo)}&pageNo=1&numOfRows=5&type=json`;
      const r = await fetch(u);
      if (!r.ok) return null;
      const j = await r.json();
      const raw = j?.response?.body?.items;
      const arr = Array.isArray(raw) ? raw : (raw?.item ? (Array.isArray(raw.item) ? raw.item : [raw.item]) : []);
      return arr[0] || null;
    } catch { return null; }
  }));
  const x = results.find(Boolean);
  if (!x) return null;
  const num = (v) => { const n = Number(String(v ?? '').replace(/[^0-9.-]/g, '')); return Number.isFinite(n) && n > 0 ? Math.round(n) : 0; };
  const bssamt = num(x.bssamt);
  const netCost = num(x.bssamtPurcnstcst || x.purcnstcst);
  const aItems = [
    ['안전보건', num(x.sftyMngcst)],
    ['안전관리', num(x.sftyChckMngcst)],
    ['품질관리', num(x.qltyMngcst)],
    ['퇴직공제', num(x.rtrfundNon)],
    ['건강보험', num(x.mrfnHealthInsrprm)],
    ['국민연금', num(x.npnInsrprm)],
    ['노인요양', num(x.odsnLngtrmrcprInsrprm)],
  ].filter(([, v]) => v > 0);
  const aVal = aItems.reduce((s, [, v]) => s + v, 0);
  const rngRaw = Math.abs(parseFloat(String(x.rsrvtnPrceRngBgnRate || x.rsrvtnPrceRngEndRate || '').replace(/[^0-9.-]/g, '')));
  const rngPct = rngRaw === 2 || rngRaw === 3 ? rngRaw : 3;
  return {
    bssamt,
    netCost,
    aVal,
    aBreakdown: aItems.map(([k, v]) => `${k} ${fmt(Math.round(v / 10000))}만`).join(' · '),
    rngPct,
    openDt: x.bssamtOpenDt || '',
  };
}

function calcOptimalBidWon(estPrice, lwltPct, aVal = 0, netCost = 0) {
  const raw = aVal > 0
    ? (estPrice - aVal) * (lwltPct / 100) + aVal
    : estPrice * (lwltPct / 100);
  const calcBid = Math.ceil(Math.max(0, raw) / 1000) * 1000;
  const netFloor = netCost > 0 ? Math.ceil((netCost * 0.98) / 1000) * 1000 : 0;
  const netWarn = netFloor > 0 && calcBid < netFloor;
  return { calcBid, netFloor, netWarn, finalBid: netWarn ? netFloor : calcBid };
}

function generate15MultiPrices(rngPct = 3) {
  // Realistic K-Bid / G2B 15-slot distribution across [-rngPct, +rngPct]
  const slots = [];
  const step = (rngPct * 2) / 15;
  for (let i = 0; i < 15; i++) {
    const low = -rngPct + i * step;
    const jitter = (Math.random() * 0.65 + 0.175) * step;
    slots.push(Number((low + jitter).toFixed(3)));
  }
  return slots;
}

function analyze1365Combinations(slots, baseWon, lwltPct, aVal, netCost) {
  const rates = [];
  const n = slots.length;
  for (let a = 0; a < n - 3; a++) {
    for (let b = a + 1; b < n - 2; b++) {
      for (let c = b + 1; c < n - 1; c++) {
        for (let d = c + 1; d < n; d++) {
          rates.push((slots[a] + slots[b] + slots[c] + slots[d]) / 4);
        }
      }
    }
  }
  rates.sort((x, y) => x - y);
  const pick = (p) => rates[Math.min(rates.length - 1, Math.floor(rates.length * p))] || 0;
  const toBid = (r) => calcOptimalBidWon(Math.round(baseWon * (1 + r / 100)), lwltPct, aVal, netCost).finalBid;
  const rMin = rates[0] || 0, rMax = rates[rates.length - 1] || 0;
  const bins = Array(7).fill(0);
  const span = Math.max(0.001, rMax - rMin);
  rates.forEach((r) => {
    const bi = Math.min(6, Math.floor(((r - rMin) / span) * 7));
    bins[bi]++;
  });
  const maxBin = Math.max(1, ...bins);
  return {
    count: rates.length,
    rMin, rP10: pick(0.1), rP25: pick(0.25), rMed: pick(0.5), rP75: pick(0.75), rP90: pick(0.9), rMax,
    bidP10: toBid(pick(0.1)), bidMed: toBid(pick(0.5)), bidP90: toBid(pick(0.9)),
    bins, maxBin,
  };
}

function saveQualProfile() {
  try { localStorage.setItem('nx1_qual_profile_v1', JSON.stringify(S.qualProfile)); } catch {}
}

function evalQualificationScore(o) {
  const qp = S.qualProfile || { credit: 'BBB', perfEok: 15, bonus: 1.5, cutoff: 95 };
  const dt = o.detail || {};
  const bsis = o._bsis || {};
  const baseWon = bsis.bssamt || dt.asignWon || dt.presmptWon || (o.budgetMan > 0 ? o.budgetMan * 10000 : 0);
  const creditMap = { AAA: 15.0, AA: 15.0, A: 14.5, BBB: 14.0, BB: 13.5, B: 12.5, CCC: 11.0 };
  const creditScore = creditMap[qp.credit] ?? 14.0;
  const perfWon = (Number(qp.perfEok) || 0) * 1e8;
  const ratio = baseWon > 0 ? perfWon / baseWon : 1.0;
  const perfScore = ratio >= 1.0 ? 15.0 : (ratio >= 0.7 ? 13.5 : (ratio >= 0.5 ? 12.0 : Math.max(6.0, Number((ratio * 15).toFixed(1)))));
  const priceScore = 65.0; // 낙찰하한선 투찰 시 표준 가격점수 기준
  const bonusScore = Math.min(3.0, Math.max(0, Number(qp.bonus) || 0));
  const total = Number((creditScore + perfScore + priceScore + bonusScore).toFixed(1));
  const cutoff = Number(qp.cutoff) || 95;
  return { creditScore, perfScore, priceScore, bonusScore, total, cutoff, pass: total >= cutoff, ratio, baseWon };
}

function buildQualCheckHtml(o) {
  const qp = S.qualProfile;
  const q = evalQualificationScore(o);
  return `
    <div class="domain-box" style="margin-top:10px;border-color:${q.pass ? '#a7f3d0' : '#fecaca'};background:${q.pass ? 'rgba(16,185,129,.04)' : 'rgba(239,68,68,.04)'}">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;margin-bottom:6px">
        <h4 style="margin:0">✅ 적격심사 자사 점수 자동 판정 (케이비드·아이건설넷급)</h4>
        <button id="dwToggleQualEdit" type="button" class="btn btn-sm" style="padding:2px 8px;font-size:11px">⚙️ 자사 스펙</button>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;padding:7px 10px;border-radius:8px;background:var(--bg);border:1px solid var(--border);margin-bottom:6px">
        <div>
          <div style="font-size:12px;font-weight:800;color:${q.pass ? '#059669' : '#dc2626'}">${q.pass ? `🟢 적격심사 통과 유력 (${q.total}점 / 기준 ${q.cutoff}점)` : `🟠 보완 필요 (${q.total}점 · ${(q.cutoff - q.total).toFixed(1)}점 부족)`}</div>
          <div style="font-size:11px;color:var(--muted);margin-top:2px">신용 ${qp.credit}(${q.creditScore}) + 실적 ${qp.perfEok}억(${q.perfScore}, ${q.baseWon > 0 ? (q.ratio * 100).toFixed(0) + '%' : '충족'}) + 가격 ${q.priceScore} + 신인도 ${q.bonusScore}</div>
        </div>
        <span class="tag ${q.pass ? 'tag-sbiz' : 'tag-re'}">${q.pass ? 'PASS' : '공동도급권장'}</span>
      </div>
      ${!q.pass ? '<div style="font-size:11px;color:#b91c1c;margin-bottom:6px">💡 실적/신용 보완이 필요합니다. 아래 추천 지역 협력 건설사 TOP 5와 공동도급(컨소시엄)을 검토하세요.</div>' : ''}
      <div id="dwQualForm" class="hidden" style="padding:8px;border-radius:8px;background:var(--bg);border:1px solid var(--border);display:grid;grid-template-columns:repeat(2,1fr);gap:6px;font-size:11px">
        <label>신용평가등급
          <select id="qpCredit" class="select" style="width:100%;margin-top:2px;padding:4px 6px;font-size:11.5px">
            ${['AAA', 'AA', 'A', 'BBB', 'BB', 'B', 'CCC'].map((g) => `<option value="${g}" ${qp.credit === g ? 'selected' : ''}>${g}</option>`).join('')}
          </select>
        </label>
        <label>최근 3~5년 실적 (억원)
          <input id="qpPerf" class="input" type="number" step="0.5" min="0" value="${qp.perfEok}" style="width:100%;margin-top:2px;padding:4px 6px;font-size:11.5px" />
        </label>
        <label>신인도·인증 가점 (0~3)
          <input id="qpBonus" class="input" type="number" step="0.5" min="0" max="3" value="${qp.bonus}" style="width:100%;margin-top:2px;padding:4px 6px;font-size:11.5px" />
        </label>
        <label>통과 커트라인 (점)
          <input id="qpCutoff" class="input" type="number" step="1" min="70" max="100" value="${qp.cutoff}" style="width:100%;margin-top:2px;padding:4px 6px;font-size:11.5px" />
        </label>
        <button id="qpSaveBtn" type="button" class="btn btn-sm btn-primary" style="grid-column:span 2">💾 자사 적격심사 프로필 저장 · 즉시 재판정</button>
      </div>
    </div>
  `;
}

function wireQualCheck(o) {
  $('dwToggleQualEdit')?.addEventListener('click', () => {
    const f = $('dwQualForm');
    if (f) f.classList.toggle('hidden');
  });
  $('qpSaveBtn')?.addEventListener('click', () => {
    S.qualProfile = {
      credit: $('qpCredit')?.value || 'BBB',
      perfEok: Math.max(0, Number($('qpPerf')?.value) || 0),
      bonus: Math.min(3, Math.max(0, Number($('qpBonus')?.value) || 0)),
      cutoff: Math.min(100, Math.max(70, Number($('qpCutoff')?.value) || 95)),
    };
    saveQualProfile();
    toast('✅ 자사 적격심사 프로필 저장 완료!');
    openOppDrawer(o);
  });
}

function saveMyBizStore() {
  try { localStorage.setItem('nx1_mybiz_v1', JSON.stringify(S.myBiz)); } catch {}
}

function buildMyBizHtml(o) {
  const rec = S.myBiz[o.id] || null;
  const statuses = ['검토중', '서류준비', '투찰완료', '개찰대기', '🏆낙찰', '유찰'];
  const curSt = rec?.status || '검토중';
  return `
    <div class="domain-box" style="margin-top:10px;border-color:#fde68a;background:rgba(245,158,11,.04)">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;margin-bottom:6px">
        <h4 style="margin:0">📁 내서류함 (My Biz · 투찰 진행관리)</h4>
        ${rec ? `<span class="tag tag-bid">${esc(rec.status)} · ${esc(rec.updatedAt || '')}</span>` : '<span style="font-size:11px;color:var(--muted)">미등록</span>'}
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:7px" id="myBizStRow">
        ${statuses.map((st) => `<button type="button" class="toggle-pill ${curSt === st && rec ? 'on' : ''}" data-mb-st="${st}" style="padding:3px 8px;font-size:11px">${st}</button>`).join('')}
      </div>
      <div style="display:flex;gap:6px;align-items:center;margin-bottom:6px">
        <input id="myBizBidWon" class="input" type="number" step="1000" value="${rec?.myBidWon || ''}" placeholder="나의 확정 투찰가 (원)" style="flex:1;padding:5px 8px;font-size:12px" />
        <button id="myBizPullSim" type="button" class="btn btn-sm" style="padding:5px 8px;font-size:11px;white-space:nowrap">🎯 시뮬가 가져오기</button>
      </div>
      <textarea id="myBizMemo" class="input" rows="2" placeholder="발주 담당자 통화내용, 현장답사, 협력사 지분, 투찰 메모…" style="width:100%;padding:6px 8px;font-size:11.5px;margin-bottom:6px;resize:vertical">${esc(rec?.memo || '')}</textarea>
      <div style="display:flex;gap:6px">
        <button id="myBizSaveBtn" type="button" class="btn btn-sm btn-primary" style="flex:1">💾 내서류함 저장</button>
        ${rec ? '<button id="myBizDelBtn" type="button" class="btn btn-sm">🗑️ 삭제</button>' : ''}
      </div>
    </div>
  `;
}

function wireMyBiz(o) {
  let selSt = S.myBiz[o.id]?.status || '검토중';
  $('myBizStRow')?.querySelectorAll('[data-mb-st]').forEach((b) => {
    b.addEventListener('click', () => {
      selSt = b.dataset.mbSt;
      $('myBizStRow').querySelectorAll('[data-mb-st]').forEach((x) => x.classList.toggle('on', x.dataset.mbSt === selSt));
    });
  });
  $('myBizPullSim')?.addEventListener('click', () => {
    const cur = window._lastSimFinalBid || 0;
    if (cur > 0 && $('myBizBidWon')) {
      $('myBizBidWon').value = String(cur);
      toast(`🎯 시뮬레이터 권장 투찰가 ${fmt(cur)}원 입력 완료`);
    }
  });
  $('myBizSaveBtn')?.addEventListener('click', () => {
    S.myBiz[o.id] = {
      status: selSt,
      myBidWon: Math.max(0, Number($('myBizBidWon')?.value) || 0),
      memo: ($('myBizMemo')?.value || '').trim(),
      updatedAt: getTodayKstIso(),
    };
    saveMyBizStore();
    toast(`📁 내서류함 저장 완료 (${selSt})`);
    if (S.tab === 'bid') renderBidTab();
    openOppDrawer(o);
  });
  $('myBizDelBtn')?.addEventListener('click', () => {
    delete S.myBiz[o.id];
    saveMyBizStore();
    toast('🗑️ 내서류함에서 제거되었습니다.');
    if (S.tab === 'bid') renderBidTab();
    openOppDrawer(o);
  });
}

function buildAwardHistHtml(rates) {
  if (!rates || rates.length < 2) return '';
  const minR = Math.floor(Math.min(...rates) * 2) / 2;
  const maxR = Math.ceil(Math.max(...rates) * 2) / 2;
  const span = Math.max(0.5, maxR - minR);
  const bCnt = Math.min(7, Math.max(3, Math.ceil(span / 0.5)));
  const step = span / bCnt;
  const bins = Array.from({ length: bCnt }, (_, i) => ({
    lo: minR + i * step,
    hi: minR + (i + 1) * step,
    cnt: 0,
  }));
  rates.forEach((r) => {
    const idx = Math.min(bCnt - 1, Math.max(0, Math.floor((r - minR) / step)));
    bins[idx].cnt++;
  });
  const maxC = Math.max(1, ...bins.map((b) => b.cnt));
  const modeBin = bins.reduce((best, b) => (b.cnt > best.cnt ? b : best), bins[0]);
  const modeMid = Number(((modeBin.lo + modeBin.hi) / 2).toFixed(2));
  return `
    <div style="padding:8px 9px;border-radius:8px;background:var(--bg);border:1px solid var(--border);margin-bottom:8px">
      <div style="display:flex;justify-content:space-between;align-items:center;font-size:11px;margin-bottom:5px">
        <span style="font-weight:700;color:var(--text)">📈 발주처·유사 낙찰률 분포도</span>
        <span style="color:#4f46e5;font-weight:800">최빈 집중: ${modeBin.lo.toFixed(1)}~${modeBin.hi.toFixed(1)}% (${modeBin.cnt}건)</span>
      </div>
      <div style="display:flex;align-items:flex-end;gap:4px;height:46px;padding-top:4px">
        ${bins.map((b) => {
          const h = Math.max(12, Math.round((b.cnt / maxC) * 100));
          const isMode = b === modeBin;
          return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;height:100%;justify-content:flex-end" title="${b.lo.toFixed(1)}~${b.hi.toFixed(1)}%: ${b.cnt}건">
            <div style="font-size:9.5px;color:${isMode ? '#4f46e5' : 'var(--muted)'};font-weight:${isMode ? 800 : 500}">${b.cnt || ''}</div>
            <div style="width:100%;height:${h}%;border-radius:4px 4px 0 0;background:${isMode ? 'linear-gradient(180deg,#4f46e5,#818cf8)' : 'rgba(100,116,139,.28)'}"></div>
          </div>`;
        }).join('')}
      </div>
      <div style="display:flex;justify-content:space-between;font-size:9.5px;color:var(--muted);margin-top:2px">
        <span>${minR.toFixed(1)}%</span>
        <button id="dwApplyModeRate" type="button" data-mode="${modeMid}" style="border:none;background:none;color:#4f46e5;font-weight:800;font-size:10.5px;cursor:pointer;padding:0">⚡ 최빈 중앙(${modeMid}%) 적용</button>
        <span>${maxR.toFixed(1)}%</span>
      </div>
    </div>`;
}

function buildBidPriceSimHtml(o) {
  const dt = o.detail || {};
  const bsis = o._bsis || {};
  const initBase = bsis.bssamt || dt.asignWon || dt.presmptWon || (o.budgetMan > 0 ? o.budgetMan * 10000 : 0);
  if (!initBase && o.stageType !== 'bid') return '';
  const rateNum = parseFloat(String(dt.awardRate || '').replace('%', '')) || 87.745;
  const bidNoHint = dt.bidNo || (String(o.id || '').startsWith('g2b-') ? String(o.id).slice(4) : '');
  const initRng = bsis.rngPct || 3;
  return `
    <div class="domain-box" style="margin-top:10px;border-color:#c7d2fe;background:linear-gradient(180deg,rgba(79,70,229,.05),transparent)">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;margin-bottom:8px">
        <h4 style="margin:0">🎯 K-Bid급 투찰가 · A값 · 복수예가 시뮬레이터</h4>
        ${bidNoHint ? `<button id="simLoadBsisBtn" type="button" class="btn btn-sm btn-primary" style="padding:3px 8px;font-size:11px">${bsis.bssamt ? '🔄 기초금액 재조회' : '🔍 기초금액·A값 자동조회'}</button>` : ''}
      </div>
      ${bsis.bssamt ? `<div style="font-size:11px;padding:5px 8px;border-radius:6px;background:rgba(16,185,129,.1);color:#047857;margin-bottom:7px;font-weight:600">✅ 나라장터 실측 기초금액 ${fmt(bsis.bssamt)}원 · 예가폭 ±${bsis.rngPct}%${bsis.aVal > 0 ? ` · A값 ${fmt(bsis.aVal)}원 (${esc(bsis.aBreakdown)})` : ''}${bsis.netCost > 0 ? ` · 순공사원가 ${fmt(bsis.netCost)}원` : ''}</div>` : ''}
      <div style="display:grid;grid-template-columns:1fr 105px;gap:6px;margin-bottom:6px">
        <label style="font-size:11px;color:var(--muted)">기초금액/배정예산 (원)
          <input id="simBaseWon" class="input" type="number" value="${initBase || 100000000}" step="100000" style="width:100%;margin-top:2px;padding:5px 7px;font-size:12px" />
        </label>
        <label style="font-size:11px;color:var(--muted)">낙찰하한율 (%)
          <input id="simLwltRate" class="input" type="number" value="${rateNum}" step="0.005" min="10" max="100" style="width:100%;margin-top:2px;padding:5px 7px;font-size:12px" />
        </label>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px">
        <label style="font-size:11px;color:var(--muted)">A값 합계 (법정경비·안전·보험, 원)
          <input id="simAValWon" class="input" type="number" value="${bsis.aVal || 0}" step="10000" min="0" style="width:100%;margin-top:2px;padding:5px 7px;font-size:12px" />
        </label>
        <label style="font-size:11px;color:var(--muted)">순공사원가 (98% 미달 검증, 원)
          <input id="simNetCostWon" class="input" type="number" value="${bsis.netCost || 0}" step="100000" min="0" style="width:100%;margin-top:2px;padding:5px 7px;font-size:12px" />
        </label>
      </div>
      <div style="margin-bottom:8px">
        <div style="display:flex;justify-content:space-between;font-size:11.5px;margin-bottom:3px">
          <span>예상 사정률</span><b id="simAssLbl" style="color:var(--c-corp)">0.00% (예정가격 100.00%)</b>
        </div>
        <input id="simAssRange" type="range" min="-3" max="3" step="0.05" value="0" style="width:100%;accent-color:#4f46e5" />
      </div>
      <div id="simResultBox" style="padding:8px 10px;border-radius:8px;background:var(--bg);border:1px solid var(--border);margin-bottom:8px"></div>
      <div id="simGridBox" style="display:grid;grid-template-columns:repeat(3,1fr);gap:5px;font-size:11px;margin-bottom:8px"></div>

      <!-- K-Bid 15 Multi-Price & 1,365 Combinations Drawer -->
      <div style="padding:8px 9px;border-radius:8px;background:var(--bg);border:1px solid var(--border)">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:6px">
          <b style="font-size:11.5px;color:#4f46e5">🎲 복수예비가격 15개 추첨 · 1,365조합 분석</b>
          <div style="display:flex;gap:4px">
            <button type="button" class="toggle-pill ${initRng === 2 ? 'on' : ''}" data-sim-rng="2" style="padding:2px 7px;font-size:10.5px">±2% 국가</button>
            <button type="button" class="toggle-pill ${initRng !== 2 ? 'on' : ''}" data-sim-rng="3" style="padding:2px 7px;font-size:10.5px">±3% 지방</button>
            <button id="simAutoDraw4" type="button" class="btn btn-sm btn-primary" style="padding:2px 8px;font-size:10.5px">🎲 4개 추첨</button>
            <button id="simRegen15" type="button" class="btn btn-sm" style="padding:2px 7px;font-size:10.5px">🔄 재생성</button>
          </div>
        </div>
        <div id="sim15Grid" style="display:grid;grid-template-columns:repeat(5,1fr);gap:4px;margin-bottom:7px"></div>
        <div id="sim1365Stats" style="font-size:11px;color:var(--muted)"></div>
      </div>
    </div>
  `;
}

function wireBidPriceSim(o) {
  const baseEl = $('simBaseWon'), rateEl = $('simLwltRate'), rangeEl = $('simAssRange');
  const aEl = $('simAValWon'), netEl = $('simNetCostWon');
  const lblEl = $('simAssLbl'), resEl = $('simResultBox'), gridEl = $('simGridBox');
  const grid15El = $('sim15Grid'), stats1365El = $('sim1365Stats');
  if (!baseEl || !rateEl || !rangeEl || !resEl) return;

  let rngPct = o?._bsis?.rngPct || 3;
  let slots15 = generate15MultiPrices(rngPct);
  let pickedIdx = new Set([4, 6, 8, 10]);

  const calc = () => {
    const base = Math.max(0, Number(baseEl.value) || 0);
    const lwlt = Math.max(1, Math.min(100, Number(rateEl.value) || 87.745));
    const aVal = Math.max(0, Number(aEl?.value) || 0);
    const netCost = Math.max(0, Number(netEl?.value) || 0);
    const ass = Number(rangeEl.value) || 0;
    const estPrice = Math.round(base * (1 + ass / 100));
    const { calcBid, netFloor, netWarn, finalBid } = calcOptimalBidWon(estPrice, lwlt, aVal, netCost);
    window._lastSimFinalBid = finalBid;
    lblEl.textContent = `${ass >= 0 ? '+' : ''}${ass.toFixed(2)}% (예정가격 ${(100 + ass).toFixed(2)}%)`;
    resEl.innerHTML = `
      <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px">
        <span style="color:var(--muted)">예상 예정가격${aVal > 0 ? ' (A값 공식 적용)' : ''}</span><b>${fmt(estPrice)}원</b>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;gap:6px">
        <span style="font-size:12px;font-weight:700;color:#4f46e5">${netWarn ? '안전 최저 투찰한도 (순공사 98%)' : `최적 투찰 하한가 (${lwlt}%)`}</span>
        <div style="display:flex;align-items:center;gap:6px">
          <b style="font-size:14px;color:${netWarn ? '#dc2626' : '#059669'}">${fmt(finalBid)}원</b>
          <button id="simCopyBtn" type="button" class="btn btn-sm" style="padding:2px 7px;font-size:11px">복사</button>
        </div>
      </div>
      ${aVal > 0 ? `<div style="font-size:10.5px;color:var(--muted);margin-top:3px">산식: (${fmt(estPrice)} - A값 ${fmt(aVal)}) × ${lwlt}% + A값 = ${fmt(calcBid)}원</div>` : ''}
      ${netWarn ? `<div style="margin-top:5px;padding:5px 8px;border-radius:6px;background:rgba(220,38,38,.1);color:#b91c1c;font-size:11px;font-weight:700">⚠️ 순공사원가 98% 미달 경고! 산출가(${fmt(calcBid)}원) &lt; 순공사 98%(${fmt(netFloor)}원) → ${fmt(netFloor)}원 이상 투찰 필수</div>` : (netFloor > 0 ? `<div style="margin-top:4px;font-size:10.5px;color:#059669">✅ 순공사원가 98% 기준(${fmt(netFloor)}원) 안전 통과</div>` : '')}
    `;
    $('simCopyBtn')?.addEventListener('click', () => {
      navigator.clipboard?.writeText(String(finalBid));
      toast(`📋 권장 투찰가 ${fmt(finalBid)}원 복사 완료`);
    });
    const steps = [-2.0, -1.0, 0.0, 0.5, 1.0, 2.0];
    gridEl.innerHTML = steps.map((s) => {
      const bid = calcOptimalBidWon(Math.round(base * (1 + s / 100)), lwlt, aVal, netCost).finalBid;
      const active = Math.abs(s - ass) < 0.06;
      return `<div style="padding:5px 6px;border-radius:6px;border:1px solid ${active ? '#4f46e5' : 'var(--border)'};background:${active ? 'rgba(79,70,229,.08)' : 'var(--bg)'};text-align:center">
        <div style="color:var(--muted);font-size:10px">${s >= 0 ? '+' : ''}${s.toFixed(1)}%</div>
        <div style="font-weight:800;font-size:11px">${fmtDec(bid / 1e8, 2)}억</div>
      </div>`;
    }).join('');

    // Render 15 multi-prices & exact 1,365 combinations stats
    if (grid15El && stats1365El) {
      grid15El.innerHTML = slots15.map((v, idx) => {
        const on = pickedIdx.has(idx);
        return `<button type="button" data-slot15="${idx}" style="padding:4px 2px;border-radius:6px;border:1px solid ${on ? '#4f46e5' : 'var(--border)'};background:${on ? '#4f46e5' : 'var(--card)'};color:${on ? '#fff' : 'var(--text)'};font-size:10px;font-weight:${on ? 800 : 600};cursor:pointer;text-align:center">
          <div>#${String(idx + 1).padStart(2, '0')}</div>
          <div>${v >= 0 ? '+' : ''}${v.toFixed(2)}%</div>
        </button>`;
      }).join('');
      grid15El.querySelectorAll('[data-slot15]').forEach((b) => {
        b.addEventListener('click', () => {
          const idx = Number(b.dataset.slot15);
          if (pickedIdx.has(idx)) pickedIdx.delete(idx);
          else {
            if (pickedIdx.size >= 4) pickedIdx.delete([...pickedIdx][0]);
            pickedIdx.add(idx);
          }
          if (pickedIdx.size === 4) {
            const avg = [...pickedIdx].reduce((s, i) => s + slots15[i], 0) / 4;
            rangeEl.value = avg.toFixed(2);
          }
          calc();
        });
      });
      const st = analyze1365Combinations(slots15, base, lwlt, aVal, netCost);
      stats1365El.innerHTML = `
        <div style="display:flex;justify-content:space-between;margin-bottom:4px">
          <span>선택 ${pickedIdx.size}/4개 · 전체 <b>${fmt(st.count)}조합</b> 분석</span>
          <span style="color:#059669;font-weight:700">중앙 추천: ${fmt(st.bidMed)}원</span>
        </div>
        <div style="display:flex;align-items:flex-end;gap:3px;height:28px;margin-bottom:4px">
          ${st.bins.map((cnt, bi) => {
            const h = Math.max(15, Math.round((cnt / st.maxBin) * 100));
            return `<div style="flex:1;height:${h}%;border-radius:3px 3px 0 0;background:${bi === 3 ? '#4f46e5' : 'rgba(79,70,229,.35)'}" title="구간 ${bi + 1}: ${cnt}조합"></div>`;
          }).join('')}
        </div>
        <div style="display:flex;justify-content:space-between;font-size:10px">
          <span>하위10%: ${fmtDec(st.bidP10 / 1e8, 2)}억 (${st.rP10 >= 0 ? '+' : ''}${st.rP10.toFixed(2)}%)</span>
          <span>상위90%: ${fmtDec(st.bidP90 / 1e8, 2)}억 (${st.rP90 >= 0 ? '+' : ''}${st.rP90.toFixed(2)}%)</span>
        </div>`;
    }
  };

  $('simAutoDraw4')?.addEventListener('click', () => {
    const idxs = Array.from({ length: 15 }, (_, i) => i).sort(() => Math.random() - 0.5).slice(0, 4);
    pickedIdx = new Set(idxs);
    const avg = idxs.reduce((s, i) => s + slots15[i], 0) / 4;
    rangeEl.value = avg.toFixed(2);
    calc();
    toast(`🎲 4개 예가 추첨 (#${idxs.map((i) => i + 1).sort((a, b) => a - b).join(', #')}) → 사정률 ${avg >= 0 ? '+' : ''}${avg.toFixed(2)}%`);
  });
  $('simRegen15')?.addEventListener('click', () => {
    slots15 = generate15MultiPrices(rngPct);
    const avg = [...pickedIdx].reduce((s, i) => s + slots15[i], 0) / Math.max(1, pickedIdx.size);
    if (pickedIdx.size === 4) rangeEl.value = avg.toFixed(2);
    calc();
    toast(`🔄 ±${rngPct}% 복수예비가격 15개 재생성 완료`);
  });
  document.querySelectorAll('[data-sim-rng]').forEach((b) => {
    b.addEventListener('click', () => {
      rngPct = Number(b.dataset.simRng) || 3;
      document.querySelectorAll('[data-sim-rng]').forEach((x) => x.classList.toggle('on', Number(x.dataset.simRng) === rngPct));
      slots15 = generate15MultiPrices(rngPct);
      calc();
    });
  });
  $('simLoadBsisBtn')?.addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    const bidNo = o?.detail?.bidNo || (String(o?.id || '').startsWith('g2b-') ? String(o.id).slice(4) : '');
    if (!bidNo) return;
    btn.disabled = true; btn.textContent = '조회 중…';
    const bsis = await fetchBidBsisAmountLive(bidNo);
    if (bsis && bsis.bssamt > 0) {
      o._bsis = bsis;
      toast(`✅ 기초금액 ${fmt(bsis.bssamt)}원${bsis.aVal > 0 ? ` · A값 ${fmt(bsis.aVal)}원` : ''} 자동 반영!`);
      openOppDrawer(o);
    } else {
      btn.disabled = false; btn.textContent = '🔍 재시도';
      toast('ℹ️ 나라장터 기초금액 미공개(또는 물품/사전규격) 공고입니다. 직접 입력해 계산하세요.');
    }
  });

  baseEl.addEventListener('input', calc);
  rateEl.addEventListener('input', calc);
  rangeEl.addEventListener('input', calc);
  aEl?.addEventListener('input', calc);
  netEl?.addEventListener('input', calc);
  calc();
}

async function ensureAwardHistoryLoaded() {
  if (S.awardCache.loaded) return S.awardCache.list;
  if (S.awardCache.loading) {
    for (let i = 0; i < 40 && S.awardCache.loading; i++) await new Promise((r) => setTimeout(r, 150));
    return S.awardCache.list;
  }
  const { dataGoEnc } = getApiKeys();
  if (!dataGoEnc) return [];
  S.awardCache.loading = true;
  try {
    const nowMs = Date.now();
    const kst = (ms) => {
      const d = new Date(ms + 9 * 3600000);
      const p = (n) => String(n).padStart(2, '0');
      const ymd = `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}`;
      return { ymd, dt: `${ymd}${p(d.getUTCHours())}${p(d.getUTCMinutes())}` };
    };
    // ScsbidInfoService enforces <= 5 days per request -> query two 4-day windows in parallel (8 days total)!
    const w1Bgn = `${kst(nowMs - 4 * 86400000).ymd}0000`, w1End = kst(nowMs).dt;
    const w2Bgn = `${kst(nowMs - 8 * 86400000).ymd}0000`, w2End = `${kst(nowMs - 4 * 86400000).ymd}0000`;
    const ops = [
      ['용역', 'getScsbidListSttusServc'],
      ['공사', 'getScsbidListSttusCnstwk'],
      ['물품', 'getScsbidListSttusThng'],
    ];
    const all = [];
    const seen = new Set();
    const tasks = [];
    for (const [div, op] of ops) {
      for (const [bgnDt, endDt] of [[w1Bgn, w1End], [w2Bgn, w2End]]) {
        tasks.push((async () => {
          try {
            const u = `https://apis.data.go.kr/1230000/as/ScsbidInfoService/${op}?serviceKey=${dataGoEnc}&inqryDiv=1&inqryBgnDt=${bgnDt}&inqryEndDt=${endDt}&pageNo=1&numOfRows=500&type=json`;
            const r = await fetch(u);
            if (!r.ok) return;
            const j = await r.json();
            const raw = j?.response?.body?.items;
            const arr = Array.isArray(raw) ? raw : (raw?.item ? (Array.isArray(raw.item) ? raw.item : [raw.item]) : []);
            for (const x of arr) {
              const key = `${x.bidNtceNo || ''}-${x.bidNtceOrd || ''}-${x.bidwinnrNm || ''}`;
              if (seen.has(key)) continue;
              seen.add(key);
              const rate = parseFloat(x.sucsfbidRate);
              if (!x.bidwinnrNm && !rate) continue;
              all.push({
                div,
                bidNo: x.bidNtceNo || '',
                title: x.bidNtceNm || '',
                org: x.dminsttNm || '',
                winner: x.bidwinnrNm || '-',
                ceo: x.bidwinnrCeoNm || '',
                tel: x.bidwinnrTelNo || '',
                amt: Number(x.sucsfbidAmt || 0) || 0,
                rate: Number.isFinite(rate) ? rate : null,
                bidders: Number(x.prtcptCnum || 0) || 0,
                date: String(x.fnlSucsfDate || x.rlOpengDt || '').slice(0, 10),
              });
            }
          } catch {}
        })());
      }
    }
    await Promise.all(tasks);
    all.sort((a, b) => String(b.date).localeCompare(String(a.date)));
    S.awardCache.list = all;
    S.awardCache.loaded = all.length > 0;
    return all;
  } finally {
    S.awardCache.loading = false;
  }
}

function matchAwardBenchmarks(o, awards) {
  if (!awards?.length) return { sameOrg: [], similar: [], pool: [], avgRate: null, avgBidders: null, totalScanned: 0 };
  const normOrg = (s) => String(s || '').replace(/\s+/g, '').replace(/(주식회사|\(주\)|특별자치시|특별자치도|광역시|특별시)/g, '').toLowerCase();
  const oOrg = normOrg(o.org);
  const orgTokens = String(o.org || '').split(/\s+/).filter((t) => t.length >= 2);
  const sameOrg = awards.filter((a) => {
    const aOrg = normOrg(a.org);
    if (!aOrg || !oOrg) return false;
    return aOrg === oOrg || (oOrg.length >= 4 && (aOrg.includes(oOrg) || oOrg.includes(aOrg))) || (orgTokens.length >= 2 && orgTokens.every((t) => a.org.includes(t)));
  });
  const titleKws = String(`${o.title || ''} ${o.field || ''}`).match(/[가-힣A-Za-z0-9]{2,}/g) || [];
  const stop = new Set(['2026', '2026년', '2027', '2027년', '공사', '용역', '물품', '구매', '입찰', '공고', '긴급', '사업', '설치', '교체', '유지', '관리', '위탁']);
  const kws = [...new Set(titleKws.filter((w) => !stop.has(w) && w.length >= 2))].slice(0, 6);
  const similar = awards.filter((a) => {
    if (sameOrg.includes(a)) return false;
    const hay = `${a.title} ${a.org}`;
    return kws.some((k) => hay.includes(k));
  });
  const pool = [...sameOrg.slice(0, 12), ...similar.slice(0, Math.max(0, 12 - sameOrg.length))];
  const rates = pool.map((x) => x.rate).filter((v) => v !== null && v > 20 && v <= 105);
  const bids = pool.map((x) => x.bidders).filter((v) => v > 0);
  const avgRate = rates.length ? (rates.reduce((s, v) => s + v, 0) / rates.length) : null;
  const avgBidders = bids.length ? (bids.reduce((s, v) => s + v, 0) / bids.length) : null;
  return { sameOrg: sameOrg.slice(0, 5), similar: similar.slice(0, 5), pool: pool.slice(0, 5), rates, avgRate, avgBidders, totalScanned: awards.length };
}

function resolveSidoSlugFromText(txt) {
  const s = String(txt || '');
  if (!s) return '';
  const sidos = S.core?.sbizSummary?.sidos || [];
  for (const x of sidos) {
    if (s.includes(x.name) || (x.short && s.includes(x.short))) return x.slug;
  }
  for (const [k, sd] of Object.entries(OPP_SIDO_TO_SD)) {
    if (s.includes(k)) {
      const reg = (S.fusion?.regions || []).find((r) => r.sd === sd && r.sidoSlug);
      if (reg?.sidoSlug) return reg.sidoSlug;
    }
  }
  return '';
}

function computeSggMedianLatLon(active, exactSgg) {
  if (!active || !active.n) return null;
  const sggIdx = exactSgg ? (active.dicts?.sgg || []).indexOf(exactSgg) : -1;
  const lats = [], lons = [];
  const step = sggIdx >= 0 ? 1 : Math.max(1, Math.floor(active.n / 2000));
  for (let i = 0; i < active.n; i += step) {
    if (sggIdx >= 0 && active.cols.sgg[i] !== sggIdx) continue;
    const la = active.lat[i] / 1e6, lo = active.lon[i] / 1e6;
    if (la >= 33 && la <= 39 && lo >= 124 && lo <= 132) {
      lats.push(la);
      lons.push(lo);
    }
  }
  if (!lats.length) return null;
  lats.sort((a, b) => a - b);
  lons.sort((a, b) => a - b);
  const mid = Math.floor(lats.length / 2);
  return [lats[mid], lons[mid]];
}

async function jumpOppTo1kmCatchment(o) {
  const reg = S.fusionByRid.get(o._fusionRid ?? o.rid);
  const sidoMapName = reg ? (S.core?.sbizSummary?.sidos || []).find((x) => x.slug === reg.sidoSlug)?.name || '' : '';
  const sidoShort = reg ? (S.core?.sbizSummary?.sidos || []).find((x) => x.slug === reg.sidoSlug)?.short || '' : '';
  let sidoSlug = reg?.sidoSlug || resolveSidoSlugFromText(`${o._regionFull || ''} ${o.region || ''} ${o.org || ''}`);

  // 1) Try exact VWorld Place/Address Geocoding for the bidding agency/site
  const cleanOrg = String(o.org || '').replace(/\([^)]*\)/g, '').trim();
  const isSidoOnlyOrg = /^(서울특별시|부산광역시|대구광역시|인천광역시|광주광역시|대전광역시|울산광역시|세종특별자치시|경기도|강원특별자치도|충청북도|충청남도|전북특별자치도|전라남도|경상북도|경상남도|제주특별자치도)$/.test(cleanOrg);
  const isGenericOrg = !cleanOrg || isSidoOnlyOrg || /^(조달청|국방부|방위사업청|한국전력공사|한국토지주택공사|대한민국)$/.test(cleanOrg);
  const queries = [];
  if (!isGenericOrg) {
    if (sidoShort && !cleanOrg.includes(sidoShort)) queries.push(`${sidoShort} ${cleanOrg}`);
    queries.push(cleanOrg);
  } else if (isSidoOnlyOrg) {
    queries.push(`${cleanOrg}청`);
  }
  if (reg?.name) queries.push(`${sidoMapName || sidoShort} ${reg.name}청`.trim(), `${sidoMapName || sidoShort} ${reg.name}`.trim());

  toast(`🔍 ${cleanOrg || reg?.name || '입찰현장'} 정밀 좌표 및 상권 동기화 중…`);
  let vwHit = null;
  for (const q of queries) {
    try {
      const hit = await searchVworldPlace(q);
      if (!hit || !(hit.lat >= 33 && hit.lat <= 39 && hit.lon >= 124 && hit.lon <= 132)) continue;
      // Verify VWorld hit is in the SAME sido AND (when sigungu known) same sigungu (prevent mountain/wrong-district mismatch!)
      const hitAddr = `${hit.addr || ''} ${hit.title || ''}`;
      const hitSlug = resolveSidoSlugFromText(hitAddr);
      if (sidoSlug && hitSlug && hitSlug !== sidoSlug) continue;
      if (reg?.name && hit.addr && !hit.addr.includes(reg.name) && !hit.addr.includes(reg.name.replace(/시$|군$|구$/, ''))) continue;
      vwHit = hit;
      if (!sidoSlug && hitSlug) sidoSlug = hitSlug;
      break;
    } catch {}
  }

  if (!sidoSlug) {
    toast('ℹ️ 전국·지역 미지정 공고입니다. 상권지도에서 원하는 시도·시군구를 직접 선택해 주세요.');
    return;
  }

  // 2) Load the exact Sbiz sido vault FIRST, then match exact sigungu & render Sbiz tab cleanly
  closeDrawer();
  S.gisRadius = 1000;
  S.sbizView = 'map';
  S.sbizQ = '';
  S.sbizL1 = '';
  S.sbizYear = '';
  S.sbizMonth = '';
  S.sbizPeriod = '';

  let loaded = null;
  try {
    loaded = await loadSbizSido(sidoSlug);
  } catch {
    toast('상권 데이터를 불러오지 못했습니다.');
    return;
  }

  const sggList = loaded?.dicts?.sgg || [];
  let exactSgg = '';
  if (reg?.name) {
    exactSgg = sggList.find((g) => g === reg.name || g.endsWith(' ' + reg.name) || cleanSbizLabel(g) === reg.name) || '';
  }
  if (!exactSgg && vwHit?.addr) {
    exactSgg = sggList.find((g) => {
      const cl = cleanSbizLabel(g);
      return cl && vwHit.addr.includes(cl);
    }) || '';
  }
  S.sbizSgg = exactSgg;

  // Switch to Sbiz tab with exact sido & sigungu already set (skip fitBounds so zoom 15 sticks cleanly!)
  S._skipSbizFitOnce = true;
  S.tab = 'sbiz';
  document.querySelectorAll('[data-tab]').forEach((el) => {
    el.classList.toggle('active', el.dataset.tab === 'sbiz');
  });
  window.scrollTo({ top: 0, behavior: 'instant' });
  renderCurrentTab();

  // 3) Choose exact coordinate: VWorld building coordinate (sanity-checked against sgg median) or exact sgg downtown median
  const sggMed = computeSggMedianLatLon(loaded, exactSgg);
  let lat = 0, lon = 0, coordTag = '';
  if (vwHit && (!sggMed || haversineM(vwHit.lat, vwHit.lon, sggMed[0], sggMed[1]) <= 25000)) {
    lat = vwHit.lat;
    lon = vwHit.lon;
    coordTag = '정밀좌표';
  } else if (sggMed) {
    [lat, lon] = sggMed;
    coordTag = `${cleanSbizLabel(exactSgg) || reg?.name || loaded.name} 중심`;
  } else if (reg) {
    [lat, lon] = regionCentroidLatLon(reg.rid);
    coordTag = `${reg.name} 기준`;
  } else {
    return;
  }

  const label = `${cleanOrg || cleanSbizLabel(exactSgg) || loaded.name} (입찰현장 · ${coordTag})`;
  setTimeout(async () => {
    if (S.leafletMap) {
      S.leafletMap.setView([lat, lon], 15, { animate: false });
      renderViewportSbizMarkers(loaded);
    }
    await runRadiusCatchment(lat, lon, loaded, label);
    const cnt = S.catchment?.stats?.cnt || 0;
    toast(`🗺️ ${cleanOrg || cleanSbizLabel(exactSgg)} 반경 1km 상권 (${fmt(cnt)}개 상가) 정밀 연동 완료!`);
  }, 240);
}

function openBidReviewReport(o) {
  const dt = o.detail || {};
  const bsis = o._bsis || {};
  const files = o.attachments || [];
  const partners = findBidPartnerBuilders(o, 5);
  const bm = S.awardCache.loaded ? matchAwardBenchmarks(o, S.awardCache.list) : null;
  const qual = evalQualificationScore(o);
  const myRec = S.myBiz[o.id] || null;
  const baseWon = Number($('simBaseWon')?.value) || bsis.bssamt || dt.asignWon || dt.presmptWon || (o.budgetMan > 0 ? o.budgetMan * 10000 : 0);
  const lwlt = Number($('simLwltRate')?.value) || parseFloat(String(dt.awardRate || '').replace('%', '')) || 87.745;
  const aVal = Number($('simAValWon')?.value) || bsis.aVal || 0;
  const netCost = Number($('simNetCostWon')?.value) || bsis.netCost || 0;
  const simRows = baseWon > 0 ? [-2.0, -1.0, 0.0, 0.5, 1.0, 2.0].map((s) => {
    const est = Math.round(baseWon * (1 + s / 100));
    const { finalBid, netWarn } = calcOptimalBidWon(est, lwlt, aVal, netCost);
    return `<tr><td>${s >= 0 ? '+' : ''}${s.toFixed(1)}%</td><td>${fmt(est)}원</td><td><b>${fmt(finalBid)}원</b>${netWarn ? ' ⚠️98%' : ''}</td><td>${fmtDec(finalBid / 1e8, 2)}억</td></tr>`;
  }).join('') : '';
  const todayStr = getTodayKstIso();
  const existing = $('nxA4ReviewOverlay');
  if (existing) existing.remove();
  const wrap = document.createElement('div');
  wrap.id = 'nxA4ReviewOverlay';
  wrap.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(15,23,42,.72);overflow:auto;padding:18px;display:flex;justify-content:center;align-items:flex-start';
  wrap.innerHTML = `
    <style id="nxA4PrintCss">
      #nxA4Sheet{width:100%;max-width:820px;background:#fff;color:#0f172a;border-radius:12px;padding:24px 26px;box-shadow:0 24px 60px rgba(0,0,0,.35);font-size:12px;line-height:1.45}
      #nxA4Sheet .bar{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;padding-bottom:10px;border-bottom:2px solid #1e293b;gap:10px}
      #nxA4Sheet .kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:10px 0}
      #nxA4Sheet .kpi{border:1px solid #cbd5e1;border-radius:8px;padding:8px 10px;background:#f8fafc}
      #nxA4Sheet .kpi .l{font-size:10.5px;color:#64748b}#nxA4Sheet .kpi .v{font-size:14px;font-weight:800;color:#0f172a;margin-top:2px}
      #nxA4Sheet h3{font-size:12.5px;margin:12px 0 6px;padding-left:7px;border-left:3.5px solid #4f46e5;color:#0f172a}
      #nxA4Sheet table{width:100%;border-collapse:collapse;font-size:11px;margin-bottom:6px}
      #nxA4Sheet th,#nxA4Sheet td{border:1px solid #cbd5e1;padding:4px 7px;text-align:left;color:#0f172a}
      #nxA4Sheet th{background:#f1f5f9;font-weight:700;width:18%}
      #nxA4Sheet .grid2{display:grid;grid-template-columns:1fr 1fr;gap:10px}
      #nxA4Sheet .sign{display:grid;grid-template-columns:1fr 220px;gap:12px;margin-top:12px;align-items:end}
      #nxA4Sheet .sign table th,#nxA4Sheet .sign table td{text-align:center;width:auto}
      @media print{
        @page{size:A4 portrait;margin:10mm}
        html,body{background:#fff!important;height:auto!important;overflow:visible!important;margin:0!important;padding:0!important}
        body.nx-a4-printing > *:not(#nxA4ReviewOverlay){display:none!important}
        body.nx-a4-printing #nxA4ReviewOverlay{display:block!important;position:static!important;inset:auto!important;width:100%!important;height:auto!important;background:#fff!important;padding:0!important;overflow:visible!important}
        #nxA4Sheet{display:block!important;box-shadow:none!important;border-radius:0!important;max-width:none!important;width:100%!important;padding:0!important;-webkit-print-color-adjust:exact;print-color-adjust:exact}
        #nxA4Sheet .no-print{display:none!important}
      }
    </style>
    <div id="nxA4Sheet">
      <div class="bar">
        <div>
          <div style="font-size:10px;color:#4f46e5;font-weight:800">${esc(S.admin?.brandTitle || 'NEXUSONE')} ${esc(S.admin?.brandBadge || 'PRO')} · 입찰 수주 검토 보고서 (1P Executive Brief)</div>
          <h1 style="font-size:16px;margin:2px 0 0;color:#0f172a">${esc(o.title)}</h1>
        </div>
        <div style="text-align:right;flex-shrink:0">
          <div style="font-size:10.5px;color:#475569;margin-bottom:5px">작성일: ${todayStr}</div>
          <div class="no-print" style="display:flex;gap:6px;justify-content:flex-end">
            <button id="nxA4PrintBtn" type="button" style="padding:6px 12px;border:none;border-radius:7px;background:#4f46e5;color:#fff;font-weight:700;cursor:pointer;font-size:12px">🖨️ A4 인쇄 / PDF</button>
            <button id="nxA4CloseBtn" type="button" style="padding:6px 11px;border:1px solid #cbd5e1;border-radius:7px;background:#fff;color:#0f172a;font-weight:700;cursor:pointer;font-size:12px">✕ 닫기</button>
          </div>
        </div>
      </div>
      <div class="kpis">
        <div class="kpi"><div class="l">기초금액 / 배정예산</div><div class="v">${baseWon > 0 ? fmtDec(baseWon / 1e8, 2) + '억' : '미기재'}</div></div>
        <div class="kpi"><div class="l">입찰마감 (D-Day)</div><div class="v">${esc(o.closeDate || '-')}${o.dday !== null && o.dday >= 0 ? ` (D-${o.dday})` : ''}</div></div>
        <div class="kpi"><div class="l">적격심사 자사 판정</div><div class="v" style="color:${qual.pass ? '#059669' : '#dc2626'}">${qual.pass ? '통과유력' : '보완필요'} (${qual.total}점)</div></div>
        <div class="kpi"><div class="l">${myRec?.myBidWon ? '나의 확정 투찰가' : '낙찰하한율 / 첨부'}</div><div class="v">${myRec?.myBidWon ? fmtDec(myRec.myBidWon / 1e8, 2) + '억' : `${lwlt}% · ${files.length}건`}</div></div>
      </div>
      ${aVal > 0 || netCost > 0 || myRec?.memo ? `<div style="padding:6px 10px;border:1px solid #cbd5e1;border-radius:7px;background:#f8fafc;font-size:11px;margin-bottom:8px">${aVal > 0 ? `<b>A값 적용:</b> ${fmt(aVal)}원 &nbsp;` : ''}${netCost > 0 ? `<b>순공사원가 98%:</b> ${fmt(Math.ceil((netCost * 0.98) / 1000) * 1000)}원 &nbsp;` : ''}${myRec ? `<b>내서류함(${esc(myRec.status)}):</b> ${esc(myRec.memo || '저장됨')}` : ''}</div>` : ''}
      <h3>1. 입찰 공고 상세내역 및 일정</h3>
      <table>
        <tr><th>발주/수요기관</th><td>${esc(o.org || '-')}</td><th>공고번호/차수</th><td>${esc(dt.bidNo || o.id)}</td></tr>
        <tr><th>지역 / 분야</th><td>${esc(o._regionFull || o.region || '전국')} · ${esc(o.field)}</td><th>계약/낙찰방법</th><td>${esc([dt.contractMethod, dt.awardMethod].filter(Boolean).join(' / ') || o.method || '-')}</td></tr>
        <tr><th>공고 / 개시일시</th><td>${esc(o.pubDateTime || o.pubDate || '-')} / ${esc(dt.bidBeginDt || '-')}</td><th>마감 / 개찰일시</th><td>${esc(dt.bidClseDt || o.closeDate || '-')} / ${esc(dt.opengDt || '-')}</td></tr>
        <tr><th>예가방식 / 공동도급</th><td>${esc(dt.priceMethod || '-')} · ${esc(dt.jointMethod || '-')}</td><th>담당자 / 업종제한</th><td>${esc([dt.ofclNm, dt.ofclTel, dt.ofclEmail].filter(Boolean).join(' · ') || '-')} / ${esc(dt.industryLimit || '-')}</td></tr>
      </table>
      <div class="grid2">
        <div>
          <h3>2. 사정률별 투찰가 시뮬레이션 (하한율 ${lwlt}%)</h3>
          ${simRows ? `<table><tr><th>사정률</th><th>예상 예정가격</th><th>권장 투찰 하한가</th><th>억 환산</th></tr>${simRows}</table>` : '<p>예산 미기재 공고입니다.</p>'}
        </div>
        <div>
          <h3>3. 과거 낙찰·경쟁사 벤치마크 (최근 8일)</h3>
          ${bm && bm.pool?.length ? `
            <div style="font-size:11px;margin-bottom:4px">평균 낙찰률: <b>${bm.avgRate ? bm.avgRate.toFixed(2) + '%' : '-'}</b> · 평균 경쟁사: <b>${bm.avgBidders ? bm.avgBidders.toFixed(1) + '개사' : '-'}</b></div>
            <table><tr><th>낙찰사</th><th>낙찰률</th><th>참가</th><th>일자</th></tr>
            ${bm.pool.slice(0, 4).map((x) => `<tr><td>${esc(x.winner)}</td><td>${x.rate ? x.rate.toFixed(2) + '%' : '-'}</td><td>${x.bidders}사</td><td>${esc(x.date)}</td></tr>`).join('')}
            </table>` : '<p style="color:#64748b">상세 서랍에서 "실시간 낙찰 분석" 조회 후 출력하면 실측 낙찰 데이터가 함께 반영됩니다.</p>'}
        </div>
      </div>
      <div class="grid2">
        <div>
          <h3>4. 공고 첨부서류 (${files.length}건)</h3>
          ${files.length ? `<ul style="margin:4px 0 0 16px;padding:0">${files.map((f) => `<li>${esc(f.name)}</li>`).join('')}</ul>` : '<p style="color:#64748b">원문 공고 링크 참조</p>'}
        </div>
        <div>
          <h3>5. 지역 추천 협력 파트너 TOP 5</h3>
          ${partners.length ? `<table><tr><th>업체명</th><th>업종</th><th>매출</th><th>연락처</th></tr>${partners.map(({ r, ind }) => `<tr><td>${esc(r[0])}</td><td>${esc(ind)}</td><td>${r[14] > 0 ? fmt(Math.round(r[14])) + '억' : '-'}</td><td>${esc(r[6] || '-')}</td></tr>`).join('')}</table>` : '<p style="color:#64748b">전국/미지정 공고</p>'}
        </div>
      </div>
      <div class="sign">
        <div style="border:1px solid #cbd5e1;border-radius:8px;padding:8px 10px;background:#f8fafc">
          <b>✅ 수주 검토 체크리스트</b><br>
          [ ] 필수 면허·실적·지역제한 확인 &nbsp; [ ] 과업지시서·내역서 원가 산출 &nbsp; [ ] 공동도급/협력사 협의 &nbsp; [ ] 참가자격등록 및 투찰 마감 확인
        </div>
        <table><tr><th>담당</th><th>팀장</th><th>임원</th></tr><tr style="height:36px"><td></td><td></td><td></td></tr></table>
      </div>
      ${S.isBuyerMode && S.admin?.a4Watermark !== false ? (() => {
        const bSt = loadBuyerState(S.tenantId);
        return `<div style="margin-top:8px;padding-top:6px;border-top:1px dashed #cbd5e1;display:flex;justify-content:space-between;font-size:9.5px;color:#64748b"><span>Licensed to <b>${esc(S.admin.companyName || S.admin.brandTitle)}</b> (${esc(S.tenantId)})${bSt.deptName ? ` · ${esc(bSt.deptName)}` : ''}${bSt.contact ? ` · ${esc(bSt.contact)}` : ''}</span><span>Authorized White-Label Edition · ${todayStr}</span></div>`;
      })() : ''}
    </div>`;
  document.body.classList.add('nx-a4-printing');
  document.body.appendChild(wrap);
  const closeA4 = () => {
    document.body.classList.remove('nx-a4-printing');
    wrap.remove();
  };
  wrap.addEventListener('click', (e) => { if (e.target === wrap) closeA4(); });
  $('nxA4CloseBtn')?.addEventListener('click', closeA4);
  $('nxA4PrintBtn')?.addEventListener('click', () => {
    document.body.classList.add('nx-a4-printing');
    window.print();
  });
}

function openOppDrawer(o) {
  const reg = S.fusionByRid.get(o._fusionRid ?? o.rid);
  const dt = o.detail || null;
  const files = o.attachments || [];
  const bidNoHint = dt?.bidNo || (String(o.id || '').startsWith('g2b-') ? String(o.id).slice(4) : '');
  const fmtWon = (w) => w > 0 ? `${fmt(w)}원 (${fmtDec(w / 1e8, 2)}억)` : '';

  const detailRows = dt ? [
    ['공고번호 / 차수', dt.bidNo],
    ['공고구분', dt.ntceKind],
    ['참조번호', dt.refNo],
    ['변경/취소 사유', dt.chgRsn],
    ['계약방법', dt.contractMethod],
    ['낙찰방법', dt.awardMethod],
    ['낙찰하한율', dt.awardRate],
    ['예정가격 결정방식', dt.priceMethod],
    ['배정예산액', fmtWon(dt.asignWon)],
    ['추정가격', fmtWon(dt.presmptWon)],
    ['부가세(VAT)', dt.vatWon > 0 ? `${fmt(dt.vatWon)}원` : ''],
    ['공동도급 방식', dt.jointMethod],
    ['업종제한 / 재입찰', [dt.industryLimit ? `업종 ${dt.industryLimit}` : '', dt.rebid ? `재입찰 ${dt.rebid}` : ''].filter(Boolean).join(' · ')],
    ['품목·업종 분류', dt.categoryNm],
    ['물품규격', dt.prdctSpec],
    ['입찰개시일시', dt.bidBeginDt],
    ['입찰마감일시', dt.bidClseDt],
    ['참가자격등록마감', dt.qualDt],
    ['개찰일시 / 장소', [dt.opengDt, dt.opengPlce].filter(Boolean).join(' · ')],
    ['납품기한', dt.dlvrDt],
    ['연계 사전규격번호', dt.bfSpecNo],
    ['발주 담당자', [dt.ofclNm, dt.ofclTel, dt.ofclEmail].filter(Boolean).join(' · ')],
  ].filter(([, v]) => v) : [];

  const feat = S.admin?.features || SALES_PACKAGES.premium.features;
  openDrawer({
    title: o.title,
    sub: `${o.source} · ${o.field}`,
    body: `
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px">
        <span class="tag tag-sbiz">ICP 적합도 ${o.icpScore}점</span>
        <span class="tag tag-bid">${o.budgetMan > 0 ? `예산 ${fmtDec(o.budgetMan / 10000, 1)}억 (${fmt(o.budgetMan)}만원)` : '예산 미기재'}</span>
        ${dt?.ntceKind ? `<span class="tag ${/취소/.test(dt.ntceKind) ? 'tag-re' : 'tag-corp'}">${esc(dt.ntceKind)}</span>` : ''}
        ${feat.bidDetail && files.length ? `<span class="tag tag-corp">📎 첨부서류 ${files.length}건</span>` : ''}
        ${o.dday !== null && o.dday >= 0 ? `<span class="tag tag-re">마감 D-${o.dday}</span>` : ''}
      </div>
      <div class="domain-box">
        <div class="domain-stat-row"><span>발주/관리기관</span><b>${esc(o.org || '-')}</b></div>
        <div class="domain-stat-row"><span>지역</span><b>${esc(o._regionFull || o.region || '전국')}</b></div>
        <div class="domain-stat-row"><span>방식/구분</span><b>${esc(o.method || '-')}</b></div>
        <div class="domain-stat-row"><span>공고일시 / 마감일</span><b>${esc(o.pubDateTime || o.pubDate || '-')} / ${esc(o.closeDate || '-')}</b></div>
      </div>

      ${feat.bidDetail ? `
      <div class="domain-box" style="margin-top:10px">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:6px">
          <h4 style="margin:0">📎 첨부서류 · 공고문 · 과업지시서 (${files.length}건)</h4>
          ${!dt && bidNoHint ? '<button id="dwLoadBidDetail" class="btn btn-sm btn-primary" type="button">🔍 실시간 상세·첨부 조회</button>' : ''}
        </div>
        ${files.length ? `
          <div style="display:flex;flex-direction:column;gap:6px">
            ${files.map((f) => `
              <a href="${esc(f.url)}" target="_blank" rel="noopener" style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:7px 10px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--text);text-decoration:none;font-size:12px">
                <span style="min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:600">${fileIconForName(f.name)} ${esc(f.name)}</span>
                <span style="flex-shrink:0;padding:2px 8px;border-radius:6px;background:var(--c-corp);color:#fff;font-size:11px;font-weight:700">⬇️ 다운로드</span>
              </a>
            `).join('')}
          </div>
        ` : `<div style="font-size:12px;color:var(--muted)">${dt ? '나라장터 API에 등록된 첨부파일이 없거나 원문 공고에서 확인 가능합니다.' : (bidNoHint ? '상단 "실시간 상세·첨부 조회" 버튼을 누르면 나라장터 첨부서류와 상세조건을 즉시 불러옵니다.' : '원문 공고 링크에서 첨부서류를 확인하세요.')}</div>`}
      </div>

      ${detailRows.length ? `
        <div class="domain-box" style="margin-top:10px">
          <h4 style="margin:0 0 6px">📋 입찰 상세내역 · 일정 · 낙찰조건 · 담당자</h4>
          ${detailRows.map(([k, v]) => `<div class="domain-stat-row"><span>${esc(k)}</span><b style="text-align:right;max-width:65%;word-break:break-word">${esc(v)}</b></div>`).join('')}
        </div>
      ` : ''}` : ''}

      ${feat.bidSim ? buildBidPriceSimHtml(o) : ''}

      ${feat.bidSim ? buildQualCheckHtml(o) : ''}

      ${buildMyBizHtml(o)}

      ${feat.bidAwards ? `
      <div class="domain-box" style="margin-top:10px">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:6px">
          <h4 style="margin:0">📊 과거 낙찰결과 · 경쟁사 투찰률 분석</h4>
          <button id="dwLoadAwards" class="btn btn-sm btn-primary" type="button">${S.awardCache.loaded ? '🔄 재분석' : '🔍 실시간 낙찰 분석'}</button>
        </div>
        <div id="dwAwardBox" style="font-size:12px;color:var(--muted)">나라장터 낙찰정보 API(최근 8일 용역·공사·물품)에서 동일 발주처·유사 공고의 평균 낙찰률과 주요 낙찰사를 분석합니다.</div>
      </div>` : ''}

      ${feat.bidPartners ? `
      <div class="domain-box" style="margin-top:10px">
        <h4 style="margin:0 0 6px">🤝 지역 · 업종 추천 협력 파트너 TOP 5 (12,198사 DB)</h4>
        <div id="dwPartnerBox" style="font-size:12px;color:var(--muted)">🔍 지역·업종 적합 건설·시설사 매칭 중…</div>
      </div>` : ''}

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
      ${feat.bidA4 ? '<button id="dwOppReport" class="btn btn-sm">📑 A4 검토서</button><button id="dwOppIcs" class="btn btn-emerald btn-sm">📅 캘린더(.ics)</button>' : ''}
      ${feat.bid1km && S.admin?.tabs?.sbiz !== false && (reg || (o.region && !/^전국/.test(o.region))) ? `<button id="dwOpp1km" class="btn btn-sm">🗺️ ${esc(reg?.name || '현장')} 1km 상권</button>` : ''}
      ${o.url ? `<a class="btn btn-amber btn-sm" href="${esc(o.url)}" target="_blank" rel="noopener">🔗 원문</a>` : ''}
      ${reg && S.admin?.tabs?.overview !== false ? `<button id="dwOpp360" class="btn btn-sm">⚡ ${esc(reg.name)} 360°</button>` : ''}
    `,
    onMount: () => {
      wireBidPriceSim(o);
      wireQualCheck(o);
      wireMyBiz(o);
      const renderAwardBox = (awards) => {
        const box = $('dwAwardBox');
        if (!box) return;
        const bm = matchAwardBenchmarks(o, awards);
        if (!bm.pool.length) {
          box.innerHTML = `<span>최근 8일 낙찰 ${fmt(bm.totalScanned)}건 중 동일 기관/유사 공고 이력이 없습니다.</span>`;
          return;
        }
        box.innerHTML = `
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:8px;text-align:center">
            <div style="padding:6px;border-radius:7px;background:var(--bg);border:1px solid var(--border)"><div style="font-size:10.5px;color:var(--muted)">평균 낙찰률</div><b style="font-size:13.5px;color:#4f46e5">${bm.avgRate ? bm.avgRate.toFixed(2) + '%' : '-'}</b></div>
            <div style="padding:6px;border-radius:7px;background:var(--bg);border:1px solid var(--border)"><div style="font-size:10.5px;color:var(--muted)">평균 경쟁률</div><b style="font-size:13.5px;color:#059669">${bm.avgBidders ? bm.avgBidders.toFixed(1) + '개사' : '-'}</b></div>
            <div style="padding:6px;border-radius:7px;background:var(--bg);border:1px solid var(--border)"><div style="font-size:10.5px;color:var(--muted)">동일기관/유사</div><b style="font-size:13.5px">${bm.sameOrg.length} / ${bm.similar.length}건</b></div>
          </div>
          ${buildAwardHistHtml(bm.rates)}
          ${bm.avgRate ? `<button id="dwApplyAvgRate" type="button" class="btn btn-sm" style="width:100%;margin-bottom:8px">🎯 평균 낙찰률(${bm.avgRate.toFixed(2)}%)을 투찰 시뮬레이터에 반영</button>` : ''}
          <div style="display:flex;flex-direction:column;gap:5px">
            ${bm.pool.map((x) => `
              <div style="padding:6px 8px;border:1px solid var(--border);border-radius:7px;background:var(--bg);font-size:11.5px">
                <div style="font-weight:700;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(x.title)}</div>
                <div style="display:flex;justify-content:space-between;gap:6px;margin-top:2px;font-size:11px;color:var(--muted)">
                  <span>🏆 <b>${esc(x.winner)}</b> (${esc(x.org)})</span>
                  <span style="white-space:nowrap;color:#4f46e5;font-weight:800">${x.rate ? x.rate.toFixed(2) + '%' : '-'} · ${x.bidders}사 · ${x.amt > 0 ? fmtDec(x.amt / 1e8, 2) + '억' : '-'}</span>
                </div>
              </div>`).join('')}
          </div>`;
        $('dwApplyAvgRate')?.addEventListener('click', () => {
          const rEl = $('simLwltRate');
          if (rEl && bm.avgRate) {
            rEl.value = bm.avgRate.toFixed(3);
            rEl.dispatchEvent(new Event('input'));
            toast(`🎯 과거 평균 낙찰률 ${bm.avgRate.toFixed(2)}% 시뮬레이터 반영 완료`);
          }
        });
        $('dwApplyModeRate')?.addEventListener('click', (ev) => {
          const rEl = $('simLwltRate');
          const modeVal = parseFloat(ev.currentTarget.dataset.mode);
          if (rEl && Number.isFinite(modeVal)) {
            rEl.value = modeVal.toFixed(3);
            rEl.dispatchEvent(new Event('input'));
            toast(`⚡ 발주처 최빈 구간 중앙값 ${modeVal.toFixed(2)}% 시뮬레이터 반영 완료`);
          }
        });
      };
      if (S.awardCache.loaded) renderAwardBox(S.awardCache.list);
      $('dwLoadAwards')?.addEventListener('click', async (e) => {
        const btn = e.currentTarget;
        btn.disabled = true; btn.textContent = '분석 중…';
        const awards = await ensureAwardHistoryLoaded();
        btn.disabled = false; btn.textContent = '🔄 재분석';
        renderAwardBox(awards);
      });
      $('dwOppPipe')?.addEventListener('click', () => addToPipeline({
        id: `opp:${o.id}`, domain: 'bid', title: o.title, sub: `${o.org} · ${o.field}`, region: o.region, valueMan: o.budgetMan,
      }));
      $('dwOppReport')?.addEventListener('click', () => openBidReviewReport(o));
      $('dwOppIcs')?.addEventListener('click', () => downloadOppIcs(o));
      $('dwOpp1km')?.addEventListener('click', () => jumpOppTo1kmCatchment(o));
      $('dwOpp360')?.addEventListener('click', () => { closeDrawer(); S.selectedRid = reg.rid; switchTab('overview'); });
      ensureBuildersLoaded().then(() => {
        const box = $('dwPartnerBox');
        if (!box) return;
        const partners = findBidPartnerBuilders(o, 5);
        if (!partners.length) {
          box.innerHTML = '<span>해당 지역·업종 매칭 건설사가 없습니다 (전국/미지정 공고는 건설·시설사 탭에서 검색하세요).</span>';
          return;
        }
        box.innerHTML = `<div style="display:flex;flex-direction:column;gap:6px">${partners.map(({ r, sameRid, ind }) => `
          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;padding:6px 8px;border:1px solid var(--border);border-radius:8px;background:var(--bg)">
            <div style="min-width:0">
              <div style="font-weight:800;font-size:12px;color:var(--text)">${esc(r[0])} <span style="font-size:10.5px;color:${sameRid ? '#059669' : '#4f46e5'}">${sameRid ? '📍동일시군구' : '🗺️동일시도'}</span></div>
              <div style="font-size:11px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(ind)} · 매출 ${r[14] > 0 ? fmt(Math.round(r[14])) + '억' : '-'} · 종업원 ${r[17] > 0 ? fmt(r[17]) + '명' : '-'}</div>
            </div>
            ${r[6] ? `<a href="tel:${esc(r[6])}" style="flex-shrink:0;padding:3px 7px;border-radius:6px;background:#ecfdf5;color:#047857;font-size:11px;font-weight:700;text-decoration:none">📞 ${esc(r[6])}</a>` : ''}
          </div>`).join('')}</div>`;
      }).catch(() => {});
      $('dwLoadBidDetail')?.addEventListener('click', async (e) => {
        const btn = e.currentTarget;
        btn.disabled = true;
        btn.textContent = '조회 중…';
        const res = await fetchSingleBidDetailLive(bidNoHint);
        if (res) {
          o.attachments = res.attachments;
          o.detail = res.detail;
          toast(`✅ 상세내역 · 첨부서류 ${res.attachments.length}건 불러오기 완료`);
          openOppDrawer(o);
        } else {
          btn.disabled = false;
          btn.textContent = '🔍 재시도';
          toast('나라장터 단건 조회 결과가 없습니다. 원문 공고를 확인하세요.');
        }
      });
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

function saveSbizBookmarks() {
  try { localStorage.setItem(tStorageKey('nx1_sbiz_bm_v38'), JSON.stringify(S.sbizBookmarks.slice(0, 15))); } catch {}
}

function polygonAreaM2(pts) {
  if (!pts || pts.length < 3) return 0;
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  let sum = 0;
  for (let i = 0; i < pts.length; i++) {
    const [la1, lo1] = pts[i];
    const [la2, lo2] = pts[(i + 1) % pts.length];
    sum += toRad(lo2 - lo1) * (2 + Math.sin(toRad(la1)) + Math.sin(toRad(la2)));
  }
  return Math.abs((sum * R * R) / 2);
}

function detectSidoSlugFromCoords(lat, lon, addrText = '') {
  const sidos = S.core?.sbizSummary?.sidos || [];
  if (!sidos.length) return '';
  const txt = String(addrText || '');
  const kwMap = [
    ['서울', 'seoul'], ['경기', 'gyeonggi'], ['인천', 'incheon'], ['부산', 'busan'],
    ['대구', 'daegu'], ['대전', 'daejeon'], ['울산', 'ulsan'], ['세종', 'sejong'],
    ['강원', 'gangwon'], ['충북', 'chungbuk'], ['충청북', 'chungbuk'], ['충남', 'chungnam'], ['충청남', 'chungnam'],
    ['전북', 'jeonbuk'], ['전라북', 'jeonbuk'], ['광주', 'jeonnam_gwangju'], ['전남', 'jeonnam_gwangju'], ['전라남', 'jeonnam_gwangju'],
    ['경북', 'gyeongbuk'], ['경상북', 'gyeongbuk'], ['경남', 'gyeongnam'], ['경상남', 'gyeongnam'], ['제주', 'jeju'],
  ];
  for (const [kw, slug] of kwMap) {
    if (txt.includes(kw) && sidos.some((s) => s.slug === slug)) return slug;
  }
  let best = sidos[0]?.slug || '';
  let bestD = Infinity;
  for (const s of sidos) {
    if (!s.lat || !s.lon) continue;
    const d = haversineM(lat, lon, s.lat, s.lon);
    if (d < bestD) { bestD = d; best = s.slug; }
  }
  return best;
}

function drawGpsMarkerOnMap() {
  if (!S.leafletMap || !S.leafletGpsLayer || !S.gpsPos) return;
  S.leafletGpsLayer.clearLayers();
  const { lat, lon, acc } = S.gpsPos;
  if (acc > 0 && acc <= 2000) {
    L.circle([lat, lon], { radius: acc, color: '#2563eb', fillColor: '#3b82f6', fillOpacity: 0.14, weight: 1.5 }).addTo(S.leafletGpsLayer);
  }
  L.marker([lat, lon], {
    zIndexOffset: 3000,
    icon: L.divIcon({
      className: '',
      html: '<div class="nx-gps-dot"></div>',
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    }),
  }).bindTooltip(`📍 내 현재 위치 (정확도 ±${Math.round(acc || 0)}m)`, { direction: 'top', offset: [0, -10] }).addTo(S.leafletGpsLayer);
  const chip = $('sbizGpsStatusChip');
  if (chip) {
    chip.textContent = `${S.gpsWatching ? '📡 실시간 GPS 추적중' : '📍 현위치 확인됨'} · ±${Math.round(acc || 0)}m`;
    chip.classList.remove('hidden');
  }
}

function stopGpsWatch() {
  if (S.gpsWatchId !== null && navigator.geolocation) {
    try { navigator.geolocation.clearWatch(S.gpsWatchId); } catch {}
  }
  S.gpsWatchId = null;
  S.gpsWatching = false;
  $('btnSbizTrack')?.classList.remove('btn-emerald');
  $('hudSbizTrack')?.classList.remove('tracking');
  drawGpsMarkerOnMap();
}

async function locateAndAnalyzeGps({ autoLoadSido = true } = {}) {
  if (!navigator.geolocation) return toast('브라우저에서 GPS 위치 정보를 지원하지 않습니다.');
  toast('📍 현재 GPS 위치 및 관할 시도 상권 확인 중…');
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude: lat, longitude: lon, accuracy: acc } = pos.coords;
      S.gpsPos = { lat, lon, acc: acc || 30, ts: Date.now() };
      let addrText = '';
      try {
        const vw = await queryVworldPoint(lon.toFixed(6), lat.toFixed(6));
        addrText = vw?.addr || '';
      } catch {}
      const detectedSlug = detectSidoSlugFromCoords(lat, lon, addrText);
      let active = S.sbizActiveSlug ? S.sbizCache.get(S.sbizActiveSlug) : null;
      if (autoLoadSido && detectedSlug && detectedSlug !== S.sbizActiveSlug) {
        const sInfo = (S.core.sbizSummary.sidos || []).find((x) => x.slug === detectedSlug);
        toast(`📍 현위치(${sInfo?.short || detectedSlug}) 상권 DB 자동 로드 중…`);
        active = await loadSbizSido(detectedSlug);
        S._skipSbizFitOnce = true;
        renderSbizTab();
      }
      S.leafletMap?.setView([lat, lon], 16);
      drawGpsMarkerOnMap();
      await runRadiusCatchment(lat, lon, active, addrText ? `내 현위치 · ${addrText.split(' ').slice(0, 3).join(' ')}` : '내 현재 위치');
      toast(`✅ 현위치(±${Math.round(acc || 0)}m) 반경 ${S.gisRadius >= 1000 ? `${S.gisRadius / 1000}km` : `${S.gisRadius}m`} 상권 분석 완료!`);
    },
    (err) => {
      const msg = err.code === 1
        ? '위치 권한이 거부되었습니다. 브라우저 주소창/기기 설정에서 위치 접근을 허용해 주세요.'
        : (err.code === 3 ? 'GPS 응답 시간 초과입니다. 야외 또는 Wi-Fi 환경에서 다시 시도해 주세요.' : err.message);
      toast(`📍 GPS 조회 실패: ${msg}`);
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 15000 }
  );
}

function toggleGpsWatch() {
  if (!navigator.geolocation) return toast('브라우저에서 GPS 위치 추적을 지원하지 않습니다.');
  if (S.gpsWatching) {
    stopGpsWatch();
    toast('📡 실시간 GPS 위치 추적을 종료했습니다.');
    return;
  }
  S.gpsWatching = true;
  $('btnSbizTrack')?.classList.add('btn-emerald');
  $('hudSbizTrack')?.classList.add('tracking');
  toast('📡 실시간 GPS 이동 추적 ON (이동 시 파란 위치 마커 자동 갱신)');
  let firstFix = true;
  S.gpsWatchId = navigator.geolocation.watchPosition(
    async (pos) => {
      const { latitude: lat, longitude: lon, accuracy: acc } = pos.coords;
      S.gpsPos = { lat, lon, acc: acc || 25, ts: Date.now() };
      if (firstFix) {
        firstFix = false;
        const detectedSlug = detectSidoSlugFromCoords(lat, lon, '');
        if (detectedSlug && detectedSlug !== S.sbizActiveSlug) {
          await loadSbizSido(detectedSlug);
          S._skipSbizFitOnce = true;
          renderSbizTab();
        }
        S.leafletMap?.setView([lat, lon], 16);
        const curActive = S.sbizActiveSlug ? S.sbizCache.get(S.sbizActiveSlug) : null;
        runRadiusCatchment(lat, lon, curActive, '실시간 현위치');
      } else {
        S.leafletMap?.panTo([lat, lon], { animate: true });
      }
      drawGpsMarkerOnMap();
    },
    (err) => {
      stopGpsWatch();
      toast(`📡 GPS 추적 오류: ${err.code === 1 ? '위치 권한을 허용해 주세요.' : err.message}`);
    },
    { enableHighAccuracy: true, timeout: 12000, maximumAge: 5000 }
  );
}

function renderSbizTab() {
  const sidos = S.core.sbizSummary.sidos || [];
  const active = S.sbizActiveSlug ? S.sbizCache.get(S.sbizActiveSlug) : null;

  $('mainStage').innerHTML = `
    <div class="card" style="margin-bottom:14px">
      <div class="card-head">
        <div>
          <h2 class="card-title">🏪 전국 소상공인 상권 · 디지털트윈 GIS PRO <span class="tag tag-sbiz">총 ${fmt(S.core.stats.sbizCount)}개</span></h2>
          <p class="card-sub">현위치 자동 시도 로드 · 실시간 이동추적 · 도보 동심원 · 입지 A/B 비교 · 업종 블루오션(LQ) · 브이월드 지적도/공시지가</p>
        </div>
        <div style="display:flex;gap:5px;flex-wrap:wrap">
          <button id="btnSbizGps" class="btn btn-primary btn-sm" type="button" title="현재 GPS 위치 감지 → 해당 시도 자동 로드 및 반경 분석">📍 현위치 분석</button>
          <button id="btnSbizTrack" class="btn btn-sm ${S.gpsWatching ? 'btn-emerald' : ''}" type="button" title="이동 중 내 위치 실시간 추적">📡 ${S.gpsWatching ? '추적중' : '실시간 추적'}</button>
          <button id="btnSbizFit" class="btn btn-sm" type="button" title="현재 필터 상가 전체가 보이도록 지도 맞춤">🎯 결과 맞춤</button>
          <button id="btnSbizVworld" class="btn btn-sm" type="button">📍 중심 반경</button>
          <button id="btnSbizLiveRadius" class="btn btn-emerald btn-sm" type="button">📡 실시간 API</button>
        </div>
      </div>

      ${S.sbizBookmarks.length ? `
        <div class="nx-bm-bar">
          <span style="font-weight:800;color:var(--c-corp)">⭐ 관심 입지:</span>
          ${S.sbizBookmarks.map((bm, i) => `
            <span class="nx-active-pill" data-bm-go="${i}" style="cursor:pointer">
              📍 ${esc(bm.label)} <button type="button" data-bm-del="${i}" style="border:none;background:none;padding:0 0 0 3px;color:inherit;font-weight:900;cursor:pointer">✕</button>
            </span>`).join('')}
        </div>` : ''}

      <div class="nx-collapse-bar">
        <button id="btnSbizSidoToggle" type="button" class="btn btn-sm ${S.sbizSidoOpen ? 'btn-primary' : ''}">
          📍 시도 선택 (${active ? esc(active.name) : '미선택'}) ${S.sbizSidoOpen ? '▴' : '▾'}
        </button>
        <button id="btnSbizGisToggle" type="button" class="btn btn-sm ${S.sbizGisOpen ? 'btn-primary' : ''}">
          🎛️ 지도·GIS 옵션 ${Object.values(S.gisLayers).filter(Boolean).length + (S.gisWalkRings ? 1 : 0) ? `<span class="nx-filter-badge">${Object.values(S.gisLayers).filter(Boolean).length + (S.gisWalkRings ? 1 : 0)}</span>` : ''} ${S.sbizGisOpen ? '▴' : '▾'}
        </button>
        ${S.compareCatchment ? `<button id="btnClearSiteAQuick" type="button" class="btn btn-sm btn-amber">⚖️ 비교 기준(A) 해제</button>` : ''}
      </div>

      <div id="sbizSidoWrap" class="sido-grid nx-collapsible-panel ${S.sbizSidoOpen ? '' : 'collapsed'}">
        ${sidos.map((s) => {
          const isLoaded = S.sbizCache.has(s.slug);
          const isAct = S.sbizActiveSlug === s.slug;
          return `<button class="sido-btn ${isLoaded ? 'loaded' : ''} ${isAct ? 'active' : ''}" data-load-sido="${s.slug}">
            <div class="s-nm"><span>${esc(s.short)}</span><span>${(s.bytes / 1048576).toFixed(1)}MB</span></div>
            <div class="s-cnt">${fmt(s.count)}개 · +${fmt(s.new2026)}신규</div>
          </button>`;
        }).join('')}
      </div>

      <!-- PRO GIS CONTROL DECK (Collapsible + Mobile Bottom-Sheet Popup) -->
      <div id="sbizGisPanelWrap" class="nx-filter-panel-wrap ${S.sbizGisOpen ? 'open' : ''}">
        <div class="nx-sheet-scrim" id="sbizGisScrim"></div>
        <div id="sbizGisDeck" class="gis-deck nx-collapsible-panel ${S.sbizGisOpen ? '' : 'collapsed'}">
          <div class="nx-sheet-head">
            <span>🎛️ 지도 · 국토부 GIS · 마커 옵션</span>
            <button type="button" class="icon-btn" id="btnSbizGisClose" style="padding:3px 9px">✕</button>
          </div>
          <div class="nx-sheet-body">
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
          <button class="toggle-pill ${S.gisRulerMode ? 'on' : ''}" id="btnToggleRuler" type="button">📐 거리·면적측정</button>
          <button class="toggle-pill ${S.gisWalkRings ? 'on-emerald' : ''}" id="btnToggleWalkRings" type="button">🚶 도보 3·5·10분 동심원</button>
          <button class="toggle-pill ${S.sbizSplitView ? 'on' : ''}" id="btnToggleSplit" type="button">↔️ 지도+리스트 분할</button>
          <button class="toggle-pill ${S.sbizViewportSync ? 'on-emerald' : ''}" id="btnToggleVpSync" type="button">👁️ 지도화면 리스트연동</button>
          <button class="toggle-pill ${S.sbizMapExpanded ? 'on' : ''}" id="btnToggleExpand" type="button">🖥️ 지도확장</button>
        </div>
        <div class="gis-row">
          <span class="gis-label">🎯 클릭 반경:</span>
          ${[100, 300, 500, 1000, 2000].map((r) => `<button class="toggle-pill ${S.gisRadius === r ? 'on' : ''}" data-gis-rad="${r}" type="button">${r >= 1000 ? `${r / 1000}km` : `${r}m`}</button>`).join('')}
          <label style="display:inline-flex;align-items:center;gap:5px;font-size:11.5px;font-weight:700;color:var(--muted);margin-left:4px">
            🎚️ 투명도 <input id="fGisOpacity" type="range" min="30" max="100" step="5" value="${S.gisOpacity}" style="width:74px;accent-color:var(--c-accent)" />
            <span id="gisOpacityLbl">${S.gisOpacity}%</span>
          </label>
          <div style="display:flex;gap:5px;margin-left:auto;flex:1;min-width:200px;max-width:340px">
            <input id="fGisPlace" class="input" style="flex:1;padding:5px 9px;font-size:12px" placeholder="📍 장소·주소 이동 (예: 부평역, 강남역)" />
            <button id="btnGisPlaceGo" class="btn btn-sm btn-primary" type="button">이동</button>
          </div>
        </div>
          </div>
          <div class="nx-sheet-foot">
            <button type="button" class="btn btn-primary btn-sm" id="btnSbizGisDone" style="flex:1">✅ 옵션 적용하고 닫기</button>
          </div>
        </div>
      </div>

      ${active ? renderSbizControlsHtml(active) : `
        <div style="padding:12px 14px;border-radius:11px;background:var(--c-sbiz-bg);font-size:13px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:10px">
          <span>💡 시도를 선택하거나 <b>[📍 현위치 분석]</b>을 누르면 관할 시도 275만 상권 데이터와 등재연월·입지 비교가 즉시 활성화됩니다.</span>
          <div style="display:flex;gap:6px;flex-wrap:wrap">
            <button class="btn btn-primary btn-sm" id="btnSbizQuickGpsBanner" type="button">📍 내 현위치 자동열기</button>
            <button class="btn btn-emerald btn-sm" data-load-sido="incheon">인천 (6.7MB)</button>
            <button class="btn btn-sm" data-load-sido="sejong">세종 (0.7MB)</button>
          </div>
        </div>
      `}

      ${active ? `<div id="sbizYmTimeline" class="nx-collapsible-panel ${S.sbizYmOpen ? '' : 'collapsed'}"></div>` : ''}

      <div id="sbizWorkspace" class="sbiz-workspace ${S.sbizSplitView && active ? 'split' : ''}">
        <div>
          <div class="sbiz-map-wrap">
            <div id="sbizMap" class="leaflet-box ${S.sbizMapExpanded ? 'expanded' : ''}"></div>
            <div class="sbiz-map-hud" aria-label="지도 빠른 조작">
              <button id="hudSbizGps" class="sbiz-hud-btn" type="button" title="내 현위치로 이동 & 반경 분석">📍</button>
              <button id="hudSbizTrack" class="sbiz-hud-btn ${S.gpsWatching ? 'tracking' : ''}" type="button" title="실시간 GPS 이동 추적 ON/OFF">📡</button>
              <button id="hudSbizCenter" class="sbiz-hud-btn" type="button" title="현재 지도 중심 반경분석">🎯</button>
              <button id="hudSbizSat" class="sbiz-hud-btn ${S.gisBase === 'vhyb' || S.gisBase === 'vsat' ? 'on' : ''}" type="button" title="기본도 ↔ 위성+도로 전환">🛰️</button>
              <button id="hudSbizExpand" class="sbiz-hud-btn ${S.sbizMapExpanded ? 'on' : ''}" type="button" title="지도 화면 확장/축소">⛶</button>
            </div>
            <div id="sbizGpsStatusChip" class="nx-gps-status-chip ${S.gpsPos ? '' : 'hidden'}"></div>
          </div>
          <div id="sbizMarkerLegend" class="marker-legend"></div>
        </div>
        <div id="sbizListCard"></div>
      </div>

      <div id="sbizCatchmentBox"></div>
    </div>
  `;

  $('btnSbizSidoToggle')?.addEventListener('click', () => {
    S.sbizSidoOpen = !S.sbizSidoOpen;
    $('sbizSidoWrap')?.classList.toggle('collapsed', !S.sbizSidoOpen);
    const b = $('btnSbizSidoToggle');
    if (b) { b.classList.toggle('btn-primary', S.sbizSidoOpen); b.innerHTML = b.innerHTML.replace(/[▴▾]/, S.sbizSidoOpen ? '▴' : '▾'); }
  });
  const toggleSbizGis = (forceVal) => {
    S.sbizGisOpen = typeof forceVal === 'boolean' ? forceVal : !S.sbizGisOpen;
    $('sbizGisPanelWrap')?.classList.toggle('open', S.sbizGisOpen);
    $('sbizGisDeck')?.classList.toggle('collapsed', !S.sbizGisOpen);
    const b = $('btnSbizGisToggle');
    if (b) { b.classList.toggle('btn-primary', S.sbizGisOpen); b.innerHTML = b.innerHTML.replace(/[▴▾]/, S.sbizGisOpen ? '▴' : '▾'); }
  };
  $('btnSbizGisToggle')?.addEventListener('click', () => toggleSbizGis());
  $('btnSbizGisClose')?.addEventListener('click', () => toggleSbizGis(false));
  $('sbizGisScrim')?.addEventListener('click', () => toggleSbizGis(false));
  $('btnSbizGisDone')?.addEventListener('click', () => toggleSbizGis(false));

  $('mainStage').querySelectorAll('[data-load-sido]').forEach((b) => {
    b.addEventListener('click', async () => {
      await loadSbizSido(b.dataset.loadSido);
      if (window.innerWidth <= 820) S.sbizSidoOpen = false;
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
    toast(S.gisRulerMode ? '📐 거리·면적측정 ON: 지도에서 2점 이상 클릭(3점+ 시 면적 ㎡/평 자동 계산, 우클릭=초기화)' : '📐 거리·면적측정 OFF (클릭 반경분석 복귀)');
  });
  $('btnToggleWalkRings')?.addEventListener('click', (e) => {
    S.gisWalkRings = !S.gisWalkRings;
    e.currentTarget.classList.toggle('on-emerald', S.gisWalkRings);
    toast(S.gisWalkRings ? '🚶 도보 3분(200m)·5분(350m)·10분(700m) 동심원 ON' : '🚶 도보 동심원 OFF');
    if (S.catchment) runRadiusCatchment(S.catchment.lat, S.catchment.lon, active, S.catchment.label);
  });
  $('fGisOpacity')?.addEventListener('input', (e) => {
    S.gisOpacity = Number(e.target.value) || 80;
    if ($('gisOpacityLbl')) $('gisOpacityLbl').textContent = `${S.gisOpacity}%`;
    const scale = S.gisOpacity / 100;
    for (const [k, lyr] of Object.entries(S.leafletWms || {})) {
      lyr?.setOpacity?.((VWORLD_WMS_CFG[k]?.opacity || 0.75) * scale);
    }
    if (S.leafletHeat?._canvas) S.leafletHeat._canvas.style.opacity = String(scale);
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
  const doToggleExpand = () => {
    S.sbizMapExpanded = !S.sbizMapExpanded;
    $('btnToggleExpand')?.classList.toggle('on', S.sbizMapExpanded);
    $('hudSbizExpand')?.classList.toggle('on', S.sbizMapExpanded);
    $('sbizMap')?.classList.toggle('expanded', S.sbizMapExpanded);
    setTimeout(() => S.leafletMap?.invalidateSize(), 120);
  };
  $('btnToggleExpand')?.addEventListener('click', doToggleExpand);
  $('hudSbizExpand')?.addEventListener('click', doToggleExpand);
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
  $('btnSbizGps')?.addEventListener('click', () => locateAndAnalyzeGps({ autoLoadSido: true }));
  $('btnSbizQuickGpsBanner')?.addEventListener('click', () => locateAndAnalyzeGps({ autoLoadSido: true }));
  $('hudSbizGps')?.addEventListener('click', () => locateAndAnalyzeGps({ autoLoadSido: true }));
  $('btnSbizTrack')?.addEventListener('click', toggleGpsWatch);
  $('hudSbizTrack')?.addEventListener('click', toggleGpsWatch);
  $('hudSbizCenter')?.addEventListener('click', () => {
    if (!S.leafletMap) return;
    const c = S.leafletMap.getCenter();
    runRadiusCatchment(c.lat, c.lng, active, '지도 중심');
  });
  $('hudSbizSat')?.addEventListener('click', () => {
    S.gisBase = (S.gisBase === 'vhyb' || S.gisBase === 'vsat') ? 'vbase' : 'vhyb';
    $('hudSbizSat')?.classList.toggle('on', S.gisBase === 'vhyb');
    $('mainStage').querySelectorAll('[data-gis-base]').forEach((x) => x.classList.toggle('on', x.dataset.gisBase === S.gisBase));
    applyGisBaseMap();
    toast(S.gisBase === 'vhyb' ? '🛰️ 브이월드 위성+도로 하이브리드 전환' : '🗺️ 브이월드 기본도 전환');
  });
  $('btnClearSiteAQuick')?.addEventListener('click', () => {
    S.compareCatchment = null;
    renderSbizTab();
    toast('⚖️ 비교 기준(A)을 해제했습니다.');
  });
  $('mainStage').querySelectorAll('[data-bm-go]').forEach((el) => {
    el.addEventListener('click', async (e) => {
      if (e.target.closest('[data-bm-del]')) return;
      const bm = S.sbizBookmarks[Number(el.dataset.bmGo)];
      if (!bm) return;
      let curAct = active;
      if (bm.slug && bm.slug !== S.sbizActiveSlug) {
        curAct = await loadSbizSido(bm.slug);
        S._skipSbizFitOnce = true;
        renderSbizTab();
      }
      S.gisRadius = bm.radius || S.gisRadius;
      S.leafletMap?.setView([bm.lat, bm.lon], 16);
      runRadiusCatchment(bm.lat, bm.lon, curAct, bm.label);
    });
  });
  $('mainStage').querySelectorAll('[data-bm-del]').forEach((b) => {
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      S.sbizBookmarks.splice(Number(b.dataset.bmDel), 1);
      saveSbizBookmarks();
      renderSbizTab();
    });
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

  const sbTags = [];
  if (S.sbizSgg) sbTags.push(['sgg', `📍 ${cleanSbizLabel(S.sbizSgg)}`]);
  if (S.sbizL1) sbTags.push(['l1', `🏪 ${S.sbizL1}`]);
  if (S.sbizPeriod === 'recent3m') sbTags.push(['period', '🔥 최근 3개월']);
  else if (S.sbizPeriod === 'old') sbTags.push(['period', '🏛️ 2022~23']);
  else if (S.sbizYear || S.sbizMonth) sbTags.push(['ym', `📅 ${S.sbizYear || '전체'}년${S.sbizMonth ? ' ' + S.sbizMonth + '월' : ''}`]);
  const sbFilterCnt = sbTags.length;

  return `
    <div class="nx-filter-bar">
      <input id="fSbizQ" class="input nx-q-inp" value="${esc(S.sbizQ)}" placeholder="🔍 상호명 · 건물명 · 도로명 검색 (${esc(active.name)})" />
      <button id="btnSbizQuick2026" type="button" class="toggle-pill ${S.sbizPeriod === '2026' ? 'on-emerald' : ''}">🆕 2026년</button>
      <button type="button" class="toggle-pill ${S.sbizView === 'stores' ? 'on' : ''}" data-sbiz-view="stores">📋 상가</button>
      <button type="button" class="toggle-pill ${S.sbizView === 'buildings' ? 'on' : ''}" data-sbiz-view="buildings">🏢 건물</button>
      <button id="btnSbizFilterToggle" type="button" class="btn btn-sm ${S.sbizFilterOpen ? 'btn-primary' : ''}">
        🎛️ 상가조건${sbFilterCnt > 0 ? `<span class="nx-filter-badge">${sbFilterCnt}</span>` : ''} ${S.sbizFilterOpen ? '▴' : '▾'}
      </button>
      <button id="btnSbizYmToggle" type="button" class="btn btn-sm ${S.sbizYmOpen ? 'btn-primary' : ''}">
        📈 월별추이 ${S.sbizYmOpen ? '▴' : '▾'}
      </button>
    </div>

    ${sbTags.length ? `
      <div class="nx-active-pills">
        ${sbTags.map(([k, lb]) => `<button type="button" class="nx-active-pill" data-clear-sf="${k}">${esc(lb)} <span>✕</span></button>`).join('')}
        <button type="button" class="toggle-pill" id="btnSbizResetAll" style="padding:2px 8px;font-size:11px">🔄 초기화</button>
      </div>` : ''}

    <div id="sbizFilterPanelWrap" class="nx-filter-panel-wrap ${S.sbizFilterOpen ? 'open' : ''}">
      <div class="nx-sheet-scrim" id="sbizFilterScrim"></div>
      <div id="sbizFilterPanel" class="gis-deck nx-collapsible-panel ${S.sbizFilterOpen ? '' : 'collapsed'}" style="margin-bottom:8px">
        <div class="nx-sheet-head">
          <span>🎛️ ${esc(active.name)} 상가 검색 · 기간 조건</span>
          <button type="button" class="icon-btn" id="btnSbizFilterClose" style="padding:3px 9px">✕</button>
        </div>
        <div class="nx-sheet-body">
          <div class="nx-opt-grid-2">
            <label class="nx-opt-field">📍 시군구
              <select id="fSbizSgg" class="select">
                <option value="">전체 시군구</option>
                ${sggs.map((g) => `<option value="${esc(g)}" ${S.sbizSgg === g ? 'selected' : ''}>${esc(cleanSbizLabel(g))}</option>`).join('')}
              </select>
            </label>
            <label class="nx-opt-field">🏪 업종 대분류
              <select id="fSbizL1" class="select">
                <option value="">전체 업종</option>
                ${l1s.map((l) => `<option value="${esc(l)}" ${S.sbizL1 === l ? 'selected' : ''}>${esc(l)}</option>`).join('')}
              </select>
            </label>
            <label class="nx-opt-field">📅 등재 연도
              <select id="fSbizYear" class="select" title="등재 연도 구분">
                <option value="">전체 연도</option>
                ${ds.years.map(([y, cnt]) => `<option value="${y}" ${S.sbizYear === y ? 'selected' : ''}>${y}년 (${fmt(cnt)})</option>`).join('')}
              </select>
            </label>
            <label class="nx-opt-field">🗓️ 등재 월
              <select id="fSbizMonth" class="select" title="등재 월 구분">
                <option value="">전체 월</option>
                ${availMonths.map(([m, cnt]) => `<option value="${m}" ${S.sbizMonth === m ? 'selected' : ''}>${m}월${cnt !== null ? ` (${fmt(cnt)})` : ''}</option>`).join('')}
              </select>
            </label>
            <label class="nx-opt-field">↕️ 리스트 정렬
              <select id="fSbizSort" class="select" title="리스트 정렬">
                <option value="ymDesc" ${S.sbizSort === 'ymDesc' ? 'selected' : ''}>📅 최신 등재순</option>
                <option value="ymAsc" ${S.sbizSort === 'ymAsc' ? 'selected' : ''}>📅 오래된 등재순</option>
                <option value="name" ${S.sbizSort === 'name' ? 'selected' : ''}>🔤 상호명순</option>
              </select>
            </label>
          </div>
          <div class="gis-row" style="margin-top:4px">
            <span class="gis-label">📆 기간 빠른선택:</span>
            ${[
              ['', '전체 기간'],
              ['recent3m', '🔥 최근 3개월'],
              ['2026', '🆕 2026년'],
              ['2025', '📅 2025년'],
              ['2024', '📅 2024년'],
              ['old', '🏛️ 2022~23'],
            ].map(([k, lb]) => `<button class="toggle-pill ${(S.sbizPeriod === k && !S.sbizMonth) ? 'on' : ''}" data-sbiz-period="${k}" type="button">${lb}</button>`).join('')}
          </div>
        </div>
        <div class="nx-sheet-foot">
          <button type="button" class="btn btn-sm" id="btnSbizSheetReset" style="flex:1">🔄 초기화</button>
          <button type="button" class="btn btn-primary btn-sm" id="btnSbizSheetApply" style="flex:2">✅ 적용하고 보기</button>
        </div>
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

  const opScale = (S.gisOpacity || 80) / 100;
  for (const [k, cfg] of Object.entries(VWORLD_WMS_CFG)) {
    if (S.gisLayers[k] && vworld) {
      if (!S.leafletWms[k]) {
        S.leafletWms[k] = L.tileLayer.wms('https://api.vworld.kr/req/wms', {
          layers: cfg.layers, styles: cfg.styles, format: 'image/png', transparent: true,
          version: '1.3.0', key: vworld, domain: dom, opacity: cfg.opacity * opScale, maxZoom: 20, minZoom: cfg.minZoom, zIndex: 250,
        }).addTo(S.leafletMap);
      } else {
        S.leafletWms[k].setOpacity?.(cfg.opacity * opScale);
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
    if (S.leafletHeat?._canvas) S.leafletHeat._canvas.style.opacity = String(opScale);
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
  S.leafletGpsLayer = L.layerGroup().addTo(S.leafletMap);
  applyGisOverlays(active);
  if (S.gpsPos) drawGpsMarkerOnMap();

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

  // Right-click resets ruler measurement cleanly when active
  S.leafletMap.on('contextmenu', () => {
    if (S.gisRulerMode && S.rulerPts.length) {
      S.rulerPts = [];
      S.leafletRulerLayer.clearLayers();
      toast('🧹 거리·면적 측정 지점을 초기화했습니다.');
    }
  });

  // Interactive Map Click -> Multi-Point Distance & Polygon Area Ruler OR Instant Radius Catchment Analysis!
  S.leafletMap.on('click', (e) => {
    if (S._justClickedMarker) { S._justClickedMarker = false; return; }
    if (S.gisRulerMode) {
      S.rulerPts.push([e.latlng.lat, e.latlng.lng]);
      S.leafletRulerLayer.clearLayers();
      S.rulerPts.forEach((pt, idx) => {
        L.circleMarker(pt, { radius: 6, color: '#fff', fillColor: idx === 0 ? '#059669' : '#4f46e5', fillOpacity: 1, weight: 2 })
          .bindTooltip(`${idx + 1}번 지점`, { direction: 'top', offset: [0, -6] })
          .addTo(S.leafletRulerLayer);
      });
      if (S.rulerPts.length >= 2) {
        let totalM = 0;
        for (let i = 1; i < S.rulerPts.length; i++) {
          totalM += haversineM(S.rulerPts[i - 1][0], S.rulerPts[i - 1][1], S.rulerPts[i][0], S.rulerPts[i][1]);
        }
        const walkMin = Math.max(1, Math.round(totalM / 70));
        const distLbl = totalM >= 1000 ? `${(totalM / 1000).toFixed(2)}km (도보 약 ${walkMin}분)` : `${Math.round(totalM)}m (도보 약 ${walkMin}분)`;
        let areaHtml = '';
        if (S.rulerPts.length >= 3) {
          const areaM2 = polygonAreaM2(S.rulerPts);
          const pyeong = Math.round(areaM2 / 3.305785);
          L.polygon(S.rulerPts, { color: '#4f46e5', fillColor: '#6366f1', fillOpacity: 0.14, weight: 2.5, dashArray: '6 4' }).addTo(S.leafletRulerLayer);
          areaHtml = `<div style="margin-top:3px;color:#059669">📐 다각형 면적: <b>${fmt(Math.round(areaM2))}㎡</b> (약 <b>${fmt(pyeong)}평</b>)</div>`;
        } else {
          L.polyline(S.rulerPts, { color: '#4f46e5', weight: 3, dashArray: '6 4' }).addTo(S.leafletRulerLayer);
        }
        const last = S.rulerPts[S.rulerPts.length - 1];
        L.popup({ closeButton: true }).setLatLng(last)
          .setContent(`<div style="font-size:12.5px;line-height:1.5"><b>📏 누적 거리(${S.rulerPts.length}점): ${distLbl}</b>${areaHtml}<div style="font-size:10.5px;color:#64748b;margin-top:3px">추가 클릭=연장 · 우클릭=초기화</div></div>`)
          .openOn(S.leafletMap);
        toast(`📐 측정: ${distLbl}${S.rulerPts.length >= 3 ? ` · 면적 ${fmt(Math.round(polygonAreaM2(S.rulerPts) / 3.305785))}평` : ''}`);
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
  if (S.gisWalkRings) {
    [
      [700, '#6366f1', '도보 10분 (700m)'],
      [350, '#0284c7', '도보 5분 (350m)'],
      [200, '#059669', '도보 3분 (200m)'],
    ].forEach(([rM, col, tip]) => {
      L.circle([lat, lon], { radius: rM, color: col, fillColor: col, fillOpacity: 0.04, weight: 1.5, dashArray: '4 4' })
        .bindTooltip(tip, { sticky: true })
        .addTo(S.leafletCatchLayer);
    });
  }
  L.circle([lat, lon], { radius: rad, color: '#059669', fillColor: '#10b981', fillOpacity: 0.14, weight: 2, dashArray: '5 4' }).addTo(S.leafletCatchLayer);
  L.marker([lat, lon], {
    zIndexOffset: 2500,
    icon: L.divIcon({
      className: '',
      html: `<div style="width:18px;height:18px;border-radius:50%;background:#e11d48;border:3px solid #fff;box-shadow:0 0 0 4px rgba(225,29,72,.35),0 3px 10px rgba(0,0,0,.4)"></div>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    }),
  }).bindTooltip(esc(label || '중심 기준점'), { direction: 'top', offset: [0, -10] }).addTo(S.leafletCatchLayer);

  const stores = [];
  const l1Map = new Map();
  const bldMap = new Map();
  const bldSet = new Set();
  let new2026 = 0;

  // Compute sido baseline L1 shares once per sido for Expert LQ (Saturation vs Blue-Ocean) analysis
  const sidoL1Share = new Map();
  if (active) {
    if (!active._l1Share) {
      const m = new Map();
      const l1Dict = active.dicts.l1 || [];
      for (let i = 0; i < active.n; i++) {
        const nm = l1Dict[active.cols.l1[i]] || '기타';
        m.set(nm, (m.get(nm) || 0) + 1);
      }
      const sh = new Map();
      for (const [k, c] of m.entries()) sh.set(k, c / Math.max(1, active.n));
      active._l1Share = sh;
    }
    for (const [k, v] of active._l1Share.entries()) sidoL1Share.set(k, v);

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
        const l1Key = st.l1 || '기타';
        l1Map.set(l1Key, (l1Map.get(l1Key) || 0) + 1);
        const bk = st.bld || st.addr;
        if (bk) {
          let b = bldMap.get(bk);
          if (!b) { b = { name: bk, addr: st.addr, lat: st.lat, lon: st.lon, cnt: 0, new26: 0 }; bldMap.set(bk, b); }
          b.cnt++;
          if (st.isNew2026) b.new26++;
        }
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

  // Expert Category LQ Analysis (Over-saturated vs Blue-Ocean Gap vs Sido Average)
  const lqList = [];
  if (stores.length >= 10 && sidoL1Share.size) {
    for (const [nm, baseSh] of sidoL1Share.entries()) {
      if (baseSh < 0.02) continue;
      const localCnt = l1Map.get(nm) || 0;
      const localSh = localCnt / stores.length;
      const lq = Math.round((localSh / baseSh) * 100) / 100;
      lqList.push({ nm, cnt: localCnt, lq, localPct: Math.round(localSh * 100), basePct: Math.round(baseSh * 100) });
    }
  }
  const saturated = lqList.filter((x) => x.lq >= 1.35 && x.cnt >= 3).sort((a, b) => b.lq - a.lq).slice(0, 3);
  const blueOcean = lqList.filter((x) => x.lq <= 0.65).sort((a, b) => a.lq - b.lq).slice(0, 3);
  const topBlds = [...bldMap.values()].filter((b) => b.cnt >= 2).sort((a, b) => b.cnt - a.cnt || b.new26 - a.new26).slice(0, 5);

  // Cross-Domain Fusion: Nearby Bids / Pre-specs / Permits within radius!
  const nearbyOpps = (S.opps || []).filter((o) => o.lat && o.lon && haversineM(lat, lon, o.lat, o.lon) <= Math.max(rad, 1000)).slice(0, 8);

  S.catchment = {
    lat, lon, radius: rad, label, slug: active?.slug || '', stores,
    stats: { cnt: stores.length, new2026, newRate, bldCnt: bldSet.size, hhi, topL1, saturated, blueOcean },
    topBlds,
    nearbyOpps,
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
  const { lat, lon, radius, label, stores, stats, vworld, topBlds = [], nearbyOpps = [] } = S.catchment;
  const maxBar = Math.max(1, ...(stats.topL1 || []).map(([, c]) => c));
  const areaKm2 = (Math.PI * (radius / 1000) ** 2);
  const density = areaKm2 > 0 ? Math.round(stats.cnt / areaKm2) : 0;
  const p = BIZ_PERSONAS[S.opts.bizPersona] || BIZ_PERSONAS.security;
  const estCatchMan = Math.round((stats.new2026 * p.storeDealMan * 0.25) + (stats.cnt * p.storeDealMan * 0.03));
  const locGrade = (stats.cnt >= 250 || stats.new2026 >= 25) ? 'S등급 초핵심 상권' : (stats.cnt >= 80 || stats.new2026 >= 8) ? 'A등급 유망 상권' : (stats.cnt >= 20 ? 'B등급 생활권 상권' : 'C등급 초기·저밀도');
  const topCatTxt = (stats.topL1 || []).slice(0, 2).map(([nm, c]) => `${nm}(${Math.round(c / Math.max(1, stats.cnt) * 100)}%)`).join(' · ') || '분석 중';
  const catchComment = stats.cnt > 0
    ? `<b>${locGrade}</b> — 반경 내 총 <b>${fmt(stats.cnt)}개 상가(${fmt(stats.bldCnt)}동)</b> 중 2026 신규개업 <b>+${fmt(stats.new2026)}개(신규율 ${stats.newRate}%)</b>가 포착되었습니다. 핵심 업종은 <b>${esc(topCatTxt)}</b>이며, <b>${esc(p.short)}</b> 기준 추정 단기 영업가치는 약 <b>${fmtDec(estCatchMan / 10000, 2)}억원</b>입니다. ${stats.hhi >= 2500 ? '특정 업종 집중도(HHI)가 높아 핵심 업종 전용 패키지 영업이 유리합니다.' : '다각화된 복합 상권으로 다중입점 대형건물(숫자 배지)부터 순회 방문을 권장합니다.'}`
    : '해당 시도를 상단에서 불러오시거나 [📍 현위치 분석]을 누르면 반경 내 상업적 영업기회·추정 가치·업종 블루오션이 자동 산출됩니다.';

  const kakaoRoadviewUrl = `https://map.kakao.com/link/roadview/${lat.toFixed(6)},${lon.toFixed(6)}`;
  const naverSearchUrl = `https://map.naver.com/p/search/${encodeURIComponent(vworld?.addr || `${lat.toFixed(5)},${lon.toFixed(5)}`)}`;
  const cmpA = S.compareCatchment;
  const showCmp = cmpA && (Math.abs(cmpA.lat - lat) > 0.0002 || Math.abs(cmpA.lon - lon) > 0.0002);

  let cmpHtml = '';
  if (showCmp) {
    const aArea = Math.PI * ((cmpA.radius || 500) / 1000) ** 2;
    const aDens = aArea > 0 ? Math.round((cmpA.stats.cnt || 0) / aArea) : 0;
    const aVal = Math.round(((cmpA.stats.new2026 || 0) * p.storeDealMan * 0.25) + ((cmpA.stats.cnt || 0) * p.storeDealMan * 0.03));
    const aName = cmpA.label || cmpA.vworld?.addr || '입지 A';
    const bName = label || vworld?.addr || '현재 입지 B';
    const cmpRows = [
      ['총 상가 수', cmpA.stats.cnt || 0, stats.cnt || 0, '개', false],
      ['상권 밀도 (개/㎢)', aDens, density, '개', false],
      ['2026 신규개업', cmpA.stats.new2026 || 0, stats.new2026 || 0, '개', false],
      ['신규개업률', cmpA.stats.newRate || 0, stats.newRate || 0, '%', false],
      ['업종 HHI (낮을수록 다각화)', cmpA.stats.hhi || 0, stats.hhi || 0, '', true],
      ['평당 공시지가', cmpA.vworld?.pyeongMan || 0, vworld?.pyeongMan || 0, '만', false],
      [`추정 영업가치(${p.short})`, +(aVal / 10000).toFixed(2), +(estCatchMan / 10000).toFixed(2), '억', false],
    ];
    cmpHtml = `
      <div class="domain-box" style="margin-top:10px;border-color:rgba(79,70,229,.4);background:rgba(79,70,229,.04)">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:8px;flex-wrap:wrap">
          <h4 style="margin:0;font-size:13px;color:var(--c-corp)">⚖️ 2개 상권 입지 A vs B 정밀 비교 매트릭스</h4>
          <button id="btnCatchClearCmp" class="btn btn-sm" type="button">✕ 비교 해제</button>
        </div>
        <div class="table-wrap">
          <table class="data-table" style="font-size:12px">
            <thead><tr><th>평가 지표</th><th>📌 A: ${esc(aName)} (${cmpA.radius}m)</th><th>📍 B: ${esc(bName)} (${radius}m)</th></tr></thead>
            <tbody>
              ${cmpRows.map(([k, va, vb, u, lowWin]) => {
                const aWin = va !== vb && (lowWin ? va < vb : va > vb);
                const bWin = va !== vb && (lowWin ? vb < va : vb > va);
                return `<tr><td><b>${k}</b></td><td class="${aWin ? 'compare-win' : ''}">${typeof va === 'number' && !Number.isInteger(va) ? va : fmt(va)}${u} ${aWin ? '👑' : ''}</td><td class="${bWin ? 'compare-win' : ''}">${typeof vb === 'number' && !Number.isInteger(vb) ? vb : fmt(vb)}${u} ${bWin ? '👑' : ''}</td></tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>`;
  }

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
          <button id="btnCatchPinA" class="btn btn-sm ${cmpA ? 'btn-amber' : ''}" type="button">📌 ${cmpA ? '입지 A 재고정' : '비교 기준(A) 고정'}</button>
          <button id="btnCatchBookmark" class="btn btn-sm" type="button">⭐ 입지 북마크</button>
          <a class="btn btn-sm" href="${kakaoRoadviewUrl}" target="_blank" rel="noopener">🗺️ 로드뷰 ↗</a>
          <a class="btn btn-sm" href="${naverSearchUrl}" target="_blank" rel="noopener">🧭 네이버지도 ↗</a>
          <button id="btnCatchReport" class="btn btn-sm btn-primary" type="button">📄 리포트 (PDF)</button>
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

      ${(stats.saturated?.length || stats.blueOcean?.length) ? `
        <div class="domain-box" style="margin-bottom:10px;padding:9px 11px">
          <div style="font-size:12px;font-weight:800;margin-bottom:6px">💎 전문가 업종 포화도 · 블루오션 공백(LQ) 진단 <span style="font-weight:500;color:var(--muted);font-size:11px">(시도 평균=1.00 기준)</span></div>
          <div style="display:flex;gap:6px;flex-wrap:wrap">
            ${(stats.saturated || []).map((x) => `<span class="nx-lq-chip nx-lq-over">🔴 과밀 ${esc(x.nm)} (LQ ${x.lq} · ${x.localPct}%)</span>`).join('')}
            ${(stats.blueOcean || []).map((x) => `<span class="nx-lq-chip nx-lq-blue">🟢 블루오션 ${esc(x.nm)} (LQ ${x.lq} · ${x.localPct}%)</span>`).join('')}
          </div>
        </div>` : ''}

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

      ${topBlds.length ? `
        <div class="domain-box" style="margin-top:10px;padding:9px 11px">
          <div style="font-size:12px;font-weight:800;margin-bottom:6px">🏢 반경 내 우선 공략 밀집건물 TOP ${topBlds.length} (현장 영업 최적 동선)</div>
          <div style="display:grid;gap:5px">
            ${topBlds.map((b, i) => `
              <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:12px;padding:4px 0;border-bottom:1px dashed var(--border)">
                <div style="min-width:0"><b>${i + 1}. ${esc(b.name)}</b> <span class="tag tag-sbiz">${fmt(b.cnt)}개</span>${b.new26 ? ` <span class="tag tag-bid">🆕+${b.new26}</span>` : ''}</div>
                <div style="display:flex;gap:4px;flex-shrink:0">
                  <button type="button" class="btn btn-sm" style="padding:2px 7px;font-size:11px" data-cbld-fly="${b.lat},${b.lon}">📍</button>
                  <a class="btn btn-sm" style="padding:2px 7px;font-size:11px" href="https://map.kakao.com/link/roadview/${b.lat.toFixed(6)},${b.lon.toFixed(6)}" target="_blank" rel="noopener">🗺️</a>
                </div>
              </div>`).join('')}
          </div>
        </div>` : ''}

      ${nearbyOpps.length ? `
        <div class="domain-box" style="margin-top:10px;padding:9px 11px;border-color:rgba(217,119,6,.35);background:rgba(217,119,6,.04)">
          <div style="font-size:12px;font-weight:800;margin-bottom:5px;color:var(--c-bid)">🎯 크로스 도메인 포착: 반경 내 입찰 · 사전규격 · 건축인허가 (${nearbyOpps.length}건)</div>
          <div style="display:grid;gap:4px">
            ${nearbyOpps.slice(0, 4).map((o) => `
              <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:11.5px">
                <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap"><b>${esc(o.title)}</b> <span style="color:var(--muted)">(${esc(o.org || '-')})</span></span>
                <button type="button" class="btn btn-sm" style="padding:2px 7px;font-size:11px;flex-shrink:0" data-copp-open="${esc(o.id)}">상세</button>
              </div>`).join('')}
          </div>
        </div>` : ''}

      ${cmpHtml}
    </div>
  `;

  $('btnCatchPinA')?.addEventListener('click', () => {
    S.compareCatchment = {
      lat, lon, radius,
      label: label || vworld?.addr?.split(' ').slice(0, 3).join(' ') || '입지 A',
      stats: { ...stats },
      vworld: vworld ? { ...vworld } : null,
    };
    toast(`📌 입지 A(${S.compareCatchment.label}) 고정 완료! 지도에서 비교할 다른 지점을 클릭하세요.`);
    renderSbizTab();
  });
  $('btnCatchClearCmp')?.addEventListener('click', () => {
    S.compareCatchment = null;
    renderCatchmentHud();
    toast('⚖️ 입지 비교를 종료했습니다.');
  });
  $('btnCatchBookmark')?.addEventListener('click', () => {
    const defName = label || vworld?.addr?.split(' ').slice(0, 3).join(' ') || `${lat.toFixed(4)},${lon.toFixed(4)}`;
    const nm = prompt('저장할 관심 입지 이름을 입력하세요:', defName);
    if (!nm || !nm.trim()) return;
    S.sbizBookmarks.unshift({ label: nm.trim(), lat, lon, radius, slug: S.sbizActiveSlug || '' });
    S.sbizBookmarks = S.sbizBookmarks.slice(0, 15);
    saveSbizBookmarks();
    toast(`⭐ '${nm.trim()}' 관심 입지가 북마크에 저장되었습니다!`);
    renderSbizTab();
  });
  box.querySelectorAll('[data-cbld-fly]').forEach((b) => {
    b.addEventListener('click', () => {
      const [la, lo] = b.dataset.cbldFly.split(',').map(Number);
      S.leafletMap?.setView([la, lo], 18);
    });
  });
  box.querySelectorAll('[data-copp-open]').forEach((b) => {
    b.addEventListener('click', () => {
      const o = S.opps.find((x) => x.id === b.dataset.coppOpen);
      if (o) openOppDrawer(o);
    });
  });

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
  const toggleSbizFilter = (forceVal) => {
    S.sbizFilterOpen = typeof forceVal === 'boolean' ? forceVal : !S.sbizFilterOpen;
    $('sbizFilterPanelWrap')?.classList.toggle('open', S.sbizFilterOpen);
    $('sbizFilterPanel')?.classList.toggle('collapsed', !S.sbizFilterOpen);
    const b = $('btnSbizFilterToggle');
    if (b) { b.classList.toggle('btn-primary', S.sbizFilterOpen); b.innerHTML = b.innerHTML.replace(/[▴▾]/, S.sbizFilterOpen ? '▴' : '▾'); }
  };
  const resetSbizAll = () => {
    S.sbizQ = ''; S.sbizSgg = ''; S.sbizL1 = ''; S.sbizYear = ''; S.sbizMonth = ''; S.sbizPeriod = ''; S.sbizPage = 1;
    if (window.innerWidth <= 820) S.sbizFilterOpen = false;
    renderSbizTab();
  };
  $('btnSbizFilterToggle')?.addEventListener('click', () => toggleSbizFilter());
  $('btnSbizFilterClose')?.addEventListener('click', () => toggleSbizFilter(false));
  $('sbizFilterScrim')?.addEventListener('click', () => toggleSbizFilter(false));
  $('btnSbizSheetApply')?.addEventListener('click', () => { toggleSbizFilter(false); renderSbizTab(); });
  $('btnSbizSheetReset')?.addEventListener('click', resetSbizAll);
  $('btnSbizResetAll')?.addEventListener('click', resetSbizAll);
  $('btnSbizYmToggle')?.addEventListener('click', () => {
    S.sbizYmOpen = !S.sbizYmOpen;
    $('sbizYmTimeline')?.classList.toggle('collapsed', !S.sbizYmOpen);
    const b = $('btnSbizYmToggle');
    if (b) { b.classList.toggle('btn-primary', S.sbizYmOpen); b.textContent = `📈 월별추이 ${S.sbizYmOpen ? '▴' : '▾'}`; }
  });
  $('btnSbizQuick2026')?.addEventListener('click', () => {
    if (S.sbizPeriod === '2026') { S.sbizPeriod = ''; S.sbizYear = ''; S.sbizMonth = ''; }
    else { S.sbizPeriod = '2026'; S.sbizYear = '2026'; S.sbizMonth = ''; }
    S.sbizPage = 1;
    renderSbizTab();
  });
  $('mainStage').querySelectorAll('[data-clear-sf]').forEach((b) => {
    b.addEventListener('click', () => {
      const k = b.dataset.clearSf;
      if (k === 'sgg') S.sbizSgg = '';
      else if (k === 'l1') S.sbizL1 = '';
      else if (k === 'period' || k === 'ym') { S.sbizPeriod = ''; S.sbizYear = ''; S.sbizMonth = ''; }
      S.sbizPage = 1;
      renderSbizTab();
    });
  });

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
      document.querySelectorAll('[data-sbiz-view]').forEach((x) => x.classList.toggle('on', x.dataset.sbizView === S.sbizView));
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

  if (S._skipSbizFitOnce) {
    S._skipSbizFitOnce = false;
  } else if (S.leafletMap && matchedIdx.length > 0 && (S.sbizSgg || S.sbizQ)) {
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
  const reOptCnt = (S.reOnlyFit ? 1 : 0) + (S.myScore !== 55 ? 1 : 0) + (S.myBudgetEok !== 8 ? 1 : 0);

  $('mainStage').innerHTML = `
    <div class="card">
      <div class="card-head">
        <div>
          <h2 class="card-title">🏠 부동산 · 청약 · 분양가 · 착공 PRO</h2>
          <p class="card-sub">청약홈 6종 실시간 API · 내 청약가점/예산 적합도 · 지자체 착공 + 국토부 건축인허가 통합</p>
        </div>
        <button id="btnReRefresh" class="btn btn-rose btn-sm" type="button">🔄 청약홈 6종 API 새로고침</button>
      </div>

      <div class="chips nx-swipe-chips" style="margin-bottom:8px">
        <button class="chip ${S.reSub === 'apt' ? 'active' : ''}" data-re-sub="apt">🏢 APT 분양 (${listings.filter((x) => x.kind === 'apt').length})</button>
        <button class="chip ${S.reSub === 'remndr' ? 'active' : ''}" data-re-sub="remndr">🎯 무순위·오피스텔 (${listings.filter((x) => x.kind !== 'apt').length})</button>
        <button class="chip ${S.reSub === 'starts' ? 'active' : ''}" data-re-sub="starts">🏗️ 착공·건축인허가 (${starts.length + archPermits.length})</button>
        <button class="chip ${S.reSub === 'kapt' ? 'active' : ''}" data-re-sub="kapt">🏘️ K-apt 기축단지 (${complexes.length})</button>
      </div>

      <div class="nx-filter-bar">
        <input id="fReQ" class="input nx-q-inp" value="${esc(S.reQ)}" placeholder="🔍 단지명 · 지역 · 시공사 검색" />
        ${(S.reSub === 'apt' || S.reSub === 'remndr') ? `
          <button id="btnReOnlyFit" type="button" class="toggle-pill ${S.reOnlyFit ? 'on-emerald' : ''}">✓ 내 조건 적합만</button>
          <button id="btnReFilterToggle" type="button" class="btn btn-sm ${S.reFilterOpen ? 'btn-primary' : ''}">
            🎛️ 가점·예산 조건${reOptCnt > 0 ? `<span class="nx-filter-badge">${reOptCnt}</span>` : ''} ${S.reFilterOpen ? '▴' : '▾'}
          </button>` : ''}
      </div>

      ${(S.reSub === 'apt' || S.reSub === 'remndr') ? `
        <div class="nx-active-pills">
          <span class="nx-active-pill" style="cursor:default">🎯 내 가점 ${S.myScore}점</span>
          <span class="nx-active-pill" style="cursor:default">💰 예산 ${S.myBudgetEok}억</span>
          ${S.reOnlyFit ? `<button type="button" class="nx-active-pill" id="btnReClearFit">✓ 적합 단지만 <span>✕</span></button>` : ''}
        </div>
        <div id="reFilterPanelWrap" class="nx-filter-panel-wrap ${S.reFilterOpen ? 'open' : ''}">
          <div class="nx-sheet-scrim" id="reFilterScrim"></div>
          <div id="reFilterPanel" class="gis-deck nx-collapsible-panel ${S.reFilterOpen ? '' : 'collapsed'}" style="margin-bottom:10px">
            <div class="nx-sheet-head">
              <span>🎛️ 청약 가점 · 예산 맞춤 조건</span>
              <button type="button" class="icon-btn" id="btnReFilterClose" style="padding:3px 9px">✕</button>
            </div>
            <div class="nx-sheet-body">
              <div class="nx-opt-grid-2">
                <label class="nx-opt-field">🎯 내 청약가점 (0~84점)
                  <input id="fMyScore" class="input" type="number" min="0" max="84" value="${S.myScore}" />
                </label>
                <label class="nx-opt-field">💰 내 가용 예산 (억원)
                  <input id="fMyBudget" class="input" type="number" min="1" max="100" value="${S.myBudgetEok}" />
                </label>
              </div>
              <div class="gis-row" style="margin-top:4px">
                <span class="gis-label">⚡ 빠른 예산:</span>
                ${[5, 8, 12, 20].map((b) => `<button type="button" class="toggle-pill ${S.myBudgetEok === b ? 'on' : ''}" data-re-bud="${b}">${b}억 이하</button>`).join('')}
                <button type="button" class="toggle-pill ${S.reOnlyFit ? 'on-emerald' : ''}" id="btnReSheetFit">✓ 예산·가점 적합 단지만 표시</button>
              </div>
            </div>
            <div class="nx-sheet-foot">
              <button type="button" class="btn btn-sm" id="btnReSheetReset" style="flex:1">🔄 기본값</button>
              <button type="button" class="btn btn-primary btn-sm" id="btnReSheetApply" style="flex:2">✅ 조건 적용</button>
            </div>
          </div>
        </div>` : ''}

      <div id="reBody"></div>
    </div>
  `;

  const toggleReFilter = (forceVal) => {
    S.reFilterOpen = typeof forceVal === 'boolean' ? forceVal : !S.reFilterOpen;
    $('reFilterPanelWrap')?.classList.toggle('open', S.reFilterOpen);
    $('reFilterPanel')?.classList.toggle('collapsed', !S.reFilterOpen);
    const b = $('btnReFilterToggle');
    if (b) { b.classList.toggle('btn-primary', S.reFilterOpen); b.innerHTML = b.innerHTML.replace(/[▴▾]/, S.reFilterOpen ? '▴' : '▾'); }
  };
  $('btnReFilterToggle')?.addEventListener('click', () => toggleReFilter());
  $('btnReFilterClose')?.addEventListener('click', () => toggleReFilter(false));
  $('reFilterScrim')?.addEventListener('click', () => toggleReFilter(false));
  $('btnReSheetApply')?.addEventListener('click', () => { toggleReFilter(false); renderRealEstateTab(); });
  $('btnReSheetReset')?.addEventListener('click', () => { S.myScore = 55; S.myBudgetEok = 8; S.reOnlyFit = false; S.reQ = ''; if (window.innerWidth <= 820) S.reFilterOpen = false; renderRealEstateTab(); });
  $('btnReOnlyFit')?.addEventListener('click', () => { S.reOnlyFit = !S.reOnlyFit; renderRealEstateTab(); });
  $('btnReSheetFit')?.addEventListener('click', () => { S.reOnlyFit = !S.reOnlyFit; renderRealEstateTab(); });
  $('btnReClearFit')?.addEventListener('click', () => { S.reOnlyFit = false; renderRealEstateTab(); });
  $('mainStage').querySelectorAll('[data-re-bud]').forEach((b) => {
    b.addEventListener('click', () => { S.myBudgetEok = Number(b.dataset.reBud); renderRealEstateTab(); });
  });

  $('mainStage').querySelectorAll('[data-re-sub]').forEach((b) => {
    b.addEventListener('click', () => { S.reSub = b.dataset.reSub; renderRealEstateTab(); });
  });
  let t = null;
  $('fReQ')?.addEventListener('input', (e) => { clearTimeout(t); t = setTimeout(() => { S.reQ = e.target.value; renderReSubBody(); }, 180); });
  $('fMyScore')?.addEventListener('change', (e) => { S.myScore = Number(e.target.value) || 0; renderRealEstateTab(); });
  $('fMyBudget')?.addEventListener('change', (e) => { S.myBudgetEok = Number(e.target.value) || 0; renderRealEstateTab(); });
  $('btnReRefresh')?.addEventListener('click', refreshLiveRealEstate);

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
      if (S.reOnlyFit) {
        const minEok = l.minPriceMan ? l.minPriceMan / 10000 : (l.maxPriceMan ? l.maxPriceMan / 10000 : 0);
        const cut = l.minScore || l.avgScore || 0;
        if (minEok && minEok > S.myBudgetEok) return false;
        if (cut && S.myScore < cut) return false;
      }
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
    const starts = S.re.starts || [];
    const archPermits = S.opps.filter((o) => o.stageType === 'permit').map((o) => ({
      id: o.id,
      source: o.source || '국토부 건축인허가',
      name: o.title,
      addr: o.region,
      builder: o.org,
      startDate: o.pubDate,
      usage: o.method || o.field || '건축인허가',
      areaM2: o.meta?.totArea || 0,
      isPermit: true,
      rawOpp: o,
    }));
    const allItems = [...archPermits, ...starts];
    const srcCounts = { all: allItems.length, permit: archPermits.length, start: starts.length };
    const srcFilter = S.reStartSrc || 'all';
    const combined = allItems
      .filter((s) => {
        if (srcFilter === 'permit' && !s.isPermit) return false;
        if (srcFilter === 'start' && s.isPermit) return false;
        if (q && !`${s.name} ${s.addr} ${s.builder} ${s.source} ${s.usage || ''}`.toLowerCase().includes(q)) return false;
        return true;
      })
      .sort((a, b) => String(b.startDate || '').localeCompare(String(a.startDate || '')));

    box.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:10px">
        <div class="chips">
          <button class="chip ${srcFilter === 'all' ? 'active' : ''}" data-st-src="all" type="button">전체 (${srcCounts.all})</button>
          <button class="chip ${srcFilter === 'permit' ? 'active' : ''}" data-st-src="permit" type="button">🏛️ 국토부 건축인허가 (${srcCounts.permit})</button>
          <button class="chip ${srcFilter === 'start' ? 'active' : ''}" data-st-src="start" type="button">🏗️ 지자체 착공현장 (${srcCounts.start})</button>
        </div>
        <button id="btnStartsCsv" class="btn btn-sm btn-emerald" type="button">📥 착공·인허가 CSV (${fmt(combined.length)})</button>
      </div>
      <div class="table-wrap"><table class="data-table">
        <thead><tr><th>출처</th><th>현장명 / 허가건</th><th>시공사 / 기관</th><th>주소 · 용도</th><th>일자</th><th>액션</th></tr></thead>
        <tbody>${combined.map((s) => `
          <tr data-open-st="${esc(s.id)}">
            <td><span class="tag ${s.isPermit ? 'tag-corp' : 'tag-re'}">${esc(s.source)}</span></td>
            <td><b>${esc(s.name)}</b>${s.areaM2 ? `<div style="font-size:11px;color:var(--muted)">연면적 ${fmt(s.areaM2)}㎡</div>` : ''}</td>
            <td>${esc(s.builder || '-')}</td>
            <td style="max-width:240px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--muted)">${esc(s.addr || '-')}${s.usage ? ` · ${esc(s.usage)}` : ''}</td>
            <td class="mono" style="font-size:11.5px;white-space:nowrap">${esc(s.startDate || '-')}</td>
            <td><button class="btn btn-sm" data-add-st="${esc(s.id)}" type="button">+ 담기</button></td>
          </tr>`).join('') || '<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--muted)">조건에 맞는 착공·건축인허가 데이터가 없습니다.</td></tr>'}
        </tbody></table></div>`;

    box.querySelectorAll('[data-st-src]').forEach((b) => {
      b.addEventListener('click', () => { S.reStartSrc = b.dataset.stSrc; renderReSubBody(); });
    });
    $('btnStartsCsv')?.addEventListener('click', () => {
      downloadCsv(
        `nexusone_starts_permits_${new Date().toISOString().slice(0, 10)}.csv`,
        ['출처', '현장명/허가건', '시공사/기관', '주소', '용도', '연면적(㎡)', '일자'],
        combined.map((s) => [s.source, s.name, s.builder || '', s.addr || '', s.usage || '', s.areaM2 || '', s.startDate || ''])
      );
      toast(`📥 착공·건축인허가 ${fmt(combined.length)}건 CSV 다운로드 완료!`);
    });
    box.querySelectorAll('[data-add-st]').forEach((b) => {
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        const s = combined.find((x) => x.id === b.dataset.addSt);
        if (s) addToPipeline({ id: `start:${s.id}`, domain: 're', title: s.name, sub: `${s.source} · ${s.builder || ''}`, region: s.addr || '', valueMan: 0 });
      });
    });
    box.querySelectorAll('tr[data-open-st]').forEach((tr) => {
      tr.addEventListener('click', () => {
        const s = combined.find((x) => x.id === tr.dataset.openSt);
        if (!s) return;
        if (s.rawOpp) { openOppDrawer(s.rawOpp); return; }
        const p = BIZ_PERSONAS[S.opts.bizPersona] || BIZ_PERSONAS.security;
        openDrawer({
          title: s.name,
          sub: `${s.source} · ${s.usage || '착공 현장'}`,
          body: `
            <div class="domain-box">
              <div class="domain-stat-row"><span>시공사 / 주체</span><b>${esc(s.builder || '-')}</b></div>
              <div class="domain-stat-row"><span>현장 주소</span><b>${esc(s.addr || '-')}</b></div>
              <div class="domain-stat-row"><span>용도 / 구분</span><b>${esc(s.usage || s.kind || '-')}</b></div>
              <div class="domain-stat-row"><span>연면적</span><b>${s.areaM2 ? `${fmt(s.areaM2)}㎡ (약 ${fmt(s.areaM2 / 3.3058)}평)` : '-'}</b></div>
              <div class="domain-stat-row"><span>착공/허가일</span><b>${esc(s.startDate || '-')}</b></div>
            </div>
            <div class="comm-panel" style="margin-top:12px">
              <div class="comm-head" style="margin-bottom:6px"><span style="font-weight:800;font-size:12.5px">🏗️ 신축 착공 영업 공략 코멘트 (${esc(p.short)})</span><span class="tag tag-re">선제 스펙인</span></div>
              <div style="font-size:12px;line-height:1.55">착공 직후~골조 공사 단계가 <b>${esc(p.hook)}</b> 사전 설계 반영(Spec-in)의 최적기입니다. 시공사(<b>${esc(s.builder || '현장소장')}</b>) 및 전기·통신 협력사에 조기 제안서를 전달하세요.</div>
            </div>
          `,
          foot: `<button id="dwStPipe" class="btn btn-primary btn-sm">💼 파이프라인 담기</button>`,
          onMount: () => {
            $('dwStPipe')?.addEventListener('click', () => addToPipeline({ id: `start:${s.id}`, domain: 're', title: s.name, sub: `${s.source} · ${s.builder || ''}`, region: s.addr || '', valueMan: 0 }));
          },
        });
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
    <!-- 1. 10-API DIAGNOSTIC BOARD (Collapsible v37) -->
    <div class="card" style="margin-bottom:16px">
      <div class="card-head">
        <div>
          <h2 class="card-title">🩺 통합 10종 공공·GIS API 실시간 연결 진단</h2>
          <p class="card-sub">암호화 볼트 내장 키 자동 적용 · 공공데이터: <span class="mono">${esc(maskKey(dataGoRaw))}</span> · 브이월드: <span class="mono">${esc(maskKey(vworld))}</span></p>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          <button id="btnRunDiag10" class="btn btn-primary btn-sm" type="button">🩺 10종 진단 실행</button>
          <button id="btnHubDiagToggle" class="btn btn-sm" type="button">${S.hubDiagOpen ? '접기 ▴' : '펼치기 ▾'}</button>
        </div>
      </div>

      <div id="diagBoard" class="diag-grid nx-collapsible-panel ${S.hubDiagOpen ? '' : 'collapsed'}">
        ${S.diagResults.length ? S.diagResults.map((d) => `
          <div class="diag-card ${d.ok ? 'ok' : 'err'}">
            <div class="diag-title">${d.ok ? '🟢' : '🔴'} ${esc(d.name)}</div>
            <div class="diag-status">${esc(d.status)}</div>
            <div class="diag-detail">${esc(d.detail)}</div>
          </div>`).join('') : `<div style="grid-column:1/-1;padding:14px;border-radius:10px;background:var(--surface-2);color:var(--muted);font-size:13px">
            상단 <b>[🩺 10종 진단 실행]</b>을 누르면 브이월드(2) · 나라장터(2) · K-apt(1) · 청약홈(3) · 소상공인(1) · 지자체착공(1) 연결 상태를 즉시 검증합니다.
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

      <div class="chips nx-swipe-chips" style="margin-bottom:12px">
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

    <!-- 3. INDIVIDUAL PRO APPS LAUNCHPAD (Admin-controlled!) -->
    ${(() => {
      const al = S.admin?.appLinks || defaultAdminConfig().appLinks;
      const visibleApps = al.showSection ? INDIVIDUAL_PRO_APPS.filter((a) => al[a.key]) : [];
      if (!visibleApps.length) return '';
      return `
      <div class="card" id="hubAppLinksCard">
        <div class="card-head">
          <div>
            <h2 class="card-title">🚀 개별 전문 앱 바로가기 (동일 비밀번호 연동)</h2>
            <p class="card-sub">각 도메인별 풀-특화 단독 앱도 새 탭에서 바로 열 수 있습니다.</p>
          </div>
        </div>
        <div class="grid-4">
          ${visibleApps.map((a) => `
            <a class="domain-box" href="${a.url}" target="_blank" rel="noopener">
              <h4 style="color:${a.color}">${a.name}</h4>
              <div style="font-size:12px;color:var(--muted)">${a.desc}</div>
            </a>`).join('')}
        </div>
      </div>`;
    })()}

    <!-- 4. SELLER MASTER TAX & ACCOUNTING QUICK LAUNCHPAD (Master Mode Only · Collapsible v37) -->
    ${!S.isBuyerMode ? `
      <div class="card" id="hubTaxLinksCard" style="margin-top:14px">
        <div class="card-head">
          <div>
            <h2 class="card-title">🏛️ 세무 · 국세청 · 정산 실무 바로가기 (관리자 전용)</h2>
            <p class="card-sub">전자세금계산서 발급 · 사업자 휴폐업 조회 · 완납증명 · 카드매출 정산 · API 중계 포털 원클릭 실행</p>
          </div>
          <div style="display:flex;gap:6px;flex-wrap:wrap">
            <button id="btnHubOpenTaxCenter" class="btn btn-primary btn-sm" type="button">🧾 세금계산서·API 콘솔</button>
            <button id="btnHubTaxToggle" class="btn btn-sm" type="button">${S.hubTaxOpen ? '접기 ▴' : '펼치기 ▾'}</button>
          </div>
        </div>
        <div id="hubTaxLinksBody" class="nx-collapsible-panel ${S.hubTaxOpen ? '' : 'collapsed'}" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(195px,1fr));gap:9px">
          ${TAX_QUICK_LINKS.map((lk) => `
            <a class="domain-box" href="${lk.url}" target="_blank" rel="noopener" style="text-decoration:none">
              <h4 style="color:${lk.color}">${lk.icon} ${esc(lk.name)} ↗</h4>
              <div style="font-size:11.5px;color:var(--muted)">${esc(lk.sub)}</div>
            </a>`).join('')}
        </div>
      </div>
    ` : ''}
  `;

  $('btnHubOpenTaxCenter')?.addEventListener('click', () => openAdminSalesModal('tax'));
  $('btnHubDiagToggle')?.addEventListener('click', () => {
    S.hubDiagOpen = !S.hubDiagOpen;
    $('diagBoard')?.classList.toggle('collapsed', !S.hubDiagOpen);
    const b = $('btnHubDiagToggle');
    if (b) b.textContent = S.hubDiagOpen ? '접기 ▴' : '펼치기 ▾';
  });
  $('btnHubTaxToggle')?.addEventListener('click', () => {
    S.hubTaxOpen = !S.hubTaxOpen;
    $('hubTaxLinksBody')?.classList.toggle('collapsed', !S.hubTaxOpen);
    const b = $('btnHubTaxToggle');
    if (b) b.textContent = S.hubTaxOpen ? '접기 ▴' : '펼치기 ▾';
  });

  $('btnRunDiag10').addEventListener('click', () => {
    S.hubDiagOpen = true;
    $('diagBoard')?.classList.remove('collapsed');
    if ($('btnHubDiagToggle')) $('btnHubDiagToggle').textContent = '접기 ▴';
    runFull10ApiDiag();
  });
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
    if (isLicenseBlocked()) { drop.classList.add('hidden'); return; }
    const q = rawQ.trim().toLowerCase();
    clr.classList.toggle('hidden', !q);
    if (!q || !S.fusion) { drop.classList.add('hidden'); return; }

    const allow = S.admin?.tabs || defaultAdminConfig().tabs;
    const regions = allow.overview ? S.fusion.regions.filter((r) => r.fullName.toLowerCase().includes(q)).slice(0, 4) : [];
    const opps = allow.bid ? S.opps.filter((o) => `${o.title} ${o.org} ${o.region}`.toLowerCase().includes(q)).slice(0, 4) : [];
    const reItems = allow.realestate ? (S.re.listings || []).filter((l) => `${l.name} ${l.addr} ${l.builder}`.toLowerCase().includes(q)).slice(0, 4) : [];

    // Search loaded Sbiz stores (parsed cleanly via \x1f) — only if sbiz tab is licensed
    const sbizHits = [];
    if (allow.sbiz) {
      for (const [slug, sidoObj] of S.sbizCache.entries()) {
        for (let i = 0; i < sidoObj.n && sbizHits.length < 4; i++) {
          if (String(sidoObj.strs[i] || '').toLowerCase().includes(q)) {
            const st = parseSbizStore(sidoObj, i);
            sbizHits.push({ slug, st });
          }
        }
        if (sbizHits.length >= 4) break;
      }
    }

    // Search loaded corps, or fallback to topCorps inside fusion index — only if corp tab is licensed
    let corps = [];
    if (allow.corp) {
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

// ===== V34 ROLE-AWARE OPERATIONS & USER MANUAL MODAL =====
function openManualModal(tabKey = null) {
  const isBuyer = Boolean(S.isBuyerMode);
  const allow = S.admin?.tabs || defaultAdminConfig().tabs;
  const brand = `${S.admin?.brandTitle || '넥서스원'} ${S.admin?.brandBadge || 'PRO'}`.trim();
  const activeTab = tabKey || S.manualTab || 'user';
  S.manualTab = activeTab;

  $('manualModalTitle').textContent = `📖 ${brand} · ${isBuyer ? '사용자 실무 & 사내관리 매뉴얼' : '운영 · 사용 통합 매뉴얼'}`;
  $('manualModalSub').textContent = isBuyer
    ? `계약 패키지(${String(S.admin?.pkg || 'deluxe').toUpperCase()}) 맞춤 사용 안내 · 최초 동의 · 사내관리자 · FAQ`
    : 'v34 최신 기준 · 4대 도메인 실무 사용법 · 마스터 7탭 운영 콘솔 · 직권제어 · 세무/국세청 API · FAQ';

  const userCards = [
    {
      show: true,
      title: '1. 최초 로그인 · 개인정보 동의 · PWA 앱 설치',
      tags: '로그인 보안 동의 PWA 설치 아이폰 안드로이드 PC',
      html: `
        <ul>
          <li><b>원패스 볼트 잠금 해제</b>: 전달받은 비밀번호로 1회 잠금 해제 시 WebCrypto 추출 불가 키로 기기에 안전 저장(서버 평문 0바이트).</li>
          <li><b>최초 로그인 동의 팝업</b>: 개인정보보호·이용약관·보안서약 필수 3종 동의 후 이용(개정 시 재동의 자동 안내).</li>
          <li><b>앱 설치(PWA)</b>: 아이폰 Safari <code>공유(↑) → 홈 화면에 추가</code> / 안드로이드 Chrome <code>⋮ → 앱 설치</code> / PC Chrome 주소창 <code>설치(⊕)</code>.</li>
        </ul>`,
    },
    {
      show: allow.overview,
      title: '2. ⚡ 통합 360° 커맨드 센터 & 글로벌 크로스 검색',
      tags: '통합 360 시군구 지도 가중치 리포트 검색',
      html: `
        <ul>
          <li>전국 229개 시군구 히트맵에서 지역 클릭 → 기업·입찰·상권·부동산 4축 레이더 및 상업기회 정밀 리포트(A4 PDF/카톡 요약) 즉시 생성.</li>
          <li>상단 <b>🔍 통합 크로스 검색</b>으로 지역명·기업명·입찰공고·분양단지를 허용된 계약 범위 내에서 한 번에 탐색.</li>
        </ul>`,
    },
    {
      show: allow.corp,
      title: '3. 🏢 기업분석 PRO (120,028사 · 공시+추정매출 43,746사)',
      tags: '기업분석 매출 DART 국민연금 추정매출 필터 시도 CSV',
      html: `
        <ul>
          <li><b>매출 분석</b>: DART 공시매출(녹색 <code>공시</code> · 2,813사) + 국민연금 실급여·동종업계 DART 실측 배수 보정 추정매출(인디고 <code>~XX억 추정</code> · 40,933사) = <b>총 43,746사</b> 매출 규모 분석.</li>
          <li><b>실무 필터</b>: 시도별 필터 + 매출 규모(<code>공시만</code> / <code>공시+추정</code> / <code>10억~1,000억+</code>) + <code>매출 높은순</code> 정렬 + <b>📥 조건결과 CSV</b> 다운로드.</li>
          <li>법인 클릭 시 상세 드로어에서 3개년 매출 차트(또는 추정 산출 근거), 1인당 매출, 영업이익률, 국세청 사업자상태 실시간 조회.</li>
        </ul>`,
    },
    {
      show: allow.bid,
      title: '4. 🎯 입찰·사전규격·인허가 PRO (K-Bid급 투찰엔진 · A4 검토서)',
      tags: '입찰 사전규격 당일 A값 순공사 1365조합 적격심사 내서류함 A4 PDF 1km 모바일 필터',
      html: `
        <ul>
          <li><b>아침 3분 당일 포착</b>: <code>📅 당일 입찰만</code> + <code>⭐ 내 키워드만</code> + 취소공고 자동 제외로 당일 유효 공고만 즉시 확인. (모바일에서는 1줄 퀵바 + <b>🎛️ 필터 팝업</b>으로 넓은 지도 화면 확보)</li>
          <li><b>정밀 투찰 시뮬레이터</b>: 나라장터 실시간 <b>기초금액·A값</b> 자동 조회 → <code>(예정가 − A값) × 낙찰하한율 + A값</code> 계산 · <b>순공사원가 98% 미만 경고</b> · 복수예가 15개(1,365조합) · 과거 낙찰률 분포도 최빈구간 적용.</li>
          <li><b>적격심사 · 내서류함 · A4 결재서</b>: 자사 신용/실적 1회 입력 시 <code>PASS / 공동도급권장</code> 자동 판정, <code>📁 내서류함</code>에 투찰가·진행상태 기록, <code>📑 A4 검토서</code> 1P 결재 PDF 인쇄 및 <code>.ics</code> 마감 캘린더 등록.</li>
          ${S.admin?.features?.bid1km ? '<li><b>반경 1km 현장 상권 점프</b>: 입찰 공고에서 <code>🗺️ 현장 반경 1km</code> 클릭 시 브이월드 정밀좌표로 상권지도 1km 주변 영업처를 즉시 연동.</li>' : ''}
        </ul>`,
    },
    {
      show: allow.sbiz,
      title: '5. 🏪 소상공인 상권지도 PRO (275.3만 상가 · 브이월드 GIS)',
      tags: '상권지도 소상공인 275만 브이월드 지적도 공시지가 반경 신규개업',
      html: `
        <ul>
          <li>16개 시도 온디맨드 복호화 + 브이월드 기본도/항공위성/연속지적도/용도지역 레이어 + <code>2026 신규개업</code> 골든타임 필터.</li>
          <li>지도 클릭 시 반경 300m~2km 상권밀도·경쟁도·공시지가 즉시 진단 및 동일건물 다중입점 배지 그룹핑.</li>
        </ul>`,
    },
    {
      show: allow.realestate,
      title: '6. 🏠 부동산·청약·착공·K-apt PRO',
      tags: '부동산 청약 분양 착공 인허가 K-apt 가점',
      html: `
        <ul>
          <li>청약홈 6종 API 실시간 연동 + 내 청약가점/예산 적합도 자동 판정 + 지자체 착공·건축인허가·K-apt 공동주택 단지 교차 조회.</li>
        </ul>`,
    },
    {
      show: allow.hub,
      title: '7. 🔌 API 실시간 진단 & 통합 파이프라인 CRM',
      tags: 'API 진단 파이프라인 CRM CSV JSON 백업',
      html: `
        <ul>
          <li><b>🩺 10종 실시간 API 진단</b>으로 나라장터·브이월드·청약홈·소상공인·K-apt 연결 상태를 1클릭 점검.</li>
          <li>각 도메인에서 담은 영업 타깃을 <code>발굴 → 검토 → 제안 → 성사</code> 단계별로 관리하고 CSV/JSON으로 내보내기.</li>
        </ul>`,
    },
  ].filter((c) => c.show);

  const opsCards = [
    {
      title: '1. 🚀 판매링크 발급 & 멀티테넌트 격리 (기본모드 보호)',
      tags: '판매링크 발급 패키지 화이트라벨 서명 토큰 격리 기본모드 복귀',
      html: `
        <ul>
          <li><b>마스터 보호 구조</b>: 판매링크(<code>?lic=...</code>)를 열어 미리보기해도 마스터 기본 주소(<code>https://heebonpark.github.io/nx1-p7k9v3/</code> 또는 <code>?master=1</code>)로 접속하면 항상 <b>넥서스원 PRO 기본(마스터) 모드</b>로 복원됩니다.</li>
          <li><b>발급 절차</b>: <code>🛡️ 관리자 → 🚀 판매링크 발급</code>에서 패키지(STANDARD/DELUXE/PREMIUM/ENTERPRISE), 고객사·담당자·연락처·주소·이메일·판매일자·판매경로·사용기간(시작일~만료일)·입금·세금계산서 정보 입력 후 <b>[✨ 판매 등록 + 서명 판매링크 발급·복사]</b> 클릭.</li>
          <li><b>개별 앱 통제</b>: 납품 시 <code>개별 전문 앱 바로가기</code>를 OFF하면 판매자의 단독 앱 링크가 고객 화면에서 완전 숨김 처리됩니다.</li>
        </ul>`,
    },
    {
      title: '2. 📊 납품 고객 · 입금 · 세금계산서 CRM & 비밀번호 초기화',
      tags: '납품고객 입금 미수금 세금계산서 비밀번호 초기화 admin 원격 리셋 CSV 백업',
      html: `
        <ul>
          <li><b>실시간 회계 KPI</b>: 총 공급가 · 실입금 완료액 · 미수/부분입금 · 세금계산서 미발급 건수를 실시간 집계하며 <code>✏️ 수정</code>에서 부가세 별도/포함 자동 계산.</li>
          <li><b>🔑 구매자 비밀번호 초기화</b>: 고객이 사내관리자 비번을 분실하면 <code>🔑 비번</code> 클릭 → ① 동일 기기 즉시 <code>admin</code> 초기화 + ② 원격 고객 기기용 <b>1회용 서명 초기화 링크(<code>&rst=...</code>)</b> 자동 복사(카톡 전달).</li>
          <li><b>안전 백업/복원</b>: <code>📥 26컬럼 회계 CSV</code> 출력 · <code>📤 JSON 백업</code>(보안상 GitHub/API 토큰 자동 제외) · <code>📂 JSON 복원</code>(기존 로컬 토큰 유지).</li>
        </ul>`,
    },
    {
      title: '3. 🎁 직원 · 지인 · 체험판 무료 배포 & 유료전환',
      tags: '무료배포 직원 지인 체험판 간편모드 30일 연장 유료전환 CSV',
      html: `
        <ul>
          <li>유료 매출·세금계산서 KPI와 100% 분리 관리(<code>freeDist</code>). 대상 구분(사내 직원/지인/무료 체험판/파트너), 기간 프리셋(7/14/30/90일/영구), <code>🔓 간편모드</code>(비번 경고 배너 숨김) 지원.</li>
          <li>이력 테이블에서 <code>📱 카톡</code> 안내문 복사 · <code>📅 +30일</code> 연장 · <code>🚦 직권·기간</code> 회수 · <code>💰 유료전환</code>(유료 판매 초안으로 1클릭 이관) · <code>📥 배포이력 CSV</code>.</li>
        </ul>`,
    },
    {
      title: '4. 🚦 사용기간 제한 · 관리자 직권 중지/재개 & 원격 실시간 반영',
      tags: '직권 중지 재개 사용기간 시작일 만료일 license_control 원격 동기화 GitHub PAT',
      html: `
        <ul>
          <li>유료/무료 목록의 <b>[🚦 직권·기간]</b> 버튼에서 <b>시작일(예약 개통)~종료일(자동 만료)</b> 설정 및 <b>직권 중지(사유 명시) · 직권 재개</b> 실행.</li>
          <li><b>전 고객 원격 기기 실시간 반영</b>: <code>💎 TOP 10</code> 탭에 GitHub PAT(<code>nx1-p7k9v3</code> Contents 권한, 본인 브라우저 로컬 전용)를 1회 등록하면 <b>[☁️ 원격 고객 기기 즉시 동기화]</b> 1클릭으로 <code>data/license_control.json</code>이 갱신되어 약 20초 내 전 세계 고객 PC/스마트폰에 즉시 적용됩니다(토큰 없이 수동 다운로드도 가능).</li>
        </ul>`,
    },
    {
      title: '5. 🧾 국세청 세금계산서 · 홈택스 일괄발급 CSV · 10종 세무 바로가기',
      tags: '세금계산서 홈택스 위택스 정부24 팝빌 볼타 바로빌 API Cloudflare Worker',
      html: `
        <ul>
          <li><b>수수료 0원 즉시 발행</b>: <code>🧾 세금계산서·API</code> 탭에서 <b>[📥 미발급 전체 홈택스 일괄발급 CSV]</b> 다운로드 → 홈택스 <code>조회/발급 → 전자세금계산서 → 일괄발급</code> 업로드 후 <code>✅ 수기발급 완료</code> 처리.</li>
          <li><b>API 자동 발행</b>: 팝빌/볼타/바로빌 가입 + 공동인증서 1회 등록 → 탭 내 <code>Cloudflare Worker 프록시 코드</code> 배포 → Endpoint 저장 시 원클릭 국세청 자동 전송 및 승인번호 자동 기록.</li>
          <li><b>세무 10종 바로가기</b>: <code>🔌 허브 탭</code> · <code>🧾 세금계산서 탭</code> · <code>✏️ 수정 모달(사업자번호 복사+홈택스)</code>에서 홈택스·휴폐업조회·위택스·정부24·인터넷등기소·4대보험·여신금융협회 등 즉시 이동.</li>
        </ul>`,
    },
    {
      title: '6. 📋 개인정보 동의 정책 · 💎 TOP 10 보안 옵션 · 📜 감사로그',
      tags: '개인정보 약관 동의 버전 재동의 TOP 10 마스터 PIN 감사로그',
      html: `
        <ul>
          <li><b>개정 약관 재동의</b>: <code>💎 TOP 10</code> 탭에서 약관 버전(예: <code>2026.11-v1 → 2026.12-v2</code>)을 변경·저장(및 원격 동기화)하면 기존 동의자에게도 재동의 팝업이 자동 표시되며, <b>📥 동의 이력 CSV</b>로 법적 증빙 보관.</li>
          <li><b>마스터 전환 PIN</b>: 구매자 화면에서 <code>Ctrl+Shift+A</code> 입력 시 판매자 본인 확인용 PIN(기본 <code>nx1master</code> 또는 볼트 비밀번호)을 언제든 변경 가능.</li>
          <li><b>감사로그</b>: 발급·비번초기화·직권중지/재개·세금계산서·약관동의 등 주요 이벤트 최대 200건 자동 기록 및 CSV 출력.</li>
        </ul>`,
    },
  ];

  const buyerAdminCards = [
    {
      title: '1. 🏢 구매자 자체 사내 관리자 (초기 비밀번호 admin → 필수 변경)',
      tags: '사내관리자 초기 비밀번호 admin 변경 공지 부서명',
      html: `
        <ul>
          <li><b>최초 1회 필수 변경</b>: 우측 상단 <b>[🏢 사내관리]</b> 클릭 → 초기 비밀번호 <code>admin</code> 입력 → 보안을 위해 4자 이상 새 비밀번호(<code>admin</code> 제외)로 즉시 변경하세요.</li>
          <li><b>사내 맞춤 설정</b>: 상단 사내 공지 배너, 담당 부서명/연락처(A4 수주검토서 푸터 자동 반영), 임직원 기본 시작 화면, 개인정보·약관 동의내역 열람 및 사내 감사로그 조회를 지원합니다.</li>
        </ul>`,
    },
    {
      title: '2. 🔐 비밀번호 분실 · 계약 업그레이드 · 기간 연장 안내',
      tags: '비밀번호 분실 초기화 업그레이드 만료 기간 연장',
      html: `
        <ul>
          <li><b>사내관리자 비밀번호 분실 시</b>: 담당 판매자에게 <b>1회용 원격 비밀번호 초기화 링크</b>를 요청해 접속하시면 비밀번호가 <code>admin</code>으로 안전하게 초기화됩니다.</li>
          <li><b>라이선스 보안</b>: 전용 URL을 임의로 수정하면 무결성 서명 검증으로 차단됩니다. 도메인 추가(예: 상권지도·청약 업그레이드) 또는 기간 연장은 담당 판매자에게 문의해 주세요.</li>
        </ul>`,
    },
  ];

  const faqCards = [
    {
      title: 'Q1. 판매링크로 들어갔다가 넥서스원 기본(마스터) 모드로 돌아가려면?',
      tags: '판매링크 기본모드 마스터 복귀',
      html: '판매링크는 테넌트 격리 공간에서만 동작하므로 <b>기본 주소(<code>https://heebonpark.github.io/nx1-p7k9v3/</code> 또는 <code>?master=1</code>)</b>로 이동하면 즉시 마스터 기본 모드로 복원됩니다. 구매자 화면에서 <code>Ctrl+Shift+A</code> + 마스터 PIN 인증으로도 즉시 복귀할 수 있습니다.',
    },
    {
      title: 'Q2. 입찰 A4 검토서 PDF 출력 시 여백/배경이 제대로 나오게 하려면?',
      tags: 'A4 PDF 출력 인쇄 빈화면 배경',
      html: '공고 상세 드로어에서 <b>[📑 A4 검토서]</b> 클릭 → 인쇄 창에서 용지 <code>A4 세로</code>, <b>배경 그래픽(체크)</b>을 켜고 <code>PDF로 저장</code>을 선택하면 1페이지 결재 보고서가 선명하게 저장됩니다.',
    },
    {
      title: 'Q3. 모바일에서 입찰·상권 지도 화면이 좁아 보일 때는?',
      tags: '모바일 필터 바텀시트 팝업 지도',
      html: '모바일(820px 이하)에서는 필터가 자동 접힘 처리되어 지도가 넓게 보입니다. 상단 1줄 퀵바의 <b>[🎛️ 필터]</b> 또는 <b>[🗺️ 지도옵션]</b> 버튼을 눌러 팝업 시트에서 조건을 선택 후 적용하세요.',
    },
    {
      title: 'Q4. 새 버전 업데이트가 바로 안 보일 때는?',
      tags: '업데이트 캐시 새로고침 버전',
      html: 'PWA 서비스 워커가 최신 버전을 자동 갱신합니다. 즉시 반영이 필요하면 브라우저에서 <b>강력 새로고침(<code>Ctrl+Shift+R</code> / Mac <code>Cmd+Shift+R</code>)</b>을 1회 실행해 주세요.',
    },
  ];

  const navButtons = isBuyer
    ? [
        ['user', '📘 사용자 실무 매뉴얼'],
        ['buyer', '🏢 사내관리·보안 가이드'],
        ['faq', '❓ FAQ · 사용팁'],
      ]
    : [
        ['user', '📘 사용자 실무 매뉴얼'],
        ['ops', '🛡️ 판매자 운영 매뉴얼 (마스터)'],
        ['faq', '❓ FAQ · 장애대응'],
      ];

  const targetList = activeTab === 'ops' && !isBuyer
    ? opsCards
    : (activeTab === 'buyer' && isBuyer ? buyerAdminCards : (activeTab === 'faq' ? faqCards : userCards));

  const renderCardsHtml = (q = '') => {
    const kw = q.trim().toLowerCase();
    const matched = targetList.filter((c) => !kw || `${c.title} ${c.tags} ${c.html}`.toLowerCase().includes(kw));
    return matched.map((c) => `
      <div class="domain-box" style="margin-bottom:9px">
        <h4 style="margin:0 0 6px;font-size:13px;color:var(--c-corp)">${c.title}</h4>
        <div style="font-size:12px;line-height:1.6;color:var(--text-2)">${c.html}</div>
      </div>`).join('') || '<div style="text-align:center;padding:24px;color:var(--muted);font-size:12.5px">검색어에 해당하는 매뉴얼 항목이 없습니다.</div>';
  };

  $('manualBody').innerHTML = `
    <div class="nx-adm-tabs">
      ${navButtons.map(([k, lb]) => `<button type="button" class="nx-adm-tab ${activeTab === k ? 'active' : ''}" data-man-nav="${k}">${lb}</button>`).join('')}
    </div>
    <div style="margin-bottom:10px">
      <input id="manSearch" class="input" type="search" placeholder="매뉴얼 키워드 검색 (예: A값, 매출, 비번초기화, 직권중지, 홈택스, 무료배포, 개인정보…)" style="width:100%;font-size:12.5px;padding:7px 11px" />
    </div>
    <div id="manContentList">${renderCardsHtml('')}</div>
  `;

  const standaloneUrl = isBuyer ? 'manual.html' : 'manual.html?mode=ops';
  $('manualFoot').innerHTML = `
    <a class="btn btn-emerald btn-sm" href="${standaloneUrl}" target="_blank" rel="noopener">🖨️ 전체 단독 웹 매뉴얼 / PDF 출력 ↗</a>
    ${!isBuyer ? '<button id="btnManOpenAdmin" class="btn btn-primary btn-sm" type="button">🛡️ 마스터 관리자 콘솔 열기</button>' : ''}
    <button id="btnManCloseFoot" class="btn btn-sm" type="button" style="margin-left:auto">닫기</button>
  `;

  $('manualBackdrop')?.classList.remove('hidden');

  $('manualBody').querySelectorAll('[data-man-nav]').forEach((b) => {
    b.addEventListener('click', () => openManualModal(b.dataset.manNav));
  });
  $('manSearch')?.addEventListener('input', (e) => {
    const box = $('manContentList');
    if (box) box.innerHTML = renderCardsHtml(e.target.value);
  });
  $('btnManOpenAdmin')?.addEventListener('click', () => {
    $('manualBackdrop')?.classList.add('hidden');
    openAdminSalesModal();
  });
  $('btnManCloseFoot')?.addEventListener('click', () => $('manualBackdrop')?.classList.add('hidden'));
}

// ===== THEME & INIT =====
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  try { localStorage.setItem(THEME_KEY, theme); } catch {}
  if ($('btnTheme')) $('btnTheme').textContent = theme === 'dark' ? '☀️' : '🌙';
}

async function ensureVaultManifest() {
  if (S.vault) return S.vault;
  const r = await fetch('data/vault.json', { cache: 'no-store' });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  S.vault = await r.json();
  return S.vault;
}

async function init() {
  let savedTheme = 'light';
  try { savedTheme = localStorage.getItem(THEME_KEY) || 'light'; } catch {}
  applyTheme(savedTheme);
  loadPipeline();

  $('btnTheme')?.addEventListener('click', () => applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));
  $('btnOptions')?.addEventListener('click', openOptionsModal);
  $('optionsClose')?.addEventListener('click', closeOptionsModal);
  $('optionsBackdrop')?.addEventListener('click', (e) => { if (e.target === $('optionsBackdrop')) closeOptionsModal(); });
  $('btnManual')?.addEventListener('click', () => openManualModal());
  $('manualClose')?.addEventListener('click', () => $('manualBackdrop')?.classList.add('hidden'));
  $('manualBackdrop')?.addEventListener('click', (e) => { if (e.target === $('manualBackdrop')) $('manualBackdrop')?.classList.add('hidden'); });
  $('reportClose')?.addEventListener('click', closeReportModal);
  $('reportBackdrop')?.addEventListener('click', (e) => { if (e.target === $('reportBackdrop')) closeReportModal(); });
  $('brandHome')?.addEventListener('click', () => switchTab('overview'));
  $('btnGoPipe')?.addEventListener('click', () => switchTab('hub'));
  $('drawerClose')?.addEventListener('click', closeDrawer);
  $('drawerBackdrop')?.addEventListener('click', (e) => { if (e.target === $('drawerBackdrop')) closeDrawer(); });
  document.querySelectorAll('[data-tab]').forEach((b) => b.addEventListener('click', () => switchTab(b.dataset.tab)));

  $('btnAdminSales')?.addEventListener('click', () => {
    if (S.isBuyerMode) openBuyerAdminModal();
    else openAdminSalesModal();
  });
  $('adminClose')?.addEventListener('click', () => $('adminBackdrop')?.classList.add('hidden'));
  $('adminBackdrop')?.addEventListener('click', (e) => { if (e.target === $('adminBackdrop')) $('adminBackdrop').classList.add('hidden'); });
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
      e.preventDefault();
      if (S.isBuyerMode) openMasterEscapePrompt();
      else openAdminSalesModal();
    }
  });

  $('btnLockOut')?.addEventListener('click', async () => {
    await idbClearKey();
    location.reload();
  });

  // Wire popup action helpers for Leaflet markers (Sbiz + Bid Radar)
  window._nxPipeStore = (id, title, sub, region) => {
    addToPipeline({ id: `sbiz:${id}`, domain: 'sbiz', title, sub, region, valueMan: 0 });
  };
  window._nxCatchHere = (lat, lon, label) => {
    const curActive = S.sbizActiveSlug ? S.sbizCache.get(S.sbizActiveSlug) : null;
    S.leafletMap?.closePopup();
    runRadiusCatchment(lat, lon, curActive, label);
  };
  window._nxOpenOpp = (id) => {
    const o = S.opps.find((x) => x.id === id);
    if (o) openOppDrawer(o);
  };
  window._nxPipeOpp = (id) => {
    const o = S.opps.find((x) => x.id === id);
    if (o) addToPipeline({ id: `opp:${o.id}`, domain: 'bid', title: o.title, sub: `${o.org} · ${o.field}`, region: o._regionFull || o.region, valueMan: o.budgetMan });
  };
  window._nxZoomBidPins = (lat, lon, regionKeyword) => {
    S.bidMapMode = 'pins';
    if (regionKeyword) S.bidQ = regionKeyword;
    S.bidLeafletMap?.closePopup();
    renderBidMapWorkspace();
    setTimeout(() => S.bidLeafletMap?.setView([lat, lon], 13), 80);
  };

  wireOmniSearch();

  // Apply white-label branding even on lock screen before unlock!
  applyLockScreenBranding();

  // Bind password show/hide toggle, in-app browser tip, and submit handler IMMEDIATELY (before async I/O!)
  $('lockPwToggle')?.addEventListener('click', () => {
    const inp = $('lockPw');
    if (!inp) return;
    const show = inp.type === 'password';
    inp.type = show ? 'text' : 'password';
    $('lockPwToggle').textContent = show ? '🙈' : '👁️';
    $('lockPwToggle').setAttribute('aria-label', show ? '비밀번호 숨김' : '비밀번호 표시');
    inp.focus();
  });
  if (/KAKAOTALK|NAVER|LINE|FBAN|Instagram/i.test(navigator.userAgent || '')) {
    const tip = $('lockInAppTip');
    if (tip) {
      tip.textContent = '💡 카카오톡 등 인앱 브라우저에서는 우측 메뉴 [⋯ → 다른 브라우저로 열기(Safari/Chrome)]로 접속하시면 로그인 유지 및 대용량 지도 로딩이 가장 안정적입니다.';
      tip.classList.remove('hidden');
    }
  }

  $('lockForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const rawPw = $('lockPw')?.value || '';
    const trimmedPw = rawPw.trim();
    const btn = $('lockBtn'), err = $('lockErr');
    if (!trimmedPw) {
      err.textContent = '통합 볼트 비밀번호를 입력해 주세요.';
      return;
    }
    btn.disabled = true; btn.textContent = '🔓 PBKDF2 키 유도 및 복호화 중…'; err.textContent = '';
    try {
      const vault = await ensureVaultManifest();
      let key = await deriveKey(rawPw, vault.salt, vault.iter);
      let ok = await verifyKey(key, vault);
      if (!ok && trimmedPw !== rawPw) {
        key = await deriveKey(trimmedPw, vault.salt, vault.iter);
        ok = await verifyKey(key, vault);
      }
      if (!ok) {
        const low = trimmedPw.toLowerCase();
        if (low === BUYER_DEFAULT_PW) {
          err.textContent = '⚠️ "admin"은 잠금 해제 후 우측 상단 [🏢 사내관리]용 초기 비밀번호입니다. 이곳에는 별도 전달받은 통합 볼트 비밀번호(영문 소문자)를 입력하세요.';
        } else if (low === 'nx1master') {
          err.textContent = '⚠️ "nx1master"는 마스터 모드 전환 PIN(Ctrl+Shift+A)입니다. 이곳에는 최초 잠금 해제용 통합 볼트 비밀번호를 입력하세요.';
        } else if (/[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(trimmedPw)) {
          err.textContent = '⚠️ 한글이 입력되었습니다. 한영키를 영문 소문자로 전환한 뒤 통합 볼트 비밀번호를 입력하세요. (우측 👁️ 버튼으로 입력값 확인)';
        } else {
          err.textContent = '비밀번호가 일치하지 않습니다. 영문 대소문자·한영 전환 여부를 우측 👁️ 버튼으로 확인해 주세요.';
        }
        btn.disabled = false; btn.textContent = '🔐 통합 볼트 잠금 해제';
        return;
      }
      if ($('lockRemember')?.checked) await idbSetKey(key);
      await unlockAndBoot(key);
    } catch (ex) {
      err.textContent = `잠금 해제 실패: ${ex.message}`;
      btn.disabled = false; btn.textContent = '🔐 통합 볼트 잠금 해제';
    }
  });

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }

  // Load vault manifest & attempt auto-unlock from IndexedDB
  try {
    await ensureVaultManifest();
  } catch (e) {
    $('lockErr').textContent = '볼트 메타데이터(data/vault.json)를 찾을 수 없습니다.';
    return;
  }

  const cachedKey = await idbGetKey();
  if (cachedKey && await verifyKey(cachedKey, S.vault)) {
    try {
      await unlockAndBoot(cachedKey);
      return;
    } catch {}
  }
}

init();
