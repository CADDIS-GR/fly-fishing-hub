/* CADDIS-GR 조행기 범퍼 — 첫 화면 오프닝 모션그래픽
 *
 * 흐름: 브랜드(플라이 라인 캐스팅) → 출조길 지도(차량 주행) → 낚시터 물속으로 다이브
 *       → 타이틀 카드(제목·날짜·조과) → [입장] 누르면 막이 올라가며 히어로 등장
 *
 * 사용법 — 조행기 <head> 맨 끝에 두 줄 추가:
 *   <script>window.CADDIS_BUMPER = { date:'2026-10-23', title:'제목', sub:'부제', catch:23, music:'되고송' };</script>
 *   <script src="../bumper/bumper.js"></script>
 *
 * 주소 옵션: ?bumper=0 끄기
 * 페이지를 열거나 새로고침할 때마다 재생한다. 뒤로/앞으로 가기로 돌아온 경우에만 건너뛴다.
 * (SKIP 버튼·Esc·스크롤로 언제든 바로 넘어갈 수 있다)
 * window.CADDIS_BUMPER_PLAY() 를 부르면 언제든 다시 재생한다 (예: '오프닝 다시 보기' 버튼).
 * 설정 선택 항목: avatar(프로필 이미지 주소), map(지도 이미지 주소), replay:true(오른쪽 아래 '오프닝 다시 보기' 버튼)
 */
