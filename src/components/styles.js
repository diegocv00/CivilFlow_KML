/* ═══════════════════════════════════════════════════════════════════════════
Civil Flow KML 2026
Ing. Camilo Cárdenas Chacón — Ingeniero Civil
NTC 1500 · RAS 2000 · NTC 3728 · NSR-10
════════════════════════════════════════════════════════════════════════════ */

export const LOGO_SRC = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAGQAZADASIAAhEBAxEB/8QAHQAAAgICAwEAAAAAAAAAAAAAAAEHCAUGAwQJAv/EAGIQAAEDBAADBQMDDQcNDgUFAAECAwQABQYRBxIhCBMxQVEiYYEUMnEVFiNCUmKRlKGxs9HSVVZygpKVwRgkJSYzNkNjZHN2o7IXNDU3RVRldHWDk6LT8AlEU7TCOEZXhPH/xAAbAQEAAwEBAQEAAAAAAAAAAAAAAQIDBAUGB//EADgRAAIBAgQEBAMGBgIDAAAAAAABAgMRBBIhMQUTQVEyYYGRFCJxFSOhwdHwBjM0QrHxQ6JSYnL/2gAMAwEAAhEDEQA/ALlUUqKAdFKigHSp0qAKdKigGKKVFAOilRQDFFFFAFFKnQBSop0AUUqKAKKKKAdFFKgHRSFFAOlTpUA6VFOgFRRToApUxSoB0UqdAFFKnQCp0UqAKdFFAKiiigHRRSoB0UqdAKjyp0UAUUUqAdFFKgHSp0UAqdKigCnSp0AqdFFAFFKigHSop0AUUUUAqKdKgCgU6VAFOiigClTpUA6VFOgFToooBUUU6AVOlToAopU6AKKKVAOiiigClTpUA6KKVAFFOigFRTpUA6VFOgClTpUAU6KKAKK1jO8+xLCIfynJb3GhFQ22xvned/gtjaj9Ode+q7Z72rZrxci4TYkRm+oEy4+2s+8NJOh8VH6K6sPgq1fwLTv0OetiqVHxstcpSUpKlEADqSegFaZkvFfh1jqlN3TLrWh1Piyy73zg93K3s1RDLeIOaZY4tWQZJcZqFHfcl0oZH0Np0n8la0k66DoPdXsUeBL/kn7fv8jzKvF/8Awj7l0r12osAicybdBvVzUPBSWEtIPxWoH8latO7WadkQMIOvJT9x1+RKD+eqsc1fSVV6EOEYSO8b+pxT4piXs7ehZmB2pr9MucSIjE7WhL8htokynCQFKCd+A9astl91cseL3K7tsodXDjreShZICikeBIrzixs/2xWvX/PWP0ia9COKn/FxkH/UHfzV5HGMLSoSgqate/5HpcMxFStCTm72Ita49XAL+y45EUn72UofnSayUTj3byQJmOS2x5lmQlf5CE1A7iuvSvgmvM5cTu5kiz1q4yYPN0Hpkq3k/wDOY6gPwp2K3Oz3yz3hrvLVdIc1Ot/YHkrI+kA7FUsJpsuOMvJeZcW04nqFoUUqHxHWodJEqq+peOlVVMZ4sZnZFJQq4/VOOP8ABThz9Pcv5w/Can3DuNGNXgoj3ZK7LKV028rmYJ9zg8P4wFZum0aKomSdTr5acQ62lxtaVoWAUqSdgj1Br6qhcDSp0UAqKKdAKnRRQBRRSoAoop0AvfRTpUAzSp0UAUUqdAKinRQCp0qdAKinRQCop0UAqKdKgCiiigHRRRQBRRWg8ZOKuOcM7OJF0cMq4vpJh25pQ717XmfuEA+Kj8NnpVoQlUkoxV2VlJRV3sbfkF5tVgtL91vVwjwILCeZx99YSlP6z6AdTVVOL/agnzlPWrh40qDG6pVdJDY75fvbQeiB71bPuFQrxS4k5RxFvHy+/TPsDaiY0FokMRx96nzV6qOyfo6Vp3NX0WE4XCn81XV9uh42J4hKXy09Edy5XCdc5zs+5TJEyW8eZ998uOrW86feo9TXAD61xFVdi3RJlxmtQbfEkTJTx5W2GGy44s+5I2TXr5lFHl5XJnzzUwr0qcMB7MOdX0NScgei43EVolL32aTr/NpOk/xlA+6phgcBODWDwUz8unCYE";

