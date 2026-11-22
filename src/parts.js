/* 蔗车部件建模与注册(10 件)。
   坐标系:y 上;双立石辊(轴 y),辊面 x-z,辊心 x ±0.27;顶齿轮外啮合;
   拽杆装左辊顶随转;蔗沿 −z 送入压扁。全部几何在地面之上。 */
(function (MECH) {
  var P = MECH.P, M3 = null, D = MECH.DIM, KS = MECH.KS;

  function group() { return new THREE.Group(); }
  function mkAnchor(x, y, z) {
    var o = new THREE.Object3D();
    o.position.set(x, y, z);
    o.userData.tagAnchor = new THREE.Vector3(0, 0, 0);
    return o;
  }

  var _stone = null;
  function stoneMat() {
    if (!_stone) {
      var c = document.createElement("canvas");
      c.width = c.height = 128;
      var x = c.getContext("2d");
      x.fillStyle = "#7B7E84";
      x.fillRect(0, 0, 128, 128);
      for (var i = 0; i < 500; i++) {
        var g = 100 + Math.random() * 40;
        x.fillStyle = "rgba(" + (g | 0) + "," + (g + 3 | 0) + "," + (g + 8 | 0) + ",0.5)";
        x.fillRect(Math.random() * 128, Math.random() * 128, 2.5, 2.5);
      }
      var t = new THREE.CanvasTexture(c);
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(2, 2);
      t.encoding = THREE.sRGBEncoding;
      _stone = new THREE.MeshStandardMaterial({ map: t, roughness: 0.92, metalness: 0.03 });
    }
    return _stone;
  }

  function diskGear(Z, r, thick, mat) {   // 盘齿(平面 x-z,轴 y)
    var g = group();
    var disc = P.cyl(r * 0.88, r * 0.88, thick, mat, 0, 0, 0, 32);
    g.add(disc);
    for (var i = 0; i < Z; i++) {
      var a = i / Z * Math.PI * 2;
      var t = P.box(r * 0.22, thick * 0.94, 0.034, mat, Math.cos(a) * (r - 0.008), 0, Math.sin(a) * (r - 0.008));
      t.rotation.y = -a;
      g.add(t);
    }
    var hub = P.cyl(0.07, 0.07, thick + 0.08, M3.woodD, 0, 0, 0, 14);
    g.add(hub);
    return g;
  }

  /* —— 部件构建器 —— */

  function buildBase() {     // 基座:石台 + 双辊凹座
    var g = group();
    g.add(P.box(1.50, 0.16, 0.90, stoneMat(), 0, 0.08, 0));
    [[-D.xGap, 0], [D.xGap, 0]].forEach(function (p) {
      g.add(P.cyl(D.rRoller + 0.03, D.rRoller + 0.03, 0.05, M3.stone, p[0], 0.185, p[1], 24));
    });
    return { group: g, anchor: mkAnchor(0.55, 0.2, 0.35) };
  }

  function buildTray() {     // 汁盘:石盘 + 蔗汁(液面随压蔗抬升)
    var g = group();
    var slab = new THREE.MeshStandardMaterial({ color: 0x82868C, roughness: 0.88, metalness: 0.04 });
    g.add(P.box(D.trayW, 0.05, D.trayD * 2, slab, 0.55, 0.025, -0.55));
    g.add(P.box(D.trayW, D.trayH, 0.05, slab, 0.55, D.trayH / 2 + 0.05, -D.trayD - 0.55));
    g.add(P.box(D.trayW, D.trayH, 0.05, slab, 0.55, D.trayH / 2 + 0.05, D.trayD - 0.55));
    g.add(P.box(0.05, D.trayH, D.trayD * 2, slab, 0.55 - D.trayW / 2, D.trayH / 2 + 0.05, -0.55));
    g.add(P.box(0.05, D.trayH, D.trayD * 2, slab, 0.55 + D.trayW / 2, D.trayH / 2 + 0.05, -0.55));
    var water = P.mesh(new THREE.PlaneGeometry(D.trayW - 0.08, D.trayD * 2 - 0.08), M3.water,
      0.55, D.trayWater + 0.04, -0.55);
    water.rotation.x = -Math.PI / 2;
    water.castShadow = false;
    g.add(water);
    g.userData.water = water;
    return { group: g, anchor: mkAnchor(0.95, D.trayH + 0.06, -0.55) };
  }

  function buildRoller(side) { // 立石辊 + 顶齿轮(轴 y;side=−1 左 / +1 右)
    var g = group();
    var roll = P.cyl(D.rRoller, D.rRoller, D.rollerH, stoneMat(), 0, D.rollerH / 2, 0, 26);
    g.add(roll);
    var cap = P.cyl(D.rRoller - 0.02, D.rRoller - 0.02, 0.06, M3.woodD, 0, D.rollerH + 0.03, 0, 22);
    g.add(cap);
    var gear = diskGear(D.gearZT, D.gearR, 0.09, plankLocal());
    gear.position.y = D.gearY;
    g.add(gear);
    g.userData.gear = gear;
    return { group: g, anchor: mkAnchor(side * (D.rRoller - 0.05), D.rollerH * 0.6, 0.24) };
  }

  var _plank = null;
  function plankLocal() {
    if (!_plank) {
      var c = document.createElement("canvas");
      c.width = c.height = 128;
      var x = c.getContext("2d");
      x.fillStyle = "#9A6B33";
      x.fillRect(0, 0, 128, 128);
      for (var i = 0; i < 8; i++) {
        var px = i * 16 + 1;
        x.fillStyle = (i % 2) ? "#8A5E2B" : "#A97844";
        x.fillRect(px, 0, 14, 128);
        x.strokeStyle = "rgba(58,36,12,0.6)";
        x.lineWidth = 1.6;
        x.strokeRect(px, 0, 14, 128);
      }
      var t = new THREE.CanvasTexture(c);
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(2, 1);
      t.encoding = THREE.sRGBEncoding;
      _plank = new THREE.MeshStandardMaterial({ map: t, roughness: 0.84, metalness: 0.04 });
    }
    return _plank;
  }

  function buildSweep() {    // 拽杆:横木杆装左辊顶(随左辊转)+ 牛轭钩
    var g = group();
    g.add(P.box(D.sweepLen, 0.09, 0.09, plankLocal(), D.sweepLen / 2, 0, 0));
    g.add(P.box(0.16, 0.10, 0.16, M3.iron, 0, 0, 0));
    var hook = P.torus(0.09, 0.02, M3.iron, D.sweepLen - 0.06, -0.06, 0, 14);
    g.add(hook);
    return { group: g, anchor: mkAnchor(D.sweepLen - 0.1, 0.1, 0) };
  }

  function buildGuide() {    // 夹杖:蔗槽导杆(送蔗导向)
    var g = group();
    [[-0.34, 0], [0.34, 0]].forEach(function (p) {
      var post = P.cyl(0.035, 0.045, 0.55, M3.woodD, p[0], 0.28, D.feedGuideZ);
      post.rotation.z = p[0] > 0 ? -0.22 : 0.22;
      g.add(post);
    });
    g.add(P.box(0.68, 0.04, 0.05, plankLocal(), 0, 0.20, D.feedGuideZ + 0.18));
    return { group: g, anchor: mkAnchor(0.36, 0.5, D.feedGuideZ) };
  }

  function buildCane(idx) {  // 甘蔗:长秆(z 向,受压扁)
    var g = group();
    var cane = new THREE.MeshStandardMaterial({ color: 0x9C8B4F, roughness: 0.55, metalness: 0.04 });
    var body = P.cyl(D.caneR, D.caneR * 0.85, D.caneLen, cane, 0, 0, 0, 12);
    body.rotation.x = P.ROTX;
    g.add(body);
    for (var i = 1; i < 6; i++) {
      var ring = P.torus(D.caneR - 0.002, 0.006, cane, 0, 0, -D.caneLen / 2 + i * D.caneLen / 6, 12);
      ring.rotation.x = P.ROTX;
      g.add(ring);
    }
    var top = P.mesh(new THREE.ConeGeometry(0.05, 0.16, 8), new THREE.MeshStandardMaterial({ color: 0x7A8B4F, roughness: 0.8 }), 0, 0, -D.caneLen / 2 - 0.06);
    top.rotation.x = Math.PI / 2;
    g.add(top);
    return { group: g, anchor: g };
  }

  /* —— 注册 —— */
  MECH.PART_DEFS = function () {
    M3 = MECH.Scene3D.M;
    function def(o) { return MECH._def(o); }

    def({ id: "base", name: "BASE · 基座", sub: "石台 + 双辊凹座", phase: 0, at: 0.2, dur: 1.3,
      build: buildBase, target: [0, 0, 0], start: [0, 4.0, 0], mid: [0, 2.0, 0] });
    def({ id: "tray", name: "JUICE TRAY · 汁盘", sub: "石盘 · 蔗汁入槽", phase: 1, at: 4.4, dur: 1.2,
      build: buildTray, target: [0, 0, 0], start: [0.8, 3.6, -0.8], mid: [0.6, 1.8, -0.4] });

    def({ id: "rollerL", name: "ROLLER · 左石辊", sub: "r 0.24 · 顶齿轮 18T", phase: 2, at: 8.6, dur: 1.3, kind: "kine",
      build: function () { return buildRoller(-1); }, target: [-D.xGap, 0.16, 0], off: [-0.8, 2.2, 0.7] });
    def({ id: "rollerR", name: "ROLLER · 右石辊", sub: "r 0.24 · 外啮合反向", phase: 2, at: 9.4, dur: 1.3, kind: "kine",
      build: function () { return buildRoller(1); }, target: [D.xGap, 0.16, 0], off: [0.9, 2.4, 0.7] });

    def({ id: "sweep", name: "SWEEP · 拽杆", sub: "长 2.6m · 牛曳旋转", phase: 3, at: 13.6, dur: 1.4, kind: "screw",
      build: buildSweep, target: [-D.xGap, D.gearY, 0], start: [1.4, 3.6, 0.6], mid: [0.6, 1.8, 0.3] });
    def({ id: "guide", name: "GUIDE · 夹杖", sub: "蔗槽导杆 · 对准辊隙", phase: 3, at: 14.6, dur: 1.1,
      build: buildGuide, target: [0, 0, 0], start: [0.5, 3.2, 0.8], mid: [0.3, 1.6, 0.4] });

    def({ id: "cane1", name: "CANE · 甘蔗 1", sub: "横送过隙 · 压扁出汁", phase: 4, at: 19.0, dur: 1.2, kind: "kine",
      build: function () { return buildCane(1); }, target: [0, D.caneY, D.caneZ0], off: [0.4, 1.6, 0.9] });
    def({ id: "cane2", name: "CANE · 甘蔗 2", sub: "候压 · 排队", phase: 4, at: 19.9, dur: 1.2, kind: "kine",
      build: function () { return buildCane(2); }, target: [0, D.caneY + 0.02, D.caneZ0 + 0.42], off: [0.6, 1.8, 1.0] });
  };

  /* —— 运动学分发 ——
     ψ:左辊角(拽杆同角);右辊 = −ψ(外啮合反向);
     蔗受压:z 向牵出 + 压扁(scale.y 0.4)+ 出汁(汁面抬升);
     errPos = 拽杆梢点 vs 解析(ψ 绕左辊轴),应≈0。 */
  var _wp = new THREE.Vector3();
  MECH.KINE = function (st) {
    var psi = st.psi || 0;
    var prog = st.pressProg || 0;

    var rl = MECH.Parts.entry("rollerL");
    if (rl && rl.shown) rl.group.rotation.y = psi;
    var rr = MECH.Parts.entry("rollerR");
    if (rr && rr.shown) rr.group.rotation.y = -psi;
    var sw = MECH.Parts.entry("sweep");
    if (sw && sw.sealed) sw.group.rotation.y = psi;

    st.errPos = 0;
    if (sw && sw.sealed) {
      sw.group.updateWorldMatrix(true, false);
      _wp.set(D.sweepLen - 0.06, -0.06, 0).applyMatrix4(sw.group.matrixWorld);
      var ax = -D.xGap + Math.cos(psi) * (D.sweepLen - 0.06);
      var az = -Math.sin(psi) * (D.sweepLen - 0.06);
      var dx = _wp.x - ax, dz = _wp.z - az;
      st.errPos = Math.sqrt(dx * dx + dz * dz);
    }

    /* 蔗 1 受压:沿 −z 牵出 + 压扁 */
    var c1 = MECH.Parts.entry("cane1");
    if (c1 && c1.sealed) {
      c1.group.position.set(0, D.caneY - 0.02 * prog, D.caneZ0 - D.caneTravel * prog);
      c1.group.scale.y = 1 - 0.62 * prog;
    }
    /* 蔗 2 候压/受压(phase 8) */
    var c2 = MECH.Parts.entry("cane2");
    if (c2 && c2.sealed) {
      var p2 = st.pressProg2 || 0;
      c2.group.position.set(0, D.caneY + 0.02 - 0.02 * p2, D.caneZ0 + 0.42 - D.caneTravel * p2);
      c2.group.scale.y = 1 - 0.62 * p2;
    }

    /* 汁面抬升 */
    var tr = MECH.Parts.entry("tray");
    if (tr && tr.sealed && tr.group.userData.water) {
      tr.group.userData.water.position.y = D.trayWater + 0.04 + 0.02 * prog;
    }
  };
})(window.MECH = window.MECH || {});
