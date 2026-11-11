import { useEffect, useRef } from "react";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

  .cld-root {
    --primary: #4a6fff; --primary-light: #7c99ff; --primary-bg: #e5ebff;
    --success: #00b96b; --success-bg: #d9ffe7;
    --warning: #ff8c42; --warning-bg: #fff0e0;
    --danger: #e74c3c;  --danger-bg: #ffe5e5;
    --purple: #7c3aed;  --purple-bg: #ede9fe;
    --dark: #253572; --text: #333344; --muted: #888899;
    --border: #e6e9f7; --bg: #eef0f8; --card: #ffffff;
    --radius: 16px; --shadow: 0 4px 24px rgba(74,111,255,0.08);
    font-family: 'DM Sans', Arial, sans-serif;
    background: var(--bg);
    color: var(--text);
    font-size: 14px;
    line-height: 1.6;
    min-height: 100vh;
  }
  .cld-root *, .cld-root *::before, .cld-root *::after { box-sizing: border-box; margin: 0; padding: 0; }

  /* HEADER */
  .cld-header { background: linear-gradient(135deg,#4a6fff 0%,#7c99ff 100%); padding: 0 20px; position: sticky; top:0; z-index:100; box-shadow: 0 4px 20px rgba(74,111,255,0.25); }
  .cld-header-inner { max-width:1320px; margin:0 auto; display:flex; align-items:center; gap:12px; min-height:64px; padding:10px 0; }
  .cld-header-logo { width:42px; height:42px; border-radius:11px; background:rgba(255,255,255,0.22); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .cld-header-logo svg { width:24px; height:24px; }
  .cld-header-info { flex:1; min-width:0; }
  .cld-header-title { color:#fff; font-size:16px; font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .cld-header-sub { color:rgba(255,255,255,.7); font-size:11px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .cld-header-controls { display:flex; align-items:center; gap:8px; flex-shrink:0; }
  .cld-hc-select { background:rgba(255,255,255,.18); border:1px solid rgba(255,255,255,.3); color:#fff; padding:6px 10px; border-radius:8px; font-size:12px; font-family:'DM Sans',sans-serif; cursor:pointer; outline:none; }
  .cld-hc-select option { color:#333; background:#fff; }
  .cld-refresh-badge { background:rgba(255,255,255,.18); border:1px solid rgba(255,255,255,.3); color:rgba(255,255,255,.9); padding:6px 10px; border-radius:8px; font-size:11px; display:flex; align-items:center; gap:5px; white-space:nowrap; }
  .cld-pulse { width:7px; height:7px; background:#00ff99; border-radius:50%; animation:cld-pulse 1.8s infinite; flex-shrink:0; }
  @keyframes cld-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(.8)} }
  .cld-header-date { color:rgba(255,255,255,.85); font-size:12px; white-space:nowrap; }
  .cld-ham-btn { display:none; background:rgba(255,255,255,.18); border:1px solid rgba(255,255,255,.3); border-radius:8px; padding:8px 10px; cursor:pointer; flex-shrink:0; flex-direction:column; gap:4px; }
  .cld-ham-btn span { display:block; width:18px; height:2px; background:#fff; border-radius:2px; }
  .cld-mobile-drawer { display:none; background:rgba(0,0,0,.12); border-top:1px solid rgba(255,255,255,.2); padding:12px 20px; gap:8px; flex-wrap:wrap; }
  .cld-mobile-drawer.open { display:flex; }

  /* LAYOUT */
  .cld-page { max-width:1320px; margin:0 auto; padding:0 16px 48px; overflow:hidden; }

  /* SECTION HEADER */
  .cld-sh { display:flex; align-items:center; gap:10px; margin:24px 0 12px; flex-wrap:wrap; }
  .cld-sh-dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; }
  .cld-sh-title { font-size:15px; font-weight:700; color:var(--dark); }
  .cld-sh-badge { font-size:11px; font-weight:700; padding:3px 10px; border-radius:20px; white-space:nowrap; }
  .cld-sh-line { flex:1; height:1px; background:var(--border); min-width:20px; }

  /* KPI */
  .cld-kpi-grid { display:grid; grid-template-columns:repeat(6,1fr); gap:12px; min-width:0; }
  .cld-kpi { border-radius:18px; border:1px solid var(--border); padding:0; background:#fff; box-shadow:0 2px 16px rgba(74,111,255,0.07); position:relative; overflow:hidden; min-width:0; display:flex; flex-direction:column; transition:transform .15s,box-shadow .15s; cursor:default; }
  .cld-kpi:hover { transform:translateY(-2px); box-shadow:0 8px 28px rgba(74,111,255,0.14); }
  .cld-kpi-head { padding:14px 14px 10px 18px; display:flex; align-items:flex-start; justify-content:space-between; gap:8px; }
  .cld-kpi.red    .cld-kpi-head { background:linear-gradient(135deg,#fff0f0 0%,#fff 70%); }
  .cld-kpi.amber  .cld-kpi-head { background:linear-gradient(135deg,#fff5ed 0%,#fff 70%); }
  .cld-kpi.blue   .cld-kpi-head { background:linear-gradient(135deg,#eff2ff 0%,#fff 70%); }
  .cld-kpi.teal   .cld-kpi-head { background:linear-gradient(135deg,#edfff6 0%,#fff 70%); }
  .cld-kpi.purple .cld-kpi-head { background:linear-gradient(135deg,#f3f0ff 0%,#fff 70%); }
  .cld-kpi.green  .cld-kpi-head { background:linear-gradient(135deg,#edfff6 0%,#fff 70%); }
  .cld-kpi::before { content:''; position:absolute; top:0; left:0; bottom:0; width:4px; border-radius:18px 0 0 18px; }
  .cld-kpi.red::before    { background:linear-gradient(180deg,#e74c3c,#ff7675); }
  .cld-kpi.amber::before  { background:linear-gradient(180deg,#ff8c42,#ffc048); }
  .cld-kpi.blue::before   { background:linear-gradient(180deg,#4a6fff,#7c99ff); }
  .cld-kpi.teal::before   { background:linear-gradient(180deg,#00b96b,#1dce7d); }
  .cld-kpi.purple::before { background:linear-gradient(180deg,#7c3aed,#a78bfa); }
  .cld-kpi.green::before  { background:linear-gradient(180deg,#059669,#10b981); }
  .cld-kpi-icon { width:38px; height:38px; border-radius:11px; flex-shrink:0; display:flex; align-items:center; justify-content:center; font-size:18px; }
  .cld-kpi.red    .cld-kpi-icon { background:#ffe5e5; }
  .cld-kpi.amber  .cld-kpi-icon { background:#fff0e0; }
  .cld-kpi.blue   .cld-kpi-icon { background:#e5ebff; }
  .cld-kpi.teal   .cld-kpi-icon { background:#d9ffe7; }
  .cld-kpi.purple .cld-kpi-icon { background:#ede9fe; }
  .cld-kpi.green  .cld-kpi-icon { background:#d9ffe7; }
  .cld-kpi-top { flex:1; min-width:0; }
  .cld-kpi-lbl { font-size:10px; color:var(--muted); font-weight:700; text-transform:uppercase; letter-spacing:.7px; margin-bottom:4px; }
  .cld-kpi-val { font-size:28px; font-weight:800; line-height:1.1; font-family:'DM Mono',monospace; }
  .cld-kpi.red    .cld-kpi-val { color:#d63031; }
  .cld-kpi.amber  .cld-kpi-val { color:#e17000; }
  .cld-kpi.blue   .cld-kpi-val { color:#3459e6; }
  .cld-kpi.teal   .cld-kpi-val { color:#009e5a; }
  .cld-kpi.purple .cld-kpi-val { color:#6d28d9; }
  .cld-kpi.green  .cld-kpi-val { color:#047857; }
  .cld-kpi-spark { padding:0; margin:0; height:48px; width:100%; overflow:hidden; }
  .cld-kpi-spark svg { display:block; width:100%; height:48px; }
  .cld-kpi-foot { padding:8px 14px 11px 18px; display:flex; align-items:center; justify-content:space-between; gap:6px; border-top:1px solid var(--border); }
  .cld-kpi-delta { font-size:11px; font-weight:700; display:inline-flex; align-items:center; gap:3px; padding:3px 9px; border-radius:20px; }
  .cld-ub { color:#c0392b; background:#ffe5e5; } .cld-ug { color:#0a7a3a; background:#d9ffe7; }
  .cld-dg { color:#0a7a3a; background:#d9ffe7; } .cld-db { color:#c0392b; background:#ffe5e5; }
  .cld-kpi-sub { font-size:10px; color:var(--muted); white-space:nowrap; }

  /* PIPELINE */
  .cld-pipe-wrap { background:#fff; border-radius:var(--radius); border:1px solid var(--border); box-shadow:var(--shadow); padding:22px 24px 18px; }
  .cld-pipe-track-wrap { position:relative; padding:8px 0 6px; }
  .cld-pipe-track { position:absolute; top:50%; left:0; right:0; height:3px; background:#eef0f8; transform:translateY(-50%); border-radius:3px; z-index:0; }
  .cld-pipe-track-fill { height:100%; border-radius:3px; background:linear-gradient(90deg, #1D9E75 0%, #1D9E75 35%, #EF9F27 35%, #BA7517 47%, #e6e9f7 47%); width:100%; }
  .cld-pipeline { display:flex; align-items:center; justify-content:space-between; position:relative; z-index:1; }
  .cld-pipe-stage { display:flex; flex-direction:column; align-items:center; gap:8px; flex:1; min-width:0; }
  .cld-pipe-node { width:62px; height:62px; border-radius:50%; display:flex; flex-direction:column; align-items:center; justify-content:center; border:2.5px solid; background:#fff; position:relative; transition:transform .15s, box-shadow .15s; cursor:default; flex-shrink:0; }
  .cld-pipe-node:hover { transform:scale(1.08); box-shadow:0 6px 20px rgba(0,0,0,0.12); }
  .cld-pipe-node.done   { border-color:#1D9E75; background:#f0fdf8; }
  .cld-pipe-node.bottle { border-color:#BA7517; background:#fffbf0; box-shadow:0 0 0 4px rgba(186,117,23,0.12); }
  .cld-pipe-node.prog   { border-color:#c5d2ff; background:#f5f7ff; }
  .cld-pipe-node.wait   { border-color:#e0e3ef; background:#f8f9fc; }
  .cld-pipe-node-num { font-size:16px; font-weight:700; line-height:1; font-family:'DM Mono',monospace; }
  .cld-pipe-node.done   .cld-pipe-node-num { color:#0F6E56; }
  .cld-pipe-node.bottle .cld-pipe-node-num { color:#854F0B; }
  .cld-pipe-node.prog   .cld-pipe-node-num { color:#3459e6; }
  .cld-pipe-node.wait   .cld-pipe-node-num { color:#888899; }
  .cld-pipe-node.bottle::after { content:''; position:absolute; inset:-6px; border-radius:50%; border:2px solid rgba(186,117,23,0.35); animation:cld-ring-pulse 2s ease-in-out infinite; }
  @keyframes cld-ring-pulse { 0%,100%{ opacity:1; transform:scale(1); } 50%{ opacity:0; transform:scale(1.15); } }
  .cld-pipe-node-icon { width:14px; height:14px; border-radius:50%; display:flex; align-items:center; justify-content:center; margin-top:2px; flex-shrink:0; }
  .cld-pipe-node.done   .cld-pipe-node-icon { background:#1D9E75; }
  .cld-pipe-node.bottle .cld-pipe-node-icon { background:#BA7517; }
  .cld-pipe-node.prog   .cld-pipe-node-icon { background:#4a6fff; }
  .cld-pipe-node.wait   .cld-pipe-node-icon { background:#c8cce0; }
  .cld-pipe-lbl-wrap { text-align:center; }
  .cld-pipe-lbl-name { font-size:11px; font-weight:600; color:var(--dark); white-space:nowrap; }
  .cld-pipe-lbl-tag { display:inline-block; margin-top:3px; font-size:9px; font-weight:700; padding:1px 8px; border-radius:20px; white-space:nowrap; letter-spacing:.2px; }
  .cld-pipe-lbl-tag.done   { background:#E1F5EE; color:#0F6E56; }
  .cld-pipe-lbl-tag.bottle { background:#FAEEDA; color:#854F0B; }
  .cld-pipe-lbl-tag.prog   { background:#E6F1FB; color:#3459e6; }
  .cld-pipe-lbl-tag.wait   { background:#f0f0f5; color:#888899; }
  .cld-pipe-arrow { flex-shrink:0; width:28px; display:flex; align-items:center; justify-content:center; padding-bottom:28px; }
  .cld-pipe-footer { margin-top:16px; padding-top:12px; border-top:1px solid var(--border); display:flex; align-items:center; justify-content:center; gap:8px; font-size:11px; color:var(--muted); flex-wrap:wrap; }
  .cld-pipe-footer strong { color:var(--dark); font-weight:700; }
  .cld-pipe-alert-pill { background:#FAEEDA; color:#854F0B; font-weight:700; padding:2px 10px; border-radius:20px; font-size:10px; display:inline-flex; align-items:center; gap:4px; }
  .cld-pipe-sep { color:#d0d4e8; }

  /* GRIDS */
  .cld-g3 { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; min-width:0; }
  .cld-g4 { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; min-width:0; }
  .cld-g2 { display:grid; grid-template-columns:repeat(2,1fr); gap:14px; min-width:0; }

  /* CHART CARD */
  .cld-cc { background:#fff; border-radius:var(--radius); border:1px solid var(--border); box-shadow:var(--shadow); padding:16px; display:flex; flex-direction:column; gap:12px; min-width:0; overflow:hidden; }
  .cld-ct { font-size:13px; font-weight:700; color:var(--dark); }
  .cld-cs { font-size:11px; color:var(--muted); margin-top:1px; }
  .cld-cb { font-size:11px; font-weight:700; padding:2px 9px; border-radius:20px; margin-left:auto; white-space:nowrap; }
  .cld-ch { display:flex; align-items:flex-start; gap:8px; }
  .cld-chi { flex:1; min-width:0; }
  .cld-cv { position:relative; height:165px; width:100%; overflow:hidden; display:block; }
  .cld-cv canvas { position:absolute; top:0; left:0; width:100% !important; height:100% !important; }

  /* LEGEND */
  .cld-leg { display:flex; align-items:center; gap:12px; flex-wrap:wrap; margin-top:-4px; }
  .cld-li { display:flex; align-items:center; gap:5px; font-size:11px; color:var(--muted); }
  .cld-ld { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
  .cld-ll { width:16px; height:3px; border-radius:2px; flex-shrink:0; }

  /* RANK LIST */
  .cld-rl { display:flex; flex-direction:column; gap:9px; }
  .cld-ri { display:flex; flex-direction:column; gap:4px; }
  .cld-rt { display:flex; justify-content:space-between; align-items:center; }
  .cld-rn { font-size:12px; font-weight:600; color:var(--text); }
  .cld-rc { font-size:12px; font-weight:700; color:var(--dark); font-family:'DM Mono',monospace; }
  .cld-rb { height:5px; border-radius:4px; background:#eef0f8; overflow:hidden; }
  .cld-rbi { height:100%; border-radius:4px; }

  /* INSTRUMENT */
  .cld-il { display:flex; flex-direction:column; gap:7px; }
  .cld-ir { display:flex; align-items:center; gap:10px; padding:9px 11px; border-radius:8px; background:#f4f6fb; border:1px solid var(--border); }
  .cld-id { width:10px; height:10px; border-radius:50%; flex-shrink:0; }
  .cld-id.on{background:var(--success)} .cld-id.off{background:var(--danger)} .cld-id.qc{background:var(--warning)}
  .cld-in_ { font-size:12px; font-weight:600; color:var(--dark); flex:1; min-width:0; }
  .cld-im { font-size:10px; color:var(--muted); }
  .cld-ib { font-size:10px; font-weight:700; padding:2px 8px; border-radius:10px; white-space:nowrap; }
  .cld-ib.on {background:var(--success-bg);color:#117a37}
  .cld-ib.off{background:var(--danger-bg);color:#c0392b}
  .cld-ib.qc {background:var(--warning-bg);color:#b85c00}

  /* ALERTS */
  .cld-al { display:flex; flex-direction:column; gap:8px; }
  .cld-ar { display:flex; align-items:flex-start; gap:10px; padding:11px 14px; border-radius:10px; border-left:4px solid; }
  .cld-ar.high  {background:#fff5f5;border-color:var(--danger)}
  .cld-ar.med   {background:#fffbf0;border-color:var(--warning)}
  .cld-ar.low   {background:#f0fbf4;border-color:var(--success)}
  .cld-ai { font-size:14px; margin-top:1px; flex-shrink:0; }
  .cld-ab { flex:1; min-width:0; }
  .cld-at2 { font-size:12px; font-weight:700; color:var(--dark); }
  .cld-ad { font-size:11px; color:var(--muted); margin-top:2px; }
  .cld-atime { font-size:10px; color:var(--muted); white-space:nowrap; }
  .cld-sb { font-size:10px; font-weight:700; padding:2px 8px; border-radius:10px; white-space:nowrap; }
  .cld-sb.high{background:var(--danger-bg);color:#c0392b}
  .cld-sb.med {background:var(--warning-bg);color:#b85c00}
  .cld-sb.low {background:var(--success-bg);color:#117a37}

  /* DONUT */
  .cld-dr { display:flex; align-items:center; gap:14px; }
  .cld-dc { flex-shrink:0; width:110px !important; height:110px !important; }
  .cld-dl { display:flex; flex-direction:column; gap:6px; flex:1; }
  .cld-di { display:flex; justify-content:space-between; align-items:center; font-size:11px; }
  .cld-dlab { display:flex; align-items:center; gap:5px; color:var(--text); }
  .cld-dv { font-weight:700; color:var(--dark); font-family:'DM Mono',monospace; font-size:12px; }

  /* SPARKLINE */
  .cld-sk { display:flex; align-items:flex-end; gap:3px; height:46px; margin-top:6px; }
  .cld-sb2 { flex:1; border-radius:3px 3px 0 0; }

  /* CV TABLE */
  .cld-cvt { width:100%; border-collapse:collapse; font-size:12px; }
  .cld-cvt th { padding:9px 12px; text-align:left; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.5px; color:#fff; background:linear-gradient(135deg,#ff8c42,#ffaa65); }
  .cld-cvt th:first-child{border-radius:10px 0 0 0} .cld-cvt th:last-child{border-radius:0 10px 0 0}
  .cld-cvt td { padding:9px 12px; border-bottom:1px solid #eef0fa; }
  .cld-cvt tr:nth-child(even) td { background:#fff8f8; }
  .cld-cvt tr:last-child td { border-bottom:none; }
  .cld-cvval { font-weight:700; color:var(--danger); font-family:'DM Mono',monospace; }
  .cld-ack-y { background:var(--success-bg); color:#117a37; font-size:10px; font-weight:700; padding:2px 8px; border-radius:10px; }
  .cld-ack-n { background:var(--danger-bg);  color:#c0392b; font-size:10px; font-weight:700; padding:2px 8px; border-radius:10px; }

  /* FOOTER */
  .cld-footer { margin-top:28px; padding:18px 20px; background:linear-gradient(135deg,#4a6fff,#7c99ff); border-radius:var(--radius); color:rgba(255,255,255,.8); font-size:12px; text-align:center; }
  .cld-footer strong { color:#fff; }

  .cld-root ::-webkit-scrollbar{width:5px;height:5px}
  .cld-root ::-webkit-scrollbar-track{background:var(--border);border-radius:3px}
  .cld-root ::-webkit-scrollbar-thumb{background:#c0c8e8;border-radius:3px}

  @media(max-width:1100px){
    .cld-kpi-grid{grid-template-columns:repeat(3,1fr)}
    .cld-g4{grid-template-columns:repeat(2,1fr)}
    .cld-pipe-node{width:52px;height:52px;}
    .cld-pipe-node-num{font-size:13px;}
    .cld-pipe-arrow{width:16px;}
    .cld-pipe-lbl-name{font-size:10px;}
    .cld-pipe-lbl-tag{font-size:8px;}
  }
  @media(max-width:768px){
    .cld-header-sub,.cld-header-controls{display:none}
    .cld-ham-btn{display:flex}
    .cld-kpi-grid{grid-template-columns:repeat(2,1fr);gap:8px}
    .cld-g3,.cld-g4,.cld-g2{grid-template-columns:1fr}
    .cld-pipe-node{width:46px;height:46px;}
    .cld-pipe-node-num{font-size:12px;}
    .cld-pipe-arrow{width:12px;}
    .cld-pipe-lbl-name{font-size:9px;}
    .cld-pipe-lbl-tag{display:none;}
    .cld-kpi-val{font-size:22px}
    .cld-cv{height:180px}
    .cld-dr{flex-direction:column;align-items:flex-start}
    .cld-dc{width:90px!important;height:90px!important}
    .cld-ar{flex-wrap:wrap;gap:6px}
    .cld-cvt th,.cld-cvt td{padding:7px 8px;font-size:11px}
    .cld-page{padding:0 10px 36px}
    .cld-sh-title{font-size:14px}
    .cld-ct{font-size:12px}
    .cld-footer{font-size:11px;padding:14px}
    .cld-kpi-spark{height:24px}
  }
  @media(max-width:480px){
    .cld-kpi-val{font-size:20px}
    .cld-kpi-lbl{font-size:9px}
    .cld-kpi-head{padding:12px 10px 8px 14px}
    .cld-kpi-foot{padding:7px 10px 9px 14px}
    .cld-kpi-icon{width:32px;height:32px;font-size:15px}
    .cld-cc{padding:12px}
    .cld-header-title{font-size:14px}
    .cld-pipe-wrap{padding:14px 10px 12px;}
    .cld-pipe-node{width:40px;height:40px;}
    .cld-pipe-arrow svg{width:12px;}
  }
`;

// ---- Sparkline SVGs (inline, verbatim from source) ----
const Spark1 = () => (
  <svg viewBox="0 0 200 48" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="sg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#e74c3c" stopOpacity="0.16"/><stop offset="100%" stopColor="#e74c3c" stopOpacity="0.01"/></linearGradient></defs>
    <path d="M 6,38 C 17,38 26.3,32 37.3,32 C 48.3,32 57.7,36 68.7,36 C 79.7,36 89,26 100,26 C 111,26 120.3,30 131.3,30 C 142.3,30 151.7,22 162.7,22 C 173.7,22 183,6 194,6 L 194,48 L 6,48 Z" fill="url(#sg1)" stroke="none"/>
    <path d="M 6,38 C 17,38 26.3,32 37.3,32 C 48.3,32 57.7,36 68.7,36 C 79.7,36 89,26 100,26 C 111,26 120.3,30 131.3,30 C 142.3,30 151.7,22 162.7,22 C 173.7,22 183,6 194,6" fill="none" stroke="#e74c3c" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="194" cy="6" r="3.5" fill="#e74c3c" stroke="white" strokeWidth="1.5"/>
  </svg>
);
const Spark2 = () => (
  <svg viewBox="0 0 200 48" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="sg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#e17000" stopOpacity="0.16"/><stop offset="100%" stopColor="#e17000" stopOpacity="0.01"/></linearGradient></defs>
    <path d="M 6,36 C 17,36 26.3,38 37.3,38 C 48.3,38 57.7,30 68.7,30 C 79.7,30 89,33 100,33 C 111,33 120.3,26 131.3,26 C 142.3,26 151.7,18 162.7,18 C 173.7,18 183,6 194,6 L 194,48 L 6,48 Z" fill="url(#sg2)" stroke="none"/>
    <path d="M 6,36 C 17,36 26.3,38 37.3,38 C 48.3,38 57.7,30 68.7,30 C 79.7,30 89,33 100,33 C 111,33 120.3,26 131.3,26 C 142.3,26 151.7,18 162.7,18 C 173.7,18 183,6 194,6" fill="none" stroke="#e17000" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="194" cy="6" r="3.5" fill="#e17000" stroke="white" strokeWidth="1.5"/>
  </svg>
);
const Spark3 = () => (
  <svg viewBox="0 0 200 48" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="sg3" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3459e6" stopOpacity="0.16"/><stop offset="100%" stopColor="#3459e6" stopOpacity="0.01"/></linearGradient></defs>
    <path d="M 6,22 C 17,22 26.3,18.5 37.3,18.5 C 48.3,18.5 57.7,16 68.7,16 C 79.7,16 89,20.5 100,20.5 C 111,20.5 120.3,13 131.3,13 C 142.3,13 151.7,10 162.7,10 C 173.7,10 183,6 194,6 L 194,48 L 6,48 Z" fill="url(#sg3)" stroke="none"/>
    <path d="M 6,22 C 17,22 26.3,18.5 37.3,18.5 C 48.3,18.5 57.7,16 68.7,16 C 79.7,16 89,20.5 100,20.5 C 111,20.5 120.3,13 131.3,13 C 142.3,13 151.7,10 162.7,10 C 173.7,10 183,6 194,6" fill="none" stroke="#3459e6" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="194" cy="6" r="3.5" fill="#3459e6" stroke="white" strokeWidth="1.5"/>
  </svg>
);
const Spark4 = () => (
  <svg viewBox="0 0 200 48" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="sg4" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#009e5a" stopOpacity="0.16"/><stop offset="100%" stopColor="#009e5a" stopOpacity="0.01"/></linearGradient></defs>
    <path d="M 6,24 C 17,24 26.3,21 37.3,21 C 48.3,21 57.7,18.5 68.7,18.5 C 79.7,18.5 89,15.5 100,15.5 C 111,15.5 120.3,13 131.3,13 C 142.3,13 151.7,9.5 162.7,9.5 C 173.7,9.5 183,6 194,6 L 194,48 L 6,48 Z" fill="url(#sg4)" stroke="none"/>
    <path d="M 6,24 C 17,24 26.3,21 37.3,21 C 48.3,21 57.7,18.5 68.7,18.5 C 79.7,18.5 89,15.5 100,15.5 C 111,15.5 120.3,13 131.3,13 C 142.3,13 151.7,9.5 162.7,9.5 C 173.7,9.5 183,6 194,6" fill="none" stroke="#009e5a" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="194" cy="6" r="3.5" fill="#009e5a" stroke="white" strokeWidth="1.5"/>
  </svg>
);
const Spark5 = () => (
  <svg viewBox="0 0 200 48" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="sg5" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6d28d9" stopOpacity="0.16"/><stop offset="100%" stopColor="#6d28d9" stopOpacity="0.01"/></linearGradient></defs>
    <path d="M 6,6 C 17,6 26.3,10 37.3,10 C 48.3,10 57.7,16 68.7,16 C 79.7,16 89,13 100,13 C 111,13 120.3,18 131.3,18 C 142.3,18 151.7,22 162.7,22 C 173.7,22 183,28 194,28 L 194,48 L 6,48 Z" fill="url(#sg5)" stroke="none"/>
    <path d="M 6,6 C 17,6 26.3,10 37.3,10 C 48.3,10 57.7,16 68.7,16 C 79.7,16 89,13 100,13 C 111,13 120.3,18 131.3,18 C 142.3,18 151.7,22 162.7,22 C 173.7,22 183,28 194,28" fill="none" stroke="#6d28d9" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="194" cy="28" r="3.5" fill="#6d28d9" stroke="white" strokeWidth="1.5"/>
  </svg>
);
const Spark6 = () => (
  <svg viewBox="0 0 200 48" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="sg6" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#047857" stopOpacity="0.16"/><stop offset="100%" stopColor="#047857" stopOpacity="0.01"/></linearGradient></defs>
    <path d="M 6,40 C 17,40 26.3,34 37.3,34 C 48.3,34 57.7,28 68.7,28 C 79.7,28 89,24 100,24 C 111,24 120.3,18 131.3,18 C 142.3,18 151.7,13 162.7,13 C 173.7,13 183,6 194,6 L 194,48 L 6,48 Z" fill="url(#sg6)" stroke="none"/>
    <path d="M 6,40 C 17,40 26.3,34 37.3,34 C 48.3,34 57.7,28 68.7,28 C 79.7,28 89,24 100,24 C 111,24 120.3,18 131.3,18 C 142.3,18 151.7,13 162.7,13 C 173.7,13 183,6 194,6" fill="none" stroke="#047857" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="194" cy="6" r="3.5" fill="#047857" stroke="white" strokeWidth="1.5"/>
  </svg>
);

// ---- Chart.js loader ----
function useChartJs(callback) {
  useEffect(() => {
    if (window.Chart) { callback(window.Chart); return; }
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js";
    s.onload = () => callback(window.Chart);
    document.head.appendChild(s);
  }, []);
}

function ChartCanvas({ id, style }) {
  return (
    <div className="cld-cv" style={style}>
      <canvas id={id}></canvas>
    </div>
  );
}

// ---- Main Component ----
const DoctorDashboard = () => {
  const mobileDrawerRef = useRef(null);

  useChartJs((Chart) => {
    Chart.defaults.font.family = "'DM Sans', Arial, sans-serif";
    Chart.defaults.color = '#888899';
    Chart.defaults.layout = { padding: 0 };
    const hrs = ['6AM','7','8','9','10','11','12','1PM','2','3','4','5','6','7','8','9','10'];
    const d30 = Array.from({length:30},(_,i)=>''+(i+1));
    const bo = {
      responsive:true, maintainAspectRatio:false, clip:true, layout:{padding:0},
      plugins:{legend:{display:false},tooltip:{mode:'index',intersect:false}},
      scales:{
        x:{grid:{display:false},ticks:{font:{size:10},maxRotation:0}},
        y:{grid:{color:'#eef0f8'},ticks:{font:{size:10}}}
      }
    };

    const makeChart = (id, config) => {
      const el = document.getElementById(id);
      if (!el) return;
      const existing = Chart.getChart(el);
      if (existing) existing.destroy();
      new Chart(el, config);
    };

    makeChart('cld-failDayChart',{type:'bar',data:{labels:hrs,datasets:[
      {label:'Today',data:[2,3,5,7,4,6,3,4,3,2,3,2,1,2,1,0,0],backgroundColor:'rgba(231,76,60,0.85)',borderRadius:4,barPercentage:.55},
      {label:'Yesterday',data:[1,2,4,6,5,5,4,3,2,2,2,2,1,1,1,0,0],backgroundColor:'rgba(231,76,60,0.25)',borderRadius:4,barPercentage:.55}
    ]},options:bo});

    makeChart('cld-failMonthChart',{type:'line',data:{labels:d30,datasets:[
      {label:'Nov',data:[38,41,44,36,39,42,47,43,40,38,45,50,46,42,39,37,41,44,48,43,41,38,42,45,43,40,38,41,46,44],borderColor:'#e74c3c',backgroundColor:'rgba(231,76,60,0.07)',borderWidth:2,fill:true,pointRadius:0,tension:.35},
      {label:'Oct',data:[35,38,40,34,36,38,41,39,37,35,40,44,42,38,36,34,38,41,44,40,38,36,39,42,40,37,35,38,42,40],borderColor:'#f0b3ae',borderWidth:1.5,borderDash:[4,3],fill:false,pointRadius:0,tension:.35}
    ]},options:{...bo,scales:{...bo.scales,x:{...bo.scales.x,ticks:{font:{size:9},maxTicksLimit:8}}}}});

    makeChart('cld-failReasonChart',{type:'doughnut',data:{labels:['Equipment','Sample Quality','Reagent','Operator','Other'],datasets:[{data:[18,12,9,5,3],backgroundColor:['#e74c3c','#ff8c42','#7c3aed','#4a6fff','#aaa'],borderWidth:0,hoverOffset:4}]},options:{responsive:false,cutout:'68%',plugins:{legend:{display:false}}}});

    makeChart('cld-regDayChart',{type:'bar',data:{labels:hrs,datasets:[
      {label:'Today',data:[48,62,88,95,74,80,66,70,58,54,60,52,40,44,32,22,12],backgroundColor:'rgba(74,111,255,0.85)',borderRadius:4,barPercentage:.55},
      {label:'Yesterday',data:[44,55,80,88,70,72,60,65,52,50,55,48,38,40,30,20,10],backgroundColor:'rgba(74,111,255,0.25)',borderRadius:4,barPercentage:.55}
    ]},options:bo});

    makeChart('cld-regMonthChart',{type:'line',data:{labels:d30,datasets:[
      {label:'Nov',data:[980,1020,1100,960,1040,1120,1140,1080,1020,990,1060,1150,1100,1050,1010,980,1040,1120,1160,1090,1040,1000,1060,1130,1110,1060,1020,1070,1150,1124],borderColor:'#4a6fff',backgroundColor:'rgba(74,111,255,0.07)',borderWidth:2,fill:true,pointRadius:0,tension:.35},
      {label:'Oct',data:[880,920,990,860,940,1010,1030,980,920,890,960,1040,990,950,910,880,940,1010,1050,980,940,900,960,1020,1000,960,920,960,1040,1010],borderColor:'#a0b4ff',borderWidth:1.5,borderDash:[4,3],fill:false,pointRadius:0,tension:.35}
    ]},options:{...bo,scales:{...bo.scales,x:{...bo.scales.x,ticks:{font:{size:9},maxTicksLimit:8}}}}});

    makeChart('cld-regDeptChart',{type:'bar',data:{labels:['Haematology','Biochemistry','Microbiology','Serology','Immunology','Endocrine'],datasets:[{data:[342,298,184,152,98,50],backgroundColor:['#4a6fff','#00b96b','#ff8c42','#7c3aed','#e74c3c','#f59e0b'],borderRadius:6,barPercentage:.65}]},options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{color:'#eef0f8'},ticks:{font:{size:10}}},y:{grid:{display:false},ticks:{font:{size:10}}}}}});

    makeChart('cld-tatDayChart',{type:'line',data:{labels:hrs,datasets:[
      {label:'Today',data:[36,34,38,42,40,38,35,36,38,37,36,34,33,35,36,38,null],borderColor:'#7c3aed',borderWidth:2,fill:false,pointRadius:2,tension:.35,pointBackgroundColor:'#7c3aed'},
      {label:'Yesterday',data:[40,38,44,48,46,44,42,40,42,43,41,40,39,40,42,44,null],borderColor:'#c4b5fd',borderWidth:1.5,borderDash:[4,3],fill:false,pointRadius:0,tension:.35},
      {label:'Target',data:Array(17).fill(45),borderColor:'rgba(231,76,60,0.4)',borderWidth:1,borderDash:[3,3],fill:false,pointRadius:0}
    ]},options:{...bo,scales:{...bo.scales,y:{...bo.scales.y,min:25,max:55}}}});

    makeChart('cld-tatMonthChart',{type:'line',data:{labels:d30,datasets:[
      {label:'Nov',data:[39,38,42,36,40,44,47,43,40,38,36,34,36,38,40,38,37,35,36,38,37,36,35,36,38,37,36,35,36,38],borderColor:'#7c3aed',backgroundColor:'rgba(124,58,237,0.06)',borderWidth:2,fill:true,pointRadius:0,tension:.35},
      {label:'Oct',data:[42,41,45,40,43,47,50,46,43,41,40,38,40,42,43,41,40,39,40,42,41,40,39,40,42,41,40,39,40,42],borderColor:'#c4b5fd',borderWidth:1.5,borderDash:[4,3],fill:false,pointRadius:0,tension:.35}
    ]},options:{...bo,scales:{...bo.scales,x:{...bo.scales.x,ticks:{font:{size:9},maxTicksLimit:8}},y:{...bo.scales.y,min:28,max:55,ticks:{callback:v=>v+' m',font:{size:10}}}}}});

    makeChart('cld-tatCategoryChart',{type:'bar',data:{labels:['Culture & Sensitivity','Viral Load PCR','Coagulation','Thyroid (TSH)','LFT Panel','CBC','Blood Glucose'],datasets:[{data:[240,180,68,52,44,28,18],backgroundColor:(ctx)=>{const v=ctx.parsed.x;return v>45?'rgba(231,76,60,0.85)':'rgba(124,58,237,0.75)';},borderRadius:5,barPercentage:.6,categoryPercentage:.7}]},options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,layout:{padding:{top:4,right:14,bottom:4,left:4}},plugins:{legend:{display:false},tooltip:{backgroundColor:'rgba(30,41,59,0.95)',padding:8,cornerRadius:6,titleFont:{size:11},bodyFont:{size:11},displayColors:true,boxPadding:3}},scales:{x:{grid:{color:'#eef0f8'},ticks:{font:{size:10}},suggestedMax:270},y:{grid:{display:false},ticks:{font:{size:10},autoSkip:false,crossAlign:'far'}}}}});

    makeChart('cld-deptDonutChart',{type:'doughnut',data:{labels:['Haematology','Biochemistry','Microbiology','Serology'],datasets:[{data:[19,13,8,7],backgroundColor:['#e74c3c','#ff8c42','#4a6fff','#7c3aed'],borderWidth:0,hoverOffset:4}]},options:{responsive:false,cutout:'68%',plugins:{legend:{display:false}}}});
  });

  const toggleMobile = () => {
    mobileDrawerRef.current?.classList.toggle('open');
  };

  return (
    <div className="cld-root">
      <style>{css}</style>

      {/* HEADER */}
      <div className="cld-header">
        {/* <div className="cld-header-inner">
          <div className="cld-header-logo">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 2h4v2H6V2z" fill="rgba(255,255,255,0.9)"/>
              <path d="M7 4h2v6l3 5H4L7 10V4z" fill="rgba(255,255,255,0.25)" stroke="white" strokeWidth="1.4" strokeLinejoin="round"/>
              <path d="M4 15h8" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
              <circle cx="9" cy="12" r="1" fill="rgba(255,255,255,0.6)"/>
              <path d="M2 19h14" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
              <path d="M16 6l3 3M17 4l2 2" stroke="rgba(255,255,255,0.6)" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="cld-header-info">
            <div className="cld-header-title">ClinPath Diagnostics — Lab Director</div>
            <div className="cld-header-sub">📍 Sector 14, Medical Hub Complex, Phase II, Gurugram — 122001, Haryana</div>
          </div>
          <div className="cld-header-controls">
            <select className="cld-hc-select">
              <option>All Departments</option>
              <option>Haematology</option>
              <option>Biochemistry</option>
              <option>Microbiology</option>
              <option>Serology</option>
            </select>
            <select className="cld-hc-select">
              <option>Morning Shift (6AM–2PM)</option>
              <option>Evening Shift (2PM–10PM)</option>
              <option>Night Shift (10PM–6AM)</option>
            </select>
            <div className="cld-refresh-badge"><div className="cld-pulse"></div> Live · 10:45 AM</div>
            <div className="cld-header-date">📅 14 Nov 2025</div>
          </div>
          <button className="cld-ham-btn" onClick={toggleMobile} aria-label="Menu">
            <span></span><span></span><span></span>
          </button>
        </div> */}
        {/* <div className="cld-mobile-drawer" ref={mobileDrawerRef}>
          <select className="cld-hc-select" style={{flex:1,maxWidth:'none'}}>
            <option>All Departments</option><option>Haematology</option><option>Biochemistry</option><option>Microbiology</option><option>Serology</option>
          </select>
          <select className="cld-hc-select" style={{flex:1,maxWidth:'none'}}>
            <option>Morning Shift (6AM–2PM)</option><option>Evening Shift (2PM–10PM)</option><option>Night Shift (10PM–6AM)</option>
          </select>
          <div className="cld-refresh-badge"><div className="cld-pulse"></div> Live · 10:45 AM</div>
          <div style={{color:'rgba(255,255,255,.85)',fontSize:'12px'}}>📅 14 Nov 2025</div>
        </div> */}
      </div>

      <div className="cld-page">

        {/* KPI STRIP */}
        <div className="cld-sh" style={{marginTop:'20px'}}>
          <div className="cld-sh-dot" style={{background:'var(--danger)'}}></div>
          <div className="cld-sh-title">Key Metrics</div>
          <div className="cld-sh-line"></div>
        </div>
        <div className="cld-kpi-grid">

          <div className="cld-kpi red">
            <div className="cld-kpi-head">
              <div className="cld-kpi-top">
                <div className="cld-kpi-lbl">Today's Failures</div>
                <div className="cld-kpi-val">47</div>
              </div>
              <div className="cld-kpi-icon">🧪</div>
            </div>
            <div className="cld-kpi-spark"><Spark1/></div>
            <div className="cld-kpi-foot">
              <span className="cld-kpi-delta cld-ub">▲ 12% vs yesterday</span>
              <span className="cld-kpi-sub">Yesterday: 42</span>
            </div>
          </div>

          <div className="cld-kpi amber">
            <div className="cld-kpi-head">
              <div className="cld-kpi-top">
                <div className="cld-kpi-lbl">Failure Rate</div>
                <div className="cld-kpi-val">4.2%</div>
              </div>
              <div className="cld-kpi-icon">📉</div>
            </div>
            <div className="cld-kpi-spark"><Spark2/></div>
            <div className="cld-kpi-foot">
              <span className="cld-kpi-delta cld-ub">▲ 0.6% vs yesterday</span>
              <span className="cld-kpi-sub">Yesterday: 3.6%</span>
            </div>
          </div>

          <div className="cld-kpi blue">
            <div className="cld-kpi-head">
              <div className="cld-kpi-top">
                <div className="cld-kpi-lbl">Registered Today</div>
                <div className="cld-kpi-val">1,124</div>
              </div>
              <div className="cld-kpi-icon">🗂️</div>
            </div>
            <div className="cld-kpi-spark"><Spark3/></div>
            <div className="cld-kpi-foot">
              <span className="cld-kpi-delta cld-ug">▲ 8% vs yesterday</span>
              <span className="cld-kpi-sub">Yesterday: 1,040</span>
            </div>
          </div>

          <div className="cld-kpi teal">
            <div className="cld-kpi-head">
              <div className="cld-kpi-top">
                <div className="cld-kpi-lbl">MTD Registrations</div>
                <div className="cld-kpi-val">14,870</div>
              </div>
              <div className="cld-kpi-icon">📊</div>
            </div>
            <div className="cld-kpi-spark"><Spark4/></div>
            <div className="cld-kpi-foot">
              <span className="cld-kpi-delta cld-ug">▲ 11% vs last month</span>
              <span className="cld-kpi-sub">Last: 13,380</span>
            </div>
          </div>

          <div className="cld-kpi purple">
            <div className="cld-kpi-head">
              <div className="cld-kpi-top">
                <div className="cld-kpi-lbl">Avg TAT Today</div>
                <div className="cld-kpi-val">38<span style={{fontSize:'14px',fontWeight:'500'}}> min</span></div>
              </div>
              <div className="cld-kpi-icon">⏱️</div>
            </div>
            <div className="cld-kpi-spark"><Spark5/></div>
            <div className="cld-kpi-foot">
              <span className="cld-kpi-delta cld-dg">▼ 5 min vs yesterday</span>
              <span className="cld-kpi-sub">Target ≤ 45 min</span>
            </div>
          </div>

          <div className="cld-kpi green">
            <div className="cld-kpi-head">
              <div className="cld-kpi-top">
                <div className="cld-kpi-lbl">Pending in Queue</div>
                <div className="cld-kpi-val">183</div>
              </div>
              <div className="cld-kpi-icon">⏳</div>
            </div>
            <div className="cld-kpi-spark"><Spark6/></div>
            <div className="cld-kpi-foot">
              <span className="cld-kpi-delta cld-ub">▲ 24 since 10AM</span>
              <span className="cld-kpi-sub">Analysis: 94</span>
            </div>
          </div>

        </div>

        {/* PIPELINE */}
        <div className="cld-sh">
          <div className="cld-sh-dot" style={{background:'var(--primary)'}}></div>
          <div className="cld-sh-title">Live Sample Pipeline</div>
          <span className="cld-sh-badge" style={{background:'var(--primary-bg)',color:'var(--primary)'}}>Real-time</span>
          <div className="cld-sh-line"></div>
        </div>

        <div className="cld-pipe-wrap">
          <div className="cld-pipe-track-wrap">
            <div className="cld-pipe-track"><div className="cld-pipe-track-fill"></div></div>
            <div className="cld-pipeline">

              <div className="cld-pipe-stage">
                <div className="cld-pipe-node done">
                  <div className="cld-pipe-node-num">324</div>
                  <div className="cld-pipe-node-icon"><svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4L3 5.5L6.5 2" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
                </div>
                <div className="cld-pipe-lbl-wrap"><div className="cld-pipe-lbl-name">Received</div><span className="cld-pipe-lbl-tag done">✓ Done</span></div>
              </div>

              <div className="cld-pipe-arrow"><svg width="20" height="14" viewBox="0 0 20 14" fill="none"><path d="M0 7h16M11 2l5 5-5 5" stroke="#1D9E75" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg></div>

              <div className="cld-pipe-stage">
                <div className="cld-pipe-node done">
                  <div className="cld-pipe-node-num">298</div>
                  <div className="cld-pipe-node-icon"><svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4L3 5.5L6.5 2" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
                </div>
                <div className="cld-pipe-lbl-wrap"><div className="cld-pipe-lbl-name">Pre-analytical</div><span className="cld-pipe-lbl-tag done">✓ Done</span></div>
              </div>

              <div className="cld-pipe-arrow"><svg width="20" height="14" viewBox="0 0 20 14" fill="none"><path d="M0 7h16M11 2l5 5-5 5" stroke="#BA7517" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg></div>

              <div className="cld-pipe-stage">
                <div className="cld-pipe-node bottle">
                  <div className="cld-pipe-node-num">94</div>
                  <div className="cld-pipe-node-icon"><svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M4 1.5v3M4 6v.5" stroke="white" strokeWidth="1.4" strokeLinecap="round"/></svg></div>
                </div>
                <div className="cld-pipe-lbl-wrap"><div className="cld-pipe-lbl-name">Analysis</div><span className="cld-pipe-lbl-tag bottle">⚠ Bottleneck</span></div>
              </div>

              <div className="cld-pipe-arrow"><svg width="20" height="14" viewBox="0 0 20 14" fill="none"><path d="M0 7h16M11 2l5 5-5 5" stroke="#c5d2ff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg></div>

              <div className="cld-pipe-stage">
                <div className="cld-pipe-node prog">
                  <div className="cld-pipe-node-num">52</div>
                  <div className="cld-pipe-node-icon"><svg width="8" height="8" viewBox="0 0 8 8" fill="none"><circle cx="4" cy="4" r="2.5" stroke="white" strokeWidth="1.2"/></svg></div>
                </div>
                <div className="cld-pipe-lbl-wrap"><div className="cld-pipe-lbl-name">Resulted</div><span className="cld-pipe-lbl-tag prog">In Progress</span></div>
              </div>

              <div className="cld-pipe-arrow"><svg width="20" height="14" viewBox="0 0 20 14" fill="none"><path d="M0 7h16M11 2l5 5-5 5" stroke="#c5d2ff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg></div>

              <div className="cld-pipe-stage">
                <div className="cld-pipe-node prog">
                  <div className="cld-pipe-node-num">37</div>
                  <div className="cld-pipe-node-icon"><svg width="8" height="8" viewBox="0 0 8 8" fill="none"><circle cx="4" cy="4" r="2.5" stroke="white" strokeWidth="1.2"/></svg></div>
                </div>
                <div className="cld-pipe-lbl-wrap"><div className="cld-pipe-lbl-name">Verified</div><span className="cld-pipe-lbl-tag prog">In Progress</span></div>
              </div>

              <div className="cld-pipe-arrow"><svg width="20" height="14" viewBox="0 0 20 14" fill="none"><path d="M0 7h16M11 2l5 5-5 5" stroke="#1D9E75" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg></div>

              <div className="cld-pipe-stage">
                <div className="cld-pipe-node done">
                  <div className="cld-pipe-node-num">651</div>
                  <div className="cld-pipe-node-icon"><svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4L3 5.5L6.5 2" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
                </div>
                <div className="cld-pipe-lbl-wrap"><div className="cld-pipe-lbl-name">Reported</div><span className="cld-pipe-lbl-tag done">✓ Done</span></div>
              </div>

            </div>
          </div>
          <div className="cld-pipe-footer">
            <span>Total today: <strong>1,456</strong></span>
            <span className="cld-pipe-sep">·</span>
            <span>Bottleneck: <span className="cld-pipe-alert-pill"><svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M4.5 1.5v3.5M4.5 6.5v.5" stroke="#854F0B" strokeWidth="1.4" strokeLinecap="round"/></svg>Analysis — 94 samples backed up</span></span>
            <span className="cld-pipe-sep">·</span>
            <span>Avg pipeline: <strong>42 min</strong></span>
          </div>
        </div>

        {/* FAILURE ANALYSIS */}
        <div className="cld-sh">
          <div className="cld-sh-dot" style={{background:'var(--danger)'}}></div>
          <div className="cld-sh-title">Failure Analysis</div>
          <span className="cld-sh-badge" style={{background:'var(--danger-bg)',color:'#c0392b'}}>47 failures today</span>
          <div className="cld-sh-line"></div>
        </div>
        <div className="cld-g3">
          <div className="cld-cc">
            <div className="cld-ch"><div className="cld-chi"><div className="cld-ct">Today vs Yesterday</div><div className="cld-cs">Failures by hour</div></div><span className="cld-cb" style={{background:'#ffe5e5',color:'#c0392b'}}>▲ 12%</span></div>
            <div className="cld-leg"><div className="cld-li"><div className="cld-ld" style={{background:'#e74c3c'}}></div>Today</div><div className="cld-li"><div className="cld-ld" style={{background:'#f0b3ae'}}></div>Yesterday</div></div>
            <ChartCanvas id="cld-failDayChart"/>
          </div>
          <div className="cld-cc">
            <div className="cld-ch"><div className="cld-chi"><div className="cld-ct">This Month vs Last Month</div><div className="cld-cs">Daily failure count</div></div><span className="cld-cb" style={{background:'#ffe5e5',color:'#c0392b'}}>▲ 8% MoM</span></div>
            <div className="cld-leg"><div className="cld-li"><div className="cld-ll" style={{background:'#e74c3c'}}></div>Nov 2025</div><div className="cld-li"><div className="cld-ll" style={{background:'#f0b3ae'}}></div>Oct 2025</div></div>
            <ChartCanvas id="cld-failMonthChart"/>
          </div>
          <div className="cld-cc">
            <div className="cld-ch"><div className="cld-chi"><div className="cld-ct">Failure by Reason</div><div className="cld-cs">Top causes today</div></div></div>
            <div className="cld-dr">
              <canvas className="cld-dc" id="cld-failReasonChart"></canvas>
              <div className="cld-dl">
                <div className="cld-di"><div className="cld-dlab"><div className="cld-ld" style={{background:'#e74c3c'}}></div>Equipment</div><div className="cld-dv">18</div></div>
                <div className="cld-di"><div className="cld-dlab"><div className="cld-ld" style={{background:'#ff8c42'}}></div>Sample Quality</div><div className="cld-dv">12</div></div>
                <div className="cld-di"><div className="cld-dlab"><div className="cld-ld" style={{background:'#7c3aed'}}></div>Reagent</div><div className="cld-dv">9</div></div>
                <div className="cld-di"><div className="cld-dlab"><div className="cld-ld" style={{background:'#4a6fff'}}></div>Operator</div><div className="cld-dv">5</div></div>
                <div className="cld-di"><div className="cld-dlab"><div className="cld-ld" style={{background:'#888'}}></div>Other</div><div className="cld-dv">3</div></div>
              </div>
            </div>
          </div>
        </div>

        {/* REGISTRATION ANALYSIS */}
        <div className="cld-sh">
          <div className="cld-sh-dot" style={{background:'var(--primary)'}}></div>
          <div className="cld-sh-title">Registration Analysis</div>
          <span className="cld-sh-badge" style={{background:'var(--primary-bg)',color:'var(--primary)'}}>1,124 today</span>
          <div className="cld-sh-line"></div>
        </div>
        <div className="cld-g3">
          <div className="cld-cc">
            <div className="cld-ch"><div className="cld-chi"><div className="cld-ct">Today vs Yesterday</div><div className="cld-cs">Registrations by hour</div></div><span className="cld-cb" style={{background:'var(--primary-bg)',color:'var(--primary)'}}>▲ 8%</span></div>
            <div className="cld-leg"><div className="cld-li"><div className="cld-ld" style={{background:'#4a6fff'}}></div>Today</div><div className="cld-li"><div className="cld-ld" style={{background:'#a0b4ff'}}></div>Yesterday</div></div>
            <ChartCanvas id="cld-regDayChart"/>
          </div>
          <div className="cld-cc">
            <div className="cld-ch"><div className="cld-chi"><div className="cld-ct">This Month vs Last Month</div><div className="cld-cs">Daily registrations</div></div><span className="cld-cb" style={{background:'var(--success-bg)',color:'#117a37'}}>▲ 11% MoM</span></div>
            <div className="cld-leg"><div className="cld-li"><div className="cld-ll" style={{background:'#4a6fff'}}></div>Nov 2025</div><div className="cld-li"><div className="cld-ll" style={{background:'#a0b4ff'}}></div>Oct 2025</div></div>
            <ChartCanvas id="cld-regMonthChart"/>
          </div>
          <div className="cld-cc">
            <div className="cld-ch"><div className="cld-chi"><div className="cld-ct">By Department</div><div className="cld-cs">Today's count per section</div></div></div>
            <ChartCanvas id="cld-regDeptChart"/>
          </div>
        </div>

        {/* TAT ANALYSIS */}
        <div className="cld-sh">
          <div className="cld-sh-dot" style={{background:'var(--purple)'}}></div>
          <div className="cld-sh-title">Turnaround Time (TAT)</div>
          <span className="cld-sh-badge" style={{background:'var(--purple-bg)',color:'var(--purple)'}}>Target ≤ 45 min</span>
          <div className="cld-sh-line"></div>
        </div>
        <div className="cld-g3">
          <div className="cld-cc">
            <div className="cld-ch"><div className="cld-chi"><div className="cld-ct">Today vs Yesterday</div><div className="cld-cs">Avg TAT per hour (minutes)</div></div><span className="cld-cb" style={{background:'var(--success-bg)',color:'#117a37'}}>▼ 5 min better</span></div>
            <div className="cld-leg"><div className="cld-li"><div className="cld-ll" style={{background:'#7c3aed'}}></div>Today</div><div className="cld-li"><div className="cld-ll" style={{background:'#c4b5fd'}}></div>Yesterday</div><div className="cld-li"><div className="cld-ll" style={{background:'#e74c3c'}}></div>Target</div></div>
            <ChartCanvas id="cld-tatDayChart"/>
          </div>
          <div className="cld-cc">
            <div className="cld-ch"><div className="cld-chi"><div className="cld-ct">Monthly TAT Trend</div><div className="cld-cs">Daily avg vs previous month</div></div><span className="cld-cb" style={{background:'var(--success-bg)',color:'#117a37'}}>▼ 3 min MoM</span></div>
            <div className="cld-leg"><div className="cld-li"><div className="cld-ll" style={{background:'#7c3aed'}}></div>Nov 2025</div><div className="cld-li"><div className="cld-ll" style={{background:'#c4b5fd'}}></div>Oct 2025</div></div>
            <ChartCanvas id="cld-tatMonthChart"/>
          </div>
          <div className="cld-cc">
            <div className="cld-ch"><div className="cld-chi"><div className="cld-ct">TAT by Test Category</div><div className="cld-cs">Avg time per test today</div></div></div>
            <ChartCanvas id="cld-tatCategoryChart" style={{height:'240px', overflow:'visible'}}/>
          </div>
        </div>

        {/* DETAIL PANELS */}
        <div className="cld-sh">
          <div className="cld-sh-dot" style={{background:'var(--warning)'}}></div>
          <div className="cld-sh-title">Detail Panels</div>
          <div className="cld-sh-line"></div>
        </div>
        <div className="cld-g4">

          <div className="cld-cc">
            <div className="cld-ch"><div className="cld-chi"><div className="cld-ct">Top Failed Tests</div><div className="cld-cs">Ranked by count today</div></div></div>
            <div className="cld-rl">
              <div className="cld-ri"><div className="cld-rt"><div className="cld-rn">CBC – Blood Count</div><div className="cld-rc">14</div></div><div className="cld-rb"><div className="cld-rbi" style={{width:'100%',background:'var(--danger)'}}></div></div></div>
              <div className="cld-ri"><div className="cld-rt"><div className="cld-rn">LFT – Liver Function</div><div className="cld-rc">11</div></div><div className="cld-rb"><div className="cld-rbi" style={{width:'78%',background:'var(--warning)'}}></div></div></div>
              <div className="cld-ri"><div className="cld-rt"><div className="cld-rn">Blood Glucose</div><div className="cld-rc">8</div></div><div className="cld-rb"><div className="cld-rbi" style={{width:'57%',background:'#f59e0b'}}></div></div></div>
              <div className="cld-ri"><div className="cld-rt"><div className="cld-rn">Thyroid (TSH)</div><div className="cld-rc">6</div></div><div className="cld-rb"><div className="cld-rbi" style={{width:'43%',background:'var(--purple)'}}></div></div></div>
              <div className="cld-ri"><div className="cld-rt"><div className="cld-rn">Urine RE</div><div className="cld-rc">5</div></div><div className="cld-rb"><div className="cld-rbi" style={{width:'36%',background:'var(--primary)'}}></div></div></div>
              <div className="cld-ri"><div className="cld-rt"><div className="cld-rn">Dengue NS1</div><div className="cld-rc">3</div></div><div className="cld-rb"><div className="cld-rbi" style={{width:'21%',background:'var(--success)'}}></div></div></div>
            </div>
          </div>

          <div className="cld-cc">
            <div className="cld-ch"><div className="cld-chi"><div className="cld-ct">Dept. Breakdown</div><div className="cld-cs">Failures per department</div></div></div>
            <div className="cld-dr">
              <canvas className="cld-dc" id="cld-deptDonutChart"></canvas>
              <div className="cld-dl">
                <div className="cld-di"><div className="cld-dlab"><div className="cld-ld" style={{background:'#e74c3c'}}></div>Haematology</div><div className="cld-dv">19</div></div>
                <div className="cld-di"><div className="cld-dlab"><div className="cld-ld" style={{background:'#ff8c42'}}></div>Biochemistry</div><div className="cld-dv">13</div></div>
                <div className="cld-di"><div className="cld-dlab"><div className="cld-ld" style={{background:'#4a6fff'}}></div>Microbiology</div><div className="cld-dv">8</div></div>
                <div className="cld-di"><div className="cld-dlab"><div className="cld-ld" style={{background:'#7c3aed'}}></div>Serology</div><div className="cld-dv">7</div></div>
              </div>
            </div>
            <div style={{borderTop:'1px solid var(--border)',paddingTop:'8px'}}>
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:'11px'}}>
                <tbody>
                  <tr><td style={{padding:'4px 6px',color:'var(--muted)'}}>Haematology</td><td style={{padding:'4px 6px',fontWeight:'700',color:'var(--dark)'}}>19</td><td><span style={{background:'#ffe5e5',color:'#c0392b',fontSize:'10px',fontWeight:'700',padding:'1px 7px',borderRadius:'20px'}}>40%</span></td></tr>
                  <tr><td style={{padding:'4px 6px',color:'var(--muted)'}}>Biochemistry</td><td style={{padding:'4px 6px',fontWeight:'700',color:'var(--dark)'}}>13</td><td><span style={{background:'#fff0e0',color:'#b85c00',fontSize:'10px',fontWeight:'700',padding:'1px 7px',borderRadius:'20px'}}>28%</span></td></tr>
                  <tr><td style={{padding:'4px 6px',color:'var(--muted)'}}>Microbiology</td><td style={{padding:'4px 6px',fontWeight:'700',color:'var(--dark)'}}>8</td><td><span style={{background:'#e5ebff',color:'var(--primary)',fontSize:'10px',fontWeight:'700',padding:'1px 7px',borderRadius:'20px'}}>17%</span></td></tr>
                  <tr><td style={{padding:'4px 6px',color:'var(--muted)'}}>Serology</td><td style={{padding:'4px 6px',fontWeight:'700',color:'var(--dark)'}}>7</td><td><span style={{background:'var(--purple-bg)',color:'var(--purple)',fontSize:'10px',fontWeight:'700',padding:'1px 7px',borderRadius:'20px'}}>15%</span></td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="cld-cc">
            <div className="cld-ch"><div className="cld-chi"><div className="cld-ct">Sample Rejection Rate</div><div className="cld-cs">Pre-analytical rejects</div></div><span className="cld-cb" style={{background:'#fff0e0',color:'#b85c00'}}>2.8%</span></div>
            <div style={{display:'flex',gap:'14px'}}>
              <div style={{textAlign:'center',flex:1}}><div style={{fontSize:'20px',fontWeight:'700',color:'var(--warning)',fontFamily:"'DM Mono',monospace"}}>31</div><div style={{fontSize:'10px',color:'var(--muted)',marginTop:'2px'}}>Total rejects</div></div>
              <div style={{textAlign:'center',flex:1}}><div style={{fontSize:'20px',fontWeight:'700',color:'var(--success)',fontFamily:"'DM Mono',monospace"}}>28</div><div style={{fontSize:'10px',color:'var(--muted)',marginTop:'2px'}}>Yesterday</div></div>
            </div>
            <div className="cld-rl" style={{gap:'6px'}}>
              <div className="cld-ri"><div className="cld-rt"><div className="cld-rn" style={{fontSize:'11px'}}>Haemolysis</div><div className="cld-rc" style={{fontSize:'11px'}}>12</div></div><div className="cld-rb"><div className="cld-rbi" style={{width:'100%',background:'#e74c3c',opacity:.8}}></div></div></div>
              <div className="cld-ri"><div className="cld-rt"><div className="cld-rn" style={{fontSize:'11px'}}>Clotted sample</div><div className="cld-rc" style={{fontSize:'11px'}}>8</div></div><div className="cld-rb"><div className="cld-rbi" style={{width:'67%',background:'#ff8c42',opacity:.8}}></div></div></div>
              <div className="cld-ri"><div className="cld-rt"><div className="cld-rn" style={{fontSize:'11px'}}>Insufficient vol.</div><div className="cld-rc" style={{fontSize:'11px'}}>6</div></div><div className="cld-rb"><div className="cld-rbi" style={{width:'50%',background:'#f59e0b',opacity:.8}}></div></div></div>
              <div className="cld-ri"><div className="cld-rt"><div className="cld-rn" style={{fontSize:'11px'}}>Wrong container</div><div className="cld-rc" style={{fontSize:'11px'}}>3</div></div><div className="cld-rb"><div className="cld-rbi" style={{width:'25%',background:'var(--primary)',opacity:.8}}></div></div></div>
              <div className="cld-ri"><div className="cld-rt"><div className="cld-rn" style={{fontSize:'11px'}}>Lipemia</div><div className="cld-rc" style={{fontSize:'11px'}}>2</div></div><div className="cld-rb"><div className="cld-rbi" style={{width:'17%',background:'var(--purple)',opacity:.8}}></div></div></div>
            </div>
            <div style={{fontSize:'11px',color:'var(--muted)'}}>7-day trend:
              <div className="cld-sk">
                <div className="cld-sb2" style={{height:'60%',background:'var(--success)',opacity:.7}}></div>
                <div className="cld-sb2" style={{height:'45%',background:'var(--success)',opacity:.7}}></div>
                <div className="cld-sb2" style={{height:'80%',background:'var(--warning)',opacity:.7}}></div>
                <div className="cld-sb2" style={{height:'55%',background:'var(--success)',opacity:.7}}></div>
                <div className="cld-sb2" style={{height:'70%',background:'var(--warning)',opacity:.7}}></div>
                <div className="cld-sb2" style={{height:'90%',background:'var(--warning)',opacity:.8}}></div>
                <div className="cld-sb2" style={{height:'100%',background:'var(--danger)',opacity:.8}}></div>
              </div>
            </div>
          </div>

          <div className="cld-cc">
            <div className="cld-ch"><div className="cld-chi"><div className="cld-ct">Instrument Status</div><div className="cld-cs">All analyzers — live</div></div><span className="cld-cb" style={{background:'var(--warning-bg)',color:'#b85c00'}}>1 Offline · 1 QC Fail</span></div>
            <div className="cld-il">
              <div className="cld-ir"><div className="cld-id on"></div><div><div className="cld-in_">Sysmex XN-1000</div><div className="cld-im">Haematology · QC: 09:00 AM</div></div><span className="cld-ib on">Online</span></div>
              <div className="cld-ir"><div className="cld-id qc"></div><div><div className="cld-in_">Cobas c501</div><div className="cld-im">Biochemistry · QC: 08:30 AM ⚠</div></div><span className="cld-ib qc">QC Fail</span></div>
              <div className="cld-ir"><div className="cld-id on"></div><div><div className="cld-in_">Architect i2000</div><div className="cld-im">Serology · QC: 09:15 AM</div></div><span className="cld-ib on">Online</span></div>
              <div className="cld-ir"><div className="cld-id off"></div><div><div className="cld-in_">BacT/ALERT 3D</div><div className="cld-im">Microbiology · Maint. overdue 3 days</div></div><span className="cld-ib off">Offline</span></div>
              <div className="cld-ir"><div className="cld-id on"></div><div><div className="cld-in_">Atellica VTLi</div><div className="cld-im">Immunology · QC: 10:00 AM</div></div><span className="cld-ib on">Online</span></div>
              <div className="cld-ir"><div className="cld-id on"></div><div><div className="cld-in_">iChroma II</div><div className="cld-im">POC · QC: 09:45 AM</div></div><span className="cld-ib on">Online</span></div>
            </div>
          </div>

        </div>

        {/* ALERTS & CRITICAL VALUES */}
        <div className="cld-sh">
          <div className="cld-sh-dot" style={{background:'var(--danger)'}}></div>
          <div className="cld-sh-title">Alerts &amp; Critical Values</div>
          <span className="cld-sh-badge" style={{background:'var(--danger-bg)',color:'#c0392b'}}>3 Active</span>
          <div className="cld-sh-line"></div>
        </div>
        <div className="cld-g2">

          <div className="cld-cc">
            <div className="cld-ch"><div className="cld-chi"><div className="cld-ct">Smart Alerts &amp; Flags</div><div className="cld-cs">Auto-generated · severity ranked</div></div></div>
            <div className="cld-al">
              <div className="cld-ar high"><div className="cld-ai">🔴</div><div className="cld-ab"><div className="cld-at2">Failure rate exceeded — Haematology</div><div className="cld-ad">Current: 6.2% | Threshold: 5.0% | Cobas c501 QC failure likely contributing</div></div><div><span className="cld-sb high">High</span><div className="cld-atime" style={{marginTop:'4px'}}>10:22 AM</div></div></div>
              <div className="cld-ar high"><div className="cld-ai">🔴</div><div className="cld-ab"><div className="cld-at2">Instrument offline — BacT/ALERT 3D</div><div className="cld-ad">Microbiology analyzer down since 09:40 AM. Maintenance overdue by 3 days.</div></div><div><span className="cld-sb high">High</span><div className="cld-atime" style={{marginTop:'4px'}}>09:40 AM</div></div></div>
              <div className="cld-ar med"><div className="cld-ai">🟡</div><div className="cld-ab"><div className="cld-at2">Pipeline bottleneck — Analysis stage</div><div className="cld-ad">94 samples backed up. Avg wait increased to 18 min.</div></div><div><span className="cld-sb med">Medium</span><div className="cld-atime" style={{marginTop:'4px'}}>10:05 AM</div></div></div>
              <div className="cld-ar med"><div className="cld-ai">🟡</div><div className="cld-ab"><div className="cld-at2">Rejection spike — Haemolysis</div><div className="cld-ad">12 haemolysed samples. Likely phlebotomy issue at Collection Centre 3.</div></div><div><span className="cld-sb med">Medium</span><div className="cld-atime" style={{marginTop:'4px'}}>09:15 AM</div></div></div>
              <div className="cld-ar low"><div className="cld-ai">🟢</div><div className="cld-ab"><div className="cld-at2">TAT improved — Biochemistry section</div><div className="cld-ad">Avg TAT down to 32 min from 41 min. New batch protocol effective.</div></div><div><span className="cld-sb low">Info</span><div className="cld-atime" style={{marginTop:'4px'}}>08:50 AM</div></div></div>
            </div>
          </div>

          <div className="cld-cc">
            <div className="cld-ch"><div className="cld-chi"><div className="cld-ct">Critical Value Log</div><div className="cld-cs">Panic values reported today</div></div><span className="cld-cb" style={{background:'#fff0e0',color:'#b85c00'}}>2 Pending</span></div>
            <div style={{overflowX:'auto'}}>
              <table className="cld-cvt" style={{minWidth:'440px'}}>
                <thead><tr><th>Test</th><th>Patient</th><th>Value</th><th>Ref. Range</th><th>Time</th><th>Status</th></tr></thead>
                <tbody>
                  <tr><td style={{fontWeight:'600',color:'var(--dark)'}}>WBC Count</td><td style={{color:'var(--muted)'}}>PT-9921</td><td><span className="cld-cvval">28,400</span></td><td style={{fontSize:'11px',color:'var(--muted)'}}>4500–11000</td><td style={{fontSize:'11px'}}>08:42 AM</td><td><span className="cld-ack-y">✓ ACK</span></td></tr>
                  <tr><td style={{fontWeight:'600',color:'var(--dark)'}}>Blood Glucose</td><td style={{color:'var(--muted)'}}>PT-9944</td><td><span className="cld-cvval">482 mg/dL</span></td><td style={{fontSize:'11px',color:'var(--muted)'}}>&lt;500 panic</td><td style={{fontSize:'11px'}}>09:18 AM</td><td><span className="cld-ack-y">✓ ACK</span></td></tr>
                  <tr><td style={{fontWeight:'600',color:'var(--dark)'}}>Serum Potassium</td><td style={{color:'var(--muted)'}}>PT-0012</td><td><span className="cld-cvval">6.8 mEq/L</span></td><td style={{fontSize:'11px',color:'var(--muted)'}}>3.5–5.0</td><td style={{fontSize:'11px'}}>09:55 AM</td><td><span className="cld-ack-n">⏳ Pending</span></td></tr>
                  <tr><td style={{fontWeight:'600',color:'var(--dark)'}}>Haemoglobin</td><td style={{color:'var(--muted)'}}>PT-0087</td><td><span className="cld-cvval">5.2 g/dL</span></td><td style={{fontSize:'11px',color:'var(--muted)'}}>&lt;7 critical</td><td style={{fontSize:'11px'}}>10:11 AM</td><td><span className="cld-ack-n">⏳ Pending</span></td></tr>
                  <tr><td style={{fontWeight:'600',color:'var(--dark)'}}>SGPT (ALT)</td><td style={{color:'var(--muted)'}}>PT-0103</td><td><span className="cld-cvval">312 U/L</span></td><td style={{fontSize:'11px',color:'var(--muted)'}}>7–56 U/L</td><td style={{fontSize:'11px'}}>10:33 AM</td><td><span className="cld-ack-y">✓ ACK</span></td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="cld-footer">
          <strong>ClinPath Diagnostics — Lab Director Dashboard</strong><br/>
          <span>Generated: 14 Nov 2025, 10:45 AM &nbsp;|&nbsp; Auto-refreshes every 60 seconds &nbsp;|&nbsp; lab@clinpath.in</span>
        </div>

      </div>
    </div>
  );
};

export default DoctorDashboard;