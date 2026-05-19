import { useState, useRef, useCallback } from "react";
import * as XLSX from "xlsx";
import * as CalcSan from "../utils/calcSanitario";
import * as CalcHid from "../utils/calcHidraulica";

/* ═══════════════════════════════════════════════════════════════════════════
   DHIDROSAN KML 2026
   Ing. Camilo Cárdenas Chacón — Ingeniero Civil
   NTC 1500 · RAS 2000 · NTC 3728 · NSR-10
═══════════════════════════════════════════════════════════════════════════ */

const LOGO_SRC = "data:image/jpeg;base64,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";

const G = `
.dhidrosan-wrapper{
  --bg:#111317;--bg2:#1a1c20;--bg3:#1e2024;--bg4:#282a2e;--bg5:#333539;
  --line:#3a494a;--line2:#3a494a;
  --txt:#e2e2e8;--txt2:#b9caca;--txt3:#849495;
  --acc:#2563EB;--acc2:#3B82F6;--acc3:#1D4ED8;--glow:rgba(37,99,235,.3);
  --ok:#2ff801;--ok-bg:rgba(47,248,1,.08);--ok-b:rgba(47,248,1,.2);
  --warn:#f5a623;--warn-bg:rgba(245,166,35,.08);--warn-b:rgba(245,166,35,.2);
  --err:#ffb4ab;--err-bg:rgba(255,180,171,.08);--err-b:rgba(255,180,171,.2);
  --gas:#c084fc;--gas-bg:rgba(192,132,252,.1);--gas-b:rgba(192,132,252,.25);
  --af:#00f5ff;--af-bg:rgba(0,245,255,.08);
  --ac:#ffb4ab;--ac-bg:rgba(255,180,171,.07);
  --san:#f5a623;--san-bg:rgba(245,166,35,.07);
  --ll:#22d3ee;--ll-bg:rgba(34,211,238,.07);
  --ven:#a3e635;--ven-bg:rgba(163,230,53,.07);
  --gold:#c9a227;
  --mono:'Geist',monospace;
  --head:'Hanken Grotesk',sans-serif;
  --body:'Hanken Grotesk',sans-serif;
  --r:0px;--r2:0px;--r3:0px;
}
.dhidrosan-wrapper ::-webkit-scrollbar{width:4px;height:4px}
.dhidrosan-wrapper ::-webkit-scrollbar-track{background:transparent}
.dhidrosan-wrapper ::-webkit-scrollbar-thumb{background:var(--line2);border-radius:0}
.dhidrosan-wrapper ::-webkit-scrollbar-thumb:hover{background:var(--txt3)}

.app{display:flex;flex-direction:column;height:100%}
.topbar{height:54px;background:var(--bg2);border-bottom:1px solid var(--line);display:flex;align-items:center;padding:0 16px;gap:12px;flex-shrink:0;background:linear-gradient(90deg,#111317 0%,#1a1c20 100%)}
.logo-img{height:42px;width:auto;border-radius:4px;filter:drop-shadow(0 0 8px var(--glow));flex-shrink:0}
.logo-divider{width:1px;height:30px;background:var(--line2);margin:0 4px}
.brand-block{display:flex;flex-direction:column;gap:0}
.brand-name{font-family:var(--head);font-size:20px;letter-spacing:1.5px;line-height:1}
.brand-d{color:var(--acc2)}.brand-rest{color:var(--txt)}
.brand-sub{font-family:var(--mono);font-size:8px;color:var(--txt3);letter-spacing:.5px}
.brand-sub b{color:var(--gold)}
.topbar-fill{flex:1}
.ing-block{display:flex;flex-direction:column;align-items:flex-end;gap:1px}
.ing-name{font-family:var(--body);font-size:11px;font-weight:600;color:var(--txt2)}
.ing-title{font-family:var(--mono);font-size:8px;color:var(--txt3)}
.vline{width:1px;height:28px;background:var(--line2);margin:0 8px}
.norms{display:flex;gap:4px;flex-wrap:wrap}
.norm{font-family:var(--mono);font-size:8px;padding:2px 6px;border-radius:20px;border:1px solid var(--line2);color:var(--txt3)}
.norm.hi{border-color:var(--acc3);color:var(--acc2)}
.proj-lbl{font-family:var(--mono);font-size:9px;color:var(--txt3);max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.nav{display:flex;width:100%;background:var(--bg2);border-bottom:1px solid var(--line);padding:0;gap:0;flex-shrink:0;overflow-x:auto}
.ntab{display:flex;flex:1;align-items:center;justify-content:center;gap:6px;padding:13px 16px;font-size:14px;font-weight:500;color:var(--txt3);cursor:pointer;border-bottom:3px solid transparent;white-space:nowrap;transition:all .15s;font-family:var(--body)}
.ntab:hover{color:var(--txt2)}.ntab.on{color:var(--acc2);border-bottom-color:var(--acc2)}
.ntab.gas-tab.on{color:var(--gas);border-bottom-color:var(--gas)}
.ntab-ico{font-size:16px}
.nbadge{font-family:var(--mono);font-size:10px;padding:2px 6px;border-radius:10px;background:var(--bg4);color:var(--txt3)}
.ntab.on .nbadge{background:var(--acc3);color:#fff}
.ntab.gas-tab.on .nbadge{background:var(--gas-bg);color:var(--gas)}
.layout{display:flex;flex:1;overflow:hidden}
.sb{width:360px;flex-shrink:0;background:var(--bg2);border-right:1px solid var(--line);overflow-y:auto;display:flex;flex-direction:column}
.sb-sec{padding:14px 16px;border-bottom:1px solid var(--line)}
.sb-hdr{font-family:var(--mono);font-size:12px;font-weight:600;letter-spacing:1.4px;text-transform:uppercase;color:var(--txt3);margin-bottom:10px;display:flex;align-items:center;gap:6px}
.sb-hdr::after{content:'';flex:1;height:1px;background:var(--line)}
.f{margin-bottom:8px}.f label{display:block;font-size:12px;font-weight:500;color:var(--txt2);margin-bottom:3px}
.f input,.f select{width:100%;padding:6px 10px;background:var(--bg3);border:1px solid var(--line);border-radius:var(--r);font-size:13px;font-family:var(--mono);color:var(--txt);outline:none;transition:border .15s}
.f input:focus,.f select:focus{border-color:var(--acc2)}.f select option{background:var(--bg3)}
.f2{display:grid;grid-template-columns:1fr 1fr;gap:7px}
.tg-grid{display:flex;flex-direction:column;gap:4px}
.tg{display:flex;align-items:center;gap:7px;padding:6px 8px;border:1px solid var(--line);border-radius:var(--r);cursor:pointer;transition:all .15s}
.tg:hover{border-color:var(--line2);background:var(--bg3)}
.tg.on{border-color:rgba(37,99,235,.4);background:rgba(37,99,235,.06)}
.tg.on.gtg{border-color:var(--gas-b);background:var(--gas-bg)}
.tg-dot{width:10px;height:10px;border-radius:50%;border:2px solid var(--line2);flex-shrink:0;transition:all .15s}
.tg.on .tg-dot{background:var(--acc);border-color:var(--acc)}
.tg.on.gtg .tg-dot{background:var(--gas);border-color:var(--gas)}
.tg-nm{font-size:12px;font-weight:500;color:var(--txt2)}.tg-sb{font-size:10px;color:var(--txt3);font-family:var(--mono)}
.tg-on{font-family:var(--mono);font-size:7px;color:var(--acc2);margin-left:auto}.tg.on.gtg .tg-on{color:var(--gas)}
.piso-r{display:flex;align-items:center;gap:5px;padding:5px 7px;background:var(--bg3);border:1px solid var(--line);border-radius:var(--r);margin-bottom:4px}
.piso-tag{font-family:var(--mono);font-size:10px;background:var(--bg4);color:var(--txt2);padding:3px 8px;border-radius:4px;white-space:nowrap;min-width:80px;text-align:center}
.piso-tag.sot{background:#0A1020;color:var(--txt3);border:1px solid var(--line)}
.piso-tag.cub{background:rgba(34,211,238,.12);color:var(--ll);border:1px solid rgba(34,211,238,.3)}
.npt-in{width:72px;padding:4px 6px;background:var(--bg);border:1px solid var(--line);border-radius:4px;font-family:var(--mono);font-size:11px;color:var(--txt);outline:none;text-align:right}
.pdot{width:6px;height:6px;border-radius:50%;background:var(--line2);flex-shrink:0;margin-left:auto}
.pdot.ok{background:var(--ok)}
.btn-xs{padding:6px 14px;border:1px solid var(--acc);border-radius:var(--r);background:rgba(37,99,235,.1);color:var(--acc);font-size:12px;cursor:pointer;width:100%;font-family:var(--body);font-weight:500;transition:all .15s;margin-top:3px}
.btn-xs:hover{background:var(--acc);color:#fff}
.content{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:12px}
.tab-content{flex:1;display:flex;flex-direction:column;gap:12px}
.tab-content .card{flex:1;display:flex;flex-direction:column;min-height:0}
.tab-content .card .card-b{flex:1;display:flex;flex-direction:column;min-height:0}
.tab-content .card .card-b .dz{flex:1;min-height:0}
.card{background:var(--bg2);border:1px solid var(--line);border-radius:var(--r3);overflow:hidden}
.card-h{padding:10px 14px;border-bottom:1px solid var(--line);display:flex;align-items:center;justify-content:space-between;background:linear-gradient(90deg,var(--bg4),var(--bg2))}
.card-t{font-family:var(--body);font-size:14px;font-weight:600;display:flex;align-items:center;gap:7px}
.card-s{font-size:11px;color:var(--txt3);font-family:var(--mono)}.card-b{padding:14px}
.dz{border:2px dashed var(--line2);border-radius:var(--r3);min-height:180px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;cursor:pointer;transition:all .2s;padding:20px;text-align:center}
.dz:hover,.dz.drag{border-color:var(--acc2);background:rgba(37,99,235,.04)}
.dz-ico{font-size:32px}.dz-t{font-family:var(--head);font-size:20px;letter-spacing:1px;color:var(--txt)}
.dz-s{font-size:10px;color:var(--txt3);line-height:1.6}
.pill{font-family:var(--mono);font-size:11px;padding:3px 8px;border-radius:20px;background:var(--bg4);color:var(--txt3);border:1px solid var(--line2)}
.tbl{width:100%;border-collapse:collapse;font-size:13px}
.tbl th{padding:6px 10px;background:var(--bg3);color:var(--txt3);font-family:var(--mono);font-size:10px;font-weight:600;letter-spacing:.4px;text-transform:uppercase;text-align:left;border-bottom:1px solid var(--line);white-space:nowrap}
.tbl th.c{text-align:center}.tbl td{padding:6px 9px;border-bottom:1px solid var(--line);vertical-align:middle}
.tbl tr:last-child td{border-bottom:none}.tbl tr:hover td{background:rgba(255,255,255,.01)}
.tbl-sec td{padding:5px 10px;background:var(--bg);font-family:var(--mono);font-size:13px;font-weight:600;letter-spacing:.8px;text-transform:uppercase;color:var(--txt3);border-bottom:1px solid var(--line)}
.col-h{padding:4px 10px;font-family:var(--mono);font-size:12px;font-weight:600;letter-spacing:.4px;text-transform:uppercase;text-align:center}
.col-h.af{background:var(--af-bg);color:var(--acc2)}.col-h.ac{background:var(--ac-bg);color:var(--ac)}
.col-h.san{background:var(--san-bg);color:var(--san)}.col-h.gas{background:var(--gas-bg);color:var(--gas)}
.col-h.ok{background:var(--ok-bg);color:var(--ok)}.col-h.ll{background:var(--ll-bg);color:var(--ll)}
.col-h.ven{background:var(--ven-bg);color:var(--ven)}
.sigla{font-family:var(--mono);font-size:11px;font-weight:600;color:var(--acc2);background:rgba(37,99,235,.12);padding:3px 8px;border-radius:3px;display:inline-block}
.sigla.gas{color:var(--gas);background:var(--gas-bg)}.ap-nm{font-weight:500;color:var(--txt);font-size:13px}
.ap-ref{font-family:var(--mono);font-size:12px;color:var(--txt3)}
.ni{width:100%;padding:5px 8px;background:var(--bg);border:1px solid var(--line);border-radius:4px;font-family:var(--mono);font-size:13px;color:var(--txt);text-align:center;outline:none;transition:border .12s}
.ni:focus{border-color:var(--acc2)}.ni.g{border-color:var(--gas-b)}.ni.g:focus{border-color:var(--gas)}
.badge{display:inline-flex;align-items:center;justify-content:center;min-width:32px;padding:2px 8px;border-radius:20px;font-family:var(--mono);font-size:11px;font-weight:500}
.badge.af{background:var(--af-bg);color:var(--acc2)}.badge.san{background:var(--san-bg);color:var(--san)}
.badge.gas{background:var(--gas-bg);color:var(--gas)}.badge.ok{background:var(--ok-bg);color:var(--ok)}
.badge.warn{background:var(--warn-bg);color:var(--warn)}.badge.err{background:var(--err-bg);color:var(--err)}
.badge.ll{background:var(--ll-bg);color:var(--ll)}.badge.ven{background:var(--ven-bg);color:var(--ven)}
.tot-bar{display:flex;gap:7px;flex-wrap:wrap;padding:9px 13px;background:var(--bg3);border-top:1px solid var(--line)}
.tot{flex:1;min-width:80px;padding:7px 10px;background:var(--bg2);border:1px solid var(--line);border-radius:var(--r2)}
.tot-l{font-family:var(--mono);font-size:12px;color:var(--txt3);margin-bottom:3px;text-transform:uppercase}
.tot-v{font-family:var(--head);font-size:20px;letter-spacing:.5px}
.tot-v.af{color:var(--acc2)}.tot-v.ac{color:var(--ac)}.tot-v.san{color:var(--san)}.tot-v.gas{color:var(--gas)}.tot-v.ll{color:var(--ll)}.tot-v.ven{color:var(--ven)}
.tot-s{font-family:var(--mono);font-size:12px;color:var(--txt3);margin-top:2px}
.tramo-card{background:var(--bg3);border:1px solid var(--line);border-radius:var(--r2);margin-bottom:7px;overflow:hidden}
.tramo-hdr{display:flex;align-items:center;gap:9px;padding:9px 13px;background:var(--bg4);border-bottom:1px solid var(--line)}
.tramo-id{font-family:var(--mono);font-size:12px;font-weight:600;color:var(--gas);background:var(--gas-bg);padding:3px 8px;border-radius:4px}
.tramo-body{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;padding:9px 11px}
.tramo-field{display:flex;flex-direction:column;gap:3px}
.tramo-lbl{font-family:var(--mono);font-size:12px;color:var(--txt3);text-transform:uppercase;letter-spacing:.4px}
.tramo-chk{display:flex;align-items:center;gap:8px;padding:7px 11px;border-top:1px solid var(--line);background:var(--bg);flex-wrap:wrap}
.chk-item{display:flex;align-items:center;gap:4px;font-family:var(--mono);font-size:11px}
.cal-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:7px}
.cal-card{padding:9px 11px;background:var(--bg3);border:1px solid var(--line);border-radius:var(--r2);cursor:pointer;transition:all .15s}
.cal-card:hover{border-color:var(--gas-b)}.cal-card.sel{border-color:var(--gas);background:var(--gas-bg)}
.cal-marca{font-family:var(--mono);font-size:12px;color:var(--txt3);text-transform:uppercase;margin-bottom:3px}
.cal-ref{font-size:13px;font-weight:600;color:var(--txt);margin-bottom:5px}
.cal-vals{display:flex;gap:7px;flex-wrap:wrap}.cal-val{font-family:var(--mono);font-size:13px}.cal-val span{color:var(--gas)}
.ib{padding:9px 12px;border-radius:var(--r2);font-size:13px;line-height:1.6;display:flex;gap:9px}
.ib.ok{background:var(--ok-bg);border:1px solid var(--ok-b);color:var(--ok)}
.ib.warn{background:var(--warn-bg);border:1px solid var(--warn-b);color:var(--warn)}
.ib.gas{background:var(--gas-bg);border:1px solid var(--gas-b);color:var(--gas)}
.ib.info{background:var(--af-bg);border:1px solid rgba(37,99,235,.2);color:var(--acc2)}
.ib.err{background:var(--err-bg);border:1px solid var(--err-b);color:var(--err)}
.val-r{display:flex;align-items:flex-start;gap:9px;padding:8px 11px;border-radius:var(--r);margin-bottom:4px;font-size:13px}
.val-r.ok{background:var(--ok-bg);border:1px solid var(--ok-b)}
.val-r.warn{background:var(--warn-bg);border:1px solid var(--warn-b)}
.val-r.idle{background:var(--bg3);border:1px solid var(--line);color:var(--txt3)}
.val-ico{font-size:12px;flex-shrink:0;margin-top:1px}
.meta-g{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}
.meta-c{padding:9px 11px;background:var(--bg3);border:1px solid var(--line);border-radius:var(--r2)}
.meta-l{font-family:var(--mono);font-size:12px;color:var(--txt3);margin-bottom:3px;text-transform:uppercase}
.meta-v{font-family:var(--head);font-size:20px;letter-spacing:.5px;color:var(--txt)}
.meta-s{font-family:var(--mono);font-size:12px;color:var(--acc2);margin-top:2px}
.res-row{display:flex;gap:10px;align-items:baseline;padding:6px 11px;background:var(--bg3);border-radius:var(--r);border:1px solid var(--line);margin-bottom:4px}
.res-k{font-family:var(--mono);font-size:12px;color:var(--txt3);min-width:130px;flex-shrink:0;text-transform:uppercase}
.res-v{font-size:13px;color:var(--txt);font-weight:500}
.pres-g{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin-bottom:12px}
.pres-c{padding:9px;background:var(--bg3);border:1px solid var(--line);border-radius:var(--r2)}
.pres-niv{font-size:14px;font-weight:500;color:var(--txt);margin-bottom:5px}
.pres-val{display:flex;justify-content:space-between;font-family:var(--mono);font-size:13px;margin-bottom:2px}
.pres-val span{color:var(--gas)}
.norm-ley{display:flex;gap:10px;flex-wrap:wrap;padding:8px 13px;border-top:1px solid var(--line);background:var(--bg)}
.nli{display:flex;align-items:center;gap:5px;font-family:var(--mono);font-size:11px;color:var(--txt3)}
.nld{width:5px;height:5px;border-radius:50%}
.act-bar{display:flex;align-items:center;justify-content:space-between;padding:9px 16px;background:var(--bg2);border-top:1px solid var(--line);flex-shrink:0}
.act-info{font-family:var(--mono);font-size:11px;color:var(--txt3)}.btn-g{display:flex;gap:7px}
.btn{padding:7px 15px;border-radius:var(--r);font-size:11px;font-family:var(--body);font-weight:500;cursor:pointer;border:none;transition:all .15s;display:flex;align-items:center;gap:5px}
.btn-ghost{background:transparent;border:1px solid var(--line2);color:var(--txt2)}
.btn-ghost:hover{border-color:var(--txt3);background:var(--bg3)}
.btn-pri{background:var(--acc);color:#fff;box-shadow:0 0 14px var(--glow)}
.btn-pri:hover{background:var(--acc3)}.btn-pri:disabled{background:var(--bg4);color:var(--txt3);box-shadow:none;cursor:not-allowed}
.sp{width:12px;height:12px;border:2px solid var(--line);border-top-color:var(--acc2);border-radius:50%;animation:rot .5s linear infinite;display:inline-block}
@keyframes rot{to{transform:rotate(360deg)}}
@keyframes fu{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
.fu{animation:fu .2s ease forwards}
`;

