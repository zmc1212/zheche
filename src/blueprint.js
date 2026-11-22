/* 图纸面板(B 键):蔗车复原俯视总图 + 外啮合运动链 + 尺寸表。 */
(function (MECH) {
  var ink = "#2A2620", faint = "rgba(42,38,32,0.38)", faint2 = "rgba(42,38,32,0.22)";
  var waterC = "#3E6E86", woodC = "#6E4E28", red = "#8C2F1E";

  function arrowH(ctx, x1, x2, y, text, below) {
    ctx.strokeStyle = faint; ctx.fillStyle = faint; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.stroke();
    var s = 4, dir = x2 >= x1 ? 1 : -1;
    ctx.beginPath(); ctx.moveTo(x2, y); ctx.lineTo(x2 - s * dir, y - 3); ctx.lineTo(x2 - s * dir, y + 3); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x1 + s * dir, y - 3); ctx.lineTo(x1 + s * dir, y + 3); ctx.closePath(); ctx.fill();
    ctx.font = "600 9px Menlo, monospace"; ctx.textAlign = "center";
    ctx.fillText(text, (x1 + x2) / 2, below ? y + 12 : y - 5);
  }
  function arrowV(ctx, x, y1, y2, text, side) {
    ctx.strokeStyle = faint; ctx.fillStyle = faint; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x, y1); ctx.lineTo(x, y2); ctx.stroke();
    var s = 4, dir = y2 >= y1 ? 1 : -1;
    ctx.beginPath(); ctx.moveTo(x, y2); ctx.lineTo(x - 3, y2 - s * dir); ctx.lineTo(x + 3, y2 - s * dir); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x, y1); ctx.lineTo(x - 3, y1 + s * dir); ctx.lineTo(x + 3, y1 + s * dir); ctx.closePath(); ctx.fill();
    ctx.font = "600 9px Menlo, monospace";
    ctx.textAlign = side < 0 ? "right" : "left";
    ctx.fillText(text, x + side * 6, (y1 + y2) / 2 + 3);
  }

  MECH.BP = {
    no: "Fig. 09 · 复原总图",
    title: "蔗车 · 双石辊对压榨汁(《天工开物·甘嗜》)",
    src: "《天工开物·甘嗜》蔗车节 · 尺寸按本站复原推算",
    draw: function (ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      var D = MECH.DIM;
      var chainY = h - 70, topY = 30;

      /* —— 公式横幅 —— */
      ctx.fillStyle = red;
      ctx.font = "700 11px Menlo, monospace";
      ctx.textAlign = "left";
      ctx.fillText("顶齿轮等齿 Z18 外啮合:ω右 = −ω左(i=1)   ·   辊隙 0.06m   ·   v压 = 0.5×0.24 = 0.12 m/s", w * 0.03, topY - 8);

      /* —— 左:俯视 PLAN —— */
      var ox = w * 0.03, oRight = w * 0.55, regionH = chainY - topY - 26;
      var S = Math.min((oRight - ox - 16) / 6.6, (regionH - 12) / 2.6);
      var cy0 = topY + 46;
      function X(m) { return ox + 1.0 * S + (m + 3.0) * S; }
      function Y(m) { return cy0 + m * S; }
      ctx.strokeStyle = ink; ctx.fillStyle = ink; ctx.lineWidth = 1.3;
      ctx.font = "700 11px sans-serif"; ctx.textAlign = "left";
      ctx.fillText("俯视 PLAN(上:送蔗 +z · 下:蔗渣 −z)", ox, topY + 10);
      /* 双辊 */
      [[-D.xGap, 0], [D.xGap, 0]].forEach(function (p) {
        ctx.beginPath(); ctx.arc(X(p[0]), Y(0), D.rRoller * S, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(X(p[0]), Y(0), D.gearR * S * 0.55, 0, Math.PI * 2); ctx.stroke();
      });
      /* 辊隙与送蔗方向 */
      ctx.strokeStyle = red;
      ctx.beginPath(); ctx.moveTo(X(0), Y(-D.rRoller - 0.05)); ctx.lineTo(X(0), Y(-D.rRoller - 0.22)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(X(0), Y(D.rRoller + 0.10)); ctx.lineTo(X(0), Y(D.rRoller + 0.35)); ctx.stroke();
      ctx.strokeStyle = ink;
      /* 拽杆(双态:实线 ψ=0.9,虚线 ψ=−0.9) */
      [[0.9, false], [-0.9, true]].forEach(function (c) {
        ctx.setLineDash(c[1] ? [5, 4] : []);
        ctx.strokeStyle = c[1] ? faint : ink;
        ctx.lineWidth = c[1] ? 1.3 : 2.2;
        ctx.beginPath();
        ctx.moveTo(X(-D.xGap), Y(0));
        ctx.lineTo(X(-D.xGap + Math.cos(c[0]) * D.sweepLen), Y(-Math.sin(c[0]) * D.sweepLen));
        ctx.stroke();
        ctx.setLineDash([]);
      });
      /* 汁盘 */
      ctx.strokeRect(X(-0.10), Y(-0.85 - D.trayD), D.trayW * S, D.trayD * 2 * S);
      /* 夹杖 */
      ctx.strokeStyle = faint2;
      ctx.beginPath(); ctx.moveTo(X(-0.34), Y(D.feedGuideZ)); ctx.lineTo(X(-0.34), Y(D.feedGuideZ + 0.3)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(X(0.34), Y(D.feedGuideZ)); ctx.lineTo(X(0.34), Y(D.feedGuideZ + 0.3)); ctx.stroke();
      ctx.strokeStyle = ink;
      /* 尺寸 */
      arrowH(ctx, X(-D.xGap), X(D.xGap), Y(D.rRoller + 0.42), "辊心距 0.54 m", true);
      arrowH(ctx, X(-D.xGap), X(-D.xGap + D.sweepLen * 0.45), Y(-Math.sin(0.9) * D.sweepLen * 0.45) - 8, "拽杆 2.60 m", true);
      ctx.fillStyle = faint;
      ctx.font = "600 9px sans-serif"; ctx.textAlign = "left";
      ctx.fillText("红箭头 送蔗方向(−z) · 实/虚线 拽杆两态 · 蔗渣出下侧", ox, chainY - 14);

      /* —— 右:外啮合链 —— */
      var rx = w * 0.585, rw = w - rx - 14;
      ctx.font = "700 11px sans-serif"; ctx.fillStyle = ink; ctx.textAlign = "left";
      ctx.fillText("外啮合运动链", rx, topY + 12);
      var boxes = [
        ["牛曳拽杆 2.6m", "ω左 = 牛速"],
        ["顶齿轮 L 18T", "与左辊同轴"],
        ["顶齿轮 R 18T", "外啮合 → ω右 = −ω左"],
        ["双辊隙 0.06m", "蔗横送压扁出汁"]
      ];
      var gy0 = topY + 26;
      boxes.forEach(function (b, i) {
        var y = gy0 + i * 24;
        ctx.strokeStyle = ink; ctx.lineWidth = 1.1;
        ctx.strokeRect(rx, y, rw, 18);
        ctx.fillStyle = ink;
        ctx.font = "600 9px sans-serif"; ctx.textAlign = "left";
        ctx.fillText(b[0], rx + 6, y + 12);
        ctx.fillStyle = faint;
        ctx.font = "600 8px Menlo, monospace"; ctx.textAlign = "right";
        ctx.fillText(b[1], rx + rw - 6, y + 12);
        if (i < boxes.length - 1) {
          ctx.beginPath(); ctx.moveTo(rx + rw / 2, y + 18); ctx.lineTo(rx + rw / 2, y + 24); ctx.stroke();
        }
      });

      /* —— 右下:压蔗速度 —— */
      var by = gy0 + 104;
      ctx.fillStyle = ink; ctx.textAlign = "left";
      ctx.font = "700 11px sans-serif";
      ctx.fillText("压蔗速度", rx, by - 6);
      ctx.strokeStyle = waterC; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(rx, by + 12); ctx.lineTo(rx + rw * 0.72, by + 12); ctx.stroke();
      ctx.fillStyle = ink;
      ctx.font = "600 9px Menlo, monospace";
      ctx.fillText("v = ω·r辊 = 0.5 × 0.24 = 0.12 m/s", rx, by + 26);

      /* —— 底部:部件链 —— */
      var boxes2 = [
        ["拽杆", "2.6m · 牛曳"], ["齿轮对", "18T 外啮合"], ["左石辊", "r 0.24 · 正向"],
        ["右石辊", "r 0.24 · 反向"], ["甘蔗", "横送过隙压扁"], ["汁盘", "蔗汁渐涨"]
      ];
      var bwid = (w * 0.94) / boxes2.length;
      for (var b = 0; b < boxes2.length; b++) {
        var bx2 = w * 0.03 + b * bwid;
        ctx.strokeStyle = ink; ctx.lineWidth = 1.2;
        ctx.strokeRect(bx2, chainY, bwid - 10, 50);
        ctx.fillStyle = ink;
        ctx.font = "700 9.5px sans-serif"; ctx.textAlign = "center";
        ctx.fillText(boxes2[b][0], bx2 + (bwid - 10) / 2, chainY + 19);
        ctx.font = "600 8px Menlo, monospace";
        ctx.fillStyle = faint;
        ctx.fillText(boxes2[b][1], bx2 + (bwid - 10) / 2, chainY + 34);
        if (b < boxes2.length - 1) {
          ctx.beginPath();
          ctx.moveTo(bx2 + bwid - 10, chainY + 24);
          ctx.lineTo(bx2 + bwid - 2, chainY + 24);
          ctx.stroke();
        }
      }
    },
    table:
      '<h4>辊系</h4><table>' +
      '<tr><th>双石辊</th><td>r 0.24 m · 高 0.90 m · 心距 0.54 m</td><td>辊隙 0.06 m</td></tr>' +
      '<tr><th>顶齿轮</th><td>Z = 18 等齿 · 节圆 r 0.30 · 外啮合</td><td>i = 1(反向)</td></tr>' +
      '<tr><th>拽杆</th><td>长 2.60 m · 装左辊顶 · 牛曳旋转</td><td>ω 0.5 rad/s</td></tr>' +
      '<tr><th>汁盘</th><td>1.30 × 0.60 m · 液面随压榨抬升</td><td>蔗汁入槽</td></tr>' +
      '</table><h4>压榨</h4><table>' +
      '<tr><th>压蔗速度</th><td>v = ω·r辊 = 0.12 m/s</td><td>蔗行 1.70 m ≈ 14 s</td></tr>' +
      '<tr><th>送蔗</th><td>沿 −z 横送 · 夹杖导向 · 压扁 62%</td><td>蔗渣出 −z</td></tr>' +
      '</table><h4>验算</h4>' +
      '<p>外啮合:等齿 Z18 → ω右 = −ω左(i = 1,严格断言);辊隙 = 2×0.27 − 2×0.24 = 0.06(严格断言)。</p>' +
      '<p>运行期 errPos = 拽杆梢点 vs 解析(ψ 绕左辊轴)≈ 0。</p>' +
      '<h4>文献</h4>' +
      '<p>《天工开物·甘嗜》蔗车:「二象斗……牛曳拽杆旋转,蔗过隙中压榨」——双立石辊顶齿轮外啮合反向,榨汁入盘。</p>'
  };
})(window.MECH = window.MECH || {});
