import React, { useRef, useEffect } from 'react';

// The full original DRetinoDx app (HTML + CSS + vanilla JS) is preserved
// byte-for-byte and rendered inside a sandboxed iframe. This "wraps" the
// existing self-contained app as a single, drop-in React component
// (<DRetinoDxApp />) without altering any of its internal behavior.
const DRETINODX_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>DRetinoDx — Explainable AI Retinal Screening</title>
<style>
/* ============================================================
   DESIGN TOKENS
   ============================================================ */
:root{
  --white:#ffffff;
  --surface:#F6F9FA;
  --surface-2:#EDF3F4;
  --border:#DFE7EA;
  --border-soft:#EAF0F2;
  --ink:#0F1E24;
  --ink-soft:#4D6169;
  --ink-mute:#8598A0;

  --blue:#1C6FB0;
  --blue-deep:#0E4E80;
  --blue-tint:#EAF3FB;
  --teal:#0B9C97;
  --teal-tint:#E4F6F5;
  --green:#1C9A64;
  --green-tint:#E7F7EF;
  --purple:#7B6BE0;
  --purple-tint:#EFECFC;
  --amber:#C6821C;
  --amber-tint:#FBF1DF;
  --red:#C6483F;
  --red-tint:#FBEAE8;

  --radius-sm:8px;
  --radius-md:14px;
  --radius-lg:22px;
  --shadow-1: 0 1px 2px rgba(15,30,36,0.06);
  --shadow-2: 0 10px 30px -12px rgba(15,30,36,0.18);

  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", "Inter", Roboto, Helvetica, Arial, sans-serif;
  --font-mono: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;

  --sidebar-w: 248px;
}

*{box-sizing:border-box;}
html,body{height:100%;}
body{
  margin:0;
  font-family:var(--font-sans);
  color:var(--ink);
  background:var(--surface);
  -webkit-font-smoothing:antialiased;
  font-size:14.5px;
  line-height:1.5;
}
h1,h2,h3,h4,p,ul,ol{margin:0;}
button{font-family:inherit;}
img{max-width:100%;display:block;}
a{color:inherit;}
::selection{background:var(--teal-tint);}

:focus-visible{
  outline:2px solid var(--blue);
  outline-offset:2px;
  border-radius:4px;
}

@media (prefers-reduced-motion: reduce){
  *{animation-duration:0.001ms !important; transition-duration:0.001ms !important;}
}

/* ============================================================
   APP SHELL
   ============================================================ */
#app{
  display:flex;
  min-height:100vh;
}

/* ---- Sidebar ---- */
.sidebar{
  width:var(--sidebar-w);
  flex-shrink:0;
  background:var(--white);
  border-right:1px solid var(--border);
  display:flex;
  flex-direction:column;
  position:fixed;
  top:0; bottom:0; left:0;
  z-index:40;
  transition:transform .25s ease;
}
.sidebar-brand{
  display:flex;
  align-items:center;
  gap:10px;
  padding:22px 20px 18px;
  border-bottom:1px solid var(--border-soft);
}
.brand-mark{
  width:36px;height:36px;border-radius:10px;
  background:linear-gradient(155deg, var(--blue) 0%, var(--teal) 100%);
  display:flex;align-items:center;justify-content:center;flex-shrink:0;
}
.brand-name{font-size:17px;font-weight:800;letter-spacing:-0.02em;color:var(--ink);}
.brand-tag{font-size:10.5px;color:var(--ink-mute);margin-top:1px;}

.sidebar-nav{flex:1;overflow-y:auto;padding:14px 12px;}
.nav-section-label{
  font-size:10.5px;color:var(--ink-mute);font-weight:700;
  padding:12px 10px 6px;letter-spacing:0.02em;
}
.nav-item{
  display:flex;align-items:center;gap:11px;
  padding:9px 12px;border-radius:10px;
  color:var(--ink-soft);font-size:13.6px;font-weight:600;
  cursor:pointer;margin-bottom:2px;border:1px solid transparent;
  transition:background .15s, color .15s;
  position:relative;
}
.nav-item:hover{background:var(--surface-2);color:var(--ink);}
.nav-item.active{background:var(--blue-tint);color:var(--blue-deep);}
.nav-item .nav-ic{width:18px;height:18px;flex-shrink:0;opacity:0.85;}
.nav-item.active .nav-ic{opacity:1;}
.nav-badge{
  margin-left:auto;font-size:10.5px;font-weight:700;
  background:var(--red);color:#fff;border-radius:20px;
  padding:1px 7px;
}

.sidebar-foot{
  padding:16px 20px;border-top:1px solid var(--border-soft);
}
.sidebar-foot .sf-line1{font-size:12px;font-weight:700;color:var(--ink);}
.sidebar-foot .sf-line2{font-size:11px;color:var(--ink-mute);font-family:var(--font-mono);margin-top:2px;}

.sidebar-collapse-btn{display:none;}

/* ---- Main column ---- */
.main-col{
  margin-left:var(--sidebar-w);
  flex:1;
  min-width:0;
  display:flex;
  flex-direction:column;
}

/* ---- Topbar ---- */
.topbar{
  height:64px;
  background:var(--white);
  border-bottom:1px solid var(--border);
  display:flex;align-items:center;
  padding:0 26px;gap:16px;
  position:sticky;top:0;z-index:30;
}
.topbar-menu-btn{display:none;}
.topbar-title{font-size:15px;font-weight:700;}
.topbar-spacer{flex:1;}
.conn-pill{
  display:flex;align-items:center;gap:6px;
  font-size:12px;font-weight:700;
  padding:6px 11px;border-radius:20px;
  background:var(--green-tint);color:var(--green);
}
.conn-pill.offline{background:var(--red-tint);color:var(--red);}
.conn-dot{width:7px;height:7px;border-radius:50%;background:currentColor;}
.conn-dot.pulse{animation:pulseDot 1.8s infinite;}
@keyframes pulseDot{0%,100%{opacity:1;}50%{opacity:0.35;}}

.demo-badge{
  font-size:11px;font-weight:700;color:var(--purple);
  background:var(--purple-tint);border-radius:20px;padding:5px 10px;
  border:1px solid #E1DBFA;
}
.icon-btn{
  width:36px;height:36px;border-radius:10px;
  display:flex;align-items:center;justify-content:center;
  background:transparent;border:1px solid transparent;cursor:pointer;
  color:var(--ink-soft);position:relative;
}
.icon-btn:hover{background:var(--surface-2);border-color:var(--border);}
.icon-btn svg{width:19px;height:19px;}
.notif-dot{
  position:absolute;top:6px;right:7px;width:7px;height:7px;border-radius:50%;
  background:var(--red);border:2px solid var(--white);
}
.topbar-user{display:flex;align-items:center;gap:10px;padding-left:10px;border-left:1px solid var(--border);cursor:pointer;}
.avatar{
  width:34px;height:34px;border-radius:50%;
  background:linear-gradient(155deg, var(--teal), var(--blue));
  color:#fff;display:flex;align-items:center;justify-content:center;
  font-weight:700;font-size:13px;flex-shrink:0;
}
.tu-name{font-size:13px;font-weight:700;line-height:1.2;}
.tu-role{font-size:11px;color:var(--ink-mute);}

/* ---- Content ---- */
.content{
  padding:26px 30px 60px;
  max-width:1360px;
  width:100%;
}

/* ============================================================
   UTILITY / COMPONENTS
   ============================================================ */
.page-head{margin-bottom:22px;}
.page-head h1{font-size:23px;font-weight:800;letter-spacing:-0.01em;}
.page-head p{color:var(--ink-soft);margin-top:5px;font-size:13.6px;max-width:640px;}

