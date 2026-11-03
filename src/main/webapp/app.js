/* =========================================================================
   校园社团活动报名与签到系统 —— 本地版
   数据存 localStorage，无后端、无数据库，双击 index.html 即可运行。
   ========================================================================= */
'use strict';

/* ---------- 图标库（内联 SVG） ---------- */
const ICONS = {
  calendar: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
  pin: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
  users: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  clock: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  search: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
  back: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>',
  check: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
  plus: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  edit: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>',
  trash: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>',
  bar: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>',
};

/* ---------- 工具函数 ---------- */
function uid() { return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8); }
function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}
function fmtDate(d) {
  const dt = new Date(d);
  if (isNaN(dt)) return '—';
  const p = n => String(n).padStart(2, '0');
  return `${dt.getFullYear()}-${p(dt.getMonth()+1)}-${p(dt.getDate())} ${p(dt.getHours())}:${p(dt.getMinutes())}`;
}
function fmtDay(d) { const dt = new Date(d); const p = n => String(n).padStart(2,'0'); return `${dt.getFullYear()}-${p(dt.getMonth()+1)}-${p(dt.getDate())}`; }
function isPast(d) { return new Date(d) < new Date(); }

/* ---------- 数据存储 ---------- */
const LS_KEY = 'club_activity_system_v1';

/* 预设账号：学生用学号登录，管理员用管理员账号登录 */
const ACCOUNTS = [
  { account: 'student', password: '123456', role: 'student', name: '张小明' },
  { account: 'admin',   password: 'admin123', role: 'admin', name: '社团管理员' },
];

let state = {
  loggedIn: false,
  role: 'student',
  user: null,
  activities: [], registrations: [], checkIns: [],
  me: { name: '张小明', studentId: '20240001', college: '计算机学院', phone: '13800001111' },
};

function load() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      state.activities = parsed.activities || [];
      state.registrations = parsed.registrations || [];
      state.checkIns = parsed.checkIns || [];
      if (parsed.loggedIn) state.loggedIn = true;
      if (parsed.role) state.role = parsed.role;
      if (parsed.user) state.user = parsed.user;
      if (parsed.me) state.me = parsed.me;
      return;
    }
  } catch (e) { /* 忽略损坏数据，重新播种 */ }
  seed();
}
function save() {
  localStorage.setItem(LS_KEY, JSON.stringify({
    loggedIn: state.loggedIn, role: state.role, user: state.user,
    activities: state.activities, registrations: state.registrations,
    checkIns: state.checkIns, me: state.me,
  }));
}
function resetData() { localStorage.removeItem(LS_KEY); state.loggedIn=false; state.user=null; seed(); state.loggedIn=false; state.user=null; render(); toast('已重置为示例数据', 'success'); }

