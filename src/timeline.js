/* 时间线(46.5s 自动循环):前 5 段装配、后 3 段运转。
   ψ(左辊角)/ pressProg / pressProg2 为 (阶段 id, 阶段内时间 pt) 的确定函数:
     阶段 1-4:ψ = 0;阶段 5(空转):ψ 坡起恒速 0.5 rad/s;
     阶段 6(压蔗):恒速 + pressProg 0→1(蔗 1 过隙压扁出汁);
     阶段 7(循环):蔗 2 续压(pressProg2)。 */
(function (MECH) {
  var KS = MECH.KS, D = MECH.DIM;
  var S6END = 0.333 + 0.5 * 0.5;   // 空转段结束框角(坡起 + 恒速)

  MECH.PHASES = [
    { id: "base", name: "BASE · 石台基座", dur: 4.0, dot: "yellow", mode: "ASSEMBLY",
      cam: { theta: 0.55, phi: 1.14, r: 6.2, target: [0.3, 0.4, 0] }, drift: 0.03 },
    { id: "tray", name: "TRAY · 汁盘", dur: 4.0, dot: "teal", mode: "ASSEMBLY",
      cam: { theta: -0.50, phi: 1.14, r: 5.0, target: [0.55, 0.3, -0.55] }, drift: 0.02 },
    { id: "rollers", name: "ROLLERS · 双石辊", dur: 5.0, dot: "orange", mode: "ASSEMBLY",
      cam: { theta: -0.50, phi: 1.10, r: 5.2, target: [0, 0.6, 0] }, drift: 0.02 },
    { id: "gears", name: "SWEEP · 拽杆夹杖", dur: 5.0, dot: "pink", mode: "ASSEMBLY",
      cam: { theta: 0.85, phi: 1.08, r: 5.6, target: [0.3, 1.0, 0.2] }, drift: 0.015 },
    { id: "canes", name: "CANE · 双蔗候压", dur: 4.0, dot: "green", mode: "ASSEMBLY",
      cam: { theta: -0.35, phi: 1.08, r: 5.0, target: [0, 0.6, 0.5] }, drift: 0.015 },
    { id: "idle", name: "IDLE · 空转试车", dur: 4.5, dot: "blue", mode: "IDLE",
      cam: { theta: 0.60, phi: 1.06, r: 6.4, target: [0.2, 0.7, 0] }, drift: 0.012 },
    { id: "press", name: "PRESS · 压蔗出汁", dur: 9.0, dot: "yellow", mode: "PRESSING",
      cam: { theta: 0.55, phi: 1.04, r: 5.4, target: [0, 0.55, 0.1] }, drift: 0.012 },
    { id: "cycle", name: "CYCLE · 连续压蔗", dur: 13.0, dot: "red", mode: "PRESSING",
      cam: { theta: 0.75, phi: 1.06, r: 7.2, target: [0.4, 0.6, 0] }, drift: 0.01 }
  ];
  MECH.PHASE_IDS = ["base", "tray", "rollers", "gears", "canes", "idle", "press", "cycle"];

  MECH.newState = function () {
    return {
      time: 0, psi: 0, omega: 0, pressProg: 0, pressProg2: 0, errPos: 0,
      seated: 0, phaseId: "", _dripAcc: 0
    };
  };

  /* ψ / pressProg 脚本(纯函数) */
  function scriptPhase(ph, pt) {
    var psi = 0, om = 0, p1 = 0, p2 = 0;
    if (ph.id === "idle") {
      var tau = KS.clamp((pt - 2.0) / 2.0, 0, 1);
      if (tau < 1) { psi = 0.333 * tau * tau * tau; om = 0.5 * tau * tau; }
      else { psi = 0.333 + 0.5 * (pt - 4.0); om = 0.5; }
    } else if (ph.id === "press") {
      psi = S6END + 0.5 * pt;
      om = 0.5;
      p1 = KS.clamp((pt - 0.8) / 6.5, 0, 1);
    } else if (ph.id === "cycle") {
      psi = S6END + 4.5 + 0.5 * pt;
      om = 0.5;
      var c = pt % 6.5;
      p2 = KS.clamp((c - 0.8) / 5.2, 0, 1);
    }
    return { psi: psi, om: om, p1: p1, p2: p2 };
  }

  MECH.tick = function (st, ph, pt, dt) {
    st.time += dt;
    var s = scriptPhase(ph, pt);
    st.psi = s.psi; st.omega = s.om; st.pressProg = s.p1; st.pressProg2 = s.p2;
    st.phaseId = ph.id;

    /* 压蔗出汁滴落 */
    if ((s.p1 > 0.05 && s.p1 < 0.95) || (s.p2 > 0.05 && s.p2 < 0.95)) {
      st._dripAcc += dt;
      while (st._dripAcc > 0.20) {
        st._dripAcc -= 0.20;
        MECH.Scene3D.spawnPuff(0.55 + (Math.random() - 0.5) * 0.5, D.trayWater + 0.12, -0.55 + (Math.random() - 0.5) * 0.3,
          { max: 0.5, base: 0.20, vy: -0.6, vx: 0.1, tint: 0xBFE3D0, opacity: 0.55 });
      }
    }
  };

  MECH.camAdj = function (st, ph, pt) {
    if (ph.id === "press") {
      if (pt > 0.8 && pt < 7.3) return { phi: 0.8, r: 4.0, target: [0, 0.5, 0.1] };
      return null;
    }
    if (ph.id === "cycle") {
      var c = pt % 6.5;
      if (c > 0.8 && c < 6.0) return { phi: 0.8, r: 4.0, target: [0, 0.5, 0.1] };
      return null;
    }
    return null;
  };

  MECH.status = function (st, ph, pt) {
    var hot = ph.id === "press" || ph.id === "cycle";
    return {
      mode: ph.mode,
      hot: hot,
      pill: ph.name + " · ω右 " + (-st.omega).toFixed(1) + " / ω左 " + st.omega.toFixed(1),
      a: st.psi.toFixed(1) + " rad",
      b: "-" + st.omega.toFixed(1) + " / +" + st.omega.toFixed(1),
      c: Math.round((st.pressProg || 0) * 100) + "%"
    };
  };

  MECH.pinnedFor = function (ph) {
    function E(id) { var e = MECH.Parts.entry(id); return e ? (e.anchor || e.group) : null; }
    if (ph.id === "rollers") {
      return [
        { id: "p-rl", obj: E("rollerL"), text: "左石辊 r 0.24 · 顶齿轮 18T" },
        { id: "p-rr", obj: E("rollerR"), text: "右石辊 · 外啮合反向", tone: "white" }
      ];
    }
    if (ph.id === "gears") {
      return [
        { id: "p-sw", obj: E("sweep"), text: "拽杆 2.6m · 牛曳旋转" },
        { id: "p-gd", obj: E("guide"), text: "夹杖 · 对准辊隙", tone: "white" }
      ];
    }
    if (ph.id === "canes") {
      return [{ id: "p-c1", obj: E("cane1"), text: "甘蔗 · 横送过隙", tone: "white" }];
    }
    if (ph.id === "press") {
      return [
        { id: "p-c2", obj: E("cane1"), text: "压扁过隙 · 蔗汁入盘" },
        { id: "p-tr", obj: E("tray"), text: "汁盘 · 液面渐涨", tone: "white" }
      ];
    }
    if (ph.id === "cycle") {
      return [
        { id: "p-sw2", obj: E("sweep"), text: "ω右 = −ω左 · i=1 外啮合" },
        { id: "p-c3", obj: E("cane2"), text: "连续压蔗", tone: "white" }
      ];
    }
    return [];
  };
})(window.MECH = window.MECH || {});