export const G = `
.civilflow-wrapper{
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
--ven:#3b82f6;--ven-bg:rgba(59,130,246,.07);
--gold:#c9a227;
--mono:'Geist',monospace;
--head:'Hanken Grotesk',sans-serif;
--body:'Hanken Grotesk',sans-serif;
--r:0px;--r2:0px;--r3:0px;
}
.civilflow-wrapper ::-webkit-scrollbar{width:4px;height:4px}
.civilflow-wrapper ::-webkit-scrollbar-track{background:transparent}
.civilflow-wrapper ::-webkit-scrollbar-thumb{background:var(--line2);border-radius:0}
.civilflow-wrapper ::-webkit-scrollbar-thumb:hover{background:var(--txt3)}

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
.card-t{font-family:var(--body);font-size:14px;font-weight:600;display:flex;align-items:center;gap:7px;color:var(--txt2)}
.card-s{font-size:11px;color:var(--txt3);font-family:var(--mono)}.card-b{padding:14px}
.dz{border:2px dashed var(--line2);border-radius:var(--r3);min-height:180px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;cursor:pointer;transition:all .2s;padding:20px;text-align:center}
.dz:hover,.dz.drag{border-color:var(--acc2);background:rgba(37,99,235,.04)}
.dz-ico{font-size:32px}.dz-t{font-family:var(--head);font-size:20px;letter-spacing:1px;color:var(--txt)}
.dz-s{font-size:10px;color:var(--txt3);line-height:1.6}
.pill{font-family:var(--mono);font-size:11px;padding:3px 8px;border-radius:20px;background:var(--bg4);color:var(--txt3);border:1px solid var(--line2)}
.tbl{width:100%;border-collapse:collapse;font-size:13px}
.tbl th{padding:6px 10px;background:var(--bg3);color:var(--txt3);font-family:var(--mono);font-size:10px;font-weight:600;letter-spacing:.4px;text-transform:uppercase;text-align:left;border-bottom:1px solid var(--line);white-space:nowrap}
.tbl th.c,.tbl td.c{text-align:center}.tbl td{padding:6px 9px;border-bottom:1px solid var(--line);vertical-align:middle}
.tbl tr:last-child td{border-bottom:none}.tbl tr:hover td{background:rgba(255,255,255,.01)}
.tbl-sec td{padding:5px 10px;background:var(--bg);font-family:var(--mono);font-size:13px;font-weight:600;letter-spacing:.8px;text-transform:uppercase;color:var(--txt3);border-bottom:1px solid var(--line)}
.col-h{padding:4px 10px;font-family:var(--mono);font-size:12px;font-weight:600;letter-spacing:.4px;text-transform:uppercase;text-align:center;color:var(--txt2)}
.col-h.af{background:var(--bg4)}.col-h.ac{background:var(--bg4)}
.col-h.san{background:var(--bg4)}.col-h.gas{background:var(--bg4)}
.col-h.ok{background:var(--bg4)}.col-h.ll{background:var(--bg4)}
.col-h.ven{background:var(--bg4)}
.tbl th.col-h{background:var(--bg4);color:var(--txt2)}
.sigla{font-family:var(--mono);font-size:11px;font-weight:600;color:var(--txt2);background:var(--bg4);padding:3px 8px;border-radius:3px;display:inline-block}
.sigla.gas{color:var(--txt2);background:var(--bg4)}.ap-nm{font-weight:500;color:var(--txt);font-size:13px}
.ap-ref{font-family:var(--mono);font-size:12px;color:var(--txt3)}
.ni{width:100%;padding:5px 8px;background:var(--bg4);border:1px solid var(--line);border-radius:4px;font-family:var(--mono);font-size:13px;color:var(--txt);text-align:center;outline:none;transition:border .12s}
.ni:focus{border-color:var(--acc2)}.ni.g{border-color:var(--gas-b)}.ni.g:focus{border-color:var(--gas)}
.badge{display:inline-flex;align-items:center;justify-content:center;min-width:32px;padding:2px 8px;border-radius:20px;font-family:var(--mono);font-size:11px;font-weight:500}
.badge.af{background:var(--af-bg);color:var(--txt)}.badge.san{background:var(--san-bg);color:var(--txt)}
.badge.gas{background:var(--gas-bg);color:var(--txt)}.badge.ok{background:var(--ok-bg);color:var(--txt)}
.badge.warn{background:var(--warn-bg);color:var(--txt)}.badge.err{background:var(--err-bg);color:var(--txt)}
.badge.ll{background:var(--ll-bg);color:var(--txt)}.badge.ven{background:var(--ven-bg);color:var(--txt)}
.tot-bar{display:flex;gap:7px;flex-wrap:wrap;padding:9px 13px;background:var(--bg3);border-top:1px solid var(--line)}
.tot{flex:1;min-width:80px;padding:7px 10px;background:var(--bg2);border:1px solid var(--line);border-radius:var(--r2)}
.tot-l{font-family:var(--mono);font-size:12px;color:var(--txt3);margin-bottom:3px;text-transform:uppercase}
.tot-v{font-family:var(--head);font-size:20px;letter-spacing:.5px}
.tot-v.af{color:var(--txt)}.tot-v.ac{color:var(--txt)}.tot-v.san{color:var(--txt)}.tot-v.gas{color:var(--txt)}.tot-v.ll{color:var(--txt)}.tot-v.ven{color:var(--txt)}
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