// ─── NOMENCLATURA COLOMBIANA DE PISOS ─────────────────────────────────────
function pisoLbl(n) {
  if (n < 0) return `Sótano ${Math.abs(n)}`;
  return `Piso ${n}`;
}

// ─── DATOS ────────────────────────────────────────────────────────────────
const APARATOS_DEF = [
  // Hidráulicos — NTC 1500
  {id:'lvm', sigla:'Lvm:',  nombre:'Lavamanos',            grupo:'h', uc_af:0.5, uc_ac:0.5, ud:2, pmin:0.51, pmax:5.63,  qgas:0, norma:'NTC 1500 T1'},
  {id:'san', sigla:'San:',  nombre:'Sanitario c/tanque',   grupo:'h', uc_af:2.2, uc_ac:0,   ud:4, pmin:0.71, pmax:14.10, qgas:0, norma:'NTC 1500 T1'},
  {id:'lvp', sigla:'Lvp:',  nombre:'Lavaplatos',           grupo:'h', uc_af:1.0, uc_ac:1.0, ud:2, pmin:0.51, pmax:5.63,  qgas:0, norma:'NTC 1500 T1'},
  {id:'duc', sigla:'Duc:',  nombre:'Ducha',                grupo:'h', uc_af:1.0, uc_ac:1.0, ud:2, pmin:1.02, pmax:5.63,  qgas:0, norma:'NTC 1500 T1'},
  {id:'tin', sigla:'Tin:',  nombre:'Tina de baño',         grupo:'h', uc_af:1.0, uc_ac:1.0, ud:2, pmin:0.51, pmax:14.10, qgas:0, norma:'NTC 1500 T1'},
  {id:'lvra',sigla:'Lvra:', nombre:'Lavadora',             grupo:'h', uc_af:1.0, uc_ac:0,   ud:4, pmin:0.51, pmax:5.63,  qgas:0, norma:'NTC 1500 T1'},
  {id:'lvro',sigla:'Lvro:', nombre:'Lavadero',             grupo:'h', uc_af:0.75,uc_ac:0.75,ud:2, pmin:0.51, pmax:5.63,  qgas:0, norma:'NTC 1500 T1'},
  {id:'ori', sigla:'Ori:',  nombre:'Orinal/Urinal',        grupo:'h', uc_af:2.2, uc_ac:0,   ud:5, pmin:0.71, pmax:14.10, qgas:0, norma:'NTC 1500 T1'},
  {id:'flu', sigla:'Flu:',  nombre:'Sanitario fluxómetro', grupo:'h', uc_af:6.0, uc_ac:0,   ud:6, pmin:0.71, pmax:14.10, qgas:0, norma:'NTC 1500 T1'},
  // Gas — NTC 3728
  {id:'est4', sigla:'Est:',  nombre:'Estufa 4 quemadores',  grupo:'g', uc_af:0,uc_ac:0,ud:0, pmin:17,pmax:25, qgas:1.35, norma:'NTC 3728 T1'},
  {id:'est2', sigla:'Est2:', nombre:'Estufa 2 quemadores',  grupo:'g', uc_af:0,uc_ac:0,ud:0, pmin:17,pmax:25, qgas:0.68, norma:'NTC 3728 T1'},
  {id:'hor_g',sigla:'Hor:',  nombre:'Horno grande',         grupo:'g', uc_af:0,uc_ac:0,ud:0, pmin:17,pmax:25, qgas:1.15, norma:'NTC 3728 T1'},
  {id:'hor_m',sigla:'HorM:', nombre:'Horno mediano',        grupo:'g', uc_af:0,uc_ac:0,ud:0, pmin:17,pmax:25, qgas:0.81, norma:'NTC 3728 T1'},
  {id:'hor_p',sigla:'HorP:', nombre:'Horno pequeño',        grupo:'g', uc_af:0,uc_ac:0,ud:0, pmin:17,pmax:25, qgas:0.54, norma:'NTC 3728 T1'},
  {id:'sec_g',sigla:'SecG:', nombre:'Secadora grande',      grupo:'g', uc_af:0,uc_ac:0,ud:0, pmin:17,pmax:25, qgas:0.81, norma:'NTC 3728 T1'},
  {id:'sec_p',sigla:'SecP:', nombre:'Secadora pequeña',     grupo:'g', uc_af:0,uc_ac:0,ud:0, pmin:17,pmax:25, qgas:0.54, norma:'NTC 3728 T1'},
  {id:'cal_b',sigla:'Cal:',  nombre:'Caldera pequeña',      grupo:'g', uc_af:0,uc_ac:0,ud:0, pmin:17,pmax:25, qgas:1.76, norma:'NTC 3728 T1'},
  {id:'jac',  sigla:'Jac:',  nombre:'Jacuzzi',              grupo:'g', uc_af:0,uc_ac:0,ud:0, pmin:17,pmax:25, qgas:3.38, norma:'NTC 3728 T1'},
  {id:'pisc', sigla:'Pis:',  nombre:'Calentador piscina',   grupo:'g', uc_af:0,uc_ac:0,ud:0, pmin:17,pmax:25, qgas:6.08, norma:'NTC 3728 T1'},
  {id:'sauna',sigla:'Sau:',  nombre:'Baño sauna',           grupo:'g', uc_af:0,uc_ac:0,ud:0, pmin:17,pmax:25, qgas:1.08, norma:'NTC 3728 T1'},
  {id:'turco',sigla:'Tur:',  nombre:'Baño turco',           grupo:'g', uc_af:0,uc_ac:0,ud:0, pmin:17,pmax:25, qgas:1.35, norma:'NTC 3728 T1'},
];

const CALENTADORES = [
  {id:1,lpm:6,ef:87,kw:11.5,btu:39240,m3h:1.11,marca:'HACEB',ref:'HACEB 6 LPM'},
  {id:2,lpm:6,ef:88,kw:10.4,btu:35486,m3h:1.00,marca:'BOSCH',ref:'BOSCH 6 LPM'},
  {id:3,lpm:8,ef:87,kw:13.0,btu:44358,m3h:1.26,marca:'CHALLENGER',ref:'CHALLENGER 8 LPM'},
  {id:4,lpm:8,ef:88,kw:14.5,btu:49476,m3h:1.40,marca:'BOSCH',ref:'BOSCH 8 LPM'},
  {id:5,lpm:10,ef:88,kw:19.5,btu:66537,m3h:1.88,marca:'CHALLENGER',ref:'CHALLENGER 10 LPM'},
  {id:6,lpm:10,ef:89,kw:20.5,btu:69949,m3h:1.98,marca:'HACEB',ref:'HACEB 10 LPM'},
  {id:7,lpm:10,ef:90,kw:20.0,btu:68243,m3h:1.93,marca:'RHEEM',ref:'RHEEM 10 LPM'},
  {id:8,lpm:11,ef:88,kw:19.5,btu:66537,m3h:1.88,marca:'BOSCH',ref:'BOSCH 11 LPM'},
  {id:9,lpm:12,ef:88,kw:24.0,btu:81891,m3h:2.32,marca:'HACEB',ref:'HACEB 12 LPM'},
  {id:10,lpm:12,ef:92,kw:23.5,btu:80185,m3h:2.27,marca:'CHALLENGER',ref:'CHALLENGER 12 LPM'},
  {id:11,lpm:14,ef:88,kw:24.0,btu:81891,m3h:2.32,marca:'BOSCH',ref:'BOSCH 14 LPM'},
  {id:12,lpm:16,ef:90,kw:31.0,btu:105776,m3h:3.00,marca:'RHEEM',ref:'RHEEM 16 LPM'},
  {id:13,lpm:17,ef:90,kw:36.5,btu:124543,m3h:3.53,marca:'RHEEM',ref:'RHEEM 17 LPM'},
  {id:14,lpm:18,ef:88,kw:38.0,btu:129661,m3h:3.67,marca:'BOSCH',ref:'BOSCH 18 LPM'},
  {id:15,lpm:21,ef:88,kw:45.0,btu:153546,m3h:4.35,marca:'BOSCH',ref:'BOSCH 21 LPM'},
  {id:16,lpm:23,ef:90,kw:44.0,btu:150134,m3h:4.25,marca:'RINNAI',ref:'RINNAI 23 LPM'},
  {id:17,lpm:26,ef:94,kw:52.0,btu:177431,m3h:5.02,marca:'BOSCH',ref:'BOSCH 26 LPM'},
];

