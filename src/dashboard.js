/* 底部仪表盘:① ROLL 辊系 ② PRESS 压蔗 ③ SWEEP 拽杆 ④ CYCLE 阶段时序 */
(function (MECH) {
  var el = {};
  var D = MECH.DIM, KS = MECH.KS;
  var soft = "rgba(233,238,242,0.45)", faint = "rgba(233,238,242,0.16)";
  var yellow = "#E9C93C", teal = "#7FD8D8", red = "#D6543A", caneC = "#C9D8A0";
  var wood = "#B08D57";

  var STARTS = (function () {
    var acc = 0, arr = [];
    MECH.PHASES.forEach(function (ph) { arr.push(acc); acc += ph.dur; });
    arr.total = acc;
    return arr;
  })();

  MECH.DASH = { panels: [
    { title: "ROLL · 辊系", meta: "外啮合 i=1 · 反向", dot: "yellow", canvasH: 108,
      draw: drawRoll },
    { title: "PRESS · 压蔗", meta: "v 0.12 m/s", dot: "green",
      html: '<div class="big" id="d-p">0%</div><div class="k">蔗 1 压榨进度</div><div class="chip" id="d-chip">—</div>',
      canvasH: 80, init: initPress, draw: drawPress },
    { title: "SWEEP · 拽杆", meta: "2.6m 牛曳", dot: "blue", canvasH: 108,
      draw: drawSweep },
    { title: "CYCLE · 阶段时序", meta: "48.5s 自动循环", dot: "orange", canvasH: 66,
      draw: drawCycle }
  ] };

  function initPress(sec) {
    el.p = sec.querySelector("#d-p");
    el.chip = sec.querySelector("#d-chip");
  }

  /* ① 辊系:双辊端面圆(俯视)反向旋转 + 齿轮对 + 隙 */
  function drawRoll(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var S = Math.min(w / 1.5, (h - 12) / 1.5);
    var cx = w * 0.5, cy = h * 0.5;
    function X(x) { return cx + x * S; }
    function Z(z) { return cy + z * S; }
    [[-D.xGap, st.psi], [D.xGap, -st.psi]].forEach(function (c) {
      var r = D.rRoller * S;
      ctx.strokeStyle = "#E9EEF2"; ctx.lineWidth = 1.8;
      ctx.beginPath(); ctx.arc(X(c[0]), Z(0), r, 0, Math.PI * 2); ctx.stroke();
      var a0 = c[1];
      ctx.strokeStyle = wood;
      ctx.beginPath();
      ctx.moveTo(X(c[0]), Z(0));
      ctx.lineTo(X(c[0]) + Math.cos(a0) * r, Z(0) + Math.sin(a0) * r);
      ctx.stroke();
      /* 顶齿轮齿 */
      for (var i = 0; i < 9; i++) {
        var a = c[1] + i / 9 * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(X(c[0]) + Math.cos(a) * r * 0.86, Z(0) + Math.sin(a) * r * 0.86);
        ctx.lineTo(X(c[0]) + Math.cos(a) * r, Z(0) + Math.sin(a) * r);
        ctx.stroke();
      }
    });
    /* 辊隙 */
    ctx.strokeStyle = red; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(X(0), Z(-D.rRoller - 0.06)); ctx.lineTo(X(0), Z(-D.rRoller - 0.13)); ctx.stroke();
    ctx.fillStyle = red;
    ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "center";
    ctx.fillText("隙 0.06", X(0), Z(-D.rRoller) - 8);
    ctx.fillStyle = soft;
    ctx.fillText("ω右 = −ω左 · 外啮合 18T ×2", X(0), cy - D.rRoller * S + 16);
  }

  /* ② 压蔗进度 + 汁量 */
  function drawPress(st, ph, pt, ctx, w, h) {
    var p = Math.max(st.pressProg || 0, st.pressProg2 || 0);
    if (el.p) el.p.textContent = Math.round(p * 100) + "%";
    if (el.chip) {
      var ginning = p > 0.02 && p < 0.98;
      el.chip.textContent = ginning ? "压榨中 · 蔗汁入盘" : (p >= 0.98 ? "压毕 · 蔗渣出" : "待喂");
      el.chip.className = "chip " + (ginning ? "hot" : "on");
    }
    ctx.clearRect(0, 0, w, h);
    var bx = 8, bw = w - 16, cy = h * 0.45;
    ctx.fillStyle = "rgba(233,238,242,0.10)";
    ctx.fillRect(bx, cy - 6, bw, 12);
    ctx.fillStyle = caneC;
    ctx.fillRect(bx, cy - 6, bw * p, 12);
    ctx.fillStyle = "rgba(191,227,208,0.8)";
    ctx.fillRect(bx, cy + 10, bw * p * 0.9, 3);
    ctx.fillStyle = soft;
    ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("蔗汁 ←入盘", bx, cy + 24);
    ctx.textAlign = "right";
    ctx.fillText("v压 " + (st.omega * D.rRoller).toFixed(2) + " m/s", bx + bw, cy - 12);
  }

  /* ③ 拽杆俯视:旋转杆 + 扫掠圆 */
  function drawSweep(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var cx = w * 0.36, cy = h * 0.52, r = Math.min(w * 0.30, h * 0.40);
    var scale = r / D.sweepLen;
    ctx.strokeStyle = faint; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.arc(cx, cy, r * (D.xGap / D.sweepLen), 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    /* 拽杆(实时 ψ) */
    var psi = st.psi;
    ctx.strokeStyle = wood; ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx - Math.cos(psi) * D.xGap * scale, cy + Math.sin(psi) * D.xGap * scale);
    ctx.lineTo(cx + Math.cos(psi) * r, cy - Math.sin(psi) * r);
    ctx.stroke();
    ctx.fillStyle = yellow;
    ctx.beginPath(); ctx.arc(cx + Math.cos(psi) * r, cy - Math.sin(psi) * r, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = soft;
    ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("牛轭钩", cx + Math.cos(psi) * r + 6, cy - Math.sin(psi) * r + 3);
    ctx.fillText("左辊轴", cx - 16, cy + 12);
  }

  /* ④ 阶段时序 */
  function drawCycle(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var total = STARTS.total, x0 = 4, ww = w - 8;
    var idx = MECH.PHASES.indexOf(ph);
    var gt = STARTS[idx] + pt;
    var y1 = 6, hh1 = 18;
    MECH.PHASES.forEach(function (p, i) {
      var x = x0 + STARTS[i] / total * ww, seg = p.dur / total * ww;
      ctx.fillStyle = i === idx ? "rgba(233,201,60,0.30)" : "rgba(233,238,242,0.10)";
      ctx.fillRect(x, y1, seg - 1.5, hh1);
      ctx.strokeStyle = i === idx ? yellow : faint;
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y1, seg - 1.5, hh1);
      ctx.fillStyle = i === idx ? yellow : soft;
      ctx.font = "600 7.5px Menlo, monospace";
      ctx.textAlign = "center";
      ctx.fillText(String(i + 1), x + seg / 2 - 0.75, y1 + hh1 / 2 + 3);
    });
    var gx = x0 + gt / total * ww;
    ctx.strokeStyle = "#E9EEF2"; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(gx, y1 - 3); ctx.lineTo(gx, y1 + hh1 + 3); ctx.stroke();
    ctx.fillStyle = soft;
    ctx.font = "600 7px Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText("t=" + gt.toFixed(1) + "s / " + total.toFixed(1) + "s", x0, y1 + hh1 + 14);
    ctx.textAlign = "right";
    ctx.fillText("ψ " + st.psi.toFixed(1) + " rad", x0 + ww, y1 + hh1 + 14);
  }
})(window.MECH = window.MECH || {});