.btn{
  display:inline-flex;align-items:center;justify-content:center;gap:7px;
  font-size:13.4px;font-weight:700;
  padding:10px 17px;border-radius:10px;
  border:1px solid transparent;cursor:pointer;
  transition:transform .08s ease, box-shadow .15s, background .15s;
  white-space:nowrap;
}
.btn:active{transform:translateY(1px);}
.btn svg{width:15px;height:15px;}
.btn-primary{background:var(--blue);color:#fff;box-shadow:0 4px 12px -4px rgba(28,111,176,0.55);}
.btn-primary:hover{background:var(--blue-deep);}
.btn-teal{background:var(--teal);color:#fff;box-shadow:0 4px 12px -4px rgba(11,156,151,0.5);}
.btn-teal:hover{background:#088782;}
.btn-outline{background:var(--white);color:var(--ink);border-color:var(--border);}
.btn-outline:hover{background:var(--surface-2);}
.btn-ghost{background:transparent;color:var(--ink-soft);}
.btn-ghost:hover{background:var(--surface-2);}
.btn-danger{background:var(--red);color:#fff;}
.btn-danger:hover{background:#a83a32;}
.btn-sm{padding:7px 12px;font-size:12.4px;border-radius:8px;}
.btn-block{width:100%;}
.btn:disabled{opacity:0.45;cursor:not-allowed;}

.card{
  background:var(--white);
  border:1px solid var(--border);
  border-radius:var(--radius-md);
  box-shadow:var(--shadow-1);
}
.card-pad{padding:20px;}
.card-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;gap:10px;}
.card-head h3{font-size:14.5px;font-weight:800;}
.card-head .ch-sub{font-size:12px;color:var(--ink-mute);margin-top:2px;font-weight:500;}

.grid{display:grid;gap:18px;}
.grid-4{grid-template-columns:repeat(4,1fr);}
.grid-3{grid-template-columns:repeat(3,1fr);}
.grid-2{grid-template-columns:repeat(2,1fr);}
@media (max-width:1180px){.grid-4{grid-template-columns:repeat(2,1fr);} .grid-3{grid-template-columns:repeat(2,1fr);}}
@media (max-width:640px){.grid-4,.grid-3,.grid-2{grid-template-columns:1fr;}}

.stat-card{
  background:var(--white);border:1px solid var(--border);border-radius:var(--radius-md);
  padding:18px 20px;box-shadow:var(--shadow-1);position:relative;overflow:hidden;
}
.stat-card .sc-top{display:flex;align-items:center;justify-content:space-between;}
.stat-card .sc-icon{
  width:34px;height:34px;border-radius:9px;display:flex;align-items:center;justify-content:center;
}
.stat-card .sc-icon svg{width:17px;height:17px;}
.stat-card .sc-val{font-size:26px;font-weight:800;margin-top:14px;letter-spacing:-0.02em;}
.stat-card .sc-label{font-size:12.4px;color:var(--ink-soft);margin-top:2px;font-weight:600;}
.sc-trend{font-size:11.5px;font-weight:700;margin-top:8px;display:flex;align-items:center;gap:4px;}
.sc-trend.up{color:var(--green);}
.sc-trend.down{color:var(--red);}
.sc-trend.flat{color:var(--ink-mute);}

.tag{
  display:inline-flex;align-items:center;gap:5px;
  font-size:11.5px;font-weight:700;padding:4px 9px;border-radius:20px;
  white-space:nowrap;
}
.tag-0{background:var(--surface-2);color:var(--ink-soft);}
.tag-1{background:var(--green-tint);color:var(--green);}
.tag-2{background:var(--amber-tint);color:var(--amber);}
.tag-3{background:#FBE3DE;color:#C1512B;}
.tag-4{background:var(--red-tint);color:var(--red);}
.tag-blue{background:var(--blue-tint);color:var(--blue-deep);}
.tag-purple{background:var(--purple-tint);color:var(--purple);}
.tag-teal{background:var(--teal-tint);color:var(--teal);}

.table-wrap{overflow-x:auto;}
table.dtable{width:100%;border-collapse:collapse;font-size:13.2px;min-width:760px;}
table.dtable th{
  text-align:left;font-size:11px;text-transform:none;color:var(--ink-mute);
  font-weight:700;padding:0 14px 10px;border-bottom:1px solid var(--border);
  letter-spacing:0.01em;
}
table.dtable td{padding:13px 14px;border-bottom:1px solid var(--border-soft);vertical-align:middle;}
table.dtable tr:last-child td{border-bottom:none;}
table.dtable tbody tr{transition:background .12s;cursor:pointer;}
table.dtable tbody tr:hover{background:var(--surface);}
.cell-strong{font-weight:700;}
.cell-mute{color:var(--ink-mute);font-size:12.3px;}
.pid{font-family:var(--font-mono);font-size:12px;color:var(--ink-soft);}

.mini-avatar{
  width:30px;height:30px;border-radius:50%;flex-shrink:0;
  background:var(--surface-2);color:var(--ink-soft);
  display:flex;align-items:center;justify-content:center;font-weight:700;font-size:11.5px;
}
.name-cell{display:flex;align-items:center;gap:10px;}

.progress-track{height:7px;border-radius:20px;background:var(--surface-2);overflow:hidden;}
.progress-fill{height:100%;border-radius:20px;transition:width .5s ease;}

.divider{height:1px;background:var(--border-soft);margin:16px 0;}

.empty-state{
  text-align:center;padding:56px 20px;color:var(--ink-mute);
}
.empty-state svg{width:44px;height:44px;margin:0 auto 12px;opacity:0.5;}
.empty-state .es-title{font-weight:700;color:var(--ink);font-size:14.5px;margin-bottom:4px;}

.disclaimer{
  font-size:11.8px;color:var(--ink-mute);
  background:var(--surface);border:1px dashed var(--border);
  border-radius:10px;padding:10px 13px;line-height:1.5;
}

/* ---- Form elements ---- */
.field{margin-bottom:16px;}
.field label{display:block;font-size:12.5px;font-weight:700;margin-bottom:6px;color:var(--ink);}
.field .hint{font-size:11.3px;color:var(--ink-mute);margin-top:5px;}
.input, select.input, textarea.input{
  width:100%;padding:10px 12px;border-radius:10px;border:1px solid var(--border);
  font-size:13.6px;background:var(--white);color:var(--ink);font-family:inherit;
  transition:border-color .15s, box-shadow .15s;
}
.input:focus{outline:none;border-color:var(--blue);box-shadow:0 0 0 3px var(--blue-tint);}
.input.err{border-color:var(--red);}
.err-msg{font-size:11.5px;color:var(--red);margin-top:5px;font-weight:600;}
.field-row{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
@media (max-width:640px){.field-row{grid-template-columns:1fr;}}

.chip-select{display:flex;gap:8px;flex-wrap:wrap;}
.chip-opt{
  padding:8px 14px;border-radius:20px;border:1px solid var(--border);
  font-size:12.8px;font-weight:700;cursor:pointer;background:var(--white);color:var(--ink-soft);
}
.chip-opt.selected{background:var(--blue);border-color:var(--blue);color:#fff;}

.checkbox-row{display:flex;align-items:flex-start;gap:10px;padding:12px;background:var(--surface);border-radius:10px;border:1px solid var(--border);}
.checkbox-row input{margin-top:2px;width:16px;height:16px;accent-color:var(--blue);flex-shrink:0;}
.checkbox-row span{font-size:12.8px;color:var(--ink-soft);}

/* ============================================================
   WIZARD
   ============================================================ */
.wizard-shell{background:var(--white);border:1px solid var(--border);border-radius:var(--radius-lg);box-shadow:var(--shadow-1);overflow:hidden;}
.wizard-steps{
  display:flex;overflow-x:auto;border-bottom:1px solid var(--border);
  background:var(--surface);padding:0 8px;
}
.wstep{
  display:flex;align-items:center;gap:8px;padding:16px 14px;white-space:nowrap;
  border-bottom:2px solid transparent;cursor:default;flex-shrink:0;
}
.wstep .wnum{
  width:22px;height:22px;border-radius:50%;background:var(--white);border:1.5px solid var(--border);
  display:flex;align-items:center;justify-content:center;font-size:10.5px;font-weight:800;color:var(--ink-mute);
  flex-shrink:0;
}
.wstep .wlabel{font-size:12.3px;font-weight:700;color:var(--ink-mute);}
.wstep.done .wnum{background:var(--green);border-color:var(--green);color:#fff;}
.wstep.done .wlabel{color:var(--ink-soft);}
.wstep.current{border-bottom-color:var(--blue);}
.wstep.current .wnum{background:var(--blue);border-color:var(--blue);color:#fff;}
.wstep.current .wlabel{color:var(--blue-deep);}
.wstep.clickable{cursor:pointer;}

.wizard-body{padding:26px 28px;}
.wizard-foot{
  display:flex;align-items:center;justify-content:space-between;
  padding:16px 28px;border-top:1px solid var(--border-soft);background:var(--surface);
}
.step-heading{margin-bottom:20px;}
.step-heading h2{font-size:17px;font-weight:800;}
.step-heading p{color:var(--ink-soft);font-size:13px;margin-top:4px;}

/* Upload cards */
.upload-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px;}
@media (max-width:760px){.upload-grid{grid-template-columns:1fr;}}
.upload-card{
  border:1.5px dashed var(--border);border-radius:var(--radius-md);
  padding:18px;text-align:center;background:var(--surface);position:relative;
  transition:border-color .15s, background .15s;
}
.upload-card.has-image{border-style:solid;background:var(--white);text-align:left;padding:0;overflow:hidden;}
.upload-card .uc-eyelabel{font-size:12.4px;font-weight:800;color:var(--ink-soft);margin-bottom:10px;letter-spacing:0.02em;}
.uc-dropzone{padding:28px 12px;cursor:pointer;border-radius:10px;}
.uc-dropzone:hover{background:var(--surface-2);}
.uc-dropzone svg{width:30px;height:30px;color:var(--ink-mute);margin:0 auto 10px;}
.uc-dropzone .uc-main{font-size:12.8px;font-weight:700;color:var(--ink);}
.uc-dropzone .uc-sub{font-size:11.5px;color:var(--ink-mute);margin-top:3px;}
.uc-imgwrap{position:relative;background:#0B1720;aspect-ratio:1/1;display:flex;align-items:center;justify-content:center;}
.uc-imgwrap svg{width:100%;height:100%;}
.uc-imgtag{
  position:absolute;top:10px;left:10px;background:rgba(255,255,255,0.92);
  font-size:10px;font-weight:800;padding:3px 8px;border-radius:6px;color:var(--ink-soft);letter-spacing:0.03em;
}
.uc-meta{padding:12px 14px;font-size:11.8px;color:var(--ink-soft);display:grid;grid-template-columns:1fr 1fr;gap:6px 12px;border-top:1px solid var(--border-soft);}
.uc-meta b{color:var(--ink);}
.uc-actions{display:flex;gap:8px;padding:0 14px 14px;}

/* Quality meters */
.qscore-hero{display:flex;align-items:center;gap:22px;padding:20px;background:var(--surface);border-radius:var(--radius-md);margin-bottom:20px;flex-wrap:wrap;}
.ring{position:relative;width:104px;height:104px;flex-shrink:0;}
.ring svg{transform:rotate(-90deg);}
.ring-val{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;}
.ring-val b{font-size:21px;font-weight:800;}
.ring-val span{font-size:9.5px;color:var(--ink-mute);font-weight:700;}
.qmetric{margin-bottom:13px;}
.qmetric:last-child{margin-bottom:0;}
.qmetric-top{display:flex;justify-content:space-between;font-size:12.6px;margin-bottom:6px;}
.qmetric-top b{font-weight:700;}

/* Enhancement compare */
.compare-wrap{display:grid;grid-template-columns:1fr 1fr;gap:18px;}
@media (max-width:760px){.compare-wrap{grid-template-columns:1fr;}}
.compare-pane{border-radius:var(--radius-md);overflow:hidden;border:1px solid var(--border);}
.compare-pane .cp-label{padding:10px 14px;font-size:12.3px;font-weight:800;background:var(--surface);border-bottom:1px solid var(--border);}
.compare-pane .cp-img{aspect-ratio:1/1;background:#0B1720;}

/* AI processing */
.ai-processing{display:flex;flex-direction:column;align-items:center;padding:10px 0 4px;}
.scan-frame{
  position:relative;width:230px;height:230px;border-radius:50%;overflow:hidden;
  background:#0B1720;box-shadow:0 0 0 6px var(--surface), 0 0 0 7px var(--border);
}
.scan-frame svg{width:100%;height:100%;}
.scan-line{
  position:absolute;left:0;right:0;height:38%;
  background:linear-gradient(to bottom, transparent, rgba(11,156,151,0.42), rgba(11,156,151,0.08), transparent);
  animation:scanMove 1.9s ease-in-out infinite;
}
@keyframes scanMove{0%{top:-38%;}50%{top:100%;}100%{top:-38%;}}
.pipeline-list{width:100%;max-width:360px;margin-top:26px;}
.pl-item{display:flex;align-items:center;gap:10px;padding:8px 0;font-size:13px;color:var(--ink-mute);}
.pl-item .pl-check{
  width:19px;height:19px;border-radius:50%;border:1.5px solid var(--border);flex-shrink:0;
  display:flex;align-items:center;justify-content:center;
}
.pl-item.on{color:var(--ink);}
.pl-item.on .pl-check{background:var(--green);border-color:var(--green);}
.pl-item.on .pl-check svg{width:11px;height:11px;color:#fff;}
.ai-progressbar{width:100%;max-width:360px;margin-top:18px;}

/* Result hero */
.result-hero{
  display:flex;gap:22px;align-items:center;flex-wrap:wrap;
  background:linear-gradient(120deg, var(--blue-tint), var(--teal-tint));
  border-radius:var(--radius-lg);padding:22px 26px;border:1px solid var(--border);
}
.result-grade-badge{
  background:var(--white);border-radius:16px;padding:14px 20px;text-align:center;
  box-shadow:var(--shadow-2);min-width:150px;
}
.result-grade-badge .rg-level{font-size:11px;font-weight:800;color:var(--ink-mute);letter-spacing:0.03em;}
.result-grade-badge .rg-name{font-size:16px;font-weight:800;line-height:1.25;margin-top:4px;}
.severity-scale{display:flex;gap:6px;margin-top:16px;flex-wrap:wrap;}
.sev-pill{
  flex:1;min-width:120px;padding:9px 11px;border-radius:10px;background:var(--white);
  border:1.5px solid var(--border);font-size:11.5px;
}
.sev-pill b{display:block;font-size:12.4px;margin-bottom:2px;}
.sev-pill.active{border-color:var(--blue);background:var(--blue-tint);box-shadow:0 0 0 3px rgba(28,111,176,0.12);}

/* Lesion viewer */
.viewer-wrap{border:1px solid var(--border);border-radius:var(--radius-md);overflow:hidden;background:var(--white);}
.viewer-tabs{display:flex;gap:4px;padding:10px;border-bottom:1px solid var(--border);background:var(--surface);flex-wrap:wrap;}
.vtab{padding:7px 13px;border-radius:8px;font-size:12.4px;font-weight:700;color:var(--ink-soft);cursor:pointer;}
.vtab.active{background:var(--white);color:var(--blue-deep);box-shadow:var(--shadow-1);}
.viewer-stage{position:relative;background:#0B1720;aspect-ratio:4/3;display:flex;align-items:center;justify-content:center;overflow:hidden;}
.viewer-stage svg{width:auto;height:100%;transition:transform .25s ease;}
.viewer-stage.zoomed svg{transform:scale(1.5);}
.viewer-controls{position:absolute;bottom:12px;right:12px;display:flex;gap:6px;}
.vc-btn{width:32px;height:32px;border-radius:8px;background:rgba(255,255,255,0.92);display:flex;align-items:center;justify-content:center;cursor:pointer;border:none;}
.vc-btn svg{width:15px;height:15px;color:var(--ink);}
.viewer-legend{display:flex;gap:14px;padding:12px 14px;border-top:1px solid var(--border);flex-wrap:wrap;font-size:12px;}
.leg-item{display:flex;align-items:center;gap:6px;color:var(--ink-soft);cursor:pointer;}
.leg-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0;}
.leg-item.off{opacity:0.35;}

.lesion-stat-row{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:16px;}
@media (max-width:700px){.lesion-stat-row{grid-template-columns:1fr;}}
.lesion-stat{padding:14px;border-radius:12px;border:1px solid var(--border);}
.lesion-stat .ls-num{font-size:20px;font-weight:800;}
.lesion-stat .ls-name{font-size:12px;font-weight:700;margin-top:2px;}
.lesion-stat .ls-conf{font-size:11.5px;color:var(--ink-mute);margin-top:4px;}

/* Grad-CAM evidence flow */
.evidence-flow{display:flex;align-items:center;flex-wrap:wrap;gap:0;margin-top:18px;}
.ef-node{
  background:var(--white);border:1px solid var(--border);border-radius:12px;
  padding:11px 15px;font-size:12.3px;font-weight:700;text-align:center;flex:1;min-width:130px;
}
.ef-arrow{padding:0 8px;color:var(--ink-mute);flex-shrink:0;}
.ef-arrow svg{width:16px;height:16px;}
@media (max-width:900px){.evidence-flow{flex-direction:column;} .ef-arrow svg{transform:rotate(90deg);} .ef-node{width:100%;}}

/* Doctor validation */
.decision-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;}
@media (max-width:820px){.decision-grid{grid-template-columns:repeat(2,1fr);}}
.decision-opt{
  border:1.5px solid var(--border);border-radius:12px;padding:14px;text-align:center;cursor:pointer;background:var(--white);
}
.decision-opt:hover{border-color:var(--blue);}
.decision-opt.selected{border-color:var(--blue);background:var(--blue-tint);}
.decision-opt .do-ic{font-size:19px;}
.decision-opt .do-label{font-size:12.4px;font-weight:700;margin-top:6px;}

.compare-decision{display:grid;grid-template-columns:1fr auto 1fr;gap:14px;align-items:center;margin-top:18px;}
@media (max-width:640px){.compare-decision{grid-template-columns:1fr;}}
.cd-box{border:1px solid var(--border);border-radius:12px;padding:14px;text-align:center;}
.cd-box .cd-label{font-size:11px;color:var(--ink-mute);font-weight:700;}
.cd-box .cd-value{font-size:14.5px;font-weight:800;margin-top:4px;}
.cd-vs{color:var(--ink-mute);font-weight:800;font-size:12px;text-align:center;}

/* Referral */
.priority-row{display:flex;gap:9px;flex-wrap:wrap;}
.priority-chip{flex:1;min-width:100px;padding:11px;border-radius:10px;border:1.5px solid var(--border);text-align:center;cursor:pointer;font-weight:700;font-size:12.6px;}
.priority-chip.selected{border-color:currentColor;box-shadow:0 0 0 3px currentColor,-3px;}
.priority-chip[data-p="Routine"]{color:var(--green);}
.priority-chip[data-p="Medium"]{color:var(--amber);}
.priority-chip[data-p="High"]{color:#C1512B;}
.priority-chip[data-p="Urgent"]{color:var(--red);}
.priority-chip.selected{background:currentColor;color:#fff !important;}

/* Report */
.report-sheet{background:var(--white);border:1px solid var(--border);border-radius:var(--radius-lg);padding:32px 36px;max-width:820px;margin:0 auto;}
.report-head{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid var(--ink);padding-bottom:16px;margin-bottom:22px;flex-wrap:wrap;gap:10px;}
.report-head .rh-brand{font-size:19px;font-weight:800;}
.report-head .rh-sub{font-size:12px;color:var(--ink-mute);margin-top:2px;}
.report-head .rh-meta{text-align:right;font-size:11.5px;color:var(--ink-mute);}
.report-section{margin-bottom:22px;}
.report-section h4{font-size:12px;text-transform:uppercase;letter-spacing:0.04em;color:var(--blue-deep);font-weight:800;margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid var(--border-soft);}
.rep-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px 24px;font-size:13px;}
.rep-grid .rg-row{display:flex;justify-content:space-between;border-bottom:1px dotted var(--border);padding:5px 0;}
.rep-grid .rg-row span:first-child{color:var(--ink-mute);}
.rep-grid .rg-row span:last-child{font-weight:700;}
.report-gradcam-row{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:10px;}
.report-gradcam-row .rimg{aspect-ratio:1/1;background:#0B1720;border-radius:10px;overflow:hidden;}

/* Timeline */
.timeline{position:relative;padding-left:26px;}
.timeline:before{content:'';position:absolute;left:7px;top:6px;bottom:6px;width:2px;background:var(--border);}
.tl-item{position:relative;padding-bottom:26px;}
.tl-item:last-child{padding-bottom:0;}
.tl-dot{position:absolute;left:-26px;top:2px;width:16px;height:16px;border-radius:50%;border:3px solid var(--white);box-shadow:0 0 0 1.5px var(--border);}
.tl-date{font-size:11.5px;font-weight:700;color:var(--ink-mute);}
.tl-body{margin-top:4px;}

/* Referral kanban cards */
.referral-summary{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;}
@media (max-width:820px){.referral-summary{grid-template-columns:repeat(2,1fr);}}
.rs-card{padding:16px;border-radius:12px;border:1px solid var(--border);}
.rs-card .rs-num{font-size:22px;font-weight:800;}
.rs-card .rs-label{font-size:12px;font-weight:700;margin-top:2px;}

/* Analytics */
.bar-chart{display:flex;align-items:flex-end;gap:10px;height:180px;padding-top:10px;}
.bar-chart .bc-col{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;}
.bar-chart .bc-bar{width:100%;border-radius:6px 6px 0 0;transition:height .6s ease;}
.bar-chart .bc-label{font-size:10.5px;color:var(--ink-mute);margin-top:7px;font-weight:600;}
.bar-chart .bc-val{font-size:11px;font-weight:800;margin-bottom:5px;}

.donut-wrap{display:flex;align-items:center;gap:22px;flex-wrap:wrap;}
.donut-legend{flex:1;min-width:150px;}
.dl-row{display:flex;align-items:center;gap:8px;font-size:12.6px;padding:5px 0;}
.dl-row b{margin-left:auto;}

.sim-box{
  background:linear-gradient(120deg, var(--blue-tint), var(--purple-tint));
  border-radius:var(--radius-lg);padding:24px;border:1px solid var(--border);text-align:center;
}
.sim-box .sim-num{font-size:34px;font-weight:800;color:var(--blue-deep);}
.sim-box .sim-label{font-size:13px;color:var(--ink-soft);margin-top:4px;}
.sim-box .sim-tag{margin-top:10px;}

/* Settings */
.settings-row{display:flex;align-items:center;justify-content:space-between;padding:14px 0;border-bottom:1px solid var(--border-soft);}
.settings-row:last-child{border-bottom:none;}
.settings-row .sr-title{font-size:13.4px;font-weight:700;}
.settings-row .sr-sub{font-size:12px;color:var(--ink-mute);margin-top:2px;}
.toggle{width:42px;height:24px;border-radius:20px;background:var(--border);position:relative;cursor:pointer;flex-shrink:0;transition:background .2s;}
.toggle.on{background:var(--green);}
.toggle .tk{position:absolute;top:2px;left:2px;width:20px;height:20px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,0.3);transition:left .2s;}
.toggle.on .tk{left:20px;}

/* ---- Toasts ---- */
#toast-host{position:fixed;bottom:22px;right:22px;z-index:200;display:flex;flex-direction:column;gap:10px;max-width:340px;}
.toast{
  background:var(--ink);color:#fff;padding:13px 16px;border-radius:12px;font-size:13px;font-weight:600;
  box-shadow:var(--shadow-2);display:flex;align-items:center;gap:10px;
  animation:toastIn .25s ease;
}
.toast svg{width:17px;height:17px;flex-shrink:0;}
.toast.success{background:#15382A;}
.toast.error{background:#3C1918;}
.toast.info{background:#122B3A;}
@keyframes toastIn{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}

/* ---- Modal ---- */
.modal-overlay{
  position:fixed;inset:0;background:rgba(9,17,21,0.55);z-index:150;
  display:flex;align-items:center;justify-content:center;padding:20px;
  animation:fadeIn .18s ease;
}
@keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
.modal-box{
  background:#fff;border-radius:var(--radius-lg);max-width:440px;width:100%;
  box-shadow:var(--shadow-2);padding:24px;animation:modalIn .2s ease;
}
@keyframes modalIn{from{opacity:0;transform:scale(0.96) translateY(6px);}to{opacity:1;transform:scale(1) translateY(0);}}
.modal-box h3{font-size:16px;font-weight:800;margin-bottom:8px;}
.modal-box p{font-size:13.3px;color:var(--ink-soft);line-height:1.55;}
.modal-actions{display:flex;justify-content:flex-end;gap:10px;margin-top:20px;}

/* tooltip */
[data-tip]{position:relative;}
[data-tip]:hover:after{
  content:attr(data-tip);position:absolute;bottom:calc(100% + 8px);left:50%;transform:translateX(-50%);
  background:var(--ink);color:#fff;font-size:11px;font-weight:600;padding:5px 9px;border-radius:6px;white-space:nowrap;z-index:60;
}

/* mobile menu overlay */
.mobile-backdrop{display:none;}

/* ---- Responsive ---- */
@media (max-width:980px){
  .sidebar{transform:translateX(-100%);box-shadow:var(--shadow-2);}
  .sidebar.open{transform:translateX(0);}
  .main-col{margin-left:0;}
  .topbar-menu-btn{display:flex;}
  .mobile-backdrop.show{display:block;position:fixed;inset:0;background:rgba(9,17,21,0.4);z-index:35;}
  .content{padding:18px 16px 50px;}
  .tu-name,.tu-role{display:none;}
}
@media (max-width:640px){
  .result-hero{flex-direction:column;align-items:stretch;}
  .decision-grid{grid-template-columns:1fr 1fr;}
  .wizard-body{padding:18px 16px;}
  .report-sheet{padding:20px 16px;}
}

/* print */
@media print{
  .sidebar,.topbar,.wizard-foot,.wizard-steps,.mobile-backdrop,#toast-host,.no-print{display:none !important;}
  .main-col{margin-left:0 !important;}
  body{background:#fff;}
  .content{padding:0;max-width:none;}
  .report-sheet{border:none;box-shadow:none;}
}
</style>
</head>
<body>

<div id="app">
  <div class="mobile-backdrop" id="mobileBackdrop" onclick="closeSidebar()"></div>

  <aside class="sidebar" id="sidebar">
    <div class="sidebar-brand">
      <div class="brand-mark">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none"><path d="M2 12C2 12 6 5 12 5C18 5 22 12 22 12C22 12 18 19 12 19C6 19 2 12 2 12Z" stroke="#fff" stroke-width="1.8" stroke-linejoin="round"/><circle cx="12" cy="12" r="3.4" stroke="#fff" stroke-width="1.8"/></svg>
      </div>
      <div>
        <div class="brand-name">DRetinoDx</div>
        <div class="brand-tag">Explainable Retinal AI</div>
      </div>
    </div>
    <nav class="sidebar-nav" id="sidebarNav"></nav>
    <div class="sidebar-foot">
      <div class="sf-line1">Smart India Hackathon 2026</div>
      <div class="sf-line2">SIH26038</div>
    </div>
  </aside>

  <div class="main-col">
    <header class="topbar">
      <button class="icon-btn topbar-menu-btn" onclick="toggleSidebar()" aria-label="Menu">
        <svg viewBox="0 0 24 24" fill="none"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
      </button>
      <div class="topbar-title" id="topbarTitle">Dashboard</div>
      <div class="topbar-spacer"></div>
      <div class="conn-pill" id="connPill"><span class="conn-dot pulse"></span><span id="connLabel">Online</span></div>
      <div class="demo-badge">Demo Mode</div>
      <button class="icon-btn" data-tip="Notifications" onclick="openNotifications()">
        <svg viewBox="0 0 24 24" fill="none"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M13.7 21a2 2 0 0 1-3.4 0" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
        <span class="notif-dot"></span>
      </button>
      <div class="topbar-user" onclick="showToast('Profile menu is not part of this prototype demo.','info')">
        <div class="avatar">AS</div>
        <div>
          <div class="tu-name">Dr. Ananya Sharma</div>
          <div class="tu-role">Ophthalmologist</div>
        </div>
      </div>
    </header>

    <main class="content" id="content"></main>
  </div>
</div>

<div id="toast-host"></div>
<div id="modal-host"></div>

<script>
/* ============================================================
   ICONS (inline SVG strings, currentColor)
   ============================================================ */
const ICONS = {
  dashboard:'<svg class="nav-ic" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="8" height="8" rx="2" stroke="currentColor" stroke-width="1.7"/><rect x="13" y="3" width="8" height="5" rx="2" stroke="currentColor" stroke-width="1.7"/><rect x="13" y="10" width="8" height="11" rx="2" stroke="currentColor" stroke-width="1.7"/><rect x="3" y="13" width="8" height="8" rx="2" stroke="currentColor" stroke-width="1.7"/></svg>',
  screening:'<svg class="nav-ic" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3.4" stroke="currentColor" stroke-width="1.7"/><path d="M2 12C2 12 6 5 12 5C18 5 22 12 22 12C22 12 18 19 12 19C6 19 2 12 2 12Z" stroke="currentColor" stroke-width="1.7"/></svg>',
  patients:'<svg class="nav-ic" viewBox="0 0 24 24" fill="none"><circle cx="9" cy="8" r="3.2" stroke="currentColor" stroke-width="1.7"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><circle cx="17.5" cy="8.5" r="2.5" stroke="currentColor" stroke-width="1.7"/><path d="M15 20c0-2.7 1.6-5 4-5.6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
  history:'<svg class="nav-ic" viewBox="0 0 24 24" fill="none"><path d="M3 12a9 9 0 1 0 3-6.7" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M3 4v5h5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 8v4l3 2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
  ai:'<svg class="nav-ic" viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="16" height="16" rx="4" stroke="currentColor" stroke-width="1.7"/><path d="M9 9h.01M15 9h.01M8 15c1 1 2 1.5 4 1.5s3-.5 4-1.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  reports:'<svg class="nav-ic" viewBox="0 0 24 24" fill="none"><path d="M6 3h9l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M9 13h6M9 17h6M9 9h2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
  referrals:'<svg class="nav-ic" viewBox="0 0 24 24" fill="none"><path d="M4 12h13M17 12l-4-4M17 12l-4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 5v14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  analytics:'<svg class="nav-ic" viewBox="0 0 24 24" fill="none"><path d="M4 20V10M12 20V4M20 20v-7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  settings:'<svg class="nav-ic" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.7"/><path d="M19.4 13.5a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.9 2.9l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V20a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.1-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.9-2.9l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.55-1H4a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.55-1.1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.9-2.9l.06.06a1.7 1.7 0 0 0 1.87.34H10a1.7 1.7 0 0 0 1-1.55V4a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.9 2.9l-.06.06a1.7 1.7 0 0 0-.34 1.87V10a1.7 1.7 0 0 0 1.55 1H20a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.55 1Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>',
  upload:'<svg viewBox="0 0 24 24" fill="none"><path d="M12 16V4M12 4l-4 4M12 4l4 4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
  check:'<svg viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  arrowRight:'<svg viewBox="0 0 24 24" fill="none"><path d="M5 12h13M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  arrowLeft:'<svg viewBox="0 0 24 24" fill="none"><path d="M19 12H6M11 6l-6 6 6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  zoomIn:'<svg viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.8"/><path d="M21 21l-4.3-4.3M11 8v6M8 11h6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  zoomOut:'<svg viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.8"/><path d="M21 21l-4.3-4.3M8 11h6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  fullscreen:'<svg viewBox="0 0 24 24" fill="none"><path d="M4 9V5a1 1 0 0 1 1-1h4M20 9V5a1 1 0 0 0-1-1h-4M4 15v4a1 1 0 0 0 1 1h4M20 15v4a1 1 0 0 1-1 1h-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  bell:'<svg viewBox="0 0 24 24" fill="none"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" stroke-width="1.7"/></svg>',
  search:'<svg viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.8"/><path d="M21 21l-4.3-4.3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  download:'<svg viewBox="0 0 24 24" fill="none"><path d="M12 4v12M12 16l-4-4M12 16l4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 18v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  print:'<svg viewBox="0 0 24 24" fill="none"><path d="M6 9V3h12v6M6 18H4a1 1 0 0 1-1-1v-5a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-2" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><rect x="6" y="14" width="12" height="7" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
  rocket:'<svg viewBox="0 0 24 24" fill="none"><path d="M14.5 9.5c1.5-3 4-4.5 6-4.5 0 2-1.5 4.5-4.5 6M14.5 9.5L9.5 14.5M14.5 9.5c-2 .8-3.5 2-4.5 3M9.5 14.5c-.8 2-3 3-5 3.5.5-2 1.5-4.2 3.5-5M9.5 14.5L7 12" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><circle cx="16" cy="8" r="1.3" fill="currentColor"/></svg>',
  wifiOff:'<svg viewBox="0 0 24 24" fill="none"><path d="M2 2l20 20M8.5 8.5a11 11 0 0 1 7 0M5 12a15 15 0 0 1 3-2.2M12 20h.01M15.5 16.5a5 5 0 0 0-6.4-.4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  sync:'<svg viewBox="0 0 24 24" fill="none"><path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M18 3v4h-4M6 21v-4h4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  info:'<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.7"/><path d="M12 11v5M12 8h.01" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>',
  warn:'<svg viewBox="0 0 24 24" fill="none"><path d="M12 3l10 18H2L12 3Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M12 9.5v4.2M12 17h.01" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>',
  filter:'<svg viewBox="0 0 24 24" fill="none"><path d="M4 5h16M7 12h10M10 19h4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
};

/* ============================================================
   MOCK DATA
   ============================================================ */
const NAV_ITEMS = [
  {id:'dashboard', label:'Dashboard'},
  {id:'newscreening', label:'New Screening'},
  {id:'patients', label:'Patients'},
  {id:'history', label:'Screening History'},
  {id:'aianalysis', label:'AI Analysis'},
  {id:'reports', label:'Reports'},
  {id:'referrals', label:'Referrals', badgeKey:'urgentReferrals'},
  {id:'analytics', label:'Analytics'},
  {id:'settings', label:'Settings'},
];

const GRADE_META = {
  0:{name:'No DR', short:'Level 0', tagClass:'tag-0', color:'var(--ink-mute)', hex:'#8598A0'},
  1:{name:'Mild NPDR', short:'Level 1', tagClass:'tag-1', color:'var(--green)', hex:'#1C9A64'},
  2:{name:'Moderate NPDR', short:'Level 2', tagClass:'tag-2', color:'var(--amber)', hex:'#C6821C'},
  3:{name:'Severe NPDR', short:'Level 3', tagClass:'tag-3', color:'#C1512B', hex:'#C1512B'},
  4:{name:'Proliferative DR', short:'Level 4', tagClass:'tag-4', color:'var(--red)', hex:'#C6483F'},
};

const FIRST_NAMES = ['Rajesh','Sunita','Anil','Meena','Vikram','Kavita','Suresh','Pooja','Ramesh','Geeta','Arjun','Lakshmi','Deepak','Anita','Manoj','Priya','Ashok','Neha','Sanjay','Rekha'];
const LAST_NAMES = ['Kumar','Sharma','Verma','Patel','Singh','Yadav','Gupta','Reddy','Nair','Chauhan','Mishra','Joshi','Rathore','Bansal','Naidu'];

function seededRand(seed){ let x = Math.sin(seed)*10000; return x-Math.floor(x); }
function pick(arr, seed){ return arr[Math.floor(seededRand(seed)*arr.length)]; }

let PATIENTS = [];
(function buildPatients(){
  for(let i=0;i<42;i++){
    const s = i*7.31+3;
    const grade = Math.floor(seededRand(s)* (seededRand(s+1)>0.15?5:5));
    const gradeWeighted = [0,0,1,1,2,2,2,3,4][Math.floor(seededRand(s+2)*9)];
    const conf = Math.round(78 + seededRand(s+3)*20);
    const quality = Math.round(65 + seededRand(s+4)*34);
    const age = Math.round(32 + seededRand(s+5)*46);
    const referral = gradeWeighted>=2;
    PATIENTS.push({
      id:'P'+(1000+i),
      name: pick(FIRST_NAMES,s+6)+' '+pick(LAST_NAMES,s+7),
      age, gender: seededRand(s+8)>0.48?'Male':'Female',
      grade: gradeWeighted, confidence: conf, quality,
      referral: referral, status: referral ? (seededRand(s+9)>0.5?'Referred':'Pending Review') : 'Reviewed',
      lastScreening: ['2 days ago','5 days ago','1 week ago','2 weeks ago','3 weeks ago','1 month ago'][Math.floor(seededRand(s+10)*6)],
      diabetesYears: Math.round(2+seededRand(s+11)*15),
    });
  }
  // Ensure demo patient P1024 exists with fixed values
  PATIENTS[24] = {
    id:'P1024', name:'Rajesh Kumar', age:52, gender:'Male',
    grade:2, confidence:91, quality:92, referral:true, status:'Pending Review',
    lastScreening:'Today', diabetesYears:8,
  };
})();

let REFERRALS = PATIENTS.filter(p=>p.referral).map((p,i)=>({
  patient:p, priority:['Routine','Medium','High','Urgent'][Math.floor(seededRand(i*3.1)*4)],
  reason:'DR '+GRADE_META[p.grade].short+' · '+p.confidence+'% confidence',
  doctor:'Dr. Ananya Sharma',
  status:['Pending','Scheduled','Completed'][Math.floor(seededRand(i*5.2)*3)],
}));

/* ============================================================
   APP STATE
   ============================================================ */
const state = {
  view:'dashboard',
  offline:false,
  syncPending:3,
  wizardStep:1,
  wizard:{
    patient:{id:'',name:'',age:'',gender:'',diabetesStatus:'',diabetesDuration:'',glucose:'',phone:'',consent:false},
    images:{left:null,right:null},
    quality:{score:null, poor:false},
    enhanced:false,
    aiDone:false,
    grade:2,
    confidence:91,
    doctorDecision:null,
    modifiedGrade:2,
    doctorNotes:'',
    referralPriority:'Medium',
    referralDest:'Ophthalmologist',
    referralGenerated:false,
  },
  lesionTab:'annotated',
  gradcamTab:'overlay',
  legend:{microaneurysms:true, hemorrhages:true, exudates:true},
  patientSearch:'',
  patientFilterGrade:'all',
  activeReportPatient:null,
};

function resetWizard(){
  state.wizardStep=1;
  state.wizard = {
    patient:{id:'',name:'',age:'',gender:'',diabetesStatus:'',diabetesDuration:'',glucose:'',phone:'',consent:false},
    images:{left:null,right:null},
    quality:{score:null, poor:false},
    enhanced:false, aiDone:false,
    grade:2, confidence:91,
    doctorDecision:null, modifiedGrade:2, doctorNotes:'',
    referralPriority:'Medium', referralDest:'Ophthalmologist', referralGenerated:false,
  };
}

function loadDemoCase(){
  state.wizard.patient = {id:'P1024',name:'Rajesh Kumar',age:'52',gender:'Male',diabetesStatus:'Yes',diabetesDuration:'8',glucose:'168',phone:'98765 43210',consent:true};
  state.wizard.images = {left:'demo', right:'demo'};
  state.wizard.quality = {score:92, poor:false};
  state.wizard.enhanced = true;
  state.wizard.aiDone = true;
  state.wizard.grade = 2;
  state.wizard.confidence = 91;
  state.wizardStep = 6;
  state.view = 'newscreening';
  render();
  showToast('Demo case P1024 loaded — Rajesh Kumar','success');
}

/* ============================================================
   TOASTS
   ============================================================ */
function showToast(msg, type){
  type = type || 'info';
  const host = document.getElementById('toast-host');
  const el = document.createElement('div');
  el.className = 'toast '+type;
  const ic = type==='success'?ICONS.check:(type==='error'?ICONS.warn:ICONS.info);
  el.innerHTML = ic+'<span>'+msg+'</span>';
  host.appendChild(el);
  setTimeout(()=>{ el.style.opacity='0'; el.style.transition='opacity .3s'; setTimeout(()=>el.remove(),300); }, 3200);
}

/* ============================================================
   MODAL
   ============================================================ */
function showModal(title, body, actions){
  const host = document.getElementById('modal-host');
  const actionsHtml = (actions||[{label:'Close',cls:'btn-outline',action:'closeModal()'}])
    .map(a=>\`<button class="btn \${a.cls}" onclick="\${a.action}">\${a.label}</button>\`).join('');
  host.innerHTML = \`<div class="modal-overlay" onclick="if(event.target===this)closeModal()">
    <div class="modal-box">
      <h3>\${title}</h3>
      <p>\${body}</p>
      <div class="modal-actions">\${actionsHtml}</div>
    </div>
  </div>\`;
}
function closeModal(){ document.getElementById('modal-host').innerHTML=''; }

/* ============================================================
   SIDEBAR / NAV
   ============================================================ */
function renderSidebarNav(){
  const nav = document.getElementById('sidebarNav');
  nav.innerHTML = NAV_ITEMS.map(item=>{
    const badge = item.id==='referrals' ? \`<span class="nav-badge">\${REFERRALS.filter(r=>r.status==='Pending').length}</span>\` : '';
    return \`<div class="nav-item \${state.view===item.id?'active':''}" onclick="navigate('\${item.id}')">
      \${ICONS[item.id]||''}<span>\${item.label}</span>\${badge}
    </div>\`;
  }).join('');
}
function navigate(view){
  state.view = view;
  closeSidebar();
  window.scrollTo(0,0);
  render();
}
function toggleSidebar(){
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('mobileBackdrop').classList.toggle('show');
}
function closeSidebar(){
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('mobileBackdrop').classList.remove('show');
}

function toggleOffline(){
  state.offline = !state.offline;
  const pill = document.getElementById('connPill');
  const label = document.getElementById('connLabel');
  pill.classList.toggle('offline', state.offline);
  label.textContent = state.offline ? 'Offline' : 'Online';
  showToast(state.offline ? 'Offline mode active — results can be synced when connectivity returns.' : 'Back online — syncing available data.', state.offline?'error':'success');
  render();
}
function syncNow(){
  showToast('Syncing '+state.syncPending+' pending case(s)…','info');
  setTimeout(()=>{
    state.syncPending = 0;
    showToast('All cases synced successfully.','success');
    render();
  },1400);
}
function openNotifications(){
  showModal('Notifications', '3 new alerts: 2 referable cases pending doctor review, 1 image recapture requested from PHC Balaghat. This is a static demo notification panel.', [{label:'Dismiss all', cls:'btn-primary', action:'closeModal()'}]);
}

/* ============================================================
   RETINA / SVG VISUAL BUILDERS
   ============================================================ */
function retinaSVG(opts){
  opts = opts||{};
  const dim = opts.small ? 260 : 420;
  const vesselColor = opts.dark ? '#8a2f2f' : '#a83b3b';
  const bgGrad = opts.gid || ('bg'+Math.random().toString(36).slice(2,8));
  let lesionMarkers = '';
  if(opts.showLesions){
    const pts = [
      {x:210,y:150,type:'ma'},{x:255,y:120,type:'ma'},{x:150,y:105,type:'ma'},{x:290,y:190,type:'ma'},
      {x:175,y:255,type:'ma'},{x:230,y:280,type:'ma'},{x:130,y:200,type:'ma'},{x:265,y:240,type:'ma'},
      {x:195,y:90,type:'he'},{x:245,y:305,type:'he'},{x:110,y:160,type:'he'},
      {x:300,y:150,type:'ex'},{x:160,y:170,type:'ex'},{x:220,y:210,type:'ex'},{x:280,y:270,type:'ex'},{x:140,y:270,type:'ex'},
    ];
    const colors = {ma:'#E0B84A', he:'#D8534A', ex:'#F2D95C'};
    const active = state.legend||{microaneurysms:true,hemorrhages:true,exudates:true};
    const typeVisible = {ma:active.microaneurysms, he:active.hemorrhages, ex:active.exudates};
    lesionMarkers = pts.filter(p=>typeVisible[p.type]).map(p=>{
      const r = p.type==='he'?7:5;
      return \`<circle cx="\${p.x}" cy="\${p.y}" r="\${r}" fill="none" stroke="\${colors[p.type]}" stroke-width="2.4" opacity="0.95"/>\`;
    }).join('');
  }
  let heatmap = '';
  if(opts.heatmap){
    heatmap = \`
    <defs>
      <radialGradient id="hm1" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#FF3B30" stop-opacity="0.85"/>
        <stop offset="45%" stop-color="#FF8A00" stop-opacity="0.55"/>
        <stop offset="100%" stop-color="#FF8A00" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="hm2" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#FFD400" stop-opacity="0.7"/>
        <stop offset="100%" stop-color="#FFD400" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="hm3" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#33C6FF" stop-opacity="0.4"/>
        <stop offset="100%" stop-color="#33C6FF" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <ellipse cx="210" cy="150" rx="70" ry="55" fill="url(#hm1)"/>
    <ellipse cx="255" cy="230" rx="60" ry="48" fill="url(#hm1)"/>
    <ellipse cx="150" cy="230" rx="55" ry="45" fill="url(#hm2)"/>
    <ellipse cx="210" cy="210" rx="100" ry="90" fill="url(#hm3)"/>
    \`;
  }
  return \`
  <svg viewBox="0 0 420 420" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="\${bgGrad}" cx="42%" cy="38%" r="65%">
        <stop offset="0%" stop-color="\${opts.poor?'#4a2a1c':'#3a1414'}"/>
        <stop offset="55%" stop-color="\${opts.poor?'#2c1810':'#210a0a'}"/>
        <stop offset="100%" stop-color="#0c0505"/>
      </radialGradient>
    </defs>
    <circle cx="210" cy="210" r="205" fill="url(#\${bgGrad})"/>
    \${opts.poor?'<circle cx="210" cy="210" r="205" fill="#000" opacity="0.35"/>':''}
    <g opacity="\${opts.poor?0.4:0.9}" stroke="\${vesselColor}" fill="none" stroke-linecap="round">
      <path d="M210 210 C 170 160 120 140 70 130" stroke-width="5"/>
      <path d="M170 160 C 150 130 130 100 120 70" stroke-width="3"/>
      <path d="M210 210 C 250 160 300 140 350 130" stroke-width="5"/>
      <path d="M250 160 C 270 130 290 100 300 70" stroke-width="3"/>
      <path d="M210 210 C 170 260 120 280 70 300" stroke-width="5"/>
      <path d="M210 210 C 250 260 300 280 350 300" stroke-width="5"/>
      <path d="M210 210 C 195 260 190 310 195 360" stroke-width="4"/>
      <path d="M210 210 C 225 165 235 120 225 75" stroke-width="4"/>
    </g>
    <circle cx="210" cy="210" r="26" fill="#F2C879" opacity="0.9"/>
    <circle cx="210" cy="210" r="26" fill="none" stroke="#C98A3D" stroke-width="1.5" opacity="0.6"/>
    <circle cx="150" cy="235" r="34" fill="#7A1E1E" opacity="0.35"/>
    \${heatmap}
    \${lesionMarkers}
    <circle cx="210" cy="210" r="205" fill="none" stroke="#111" stroke-width="10" opacity="0.5"/>
  </svg>\`;
}

/* ============================================================
   MAIN RENDER SWITCH
   ============================================================ */
function render(){
  renderSidebarNav();
  const titles = {dashboard:'Dashboard', newscreening:'New Screening', patients:'Patients', history:'Screening History', aianalysis:'AI Analysis', reports:'Reports', referrals:'Referrals', analytics:'Analytics', settings:'Settings'};
  document.getElementById('topbarTitle').textContent = titles[state.view]||'';
  const c = document.getElementById('content');
  const renderers = {
    dashboard: renderDashboard,
    newscreening: renderWizard,
    patients: renderPatients,
    history: renderHistory,
    aianalysis: renderAIAnalysisPage,
    reports: renderReportsList,
    referrals: renderReferrals,
    analytics: renderAnalytics,
    settings: renderSettings,
  };
  c.innerHTML = (renderers[state.view]||renderDashboard)();
  afterRenderHooks();
}

function afterRenderHooks(){
  // nothing global right now; per-view hooks called inline where needed
}

/* ============================================================
   DASHBOARD
   ============================================================ */
function renderDashboard(){
  const trend = [62,70,58,74,68,80,84,79,88,92,86,96];
  const trendMax = Math.max(...trend);
  const recent = PATIENTS.slice(0,8);
  return \`
  <div class="page-head">
    <h1>Good Morning, Dr. Ananya</h1>
    <p>Monitor diabetic retinopathy screening activity and review AI-assisted cases across your primary health centre network.</p>
  </div>

  <div class="grid grid-4" style="margin-bottom:20px;">
    \${statCard('Patients Screened','1,284','up','+8.2% this month', iconWrap('patients-ic', 'var(--blue)','var(--blue-tint)'))}
    \${statCard('Screenings Today','48','up','+6 vs yesterday', iconWrap('today-ic','var(--teal)','var(--teal-tint)'))}
    \${statCard('Referable Cases','17','flat','Awaiting triage', iconWrap('refer-ic','var(--amber)','var(--amber-tint)'))}
    \${statCard('Pending Reviews','9','down','−3 since morning', iconWrap('pending-ic','var(--purple)','var(--purple-tint)'))}
  </div>
  <div class="grid grid-3" style="margin-bottom:20px;">
    <div class="card card-pad" style="grid-column:span 1;">
      <div class="card-head"><div><h3>Recapture Required</h3><div class="ch-sub">Image quality below threshold</div></div></div>
      <div style="display:flex;align-items:baseline;gap:8px;"><span style="font-size:30px;font-weight:800;">6</span><span class="tag tag-2">Needs action</span></div>
      <div class="divider"></div>
      <button class="btn btn-outline btn-sm" onclick="navigate('patients')">Review cases</button>
    </div>
    <div class="card card-pad" style="grid-column:span 2;">
      <div class="card-head">
        <div><h3>Screening Trend</h3><div class="ch-sub">Last 12 weeks · screenings per week</div></div>
        <span class="tag tag-blue">+34% vs prior period</span>
      </div>
      <div class="bar-chart">
        \${trend.map((v,i)=>\`<div class="bc-col"><span class="bc-val">\${v}</span><div class="bc-bar" style="height:\${(v/trendMax*100)}%;background:linear-gradient(180deg, var(--blue), var(--teal));"></div><span class="bc-label">W\${i+1}</span></div>\`).join('')}
      </div>
    </div>
  </div>

  <div class="grid grid-2" style="margin-bottom:20px;">
    <div class="card card-pad">
      <div class="card-head"><div><h3>DR Severity Distribution</h3><div class="ch-sub">Current caseload</div></div></div>
      \${donutChart([
        {label:'No DR', value:58, color:'#8598A0'},
        {label:'Mild NPDR', value:19, color:'#1C9A64'},
        {label:'Moderate NPDR', value:14, color:'#C6821C'},
        {label:'Severe NPDR', value:6, color:'#C1512B'},
        {label:'Proliferative DR', value:3, color:'#C6483F'},
      ])}
    </div>
    <div class="card card-pad">
      <div class="card-head"><div><h3>Referral Statistics</h3><div class="ch-sub">By priority, this week</div></div></div>
      \${referralStatBars()}
      <div class="divider"></div>
      <button class="btn btn-primary btn-sm btn-block" onclick="loadDemoCase()">\${ICONS.rocket} Load Demo Case</button>
    </div>
  </div>

  <div class="card card-pad">
    <div class="card-head">
      <div><h3>Recent Screenings</h3><div class="ch-sub">Latest AI-assisted screening results</div></div>
      <button class="btn btn-outline btn-sm" onclick="navigate('patients')">View all</button>
    </div>
    <div class="table-wrap">
      <table class="dtable">
        <thead><tr><th>Patient ID</th><th>Patient</th><th>Age</th><th>DR Grade</th><th>Confidence</th><th>Image Quality</th><th>Referral</th><th>Status</th></tr></thead>
        <tbody>
          \${recent.map(p=>patientRow(p)).join('')}
        </tbody>
      </table>
    </div>
  </div>
  <div class="disclaimer" style="margin-top:18px;">DRetinoDx is a screening prototype. AI outputs are for demonstration and decision-support purposes only and require qualified clinical review.</div>
  \`;
}

function iconWrap(name,color,bg){ return \`<div class="sc-icon" style="background:\${bg};color:\${color};">\${{ 'patients-ic':ICONS.patients,'today-ic':ICONS.screening,'refer-ic':ICONS.referrals,'pending-ic':ICONS.history }[name]}</div>\`; }

function statCard(label,val,trend,trendText,iconHtml){
  const trendIcon = trend==='up'?'▲':(trend==='down'?'▼':'—');
  return \`<div class="stat-card">
    <div class="sc-top">\${iconHtml}</div>
    <div class="sc-val">\${val}</div>
    <div class="sc-label">\${label}</div>
    <div class="sc-trend \${trend}">\${trendIcon} \${trendText}</div>
  </div>\`;
}

function patientRow(p){
  const gm = GRADE_META[p.grade];
  return \`<tr onclick="openPatientDetail('\${p.id}')">
    <td class="pid">\${p.id}</td>
    <td><div class="name-cell"><div class="mini-avatar">\${initials(p.name)}</div><span class="cell-strong">\${p.name}</span></div></td>
    <td>\${p.age}</td>
    <td><span class="tag \${gm.tagClass}">\${gm.short}</span></td>
    <td>\${p.confidence}%</td>
    <td>\${p.quality}%</td>
    <td>\${p.referral?'<span class="tag tag-3">Required</span>':'<span class="tag tag-1">None</span>'}</td>
    <td><span class="cell-mute">\${p.status}</span></td>
  </tr>\`;
}
function initials(name){ return name.split(' ').map(s=>s[0]).join('').slice(0,2).toUpperCase(); }

function donutChart(segments){
  const total = segments.reduce((a,s)=>a+s.value,0);
  let acc = 0;
  const r = 60, c = 2*Math.PI*r;
  const circles = segments.map(s=>{
    const frac = s.value/total;
    const dash = frac*c;
    const el = \`<circle cx="90" cy="90" r="\${r}" fill="none" stroke="\${s.color}" stroke-width="20" stroke-dasharray="\${dash} \${c-dash}" stroke-dashoffset="\${-acc}" transform="rotate(-90 90 90)"/>\`;
    acc += dash;
    return el;
  }).join('');
  return \`<div class="donut-wrap">
    <svg width="180" height="180" viewBox="0 0 180 180">\${circles}<circle cx="90" cy="90" r="40" fill="var(--white)"/></svg>
    <div class="donut-legend">
      \${segments.map(s=>\`<div class="dl-row"><span class="leg-dot" style="background:\${s.color}"></span>\${s.label}<b>\${s.value}%</b></div>\`).join('')}
    </div>
  </div>\`;
}

function referralStatBars(){
  const data = [{l:'Routine',v:38,c:'var(--green)'},{l:'Medium',v:28,c:'var(--amber)'},{l:'High',v:22,c:'#C1512B'},{l:'Urgent',v:12,c:'var(--red)'}];
  return data.map(d=>\`
    <div class="qmetric">
      <div class="qmetric-top"><span>\${d.l}</span><b>\${d.v}%</b></div>
      <div class="progress-track"><div class="progress-fill" style="width:\${d.v}%;background:\${d.c};"></div></div>
    </div>\`).join('');
}

function openPatientDetail(id){
  const p = PATIENTS.find(x=>x.id===id);
  if(!p) return;
  const gm = GRADE_META[p.grade];
  showModal(p.name, \`<b>\${p.id}</b> · \${p.age} yrs · \${p.gender}<br>DR Grade: <b>\${gm.short} — \${gm.name}</b><br>AI Confidence: \${p.confidence}% · Image Quality: \${p.quality}%<br>Diabetes duration: \${p.diabetesYears} years<br>Last screening: \${p.lastScreening}<br>Status: \${p.status}\`,
    [{label:'Close',cls:'btn-outline',action:'closeModal()'},{label:'Open Report',cls:'btn-primary',action:\`closeModal(); openReportFor('\${p.id}')\`}]);
}

/* ============================================================
   PATIENTS PAGE
   ============================================================ */
function renderPatients(){
  let list = PATIENTS.filter(p=>{
    const s = state.patientSearch.toLowerCase();
    const matchesSearch = !s || p.name.toLowerCase().includes(s) || p.id.toLowerCase().includes(s);
    const matchesGrade = state.patientFilterGrade==='all' || String(p.grade)===state.patientFilterGrade;
    return matchesSearch && matchesGrade;
  });
  return \`
  <div class="page-head"><h1>Patients</h1><p>Search and manage patient screening records across all connected centres.</p></div>
  <div class="card card-pad" style="margin-bottom:18px;">
    <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;">
      <div style="flex:1;min-width:220px;position:relative;">
        <input class="input" style="padding-left:36px;" placeholder="Search by name or patient ID…" value="\${state.patientSearch}" oninput="state.patientSearch=this.value; renderPatientTable();">
        <span style="position:absolute;left:11px;top:10px;color:var(--ink-mute);">\${ICONS.search.replace('viewBox="0 0 24 24"','viewBox="0 0 24 24" width="16" height="16"')}</span>
      </div>
      <select class="input" style="width:auto;" onchange="state.patientFilterGrade=this.value; renderPatientTable();">
        <option value="all" \${state.patientFilterGrade==='all'?'selected':''}>All DR Levels</option>
        \${[0,1,2,3,4].map(g=>\`<option value="\${g}" \${state.patientFilterGrade==String(g)?'selected':''}>\${GRADE_META[g].short}</option>\`).join('')}
      </select>
      <select class="input" style="width:auto;" onchange="showToast('Filter applied (demo).','info')">
        <option>All Referral Status</option><option>Required</option><option>None</option>
      </select>
      <select class="input" style="width:auto;" onchange="showToast('Filter applied (demo).','info')">
        <option>All Dates</option><option>Today</option><option>This Week</option><option>This Month</option>
      </select>
    </div>
  </div>
  <div class="card card-pad" id="patientTableCard">
    \${patientTableInner(list)}
  </div>\`;
}
function patientTableInner(list){
  if(list.length===0){
    return emptyState('No patients found','Try adjusting your search or filters.');
  }
  return \`<div class="table-wrap">
    <table class="dtable">
      <thead><tr><th>Patient ID</th><th>Name</th><th>Age</th><th>Last Screening</th><th>DR Grade</th><th>Confidence</th><th>Referral</th><th>Status</th></tr></thead>
      <tbody>
        \${list.map(p=>\`<tr onclick="openPatientDetail('\${p.id}')">
          <td class="pid">\${p.id}</td>
          <td><div class="name-cell"><div class="mini-avatar">\${initials(p.name)}</div><span class="cell-strong">\${p.name}</span></div></td>
          <td>\${p.age}</td>
          <td class="cell-mute">\${p.lastScreening}</td>
          <td><span class="tag \${GRADE_META[p.grade].tagClass}">\${GRADE_META[p.grade].short}</span></td>
          <td>\${p.confidence}%</td>
          <td>\${p.referral?'<span class="tag tag-3">Required</span>':'<span class="tag tag-1">None</span>'}</td>
          <td class="cell-mute">\${p.status}</td>
        </tr>\`).join('')}
      </tbody>
    </table>
  </div>\`;
}
function renderPatientTable(){
  let list = PATIENTS.filter(p=>{
    const s = state.patientSearch.toLowerCase();
    const matchesSearch = !s || p.name.toLowerCase().includes(s) || p.id.toLowerCase().includes(s);
    const matchesGrade = state.patientFilterGrade==='all' || String(p.grade)===state.patientFilterGrade;
    return matchesSearch && matchesGrade;
  });
  document.getElementById('patientTableCard').innerHTML = patientTableInner(list);
}
function emptyState(title,sub){
  return \`<div class="empty-state">\${ICONS.search}<div class="es-title">\${title}</div><div>\${sub}</div></div>\`;
}

/* ============================================================
   SCREENING HISTORY (Timeline)
   ============================================================ */
function renderHistory(){
  const events = [
    {date:'June 2026', grade:1, note:'Routine follow-up scheduled', lesions:'2 microaneurysms', conf:88},
    {date:'July 2026', grade:2, note:'Referral recommended to ophthalmologist', lesions:'6 microaneurysms, 1 hemorrhage', conf:90},
    {date:'September 2026', grade:2, note:'Doctor validated AI grade, referral confirmed', lesions:'8 microaneurysms, 3 hemorrhages, 5 exudates', conf:91},
  ];
  return \`
  <div class="page-head"><h1>Screening History</h1><p>Longitudinal DR progression for Patient P1024 — Rajesh Kumar.</p></div>
  <div class="grid grid-3" style="align-items:start;">
    <div class="card card-pad" style="grid-column:span 2;">
      <div class="card-head"><h3>Progression Timeline</h3></div>
      <div class="timeline">
        \${events.map(e=>\`
          <div class="tl-item">
            <div class="tl-dot" style="background:\${GRADE_META[e.grade].hex};"></div>
            <div class="tl-date">\${e.date}</div>
            <div class="tl-body">
              <span class="tag \${GRADE_META[e.grade].tagClass}">\${GRADE_META[e.grade].short}</span>
              <p style="margin-top:8px;font-size:13.2px;">\${e.note}</p>
              <p style="margin-top:4px;" class="cell-mute">Lesions detected: \${e.lesions} · Confidence \${e.conf}%</p>
            </div>
          </div>\`).join('')}
      </div>
    </div>
    <div class="card card-pad">
      <div class="card-head"><h3>Referral History</h3></div>
      <div class="qmetric"><div class="qmetric-top"><span>Jul 2026</span><b>Referred</b></div></div>
      <div class="qmetric"><div class="qmetric-top"><span>Ophthalmologist visit</span><b>Confirmed</b></div></div>
      <div class="divider"></div>
      <div class="card-head"><h3>Confidence Trend</h3></div>
      \${events.map(e=>\`<div class="qmetric"><div class="qmetric-top"><span>\${e.date}</span><b>\${e.conf}%</b></div><div class="progress-track"><div class="progress-fill" style="width:\${e.conf}%;background:var(--teal);"></div></div></div>\`).join('')}
    </div>
  </div>\`;
}

/* ============================================================
   AI ANALYSIS PAGE (standalone view — mirrors wizard step 5-7 for a completed case)
   ============================================================ */
function renderAIAnalysisPage(){
  return \`
  <div class="page-head"><h1>AI Analysis</h1><p>Explainable AI review workspace. Load the demo case or start a new screening to populate this view with live results.</p></div>
  \${resultsAndExplainability(true)}
  \`;
}

/* ============================================================
   REPORTS LIST
   ============================================================ */
function renderReportsList(){
  const recent = PATIENTS.slice(0,10);
  return \`
  <div class="page-head"><h1>Reports</h1><p>Automated screening reports generated by DRetinoDx, ready to review, download, or print.</p></div>
  <div class="card card-pad">
    <div class="table-wrap">
      <table class="dtable">
        <thead><tr><th>Patient ID</th><th>Name</th><th>DR Grade</th><th>Referral</th><th>Generated</th><th></th></tr></thead>
        <tbody>
          \${recent.map(p=>\`<tr onclick="openReportFor('\${p.id}')">
            <td class="pid">\${p.id}</td>
            <td class="cell-strong">\${p.name}</td>
            <td><span class="tag \${GRADE_META[p.grade].tagClass}">\${GRADE_META[p.grade].short}</span></td>
            <td>\${p.referral?'<span class="tag tag-3">Required</span>':'<span class="tag tag-1">None</span>'}</td>
            <td class="cell-mute">\${p.lastScreening}</td>
            <td><button class="btn btn-outline btn-sm" onclick="event.stopPropagation(); openReportFor('\${p.id}')">View</button></td>
          </tr>\`).join('')}
        </tbody>
      </table>
    </div>
  </div>\`;
}
function openReportFor(id){
  state.activeReportPatient = PATIENTS.find(p=>p.id===id) || PATIENTS[24];
  // sync wizard grade/confidence so report reflects patient
  state.wizard.grade = state.activeReportPatient.grade;
  state.wizard.confidence = state.activeReportPatient.confidence;
  state.wizard.patient.id = state.activeReportPatient.id;
  state.wizard.patient.name = state.activeReportPatient.name;
  state.wizard.patient.age = state.activeReportPatient.age;
  state.wizard.patient.gender = state.activeReportPatient.gender;
  state.wizardStep = 9;
  state.view = 'newscreening';
  render();
}

/* ============================================================
   REFERRALS
   ============================================================ */
function renderReferrals(){
  const urgent = REFERRALS.filter(r=>r.priority==='Urgent').length;
  const high = REFERRALS.filter(r=>r.priority==='High').length;
  const pending = REFERRALS.filter(r=>r.status==='Pending').length;
  const completed = REFERRALS.filter(r=>r.status==='Completed').length;
  return \`
  <div class="page-head"><h1>Referrals</h1><p>Track and manage referrals generated from AI-assisted DR screenings.</p></div>
  <div class="referral-summary" style="margin-bottom:20px;">
    <div class="rs-card" style="background:var(--red-tint);"><div class="rs-num" style="color:var(--red);">\${urgent}</div><div class="rs-label">Urgent</div></div>
    <div class="rs-card" style="background:#FBE3DE;"><div class="rs-num" style="color:#C1512B;">\${high}</div><div class="rs-label">High Priority</div></div>
    <div class="rs-card" style="background:var(--amber-tint);"><div class="rs-num" style="color:var(--amber);">\${pending}</div><div class="rs-label">Pending</div></div>
    <div class="rs-card" style="background:var(--green-tint);"><div class="rs-num" style="color:var(--green);">\${completed}</div><div class="rs-label">Completed</div></div>
  </div>
  <div class="card card-pad">
    <div class="card-head"><h3>Referral Queue</h3></div>
    <div class="table-wrap">
      <table class="dtable">
        <thead><tr><th>Patient</th><th>DR Grade</th><th>Reason</th><th>Priority</th><th>Doctor</th><th>Status</th></tr></thead>
        <tbody>
          \${REFERRALS.map((r,i)=>\`<tr>
            <td><div class="name-cell"><div class="mini-avatar">\${initials(r.patient.name)}</div><div><div class="cell-strong">\${r.patient.name}</div><div class="pid">\${r.patient.id}</div></div></div></td>
            <td><span class="tag \${GRADE_META[r.patient.grade].tagClass}">\${GRADE_META[r.patient.grade].short}</span></td>
            <td class="cell-mute">\${r.reason}</td>
            <td><span class="tag \${priorityTagClass(r.priority)}">\${r.priority}</span></td>
            <td class="cell-mute">\${r.doctor}</td>
            <td>
              <select class="input" style="padding:5px 8px;font-size:12px;width:auto;" onchange="updateReferralStatus(\${i}, this.value)">
                \${['Pending','Scheduled','Completed'].map(s=>\`<option \${r.status===s?'selected':''}>\${s}</option>\`).join('')}
              </select>
            </td>
          </tr>\`).join('')}
        </tbody>
      </table>
    </div>
  </div>\`;
}
function priorityTagClass(p){ return {Routine:'tag-1', Medium:'tag-2', High:'tag-3', Urgent:'tag-4'}[p]; }
function updateReferralStatus(i, val){
  REFERRALS[i].status = val;
  showToast('Referral status updated to "'+val+'"','success');
  render();
}

/* ============================================================
   ANALYTICS
   ============================================================ */
function renderAnalytics(){
  return \`
  <div class="page-head"><h1>Analytics</h1><p>Programme-level metrics across screening volume, AI performance, and deployment simulation.</p></div>
  <div class="grid grid-4" style="margin-bottom:18px;">
    \${statCard('Total Screenings','1,284','up','+8.2% MoM', iconWrap('patients-ic','var(--blue)','var(--blue-tint)'))}
    \${statCard('Referral Rate','13.2%','up','+1.4pt', iconWrap('refer-ic','var(--amber)','var(--amber-tint)'))}
    \${statCard('Recapture Rate','6.8%','down','−2.1pt', iconWrap('pending-ic','var(--purple)','var(--purple-tint)'))}
    \${statCard('Avg. Image Quality','89.4%','up','+3.0pt', iconWrap('today-ic','var(--teal)','var(--teal-tint)'))}
  </div>
  <div class="grid grid-2" style="margin-bottom:18px;">
    <div class="card card-pad">
      <div class="card-head"><h3>Screening Volume</h3><div class="ch-sub">Monthly, last 6 months</div></div>
      \${(()=>{const v=[640,780,910,1050,1180,1284]; const m=Math.max(...v); return \`<div class="bar-chart">\${v.map((x,i)=>\`<div class="bc-col"><span class="bc-val">\${x}</span><div class="bc-bar" style="height:\${x/m*100}%;background:linear-gradient(180deg,var(--teal),var(--blue));"></div><span class="bc-label">\${['Apr','May','Jun','Jul','Aug','Sep'][i]}</span></div>\`).join('')}</div>\`;})()}
    </div>
    <div class="card card-pad">
      <div class="card-head"><h3>DR Severity Distribution</h3></div>
      \${donutChart([
        {label:'No DR', value:58, color:'#8598A0'},
        {label:'Mild NPDR', value:19, color:'#1C9A64'},
        {label:'Moderate NPDR', value:14, color:'#C6821C'},
        {label:'Severe NPDR', value:6, color:'#C1512B'},
        {label:'Proliferative DR', value:3, color:'#C6483F'},
      ])}
    </div>
  </div>
  <div class="grid grid-2" style="margin-bottom:18px;">
    <div class="card card-pad">
      <div class="card-head"><h3>Image Quality Distribution</h3></div>
      \${qualityDistribution()}
    </div>
    <div class="card card-pad">
      <div class="card-head"><h3>Referral Rate by Priority</h3></div>
      \${referralStatBars()}
    </div>
  </div>
  <div class="sim-box">
    <div class="sim-num">100,000+</div>
    <div class="sim-label">Estimated patients screened per year at full district-level deployment</div>
    <div class="sim-tag"><span class="tag tag-purple">Simulation / Prototype Estimate</span></div>
  </div>\`;
}
function qualityDistribution(){
  const bands = [{l:'90–100%',v:44,c:'var(--green)'},{l:'75–89%',v:37,c:'var(--teal)'},{l:'50–74%',v:13,c:'var(--amber)'},{l:'Below 50%',v:6,c:'var(--red)'}];
  return bands.map(b=>\`<div class="qmetric"><div class="qmetric-top"><span>\${b.l}</span><b>\${b.v}%</b></div><div class="progress-track"><div class="progress-fill" style="width:\${b.v}%;background:\${b.c};"></div></div></div>\`).join('');
}

/* ============================================================
   SETTINGS
   ============================================================ */
let SETTINGS_TOGGLES = {autoEnhance:true, offlineCapture:true, gradcam:true, notifications:true, lowBandwidth:false};
function renderSettings(){
  return \`
  <div class="page-head"><h1>Settings</h1><p>Configure screening defaults, connectivity, and clinician preferences for this device.</p></div>
  <div class="grid grid-2">
    <div class="card card-pad">
      <div class="card-head"><h3>Screening Preferences</h3></div>
      \${settingsToggleRow('autoEnhance','Auto-enhance fundus images','Apply CLAHE and noise reduction automatically')}
      \${settingsToggleRow('gradcam','Show Grad-CAM by default','Display explainability view after AI analysis')}
      \${settingsToggleRow('lowBandwidth','Low-bandwidth image mode','Compress captures for slow rural networks')}
    </div>
    <div class="card card-pad">
      <div class="card-head"><h3>Connectivity & Sync</h3></div>
      \${settingsToggleRow('offlineCapture','Enable offline capture','Queue screenings locally when disconnected')}
      \${settingsToggleRow('notifications','Referral notifications','Alert on new referable cases')}
      <div class="settings-row">
        <div><div class="sr-title">Simulate Offline Mode</div><div class="sr-sub">Currently: \${state.offline?'Offline':'Online'}</div></div>
        <button class="btn btn-outline btn-sm" onclick="toggleOffline()">\${state.offline?'Go Online':'Go Offline'}</button>
      </div>
    </div>
  </div>
  <div class="card card-pad" style="margin-top:18px;">
    <div class="card-head"><h3>Clinician Profile</h3></div>
    <div class="field-row">
      <div class="field"><label>Name</label><input class="input" value="Dr. Ananya Sharma" readonly></div>
      <div class="field"><label>Role</label><input class="input" value="Ophthalmologist" readonly></div>
    </div>
    <div class="field-row">
      <div class="field"><label>Facility</label><input class="input" value="Primary Health Centre, Demo District" readonly></div>
      <div class="field"><label>Team</label><input class="input" value="DRetinoDx · SIH26038" readonly></div>
    </div>
  </div>
  <div class="disclaimer" style="margin-top:18px;">DRetinoDx is a screening prototype built for Smart India Hackathon 2026. AI outputs are for demonstration and decision-support purposes only and require qualified clinical review.</div>
  \`;
}
function settingsToggleRow(key,title,sub){
  return \`<div class="settings-row">
    <div><div class="sr-title">\${title}</div><div class="sr-sub">\${sub}</div></div>
    <div class="toggle \${SETTINGS_TOGGLES[key]?'on':''}" onclick="SETTINGS_TOGGLES['\${key}']=!SETTINGS_TOGGLES['\${key}']; render();"><div class="tk"></div></div>
  </div>\`;
}

/* ============================================================
   NEW SCREENING WIZARD
   ============================================================ */
const WIZARD_STEPS = ['Patient','Capture','Quality','Enhancement','AI Analysis','Results','Doctor Review','Referral','Report'];

function renderWizard(){
  const w = state.wizard;
  return \`
  <div class="page-head"><h1>New Screening</h1><p>Guided workflow from patient registration through to an automated, explainable screening report.</p></div>
  <div class="wizard-shell">
    <div class="wizard-steps">
      \${WIZARD_STEPS.map((label,i)=>{
        const n = i+1;
        const cls = n===state.wizardStep ? 'current' : (n<state.wizardStep ? 'done clickable' : '');
        return \`<div class="wstep \${cls}" \${n<state.wizardStep?\`onclick="goWizardStep(\${n})"\`:''}>
          <div class="wnum">\${n<state.wizardStep?ICONS.check.replace('viewBox="0 0 24 24"','viewBox="0 0 24 24" width="11" height="11"'):('0'+n).slice(-2)}</div>
          <div class="wlabel">\${label}</div>
        </div>\`;
      }).join('')}
    </div>
    <div class="wizard-body" id="wizardBody">
      \${wizardStepContent()}
    </div>
    <div class="wizard-foot">
      <div>
        \${state.wizardStep>1 ? \`<button class="btn btn-ghost" onclick="prevWizardStep()">\${ICONS.arrowLeft} Back</button>\` : \`<button class="btn btn-ghost" onclick="navigate('dashboard')">Cancel</button>\`}
      </div>
      <div style="display:flex;gap:10px;">
        \${state.wizardStep===1 ? \`<button class="btn btn-outline" onclick="fillDemoPatient()">Use Demo Patient</button>\` : ''}
        \${wizardPrimaryAction()}
      </div>
    </div>
  </div>\`;
}

function wizardPrimaryAction(){
  const step = state.wizardStep;
  if(step===9) return \`<button class="btn btn-teal" onclick="navigate('dashboard')">Finish</button>\`;
  if(step===8) return \`<button class="btn btn-primary" onclick="goWizardStep(9)">Continue to Report \${ICONS.arrowRight}</button>\`;
  if(step===7) return \`<button class="btn btn-primary" onclick="confirmDoctorDecision()">Confirm Clinical Decision \${ICONS.arrowRight}</button>\`;
  if(step===5) return \`<button class="btn btn-primary" id="aiContinueBtn" onclick="goWizardStep(6)" disabled>Continue to Results \${ICONS.arrowRight}</button>\`;
  return \`<button class="btn btn-primary" onclick="attemptNext()">Continue \${ICONS.arrowRight}</button>\`;
}

function goWizardStep(n){ state.wizardStep=n; render(); if(n===5) setTimeout(runAIAnalysis, 250); }
function prevWizardStep(){ state.wizardStep = Math.max(1,state.wizardStep-1); render(); }

function attemptNext(){
  const step = state.wizardStep;
  const w = state.wizard;
  if(step===1){
    const req = ['id','name','age','gender','diabetesStatus'];
    let ok = true;
    req.forEach(f=>{ if(!w.patient[f]) ok=false; });
    if(!w.patient.consent) ok=false;
    if(!ok){ state.showValidation=true; render(); showToast('Please complete all required fields and consent.','error'); return; }
  }
  if(step===2){
    if(!w.images.left || !w.images.right){ showToast('Please capture or upload both eye images (or use demo images).','error'); return; }
  }
  if(step===3){
    if(w.quality.poor){ showToast('Image quality insufficient — please recapture before proceeding.','error'); return; }
    if(w.quality.score===null){ showToast('Run the quality check first.','error'); return; }
  }
  if(step===4){ w.enhanced = true; }
  state.wizardStep++;
  state.showValidation=false;
  render();
  if(state.wizardStep===5) setTimeout(runAIAnalysis, 250);
}

function fillDemoPatient(){
  state.wizard.patient = {id:'P1024',name:'Rajesh Kumar',age:'52',gender:'Male',diabetesStatus:'Yes',diabetesDuration:'8',glucose:'168',phone:'98765 43210',consent:true};
  render();
  showToast('Demo patient details filled.','success');
}

function wizardStepContent(){
  const step = state.wizardStep;
  const fns = {1:stepPatient,2:stepCapture,3:stepQuality,4:stepEnhancement,5:stepAI,6:stepResults,7:stepDoctor,8:stepReferral,9:stepReport};
  return (fns[step]||stepPatient)();
}

/* ---- Step 1: Patient ---- */
function stepPatient(){
  const p = state.wizard.patient;
  const v = state.showValidation;
  const req = (val)=> v && !val ? 'err' : '';
  return \`
  <div class="step-heading"><h2>Patient Registration</h2><p>Enter patient demographic and diabetes history details before fundus capture.</p></div>
  <div class="field-row">
    <div class="field"><label>Patient ID *</label><input class="input \${req(p.id)}" value="\${p.id}" oninput="state.wizard.patient.id=this.value" placeholder="e.g. P1024">
      \${v && !p.id ? '<div class="err-msg">Patient ID is required.</div>':''}</div>
    <div class="field"><label>Patient Name *</label><input class="input \${req(p.name)}" value="\${p.name}" oninput="state.wizard.patient.name=this.value" placeholder="Full name">
      \${v && !p.name ? '<div class="err-msg">Name is required.</div>':''}</div>
  </div>
  <div class="field-row">
    <div class="field"><label>Age *</label><input class="input \${req(p.age)}" type="number" min="1" max="120" value="\${p.age}" oninput="state.wizard.patient.age=this.value" placeholder="Years">
      \${v && !p.age ? '<div class="err-msg">Age is required.</div>':''}</div>
    <div class="field"><label>Gender *</label>
      <select class="input \${req(p.gender)}" onchange="state.wizard.patient.gender=this.value">
        <option value="">Select</option>
        <option \${p.gender==='Male'?'selected':''}>Male</option>
        <option \${p.gender==='Female'?'selected':''}>Female</option>
        <option \${p.gender==='Other'?'selected':''}>Other</option>
      </select>
      \${v && !p.gender ? '<div class="err-msg">Gender is required.</div>':''}</div>
  </div>
  <div class="field-row">
    <div class="field"><label>Diabetes Status *</label>
      <select class="input \${req(p.diabetesStatus)}" onchange="state.wizard.patient.diabetesStatus=this.value">
        <option value="">Select</option><option \${p.diabetesStatus==='Yes'?'selected':''}>Yes</option><option \${p.diabetesStatus==='No'?'selected':''}>No</option><option \${p.diabetesStatus==='Pre-diabetic'?'selected':''}>Pre-diabetic</option>
      </select></div>
    <div class="field"><label>Diabetes Duration (years)</label><input class="input" type="number" min="0" value="\${p.diabetesDuration}" oninput="state.wizard.patient.diabetesDuration=this.value"></div>
  </div>
  <div class="field-row">
    <div class="field"><label>Blood Glucose (mg/dL)</label><input class="input" type="number" value="\${p.glucose}" oninput="state.wizard.patient.glucose=this.value"></div>
    <div class="field"><label>Phone Number</label><input class="input" value="\${p.phone}" oninput="state.wizard.patient.phone=this.value" placeholder="10-digit mobile"></div>
  </div>
  <div class="checkbox-row">
    <input type="checkbox" id="consentBox" \${p.consent?'checked':''} onchange="state.wizard.patient.consent=this.checked">
    <span>Patient has provided informed consent for AI-assisted retinal image capture, analysis, and secure storage for clinical screening purposes.</span>
  </div>
  \${v && !p.consent ? '<div class="err-msg" style="margin-top:6px;">Consent is required to continue.</div>':''}
  \`;
}

/* ---- Step 2: Capture ---- */
function stepCapture(){
  const im = state.wizard.images;
  return \`
  <div class="step-heading"><h2>Fundus Image Capture</h2><p>Upload, drag & drop, or capture retinal images for both eyes. Use demo images if hardware is unavailable.</p></div>
  <div class="upload-grid">
    \${eyeUploadCard('left','LEFT EYE')}
    \${eyeUploadCard('right','RIGHT EYE')}
  </div>
  <div style="margin-top:16px;display:flex;gap:10px;flex-wrap:wrap;">
    <button class="btn btn-teal" onclick="useDemoImages()">\${ICONS.rocket} Use Demo Images</button>
    <button class="btn btn-outline" onclick="removeImages()">Remove Both</button>
  </div>
  \`;
}
function eyeUploadCard(side,label){
  const img = state.wizard.images[side];
  if(img){
    return \`<div class="upload-card has-image">
      <div class="uc-imgwrap">
        \${retinaSVG({small:true})}
        <div class="uc-imgtag">DEMO IMAGE</div>
      </div>
      <div class="uc-meta">
        <div>Resolution: <b>3872×2592</b></div>
        <div>File size: <b>4.2 MB</b></div>
        <div>Capture time: <b>Just now</b></div>
        <div>Eye: <b>\${label}</b></div>
        <div>Camera: <b>Portable Fundus Cam</b></div>
        <div>Status: <b style="color:var(--green);">Captured</b></div>
      </div>
      <div class="uc-actions">
        <button class="btn btn-outline btn-sm" onclick="retakeImage('\${side}')">Retake</button>
        <button class="btn btn-ghost btn-sm" onclick="removeImage('\${side}')">Remove</button>
      </div>
    </div>\`;
  }
  return \`<div class="upload-card">
    <div class="uc-eyelabel">\${label}</div>
    <div class="uc-dropzone" onclick="captureImage('\${side}')">
      \${ICONS.upload}
      <div class="uc-main">Upload Image</div>
      <div class="uc-sub">Drag & drop, or click to browse</div>
      <div class="uc-sub" style="margin-top:8px;">or</div>
      <button class="btn btn-outline btn-sm" style="margin-top:8px;" onclick="event.stopPropagation(); captureImage('\${side}')">\${ICONS.screening} Camera Capture</button>
    </div>
  </div>\`;
}
function captureImage(side){ state.wizard.images[side]='demo'; render(); showToast((side==='left'?'Left':'Right')+' eye image captured.','success'); }
function retakeImage(side){ state.wizard.images[side]=null; render(); }
function removeImage(side){ state.wizard.images[side]=null; render(); }
function removeImages(){ state.wizard.images={left:null,right:null}; render(); }
function useDemoImages(){ state.wizard.images={left:'demo',right:'demo'}; render(); showToast('Demo fundus images loaded for both eyes.','success'); }

/* ---- Step 3: Quality ---- */
function stepQuality(){
  const q = state.wizard.quality;
  if(q.score===null){
    return \`
    <div class="step-heading"><h2>Smart Image Quality Check</h2><p>DRetinoDx automatically evaluates focus, illumination, field of view, contrast, and artifacts before analysis.</p></div>
    <div class="empty-state" style="padding:40px 20px;">
      \${ICONS.ai}
      <div class="es-title">Ready to run quality check</div>
      <div style="margin-bottom:16px;">This evaluates the captured fundus images against clinical screening thresholds.</div>
      <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
        <button class="btn btn-primary" onclick="runQualityCheck(false)">Run Quality Check</button>
        <button class="btn btn-outline" onclick="runQualityCheck(true)">Poor Quality Demo</button>
      </div>
    </div>\`;
  }
  if(q.poor){
    return \`
    <div class="step-heading"><h2>Smart Image Quality Check</h2><p>Automated evaluation against clinical screening thresholds.</p></div>
    <div class="qscore-hero" style="background:var(--red-tint);">
      \${scoreRing(q.score,'var(--red)')}
      <div>
        <div class="tag tag-4">\${ICONS.warn.replace('viewBox="0 0 24 24"','viewBox="0 0 24 24" width="13" height="13"')} Image quality insufficient for reliable screening</div>
        <div style="margin-top:10px;font-size:13px;color:var(--ink-soft);">Reasons: Poor focus, Low illumination</div>
      </div>
    </div>
    <button class="btn btn-danger" onclick="removeImages(); state.wizard.quality={score:null,poor:false}; goWizardStep(2);">Recapture Image</button>
    \`;
  }
  return \`
  <div class="step-heading"><h2>Smart Image Quality Check</h2><p>Automated evaluation against clinical screening thresholds.</p></div>
  <div class="qscore-hero">
    \${scoreRing(q.score,'var(--green)')}
    <div style="flex:1;min-width:220px;">
      <div class="tag tag-1">\${ICONS.check.replace('viewBox="0 0 24 24"','viewBox="0 0 24 24" width="12" height="12"')} Image acceptable for AI analysis</div>
    </div>
  </div>
  <div class="grid grid-2">
    \${qualityMetric('Focus',92,'Good')}
    \${qualityMetric('Illumination',89,'Good')}
    \${qualityMetric('Field of View',95,'Good')}
    \${qualityMetric('Contrast',90,'Good')}
  </div>
  <div class="field" style="margin-top:14px;">
    <div class="qmetric-top"><span>Artifacts</span><b style="color:var(--green);">None detected</b></div>
  </div>
  <button class="btn btn-outline btn-sm" onclick="runQualityCheck(true)">Simulate Poor Quality Instead</button>
  \`;
}
function scoreRing(score,color){
  const r=44,c=2*Math.PI*r;
  const dash = score/100*c;
  return \`<div class="ring">
    <svg width="104" height="104" viewBox="0 0 104 104">
      <circle cx="52" cy="52" r="\${r}" fill="none" stroke="var(--surface-2)" stroke-width="9"/>
      <circle cx="52" cy="52" r="\${r}" fill="none" stroke="\${color}" stroke-width="9" stroke-linecap="round" stroke-dasharray="\${dash} \${c-dash}"/>
    </svg>
    <div class="ring-val"><b>\${score}%</b><span>QUALITY</span></div>
  </div>\`;
}
function qualityMetric(name,val,status){
  return \`<div class="qmetric">
    <div class="qmetric-top"><span>\${name}</span><b>\${val}% — \${status}</b></div>
    <div class="progress-track"><div class="progress-fill" style="width:\${val}%;background:var(--teal);"></div></div>
  </div>\`;
}
function runQualityCheck(poor){
  state.wizard.quality = poor ? {score:48, poor:true} : {score:92, poor:false};
  render();
  showToast(poor ? 'Image quality below threshold.' : 'Image quality check passed.', poor?'error':'success');
}

/* ---- Step 4: Enhancement ---- */
function stepEnhancement(){
  const steps = ['Noise reduction','Contrast enhancement','Illumination normalization','CLAHE'];
  return \`
  <div class="step-heading"><h2>Image Enhancement</h2><p>Preprocessing pipeline improves image clarity prior to AI analysis.</p></div>
  <div class="compare-wrap">
    <div class="compare-pane">
      <div class="cp-label">Original Fundus</div>
      <div class="cp-img">\${retinaSVG({small:true})}</div>
    </div>
    <div class="compare-pane">
      <div class="cp-label">Enhanced Fundus</div>
      <div class="cp-img" style="filter:contrast(1.28) saturate(1.25) brightness(1.12);">\${retinaSVG({small:true})}</div>
    </div>
  </div>
  <div class="divider"></div>
  <div class="grid grid-2">
    \${steps.map(s=>\`<div class="pl-item on"><div class="pl-check">\${ICONS.check.replace('viewBox="0 0 24 24"','viewBox="0 0 24 24" width="11" height="11"')}</div>\${s}</div>\`).join('')}
  </div>
  <div style="margin-top:16px;"><span class="tag tag-1">\${ICONS.check.replace('viewBox="0 0 24 24"','viewBox="0 0 24 24" width="12" height="12"')} Enhancement Complete</span></div>
  \`;
}

/* ---- Step 5: AI Analysis (processing) ---- */
function stepAI(){
  const done = state.wizard.aiDone;
  const pipeline = ['Image preprocessing','Retinal structure analysis','Vessel detection','Lesion detection','DR classification','Explainability generation'];
  return \`
  <div class="step-heading"><h2>AI Analysis</h2><p>Simulated on-device inference pipeline. <b>This is mock AI for demonstration — no live model is executing.</b></p></div>
  <div class="ai-processing">
    <div class="scan-frame" id="scanFrame">
      \${retinaSVG({small:true})}
      <div class="scan-line"></div>
    </div>
    <div class="pipeline-list" id="pipelineList">
      \${pipeline.map((p,i)=>\`<div class="pl-item" id="pl-\${i}"><div class="pl-check"></div>\${p}</div>\`).join('')}
    </div>
    <div class="ai-progressbar">
      <div class="progress-track"><div class="progress-fill" id="aiProgressFill" style="width:0%;background:linear-gradient(90deg,var(--blue),var(--teal));"></div></div>
      <div style="text-align:center;margin-top:8px;font-size:12.5px;color:var(--ink-mute);" id="aiProgressLabel">Starting analysis…</div>
    </div>
  </div>
  \`;
}
let aiRunning = false;
function runAIAnalysis(){
  if(state.wizard.aiDone){ finishAI(); return; }
  if(aiRunning) return;
  aiRunning = true;
  const fill = document.getElementById('aiProgressFill');
  const label = document.getElementById('aiProgressLabel');
  const items = document.querySelectorAll('.pl-item');
  let pct = 0;
  const stepMsgs = ['Preprocessing image…','Analyzing retinal structure…','Detecting vessels…','Detecting lesions…','Classifying DR severity…','Generating explainability map…'];
  const interval = setInterval(()=>{
    pct += 100/60;
    if(fill) fill.style.width = Math.min(pct,100)+'%';
    const stageIdx = Math.min(items.length-1, Math.floor(pct/(100/items.length)));
    items.forEach((it,i)=>{ if(i<=stageIdx) it.classList.add('on'); });
    items.forEach((it,i)=>{ if(i<=stageIdx && !it.querySelector('.pl-check').innerHTML.trim()) it.querySelector('.pl-check').innerHTML = ICONS.check.replace('viewBox="0 0 24 24"','viewBox="0 0 24 24" width="11" height="11"'); });
    if(label) label.textContent = stepMsgs[Math.min(stageIdx,stepMsgs.length-1)];
    if(pct>=100){
      clearInterval(interval);
      aiRunning = false;
      finishAI();
    }
  }, 2000/60);
}
function finishAI(){
  state.wizard.aiDone = true;
  const label = document.getElementById('aiProgressLabel');
  if(label) label.textContent = 'AI Analysis Complete';
  const btn = document.getElementById('aiContinueBtn');
  if(btn) btn.removeAttribute('disabled');
  showToast('AI Analysis Complete','success');
  setTimeout(()=>{ if(state.wizardStep===5){ goWizardStep(6); } }, 700);
}

/* ---- Step 6: Results + Step 7 uses same explainability blocks ---- */
function stepResults(){
  return resultsAndExplainability(false);
}
function resultsAndExplainability(standalone){
  const w = state.wizard;
  const gm = GRADE_META[w.grade];
  const patientLine = standalone ? '' : \`<div style="font-size:12.5px;color:var(--ink-mute);margin-top:2px;">Patient: <span class="pid">\${w.patient.id||'P1024'}</span> — \${w.patient.name||'Rajesh Kumar'}</div>\`;
  return \`
  <div class="step-heading"><h2>AI Screening Result</h2>\${patientLine}</div>

  <div class="result-hero">
    <div class="result-grade-badge">
      <div class="rg-level">\${gm.short}</div>
      <div class="rg-name">\${gm.name.toUpperCase()}</div>
    </div>
    <div style="flex:1;min-width:220px;">
      <div class="severity-scale">
        \${[0,1,2,3,4].map(g=>\`<div class="sev-pill \${g===w.grade?'active':''}"><b>\${GRADE_META[g].short}</b>\${GRADE_META[g].name}</div>\`).join('')}
      </div>
    </div>
  </div>

  <div class="grid grid-3" style="margin-top:16px;">
    <div class="card card-pad"><div class="ch-sub">AI Confidence</div><div style="font-size:22px;font-weight:800;margin-top:4px;">\${w.confidence}%</div><div class="progress-track" style="margin-top:8px;"><div class="progress-fill" style="width:\${w.confidence}%;background:var(--blue);"></div></div></div>
    <div class="card card-pad"><div class="ch-sub">Image Quality</div><div style="font-size:22px;font-weight:800;margin-top:4px;">\${w.quality.score||92}%</div><div class="progress-track" style="margin-top:8px;"><div class="progress-fill" style="width:\${w.quality.score||92}%;background:var(--teal);"></div></div></div>
    <div class="card card-pad"><div class="ch-sub">Referral</div><div style="font-size:22px;font-weight:800;margin-top:4px;color:var(--red);">Required</div><span class="tag tag-3" style="margin-top:6px;">DR ≥ Level 2</span></div>
  </div>

  <div class="divider"></div>
  <h3 style="font-size:15px;font-weight:800;margin-bottom:12px;">Lesion Detection</h3>
  \${lesionViewer()}
  <div class="lesion-stat-row">
    \${lesionStat('Microaneurysms',8,94,'#E0B84A')}
    \${lesionStat('Hemorrhages',3,89,'#D8534A')}
    \${lesionStat('Exudates',5,92,'#F2D95C')}
  </div>

  <div class="divider"></div>
  <h3 style="font-size:15px;font-weight:800;margin-bottom:4px;">Why did the AI make this prediction?</h3>
  <p class="cell-mute" style="margin-bottom:14px;">Explainable AI · Grad-CAM attention visualization</p>
  \${gradcamViewer()}
  <div class="grid grid-3" style="margin-top:16px;">
    <div class="card card-pad"><div class="ch-sub">AI Confidence</div><div style="font-size:19px;font-weight:800;">\${w.confidence}%</div></div>
    <div class="card card-pad"><div class="ch-sub">Important Regions</div><div style="font-size:19px;font-weight:800;">3</div></div>
    <div class="card card-pad"><div class="ch-sub">Detected Evidence</div><div style="font-size:12.6px;font-weight:700;margin-top:4px;">Microaneurysms, Hemorrhages, Exudates</div></div>
  </div>
  <p style="font-size:13px;color:var(--ink-soft);margin-top:14px;">AI attention is concentrated around regions associated with detected retinal lesions.</p>

  <div class="evidence-flow">
    <div class="ef-node">Detected Lesions</div><div class="ef-arrow">\${ICONS.arrowRight}</div>
    <div class="ef-node">Important Retinal Regions</div><div class="ef-arrow">\${ICONS.arrowRight}</div>
    <div class="ef-node">AI Classification</div><div class="ef-arrow">\${ICONS.arrowRight}</div>
    <div class="ef-node">\${gm.short}</div><div class="ef-arrow">\${ICONS.arrowRight}</div>
    <div class="ef-node">Referral Recommendation</div>
  </div>
  <div class="disclaimer" style="margin-top:16px;">Explainability visualization is provided to support clinician review. DRetinoDx is a screening prototype; AI outputs require qualified clinical review.</div>
  \`;
}
function lesionViewer(){
  const tab = state.lesionTab;
  return \`<div class="viewer-wrap">
    <div class="viewer-tabs">
      \${['original','annotated','heatmap','overlay'].map(t=>\`<div class="vtab \${tab===t?'active':''}" onclick="setLesionTab('\${t}')">\${cap(t)}</div>\`).join('')}
    </div>
    <div class="viewer-stage" id="lesionStage">
      \${retinaSVG({showLesions: tab==='annotated'||tab==='overlay', heatmap: tab==='heatmap'||tab==='overlay'})}
      <div class="viewer-controls">
        <button class="vc-btn" onclick="zoomStage('lesionStage',true)">\${ICONS.zoomIn}</button>
        <button class="vc-btn" onclick="zoomStage('lesionStage',false)">\${ICONS.zoomOut}</button>
        <button class="vc-btn" onclick="showToast('Fullscreen preview (demo).','info')">\${ICONS.fullscreen}</button>
      </div>
    </div>
    <div class="viewer-legend">
      <div class="leg-item \${state.legend.microaneurysms?'':'off'}" onclick="toggleLegend('microaneurysms')"><span class="leg-dot" style="background:#E0B84A;"></span>Microaneurysms</div>
      <div class="leg-item \${state.legend.hemorrhages?'':'off'}" onclick="toggleLegend('hemorrhages')"><span class="leg-dot" style="background:#D8534A;"></span>Hemorrhages</div>
      <div class="leg-item \${state.legend.exudates?'':'off'}" onclick="toggleLegend('exudates')"><span class="leg-dot" style="background:#F2D95C;"></span>Exudates</div>
    </div>
  </div>\`;
}
function cap(s){ return s.charAt(0).toUpperCase()+s.slice(1); }
function setLesionTab(t){ state.lesionTab=t; render(); }
function toggleLegend(key){ state.legend[key]=!state.legend[key]; render(); }
function zoomStage(id,inward){
  const el = document.getElementById(id);
  if(!el) return;
  el.classList.toggle('zoomed', inward);
}
function lesionStat(name,count,conf,color){
  return \`<div class="lesion-stat" style="border-left:4px solid \${color};">
    <div class="ls-num">\${count} <span style="font-size:12px;font-weight:600;color:var(--ink-mute);">detected</span></div>
    <div class="ls-name">\${name.toUpperCase()}</div>
    <div class="ls-conf">\${conf}% confidence</div>
  </div>\`;
}
function gradcamViewer(){
  const tab = state.gradcamTab;
  return \`<div class="viewer-wrap">
    <div class="viewer-tabs">
      \${['original','heatmap','overlay'].map(t=>\`<div class="vtab \${tab===t?'active':''}" onclick="setGradcamTab('\${t}')">\${cap(t)}</div>\`).join('')}
    </div>
    <div class="viewer-stage">
      \${retinaSVG({heatmap: tab==='heatmap'||tab==='overlay', showLesions: tab==='overlay'})}
    </div>
  </div>\`;
}
function setGradcamTab(t){ state.gradcamTab=t; render(); }

/* ---- Step 7: Doctor Validation ---- */
function stepDoctor(){
  const w = state.wizard;
  const gm = GRADE_META[w.grade];
  return \`
  <div class="step-heading"><h2>Human-in-the-Loop Clinical Review</h2><p>The ophthalmologist reviews AI output before any referral or report is finalized.</p></div>
  <div class="card card-pad" style="margin-bottom:18px;background:var(--surface);">
    <div class="ch-sub">AI Assessment</div>
    <div style="display:flex;align-items:center;gap:10px;margin-top:6px;">
      <span class="tag \${gm.tagClass}" style="font-size:13px;padding:6px 12px;">\${gm.short} — \${gm.name}</span>
      <span class="cell-mute">Confidence: \${w.confidence}%</span>
    </div>
  </div>
  <div class="decision-grid">
    \${decisionOpt('agree','✓','Agree with AI')}
    \${decisionOpt('modify','✎','Modify Grade')}
    \${decisionOpt('recapture','↻','Request Recapture')}
    \${decisionOpt('specialist','⚕','Specialist Review')}
  </div>

  \${w.doctorDecision==='modify' ? \`
  <div class="field" style="margin-top:18px;">
    <label>Select Corrected DR Level</label>
    <div class="chip-select">
      \${[0,1,2,3,4].map(g=>\`<div class="chip-opt \${w.modifiedGrade===g?'selected':''}" onclick="state.wizard.modifiedGrade=\${g}; render();">\${GRADE_META[g].short}</div>\`).join('')}
    </div>
  </div>\` : ''}

  <div class="field" style="margin-top:16px;">
    <label>Doctor Notes</label>
    <textarea class="input" rows="3" placeholder="Add clinical observations…" oninput="state.wizard.doctorNotes=this.value">\${w.doctorNotes}</textarea>
  </div>

  \${w.doctorDecision ? \`
  <div class="compare-decision">
    <div class="cd-box"><div class="cd-label">AI ASSESSMENT</div><div class="cd-value">\${gm.short}</div></div>
    <div class="cd-vs">vs</div>
    <div class="cd-box" style="border-color:var(--blue);background:var(--blue-tint);">
      <div class="cd-label">DOCTOR VALIDATED</div>
      <div class="cd-value">\${w.doctorDecision==='modify' ? GRADE_META[w.modifiedGrade].short : (w.doctorDecision==='agree'?gm.short:cap(w.doctorDecision))}</div>
    </div>
  </div>\` : ''}
  \`;
}
function decisionOpt(key,ic,label){
  return \`<div class="decision-opt \${state.wizard.doctorDecision===key?'selected':''}" onclick="selectDecision('\${key}')">
    <div class="do-ic">\${ic}</div><div class="do-label">\${label}</div>
  </div>\`;
}
function selectDecision(key){ state.wizard.doctorDecision=key; render(); }
function confirmDoctorDecision(){
  if(!state.wizard.doctorDecision){ showToast('Please select a clinical decision to proceed.','error'); return; }
  showToast('Clinical decision confirmed.','success');
  state.wizardStep=8;
  render();
}

/* ---- Step 8: Referral ---- */
function stepReferral(){
  const w = state.wizard;
  const gm = GRADE_META[w.grade];
  return \`
  <div class="step-heading"><h2>Referral</h2><p>Generate a referral recommendation based on AI grading and clinician validation.</p></div>
  <div class="card card-pad" style="background:var(--red-tint);margin-bottom:18px;">
    <div style="font-weight:800;color:var(--red);display:flex;align-items:center;gap:8px;">\${ICONS.referrals} REFERRAL RECOMMENDED</div>
    <p style="margin-top:8px;font-size:13px;color:var(--ink-soft);">Reason: \${gm.short} · Detected lesions (8 microaneurysms, 3 hemorrhages, 5 exudates) · AI confidence \${w.confidence}%</p>
  </div>
  <div class="field">
    <label>Priority</label>
    <div class="priority-row">
      \${['Routine','Medium','High','Urgent'].map(p=>\`<div class="priority-chip \${w.referralPriority===p?'selected':''}" data-p="\${p}" onclick="state.wizard.referralPriority='\${p}'; render();">\${p}</div>\`).join('')}
    </div>
  </div>
  <div class="field">
    <label>Referral Destination</label>
    <select class="input" onchange="state.wizard.referralDest=this.value">
      \${['Ophthalmologist','Eye Care Centre','Specialist Hospital'].map(d=>\`<option \${w.referralDest===d?'selected':''}>\${d}</option>\`).join('')}
    </select>
  </div>
  <button class="btn btn-primary" onclick="generateReferral()">\${w.referralGenerated?'Referral Generated ✓':'Generate Referral'}</button>
  \${w.referralGenerated ? '<div class="disclaimer" style="margin-top:14px;">Referral record created and added to the Referrals queue.</div>':''}
  \`;
}
function generateReferral(){
  state.wizard.referralGenerated = true;
  showToast('Referral generated and added to queue.','success');
  render();
}

/* ---- Step 9: Report ---- */
function stepReport(){
  const w = state.wizard;
  const gm = GRADE_META[w.grade];
  const finalGrade = w.doctorDecision==='modify' ? w.modifiedGrade : w.grade;
  const fgm = GRADE_META[finalGrade];
  const p = w.patient;
  const today = new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'});
  return \`
  <div class="step-heading no-print"><h2>Automated Screening Report</h2><p>Reviewed and ready for download, print, or a new screening.</p></div>
  <div class="report-sheet" id="reportSheet">
    <div class="report-head">
      <div>
        <div class="rh-brand">DRetinoDx</div>
        <div class="rh-sub">Diabetic Retinopathy Screening Report</div>
      </div>
      <div class="rh-meta">
        Generated: \${today}<br>SIH26038 · DRetinoDx Prototype<br>Reviewing clinician: Dr. Ananya Sharma
      </div>
    </div>

    <div class="report-section">
      <h4>Patient Information</h4>
      <div class="rep-grid">
        <div class="rg-row"><span>Patient ID</span><span>\${p.id||'P1024'}</span></div>
        <div class="rg-row"><span>Name</span><span>\${p.name||'Rajesh Kumar'}</span></div>
        <div class="rg-row"><span>Age</span><span>\${p.age||52}</span></div>
        <div class="rg-row"><span>Gender</span><span>\${p.gender||'Male'}</span></div>
        <div class="rg-row"><span>Diabetes Status</span><span>\${p.diabetesStatus||'Yes'}</span></div>
        <div class="rg-row"><span>Diabetes Duration</span><span>\${p.diabetesDuration||8} years</span></div>
      </div>
    </div>

    <div class="report-section">
      <h4>Image Information</h4>
      <div class="rep-grid">
        <div class="rg-row"><span>Left Eye</span><span>Captured — Demo Image</span></div>
        <div class="rg-row"><span>Right Eye</span><span>Captured — Demo Image</span></div>
        <div class="rg-row"><span>Image Quality</span><span>\${w.quality.score||92}%</span></div>
        <div class="rg-row"><span>Capture Info</span><span>Portable Fundus Camera</span></div>
      </div>
    </div>

    <div class="report-section">
      <h4>AI Analysis</h4>
      <div class="rep-grid">
        <div class="rg-row"><span>DR Grade</span><span>\${gm.short} — \${gm.name}</span></div>
        <div class="rg-row"><span>AI Confidence</span><span>\${w.confidence}%</span></div>
      </div>
    </div>

    <div class="report-section">
      <h4>Lesion Findings</h4>
      <div class="rep-grid">
        <div class="rg-row"><span>Microaneurysms</span><span>8 detected (94%)</span></div>
        <div class="rg-row"><span>Hemorrhages</span><span>3 detected (89%)</span></div>
        <div class="rg-row"><span>Exudates</span><span>5 detected (92%)</span></div>
      </div>
    </div>

    <div class="report-section">
      <h4>Explainable AI</h4>
      <div class="report-gradcam-row">
        <div class="rimg">\${retinaSVG({small:true})}</div>
        <div class="rimg">\${retinaSVG({small:true,heatmap:true})}</div>
      </div>
      <p style="font-size:12px;color:var(--ink-soft);margin-top:8px;">Grad-CAM attention concentrated around lesion-associated retinal regions.</p>
    </div>

    <div class="report-section">
      <h4>Doctor Validation</h4>
      <div class="rep-grid">
        <div class="rg-row"><span>Doctor</span><span>Dr. Ananya Sharma</span></div>
        <div class="rg-row"><span>Decision</span><span>\${w.doctorDecision ? cap(w.doctorDecision)+' — '+fgm.short : 'Pending'}</span></div>
        <div class="rg-row"><span>Notes</span><span>\${w.doctorNotes || '—'}</span></div>
      </div>
    </div>

    <div class="report-section" style="margin-bottom:0;">
      <h4>Referral</h4>
      <div class="rep-grid">
        <div class="rg-row"><span>Recommendation</span><span>\${w.referralGenerated?'Referral Generated':'Not yet generated'}</span></div>
        <div class="rg-row"><span>Priority</span><span>\${w.referralPriority}</span></div>
        <div class="rg-row"><span>Destination</span><span>\${w.referralDest}</span></div>
      </div>
    </div>

    <div class="disclaimer" style="margin-top:20px;">DRetinoDx is a screening prototype developed for Smart India Hackathon 2026 (SIH26038). AI outputs are for demonstration and decision-support purposes only and require qualified clinical review. This is not a certified diagnostic device.</div>
  </div>
  <div class="no-print" style="display:flex;gap:10px;margin-top:18px;flex-wrap:wrap;">
    <button class="btn btn-primary" onclick="downloadReport()">\${ICONS.download} Download Report</button>
    <button class="btn btn-outline" onclick="window.print()">\${ICONS.print} Print Report</button>
    <button class="btn btn-teal" onclick="resetWizard(); render(); showToast('Ready for a new screening.','info');">New Screening</button>
  </div>
  \`;
}
function downloadReport(){
  const sheet = document.getElementById('reportSheet');
  if(!sheet) return;
  const w = state.wizard;
  const p = w.patient;
  const html = \`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>DRetinoDx Report — \${p.id||'P1024'}</title>
  <style>body{font-family:Arial,sans-serif;padding:30px;color:#0F1E24;} h4{color:#0E4E80;border-bottom:1px solid #ddd;padding-bottom:6px;} .row{display:flex;justify-content:space-between;border-bottom:1px dotted #ccc;padding:4px 0;font-size:13px;} .row span:first-child{color:#777;}</style>
  </head><body>\${sheet.innerHTML}</body></html>\`;
  const blob = new Blob([html], {type:'text/html'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'DRetinoDx_Report_'+(p.id||'P1024')+'.html';
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
  showToast('Report downloaded.','success');
}

/* ============================================================
   INIT
   ============================================================ */
render();
</script>
</body>
</html>
`;

export default function DRetinoDxApp() {
  const iframeRef = useRef(null);

  // Re-inject the doc each time the component mounts, so the app's
  // internal state (its own `render()` loop, wizard, toasts, etc.)
  // starts fresh every time this component is used.
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    iframe.srcdoc = DRETINODX_HTML;
  }, []);

  return (
    <div style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
      <iframe
        ref={iframeRef}
        title="DRetinoDx — Explainable AI Retinal Screening"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: 'block',
        }}
        // The app manages its own navigation/state internally, so no
        // special sandbox restrictions beyond the default are needed.
      />
    </div>
  );
}