/* ---------- 示例数据 ---------- */
function seed() {
  try { localStorage.removeItem(LS_KEY); } catch (e) {}
  const now = new Date();
  const day = 86400000;
  const d = (offset, h) => { const t = new Date(now.getTime() + offset*day); t.setHours(h, 0, 0, 0); return t.toISOString(); };
  const m = (offset, h, min) => { const t = new Date(now.getTime() + offset*day); t.setHours(h, min == null ? 0 : min, 0, 0); return t.toISOString(); };

  const acts = [
    { id: 'a1', name: '校园马拉松 · 春季赛', description: '全程约 5 公里，环绕校园主路跑。设男女冠亚季军，完赛发放纪念奖牌与素质拓展学分证明。报名即日起至开赛前一天。', location: '学校东门广场', startTime: d(3, 8), endTime: d(3, 11), registrationDeadline: d(2, 18), capacity: 200, status: 'active', organizer: '跑步爱好者协会' },
    { id: 'a2', name: '编程马拉松 Hackathon', description: '24 小时团队编程挑战赛，主题为「智慧校园」。三人一组，现场提供餐饮与夜宵，决赛路演评选最佳创意与最佳工程奖。', location: '信息楼 3 层报告厅', startTime: d(5, 9), endTime: d(6, 9), registrationDeadline: d(4, 20), capacity: 120, status: 'active', organizer: 'ACM 算法协会' },
    { id: 'a3', name: '校园歌手大赛海选', description: '面向全体在校生，演唱曲目自选，海选阶段清唱 90 秒。晋级选手进入复赛，现场由评委与观众投票。', location: '大学生活动中心', startTime: d(7, 19), endTime: d(7, 22), registrationDeadline: d(6, 21), capacity: 80, status: 'active', organizer: '音乐社' },
    { id: 'a4', name: '二手书市集', description: '毕业季二手书与闲置物品交换市集，可自由摆摊或淘书。社团提供场地与桌椅，现场设捐赠回收角。', location: '图书馆门前广场', startTime: d(-2, 14), endTime: d(-2, 18), registrationDeadline: d(-4, 18), capacity: 60, status: 'closed', organizer: '青年志愿者协会' },
    { id: 'a5', name: '新生迎新晚会', description: '欢迎新同学的迎新联欢晚会，各社团联合演出，含乐队、舞蹈、相声与互动抽奖环节。', location: '学校大礼堂', startTime: d(-6, 19), endTime: d(-6, 21), registrationDeadline: d(-8, 12), capacity: 500, status: 'closed', organizer: '校学生会' },
    { id: 'a6', name: '无人机航拍分享会', description: '由航拍达人分享无人机运镜、剪辑与后期技巧，现场可体验模拟飞行。', location: '创新中心 A 座', startTime: d(9, 15), endTime: d(9, 17), registrationDeadline: d(8, 18), capacity: 40, status: 'draft', organizer: '摄影协会' },
  ];

  const regs = [
    { id: 'r1', activityId: 'a1', studentName: '张小明', studentId: '20240001', college: '计算机学院', phone: '13800001111', status: 'approved', createdAt: m(-3, 10) },
    { id: 'r2', activityId: 'a1', studentName: '李华', studentId: '20230012', college: '外国语学院', phone: '13900002222', status: 'approved', createdAt: m(-3, 11) },
    { id: 'r3', activityId: 'a1', studentName: '王芳', studentId: '20220034', college: '经管学院', phone: '13700003333', status: 'approved', createdAt: m(-2, 9) },
    { id: 'r4', activityId: 'a1', studentName: '赵强', studentId: '20210056', college: '机械学院', phone: '13600004444', status: 'pending', createdAt: m(-1, 15) },
    { id: 'r5', activityId: 'a2', studentName: '陈静', studentId: '20240078', college: '计算机学院', phone: '13500005555', status: 'approved', createdAt: m(-4, 14) },
    { id: 'r6', activityId: 'a2', studentName: '刘洋', studentId: '20240090', college: '电子学院', phone: '13400006666', status: 'approved', createdAt: m(-3, 16) },
    { id: 'r7', activityId: 'a2', studentName: '孙丽', studentId: '20210102', college: '计算机学院', phone: '13300007777', status: 'pending', createdAt: m(-1, 10) },
    { id: 'r8', activityId: 'a3', studentName: '周杰', studentId: '20220114', college: '音乐学院', phone: '13200008888', status: 'approved', createdAt: m(-5, 13) },
    { id: 'r9', activityId: 'a3', studentName: '吴敏', studentId: '20200126', college: '文学院', phone: '13100009999', status: 'approved', createdAt: m(-4, 17) },
    { id: 'r10', activityId: 'a4', studentName: '郑凯', studentId: '20190138', college: '土木学院', phone: '13000001000', status: 'approved', createdAt: m(-5, 9) },
    { id: 'r11', activityId: 'a4', studentName: '何婷', studentId: '20200140', college: '经管学院', phone: '13911112222', status: 'approved', createdAt: m(-4, 10) },
    { id: 'r12', activityId: 'a4', studentName: '林峰', studentId: '20220152', college: '材料学院', phone: '13822223333', status: 'cancelled', createdAt: m(-4, 12) },
    { id: 'r13', activityId: 'a5', studentName: '黄蓉', studentId: '20240164', college: '艺术设计学院', phone: '13733334444', status: 'approved', createdAt: m(-7, 9) },
    { id: 'r14', activityId: 'a5', studentName: '徐飞', studentId: '20220176', college: '体育学院', phone: '13644445555', status: 'approved', createdAt: m(-7, 11) },
    { id: 'r15', activityId: 'a5', studentName: '马超', studentId: '20230188', college: '理学院', phone: '13555556666', status: 'approved', createdAt: m(-6, 14) },
    { id: 'r16', activityId: 'a5', studentName: '高远', studentId: '20240190', college: '计算机学院', phone: '13466667777', status: 'approved', createdAt: m(-6, 16) },
    { id: 'r17', activityId: 'a5', studentName: '朱琳', studentId: '20200202', college: '外国语学院', phone: '13377778888', status: 'approved', createdAt: m(-5, 10) },
    { id: 'r18', activityId: 'a5', studentName: '罗明', studentId: '20210214', college: '经管学院', phone: '13288889999', status: 'cancelled', createdAt: m(-5, 12) },
    { id: 'r19', activityId: 'a5', studentName: '梁爽', studentId: '20240226', college: '医学院', phone: '13199990000', status: 'approved', createdAt: m(-4, 15) },
    { id: 'r20', activityId: 'a5', studentName: '秦朗', studentId: '20230238', college: '自动化学院', phone: '13011110000', status: 'approved', createdAt: m(-3, 9) },
  ];

  const checks = [
    { id: 'c1', activityId: 'a4', registrationId: 'r10', studentName: '郑凯', studentId: '20190138', checkInTime: m(-2, 13, 30) },
    { id: 'c2', activityId: 'a4', registrationId: 'r11', studentName: '何婷', studentId: '20200140', checkInTime: m(-2, 13, 45) },
    { id: 'c3', activityId: 'a5', registrationId: 'r13', studentName: '黄蓉', studentId: '20240164', checkInTime: m(-6, 18, 40) },
    { id: 'c4', activityId: 'a5', registrationId: 'r14', studentName: '徐飞', studentId: '20220176', checkInTime: m(-6, 18, 55) },
    { id: 'c5', activityId: 'a5', registrationId: 'r15', studentName: '马超', studentId: '20230188', checkInTime: m(-6, 19, 5) },
    { id: 'c6', activityId: 'a5', registrationId: 'r16', studentName: '高远', studentId: '20240190', checkInTime: m(-6, 19, 12) },
    { id: 'c7', activityId: 'a5', registrationId: 'r17', studentName: '朱琳', studentId: '20200202', checkInTime: m(-6, 19, 20) },
    { id: 'c8', activityId: 'a5', registrationId: 'r19', studentName: '梁爽', studentId: '20240226', checkInTime: m(-6, 19, 28) },
  ];

  state.activities = acts; state.registrations = regs; state.checkIns = checks;
  save();
}

/* ---------- 业务辅助 ---------- */
function getActivity(id) { return state.activities.find(a => a.id === id); }
function getRegistrations(activityId) { return state.registrations.filter(r => r.activityId === activityId); }
function countApproved(activityId) { return state.registrations.filter(r => r.activityId === activityId && r.status === 'approved').length; }
function countCheckIn(activityId) { return state.checkIns.filter(c => c.activityId === activityId).length; }
function hasCheckedIn(activityId, studentId) { return state.checkIns.some(c => c.activityId === activityId && c.studentId === studentId); }
function statusText(status) {
  return { active: '报名中', closed: '已结束', draft: '未发布', pending: '待审核', approved: '已通过', cancelled: '已取消' }[status] || status;
}
function activityBadge(status) {
  const cls = status === 'active' ? 'active' : status === 'closed' ? 'closed' : 'draft';
  return `<span class="badge ${cls}">${statusText(status)}</span>`;
}

/* ---------- 渲染入口 ---------- */
const app = document.getElementById('app');
const topbar = document.getElementById('topbar');
const userArea = document.getElementById('user-area');

function render() {
  if (!state.loggedIn || !state.user) {
    topbar.style.display = 'none';
    app.innerHTML = renderLogin();
    return;
  }
  topbar.style.display = 'flex';
  userArea.innerHTML = `
    <span class="user-badge ${state.role}">
      <span class="dot"></span>${state.role === 'admin' ? '管理员' : '学生'} · ${esc(state.user.name)}
    </span>
    <button class="logout-btn" data-action="logout">退出登录</button>
  `;
  app.innerHTML = state.role === 'admin' ? renderAdmin() : renderStudent();
}