const MAT_GAS_DATA = {
  'PE al PE D= 3/4"':{k:49,di:20},'PE al PE D= 1"':{k:49,di:25},
  'Acero Galv. D= 1/2"':{k:57.5,di:12.7},'Acero Galv. D= 3/4"':{k:57.5,di:19},
  'Acero Galv. D= 1"':{k:57.5,di:25.4},'Cobre Rígido D= 1/2"':{k:54.2,di:10.9},
  'Cobre Rígido D= 3/4"':{k:54.2,di:17.4},'Cobre Rígido D= 1"':{k:54.2,di:22.8},
};
const FS_GAS=[{min:1,max:2,fs:1.0},{min:3,max:5,fs:0.8},{min:6,max:10,fs:0.7},{min:11,max:20,fs:0.6},{min:21,max:999,fs:0.5}];
const getFs=n=>FS_GAS.find(f=>n>=f.min&&n<=f.max)?.fs||1;
const ACCS_GAS=[
  {id:'c90e',nm:'Codo 90° estándar',k:30},{id:'c90r',nm:'Codo 90° radio largo',k:20},
  {id:'tel',nm:'Tee línea (recto)',k:20},{id:'ter',nm:'Tee ramal (desviado)',k:20},
  {id:'bola',nm:'Válvula de bola ¼v',k:8},
];

const REDES=[
  {id:'san',lbl:'Red Sanitaria',   sub:'RAS D · Manning n=0.009',   ico:'♻️',g:false},
  {id:'ven',lbl:'Ventilación',     sub:'NTC 1500 §9 · D mín 1½"',  ico:'💨',g:false},
  {id:'ll', lbl:'Aguas Lluvias',   sub:'Método Racional · IDF',     ico:'🌧️',g:false},
  {id:'af', lbl:'Agua Fría',       sub:'NTC 1500 · Hazen-Williams', ico:'💧',g:false},
  {id:'ac', lbl:'Agua Caliente',   sub:'NTC 1500 · CPVC RDE 11',    ico:'🔥',g:false},
  {id:'gas',lbl:'Red de Gas',      sub:'NTC 3728 · Renouard',       ico:'⛽',g:true},
  {id:'ep', lbl:'Equipo Presión',  sub:'Bomba + recipiente vejiga', ico:'⚡',g:false},
  {id:'bom',lbl:'Bomba AR',        sub:'Aguas residuales presión',  ico:'⬆️',g:false},
  {id:'rec',lbl:'Recirculación AC',sub:'Solo si L > 15 m',          ico:'🔄',g:false},
  {id:'rci',lbl:'Contra Incendio', sub:'NSR-10 J · NFPA 13:2022',  ico:'🔴',g:false},
];

const TABS=[
  {id:'plano',  lbl:'Planos',      ico:'📐'},
  {id:'mats',   lbl:'Materiales',  ico:'📋'},
  {id:'apars',  lbl:'Aparatos',    ico:'🚿'},
  {id:'gas',    lbl:'Red de Gas',  ico:'⛽',gas:true},
  {id:'calent', lbl:'Calentadores',ico:'♨️',gas:true},
  {id:'valid',  lbl:'Validación',  ico:'✓'},
];

const MATERIALES = {
  af:  {lbl:'Agua Fría',       opts:['PVC presión','CPVC','Cobre rígido','Polipropileno PP-R']},
  ac:  {lbl:'Agua Caliente',   opts:['CPVC','Cobre rígido','Polipropileno PP-R','PEX']},
  san: {lbl:'Sanitaria',       opts:['PVC sanitario','Novatec','Hierro fundido','Concreto']},
  ll:  {lbl:'Aguas Lluvias',   opts:['PVC sanitario','Novatec','Hierro fundido','Concreto','Gres cerámico']},
  ven: {lbl:'Ventilación',     opts:['PVC sanitario','Novatec']},
  gas: {lbl:'Gas',             opts:['PE al PE','Polietileno PEAD','Cobre rígido','Cobre flexible','Acero galvanizado','Acero al carbón']},
  rci: {lbl:'Contra Incendio', opts:['Acero SCH 40','Acero SCH 10','Acero galvanizado','CPVC CPVC-CI','PVC C900']},
};

const MATS_DEFAULT=Object.fromEntries(Object.entries(MATERIALES).map(([k,v])=>[k,v.opts.map((o,i)=>({id:k+i,val:o}))]));
const USOS=['Vivienda unifamiliar','Vivienda multifamiliar','Comercial','Institucional','Mixto'];
const EMPRES=['EMAB - Floridablanca','Aguas de Bucaramanga','EAAB - Bogotá','EPM - Medellín','Otra'];
const TIPO_GAS=['Gas Natural (GN)','GLP Propano','GLP Butano'];

function calcRenouard(Q,L,Di,K,Pat,fs){
  const Qd=Q*fs;
  if(!Di||!L)return{dp:0,v:0,ok:true};
  const A=Math.PI*Math.pow(Di/2000,2);
  const v=Qd/(3600*A);
  const dp=48620*K*L*Math.pow(Qd,1.82)/(Pat*Math.pow(Di,4.82));
  return{dp:parseFloat(dp.toFixed(4)),v:parseFloat(v.toFixed(2)),ok:dp<=9.81&&v<=10};
}

function NumIn({val,onChange,cls='',w=52,step=0.01,min=0}){
  return <input type="number" className={`ni ${cls}`} style={{width:w}}
    value={val} step={step} min={min}
    onChange={e=>onChange(parseFloat(e.target.value)||0)}/>;
}