(function () {
  const CFG = Object.assign({ from: '의정부', place: '한터낚시터', km: 75 }, window.CADDIS_BUMPER || {});
  const SRC = document.currentScript && document.currentScript.src;
  const asset = p => new URL(p, SRC || location.href).href;
  const qs = new URLSearchParams(location.search);
  const mode = qs.get('bumper');
  let backForward = false;
  try {
    const nav = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
    backForward = !!nav && nav.type === 'back_forward';
  } catch (e) {}
  const AUTO = mode !== '0' && (mode === 'record' || !backForward);
  const RECORD = mode === 'record';

  // ── 타임라인(초) ──
  const T = {
    line0: .15, line1: 1.45,        // 플라이 라인 캐스팅
    iris0: 1.75, iris1: 2.55,       // 지도 열림
    drive0: 2.5, drive1: 6.5,       // 차량 주행
    dive0: 6.6, dive1: 7.7,         // 낚시터로 다이브
    water0: 7.05, water1: 7.85,     // 물빛으로 화면 채움
    card: 7.8,                      // 타이틀 카드 시작
    end: 9.6,                       // 진행 막대 끝
    exit: 1.0                       // 막 올라가는 시간
  };
  const MAP_W = 1672, MAP_H = 941;
  const ROUTE = 'M745,198 C780,204 800,214 822,240 L988,452 C1008,478 1014,512 1017,556 L1027,690 C1031,734 1048,750 1072,752';
  const POND = { x: 1150, y: 772 };
  const BBOX = { x0: 690, y0: 140, x1: 1260, y1: 830 };
  // 플라이 라인 — 가로 화면 / 세로 화면(모바일)용 구도를 따로 둔다. end = 플라이 착수 지점
  const LINES = {
    wide: { vb: [1600, 900], d: 'M-40,860 C200,560 420,300 600,262 C760,226 770,402 645,384 C520,366 600,252 820,282 C1040,312 1220,420 1380,470', end: { x: 1380, y: 470 } },
    tall: { vb: [900, 1600], d: 'M-40,1650 C60,1100 120,640 260,470 C360,350 480,400 420,480 C350,570 240,450 380,380 C540,300 720,380 770,560', end: { x: 770, y: 560 } }
  };

  // ── 날짜 ──
  const [Y, M, D] = String(CFG.date || '').split('-').map(Number);
  const WD = Y ? ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][new Date(Date.UTC(Y, M - 1, D)).getUTCDay()] : '';
  const pad = n => String(n).padStart(2, '0');
  const dateDots = Y ? `${Y}.${pad(M)}.${pad(D)}` : '';
  const dateSpaced = Y ? `${Y} · ${pad(M)} · ${pad(D)}` : '';
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const korTitle = /[\uAC00-\uD7A3]/.test(CFG.title || '');

  // ── 깜빡임 방지: 오버레이가 붙기 전까지 본문 숨김 ──
  const pre = document.createElement('style');
  pre.textContent = 'html{background:#14231e}body{visibility:hidden}';
  if (AUTO) document.head.appendChild(pre);
  const fonts = document.createElement('link');
  fonts.rel = 'stylesheet';
  fonts.href = 'https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Serif+Display:ital@0;1&family=Noto+Sans+KR:wght@300;500;700&display=swap';
  document.head.appendChild(fonts);

  const CSS = `
#cgb{position:fixed;inset:0;z-index:2147483000;visibility:visible;background:#14231e;color:#fff;overflow:visible;will-change:transform;
  font-family:'Noto Sans KR',sans-serif;-webkit-font-smoothing:antialiased}
#cgb *{box-sizing:border-box}
#cgb .cgb-layer{position:absolute;inset:0;width:100%;height:100%}
#cgb .cgb-grid{background-image:linear-gradient(rgba(255,255,255,.045) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.045) 1px,transparent 1px);background-size:60px 60px}
#cgb .cgb-brand{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);text-align:center;white-space:nowrap}
#cgb .cgb-brand img{width:64px;height:64px;border-radius:50%;object-fit:cover;border:2px solid rgba(168,197,190,.55);display:block;margin:0 auto 18px}
#cgb .cgb-brand b{display:block;font-family:'DM Serif Display',serif;font-weight:400;font-size:clamp(40px,7vw,84px);line-height:1;color:#fff}
#cgb .cgb-brand span{display:block;margin-top:14px;font-family:'DM Mono',monospace;font-size:12px;letter-spacing:.32em;text-transform:uppercase;color:rgba(168,197,190,.85)}
#cgb .cgb-hud{position:absolute;left:clamp(16px,3.4vw,48px);top:clamp(16px,4vw,48px);padding:14px 20px 12px;border-radius:14px;
  background:rgba(20,35,30,.82);backdrop-filter:blur(8px);border:1px solid rgba(168,197,190,.25);min-width:230px}
#cgb .cgb-hud i{display:block;font-style:normal;font-family:'DM Mono',monospace;font-size:11px;letter-spacing:.18em;color:#a8c5be}
#cgb .cgb-hud b{display:block;margin:6px 0 4px;font-size:17px;font-weight:700}
#cgb .cgb-hud div{display:flex;align-items:baseline;justify-content:space-between;gap:16px}
#cgb .cgb-km{font-family:'DM Serif Display',serif;font-size:30px;color:#e6c35c;line-height:1.1}
#cgb .cgb-stage{font-size:13px;color:rgba(255,255,255,.75)}
#cgb .cgb-water{background:radial-gradient(ellipse at 30% 70%,#3d6e62 0%,#2d5248 45%,#1c362f 100%)}
#cgb .cgb-card{position:absolute;left:0;right:0;bottom:0;padding:0 48px clamp(56px,10vh,110px)}
#cgb .cgb-card > *{will-change:transform,opacity}
#cgb .cgb-tag{word-break:keep-all;font-family:'DM Mono',monospace;font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:rgba(168,197,190,.85);display:flex;align-items:center;gap:10px;margin-bottom:18px}
#cgb .cgb-tag img{width:30px;height:30px;border-radius:50%;object-fit:cover;border:1.5px solid rgba(255,255,255,.4)}
#cgb .cgb-date{font-family:'DM Mono',monospace;font-size:13px;letter-spacing:.2em;color:rgba(255,255,255,.7);margin-bottom:10px}
#cgb .cgb-title{word-break:keep-all;font-size:clamp(32px,6.4vw,88px);line-height:1.15;letter-spacing:-.02em;margin:0 0 16px;color:#fff;
  font-family:${korTitle ? "'Noto Sans KR',sans-serif;font-weight:700" : "'DM Serif Display',serif;font-weight:400;font-style:italic"}}
#cgb .cgb-sub{word-break:keep-all;font-size:clamp(14px,2vw,19px);font-weight:300;color:rgba(255,255,255,.8);max-width:680px;margin:0 0 22px;line-height:1.6}
#cgb .cgb-catch{display:flex;align-items:baseline;gap:8px;margin-bottom:30px;font-size:15px;color:rgba(255,255,255,.75)}
#cgb .cgb-catch b{font-family:'DM Serif Display',serif;font-weight:400;font-size:clamp(40px,6vw,64px);color:#e6c35c;line-height:1}
#cgb .cgb-btns{display:flex;flex-wrap:wrap;gap:10px;align-items:center}
#cgb .cgb-btns button{font:500 14px 'Noto Sans KR',sans-serif;border-radius:999px;padding:12px 22px;cursor:pointer;border:1px solid rgba(255,255,255,.35);
  background:rgba(255,255,255,.08);color:#fff;transition:background .2s,transform .2s}
#cgb .cgb-btns button:hover{background:rgba(255,255,255,.18);transform:translateY(-1px)}
#cgb .cgb-btns .cgb-music{background:#c0392b;border-color:#c0392b}
#cgb .cgb-btns .cgb-music:hover{background:#d4483a}
#cgb .cgb-btns small{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.16em;color:rgba(255,255,255,.45);margin-left:6px;text-transform:uppercase}
#cgb .cgb-skip{position:absolute;right:clamp(16px,3vw,40px);top:clamp(16px,3vw,36px);font:500 11px 'DM Mono',monospace;letter-spacing:.2em;
  color:rgba(255,255,255,.7);background:rgba(0,0,0,.25);border:1px solid rgba(255,255,255,.25);border-radius:999px;padding:8px 16px;cursor:pointer;z-index:3}
#cgb .cgb-skip:hover{color:#fff;background:rgba(0,0,0,.45)}
#cgb .cgb-bar{position:absolute;left:0;bottom:0;height:2px;background:#e6c35c;z-index:3}
#cgb .cgb-wave{position:absolute;left:0;top:100%;width:100%;height:60px;display:block}
@media(max-width:600px){
  #cgb .cgb-card{padding-left:20px;padding-right:20px}
  #cgb .cgb-hud{min-width:0;padding:10px 14px}
  #cgb .cgb-hud b{font-size:14px}
  #cgb .cgb-km{font-size:24px}
  #cgb .cgb-brand img{width:52px;height:52px}
  #cgb .cgb-btns button{padding:11px 18px;font-size:13px}
}`;

  const CAR = `
    <ellipse cx="3" cy="5" rx="36" ry="18" fill="#000" opacity=".28"/>
    <g transform="scale(1.15)">
      <rect x="-30" y="-15" width="60" height="30" rx="10" fill="#1f6fe0" stroke="#0b3d8c" stroke-width="2"/>
      <rect x="-14" y="-12" width="26" height="24" rx="6" fill="#1a5bc0"/>
      <path d="M12,-12 Q20,0 12,12 L6,10 Q11,0 6,-10 z" fill="#bfe3ff" stroke="#0b3d8c" stroke-width="1"/>
      <path d="M-15,-11 Q-21,0 -15,11 L-11,9 Q-15,0 -11,-9 z" fill="#9cc9ee" stroke="#0b3d8c" stroke-width="1"/>
      <rect x="25" y="-13" width="5" height="6" rx="2" fill="#fff6c8"/><rect x="25" y="7" width="5" height="6" rx="2" fill="#fff6c8"/>
      <rect x="-31" y="-13" width="3" height="6" rx="1" fill="#ff3b30"/><rect x="-31" y="7" width="3" height="6" rx="1" fill="#ff3b30"/>
    </g>
    <path class="cgb-beam" d="M36,-12 L95,-34 L95,34 L36,12 z" fill="#fff7c0" opacity="0"/>`;

  const PROF = CFG.avatar || 'https://raw.githubusercontent.com/CADDIS-GR/fishing-log/main/data/prof.PNG';
  const MAP = CFG.map || asset('../intro-map/map-clean.jpg');
  const HTML = `
  <div class="cgb-layer cgb-grid" data-k="ident"></div>
  <svg class="cgb-layer" data-k="identSvg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <path class="cgb-line" d="${LINES.wide.d}" fill="none" stroke="#e6c35c" stroke-width="3.2" stroke-linecap="round"/>
    <g class="cgb-splash">${[0, 1, 2].map(() => '<ellipse fill="none" stroke="#a8c5be" stroke-width="2"/>').join('')}</g>
    <g class="cgb-fly"><ellipse rx="9" ry="5" fill="#c0392b"/><path d="M-2,-3 L-16,-12 L-12,-1 z" fill="#f2e3c0"/><circle cx="8" r="2.6" fill="#1a1a1a"/></g>
  </svg>
  <div class="cgb-brand" data-k="brand">
    <img src="${PROF}" alt="">
    <b>CADDIS-GR</b>
    <span>Fly Fishing Log</span>
  </div>
  <svg class="cgb-layer cgb-map" aria-hidden="true">
    <g class="cgb-cam">
      <image href="${MAP}" width="${MAP_W}" height="${MAP_H}"/>
      <path class="cgb-ghost" d="${ROUTE}" fill="none" stroke="#7a1d12" stroke-opacity=".3" stroke-width="7" stroke-dasharray="16 12" stroke-linecap="round"/>
      <path class="cgb-glow" d="${ROUTE}" fill="none" stroke="#ff6a4a" stroke-opacity=".35" stroke-width="20" stroke-linecap="round"/>
      <path class="cgb-trail" d="${ROUTE}" fill="none" stroke="#d4231f" stroke-width="9" stroke-linecap="round"/>
      <g class="cgb-rip" transform="translate(${POND.x} ${POND.y})">${[0, 1, 2].map(() => '<ellipse fill="none" stroke="#fff" stroke-width="3"/>').join('')}</g>
      <g class="cgb-car">${CAR}</g>
    </g>
  </svg>
  <div class="cgb-hud" data-k="hud">
    <i>${esc(dateDots)} ${WD} · ROUTE</i>
    <b>${esc(CFG.from)} → ${esc(CFG.place)}</b>
    <div><span class="cgb-km">0 km</span><span class="cgb-stage">출발</span></div>
  </div>
  <div class="cgb-layer cgb-water">
    <svg class="cgb-layer cgb-wrip" aria-hidden="true">${[0, 1, 2, 3].map(() => '<ellipse fill="none" stroke="#a8c5be" stroke-width="1.5"/>').join('')}</svg>
    <div class="cgb-layer cgb-grid" style="opacity:.7"></div>
  </div>
  <div class="cgb-card">
    <div class="cgb-tag" data-in="0"><img src="${PROF}" alt="">CADDIS-GR · Fly Fishing Log · ${esc(CFG.place)}</div>
    ${dateSpaced ? `<div class="cgb-date" data-in=".15">${dateSpaced} · ${WD}</div>` : ''}
    <h1 class="cgb-title" data-in=".3">${esc(CFG.title || '')}</h1>
    ${CFG.sub ? `<p class="cgb-sub" data-in=".55">${esc(CFG.sub)}</p>` : ''}
    ${CFG.catch != null ? `<div class="cgb-catch" data-in=".75">🎣 <b>0</b>수</div>` : ''}
    <div class="cgb-btns" data-in="1.05">
      ${CFG.music ? `<button type="button" class="cgb-music">▶ BGM과 함께 입장<small>${esc(CFG.music)}</small></button>` : ''}
      <button type="button" class="cgb-quiet">${CFG.music ? '조용히 입장' : '입장하기'}</button>
    </div>
  </div>
  <button type="button" class="cgb-skip">SKIP ›</button>
  <div class="cgb-bar"></div>
  <svg class="cgb-wave" viewBox="0 0 1440 60" preserveAspectRatio="none" aria-hidden="true"><path d="M0 0 H1440 V18 C1080 66 360 66 0 18 Z" fill="#1c362f"/></svg>`;

  // ── 보조 함수 ──
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const seg = (t, a, b) => clamp((t - a) / (b - a));
  const lerp = (a, b, k) => a + (b - a) * k;
  const ease = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  const easeOut = x => 1 - Math.pow(1 - x, 3);
  const easeIn = x => x * x * x;
  const back = x => { const c = 1.70158; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };

  let root, el = {}, LEN = 0, LINE_LEN = 0, LN = null, exitAt = null, started = false, t0 = 0, raf;

  function build() {
    if (!document.getElementById('cgb-style')) {
      const st = document.createElement('style');
      st.id = 'cgb-style';
      st.textContent = CSS;
      document.head.appendChild(st);
    }
    root = document.createElement('div');
    root.id = 'cgb';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-label', '조행기 오프닝');
    root.innerHTML = HTML;
    document.body.appendChild(root);
    pre.remove();
    document.documentElement.style.overflow = 'hidden';
    window.scrollTo(0, 0);

    const q = s => root.querySelector(s);
    el = {
      ident: q('[data-k=ident]'), identSvg: q('[data-k=identSvg]'), brand: q('[data-k=brand]'),
      line: q('.cgb-line'), fly: q('.cgb-fly'), splash: root.querySelectorAll('.cgb-splash ellipse'),
      map: q('.cgb-map'), cam: q('.cgb-cam'), ghost: q('.cgb-ghost'), glow: q('.cgb-glow'), trail: q('.cgb-trail'),
      car: q('.cgb-car'), beam: q('.cgb-beam'), rip: root.querySelectorAll('.cgb-rip ellipse'),
      hud: q('[data-k=hud]'), km: q('.cgb-km'), stage: q('.cgb-stage'),
      water: q('.cgb-water'), wrip: q('.cgb-wrip'), wrips: root.querySelectorAll('.cgb-wrip ellipse'),
      card: q('.cgb-card'), ins: root.querySelectorAll('[data-in]'), catchN: q('.cgb-catch b'),
      btns: q('.cgb-btns'), skip: q('.cgb-skip'), bar: q('.cgb-bar')
    };
    LEN = el.trail.getTotalLength();
    [el.trail, el.glow].forEach(p => p.setAttribute('stroke-dasharray', `${LEN} ${LEN}`));

    const music = q('.cgb-music');
    if (music) music.onclick = () => enter(true);
    q('.cgb-quiet').onclick = () => enter(false);
    el.skip.onclick = () => enter(false);
    if (!RECORD) {
      root.addEventListener('wheel', e => { if (e.deltaY > 0) enter(false); }, { passive: true });
      let ty = null;
      root.addEventListener('touchstart', e => { ty = e.touches[0].clientY; }, { passive: true });
      root.addEventListener('touchmove', e => { if (ty != null && ty - e.touches[0].clientY > 40) enter(false); }, { passive: true });
      document.addEventListener('keydown', onKey);
    }
  }

  function onKey(e) {
    if (['Escape', 'ArrowDown', 'PageDown', ' ', 'Enter'].includes(e.key)) { e.preventDefault(); enter(false); }
  }

  // 지도 좌표 → 화면 좌표 카메라
  function camera(t, W, H, carPt) {
    const cover = Math.max(W / MAP_W, H / MAP_H);
    const fit = Math.min(W / (BBOX.x1 - BBOX.x0), H / (BBOX.y1 - BBOX.y0)) * .92;
    let s = Math.max(cover, fit) * (1 + .16 * ease(seg(t, T.iris0, T.drive1)));
    const bc = { x: (BBOX.x0 + BBOX.x1) / 2, y: (BBOX.y0 + BBOX.y1) / 2 };
    const follow = W / H < .8 ? .85 : .5;   // 세로 화면은 차량을 더 바짝 따라간다
    let cx = lerp(bc.x, carPt.x, follow), cy = lerp(bc.y, carPt.y, follow);
    const dv = easeIn(seg(t, T.dive0, T.dive1));
    s *= lerp(1, 6, dv);
    cx = lerp(cx, POND.x, ease(seg(t, T.dive0 - .3, T.dive1)));
    cy = lerp(cy, POND.y, ease(seg(t, T.dive0 - .3, T.dive1)));
    const tx = clamp(W / 2 - cx * s, W - MAP_W * s, 0);
    const ty = clamp(H / 2 - cy * s, H - MAP_H * s, 0);
    return { s, tx, ty, toScreen: p => ({ x: p.x * s + tx, y: p.y * s + ty }) };
  }

  function render(t) {
    const W = root.clientWidth, H = root.clientHeight;
    const show = (node, o) => { node.style.opacity = o; node.style.visibility = o > 0.001 ? 'visible' : 'hidden'; };

    // ① 브랜드 + 플라이 라인 (화면 비율에 맞는 구도 선택)
    const ln = W / H < .8 ? LINES.tall : LINES.wide;
    if (ln !== LN) {
      LN = ln;
      el.identSvg.setAttribute('viewBox', `0 0 ${ln.vb[0]} ${ln.vb[1]}`);
      el.line.setAttribute('d', ln.d);
      LINE_LEN = el.line.getTotalLength();
      el.line.setAttribute('stroke-dasharray', `${LINE_LEN} ${LINE_LEN}`);
    }
    const lk = easeOut(seg(t, T.line0, T.line1));
    el.line.setAttribute('stroke-dashoffset', LINE_LEN * (1 - lk));
    const tip = el.line.getPointAtLength(LINE_LEN * lk);
    const pre = el.line.getPointAtLength(Math.max(0, LINE_LEN * lk - 4));
    const fa = Math.atan2(tip.y - pre.y, tip.x - pre.x) * 180 / Math.PI;
    el.fly.setAttribute('transform', `translate(${tip.x} ${tip.y}) rotate(${fa})`);
    el.fly.style.opacity = lk > .02 ? 1 : 0;
    el.splash.forEach((e, i) => {
      const u = seg(t, T.line1 + i * .18, T.line1 + i * .18 + .9);
      e.setAttribute('cx', ln.end.x); e.setAttribute('cy', ln.end.y);
      e.setAttribute('rx', 8 + u * 90); e.setAttribute('ry', 3 + u * 30);
      e.setAttribute('opacity', u > 0 ? (1 - u) * .8 : 0);
    });
    const bIn = easeOut(seg(t, .55, 1.25)), bOut = seg(t, T.iris0, T.iris0 + .45);
    el.brand.style.opacity = bIn * (1 - bOut);
    el.brand.style.transform = `translate(-50%,-50%) translateY(${(1 - bIn) * 18}px) scale(${1 + bOut * .06})`;
    el.brand.querySelector('b').style.letterSpacing = `${lerp(.5, .04, bIn)}em`;
    const identOff = t > T.iris1;
    show(el.ident, identOff ? 0 : 1); show(el.identSvg, identOff ? 0 : 1);

    // ② 지도 (아이리스 열림 → 주행 → 다이브)
    const k = ease(seg(t, T.drive0, T.drive1));
    const d = k * LEN;
    const p = el.trail.getPointAtLength(d);
    const pa = el.trail.getPointAtLength(Math.max(0, d - 2)), pb = el.trail.getPointAtLength(Math.min(LEN, d + 2));
    const ang = Math.atan2(pb.y - pa.y, pb.x - pa.x) * 180 / Math.PI;
    const cam = camera(t, W, H, p);
    el.map.setAttribute('viewBox', `0 0 ${W} ${H}`);
    el.cam.setAttribute('transform', `translate(${cam.tx} ${cam.ty}) scale(${cam.s})`);
    const ik = easeIn(seg(t, T.iris0, T.iris1));
    if (t < T.iris0) show(el.map, 0);
    else {
      show(el.map, 1);
      const [vw, vh] = ln.vb, sc = Math.max(W / vw, H / vh);
      const fx = (W - vw * sc) / 2 + ln.end.x * sc, fy = (H - vh * sc) / 2 + ln.end.y * sc;
      el.map.style.clipPath = ik < 1 ? `circle(${ik * Math.hypot(W, H) * 1.05}px at ${fx}px ${fy}px)` : 'none';
    }
    el.trail.setAttribute('stroke-dashoffset', LEN - d);
    el.glow.setAttribute('stroke-dashoffset', LEN - d);
    el.ghost.setAttribute('stroke-dashoffset', -t * 30);
    const appear = back(seg(t, T.drive0 - .3, T.drive0 + .2));
    el.car.setAttribute('transform', `translate(${p.x} ${p.y}) rotate(${ang}) scale(${appear})`);
    el.beam.setAttribute('opacity', (.22 * seg(t, T.drive0, T.drive0 + .4) * (1 - seg(t, T.drive1, T.drive1 + .4))).toFixed(3));
    el.rip.forEach((e, i) => {
      const u = seg(t, T.drive1 - .1 + i * .25, T.drive1 + .9 + i * .25);
      e.setAttribute('rx', 10 + u * 70); e.setAttribute('ry', 4 + u * 26);
      e.setAttribute('opacity', u > 0 ? (1 - u) * .9 : 0);
    });
    const hk = seg(t, T.iris1 - .2, T.iris1 + .3) * (1 - seg(t, T.dive0, T.dive0 + .35));
    show(el.hud, hk);
    el.hud.style.transform = `translateY(${(1 - easeOut(seg(t, T.iris1 - .2, T.iris1 + .3))) * -12}px)`;
    el.km.textContent = `${Math.round(k * CFG.km)} km`;
    el.stage.textContent = k < .03 ? '출발' : k < .32 ? '남양주 지나는 중' : k < .52 ? '하남 지나는 중' : k < .78 ? '광주 지나는 중' : k < 1 ? '용인 진입' : '도착';

    // ③ 물빛으로 화면 채우기
    const pond = cam.toScreen(POND);
    const wk = easeIn(seg(t, T.water0, T.water1));
    if (t < T.water0) show(el.water, 0);
    else {
      show(el.water, 1);
      el.water.style.clipPath = wk < 1 ? `circle(${wk * Math.hypot(W, H) * 1.1}px at ${pond.x}px ${pond.y}px)` : 'none';
      if (t >= T.water1) show(el.map, 0);
    }
    el.wrip.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const rc = { x: W * .78, y: H * .62 };
    el.wrips.forEach((e, i) => {
      const u = (((t - T.water0) / 4.8 + i / 4) % 1 + 1) % 1;
      e.setAttribute('cx', rc.x); e.setAttribute('cy', rc.y);
      e.setAttribute('rx', 30 + u * W * .55); e.setAttribute('ry', 10 + u * W * .18);
      e.setAttribute('opacity', t > T.water0 ? (1 - u) * .22 : 0);
    });

    // ④ 타이틀 카드
    el.ins.forEach(n => {
      const u = easeOut(seg(t, T.card + +n.dataset.in, T.card + +n.dataset.in + .7));
      n.style.opacity = u;
      n.style.transform = `translateY(${(1 - u) * 26}px)`;
    });
    if (el.catchN) el.catchN.textContent = Math.round(easeOut(seg(t, T.card + .8, T.card + 1.9)) * (+CFG.catch || 0));
    el.btns.style.pointerEvents = t > T.card + 1.05 ? 'auto' : 'none';
    show(el.skip, t < T.card + .9 ? 1 : 0);
    el.bar.style.width = `${clamp(t / T.end) * 100}%`;
    el.bar.style.opacity = 1 - seg(t, T.end, T.end + .4);
  }

  // 막 올리기 (입장)
  function renderExit(u) {
    const e = ease(clamp(u));
    root.style.transform = `translateY(${-e * 115}%)`;
    // 막이 오르기 전에 카드 글자를 먼저 지워 제목이 두 번 겹쳐 보이지 않게 한다
    const f = 1 - seg(u, 0, .3);
    el.card.style.opacity = f;
    el.skip.style.opacity = Math.min(+el.skip.style.opacity || 0, f);
  }

  function enter(withMusic) {
    if (exitAt !== null || RECORD) return;
    exitAt = performance.now();
    if (withMusic && typeof window.toggleBgm === 'function') { try { window.toggleBgm(); } catch (e) {} }
    document.removeEventListener('keydown', onKey);
    root.style.pointerEvents = 'none';
    document.documentElement.style.overflow = '';
  }

  function loop(now) {
    const t = (now - t0) / 1000;
    render(Math.min(t, 30));
    if (exitAt !== null) {
      const u = (now - exitAt) / 1000 / T.exit;
      renderExit(u);
      if (u >= 1) { root.remove(); return; }
    }
    raf = requestAnimationFrame(loop);
  }

  function start() {
    if (started) return;
    started = true;
    t0 = performance.now();
    raf = requestAnimationFrame(loop);
  }

  function boot() {
    build();
    render(0);
    if (RECORD) {
      // 영상 추출용: window.__bumper.renderAt(초, 막올림진행0~1)
      window.__bumper = { renderAt: (t, u) => { render(t); renderExit(u || 0); }, T };
      return;
    }
    const ready = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    Promise.race([ready, new Promise(r => setTimeout(r, 1200))]).then(start);
  }

  // 다시 재생 (이미 재생 중이면 무시)
  window.CADDIS_BUMPER_PLAY = function () {
    if (root && root.isConnected) return;
    exitAt = null; started = false; LN = null;
    build();
    render(0);
    start();
  };

  // '오프닝 다시 보기' 버튼 (replay:true 일 때)
  function addReplayButton() {
    const st = document.createElement('style');
    st.textContent = `.cgb-replay{position:fixed;right:calc(16px + env(safe-area-inset-right, 0px));bottom:calc(16px + env(safe-area-inset-bottom, 0px));z-index:9000;transition:opacity .3s,visibility .3s;
  font:500 12px 'Noto Sans KR',sans-serif;letter-spacing:.04em;color:#fff;background:rgba(20,35,30,.9);border:1px solid rgba(168,197,190,.35);
  border-radius:999px;padding:10px 16px;cursor:pointer;backdrop-filter:blur(8px);box-shadow:0 6px 20px rgba(0,0,0,.25)}
.cgb-replay:hover{background:rgba(45,82,72,.95)}
.cgb-replay[data-off]{opacity:0;visibility:hidden}
.cgb-replay:focus-visible{outline:2px solid #e6c35c;outline-offset:2px}`;
    document.head.appendChild(st);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'cgb-replay';
    btn.textContent = '↻ 오프닝 다시 보기';
    btn.onclick = () => { window.scrollTo(0, 0); window.CADDIS_BUMPER_PLAY(); };
    document.body.appendChild(btn);
    // 첫 화면(히어로 제목)을 가리지 않도록, 조금 내려간 뒤부터 보인다
    const sync = () => btn.toggleAttribute('data-off', window.scrollY < window.innerHeight * .6);
    window.addEventListener('scroll', sync, { passive: true });
    sync();
  }

  const onReady = fn => document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn) : fn();
  if (CFG.replay && !RECORD) onReady(addReplayButton);
  if (AUTO) onReady(boot);
})();