/* ===================== 登录页 ===================== */
function renderLogin() {
  return `
  <div class="login-wrap">
    <div class="login-card">
      <div class="login-logo">
        <span class="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3 7 8 1-6 5 2 8-7-4-7 4 2-8-6-5 8-1z"/></svg>
        </span>
        <div>
          <div class="login-title">校园社团活动报名与签到系统</div>
        </div>
      </div>
      <div class="login-sub">请登录后使用系统</div>
      <div class="login-error" id="login-error"></div>
      <div class="login-form">
        <div class="login-field">
          <label>账号</label>
          <input id="login-account" placeholder="请输入账号" autocomplete="off">
        </div>
        <div class="login-field">
          <label>密码</label>
          <input id="login-password" type="password" placeholder="请输入密码">
        </div>
        <button class="login-btn" data-action="do-login">登 录</button>
      </div>
    </div>
  </div>`;
}

/* ===================== 学生端 ===================== */
function renderStudent() {
  const hash = location.hash;
  if (hash.startsWith('#/activity/')) return renderStudentDetail(hash.split('/')[2]);
  if (hash === '#/my') return renderMyRegistrations();
  return renderStudentHome();
}

function studentCardList() {
  const keyword = (state._kw || '').toLowerCase();
  const statusFilter = state._st || 'all';
  let list = state.activities.slice();
  if (keyword) list = list.filter(a => (a.name + a.organizer + (a.location||'')).toLowerCase().includes(keyword));
  if (statusFilter !== 'all') list = list.filter(a => a.status === statusFilter);
  list.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

  const cards = list.map(a => {
    const cap = countApproved(a.id);
    const pct = Math.min(100, Math.round(cap / a.capacity * 100));
    const signed = getRegistrations(a.id).some(r => r.studentId === state.me.studentId && r.status === 'approved');
    return `
      <article class="card clickable" data-nav="#/activity/${a.id}">
        <div class="card-head">
          <div class="card-title">${esc(a.name)}</div>
          ${activityBadge(a.status)}
        </div>
        <p class="card-desc">${esc(a.description)}</p>
        <div class="meta">
          <span class="meta-item">${ICONS.calendar}${fmtDate(a.startTime)}</span>
          <span class="meta-item">${ICONS.pin}${esc(a.location)}</span>
          <span class="meta-item">${ICONS.users}${a.organizer}</span>
        </div>
        <div class="capacity-text">已报名 ${cap} / ${a.capacity} 人</div>
        <div class="capacity-bar"><div class="capacity-fill" style="width:${pct}%"></div></div>
        <div class="card-foot">
          ${a.status === 'active' && !isPast(a.registrationDeadline) && cap < a.capacity && !signed
            ? `<button class="btn primary sm" data-action="enroll" data-id="${a.id}">立即报名</button>`
            : signed ? `<span class="badge approved">已报名</span>`
            : cap >= a.capacity ? `<span class="badge closed">名额已满</span>`
            : a.status === 'closed' || isPast(a.registrationDeadline) ? `<span class="badge closed">报名截止</span>`
            : a.status === 'draft' ? `<span class="badge draft">未发布</span>` : ''}
          <span class="pill-count">${a.status==='active'? (cap + '/' + a.capacity) : ''}</span>
        </div>
      </article>`;
  }).join('');
  return list.length ? `<div class="card-grid">${cards}</div>` : `<div class="empty"><h4>暂无匹配的活动</h4><p>换个关键词或筛选条件试试</p></div>`;
}

function renderStudentHome() {
  return `
    <div class="page-title">活动广场</div>
    <div class="page-sub">浏览社团活动，选择感兴趣的活动报名参加</div>
    <div class="toolbar">
      <div class="search-box">${ICONS.search}<input id="kw" placeholder="搜索活动名称 / 社团 / 地点" value="${esc(state._kw || '')}"></div>
      <select class="select" id="st">
        <option value="all" ${(state._st||'all')==='all'?'selected':''}>全部状态</option>
        <option value="active" ${state._st==='active'?'selected':''}>报名中</option>
        <option value="closed" ${state._st==='closed'?'selected':''}>已结束</option>
        <option value="draft" ${state._st==='draft'?'selected':''}>未发布</option>
      </select>
      <button class="btn sm" data-action="my">${ICONS.users} 我的报名</button>
    </div>
    <div id="student-cards">${studentCardList()}</div>
  `;
}

function renderStudentDetail(id) {
  const a = getActivity(id);
  if (!a) { location.hash = ''; return renderStudentHome(); }
  const cap = countApproved(id);
  const pct = Math.min(100, Math.round(cap / a.capacity * 100));
  const myReg = getRegistrations(id).find(r => r.studentId === state.me.studentId);
  const signed = myReg && myReg.status === 'approved';
  const open = a.status === 'active' && !isPast(a.registrationDeadline) && cap < a.capacity && !signed;

  return `
    <button class="back-link" data-action="back-home">${ICONS.back} 返回活动列表</button>
    <div class="detail-hero">
      <div class="detail-title">${esc(a.name)} ${activityBadge(a.status)}</div>
      <p class="detail-desc">${esc(a.description)}</p>
      <div class="detail-meta">
        <div class="detail-meta-item"><span class="k">开始时间</span><span class="v">${fmtDate(a.startTime)}</span></div>
        <div class="detail-meta-item"><span class="k">结束时间</span><span class="v">${fmtDate(a.endTime)}</span></div>
        <div class="detail-meta-item"><span class="k">报名截止</span><span class="v">${fmtDate(a.registrationDeadline)}</span></div>
        <div class="detail-meta-item"><span class="k">活动地点</span><span class="v">${esc(a.location)}</span></div>
        <div class="detail-meta-item"><span class="k">主办社团</span><span class="v">${esc(a.organizer)}</span></div>
        <div class="detail-meta-item"><span class="k">人数上限</span><span class="v">${a.capacity} 人</span></div>
      </div>
      <div class="capacity-text" style="margin-top:16px">已报名 ${cap} / ${a.capacity} 人</div>
      <div class="capacity-bar"><div class="capacity-fill" style="width:${pct}%"></div></div>
      <div style="margin-top:20px">
        ${open ? `<button class="btn primary" data-action="enroll" data-id="${id}">立即报名</button>`
          : signed ? `<span class="badge approved">你已报名此活动</span>`
          : cap >= a.capacity ? `<span class="badge closed">名额已满</span>`
          : a.status === 'closed' || isPast(a.registrationDeadline) ? `<span class="badge closed">报名已截止</span>`
          : a.status === 'draft' ? `<span class="badge draft">活动尚未发布</span>` : ''}
      </div>
    </div>

    <div class="section-title">报名表单</div>
    <div class="form">
      <h3>填写报名信息</h3>
      ${open ? `
      <div class="form-grid">
        <div class="field"><label>姓名</label><input id="f-name" value="${esc(state.me.name)}"></div>
        <div class="field"><label>学号</label><input id="f-sid" value="${esc(state.me.studentId)}"></div>
        <div class="field"><label>学院</label><input id="f-college" value="${esc(state.me.college)}"></div>
        <div class="field"><label>联系电话</label><input id="f-phone" value="${esc(state.me.phone)}"></div>
        <div class="form-actions" style="grid-column:1/-1">
          <button class="btn primary" data-action="submit-enroll" data-id="${id}">${ICONS.check} 提交报名</button>
        </div>
      </div>`
      : `<div class="empty"><h4>当前无法报名</h4><p>活动已结束、名额已满或你已报名。</p></div>`}
    </div>
  `;
}

