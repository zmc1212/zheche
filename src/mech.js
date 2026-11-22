/* 蔗车 — 尺寸常量与双石辊外啮合运动学求解器
   文献依据:《天工开物·甘嗜》蔗车:「二象斗(双石辊)……上横板穿钩取力,
   牛曳拽杆旋转,蔗过隙中压榨」——双立石辊顶木齿轮等齿外啮合反向,
   拽杆装于一辊顶随转,甘蔗横送过竖隙压扁,蔗汁入盘。

   运动学(载入期断言):
     左辊 x = −0.27,右辊 x = +0.27,r辊 = 0.24 → 辊隙 = 2×0.27 − 2×0.24 = 0.06
     顶齿轮等齿 Z18,节圆 r 0.30,外啮合 → ω右 = −ω左(i = 1,严格)
     拽杆长 2.6m 装于左辊顶,rotation.y = ψ左
     压蔗速度 v = ω·r辊 = 0.5 × 0.24 = 0.12 m/s(蔗过 1.65m 约 13.8s)
     断言:i = 1 严格、辊隙 0.06 严格、v压 ∈ (0.08, 0.2)、蔗槽对准辊隙。
   坐标系:y 上;双辊立轴(轴 y),辊面 x-z;蔗沿 −z 送入,压扁出 −z 侧。
   全部几何位于全球地面之上(辊高 0.90,汁盘深 0.12)。 */
(function (MECH) {
  var D = {
    rRoller: 0.24, xGap: 0.27, rollerH: 0.90,
    gearZT: 18, gearR: 0.30, gearY: 0.98,
    sweepLen: 2.60, sweepY: 1.05,
    omega: 0.5,
    trayW: 1.30, trayD: 0.30, trayH: 0.14, trayWater: 0.05,
    caneLen: 1.65, caneR: 0.024, caneY: 0.55, caneZ0: 0.85, caneZ1: -0.85,
    feedGuideZ: 0.72
  };
  D.nipGap = 2 * D.xGap - 2 * D.rRoller;   // 0.06
  D.i = 1;
  D.vPress = D.omega * D.rRoller;          // 0.12
  D.caneTravel = D.caneZ0 - D.caneZ1;      // 1.70

  function deg(a) { return a * 180 / Math.PI; }
  function rad(a) { return a * Math.PI / 180; }
  function ease(t) { return MECH.P.easeInOut(t); }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }

  MECH.DIM = D;
  MECH.KS = { deg: deg, rad: rad, ease: ease, clamp: clamp };

  /* 载入期自检 */
  (function selfCheck() {
    var msg = null;
    if (Math.abs(D.i - 1) > 1e-12) {
      msg = "蔗车传动比自检失败: i = " + D.i + " ≠ 1";
    } else if (Math.abs(D.nipGap - 0.06) > 1e-9) {
      msg = "蔗车辊隙自检失败: " + D.nipGap + " ≠ 0.06";
    } else if (!(D.vPress > 0.08 && D.vPress < 0.2)) {
      msg = "蔗车压蔗速度自检失败: v = " + D.vPress;
    } else if (D.caneR * 2 > D.nipGap) {
      msg = "蔗车断言失败: 蔗径大于辊隙(蔗以形变过隙,应先压后薄)";
    }
    if (msg) {
      if (window.MECH_SHOW_BOOT_ERROR) window.MECH_SHOW_BOOT_ERROR(msg);
      throw new Error(msg);
    }
  })();
})(window.MECH = window.MECH || {});