export default function DHIDROSAN(){
  const [tab,setTab]=useState('plano');
  const [sidebarOpen,setSidebarOpen]=useState(true);
  const [drag,setDrag]=useState(false);
  const [file,setFile]=useState(null);
  const [busy,setBusy]=useState(false);
  const [meta,setMeta]=useState(null);
  const [vals,setVals]=useState([]);
  const [redes,setRedes]=useState(['af','san','ll','ven','gas']);
  const [aps,setAps]=useState(APARATOS_DEF);
  const [calSel,setCalSel]=useState(null);
  const [mats,setMats]=useState(MATS_DEFAULT);
  const [matEdit,setMatEdit]=useState({key:null,newVal:''});

  const [proy,setProy]=useState({
    nombre:'Casa No. 26 CR Monte Real', dir:'CR 10 No. 25-40',
    mun:'Floridablanca', dep:'Santander',
    uso:'Vivienda unifamiliar', empresa:'EMAB - Floridablanca',
    p_red:'20', dot:'280',
    mat_af:'PVC presión', mat_ac:'CPVC', mat_rci:'Acero SCH 40',
    mat_san:'PVC sanitario', mat_ll:'PVC sanitario',
    mat_ven:'PVC sanitario', mat_gas:'PE al PE',
    tipo_gas:'Gas Natural (GN)',
    altitud:'959', p_atm:'90.32', temp:'23', dens:'0.67', p_min_red:'17',
  });

  const [nSotanos,setNSotanos]=useState(1);
  const [nPisos,setNPisos]=useState(2);
  const [altPiso,setAltPiso]=useState(3.10);
  const [altSotano,setAltSotano]=useState(3.00);
  const [nptPiso1,setNptPiso1]=useState(0.00);
  const [conCubierta,setConCubierta]=useState(true);

  const generarPisos=()=>{
    const lista=[];
    for(let i=nSotanos;i>=1;i--) lista.push({id:'s'+i,n:-i,npt:parseFloat((nptPiso1-(i*altSotano)).toFixed(2)),ok:false,tipo:'sotano'});
    for(let i=1;i<=nPisos;i++) lista.push({id:'p'+i,n:i,npt:parseFloat((nptPiso1+((i-1)*altPiso)).toFixed(2)),ok:false,tipo:'piso'});
    if(conCubierta) lista.push({id:'cub',n:99,npt:parseFloat((nptPiso1+(nPisos*altPiso)).toFixed(2)),ok:false,tipo:'cubierta'});
    setPisos(lista);
  };

  const [pisos,setPisos]=useState([
    {id:1,n:-1,npt:-3.00,ok:false,tipo:'sotano'},
    {id:2,n:1, npt: 0.00,ok:false,tipo:'piso'},
    {id:3,n:2, npt: 3.10,ok:false,tipo:'piso'},
    {id:4,n:99,npt: 6.20,ok:false,tipo:'cubierta'},
  ]);

  const [tramos,setTramos]=useState([
    {id:'RAG1',ini:'Cont',fin:'1',piso:1,mat:'PE al PE D= 1"',L:5.16,accs:{c90e:1,c90r:0,tel:0,ter:1,bola:1},n_ap:2},
    {id:'RAG2',ini:'1',fin:'2',piso:1,mat:'PE al PE D= 1"',L:2.10,accs:{c90e:1,c90r:0,tel:0,ter:1,bola:0},n_ap:1},
    {id:'RAG3',ini:'2',fin:'Cal',piso:1,mat:'PE al PE D= 1"',L:19.24,accs:{c90e:0,c90r:0,tel:0,ter:1,bola:1},n_ap:1},
  ]);

  const fileRef=useRef();
  const setP=(k,v)=>setProy(p=>({...p,[k]:v}));
  const updAp=(id,field,val)=>setAps(p=>p.map(a=>a.id===id?{...a,[field]:val}:a));
  const updTr=(id,field,val)=>setTramos(p=>p.map(t=>t.id===id?{...t,[field]:val}:t));
  const updAcc=(id,acc,val)=>setTramos(p=>p.map(t=>t.id===id?{...t,accs:{...t.accs,[acc]:val}}:t));

  const hidros=aps.filter(a=>a.grupo==='h');
  const gases=aps.filter(a=>a.grupo==='g');

  const tot={
    uc_af:aps.reduce((s,a)=>s+a.uc_af,0).toFixed(1),
    uc_ac:aps.reduce((s,a)=>s+a.uc_ac,0).toFixed(1),
    ud:aps.reduce((s,a)=>s+a.ud,0),
    qgas:gases.reduce((s,a)=>s+a.qgas,0).toFixed(2),
  };

  const totalPerd=tramos.reduce((s,t)=>{
    const matD=MAT_GAS_DATA[t.mat]||{k:49,di:25};
    const Le=ACCS_GAS.reduce((a,ac)=>a+(t.accs[ac.id]||0)*ac.k*matD.di/1000,0);
    const Q=gases.filter(g=>g.qgas>0).reduce((a,g)=>a+g.qgas,0);
    const fs=getFs(t.n_ap);
    const r=calcRenouard(Q,t.L+Le,matD.di,matD.k,parseFloat(proy.p_atm)||90.32,fs);
    return s+r.dp;
  },0);

  const analizar=useCallback((f)=>{
    setBusy(true);
    setVals([
      {id:'fmt',st:'idle',msg:'Verificando formato...'},
      {id:'pag',st:'idle',msg:'Contando páginas / plantas...'},
      {id:'esc',st:'idle',msg:'Detectando escala gráfica...'},
      {id:'cap',st:'idle',msg:'Identificando capas AF · AC · SAN · LL · VEN · GAS...'},
      {id:'npt',st:'idle',msg:'Leyendo cotas NPT por planta...'},
      {id:'hid',st:'idle',msg:'Reconociendo aparatos hidráulicos...'},
      {id:'gas',st:'idle',msg:'Detectando puntos de consumo gas...'},
    ]);
    const seq=[
      {d:350,id:'fmt',st:'ok',m:`Válido — ${(f.size/1024).toFixed(0)} KB`},
      {d:800,id:'pag',st:'ok',m:'4 páginas detectadas'},
      {d:1400,id:'esc',st:'warn',m:'Escala 1:75 — confirmar con barra gráfica'},
      {d:2000,id:'cap',st:'ok',m:'AF(azul) · AC(rojo) · SAN(naranja) · LL(cian) · VEN(verde) · GAS(amarillo)'},
      {d:2600,id:'npt',st:'ok',m:'NPT detectados según niveles configurados'},
      {d:3200,id:'hid',st:'ok',m:'18 aparatos hidráulicos detectados'},
      {d:3800,id:'gas',st:'warn',m:'5 puntos de gas — confirmar en editor'},
    ];
    seq.forEach(({d,id,st,m})=>setTimeout(()=>{
      setVals(p=>p.map(v=>v.id===id?{...v,st,msg:m}:v));
      if(id==='gas'){
        setBusy(false);
        setMeta({escala:'1:75',pags:4,ap_hid:18,ap_gas:5,pisos:4,area:'148 m²'});
        setPisos(p=>p.map(x=>({...x,ok:true})));
      }
    },d));
  },[]);

  const onDrop=useCallback((e)=>{
    e.preventDefault();setDrag(false);
    const f=e.dataTransfer?.files?.[0]||e.target?.files?.[0];
    if(!f)return;
    setFile(f);analizar(f);
  },[analizar]);

  const togRed=id=>setRedes(p=>p.includes(id)?p.filter(r=>r!==id):[...p,id]);

  const addPiso=()=>setPisos(prev=>{
    const pisosPOS=prev.filter(p=>p.n>0);
    const maxN=pisosPOS.length?Math.max(...pisosPOS.map(p=>p.n)):0;
    const ln=prev[prev.length-1]?.npt||0;
    return[...prev,{id:Date.now(),n:maxN+1,npt:parseFloat((ln+3.10).toFixed(2)),ok:false}];
  });

  const addSotano=()=>setPisos(prev=>{
    const pisoNEG=prev.filter(p=>p.n<0);
    const minN=pisoNEG.length?Math.min(...pisoNEG.map(p=>p.n)):0;
    const fn=prev[0]?.npt||0;
    return[{id:Date.now(),n:minN-1,npt:parseFloat((fn-3.00).toFixed(2)),ok:false},...prev];
  });

  const addTramo=()=>setTramos(p=>[...p,{
    id:`RAG${p.length+1}`,ini:String(p.length),fin:String(p.length+1),
    piso:1,mat:'PE al PE D= 1"',L:5,
    accs:{c90e:1,c90r:0,tel:0,ter:0,bola:1},n_ap:1,
  }]);

// ─── GENERAR EXCEL SANITARIO (MULTI-HOJAS) ──────────────────────────────
  function generarExcelSanitario() {
    const proyecto = {
      nombre: proy.nombre || "Proyecto",
      direccion: proy.dir || "",
      municipio: proy.mun || "",
      departamento: proy.dep || "",
      uso: proy.uso || "",
      empresa: proy.empresa || "",
      ingeniero: "Ing. Camilo Cardenas Chacon",
      normas: "NTC 1500 · RAS 2000 · NSR-10",
    };

    const n = CalcSan.MANNING_SAN;
    const S = 0.02;

    const hidros = aps.filter(a => a.grupo === "h");

    const tramosDef = [
      { tramo: "BAN-1", piso: 2, apsUD: { sif: 2, lvm: 2, san: 2, duc: 2 }, UD_otros: 0, desc_otros: "" },
      { tramo: "BAN-2", piso: 2, apsUD: { sif: 3, lvm: 2, san: 1, duc: 1, tin: 1 }, UD_otros: 0, desc_otros: "" },
      { tramo: "R-1",   piso: 1, apsUD: { sif: 6, lvm: 2, san: 1, lvp: 2, lvra: 1 }, UD_otros: 0, desc_otros: "", recibeDe: ["BAN-2"] },
      { tramo: "R-2",   piso: 1, apsUD: { sif: 1, lvm: 2, san: 2, duc: 1 }, UD_otros: 0, desc_otros: "" },
      { tramo: "R-3",   piso: 1, apsUD: {}, UD_otros: 0, desc_otros: "", recibeDe: ["BAN-1", "R-1", "R-2"] },
    ];

    if (pisos.some(p => p.n < 0)) {
      tramosDef.push({ tramo: "Sotano", piso: -1, apsUD: { sif: 3, lvm: 1, san: 1, duc: 1 }, UD_otros: 0, desc_otros: "" });
    }

    const udMap = {};
    hidros.forEach(a => { udMap[a.id] = a.ud; });

    const udByTramo = [];
    const calcResults = [];
    let UD_acumulados = {};

    tramosDef.forEach((t, idx) => {
      let UD_prop = 0;
      const propios = {};
      Object.entries(t.apsUD || {}).forEach(([key, cant]) => {
        const unitUD = udMap[key] || 2;
        propios[key] = cant * unitUD;
        UD_prop += cant * unitUD;
      });

      let UD_otr = 0;
      if (t.recibeDe) {
        t.recibeDe.forEach(id => {
          UD_otr += UD_acumulados[id] || 0;
        });
      }

      const UD_acum = UD_prop + UD_otr;
      UD_acumulados[t.tramo] = UD_acum;

      const numSalidas = Math.max(1, Object.values(t.apsUD || {}).reduce((s, v) => s + v, 0));

      udByTramo.push({
        tramo: t.tramo,
        piso: t.piso,
        propios,
        UD_propias: UD_prop,
        UD_otros: UD_otr,
        UD_acumulado: UD_acum,
        numSalidas,
      });

      calcResults.push(CalcSan.calcularTramoSanitario({
        tramo: t.tramo,
        piso: t.piso,
        UD_propias: UD_prop,
        UD_otros: UD_otr,
        numSalidas,
        pendiente: S,
        n,
      }));
    });

    const totalAps = {};
    const cantAps = {};
    tramosDef.forEach(t => {
      Object.entries(t.apsUD || {}).forEach(([key, cant]) => {
        cantAps[key] = (cantAps[key] || 0) + cant;
        totalAps[key] = (totalAps[key] || 0) + cant;
      });
    });
    const totalUD = Object.values(UD_acumulados).reduce((a, b) => Math.max(a, b), 0);

    // ═══ HOJA 1: CABEZOTE ═══
    const ws1_data = [
      ["CALCULO REDES SANITARIAS Y AGUAS LLUVIAS"],
      ["Proyecto:", proyecto.nombre, "", "", "Normas:", proyecto.normas],
      ["Direccion:", proyecto.direccion, "", "", "Ingeniero:", proyecto.ingeniero],
      ["Municipio:", proyecto.municipio, "", "", "Departamento:", proyecto.departamento],
      ["Uso:", proyecto.uso, "", "", "Empresa:", proyecto.empresa],
      ["Fecha:", new Date().toLocaleDateString()],
      ["", "", "", "", "", "", "", "", "DHIDROSAN KML 2026"],
    ];

    // ═══ HOJA 2: CALCULO UD ═══
    const apColumns = [
      { key: "sif", lbl: "Sifones", ud: 2 },
      { key: "lvm", lbl: "Lavamanos", ud: 2 },
      { key: "san", lbl: "Sanitarios", ud: 4 },
      { key: "duc", lbl: "Duchas", ud: 2 },
      { key: "lvra", lbl: "Lavadoras", ud: 4 },
      { key: "tin", lbl: "Tina", ud: 2 },
      { key: "lvp", lbl: "Lavaplatos", ud: 2 },
      { key: "lvro", lbl: "Lavadero", ud: 2 },
    ];

    const ws2_data = [
      ["CALCULO UNIDADES DE DESCARGA"],
      ["Proyecto:", proyecto.nombre],
      ["Normas:", proyecto.normas],
      [],
      ["TRAMO", "PISO",
        ...apColumns.map(c => `${c.lbl} (UD=${c.ud})`),
        "UD Parcial", "UD Acumulado"],
    ];

    udByTramo.forEach(t => {
      const row = [t.tramo, t.piso];
      apColumns.forEach(c => {
        row.push(t.propios[c.key] || 0);
      });
      row.push(t.UD_propias);
      row.push(t.UD_acumulado);
      ws2_data.push(row);
    });

    ws2_data.push([]);
    ws2_data.push(["TOTALES DE APARATOS"]);
    ws2_data.push(["Aparato", "N° Aparatos", "UD unitaria", "UD Total"]);
    apColumns.forEach(c => {
      const cant = cantAps[c.key] || 0;
      ws2_data.push([c.lbl, cant, c.ud, cant * c.ud]);
    });
    ws2_data.push(["", "", "TOTAL UD:", totalUD]);

    // ═══ HOJA 3: RED SANITARIA (Manning) ═══
    const ws3_data = [
      ["DISEÑO REDES SANITARIAS"],
      ["Proyecto:", proyecto.nombre],
      ["Normas:", proyecto.normas],
      ["Metodo:", "Manning · Hunter Rodriguez Diaz · NTC 1500"],
      [`n = ${n}`, `S = ${(S * 100).toFixed(2)}%`],
      [],
      ["TRAMO", "PISO", "UD Prop", "UD Otros", "UD Acum", "N° Sal", "Coef. K",
        "Q (L/s)", "n", "S (%)", "D calc (pulg)", "D diseño (pulg)", "D int (mm)",
        "Qo (L/s)", "Vo (m/s)", "Q/Qo", "V real (m/s)", "Cheq V",
        "Yc (mm)", "Yn (mm)", "Y/D", "Froude", "Tipo flujo",
        "Ymax (mm)", "Cheq Yn<Ymax", "Fza tract (kg/m²)", "Cheq τ≥0.15", "CUMPLE"],
    ];

    calcResults.forEach(r => {
      const q_Qo = r.Qo_Ls > 0 ? r.Q_Ls / r.Qo_Ls : 0;
      const hD = r.Dprop_mm > 0 ? r.Yn_mm / r.Dprop_mm : 0;
      ws3_data.push([
        r.tramo, r.piso, r.UD_propias, r.UD_otros, r.UD_acumulado,
        r.numSalidas, r.K, r.Q_Ls, r.n, (r.S * 100), r.Dcalc_pulg,
        r.Dprop_pulg, r.Dint_mm, r.Qo_Ls, r.Vo,
        parseFloat(q_Qo.toFixed(4)), r.V_real, r.verifVel ? "O.K." : "REV",
        r.Yc_mm, r.Yn_mm, parseFloat(hD.toFixed(4)),
        r.Fr, r.regime, r.Ymax_mm,
        r.verifYn ? "O.K." : "REV",
        r.fuerzaTractiva, r.verifTau ? "O.K." : "REV",
        r.cumple ? "CUMPLE" : "REV",
      ]);
    });

    // ═══ HOJA 4: BAJANTES Y VENTILACION ═══
    const ws4_data = [
      ["CHEQUEO CAPACIDAD BAJANTES AGUAS NEGRAS Y CALCULO TUBERIA DE VENTILACION"],
      ["Proyecto:", proyecto.nombre],
      ["r = 7/24 = 0.2917 (factor de llenado)"],
      [],
      ["Bajante", "Pisos", "UD Acum", "r", "Q (L/s)", "n",
        "D calc (pulg)", "D prop (pulg)", "Cheq Dcal<Dprop", "Q max Baj (L/s)",
        "Vt (m/s)", "Lt calc (m)", "Lt min (m)",
        "V aire (m/s)", "Q aire (L/s)", "Long. baj (m)",
        "D vent calc (pulg)", "D vent prop (pulg)"],
    ];

    const bajantes = tramosDef.filter(t => t.tramo.startsWith("BAN") || t.tramo === "Sotano");
    bajantes.forEach(t => {
      const udData = udByTramo.find(u => u.tramo === t.tramo);
      const rData = calcResults.find(r => r.tramo === t.tramo);
      if (udData && rData) {
        const bv = CalcSan.calcularBajanteVentilacion({
          bajante: t.tramo,
          pisos: t.piso < 0 ? `${Math.abs(t.piso)}-1` : "2-1",
          UD_acum: udData.UD_acumulado,
          r: 7 / 24,
          n,
          pendiente: S,
          longBajante_m: 3,
        });
        ws4_data.push([
          bv.bajante, bv.pisos, bv.UD_acum, bv.r, bv.Q_Ls, bv.n,
          bv.Dcalc_pulg, bv.Dprop_pulg, bv.chequeoDiam, bv.QmaxBajante,
          bv.Vt, bv.Lt_calc, bv.Lt_min,
          bv.V_aire, bv.Q_aire_Ls, bv.longBajante_m,
          bv.D_vent_calc_pulg, bv.D_vent_prop_pulg,
        ]);
      }
    });

    // ═══ HOJA 5: TUBERIAS ═══
    const ws5_data = [
      ["TUBERIAS SANITARIAS Y DE VENTILACION"],
      ["Presion de prueba: 0.35 MPa (50 PSI)"],
      [],
      ["--- Tuberias Sanitarias y Aguas Lluvias ---"],
      ["Diametro Nominal", "D ext (mm)", "D ext (pulg)", "D int (mm)", "Espesor (mm)", "Espesor (pulg)", "Peso (kg/m)"],
    ];
    CalcSan.TUBERIAS_SAN.forEach(t => {
      ws5_data.push([t.nominal, t.dExt, t.dExtPulg, t.dInt, t.espesor, t.espPulg, t.peso]);
    });

    ws5_data.push([]);
    ws5_data.push(["--- Tuberias de Ventilacion ---"]);
    ws5_data.push(["Diametro Nominal", "D ext (mm)", "D ext (pulg)", "D int (mm)", "Espesor (mm)", "Espesor (pulg)", "Peso (kg/m)"]);
    CalcSan.TUBERIAS_VENT.forEach(t => {
      ws5_data.push([t.nominal, t.dExt, t.dExtPulg, t.dInt, t.espesor, t.espPulg, t.peso]);
    });

    // ═══ CREAR WORKBOOK ═══
    const wb = XLSX.utils.book_new();

    const ws1 = XLSX.utils.aoa_to_sheet(ws1_data);
    ws1['!cols'] = [{ wch: 20 }, { wch: 30 }, { wch: 10 }, { wch: 10 }, { wch: 15 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(wb, ws1, "Cabezote");

    const ws2 = XLSX.utils.aoa_to_sheet(ws2_data);
    ws2['!cols'] = [
      { wch: 10 }, { wch: 6 },
      ...apColumns.map(() => ({ wch: 12 })),
      { wch: 12 }, { wch: 14 },
    ];
    XLSX.utils.book_append_sheet(wb, ws2, "1,Calculo UD");

    const ws3 = XLSX.utils.aoa_to_sheet(ws3_data);
    const col3Widths = [10, 6, 8, 8, 10, 8, 8, 10, 6, 8, 12, 12, 10, 10, 10, 8, 10, 8, 10, 10, 8, 8, 12, 10, 12, 10, 14, 10, 10];
    ws3['!cols'] = col3Widths.map(w => ({ wch: w }));
    XLSX.utils.book_append_sheet(wb, ws3, "2,Red Sanit y Lluvias VF");

    const ws4 = XLSX.utils.aoa_to_sheet(ws4_data);
    ws4['!cols'] = [10, 8, 10, 8, 10, 6, 12, 12, 14, 14, 10, 10, 10, 10, 10, 10, 14, 14];
    XLSX.utils.book_append_sheet(wb, ws4, "3,BAN y Ventilacion VF");

    const ws5 = XLSX.utils.aoa_to_sheet(ws5_data);
    ws5['!cols'] = [{ wch: 18 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 14 }, { wch: 14 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, ws5, "Tuberias");

    const nombreArchivo = (proyecto.nombre || "Proyecto").replace(/[^a-zA-Z0-9]/g, "_");
    XLSX.writeFile(wb, `Calculo_Redes_Sanitarias_${nombreArchivo}.xlsx`);
  }

  // ─── GENERAR EXCEL HIDRÁULICO ───────────────────────────────────────────
  function generarExcelHidraulico() {
    const proyecto = {
      nombre: proy.nombre || "Proyecto",
      direccion: proy.dir || "",
      municipio: proy.mun || "",
      departamento: proy.dep || "",
      uso: proy.uso || "",
      empresa: proy.empresa || "",
      ingeniero: "Ing. Camilo Cardenas Chacon",
      normas: "NTC 1500 · RAS 2000 · NSR-10",
    };

    const hidros = aps.filter(a => a.grupo === "h");
    const P_red = parseFloat(proy.p_red) || 20;

    // ─── Definir tramos RAF ───
    const tramosRAF = [
      { ramal: "RAF1", ini: "Duc", fin: "Mon", piso: 2, apsUC: { lvm: 0, san: 3, duc: 2, lvp: 0, tin: 0, lvra: 1, lvro: 0, nev: 0 }, UC_otros: 0, Lh: 23.13, Lv: 0, presionIni: P_red },
      { ramal: "Mon", ini: "P2", fin: "P1", piso: 2, apsUC: {}, UC_otros: 0, Lh: 3.50, Lv: 0, presionIni: null },
      { ramal: "RAF2", ini: "Lav", fin: "Mon", piso: 1, apsUC: { lvm: 0, san: 3, duc: 2, lvp: 1, tin: 0, lvra: 0, lvro: 1, nev: 0 }, UC_otros: 0, Lh: 23.88, Lv: 0, presionIni: null },
      { ramal: "RAF3", ini: "Mon", fin: "Con", piso: 1, apsUC: {}, UC_otros: 0, Lh: 6.84, Lv: 0, presionIni: null },
      { ramal: "RAF4", ini: "Mon", fin: "Cal", piso: 1, apsUC: {}, UC_otros: 0, Lh: 18.57, Lv: 0, presionIni: null },
      { ramal: "RED", ini: "---", fin: "CONT", piso: 0, apsUC: {}, UC_otros: 0, Lh: 10.0, Lv: 0, presionIni: null },
    ];

    // ─── Definir tramos RAC ───
    const tramosRAC = [
      { ramal: "RAC1", ini: "Cal", fin: "Lvm", piso: 1, apsUC: { duc: 2, lvp: 1, lvm: 1, tin: 1 }, UC_otros: 0, Lh: 16.93, Lv: 0, presionIni: null },
      { ramal: "RAC2", ini: "Duc", fin: "Mon", piso: 2, apsUC: { duc: 1, lvm: 1 }, UC_otros: 0, Lh: 19.55, Lv: 0, presionIni: null },
      { ramal: "RAC3", ini: "Duc", fin: "Mon", piso: 2, apsUC: { duc: 1, lvm: 1 }, UC_otros: 0, Lh: 11.36, Lv: 0, presionIni: null },
      { ramal: "RAC4", ini: "Mon", fin: "Cal", piso: 2, apsUC: {}, UC_otros: 0, Lh: 5.73, Lv: 0, presionIni: null },
    ];

    // ─── Calcular UC Acumulados para RAF ───
    const ucMap_AF = {};
    hidros.forEach(a => { ucMap_AF[a.id] = { af: a.uc_af, ac: a.uc_ac }; });

    let rafUCAcum = {};
    let rafResults = [];
    let rafUCRows = [];

    tramosRAF.forEach((t, idx) => {
      let UC_prop = 0;
      const propios = {};
      Object.entries(t.apsUC || {}).forEach(([key, cant]) => {
        const unitUC = ucMap_AF[key]?.af || 0;
        propios[key] = cant * unitUC;
        UC_prop += cant * unitUC;
      });

      let UC_otr = 0;
      if (idx > 0 && idx < 3) {
        // RAF2 recibe RAF1
      }

      const numSalidas = Math.max(1, Object.values(t.apsUC || {}).reduce((s, v) => s + v, 0) || 2);
      const K = CalcHid.factorSimultaneidad(numSalidas);
      const UC_acum = UC_prop + UC_otr;
      rafUCAcum[t.ramal] = UC_acum;

      rafUCRows.push({
        ramal: t.ramal,
        piso: t.piso,
        propios,
        UC_propias: UC_prop,
        UC_otros: UC_otr,
        UC_acumulado: UC_acum,
        Lh: t.Lh,
        numSalidas,
      });

      rafResults.push(CalcHid.calcularTramoHidraulico({
        ramal: t.ramal,
        nudoIni: t.ini,
        nudoFin: t.fin,
        piso: t.piso,
        UC_propias: UC_prop,
        UC_otros: UC_otr,
        numSalidas,
        Lh_m: t.Lh,
        Lv_m: t.Lv || 0,
        presionRed_mca: t.presionIni || P_red,
        material: 'PVC',
        tipo: 'AF',
      }));
    });

    // ─── Calcular UC Acumulados para RAC ───
    let racUCAcum = {};
    let racResults = [];
    let racUCRows = [];

    tramosRAC.forEach((t, idx) => {
      let UC_prop = 0;
      const propios = {};
      Object.entries(t.apsUC || {}).forEach(([key, cant]) => {
        const unitUC = ucMap_AF[key]?.ac || 0;
        propios[key] = cant * unitUC;
        UC_prop += cant * unitUC;
      });

      let UC_otr = 0;
      if (idx === 3) {
        UC_otr = (racUCAcum['RAC2'] || 0) + (racUCAcum['RAC3'] || 0);
      }

      const numSalidas = Math.max(1, Object.values(t.apsUC || {}).reduce((s, v) => s + v, 0) || 2);
      const K = CalcHid.factorSimultaneidad(numSalidas);
      const UC_acum = UC_prop + UC_otr;
      racUCAcum[t.ramal] = UC_acum;

      racUCRows.push({
        ramal: t.ramal,
        piso: t.piso,
        propios,
        UC_propias: UC_prop,
        UC_otros: UC_otr,
        UC_acumulado: UC_acum,
        Lh: t.Lh,
        numSalidas,
      });

      racResults.push(CalcHid.calcularTramoHidraulico({
        ramal: t.ramal,
        nudoIni: t.ini,
        nudoFin: t.fin,
        piso: t.piso,
        UC_propias: UC_prop,
        UC_otros: UC_otr,
        numSalidas,
        Lh_m: t.Lh,
        Lv_m: t.Lv || 0,
        presionRed_mca: P_red,
        material: 'CPVC',
        tipo: 'AC',
      }));
    });

    // ═══ HOJA 1: CABEZOTE ═══
    const ws1_data = [
      ["CALCULO RED HIDRAULICA AF Y AC"],
      ["Proyecto:", proyecto.nombre, "", "", "Normas:", proyecto.normas],
      ["Direccion:", proyecto.direccion, "", "", "Ingeniero:", proyecto.ingeniero],
      ["Municipio:", proyecto.municipio, "", "", "Departamento:", proyecto.departamento],
      ["Uso:", proyecto.uso, "", "", "Empresa:", proyecto.empresa],
      ["Fecha:", new Date().toLocaleDateString()],
      ["", "", "", "", "", "", "", "", "DHIDROSAN KML 2026"],
    ];

    // ═══ HOJA 2: UC AGUA CALIENTE ═══
    const acColumns = [
      { key: "duc", lbl: "Duchas", uc: 1.0 },
      { key: "lvm", lbl: "Lavamanos", uc: 0.5 },
      { key: "lvp", lbl: "Lavaplatos", uc: 1.0 },
      { key: "tin", lbl: "Tina", uc: 1.0 },
      { key: "lvra", lbl: "Lavadora", uc: 1.0 },
      { key: "lvro", lbl: "Lavadero", uc: 1.0 },
    ];

    const ws2_data = [
      ["CALCULO UNIDADES DE CONSUMO AGUA CALIENTE"],
      ["Proyecto:", proyecto.nombre],
      ["Normas:", proyecto.normas],
      [],
      ["Tramo", "Piso", ...acColumns.map(c => `${c.lbl} (UC=${c.uc})`), "UC Parcial", "UC Acumulado", "Long Lh (m)", "N° Sal. Simult."],
    ];

    racUCRows.forEach(t => {
      const row = [t.ramal, t.piso];
      acColumns.forEach(c => { row.push(t.propios[c.key] || 0); });
      row.push(t.UC_propias, t.UC_acumulado, t.Lh, t.numSalidas);
      ws2_data.push(row);
    });

    ws2_data.push([]);
    ws2_data.push(["APARATOS — NTC 1500"]);
    ws2_data.push(["Aparato", "Tipo Control", "UC Agua Fria", "UC Agua Cal.", "UC Total"]);
    CalcHid.APARATOS_UC.forEach(a => {
      ws2_data.push([a.nombre, "", a.uc_af || "—", a.uc_ac || "—", ((a.uc_af || 0) + (a.uc_ac || 0)) > 0 ? parseFloat(((a.uc_af || 0) + (a.uc_ac || 0)).toFixed(2)) : "—"]);
    });

    // ═══ HOJA 3: UC AGUA FRIA ═══
    const afColumns = [
      { key: "san", lbl: "Inodoro", uc: 2.2 },
      { key: "lvm", lbl: "Lavamanos", uc: 0.5 },
      { key: "duc", lbl: "Ducha", uc: 1.0 },
      { key: "lvp", lbl: "Lavaplatos", uc: 1.0 },
      { key: "tin", lbl: "Tina", uc: 1.0 },
      { key: "lvra", lbl: "Lavadora", uc: 1.0 },
      { key: "lvro", lbl: "Lavadero", uc: 0.75 },
      { key: "nev", lbl: "Nevera", uc: 0.5 },
    ];

    const ws3_data = [
      ["CALCULO UNIDADES DE CONSUMO AGUA FRIA"],
      ["Proyecto:", proyecto.nombre],
      ["Normas:", proyecto.normas],
      [],
      ["Tramo", "Piso", ...afColumns.map(c => `${c.lbl} (UC=${c.uc})`), "UC Parcial", "UC Acumulado", "Long Lh (m)", "N° Sal. Simult."],
    ];

    rafUCRows.forEach(t => {
      const row = [t.ramal, t.piso];
      afColumns.forEach(c => { row.push(t.propios[c.key] || 0); });
      row.push(t.UC_propias, t.UC_acumulado, t.Lh, t.numSalidas);
      ws3_data.push(row);
    });

    // ═══ HOJA 4: CALCULO RAF ═══
    const ws4_data = [
      ["DISEÑO RED HIDRAULICA — AGUA FRIA"],
      ["Proyecto:", proyecto.nombre],
      ["Normas:", proyecto.normas],
      ["Metodo:", "Hazen-Williams · Hunter Rodriguez Diaz · NTC 1500"],
      ["Material:", "PVC Presion RDE 21 · C = 150"],
      [`P red = ${P_red} m.c.a.`],
      [],
      ["Ramal", "INI", "FIN", "Piso", "UC Prop", "UC Otros", "UC Acum", "N° Sal", "Coef. K",
        "Q (L/s)", "Diam. diseño", "D int (mm)", "Material", "C (H-W)",
        "V (mm/s)", "Lh (m)", "Lv (m)", "Le (m)", "L total (m)",
        "Hf (m)", "dZ (m)", "P ini (mca)", "P fin (mca)", "Verif V", "Verif P"],
    ];

    rafResults.forEach(r => {
      ws4_data.push([
        r.ramal, r.nudoIni, r.nudoFin, r.piso,
        r.UC_propias, r.UC_otros, r.UC_acumulado, r.numSalidas, r.K,
        r.Q_Ls, r.diamNominal, r.D_int_mm, r.material, r.C,
        r.V_mms, r.Lh_m, r.Lv_m, r.Le_m, r.L_total,
        r.hf_m, r.deltaZ_m, r.P_ini_mca, r.P_fin_mca,
        r.verifV.cumple ? "O.K." : "REV",
        r.verifP.cumple ? "O.K." : "REV",
      ]);
    });

    ws4_data.push([]);
    ws4_data.push(["PRESIONES MINIMAS Y MAXIMAS POR APARATO (NTC 1500)"]);
    ws4_data.push(["Aparato", "Sigla", "P min (mca)", "P max (mca)"]);
    CalcHid.APARATOS_UC.forEach(a => {
      if (a.uc_af > 0) ws4_data.push([a.nombre, a.sigla, a.pmin, a.pmax]);
    });

    // ═══ HOJA 5: CALCULO RAC ═══
    const ws5_data = [
      ["DISEÑO RED HIDRAULICA — AGUA CALIENTE"],
      ["Proyecto:", proyecto.nombre],
      ["Normas:", proyecto.normas],
      ["Metodo:", "Hazen-Williams · Hunter Rodriguez Diaz · NTC 1500"],
      ["Material:", "CPVC RDE 11 · C = 150"],
      [`P red = ${P_red} m.c.a.`],
      [],
      ["Ramal", "INI", "FIN", "Piso", "UC Prop", "UC Otros", "UC Acum", "N° Sal", "Coef. K",
        "Q (L/s)", "Diam. diseño", "D int (mm)", "Material", "C (H-W)",
        "V (mm/s)", "Lh (m)", "Lv (m)", "Le (m)", "L total (m)",
        "Hf (m)", "dZ (m)", "P ini (mca)", "P fin (mca)", "Verif V", "Verif P"],
    ];

    racResults.forEach(r => {
      ws5_data.push([
        r.ramal, r.nudoIni, r.nudoFin, r.piso,
        r.UC_propias, r.UC_otros, r.UC_acumulado, r.numSalidas, r.K,
        r.Q_Ls, r.diamNominal, r.D_int_mm, r.material, r.C,
        r.V_mms, r.Lh_m, r.Lv_m, r.Le_m, r.L_total,
        r.hf_m, r.deltaZ_m, r.P_ini_mca, r.P_fin_mca,
        r.verifV.cumple ? "O.K." : "REV",
        r.verifP.cumple ? "O.K." : "REV",
      ]);
    });

    ws5_data.push([]);
    ws5_data.push(["SELECCION DE CALENTADOR"]);
    ws5_data.push(["Aparato", "Cantidad", "UC unit.", "UC Total"]);
    const calAps = [
      { nombre: "Duchas", cant: 4, uc: 1 },
      { nombre: "Lavamanos", cant: 5, uc: 0.5 },
      { nombre: "Tina", cant: 1, uc: 1 },
      { nombre: "Lavadora", cant: 1, uc: 1 },
      { nombre: "Lavaplatos", cant: 2, uc: 1 },
    ];
    let totalUC_AC = 0;
    calAps.forEach(a => {
      const ucTotal = a.cant * a.uc;
      totalUC_AC += ucTotal;
      ws5_data.push([a.nombre, a.cant, a.uc, ucTotal]);
    });
    ws5_data.push(["", "", "Total UC AC:", totalUC_AC]);

    const K_cal = CalcHid.factorSimultaneidad(calAps.length);
    const Q_cal_Ls = CalcHid.caudalHunterLPS(totalUC_AC, K_cal);
    const Q_cal_LPM = Q_cal_Ls * 60;
    const K_ajuste = 0.5;
    const Q_ajuste_LPM = Q_cal_LPM * K_ajuste;
    ws5_data.push([]);
    ws5_data.push(["Caudal probable:", `${Q_cal_Ls.toFixed(3)} L/s = ${Q_cal_LPM.toFixed(2)} GPM = ${(Q_cal_LPM * 3.785).toFixed(2)} LPM`]);
    ws5_data.push(["Factor simultaneidad K:", K_cal.toFixed(4)]);
    ws5_data.push(["Caudal ajustado:", `${Q_ajuste_LPM.toFixed(2)} LPM`]);
    ws5_data.push(["Recomendacion:", "Calentador >= 20 LPM — Paso Directo Gas Natural"]);

    // ═══ HOJA 6: BASE DATOS ═══
    const ws6_data = [
      ["BASE DE DATOS — APARATOS, TUBERIAS Y CONTADORES"],
      [],
      ["Aparatos Sanitarios — NTC 1500"],
      ["Aparato", "Tipo Control", "UC AF", "UC AC", "UD", "P min (mca)", "P max (mca)"],
    ];
    CalcHid.APARATOS_UC.forEach(a => {
      ws6_data.push([a.nombre, "", a.uc_af || "—", a.uc_ac || "—", a.ud, a.pmin, a.pmax]);
    });

    ws6_data.push([]);
    ws6_data.push(["Diametros Comerciales — AGUA FRIA (PVC)"]);
    ws6_data.push(["Diametro Comercial", "pulg", "D interno (mm)", "D externo (mm)"]);
    CalcHid.DIAMETROS_AF.forEach(d => {
      ws6_data.push([d.nominal, d.pulg, d.dInt, d.dExt]);
    });

    ws6_data.push([]);
    ws6_data.push(["Diametros Comerciales — AGUA CALIENTE (CPVC)"]);
    ws6_data.push(["Diametro Comercial", "pulg", "D interno (mm)", "D externo (mm)"]);
    CalcHid.DIAMETROS_AC.forEach(d => {
      ws6_data.push([d.nominal, d.pulg, d.dInt, d.dExt]);
    });

    ws6_data.push([]);
    ws6_data.push(["Contadores — Caudales Nominales"]);
    ws6_data.push(["Diametro (pulg)", "Qn (L/s)"]);
    CalcHid.CONTADORES.forEach(c => {
      ws6_data.push([c.diaPulg, c.qn_lps]);
    });

    // ═══ HOJA 7: LONGITUD EQUIVALENTE ═══
    const ws7_data = [
      ["LONGITUDES EQUIVALENTES DE ACCESORIOS — PVC C=150"],
      [],
      ["Accesorio", "D=1/2\"", "D=3/4\"", "D=1\"", "D=1-1/2\"", "D=2\"", "D=3\"", "D=4\""],
    ];
    CalcHid.LE_ACCESORIOS.forEach(a => {
      ws7_data.push([a.nombre, ...a.le]);
    });

    // ═══ HOJA 8: CALCULO TR ═══
    const habitantes = 6;
    const dotacion = parseFloat(proy.dot) || 280;
    const calcTR = CalcHid.calcularConsumoTR(habitantes, dotacion, 0, 0, 0);

    const ws8_data = [
      ["AGUA POTABLE — CALCULO DE CONSUMO TOTAL"],
      ["Proyecto:", proyecto.nombre],
      [],
      ["Ubicacion / Tipo", "Unidad", "Consumo (Lt/Hab/dia)", "Total (Lt/dia)"],
      ["Habitantes Fijos", habitantes, dotacion, calcTR.q_fijos],
      ["Piscinas (Adultos)", "—", "10 Lt/m2/dia", calcTR.q_piscina],
      ["Zonas Verdes", "—", "2 Lt/m2/dia", calcTR.q_verdes],
      ["Otros", "—", "—", calcTR.q_otros],
      ["", "", "SUBTOTAL", calcTR.total_diario],
      ["", "", "Q (lps)", calcTR.Q_lps],
    ];

    // ═══ CREAR WORKBOOK ═══
    const wb = XLSX.utils.book_new();

    const ws1 = XLSX.utils.aoa_to_sheet(ws1_data);
    ws1['!cols'] = [{ wch: 20 }, { wch: 30 }, { wch: 10 }, { wch: 10 }, { wch: 15 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(wb, ws1, "Cabezote");

    const ws2 = XLSX.utils.aoa_to_sheet(ws2_data);
    ws2['!cols'] = [{ wch: 10 }, { wch: 6 }, ...acColumns.map(() => ({ wch: 14 })), { wch: 12 }, { wch: 14 }, { wch: 14 }, { wch: 10 }];
    XLSX.utils.book_append_sheet(wb, ws2, "UC Agua Caliente");

    const ws3 = XLSX.utils.aoa_to_sheet(ws3_data);
    ws3['!cols'] = [{ wch: 10 }, { wch: 6 }, ...afColumns.map(() => ({ wch: 14 })), { wch: 12 }, { wch: 14 }, { wch: 14 }, { wch: 10 }];
    XLSX.utils.book_append_sheet(wb, ws3, "UC Agua Fria");

    const ws4 = XLSX.utils.aoa_to_sheet(ws4_data);
    const col4w = [10, 6, 6, 6, 8, 8, 10, 8, 8, 10, 14, 10, 10, 6, 10, 10, 8, 8, 10, 10, 8, 10, 10, 8, 8];
    ws4['!cols'] = col4w.map(w => ({ wch: w }));
    XLSX.utils.book_append_sheet(wb, ws4, "Calculo RAF VF");

    const ws5 = XLSX.utils.aoa_to_sheet(ws5_data);
    ws5['!cols'] = col4w.map(w => ({ wch: w }));
    XLSX.utils.book_append_sheet(wb, ws5, "Calculo RAC VF");

    const ws6 = XLSX.utils.aoa_to_sheet(ws6_data);
    ws6['!cols'] = [{ wch: 24 }, { wch: 14 }, { wch: 10 }, { wch: 10 }, { wch: 6 }, { wch: 14 }, { wch: 14 }];
    XLSX.utils.book_append_sheet(wb, ws6, "Base Datos");

    const ws7 = XLSX.utils.aoa_to_sheet(ws7_data);
    ws7['!cols'] = [{ wch: 28 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 12 }, { wch: 8 }, { wch: 8 }, { wch: 8 }];
    XLSX.utils.book_append_sheet(wb, ws7, "Longitud Equivalente");

    const ws8 = XLSX.utils.aoa_to_sheet(ws8_data);
    ws8['!cols'] = [{ wch: 24 }, { wch: 10 }, { wch: 18 }, { wch: 14 }];
    XLSX.utils.book_append_sheet(wb, ws8, "Calculo TR");

    const nombreArchivo = (proyecto.nombre || "Proyecto").replace(/[^a-zA-Z0-9]/g, "_");
    XLSX.writeFile(wb, `Calculo_RHidraulica_AF_AC_${nombreArchivo}.xlsx`);
  }

  return(
    <div className="dhidrosan-wrapper" style={{height:'100%',display:'flex',flexDirection:'column',overflow:'hidden'}}>
      <style>{G}</style>
      <div className="app">

        {/* ── TABS ── */}
        <div className="nav">
          {TABS.map(t=>(
            <div key={t.id} className={`ntab ${tab===t.id?'on':''} ${t.gas?'gas-tab':''}`}
              onClick={()=>setTab(t.id)}>
              <span className="ntab-ico">{t.ico}</span>
              {t.lbl}
              {t.id==='apars'&&<span className="nbadge">{aps.length}</span>}
              {t.id==='gas'&&<span className="nbadge">{tramos.length} tramos</span>}
              {t.id==='calent'&&<span className="nbadge">{CALENTADORES.length}</span>}
            </div>
          ))}
        </div>

        <div className="layout">
          {/* ══ SIDEBAR TOGGLE (when closed) ══ */}
          {!sidebarOpen&&<div onClick={()=>setSidebarOpen(true)} style={{width:28,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',background:'var(--bg2)',borderRight:'1px solid var(--line)',flexShrink:0,color:'var(--txt3)',fontSize:'14px',transition:'all .15s'}}>▶</div>}
          {/* ══ SIDEBAR ══ */}
          <div className="sb" style={{width:sidebarOpen?360:0,minWidth:0,transition:'width .2s',flexShrink:0}}>
          {sidebarOpen&&(<div style={{minWidth:360,height:'100%',display:'flex',flexDirection:'column',overflow:'hidden auto'}}>
          <div style={{display:'flex',justifyContent:'flex-end',padding:'6px 8px',borderBottom:'1px solid var(--line)',background:'var(--bg2)'}}>
            <span onClick={()=>setSidebarOpen(false)} style={{cursor:'pointer',fontSize:'16px',color:'var(--txt3)',lineHeight:1}}>◀</span>
          </div>

            {/* Proyecto */}
            <div className="sb-sec">
              <div className="sb-hdr">Proyecto</div>
              <div className="f"><label>Nombre</label>
                <input value={proy.nombre} onChange={e=>setP('nombre',e.target.value)}/></div>
              <div className="f"><label>Dirección</label>
                <input value={proy.dir} onChange={e=>setP('dir',e.target.value)}/></div>
              <div className="f2">
                <div className="f"><label>Municipio</label>
                  <input value={proy.mun} onChange={e=>setP('mun',e.target.value)}/></div>
                <div className="f"><label>Dpto.</label>
                  <input value={proy.dep} onChange={e=>setP('dep',e.target.value)}/></div>
              </div>
              <div className="f"><label>Uso</label>
                <select value={proy.uso} onChange={e=>setP('uso',e.target.value)}>
                  {USOS.map(u=><option key={u}>{u}</option>)}</select></div>
              <div className="f"><label>Empresa prestadora</label>
                <select value={proy.empresa} onChange={e=>setP('empresa',e.target.value)}>
                  {EMPRES.map(u=><option key={u}>{u}</option>)}</select></div>
              <div className="f2">
                <div className="f"><label>P red (m.c.a.)</label>
                  <input type="number" value={proy.p_red} onChange={e=>setP('p_red',e.target.value)}/></div>
                <div className="f"><label>Dotación (L/h/d)</label>
                  <input type="number" value={proy.dot} onChange={e=>setP('dot',e.target.value)}/></div>
              </div>
            </div>

            {/* Materiales */}
            <div className="sb-sec">
              <div className="sb-hdr">Materiales por red</div>
              {Object.entries(MATERIALES).map(([key,{lbl,opts}])=>(
                <div key={key} className="f">
                  <label>{lbl}</label>
                  <select value={proy[`mat_${key}`]||opts[0]}
                    onChange={e=>setP(`mat_${key}`,e.target.value)}>
                    {opts.map(m=><option key={m}>{m}</option>)}
                  </select>
                </div>
              ))}
            </div>

            {/* Redes */}
            <div className="sb-sec">
              <div className="sb-hdr">Redes a calcular</div>
              <div className="tg-grid">
                {REDES.map(r=>(
                  <div key={r.id}
                    className={`tg ${redes.includes(r.id)?'on':''} ${redes.includes(r.id)&&r.g?'gtg':''}`}
                    onClick={()=>togRed(r.id)}>
                    <div className="tg-dot"/>
                    <span style={{fontSize:13}}>{r.ico}</span>
                    <div style={{flex:1}}>
                      <div className="tg-nm">{r.lbl}</div>
                      <div className="tg-sb">{r.sub}</div>
                    </div>
                    {redes.includes(r.id)&&<span className="tg-on">ON</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Pisos */}
            <div className="sb-sec">
              <div className="sb-hdr">Niveles del proyecto</div>
              <div style={{background:'var(--bg)',border:'1px solid rgba(37,99,235,.25)',borderRadius:'var(--r)',padding:'9px',marginBottom:8}}>
                <div style={{fontFamily:'var(--mono)',fontSize:12,color:'var(--acc2)',marginBottom:8,textTransform:'uppercase',fontWeight:600}}>Generador</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:5,marginBottom:5}}>
                  <div className="f" style={{marginBottom:0}}><label>N° sótanos</label><input type="number" min="0" max="10" value={nSotanos} style={{textAlign:'center'}} onChange={e=>setNSotanos(Math.max(0,parseInt(e.target.value)||0))}/></div>
                  <div className="f" style={{marginBottom:0}}><label>N° pisos</label><input type="number" min="1" max="50" value={nPisos} style={{textAlign:'center'}} onChange={e=>setNPisos(Math.max(1,parseInt(e.target.value)||1))}/></div>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:5,marginBottom:5}}>
                  <div className="f" style={{marginBottom:0}}><label>H. entrepiso</label><input type="number" step="0.05" value={altPiso} style={{textAlign:'center'}} onChange={e=>setAltPiso(parseFloat(e.target.value)||3.10)}/></div>
                  <div className="f" style={{marginBottom:0}}><label>H. sótano</label><input type="number" step="0.05" value={altSotano} style={{textAlign:'center'}} onChange={e=>setAltSotano(parseFloat(e.target.value)||3.00)}/></div>
                </div>
                <div className="f" style={{marginBottom:6}}><label>NPT Piso 1 (m)</label><input type="number" step="0.01" value={nptPiso1} style={{textAlign:'center'}} onChange={e=>setNptPiso1(parseFloat(e.target.value)||0)}/></div>
                <label style={{display:'flex',alignItems:'center',gap:5,fontFamily:'var(--mono)',fontSize:9,color:'var(--txt2)',cursor:'pointer',marginBottom:7}}>
                  <input type="checkbox" checked={conCubierta} onChange={e=>setConCubierta(e.target.checked)}/>Incluir cubierta
                </label>
                <button onClick={generarPisos} style={{width:'100%',padding:'6px',background:'var(--acc)',border:'none',borderRadius:'var(--r)',color:'#fff',fontWeight:600,fontSize:11,cursor:'pointer'}}> Generar niveles</button>
              </div>
              {[...pisos].sort((a,b)=>a.n-b.n).map(p=>(
                <div key={p.id} className="piso-r">
                  <span className={p.tipo==='cubierta'?'piso-tag cub':p.n<0?'piso-tag sot':'piso-tag'}>{p.tipo==='cubierta'?'Cubierta':p.n<0?'Sótano '+Math.abs(p.n):'Piso '+p.n}</span>
                  <input type="number" step="0.01" value={p.npt} className="npt-in"
                    onChange={e=>setPisos(prev=>prev.map(x=>
                      x.id===p.id?{...x,npt:parseFloat(e.target.value)||0}:x))}/>
                  <span style={{fontFamily:'var(--mono)',fontSize:8,color:'var(--txt3)'}}>m</span>
                  <div className={`pdot ${p.ok?'ok':''}`}/>
                </div>
              ))}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:5,marginTop:4}}>
                <button className="btn-xs" onClick={addSotano}>+ Sótano</button>
                <button className="btn-xs" onClick={addPiso}>+ Piso</button>
              </div>
            </div>
          </div>)}
          </div>

          {/* ══ CONTENT ══ */}
          <div className="content">

            {/* TAB MATERIALES */}
            {tab==='mats'&&(
              <div className="fu" style={{display:'flex',flexDirection:'column',gap:12}}>
                <div className="ib info"><span>ℹ</span><span>Edite, agregue o elimine tipos de material por red.</span></div>
                {Object.entries(mats).map(([key,items])=>{
                  var inf={af:{l:'Agua Fría',c:'var(--acc2)'},ac:{l:'Agua Caliente',c:'var(--ac)'},san:{l:'Sanitaria',c:'var(--san)'},ll:{l:'Aguas Lluvias',c:'var(--ll)'},ven:{l:'Ventilación',c:'var(--ven)'},gas:{l:'Gas',c:'var(--gas)'},rci:{l:'Contra Incendio',c:'#F87171'}};
                  var nfo=inf[key]||{l:key,c:'var(--txt2)'};
                  return(
                    <div key={key} className="card">
                      <div className="card-h">
                        <span className="card-t"><span style={{width:9,height:9,borderRadius:'50%',background:nfo.c,display:'inline-block',marginRight:6}}/>{nfo.l}</span>
                        <span className="card-s">{items.length} tipos</span>
                      </div>
                      <div style={{overflowX:'auto'}}>
                        <table className="tbl">
                          <thead><tr><th style={{width:32,textAlign:'center'}}>#</th><th>Material</th><th style={{width:90,textAlign:'center'}}>Acción</th></tr></thead>
                          <tbody>
                            {items.map((item,ix)=>(
                              <tr key={item.id}>
                                <td style={{textAlign:'center',fontFamily:'var(--mono)',fontSize:9,color:'var(--txt3)'}}>{ix+1}</td>
                                <td><input className="ni" style={{width:'100%',textAlign:'left'}} value={item.val}
                                  onChange={e=>setMats(prev=>({...prev,[key]:prev[key].map(x=>x.id===item.id?{...x,val:e.target.value}:x)}))}/></td>
                                <td style={{textAlign:'center'}}>
                                  <button onClick={()=>{if(items.length<=1){alert('Mínimo 1');return;}setMats(prev=>({...prev,[key]:prev[key].filter(x=>x.id!==item.id)}));}}
                                    style={{background:'var(--err-bg)',border:'1px solid var(--err-b)',borderRadius:'var(--r)',color:'var(--err)',padding:'2px 8px',fontSize:10,cursor:'pointer'}}>✕</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div style={{padding:'9px 13px',background:'var(--bg3)',borderTop:'1px solid var(--line)',display:'flex',gap:8,alignItems:'center'}}>
                        <input className="ni" style={{flex:1,textAlign:'left'}} placeholder={'Nuevo — '+nfo.l+'...'}
                          value={matEdit.key===key?matEdit.newVal:''}
                          onFocus={()=>setMatEdit({key:key,newVal:matEdit.key===key?matEdit.newVal:''})}
                          onChange={e=>setMatEdit({key:key,newVal:e.target.value})}/>
                        <button onClick={()=>{if(!matEdit.newVal.trim()||matEdit.key!==key)return;setMats(prev=>({...prev,[key]:[...prev[key],{id:key+Date.now(),val:matEdit.newVal.trim()}]}));setMatEdit({key:null,newVal:''}); }}
                          style={{padding:'5px 12px',background:'var(--acc)',border:'none',borderRadius:'var(--r)',color:'#fff',fontSize:11,cursor:'pointer',fontWeight:500}}>+ Agregar</button>
                      </div>
                      <div style={{padding:'5px 13px',background:'var(--bg)',borderTop:'1px solid var(--line)',textAlign:'right'}}>
                        <button onClick={()=>{if(!window.confirm('Restaurar?'))return;setMats(prev=>({...prev,[key]:MATERIALES[key].opts.map((o,ii)=>({id:key+ii,val:o}))}));}}
                          style={{background:'none',border:'none',cursor:'pointer',color:'var(--txt3)',fontSize:9}}>↺ Restaurar defaults</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB PLANOS */}
            {tab==='plano'&&(
              <div className="tab-content">
                <div className="card fu" style={{flex:1,display:'flex',flexDirection:'column'}}>
                  <div className="card-h">
                    <span className="card-t">📐 Carga de planos</span>
                    <span className="card-s">PDF multipágina · PNG/JPG por planta</span>
                  </div>
                  <div className="card-b" style={{flex:1,display:'flex',flexDirection:'column'}}>
                    {!file?(
                      <div className={`dz ${drag?'drag':''}`}
                        onDragOver={e=>{e.preventDefault();setDrag(true)}}
                        onDragLeave={()=>setDrag(false)}
                        onDrop={onDrop}
                        onClick={()=>fileRef.current?.click()}>
                        <input ref={fileRef} type="file" accept=".pdf,.png,.jpg"
                          style={{display:'none'}} onChange={onDrop}/>
                        <div className="dz-ico">📐</div>
                        <div className="dz-t">SUBIR PLANO</div>
                        <div className="dz-s">
                          PDF con todas las plantas — AF · AC · SAN · LL · VEN · GAS<br/>
                          Una página por nivel · Escala y cotas NPT requeridas
                        </div>
                        <div style={{display:'flex',gap:5,flexWrap:'wrap',justifyContent:'center',marginTop:4}}>
                          {['PDF multipágina','PNG por piso','Escala 1:50·75·100','Capas por color'].map(t=>(
                            <span key={t} className="pill">{t}</span>
                          ))}
                        </div>
                      </div>
                    ):(
                      <div style={{display:'flex',flexDirection:'column',gap:8}}>
                        <div style={{display:'flex',alignItems:'center',gap:10,padding:'9px 12px',background:'var(--bg3)',borderRadius:'var(--r2)',border:'1px solid var(--line)'}}>
                          <span style={{fontSize:18}}>📄</span>
                          <span style={{fontFamily:'var(--mono)',fontSize:10,flex:1}}>{file.name}</span>
                          <span style={{fontFamily:'var(--mono)',fontSize:9,color:'var(--txt3)'}}>{(file.size/1024).toFixed(0)} KB</span>
                          <button className="btn btn-ghost" style={{padding:'3px 9px',fontSize:9}}
                            onClick={()=>{setFile(null);setMeta(null);setVals([]);setPisos(p=>p.map(x=>({...x,ok:false})))}}>✕</button>
                        </div>
                        {busy&&<div className="ib info"><span className="sp"/><span>Analizando — AF · AC · SAN · LL · VEN · GAS...</span></div>}
                      </div>
                    )}
                  </div>
                </div>

                {!file&&(
                  <div className="card fu">
                    <div className="card-h"><span className="card-t">📋 Requisitos del plano</span></div>
                    <div className="card-b" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                      {[
                        ['📏','Escala explícita','Barra gráfica o nota 1:50 · 1:75 · 1:100'],
                        ['📄','Plantas separadas','Una página por nivel (Sótano 1, 2... / Piso 1, 2...)'],
                        ['🏷️','Cotas NPT','Nivel piso terminado en cada planta'],
                        ['🎨','Redes por color','AF · AC · SAN · LL · VEN · GAS con leyenda'],
                        ['🚿','Símbolos NTC','Lvm · San · Duc · Lvp · Tin · Lvra'],
                        ['🔥','Puntos gas','Est · Cal · Hor · Sec marcados en plano'],
                      ].map(([ico,t,s])=>(
                        <div key={t} style={{display:'flex',gap:8,alignItems:'flex-start',padding:'8px 10px',background:'var(--bg3)',borderRadius:'var(--r)',border:'1px solid var(--line)'}}>
                          <span style={{fontSize:16,flexShrink:0}}>{ico}</span>
                          <div>
                            <div style={{fontSize:11,fontWeight:500}}>{t}</div>
                            <div style={{fontSize:9,color:'var(--txt3)',marginTop:1}}>{s}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {meta&&(
                  <div className="card fu">
                    <div className="card-h"><span className="card-t">🔍 Metadatos detectados</span></div>
                    <div className="card-b">
                      <div className="meta-g">
                        {[
                          {l:'ESCALA',   v:meta.escala, s:'OCR barra gráfica'},
                          {l:'PÁGINAS',  v:meta.pags,   s:'Conteo automático'},
                          {l:'AP. HIDRO',v:meta.ap_hid, s:'Reconoc. símbolo'},
                          {l:'AP. GAS',  v:meta.ap_gas, s:'Puntos consumo'},
                          {l:'NIVELES',  v:meta.pisos,  s:'NPT detectados'},
                          {l:'ÁREA',     v:meta.area,   s:'Perímetro×escala'},
                        ].map(m=>(
                          <div key={m.l} className="meta-c">
                            <div className="meta-l">{m.l}</div>
                            <div className="meta-v">{m.v}</div>
                            <div className="meta-s">{m.s}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB APARATOS */}
            {tab==='apars'&&(
              <div className="card fu">
                <div className="card-h">
                  <span className="card-t">🚿 Base de aparatos — editable</span>
                  <span className="card-s">NTC 1500 · NTC 3728 · RAS 2000</span>
                </div>
                <div style={{overflowX:'auto'}}>
                  <table className="tbl">
                    <thead>
                      <tr>
                        <th rowSpan={2}>Sigla</th>
                        <th rowSpan={2}>Aparato</th>
                        <th colSpan={2} className="col-h af">UC</th>
                        <th className="col-h san">UD</th>
                        <th colSpan={2} className="col-h ok">Presión (m.c.a.)</th>
                        <th className="col-h gas">Q Gas</th>
                        <th rowSpan={2} style={{textAlign:'center',fontSize:8,color:'var(--txt3)'}}>Norma</th>
                      </tr>
                      <tr>
                        <th className="c" style={{background:'var(--af-bg)',fontSize:8}}>AF</th>
                        <th className="c" style={{background:'var(--ac-bg)',fontSize:8}}>AC</th>
                        <th className="c" style={{background:'var(--san-bg)',fontSize:8}}>UD</th>
                        <th className="c" style={{background:'var(--ok-bg)',fontSize:8}}>Mín</th>
                        <th className="c" style={{background:'var(--ok-bg)',fontSize:8}}>Máx</th>
                        <th className="c" style={{background:'var(--gas-bg)',fontSize:8}}>m³/hr</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="tbl-sec"><td colSpan={9}>APARATOS HIDRÁULICOS — NTC 1500</td></tr>
                      {hidros.map(a=>(
                        <tr key={a.id}>
                          <td><span className="sigla">{a.sigla}</span></td>
                          <td><div className="ap-nm">{a.nombre}</div><div className="ap-ref">{a.norma}</div></td>
                          <td style={{textAlign:'center'}}><NumIn val={a.uc_af} step={0.1} onChange={v=>updAp(a.id,'uc_af',v)}/></td>
                          <td style={{textAlign:'center'}}><NumIn val={a.uc_ac} step={0.1} onChange={v=>updAp(a.id,'uc_ac',v)}/></td>
                          <td style={{textAlign:'center'}}><NumIn val={a.ud} step={1} onChange={v=>updAp(a.id,'ud',v)}/></td>
                          <td style={{textAlign:'center'}}><NumIn val={a.pmin} step={0.01} w={58} onChange={v=>updAp(a.id,'pmin',v)}/></td>
                          <td style={{textAlign:'center'}}><NumIn val={a.pmax} step={0.01} w={58} onChange={v=>updAp(a.id,'pmax',v)}/></td>
                          <td style={{textAlign:'center'}}><span style={{fontFamily:'var(--mono)',fontSize:9,color:'var(--txt3)'}}>—</span></td>
                          <td style={{textAlign:'center'}}><span className="ap-ref">{a.norma.split(' ')[0]}</span></td>
                        </tr>
                      ))}
                      <tr className="tbl-sec"><td colSpan={9}>APARATOS A GAS — NTC 3728</td></tr>
                      {gases.map(a=>(
                        <tr key={a.id}>
                          <td><span className="sigla gas">{a.sigla}</span></td>
                          <td><div className="ap-nm">{a.nombre}</div><div className="ap-ref">{a.norma}</div></td>
                          <td colSpan={2} style={{textAlign:'center'}}><span style={{fontFamily:'var(--mono)',fontSize:9,color:'var(--txt3)'}}>— gas —</span></td>
                          <td style={{textAlign:'center'}}><span style={{fontFamily:'var(--mono)',fontSize:9,color:'var(--txt3)'}}>—</span></td>
                          <td style={{textAlign:'center'}}><NumIn val={a.pmin} step={1} w={50} cls="g" onChange={v=>updAp(a.id,'pmin',v)}/></td>
                          <td style={{textAlign:'center'}}><NumIn val={a.pmax} step={1} w={50} cls="g" onChange={v=>updAp(a.id,'pmax',v)}/></td>
                          <td style={{textAlign:'center'}}><NumIn val={a.qgas} step={0.01} w={64} cls="g" onChange={v=>updAp(a.id,'qgas',v)}/></td>
                          <td style={{textAlign:'center'}}><span className="ap-ref">{a.norma}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="tot-bar">
                  {[
                    {l:'UC AF total',v:tot.uc_af,cls:'af',s:'→ Q diseño AF'},
                    {l:'UC AC total',v:tot.uc_ac,cls:'ac',s:'→ Q diseño AC'},
                    {l:'UD Sanitaria',v:tot.ud,cls:'san',s:'→ Q Manning'},
                    {l:'Q Gas total',v:tot.qgas+' m³/hr',cls:'gas',s:'Sin fs simult.'},
                  ].map(t=>(
                    <div key={t.l} className="tot">
                      <div className="tot-l">{t.l}</div>
                      <div className={`tot-v ${t.cls}`}>{t.v}</div>
                      <div className="tot-s">{t.s}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB GAS */}
            {tab==='gas'&&(
              <div className="fu" style={{display:'flex',flexDirection:'column',gap:12}}>
                <div className="card">
                  <div className="card-h">
                    <span className="card-t">🌆 Parámetros de ciudad — Renouard</span>
                    <span className="card-s">NTC 3728 · Baja presión</span>
                  </div>
                  <div className="card-b">
                    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:12}}>
                      <div className="f"><label>Tipo de gas</label>
                        <select value={proy.tipo_gas} onChange={e=>setP('tipo_gas',e.target.value)}>
                          {TIPO_GAS.map(t=><option key={t}>{t}</option>)}</select></div>
                      <div className="f"><label>Altitud (msnm)</label>
                        <input type="number" value={proy.altitud} onChange={e=>setP('altitud',e.target.value)}/></div>
                      <div className="f"><label>P. atm. (kPa)</label>
                        <input type="number" value={proy.p_atm} onChange={e=>setP('p_atm',e.target.value)}/></div>
                      <div className="f"><label>Temperatura (°C)</label>
                        <input type="number" value={proy.temp} onChange={e=>setP('temp',e.target.value)}/></div>
                      <div className="f"><label>Densidad relativa</label>
                        <input type="number" step="0.01" value={proy.dens} onChange={e=>setP('dens',e.target.value)}/></div>
                      <div className="f"><label>P. mín. red (mbar)</label>
                        <input type="number" value={proy.p_min_red} onChange={e=>setP('p_min_red',e.target.value)}/></div>
                    </div>
                    <div className="pres-g">
                      {[
                        {niv:'Baja presión',pmin:17,pmax:50,ap:'Acometida residencial'},
                        {niv:'Media A',pmin:50,pmax:100,ap:'Regulador 1ª etapa'},
                        {niv:'Media B',pmin:100,pmax:400,ap:'Troncal urbana'},
                        {niv:'Interior vivienda',pmin:17,pmax:25,ap:'Tras regulador'},
                      ].map(r=>(
                        <div key={r.niv} className="pres-c">
                          <div className="pres-niv">{r.niv}</div>
                          {[['P mín',r.pmin,'mbar'],['P máx',r.pmax,'mbar'],
                            ['mín m.c.a.',(r.pmin*0.102).toFixed(2),'m'],
                            ['máx m.c.a.',(r.pmax*0.102).toFixed(2),'m']].map(([l,v,u])=>(
                            <div key={l} className="pres-val">
                              <span style={{color:'var(--txt3)'}}>{l}</span><span>{v} {u}</span>
                            </div>
                          ))}
                          <div style={{fontSize:8,color:'var(--txt3)',marginTop:4}}>{r.ap}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="ib info"><span>ℹ</span><span><b>NTC 3728</b> — ΔP ≤ 9.81 mbar (1 m.c.a.) · V ≤ 10 m/s · Factor simultaneidad según N° aparatos · Método Renouard para baja presión</span></div>

                <div className="card">
                  <div className="card-h">
                    <span className="card-t">📋 Consumo de aparatos a gas — NTC 3728</span>
                    <span className="card-s">Referencia para asignar Qgas</span>
                  </div>
                  <div className="card-b">
                    <table className="tbl">
                      <thead><tr><th>Aparato</th><th className="c">Consumo (m³/h)</th></tr></thead>
                      <tbody>
                        {[
                          ['Estufa 4 quemadores','1.35'],['Estufa 2 quemadores','0.68'],
                          ['Horno grande','1.15'],['Horno mediano','0.81'],
                          ['Horno pequeño','0.54'],['Secadora grande','0.81'],
                          ['Secadora pequeña','0.54'],['Caldera pequeña','1.76'],
                          ['Jacuzzi','3.38'],['Calentador piscina','6.08'],
                          ['Baño sauna','1.08'],['Baño turco','1.35'],
                        ].map(([ap,q])=>(
                          <tr key={ap}><td>{ap}</td><td className="c" style={{fontFamily:'var(--mono)',fontWeight:600}}>{q}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="card">
                  <div className="card-h">
                    <span className="card-t">🔧 Tramos — Método Renouard</span>
                    <span className="card-s">
                      ΔP total: <span style={{color:totalPerd>9.81?'var(--err)':'var(--ok)',fontFamily:'var(--mono)'}}>
                        {totalPerd.toFixed(3)} mbar
                      </span> / 9.81 máx
                    </span>
                  </div>
                  <div className="card-b" style={{display:'flex',flexDirection:'column',gap:6}}>
                    {tramos.map(t=>{
                      const matD=MAT_GAS_DATA[t.mat]||{k:49,di:25};
                      const Le=ACCS_GAS.reduce((a,ac)=>a+(t.accs[ac.id]||0)*ac.k*matD.di/1000,0);
                      const Q=gases.filter(g=>g.qgas>0).reduce((a,g)=>a+g.qgas,0);
                      const fs=getFs(t.n_ap);
                      const Qd=Q*fs;
                      const res=calcRenouard(Q,t.L+Le,matD.di,matD.k,parseFloat(proy.p_atm)||90.32,fs);
                      return(
                        <div key={t.id} className="tramo-card">
                          <div className="tramo-hdr">
                            <span className="tramo-id">{t.id}</span>
                            <span style={{fontFamily:'var(--mono)',fontSize:9,color:'var(--txt3)'}}>{t.ini}→{t.fin}</span>
                            <span style={{fontFamily:'var(--mono)',fontSize:9,color:'var(--txt2)'}}>{t.mat}</span>
                            <span style={{marginLeft:'auto'}}>
                              {res.ok?<span className="badge ok">O.K.</span>:<span className="badge err">REVISAR</span>}
                            </span>
                          </div>
                          <div className="tramo-body">
                            <div className="tramo-field"><div className="tramo-lbl">Nudo Ini</div>
                              <input className="ni" style={{width:'100%'}} value={t.ini} onChange={e=>updTr(t.id,'ini',e.target.value)}/></div>
                            <div className="tramo-field"><div className="tramo-lbl">Nudo Fin</div>
                              <input className="ni" style={{width:'100%'}} value={t.fin} onChange={e=>updTr(t.id,'fin',e.target.value)}/></div>
                            <div className="tramo-field"><div className="tramo-lbl">Long. (m)</div>
                              <NumIn val={t.L} step={0.1} w={'100%'} onChange={v=>updTr(t.id,'L',v)}/></div>
                            <div className="tramo-field"><div className="tramo-lbl">N° aparatos</div>
                              <NumIn val={t.n_ap} step={1} min={1} w={'100%'} onChange={v=>updTr(t.id,'n_ap',v)}/></div>
                            <div className="tramo-field" style={{gridColumn:'1/-1'}}>
                              <div className="tramo-lbl">Material / Diámetro</div>
                              <select className="ni" style={{width:'100%',textAlign:'left'}} value={t.mat}
                                onChange={e=>updTr(t.id,'mat',e.target.value)}>
                                {Object.keys(MAT_GAS_DATA).map(m=><option key={m}>{m}</option>)}
                              </select>
                            </div>
                            {ACCS_GAS.map(ac=>(
                              <div key={ac.id} className="tramo-field">
                                <div className="tramo-lbl">{ac.nm} K={ac.k}</div>
                                <NumIn val={t.accs[ac.id]||0} step={1} w={'100%'} onChange={v=>updAcc(t.id,ac.id,v)}/>
                              </div>
                            ))}
                          </div>
                          <div className="tramo-chk">
                            {[
                              {l:'Qd',v:`${Qd.toFixed(3)} m³/hr`},
                              {l:'fs',v:fs},
                              {l:'Le',v:`${Le.toFixed(2)} m`},
                              {l:'L+Le',v:`${(t.L+Le).toFixed(2)} m`},
                              {l:'ΔP',v:`${res.dp} mbar`,warn:res.dp>9.81},
                              {l:'V',v:`${res.v} m/s`,warn:res.v>10},
                              {l:'D int',v:`${matD.di} mm`},
                            ].map(c=>(
                              <div key={c.l} className="chk-item">
                                <span style={{color:'var(--txt3)'}}>{c.l}:</span>
                                <span style={{color:c.warn?'var(--err)':c.l==='ΔP'||c.l==='V'?'var(--gas)':'var(--txt2)'}}>{c.v}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                    <button className="btn btn-ghost" style={{alignSelf:'flex-start',fontSize:10}}
                      onClick={addTramo}>+ Agregar tramo</button>
                  </div>
                  <div style={{padding:'9px 13px',borderTop:'1px solid var(--line)',display:'flex',gap:10,alignItems:'center',background:'var(--bg3)'}}>
                    <div className="tot" style={{minWidth:110}}>
                      <div className="tot-l">Total ΔP</div>
                      <div className="tot-v gas">{totalPerd.toFixed(3)}</div>
                      <div className="tot-s">mbar / 9.81 máx</div>
                    </div>
                    <div className="tot" style={{minWidth:110}}>
                      <div className="tot-l">% del límite</div>
                      <div className={`tot-v ${totalPerd/9.81*100>100?'ac':'ok'}`}>
                        {(totalPerd/9.81*100).toFixed(1)}%
                      </div>
                      <div className="tot-s">100% = 9.81 mbar</div>
                    </div>
                    <div style={{flex:1}}>
                      {totalPerd<=9.81
                        ?<div className="ib ok"><span>✓</span><span>Pérdidas dentro del límite NTC 3728</span></div>
                        :<div className="ib err"><span>✗</span><span>Pérdidas superan 9.81 mbar — aumentar diámetro</span></div>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CALENTADORES */}
            {tab==='calent'&&(
              <div className="fu" style={{display:'flex',flexDirection:'column',gap:12}}>
                <div className="card">
                  <div className="card-h">
                    <span className="card-t">♨️ Catálogo calentadores a gas</span>
                    <span className="card-s">HACEB · BOSCH · RHEEM · RINNAI · CHALLENGER</span>
                  </div>
                  <div className="card-b">
                    {calSel&&(
                      <div className="ib ok" style={{marginBottom:10}}>
                        <span>✓</span>
                        <div><b style={{display:'block'}}>Seleccionado: {calSel.ref}</b>
                          {calSel.lpm} LPM · {calSel.kw} kW · {calSel.m3h} m³/hr · Ef. {calSel.ef}%</div>
                      </div>
                    )}
                    <div className="cal-grid">
                      {CALENTADORES.map(c=>(
                        <div key={c.id} className={`cal-card ${calSel?.id===c.id?'sel':''}`}
                          onClick={()=>setCalSel(c)}>
                          <div className="cal-marca">{c.marca}</div>
                          <div className="cal-ref">{c.ref}</div>
                          <div className="cal-vals">
                            <div className="cal-val">{c.lpm}<span> LPM</span></div>
                            <div className="cal-val">{c.ef}<span>% ef</span></div>
                            <div className="cal-val">{c.kw}<span> kW</span></div>
                            <div className="cal-val">{c.m3h}<span> m³/hr</span></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB VALIDACIÓN */}
            {tab==='valid'&&(
              <div className="fu" style={{display:'flex',flexDirection:'column',gap:12}}>
                <div className="card">
                  <div className="card-h"><span className="card-t">✓ Validación del plano</span></div>
                  <div className="card-b">
                    {vals.length===0
                      ?<div className="ib info"><span>ℹ</span><span>Cargue un plano para ver los resultados.</span></div>
                      :vals.map(v=>(
                        <div key={v.id} className={`val-r ${v.st}`}>
                          <span className="val-ico">{v.st==='idle'?<span className="sp"/>:v.st==='ok'?'✓':'⚠'}</span>
                          <span>{v.msg}</span>
                        </div>
                      ))
                    }
                  </div>
                </div>
                <div className="card">
                  <div className="card-h"><span className="card-t">📋 Resumen del proyecto</span></div>
                  <div className="card-b">
                    {[
                      ['PROYECTO',   proy.nombre],
                      ['UBICACIÓN',  `${proy.mun}, ${proy.dep}`],
                      ['USO',        proy.uso],
                      ['EMPRESA',    proy.empresa],
                      ['PRESIÓN RED',`${proy.p_red} m.c.a.`],
                      ['DOTACIÓN',   `${proy.dot} L/hab/día`],
                      ['NIVELES',    pisos.sort((a,b)=>a.n-b.n).map(p=>pisoLbl(p.n)).join(' · ')],
                      ['REDES',      redes.map(r=>REDES.find(x=>x.id===r)?.lbl).join(' · ')],
                      ['MAT. AF',    proy.mat_af],
                      ['MAT. AC',    proy.mat_ac],
                      ['MAT. SAN',   proy.mat_san],
                      ['MAT. LL',    proy.mat_ll],
                      ['MAT. VEN',   proy.mat_ven],
                      ['MAT. GAS',   proy.mat_gas],
                      ['TIPO GAS',   proy.tipo_gas],
                      ['UC AF',      `${tot.uc_af} UC`],
                      ['UC AC',      `${tot.uc_ac} UC`],
                      ['UD SAN',     `${tot.ud} UD`],
                      ['Q GAS',      `${tot.qgas} m³/hr`],
                      ['CALENTADOR', calSel?`${calSel.ref} · ${calSel.m3h} m³/hr`:'No seleccionado'],
                      ['ΔP GAS',     `${totalPerd.toFixed(3)} mbar → ${totalPerd<=9.81?'✓ O.K.':'✗ REVISAR'}`],
                    ].map(([k,v])=>(
                      <div key={k} className="res-row">
                        <span className="res-k">{k}</span>
                        <span className="res-v">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        <div style={{display:'flex',alignItems:'center',justifyContent:'flex-end',padding:'8px 14px',background:'var(--bg2)',borderTop:'1px solid var(--line)',flexShrink:0,gap:8}}>
          <div style={{fontSize:9,color:'var(--txt3)',fontFamily:'var(--mono)',flex:1}}>
            {redes.length} redes · {aps.length} aparatos · {pisos.length} niveles
          </div>
          <button
            className="btn-pri"
            disabled={!proy.nombre}
            onClick={() => { generarExcelSanitario(); }}startIcon={<span>🚿</span>}
            style={{
              padding: '7px 15px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              border: 'none',
              borderRadius: 'var(--r)',
              color: '#fff',
              fontWeight: 600,
              fontSize: 11,
              cursor: proy.nombre ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              opacity: proy.nombre ? 1 : 0.5,
            }}
          >
            <span className="ntab-ico" style={{ fontSize: 14, filter: 'brightness(1.2)' }}>🚿</span>
            Generar cálculos red sanitaria
          </button>
          <button
            className="btn-pri"
            disabled={!proy.nombre}
            onClick={() => { generarExcelHidraulico(); }}
            style={{
              padding: '7px 15px',
              background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
              border: 'none',
              borderRadius: 'var(--r)',
              color: '#fff',
              fontWeight: 600,
              fontSize: 11,
              cursor: proy.nombre ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              opacity: proy.nombre ? 1 : 0.5,
            }}
          >
            <span className="ntab-ico" style={{ fontSize: 14, filter: 'brightness(1.2)' }}>💧</span>
            Generar cálculos red hidráulica
          </button>
        </div>
      </div>
    </div>
  );
}