function renderMyRegistrations() {
  const mine = state.registrations.filter(r => r.studentId === state.me.studentId);
  const rows = mine.map(r => {
    const a = getActivity(r.activityId);
    if (!a) return '';
    const checked = hasCheckedIn(a.id, r.studentId);
    return `
      <tr>
        <td><a href="#/activity/${a.id}" style="color:var(--primary);font-weight:600">${esc(a.name)}</a></td>
        <td>${esc(a.organizer)}</td>
        <td>${fmtDate(a.startTime)}</td>
        <td><span class="badge ${r.status==='pending'?'pending':r.status==='approved'?'approved':'cancelled'}">${statusText(r.status)}</span></td>
        <td>${checked ? `<span class="badge approved">${ICONS.check} 已签到</span>` : '—'}</td>
        <td class="row-actions">
          ${r.status === 'approved' ? `<button class="btn sm" data-action="cancel-reg" data-id="${r.id}">取消报名</button>` : ''}
        </td>
      </tr>`;
  }).join('');

  return `
    <div class="page-title">我的报名</div>
    <div class="page-sub">查看你报名的所有活动及其状态</div>
    <button class="back-link" data-action="back-home">${ICONS.back} 返回活动列表</button>
    <div class="table-wrap">
      <table>
        <thead><tr><th>活动名称</th><th>主办社团</th><th>开始时间</th><th>报名状态</th><th>签到</th><th>操作</th></tr></thead>
        <tbody>${rows || `<tr><td colspan="6" style="text-align:center;color:var(--text-sub)">你还没有报名任何活动</td></tr>`}</tbody>
      </table>
    </div>
  `;
}

/* ===================== 管理端 ===================== */
function renderAdmin() {
  const hash = location.hash;
  if (hash.startsWith('#/admin/activities') || hash === '#/admin') return renderAdminActivities();
  if (hash === '#/admin/registrations') return renderAdminRegistrations();
  if (hash === '#/admin/checkin') return renderAdminCheckIn();
  if (hash === '#/admin/statistics') return renderAdminStatistics();
  return renderAdminActivities();
}

function adminNav(active) {
  const items = [
    ['#/admin', '活动管理'],
    ['#/admin/registrations', '报名管理'],
    ['#/admin/checkin', '签到管理'],
    ['#/admin/statistics', '统计看板'],
  ];
  const nav = items.map(([h, label]) =>
    `<a href="${h}" class="${h === active || (active === '#/admin' && h === '#/admin') ? 'active' : ''}" data-navlink="${h}">${label}</a>`).join('');
  return `<nav class="admin-nav">${nav}</nav>`;
}

function renderAdminActivities() {
  const keyword = (state._akw || '').toLowerCase();
  let list = state.activities.slice();
  if (keyword) list = list.filter(a => (a.name + a.organizer).toLowerCase().includes(keyword));

  const rows = list.map(a => {
    const cap = countApproved(a.id);
    const pct = Math.min(100, Math.round(cap / a.capacity * 100));
    return `
      <tr>
        <td style="font-weight:600">${esc(a.name)}</td>
        <td>${esc(a.organizer)}</td>
        <td>${fmtDate(a.startTime)}</td>
        <td>${cap} / ${a.capacity}</td>
        <td><div class="capacity-bar" style="width:80px"><div class="capacity-fill" style="width:${pct}%"></div></div></td>
        <td>${activityBadge(a.status)}</td>
        <td class="row-actions">
          <button class="btn sm" data-action="edit-activity" data-id="${a.id}">${ICONS.edit} 编辑</button>
          ${a.status !== 'closed' ? `<button class="btn sm" data-action="toggle-activity" data-id="${a.id}">${a.status==='active'?'关闭':'发布'}</button>` : ''}
          <button class="btn sm danger" data-action="del-activity" data-id="${a.id}">${ICONS.trash} 删除</button>
        </td>
      </tr>`;
  }).join('');

  return `
    ${adminNav('#/admin')}
    <div class="page-title">活动管理</div>
    <div class="page-sub">创建、编辑、发布与关闭社团活动</div>
    <div class="toolbar">
      <div class="search-box">${ICONS.search}<input id="akw" placeholder="搜索活动" value="${esc(state._akw || '')}"></div>
      <button class="btn primary" data-action="new-activity">${ICONS.plus} 新建活动</button>
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>活动名称</th><th>主办社团</th><th>开始时间</th><th>已报名</th><th>报名率</th><th>状态</th><th>操作</th></tr></thead>
        <tbody>${rows || `<tr><td colspan="7" style="text-align:center;color:var(--text-sub)">暂无活动</td></tr>`}</tbody>
      </table>
    </div>
  `;
}

function renderAdminRegistrations() {
  const aid = state._ra || 'all';
  const acts = state.activities.filter(a => a.status !== 'draft');
  let regs = state.registrations.slice();
  if (aid !== 'all') regs = regs.filter(r => r.activityId === aid);
  const kw = (state._rkw || '').toLowerCase();
  if (kw) regs = regs.filter(r => (r.studentName + r.studentId + r.college).toLowerCase().includes(kw));
  regs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const rows = regs.map(r => {
    const a = getActivity(r.activityId);
    const checked = hasCheckedIn(r.activityId, r.studentId);
    return `
      <tr>
        <td>${esc(a ? a.name : '—')}</td>
        <td style="font-weight:600">${esc(r.studentName)}</td>
        <td>${esc(r.studentId)}</td>
        <td>${esc(r.college)}</td>
        <td>${esc(r.phone || '—')}</td>
        <td><span class="badge ${r.status}">${statusText(r.status)}</span></td>
        <td>${checked ? `<span class="badge approved">${ICONS.check} 已签到</span>` : '—'}</td>
        <td class="row-actions">
          ${r.status === 'pending' ? `<button class="btn sm success" data-action="approve-reg" data-id="${r.id}">通过</button>` : ''}
          ${r.status !== 'cancelled' ? `<button class="btn sm" data-action="reject-reg" data-id="${r.id}">${r.status==='pending'?'拒绝':'取消'}</button>` : ''}
        </td>
      </tr>`;
  }).join('');

  return `
    ${adminNav('#/admin/registrations')}
    <div class="page-title">报名管理</div>
    <div class="page-sub">审核报名信息，掌握各活动报名情况</div>
    <div class="toolbar">
      <select class="select" id="ra">
        <option value="all" ${aid==='all'?'selected':''}>全部活动</option>
        ${acts.map(a => `<option value="${a.id}" ${aid===a.id?'selected':''}>${esc(a.name)}</option>`).join('')}
      </select>
      <div class="search-box">${ICONS.search}<input id="rkw" placeholder="搜索姓名 / 学号 / 学院" value="${esc(state._rkw || '')}"></div>
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>活动</th><th>姓名</th><th>学号</th><th>学院</th><th>电话</th><th>状态</th><th>签到</th><th>操作</th></tr></thead>
        <tbody>${rows || `<tr><td colspan="8" style="text-align:center;color:var(--text-sub)">暂无报名记录</td></tr>`}</tbody>
      </table>
    </div>
  `;
}

function renderAdminCheckIn() {
  const aid = state._ca || (state.activities.find(a => a.status === 'active') || {}).id || '';
  const activities = state.activities.filter(a => a.status !== 'draft');
  const regs = state.registrations.filter(r => r.activityId === aid && r.status === 'approved');
  const kw = (state._ckw || '').toLowerCase();
  let shown = regs.slice();
  if (kw) shown = shown.filter(r => (r.studentName + r.studentId).toLowerCase().includes(kw));

  const rows = shown.map(r => {
    const checked = hasCheckedIn(aid, r.studentId);
    const c = state.checkIns.find(x => x.registrationId === r.id);
    return `
      <tr>
        <td style="font-weight:600">${esc(r.studentName)}</td>
        <td>${esc(r.studentId)}</td>
        <td>${esc(r.college)}</td>
        <td>${checked ? `<span class="badge approved">${ICONS.check} 已签到</span>` : `<span class="badge pending">未签到</span>`}</td>
        <td>${checked && c ? fmtDate(c.checkInTime) : '—'}</td>
        <td>${!checked ? `<button class="btn success sm" data-action="do-checkin" data-regid="${r.id}" data-aid="${aid}">${ICONS.check} 签到</button>` : ''}</td>
      </tr>`;
  }).join('');

  const cap = countApproved(aid);
  const checkedCount = countCheckIn(aid);

  return `
    ${adminNav('#/admin/checkin')}
    <div class="page-title">签到管理</div>
    <div class="page-sub">活动当天现场核对签到，支持按姓名或学号快速查找</div>
    <div class="toolbar">
      <select class="select" id="ca">
        ${activities.map(a => `<option value="${a.id}" ${aid===a.id?'selected':''}>${esc(a.name)}</option>`).join('')}
      </select>
      <div class="search-box">${ICONS.search}<input id="ckw" placeholder="搜索姓名 / 学号" value="${esc(state._ckw || '')}"></div>
    </div>
    <div class="toolbar" style="margin-top:-6px">
      <span class="pill-count">该活动已通过报名 ${cap} 人 · 已签到 ${checkedCount} 人 · 未签到 ${cap - checkedCount} 人</span>
      ${cap ? `<button class="btn" data-action="export-checkin">导出签到表</button>` : ''}
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>姓名</th><th>学号</th><th>学院</th><th>签到状态</th><th>签到时间</th><th>操作</th></tr></thead>
        <tbody>${rows || `<tr><td colspan="6" style="text-align:center;color:var(--text-sub)">该活动暂无已通过报名的学生</td></tr>`}</tbody>
      </table>
    </div>
  `;
}

function renderAdminStatistics() {
  const totalActs = state.activities.length;
  const activeActs = state.activities.filter(a => a.status === 'active').length;
  const totalReg = state.registrations.length;
  const approvedReg = state.registrations.filter(r => r.status === 'approved').length;
  const totalCheck = state.checkIns.length;

  // 活动热度：按报名数
  const heatData = state.activities
    .map(a => ({ name: a.name, approved: countApproved(a.id), checked: countCheckIn(a.id) }))
    .sort((x, y) => y.approved - x.approved).slice(0, 8);

  // 近 30 天报名趋势
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date(); day.setDate(day.getDate() - i); day.setHours(0,0,0,0);
    const next = new Date(day); next.setDate(day.getDate() + 1);
    const cnt = state.registrations.filter(r => {
      const t = new Date(r.createdAt); return t >= day && t < next;
    }).length;
    days.push({ label: fmtDay(day).slice(5), count: cnt });
  }

  return `
    ${adminNav('#/admin/statistics')}
    <div class="page-title">统计看板</div>
    <div class="page-sub">活动、报名与签到数据的综合分析</div>
    <div class="stat-grid">
      <div class="stat-card"><div class="stat-label">活动总数</div><div class="stat-value">${totalActs}<small> 个</small></div></div>
      <div class="stat-card"><div class="stat-label">进行中活动</div><div class="stat-value">${activeActs}<small> 个</small></div></div>
      <div class="stat-card"><div class="stat-label">报名总数</div><div class="stat-value">${totalReg}<small> 条</small></div></div>
      <div class="stat-card"><div class="stat-label">通过报名</div><div class="stat-value">${approvedReg}<small> 人</small></div></div>
      <div class="stat-card"><div class="stat-label">已签到</div><div class="stat-value">${totalCheck}<small> 人</small></div></div>
      <div class="stat-card"><div class="stat-label">整体签到率</div><div class="stat-value">${approvedReg ? Math.round(totalCheck / approvedReg * 100) : 0}<small>%</small></div></div>
    </div>
    <div class="chart-grid">
      <div class="chart-card"><h3>近 7 天报名趋势</h3><div id="chart-trend" class="chart-box"></div></div>
      <div class="chart-card"><h3>活动热度排行（报名人数）</h3><div id="chart-heat" class="chart-box"></div></div>
      <div class="chart-card"><h3>各活动报名 / 签到对比</h3><div id="chart-compare" class="chart-box"></div></div>
      <div class="chart-card"><h3>报名状态分布</h3><div id="chart-status" class="chart-box"></div></div>
    </div>
  `;
}

/* ---------- ECharts 渲染（统计页专用，返回后调用） ---------- */
function renderCharts() {
  if (window.echarts) {
    buildCharts();
    return;
  }
  // 动态加载 ECharts（异步，不阻塞主功能）；失败则降级
  const s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/npm/echarts@5.6.0/dist/echarts.min.js';
  s.integrity = 'sha384-pPi0zxBAoDu6+JXW/C68UZLvBUUtU+7zonhif43rqj7pxsGyqyqzcian2Rj37Rss';
  s.crossOrigin = 'anonymous';
  s.onload = () => buildCharts();
  s.onerror = () => buildChartsFallback();
  document.head.appendChild(s);
}

function buildChartsFallback() {
  // ECharts 加载失败：把图表区替换为数据表格，保证统计页仍可用
  const wrap = document.querySelector('.chart-grid');
  if (!wrap) return;
  wrap.innerHTML = `<div class="table-wrap" style="grid-column:1/-1"><div class="page-sub" style="padding:14px 16px">统计图表组件加载失败（需联网才能显示图表），以下为关键统计数据：</div>
    <table><thead><tr><th>活动</th><th>报名人数</th><th>签到人数</th><th>签到率</th></tr></thead>
    <tbody>${state.activities.map(a => {
      const ap = countApproved(a.id), ck = countCheckIn(a.id);
      return `<tr><td>${esc(a.name)}</td><td>${ap}</td><td>${ck}</td><td>${ap?Math.round(ck/ap*100):0}%</td></tr>`;
    }).join('')}</tbody></table></div>`;
}

function buildCharts() {
  if (!window.echarts) { buildChartsFallback(); return; }
  const trendEl = document.getElementById('chart-trend');
  if (!trendEl) return;

  // 近 7 天趋势
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date(); day.setDate(day.getDate() - i); day.setHours(0,0,0,0);
    const next = new Date(day); next.setDate(day.getDate() + 1);
    const cnt = state.registrations.filter(r => { const t = new Date(r.createdAt); return t >= day && t < next; }).length;
    days.push({ label: fmtDay(day).slice(5), count: cnt });
  }
  const c1 = echarts.init(trendEl);
  c1.setOption({
    grid: { left: 40, right: 20, top: 30, bottom: 30 },
    tooltip: { trigger: 'axis', confine: true },
    xAxis: { type: 'category', data: days.map(d => d.label), axisLine: { lineStyle: { color: '#CBD5E1' } }, axisLabel: { color: '#64748B' } },
    yAxis: { type: 'value', minInterval: 1, axisLine: { show: false }, axisLabel: { color: '#64748B' }, splitLine: { lineStyle: { color: '#EEF2F7' } } },
    series: [{
      type: 'line', smooth: true, symbol: 'circle', data: days.map(d => d.count),
      lineStyle: { width: 3, color: '#4F46E5' },
      itemStyle: { color: '#4F46E5' },
      areaStyle: { color: new echarts.graphic.LinearGradient(0,0,0,1,[{offset:0,color:'rgba(79,70,229,.25)'},{offset:1,color:'rgba(79,70,229,0)'}]) }
    }]
  });
  new ResizeObserver(() => c1.resize()).observe(trendEl);

  // 活动热度排行
  const heat = state.activities.map(a => ({ name: a.name, approved: countApproved(a.id) })).sort((x,y)=>y.approved-x.approved).slice(0,8).reverse();
  const c2 = echarts.init(document.getElementById('chart-heat'));
  c2.setOption({
    grid: { left: 130, right: 30, top: 10, bottom: 20 },
    tooltip: { trigger: 'axis', confine: true },
    xAxis: { type: 'value', minInterval: 1, axisLabel: { color: '#64748B' }, splitLine: { lineStyle: { color: '#EEF2F7' } } },
    yAxis: { type: 'category', data: heat.map(a => a.name), axisLabel: { color: '#1E293B', fontSize: 12, width: 110, overflow: 'truncate' }, axisLine: { lineStyle: { color: '#CBD5E1' } } },
    series: [{ type: 'bar', data: heat.map(a => a.approved), barWidth: 18, itemStyle: { color: '#4F46E5', borderRadius: [0, 6, 6, 0] }, label: { show: true, position: 'right', color: '#1E293B', fontWeight: 600 } }]
  });
  new ResizeObserver(() => c2.resize()).observe(document.getElementById('chart-heat'));

  // 各活动报名/签到对比
  const comp = state.activities.filter(a => a.status !== 'draft').map(a => ({ name: a.name, approved: countApproved(a.id), checked: countCheckIn(a.id) }));
  const c3 = echarts.init(document.getElementById('chart-compare'));
  c3.setOption({
    grid: { left: 50, right: 20, top: 30, bottom: 50 },
    legend: { bottom: 0, data: ['报名人数', '签到人数'], type: 'scroll' },
    tooltip: { trigger: 'axis', confine: true },
    xAxis: { type: 'category', data: comp.map(a => a.name), axisLabel: { color: '#64748B', rotate: 30, interval: 0 }, axisLine: { lineStyle: { color: '#CBD5E1' } } },
    yAxis: { type: 'value', minInterval: 1, axisLabel: { color: '#64748B' }, splitLine: { lineStyle: { color: '#EEF2F7' } } },
    series: [
      { name: '报名人数', type: 'bar', data: comp.map(a => a.approved), barWidth: 16, itemStyle: { color: '#4F46E5', borderRadius: [4,4,0,0] } },
      { name: '签到人数', type: 'bar', data: comp.map(a => a.checked), barWidth: 16, itemStyle: { color: '#10B981', borderRadius: [4,4,0,0] } }
    ]
  });
  new ResizeObserver(() => c3.resize()).observe(document.getElementById('chart-compare'));

  // 报名状态分布
  const pending = state.registrations.filter(r => r.status === 'pending').length;
  const approved = state.registrations.filter(r => r.status === 'approved').length;
  const cancelled = state.registrations.filter(r => r.status === 'cancelled').length;
  const c4 = echarts.init(document.getElementById('chart-status'));
  c4.setOption({
    tooltip: { trigger: 'item', confine: true, formatter: p => `${p.name}: ${p.value} 条 (${p.percent}%)` },
    legend: { bottom: 0, type: 'scroll' },
    series: [{
      type: 'pie', radius: ['42%', '66%'],
      data: [
        { name: '待审核', value: pending, itemStyle: { color: '#F59E0B' } },
        { name: '已通过', value: approved, itemStyle: { color: '#10B981' } },
        { name: '已取消', value: cancelled, itemStyle: { color: '#CBD5E1' } }
      ],
      label: { show: true, formatter: p => `${p.name}\n${p.value}条`, color: '#1E293B' }
    }]
  });
  new ResizeObserver(() => c4.resize()).observe(document.getElementById('chart-status'));
}

/* ===================== Modal ===================== */
function openModal(html) {
  const root = document.getElementById('modal-root');
  root.innerHTML = `<div class="modal-mask"><div class="modal">${html}</div></div>`;
  root.querySelector('.modal-mask').addEventListener('click', e => { if (e.target.classList.contains('modal-mask')) closeModal(); });
}
function closeModal() { document.getElementById('modal-root').innerHTML = ''; }

function activityForm(a) {
  a = a || { name:'', description:'', location:'', organizer:'', capacity:50, status:'active' };
  return `
    <div class="modal-title">${a._edit ? '编辑活动' : '新建活动'}</div>
    <div class="form-grid">
      <div class="field full"><label>活动名称</label><input id="a-name" value="${esc(a.name)}"></div>
      <div class="field full"><label>活动描述</label><textarea id="a-desc">${esc(a.description)}</textarea></div>
      <div class="field"><label>活动地点</label><input id="a-loc" value="${esc(a.location)}"></div>
      <div class="field"><label>主办社团</label><input id="a-org" value="${esc(a.organizer)}"></div>
      <div class="field"><label>人数上限</label><input id="a-cap" type="number" min="1" value="${a.capacity}"></div>
      <div class="field"><label>状态</label>
        <select id="a-status">
          <option value="active" ${a.status==='active'?'selected':''}>报名中</option>
          <option value="draft" ${a.status==='draft'?'selected':''}>未发布</option>
          <option value="closed" ${a.status==='closed'?'selected':''}>已结束</option>
        </select>
      </div>
      <div class="field"><label>开始时间</label><input id="a-start" type="datetime-local" value="${toLocalInput(a.startTime)}"></div>
      <div class="field"><label>结束时间</label><input id="a-end" type="datetime-local" value="${toLocalInput(a.endTime)}"></div>
      <div class="field"><label>报名截止</label><input id="a-deadline" type="datetime-local" value="${toLocalInput(a.registrationDeadline)}"></div>
    </div>
    <div class="form-actions">
      <button class="btn primary" data-action="save-activity" data-edit="${a._edit ? a._edit : ''}">保存</button>
      <button class="btn" data-action="close-modal">取消</button>
    </div>
  `;
}
function toLocalInput(iso) {
  if (!iso) return '';
  const d = new Date(iso); if (isNaN(d)) return '';
  const p = n => String(n).padStart(2,'0');
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

/* ===================== 全局事件委托 ===================== */
document.addEventListener('click', e => {
  // 登录
  if (e.target.closest('[data-action="do-login"]')) { doLogin(); return; }
  // 退出登录
  if (e.target.closest('[data-action="logout"]')) { doLogout(); return; }

  // 导航链接
  const navlink = e.target.closest('[data-navlink]');
  if (navlink) return; // 交给 hashchange

  const actionEl = e.target.closest('[data-action]');
  if (!actionEl) return;
  const action = actionEl.dataset.action;
  const id = actionEl.dataset.id;
  const aid = actionEl.dataset.aid;
  const regid = actionEl.dataset.regid;

  switch (action) {
    case 'enroll':
      location.hash = `#/activity/${id}`;
      break;
    case 'my':
      location.hash = '#/my';
      break;
    case 'back-home':
      location.hash = '';
      render();
      break;
    case 'submit-enroll': submitEnroll(id); break;
    case 'cancel-reg': cancelRegistration(id); break;
    case 'new-activity':
      openModal(activityForm());
      break;
    case 'edit-activity': {
      const a = getActivity(id);
      openModal(activityForm(Object.assign({}, a, { _edit: id })));
      break;
    }
    case 'save-activity': saveActivity(actionEl.dataset.edit); break;
    case 'toggle-activity': toggleActivity(id); break;
    case 'del-activity': delActivity(id); break;
    case 'approve-reg': updateRegStatus(id, 'approved'); break;
    case 'reject-reg': {
      const r = state.registrations.find(x => x.id === id);
      updateRegStatus(id, r && r.status === 'pending' ? 'cancelled' : 'cancelled');
      break;
    }
    case 'do-checkin': doCheckIn(regid, aid); break;
    case 'export-checkin': exportCheckIn(); break;
    case 'close-modal': closeModal(); break;
  }
});

/* 输入类变化委托 */
document.addEventListener('input', e => {
  if (e.target.id === 'kw') {
    state._kw = e.target.value;
    const box = document.getElementById('student-cards');
    if (box) box.innerHTML = studentCardList();
  }
  if (e.target.id === 'akw') { state._akw = e.target.value; }
  if (e.target.id === 'rkw') { state._rkw = e.target.value; }
  if (e.target.id === 'ckw') { state._ckw = e.target.value; }
});

document.addEventListener('change', e => {
  if (e.target.id === 'st') { state._st = e.target.value; render(); }
  if (e.target.id === 'ra') { state._ra = e.target.value; render(); }
  if (e.target.id === 'rkw') { state._rkw = e.target.value; render(); }
  if (e.target.id === 'ca') { state._ca = e.target.value; state._ckw = ''; render(); }
  if (e.target.id === 'ckw') { state._ckw = e.target.value; render(); }
  if (e.target.id === 'akw') { state._akw = e.target.value; render(); }
});

/* 登录页回车提交 */
document.addEventListener('keydown', e => {
  if ((e.target.id === 'login-account' || e.target.id === 'login-password') && e.key === 'Enter') {
    doLogin();
  }
});

/* ===================== 登录 / 退出 ===================== */
function doLogin() {
  const account = (document.getElementById('login-account') || {}).value.trim();
  const password = (document.getElementById('login-password') || {}).value;
  const errBox = document.getElementById('login-error');
  const found = ACCOUNTS.find(a => a.account === account && a.password === password);
  if (!found) {
    if (errBox) { errBox.style.display = 'block'; errBox.textContent = '账号或密码错误，请重试'; }
    return;
  }
  state.loggedIn = true;
  state.role = found.role;
  state.user = { account: found.account, name: found.name, role: found.role };
  if (found.role === 'student') {
    state.me = { name: '张小明', studentId: '20240001', college: '计算机学院', phone: '13800001111' };
    location.hash = '';
  } else {
    location.hash = '#/admin';
  }
  save();
  render();
  toast('欢迎，' + found.name, 'success');
}
function doLogout() {
  state.loggedIn = false;
  state.user = null;
  state.role = 'student';
  location.hash = '';
  save();
  render();
}

/* ===================== 业务操作 ===================== */
function submitEnroll(activityId) {
  const name = (document.getElementById('f-name') || {}).value;
  const sid = (document.getElementById('f-sid') || {}).value;
  const college = (document.getElementById('f-college') || {}).value;
  const phone = (document.getElementById('f-phone') || {}).value;
  if (!name || !sid) { toast('请填写姓名和学号', 'warning'); return; }
  if (state.registrations.some(r => r.activityId === activityId && r.studentId === sid && r.status !== 'cancelled')) {
    toast('你已报名该活动，请勿重复报名', 'warning'); return;
  }
  const a = getActivity(activityId);
  if (countApproved(activityId) >= a.capacity) { toast('活动名额已满', 'warning'); return; }
  state.me = { name, studentId: sid, college, phone };
  state.registrations.push({ id: uid(), activityId, studentName: name, studentId: sid, college, phone, status: 'approved', createdAt: new Date().toISOString() });
  save(); render(); toast('报名成功！已为你登记', 'success');
}

function cancelRegistration(regId) {
  const r = state.registrations.find(x => x.id === regId);
  if (!r) return;
  if (hasCheckedIn(r.activityId, r.studentId)) { toast('已签到的报名不能取消', 'warning'); return; }
  r.status = 'cancelled';
  save(); render(); toast('已取消报名', 'success');
}

function saveActivity(editId) {
  const name = document.getElementById('a-name').value.trim();
  if (!name) { toast('请填写活动名称', 'warning'); return; }
  const desc = document.getElementById('a-desc').value.trim();
  const loc = document.getElementById('a-loc').value.trim();
  const org = document.getElementById('a-org').value.trim();
  const cap = parseInt(document.getElementById('a-cap').value, 10) || 50;
  const status = document.getElementById('a-status').value;
  const start = toIso(document.getElementById('a-start').value);
  const end = toIso(document.getElementById('a-end').value);
  const deadline = toIso(document.getElementById('a-deadline').value);

  if (editId) {
    const a = getActivity(editId);
    if (a) Object.assign(a, { name, description: desc, location: loc, organizer: org, capacity: cap, status, startTime: start, endTime: end, registrationDeadline: deadline });
  } else {
    state.activities.push({ id: uid(), name, description: desc, location: loc, organizer: org, capacity: cap, status, startTime: start, endTime: end, registrationDeadline: deadline });
  }
  save(); closeModal(); render(); toast(editId ? '活动已更新' : '活动已创建', 'success');
}
function toIso(val) {
  if (!val) return new Date().toISOString();
  const d = new Date(val); return isNaN(d) ? new Date().toISOString() : d.toISOString();
}

function toggleActivity(id) {
  const a = getActivity(id);
  if (!a) return;
  a.status = a.status === 'active' ? 'closed' : 'active';
  save(); render(); toast(a.status === 'active' ? '活动已发布' : '活动已关闭', 'success');
}

function delActivity(id) {
  if (!confirm('确定删除该活动？其报名与签到记录将一并删除。')) return;
  state.activities = state.activities.filter(a => a.id !== id);
  state.registrations = state.registrations.filter(r => r.activityId !== id);
  state.checkIns = state.checkIns.filter(c => c.activityId !== id);
  save(); render(); toast('活动已删除', 'success');
}

function updateRegStatus(regId, status) {
  const r = state.registrations.find(x => x.id === regId);
  if (!r) return;
  r.status = status;
  save(); render(); toast(`已${status === 'approved' ? '通过' : '取消'}该报名`, 'success');
}

function doCheckIn(regId, activityId) {
  const r = state.registrations.find(x => x.id === regId);
  if (!r) return;
  if (hasCheckedIn(activityId, r.studentId)) { toast('该学生已签到', 'warning'); return; }
  state.checkIns.push({ id: uid(), activityId, registrationId: r.id, studentName: r.studentName, studentId: r.studentId, checkInTime: new Date().toISOString() });
  save(); render(); toast(`已为 ${r.studentName} 完成签到`, 'success');
}

function exportCheckIn() {
  const aid = state._ca;
  const a = getActivity(aid);
  if (!a) return;
  const rows = state.registrations
    .filter(r => r.activityId === aid && r.status === 'approved')
    .map(r => {
      const c = state.checkIns.find(x => x.registrationId === r.id);
      return `${r.studentName},${r.studentId},${r.college},${c ? fmtDate(c.checkInTime) : '未签到'}`;
    });
  const csv = '\uFEFF活动,签到名单\n' + a.name + '\n姓名,学号,学院,签到时间\n' + rows.join('\n');
  downloadText(`${a.name}-签到表.csv`, csv);
  toast('签到表已导出', 'success');
}
function downloadText(name, text) {
  const blob = new Blob([text], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* ---------- Toast ---------- */
function toast(msg, type = '') {
  let zone = document.querySelector('.toast-zone');
  if (!zone) { zone = document.createElement('div'); zone.className = 'toast-zone'; document.body.appendChild(zone); }
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  el.textContent = msg;
  zone.appendChild(el);
  setTimeout(() => { el.style.transition = 'opacity .3s'; el.style.opacity = '0'; setTimeout(() => el.remove(), 300); }, 2400);
}

/* ---------- hash 路由与初始化 ---------- */
window.addEventListener('hashchange', () => { render(); if (location.hash === '#/admin/statistics') setTimeout(renderCharts, 50); });

// 首次渲染统计图表（hash 已是 statistics 时）
function afterRender() {
  if (location.hash === '#/admin/statistics') setTimeout(renderCharts, 60);
}

// 历史 API 不用于 hash，手动渲染
load();
render();
afterRender();
