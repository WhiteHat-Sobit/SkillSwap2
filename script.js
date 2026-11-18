const API="";
let P=[];
const sent=new Set(),$=id=>document.getElementById(id);
let cat="des",query="";
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const tags=(a,s)=>a.map((x,i)=>`<span class="tg${s&&s[i]?' s':''}">${esc(x)}</span>`).join("");
function swBtn(p,i){
 if(p.own)return"";
 if(p.rs==="accepted"&&p.sid)return `<button class="sw chat" data-chat="${p.sid}">💬 Написать сообщение</button>`;
 const st=p.rs||(sent.has(i)?"pending":"");
 const t={pending:"✓ Запрос отправлен",accepted:"✓ Обмен принят",declined:"Запрос отклонён"}[st]||"⇄ Предложить обмен";
 return `<button class="sw${st?' sent':''}" data-i="${i}">${t}</button>`;
}
function render(){
 const L=P.map(p=>({p,i:p.id}));
 $("grid").innerHTML=L.length?L.map(({p,i},n)=>`<article class="c" style="--i:${n}"><div class="top"><div class="av">${esc(p.i)}<i class="${p.on?'':'off'}"></i></div><div class="nm"><h3>${esc(p.n)}</h3><p>${esc(p.r)}</p><div class="rt">${p.e?`<u>★</u> ${p.s?p.s.toFixed(1):"—"} <s>(${p.e} ${p.ew})</s>`:'<s>Новый участник</s>'}</div></div><span class="mt">🔥 ${p.m}%</span></div>
<div class="lb g"><i></i>Могу научить</div><div class="tags g">${tags(p.t,p.ts||(p.t.map((x,j)=>/[А-я]/.test(x)&&!/Storytelling/.test(x)?1:0)))}</div>
<div class="lb p"><i></i>Хочу научиться</div><div class="tags p">${tags(p.l,p.ls)}</div>
<div class="loc"><span>${p.w?'🌐':'📍'} ${esc(p.loc)}</span><small>${p.a?'Ответ за '+esc(p.a):''}</small></div>
${swBtn(p,i)}</article>`).join(""):'<div class="empty">Ничего не найдено</div>';
}
$("tabs").addEventListener("click",e=>{const b=e.target.closest(".tab");if(!b)return;cat=b.dataset.c;document.querySelectorAll(".tab").forEach(t=>t.setAttribute("aria-pressed",t===b));load()});
$("sort").onchange=render;
$("sform").onsubmit=e=>{e.preventDefault();query=$("q").value;cat="all";document.querySelectorAll(".tab").forEach(t=>t.setAttribute("aria-pressed",t.dataset.c==="all"));load();$("grid").scrollIntoView({behavior:"smooth",block:"center"})};
document.querySelectorAll(".chip").forEach(c=>c.onclick=()=>{$("q").value=c.textContent;$("sform").requestSubmit()});
$("hform").onsubmit=e=>{e.preventDefault();$("q").value=$("hsearch").value;$("sform").requestSubmit()};
addEventListener("keydown",e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="k"){e.preventDefault();$("hsearch").focus()}});
$("grid").addEventListener("click",async e=>{
 const b=e.target.closest(".sw");if(b&&b.dataset.chat){openChat(+b.dataset.chat);return}if(!b||b.classList.contains("sent"))return;
 if(!user){openAuth("login","Войдите, чтобы предложить обмен");return}
 try{
  const r=await fetch(API+"/api/swaps",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({memberId:+b.dataset.i})});
  if(r.status===401){user=null;renderUser();openAuth("login","Сессия истекла. Войдите снова");return}
  if(!r.ok&&r.status!==409)throw new Error();
  sent.add(+b.dataset.i);b.classList.add("sent");b.textContent="✓ Запрос отправлен";toast("Предложение обмена отправлено");
 }catch{toast("Не удалось отправить. Попробуйте ещё раз")}
});
$("more").onclick=()=>{cat="all";query="";$("q").value="";document.querySelectorAll(".tab").forEach(t=>t.setAttribute("aria-pressed",t.dataset.c==="all"));load()};
let tt;function toast(m,ms=2200){const t=$("toast");t.textContent=m;t.classList.add("on");clearTimeout(tt);tt=setTimeout(()=>t.classList.remove("on"),ms)}
load();

/* ===== Динамика ===== */
// тень шапки при прокрутке
const hd=document.getElementById("top");
addEventListener("scroll",()=>hd.classList.toggle("scrolled",scrollY>10),{passive:true});
const calm=matchMedia("(prefers-reduced-motion: reduce)").matches;
// счётчики в статистике
fetch(API+"/api/stats").then(r=>r.json()).catch(()=>({})).then(st=>document.querySelectorAll(".stats b[data-n]").forEach(el=>{
 const end=+(st[el.dataset.k]||el.dataset.n),s=el.dataset.s;
 if(calm){el.textContent=end.toLocaleString("en-US")+s;return}
 const t0=performance.now()+700,d=1600;
 const tick=now=>{const k=Math.min(Math.max((now-t0)/d,0),1),v=Math.round(end*(1-Math.pow(1-k,3)));
  el.textContent=v.toLocaleString("en-US")+(k===1?s:"");if(k<1)requestAnimationFrame(tick)};
 el.textContent="0";requestAnimationFrame(tick);
}));
// печатающийся пример в поле поиска
const qi=document.getElementById("q"),pre="Какой навык хотите освоить или предложить? (например: ",words=["Figma","Python","Blender","Английский"];
if(!calm){let w=0,c=0,dir=1,wait=0;
 setInterval(()=>{
  if(document.activeElement===qi||qi.value)return;
  if(wait>0){wait--;return}
  c+=dir;qi.placeholder=pre+words[w].slice(0,c)+"...)";
  if(c===words[w].length){dir=-1;wait=14}
  else if(c===0){dir=1;w=(w+1)%words.length;wait=3}
 },90);
}
// подсветка карточки за курсором
document.getElementById("grid").addEventListener("pointermove",e=>{
 const c=e.target.closest(".c");if(!c)return;const r=c.getBoundingClientRect();
 c.style.setProperty("--mx",e.clientX-r.left+"px");c.style.setProperty("--my",e.clientY-r.top+"px");
});

/* ===== Scroll animations ===== */
const prog=document.createElement("div");prog.className="progress";document.body.prepend(prog);
const heroEl=document.getElementById("how");
let queued=false;
function onScrollFx(){
 if(queued)return;queued=true;
 requestAnimationFrame(()=>{queued=false;
  const max=document.documentElement.scrollHeight-innerHeight;
  prog.style.transform=`scaleX(${max>0?scrollY/max:0})`;
  heroEl.style.setProperty("--p",Math.min(scrollY/(heroEl.offsetHeight*.8),1).toFixed(3));
 });
}
addEventListener("scroll",onScrollFx,{passive:true});onScrollFx();
// reveal on enter
const io=new IntersectionObserver(list=>list.forEach(en=>{
 if(!en.isIntersecting)return;
 const t=en.target;io.unobserve(t);
 t.style.setProperty("--col",[...t.parentNode.children].indexOf(t)%3);
 t.classList.add("in");
 if(t.classList.contains("rv"))t.addEventListener("transitionend",ev=>{
  if(ev.target===t&&ev.propertyName==="transform")t.classList.remove("rv","in");
 });
}),{threshold:.12,rootMargin:"0px 0px -6% 0px"});
document.querySelectorAll(".bar,.more,.fg>*,.fb").forEach(el=>{el.classList.add("rv");io.observe(el)});
const watchCards=()=>document.querySelectorAll("#grid .c:not(.seen)").forEach(c=>{c.classList.add("seen");io.observe(c)});
new MutationObserver(watchCards).observe($("grid"),{childList:true});watchCards();
// 3D tilt on cards
$("grid").addEventListener("pointermove",e=>{
 const c=e.target.closest(".c");if(!c||calm)return;const r=c.getBoundingClientRect();
 c.style.setProperty("--rx",((.5-(e.clientY-r.top)/r.height)*6).toFixed(2)+"deg");
 c.style.setProperty("--ry",(((e.clientX-r.left)/r.width-.5)*6).toFixed(2)+"deg");
});
$("grid").addEventListener("pointerout",e=>{
 const c=e.target.closest(".c");
 if(c&&!c.contains(e.relatedTarget)){c.style.removeProperty("--rx");c.style.removeProperty("--ry")}
});

/* ===== Загрузка данных с сервера ===== */
let loadSeq=0;
async function load(){
 const my=++loadSeq,u=new URLSearchParams({category:cat,q:query.trim(),sort:$("sort").value});
 try{
  const r=await fetch(API+"/api/members?"+u);if(!r.ok)throw new Error();
  const d=await r.json();if(my!==loadSeq)return;P=d;
 }catch{
  if(my!==loadSeq)return;P=[];
  $("grid").innerHTML='<div class="empty">Не удалось загрузить участников. Проверьте, что сервер запущен.</div>';return;
 }
 render();
}

/* ===== Вход и регистрация ===== */
let user=null,mode="login";
const dlg=$("authDlg"),form=$("authForm"),field=n=>form.elements[n];
function renderUser(){
 $("loginBtn").hidden=!!user;$("me").hidden=!user;$("adminLink").hidden=!(user&&user.role==="admin");$("chatBtn").hidden=!user;$("cabBtn").hidden=!user;
 if(user){$("meName").textContent=user.name;$("meAv").textContent=user.name.trim().charAt(0).toUpperCase()}
}
function setMode(m,msg=""){
 mode=m;$("authTitle").textContent=m==="login"?"Вход":"Регистрация";
 $("authSubmit").textContent=m==="login"?"Войти":"Создать аккаунт";
 $("nameRow").hidden=m==="login";$("regExtra").hidden=m==="login";
 field("password").autocomplete=m==="login"?"current-password":"new-password";
 dlg.querySelectorAll(".seg button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.m===m));
 $("authErr").textContent=msg;$("authErr").classList.remove("ok");
}
function openAuth(m="login",msg=""){form.reset();setMode(m,msg);dlg.showModal();field(m==="login"?"email":"name").focus()}
$("loginBtn").onclick=()=>openAuth("login");
$("authClose").onclick=()=>dlg.close();
dlg.addEventListener("click",e=>{if(e.target===dlg)dlg.close()});
dlg.querySelectorAll(".seg button").forEach(b=>b.onclick=()=>setMode(b.dataset.m));
form.addEventListener("submit",async e=>{
 e.preventDefault();
 const body={email:field("email").value.trim(),password:field("password").value};
 if(mode==="register"){
  body.name=field("name").value.trim();body.teachCats=checked("teachCats");body.learnCats=checked("learnCats");
  body.teachSkills=field("teachSkills").value;body.learnSkills=field("learnSkills").value;
  if(!body.teachCats.length||!body.learnCats.length){$("authErr").textContent="Выберите хотя бы одну категорию в обоих списках";return}
 }
 const btn=$("authSubmit");btn.disabled=true;
 try{
  const r=await fetch(API+"/api/auth/"+mode,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
  const d=await r.json().catch(()=>({}));
  if(!r.ok){$("authErr").textContent=d.error||"Что-то пошло не так";return}
  if(d.pending||d.unverified){const em=field("email").value;form.reset();setMode("login");field("email").value=em;
   $("authErr").textContent=d.pending?"Заявка отправлена! Администратор проверит её, после одобрения вы сможете войти.":d.mailed?`Письмо отправлено на ${em}. Откройте его и нажмите «Подтвердить email» — после этого заявка уйдёт администратору. Проверьте и папку «Спам».`:"Письмо не удалось отправить: на сервере не настроена почта. Ссылка для подтверждения выведена в окне сервера.";$("authErr").classList.add("ok");return}
  user=d.user;renderUser();dlg.close();toast("Добро пожаловать, "+user.name);load();loadNotes(true);loadChats();
 }catch{$("authErr").textContent="Нет связи с сервером"}
 finally{btn.disabled=false}
});
$("logoutBtn").onclick=async()=>{
 try{await fetch(API+"/api/auth/logout",{method:"POST"})}catch{}
 user=null;sent.clear();notes=[];renderBell();chats=[];chatUnread=0;badgeChat();if(cd.open)cd.close();if(cabD.open)cabD.close();$("bellPanel").hidden=true;renderUser();load();toast("Вы вышли из аккаунта");
};
fetch(API+"/api/auth/me").then(r=>r.json()).then(d=>{user=d.user;renderUser();loadNotes(true);loadChats()}).catch(()=>{});

/* ===== Мобильное меню ===== */
const burger=$("burger"),mainNav=$("mainNav");
function setMenu(open){mainNav.classList.toggle("open",open);burger.setAttribute("aria-expanded",open);burger.firstElementChild.textContent=open?"✕":"☰"}
burger.onclick=()=>setMenu(!mainNav.classList.contains("open"));
mainNav.addEventListener("click",e=>{if(e.target.closest("a"))setMenu(false)});
addEventListener("keydown",e=>{if(e.key==="Escape")setMenu(false)});
document.addEventListener("click",e=>{if(!e.target.closest("header"))setMenu(false)});
matchMedia("(min-width:1001px)").addEventListener("change",e=>{if(e.matches)setMenu(false)});

/* ===== Подсветка текущего раздела в меню ===== */
const navLinks=[...document.querySelectorAll("#mainNav a")];
const spyIds=navLinks.map(a=>a.getAttribute("href").slice(1));
function spy(){
 let cur=spyIds[0];const line=innerHeight*.35;
 spyIds.forEach(id=>{const el=document.getElementById(id);if(el&&el.getBoundingClientRect().top<=line)cur=id});
 if(innerHeight+scrollY>=document.documentElement.scrollHeight-4)cur=spyIds[spyIds.length-1];
 navLinks.forEach(a=>{
  const on=a.getAttribute("href")==="#"+cur;
  a.classList.toggle("active",on);
  if(on)a.setAttribute("aria-current","true");else a.removeAttribute("aria-current");
 });
}
addEventListener("scroll",spy,{passive:true});addEventListener("resize",spy);spy();

/* ===== Категории при регистрации ===== */
const checked=id=>[...$(id).querySelectorAll("input:checked")].map(i=>i.value);
fetch(API+"/api/categories").then(r=>r.json()).then(list=>{
 for(const id of["teachCats","learnCats"])
  $(id).innerHTML=list.map(c=>`<label class="cat"><input type="checkbox" value="${esc(c.key)}"><span>${esc(c.label)}</span></label>`).join("");
}).catch(()=>{});

/* ===== Уведомления (колокольчик) и запросы на обмен ===== */
let notes=[],reqCur=null,lastPending=0;
const rd=$("reqDlg");
const isReq=n=>n.kind==="swap_request"&&n.status==="pending";
const needs=n=>!n.read||isReq(n);
const pendingList=()=>notes.filter(isReq);
const line=x=>esc(x.cats.join(", "))+(x.skills?": "+esc(x.skills):"");
function fmt(t){const d=new Date(String(t).replace(" ","T")+"Z");return isNaN(d)?"":d.toLocaleString("ru-RU",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}
function badge(){const c=notes.filter(needs).length,b=$("bellCount");b.hidden=!c;b.textContent=c>9?"9+":c;const t=$("tbBellCount");t.hidden=!c;t.textContent=b.textContent}
function renderPanel(){
 $("bellPanel").innerHTML="<h3>Уведомления</h3>"+(notes.length?notes.map(n=>{
  let extra="";
  const mail=(n.status==="accepted"&&n.from&&n.from.email?`<small>Для связи: ${esc(n.from.email)}</small>`:"")+(n.status==="accepted"&&n.swapId?`<button class="mini" data-chat="${n.swapId}">Написать сообщение</button>`:"");
  if(n.kind==="swap_request")extra=n.status==="pending"?`<button class="mini" data-req="${n.swapId}">Ответить</button>`
   :`<small>${n.status==="accepted"?"Вы приняли запрос":"Вы отклонили запрос"}</small>`+mail+(n.comment?`<small>Ваш комментарий: ${esc(n.comment)}</small>`:"");
  else if(n.kind==="swap_answer")extra=(n.comment?`<small>Комментарий: ${esc(n.comment)}</small>`:"")+mail;
  else if(n.kind==="registration")extra='<a class="mini" href="/admin">Открыть админку</a>';
  return `<div class="nitem${needs(n)?" new":""}"><p>${esc(n.text)}</p>${extra}<time>${fmt(n.time)}</time></div>`;
 }).join(""):'<p class="nempty">Пока ничего нет</p>');
}
function renderBell(){badge();renderPanel()}
async function loadNotes(popup){
 if(!user){notes=[];renderBell();return}
 try{const r=await fetch(API+"/api/notifications");if(!r.ok)return;notes=(await r.json()).items}catch{return}
 renderBell();
 const pend=pendingList();
 if(popup&&pend.length&&!rd.open&&!dlg.open)showRequest(pend[0]);
 else if(popup&&!pend.length&&notes.some(n=>n.kind==="swap_answer"&&!n.read))toast("Есть новые ответы на ваши запросы — откройте колокольчик");
 else if(!popup&&pend.length>lastPending)toast("Новый запрос на обмен — откройте колокольчик");
 lastPending=pend.length;
}
setInterval(()=>{if(user&&!document.hidden)loadNotes(false)},30000);
$("bell").onclick=async e=>{
 e.stopPropagation();
 if(!user){openAuth("login","Войдите, чтобы видеть уведомления");return}
 const p=$("bellPanel"),opening=p.hidden;p.hidden=!opening;
 if(opening){
  renderPanel();
  try{await fetch(API+"/api/notifications/read",{method:"POST"});notes.forEach(n=>{if(n.kind!=="swap_request")n.read=true});badge()}catch{}
 }
};
document.addEventListener("click",e=>{if(!e.target.closest(".bellwrap"))$("bellPanel").hidden=true});
$("bellPanel").addEventListener("click",e=>{
 const b=e.target.closest("[data-req]");
 if(b){$("bellPanel").hidden=true;showRequest(notes.find(n=>n.swapId==b.dataset.req))}
});
function showRequest(n){
 if(!n)return;reqCur=n;
 const list=pendingList(),k=list.length,idx=list.findIndex(x=>x.id===n.id)+1;
 $("reqCount").textContent=k>1?`Запрос ${idx} из ${k}`:"Новый запрос";
 $("reqTitle").textContent=`${n.from.name} предлагает вам обмен`;
 $("reqBody").innerHTML=`<p><b>Может научить:</b> ${line(n.from.teach)}</p><p><b>Хочет научиться:</b> ${line(n.from.learn)}</p>`;
 $("reqComment").value="";$("reqErr").textContent="";
 if(!rd.open)rd.showModal();
}
async function answer(action){
 if(!reqCur)return;
 try{
  const r=await fetch(API+"/api/swaps/"+reqCur.swapId+"/respond",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action,comment:$("reqComment").value.trim()})});
  const d=await r.json().catch(()=>({}));
  if(!r.ok&&r.status!==409){$("reqErr").textContent=d.error||"Не удалось отправить ответ";return}
  toast(action==="accept"?"Вы приняли запрос. Теперь можно написать сообщение":"Вы отклонили запрос");
  await loadNotes(false);
  const next=pendingList()[0];
  if(next)showRequest(next);else{rd.close();if(action==="accept")openChat(reqCur.swapId)}
 }catch{$("reqErr").textContent="Нет связи с сервером"}
}
$("reqYes").onclick=()=>answer("accept");
$("reqNo").onclick=()=>answer("decline");
$("reqLater").onclick=()=>rd.close();
$("reqClose").onclick=()=>rd.close();
rd.addEventListener("click",e=>{if(e.target===rd)rd.close()});

/* ===== Результат подтверждения email (ссылка из письма) ===== */
{const v=new URLSearchParams(location.search).get("verified");
 if(v!==null){history.replaceState(null,"",location.pathname);
  setTimeout(()=>toast(v==="1"?"Email подтверждён! Заявка отправлена администратору. После одобрения вы сможете войти.":"Ссылка недействительна или устарела. Зарегистрируйтесь заново.",7000),700)}}

/* ===== Чат между участниками принятого обмена ===== */
let chats=[],curChat=null,lastMsgId=0,chatUnread=0,tickN=0;
const cd=$("chatDlg"),msgs=$("msgs");
function badgeChat(){const b=$("chatCount");b.hidden=!chatUnread;b.textContent=chatUnread>9?"9+":chatUnread;const t=$("tbChatCount");t.hidden=!chatUnread;t.textContent=b.textContent}
function renderChatList(){
 $("chatList").innerHTML="<h3>Диалоги</h3>"+(chats.length?chats.map(c=>`<button type="button" class="citem${c.swapId===curChat?" on":""}" data-sw="${c.swapId}">
  <span class="av">${esc(c.partner.initials)}</span><div><b>${esc(c.partner.name)}</b><span>${c.last?esc(c.last.body):"Напишите первым"}</span></div>${c.unread?`<i>${c.unread}</i>`:""}</button>`).join("")
  :'<p class="nempty">Диалогов пока нет. Чат появится, когда запрос на обмен будет принят.</p>');
}
async function loadChats(){
 if(!user){chats=[];chatUnread=0;badgeChat();return}
 try{
  const r=await fetch(API+"/api/chats");if(!r.ok)return;
  const d=await r.json(),prev=chatUnread;
  chats=d.items;chatUnread=d.unread;badgeChat();
  if(cd.open)renderChatList();else if(chatUnread>prev)toast("Новое сообщение — откройте 💬");
 }catch{}
}
function bubble(m){return `<div class="msg ${m.mine?"mine":"theirs"}"><p>${esc(m.body)}</p><time>${fmt(m.time)}</time></div>`}
async function loadMessages(full){
 if(!curChat)return;
 const id=curChat;
 try{
  const r=await fetch(API+"/api/chats/"+id+"/messages?after="+(full?0:lastMsgId));
  if(!r.ok||id!==curChat)return;
  const items=(await r.json()).items;
  if(full){msgs.innerHTML=items.length?"":'<p class="chatempty">Сообщений пока нет. Поздоровайтесь и договоритесь об обмене.</p>';lastMsgId=0}
  if(items.length){
   if(msgs.querySelector(".chatempty"))msgs.innerHTML="";
   const down=full||msgs.scrollHeight-msgs.scrollTop-msgs.clientHeight<80;
   msgs.insertAdjacentHTML("beforeend",items.map(bubble).join(""));
   lastMsgId=items[items.length-1].id;
   if(down)msgs.scrollTop=msgs.scrollHeight;
   if(!full)loadChats();
  }
 }catch{}
}
function selectChat(id){
 curChat=id;lastMsgId=0;
 const c=chats.find(x=>x.swapId===id);
 $("chatTitle").textContent=c?c.partner.name:"Сообщения";
 $("chatForm").hidden=!c;$("chatCall").hidden=!c;cd.classList.toggle("thread",!!c);
 renderChatList();
 if(c)loadMessages(true).then(()=>{c.unread=0;chatUnread=chats.reduce((t,x)=>t+x.unread,0);badgeChat();renderChatList();$("chatInput").focus()});
 else msgs.innerHTML='<p class="chatempty">Выберите диалог слева</p>';
}
async function openChat(swapId){
 if(!user){openAuth("login","Войдите, чтобы писать сообщения");return}
 if(!cd.open)cd.showModal();
 await loadChats();
 if(swapId&&chats.some(c=>c.swapId===swapId))selectChat(swapId);
 else if(!swapId&&chats.length&&matchMedia("(min-width:701px)").matches)selectChat(chats[0].swapId);
 else{curChat=null;$("chatTitle").textContent="Сообщения";$("chatForm").hidden=true;$("chatCall").hidden=true;cd.classList.remove("thread");renderChatList();msgs.innerHTML='<p class="chatempty">Выберите диалог</p>'}
}
$("chatBtn").onclick=()=>openChat(null);
$("chatList").addEventListener("click",e=>{const b=e.target.closest("[data-sw]");if(b)selectChat(+b.dataset.sw)});
$("chatBack").onclick=()=>{curChat=null;cd.classList.remove("thread");$("chatTitle").textContent="Сообщения";renderChatList()};
$("chatClose").onclick=()=>cd.close();
cd.addEventListener("click",e=>{if(e.target===cd)cd.close()});
cd.addEventListener("close",()=>{curChat=null;loadChats()});
$("chatForm").addEventListener("submit",async e=>{
 e.preventDefault();
 const inp=$("chatInput"),body=inp.value.trim();if(!body||!curChat)return;
 const btn=e.submitter||$("chatForm").querySelector("button");btn.disabled=true;
 try{
  const r=await fetch(API+"/api/chats/"+curChat+"/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({body})});
  const d=await r.json().catch(()=>({}));
  if(!r.ok){toast(d.error||"Не удалось отправить");return}
  inp.value="";
  if(msgs.querySelector(".chatempty"))msgs.innerHTML="";
  msgs.insertAdjacentHTML("beforeend",bubble(d));lastMsgId=d.id;msgs.scrollTop=msgs.scrollHeight;
  loadChats();
 }catch{toast("Нет связи с сервером")}
 finally{btn.disabled=false;inp.focus()}
});
$("bellPanel").addEventListener("click",e=>{
 const c=e.target.closest("[data-chat]");if(c){$("bellPanel").hidden=true;openChat(+c.dataset.chat)}
});
setInterval(()=>{
 if(!user||document.hidden)return;
 if(cd.open){loadMessages(false);if(++tickN%3===0)loadChats()}else if(++tickN%6===0)loadChats();
},5000);

/* ===== Личный кабинет ===== */
const cabD=$("cabDlg"),cabC=$("cabContent");
let cab=null,cabTab="profile",catsList=[];
const SLOT={"wd-mor":"Будни утром","wd-day":"Будни днём","wd-eve":"Будни вечером","we-mor":"Выходные утром","we-day":"Выходные днём","we-eve":"Выходные вечером"};
const SW_LABEL={pending:"Ждёт ответа",accepted:"Принят",declined:"Отклонён"};
const stars=n=>"★".repeat(n)+"☆".repeat(5-n);
const checks=(name,items,sel)=>items.map(([v,t])=>`<label class="cat"><input type="checkbox" name="${name}" value="${esc(v)}"${sel.includes(v)?" checked":""}><span>${esc(t)}</span></label>`).join("");
const catItems=()=>catsList.map(c=>[c.key,c.label]);
fetch(API+"/api/categories").then(r=>r.json()).then(l=>{catsList=l}).catch(()=>{});

const TABS={
 profile(){const p=cab.profile;return `<h3>Профиль</h3>
  <form id="profForm">
   <label>Имя<input name="name" value="${esc(p.name)}" maxlength="60" required></label>
   <p class="muted">Email: ${esc(p.email)}</p>
   <fieldset class="grp"><legend>Могу научить</legend><div class="cats">${checks("teachCats",catItems(),p.teachCats)}</div><input name="teachSkills" value="${esc(p.teachSkills)}" maxlength="200" placeholder="Что именно? Например: Figma, Python"></fieldset>
   <fieldset class="grp"><legend>Хочу научиться</legend><div class="cats">${checks("learnCats",catItems(),p.learnCats)}</div><input name="learnSkills" value="${esc(p.learnSkills)}" maxlength="200" placeholder="Что именно? Например: React, английский"></fieldset>
   <fieldset class="grp"><legend>Свободное время (для умного подбора)</legend><div class="cats">${checks("availability",Object.entries(SLOT),p.availability)}</div></fieldset>
   <p class="err" id="profErr" role="alert"></p><button class="go" type="submit">Сохранить</button>
  </form>`},
 swaps(){return "<h3>Мои обмены</h3>"+(cab.swaps.length?cab.swaps.map(s=>`<div class="ccard">
   <div class="crow"><b>${esc(s.partner)}</b><span class="pill2 ${s.status}">${SW_LABEL[s.status]||s.status}</span></div>
   <p>${s.dir==="out"?"Вы предложили обмен":"Вам предложили обмен"} · ${fmt(s.time)}</p>${s.comment?`<p class="muted">Комментарий: ${esc(s.comment)}</p>`:""}
   ${s.status==="accepted"&&s.canChat?`<div class="crow"><button class="mini" data-act="chat" data-id="${s.id}">Написать сообщение</button>${s.reviewed?'<small class="muted">Отзыв оставлен</small>':`<button class="mini alt" data-act="review" data-id="${s.id}" data-name="${esc(s.partner)}">Оставить отзыв</button>`}</div>`:""}</div>`).join("")
   :'<p class="nempty">Обменов пока нет. Предложите обмен на главной странице или в разделе «Подбор партнёров».</p>')},
 reviews(){const r=cab.reviews;return "<h3>Отзывы обо мне</h3>"+(r.count?`<div class="ccard"><div class="crow"><span class="lvl">${r.avg.toFixed(1)}</span><span class="cstar">${stars(Math.round(r.avg))}</span><span class="muted">Отзывов: ${r.count}</span></div></div>`
   +r.items.map(x=>`<div class="ccard"><div class="crow"><b>${esc(x.author)}</b><span class="cstar">${stars(x.rating)}</span></div>${x.comment?`<p>${esc(x.comment)}</p>`:""}<small class="muted">${fmt(x.time)}</small></div>`).join("")
   :'<p class="nempty">Отзывов пока нет. Они появятся после ваших обменов: участники смогут оценить вас в разделе «Мои обмены».</p>')},
 recs(){return `<h3>Подбор партнёров</h3><p class="muted" style="margin:-8px 0 16px">Умный подбор сравнивает, что вы хотите изучить и чему можете научить, общие навыки и свободное время.</p>`
   +(cab.recs.length?cab.recs.map(r=>`<div class="ccard"><div class="crow"><div class="crow"><span class="av" style="width:42px;height:42px;font-size:14px">${esc(r.initials)}</span><b>${esc(r.name)}</b></div><span class="score">${r.score}%</span></div>
   <div class="cats">${r.reasons.map(t=>`<span class="tg">${esc(t)}</span>`).join("")}</div>
   ${r.status?`<small class="muted">${SW_LABEL[r.status]}</small>`:`<button class="mini" data-act="offer" data-id="${r.memberId}">Предложить обмен</button>`}</div>`).join("")
   :'<p class="nempty">Пока нет подходящих участников. Заполните навыки и свободное время в профиле, чтобы подбор стал точнее.</p>')},
 ws(){return `<div class="crow" style="margin-bottom:18px"><h3 style="margin:0">Мастер-классы</h3><button class="mini" data-act="newws">+ Создать</button></div>
  <form id="wsForm" hidden>
   <label>Название<input name="title" maxlength="80" required></label>
   <label>Категория<select name="cat">${catsList.map(c=>`<option value="${esc(c.key)}">${esc(c.label)}</option>`).join("")}</select></label>
   <label>Дата и время<input name="startsAt" type="datetime-local" required></label>
   <label>Максимум участников<input name="capacity" type="number" min="2" max="100" value="10" required></label>
   <label>Ссылка на встречу (видна только участникам)<input name="link" type="url" maxlength="300" placeholder="https://meet.google.com/..."></label>
   <label>Описание<textarea name="description" maxlength="500" rows="3"></textarea></label>
   <p class="err" id="wsErr" role="alert"></p><button class="go" type="submit">Создать мастер-класс</button>
  </form>`+(cab.workshops.length?cab.workshops.map(w=>{
   const when=new Date(w.startsAt).toLocaleString("ru-RU",{day:"numeric",month:"long",hour:"2-digit",minute:"2-digit"});
   const btn=w.mine?`<button class="mini alt" data-act="delws" data-id="${w.id}">Отменить мастер-класс</button>`:w.joinedMe?`<button class="mini alt" data-act="leavews" data-id="${w.id}">Отменить запись</button>`
    :w.joined>=w.capacity?'<small class="muted">Мест нет</small>':`<button class="mini" data-act="joinws" data-id="${w.id}">Записаться</button>`;
   const link=w.link&&/^https?:\/\//i.test(w.link)?`<a class="mini alt" href="${esc(w.link)}" target="_blank" rel="noopener noreferrer">Ссылка на встречу</a>`:(w.hasLink&&!w.mine&&!w.joinedMe?'<small class="muted">Ссылка появится после записи</small>':"");
   return `<div class="ccard"><div class="crow"><b>${esc(w.title)}</b><span class="pill2">${esc(w.cat)}</span></div><p class="muted">${when} · Ведёт: ${esc(w.hostName)}${w.mine?" (вы)":""} · Записано: ${w.joined}/${w.capacity}</p>${w.description?`<p>${esc(w.description)}</p>`:""}<div class="crow">${btn}${link}</div></div>`}).join("")
   :'<p class="nempty" style="margin-top:14px">Ближайших мастер-классов нет. Создайте первый!</p>')},
 ach(){const a=cab.ach,l=a.level;return `<h3>Достижения</h3><div class="ccard"><p class="muted">Уровень ${l.n}</p><p class="lvl">${esc(l.name)}</p><div class="bar2"><i style="width:${l.pct}%"></i></div>
  <small class="muted">Очков: ${a.points}${l.next?` · до следующего уровня ${l.next-a.points}`:" · максимальный уровень"}</small></div>
  <div class="badges">${a.badges.map(b=>`<div class="badge${b.ok?" on":""}"><b>${b.ok?"✓ ":""}${esc(b.title)}</b><span>${esc(b.desc)}</span></div>`).join("")}</div>
  <p class="muted" style="margin-top:14px">Очки: 10 за обмен, 5 за отзыв, 15 за мастер-класс, бонусы за общение и полный профиль.</p>`},
};
function drawCab(){
 document.querySelectorAll("#cabNav button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.t===cabTab));
 cabC.innerHTML=cab?TABS[cabTab]():'<p class="nempty">Загрузка…</p>';
}
async function loadCab(){
 try{const r=await fetch(API+"/api/me/cabinet");if(!r.ok)return;cab=await r.json();drawCab()}catch{}
}
async function openCab(tab){
 if(!user){openAuth("login","Войдите, чтобы открыть личный кабинет");return}
 if(tab)cabTab=tab;
 if(!cabD.open)cabD.showModal();
 drawCab();await loadCab();
}
async function cabApi(url,method,body){
 const r=await fetch(API+url,{method,headers:{"Content-Type":"application/json"},body:body?JSON.stringify(body):undefined});
 const d=await r.json().catch(()=>({}));
 if(!r.ok)throw new Error(d.error||"Ошибка");
 return d;
}
$("cabBtn").onclick=()=>openCab("profile");
$("cabClose").onclick=()=>cabD.close();
cabD.addEventListener("click",e=>{if(e.target===cabD)cabD.close()});
$("cabNav").addEventListener("click",e=>{const b=e.target.closest("button");if(b){cabTab=b.dataset.t;drawCab();loadCab()}});
cabC.addEventListener("click",async e=>{
 const b=e.target.closest("[data-act]");if(!b)return;
 const id=+b.dataset.id,act=b.dataset.act;
 try{
  if(act==="newws"){const f=$("wsForm");f.hidden=!f.hidden;return}
  if(act==="chat"){cabD.close();openChat(id);return}
  if(act==="review"){openReview(id,b.dataset.name);return}
  if(act==="offer"){await cabApi("/api/swaps","POST",{memberId:id});toast("Предложение обмена отправлено");load()}
  if(act==="joinws"){await cabApi(`/api/workshops/${id}/join`,"POST");toast("Вы записаны на мастер-класс")}
  if(act==="leavews"){await cabApi(`/api/workshops/${id}/leave`,"POST");toast("Запись отменена")}
  if(act==="delws"){if(!confirm("Отменить мастер-класс?"))return;await cabApi(`/api/workshops/${id}`,"DELETE");toast("Мастер-класс отменён")}
  loadCab();
 }catch(err){toast(err.message)}
});
cabC.addEventListener("submit",async e=>{
 e.preventDefault();const f=e.target;
 if(f.id==="profForm"){
  const g=n=>[...f.querySelectorAll(`input[name="${n}"]:checked`)].map(i=>i.value),v=n=>f.elements[n].value;
  const body={name:v("name").trim(),teachCats:g("teachCats"),learnCats:g("learnCats"),teachSkills:v("teachSkills"),learnSkills:v("learnSkills"),availability:g("availability")};
  try{await cabApi("/api/me/profile","PUT",body);user.name=body.name;renderUser();toast("Профиль сохранён");load();await loadCab()}
  catch(err){$("profErr").textContent=err.message}
 }
 if(f.id==="wsForm"){
  const v=n=>f.elements[n].value;
  try{
   await cabApi("/api/workshops","POST",{title:v("title").trim(),cat:v("cat"),startsAt:new Date(v("startsAt")).toISOString(),capacity:v("capacity"),link:v("link").trim(),description:v("description")});
   toast("Мастер-класс создан");await loadCab();
  }catch(err){$("wsErr").textContent=err.name==="RangeError"?"Выберите дату и время":err.message}
 }
});

/* ===== Отзыв после обмена ===== */
const revD=$("revDlg");let revSwap=0,revVal=0;
function setStars(n){revVal=n;document.querySelectorAll("#stars button").forEach(b=>b.classList.toggle("on",+b.dataset.v<=n))}
function openReview(id,name){revSwap=id;setStars(0);$("revText").value="";$("revErr").textContent="";$("revTitle").textContent="Отзыв: "+name;revD.showModal()}
$("stars").addEventListener("click",e=>{const b=e.target.closest("button");if(b)setStars(+b.dataset.v)});
$("revCancel").onclick=()=>revD.close();
$("revForm").addEventListener("submit",async e=>{
 e.preventDefault();
 if(!revVal){$("revErr").textContent="Поставьте оценку от 1 до 5";return}
 try{await cabApi(`/api/swaps/${revSwap}/review`,"POST",{rating:revVal,comment:$("revText").value.trim()});revD.close();toast("Спасибо! Отзыв отправлен");load();loadCab()}
 catch(err){$("revErr").textContent=err.message}
});

/* ===== Видеозвонок (WebRTC) ===== */
const callD=$("callDlg"),ringD=$("ringDlg");
let pc=null,callSwap=0,callLast=0,callPoll=null,localStream=null,pendingIce=[],iceQ=[],sigReady=false,callBusy=false,ringing=null,lastRing=0,ringTimer=null;
const RTC_CFG={iceServers:[{urls:"stun:stun.l.google.com:19302"}]};
callD.addEventListener("cancel",e=>e.preventDefault());
async function sig(kind,data){
 try{
  const r=await fetch(API+"/api/chats/"+callSwap+"/call",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({kind,data:JSON.stringify(data||{})})});
  return r.ok?(await r.json()).id:0;
 }catch{return 0}
}
function flushIce(){sigReady=true;for(const c of iceQ.splice(0))sig("ice",c)}
function endCall(){
 clearInterval(callPoll);callPoll=null;
 if(pc){pc.ontrack=pc.onicecandidate=pc.onconnectionstatechange=null;pc.close();pc=null}
 if(localStream){localStream.getTracks().forEach(t=>t.stop());localStream=null}
 $("remoteV").srcObject=null;$("localV").srcObject=null;
 pendingIce=[];iceQ=[];sigReady=false;callBusy=false;callSwap=0;
 $("callMic").classList.remove("off");$("callCam").classList.remove("off");
 if(callD.open)callD.close();
}
async function setupCall(swapId){
 callSwap=swapId;sigReady=false;iceQ=[];pendingIce=[];
 localStream=await navigator.mediaDevices.getUserMedia({video:true,audio:true});
 $("localV").srcObject=localStream;
 pc=new RTCPeerConnection(RTC_CFG);
 localStream.getTracks().forEach(t=>pc.addTrack(t,localStream));
 pc.ontrack=e=>{$("remoteV").srcObject=e.streams[0];$("callSt").textContent=""};
 pc.onicecandidate=e=>{if(!e.candidate)return;sigReady?sig("ice",e.candidate):iceQ.push(e.candidate)};
 pc.onconnectionstatechange=()=>{if(pc&&pc.connectionState==="failed")$("callSt").textContent="Не удалось соединиться. Возможно, мешает настройка сети."};
 if(!callD.open)callD.showModal();
}
async function applySignals(){
 if(!callSwap||!pc)return;
 try{
  const r=await fetch(API+"/api/chats/"+callSwap+"/call?after="+callLast);if(!r.ok)return;
  for(const s of (await r.json()).items){
   callLast=s.id;
   if(s.kind==="hangup"){toast("Собеседник завершил звонок");endCall();return}
   if(!pc)return;
   const d=JSON.parse(s.data||"{}");
   if(s.kind==="answer"&&!pc.remoteDescription){await pc.setRemoteDescription(d);for(const c of pendingIce.splice(0))await pc.addIceCandidate(c).catch(()=>{});$("callSt").textContent="Соединяем…"}
   else if(s.kind==="ice"){if(pc.remoteDescription)await pc.addIceCandidate(d).catch(()=>{});else pendingIce.push(d)}
  }
 }catch{}
}
const callErr=e=>e&&e.name==="NotAllowedError"?"Разрешите доступ к камере и микрофону":e&&e.name==="NotFoundError"?"Камера или микрофон не найдены":"Не удалось начать звонок";
async function startCall(swapId){
 if(callBusy)return;
 if(!navigator.mediaDevices||!window.RTCPeerConnection){toast("Ваш браузер не поддерживает видеозвонки");return}
 callBusy=true;
 try{
  await setupCall(swapId);$("callSt").textContent="Звоним…";
  const offer=await pc.createOffer();await pc.setLocalDescription(offer);
  callLast=await sig("offer",pc.localDescription);
  if(!callLast)throw new Error("signal");
  flushIce();callPoll=setInterval(applySignals,1000);
  setTimeout(()=>{if(pc&&callSwap===swapId&&!pc.remoteDescription){sig("hangup");toast("Нет ответа");endCall()}},45000);
 }catch(e){toast(callErr(e));if(callSwap)await sig("hangup");endCall()}
}
async function acceptCall(inc){
 if(callBusy)return;
 callBusy=true;
 try{
  await setupCall(inc.swapId);$("callSt").textContent="Соединяем…";
  await pc.setRemoteDescription(JSON.parse(inc.data));
  const ans=await pc.createAnswer();await pc.setLocalDescription(ans);
  callLast=inc.offerId;
  await sig("answer",pc.localDescription);flushIce();
  callPoll=setInterval(applySignals,1000);
 }catch(e){toast(callErr(e));if(callSwap)await sig("hangup");endCall()}
}
$("callEnd").onclick=async()=>{await sig("hangup");endCall()};
const toggleTrack=(btn,kind)=>{if(!localStream)return;const t=localStream[kind]()[0];if(t){t.enabled=!t.enabled;btn.classList.toggle("off",!t.enabled)}};
$("callMic").onclick=e=>toggleTrack(e.currentTarget,"getAudioTracks");
$("callCam").onclick=e=>toggleTrack(e.currentTarget,"getVideoTracks");
$("chatCall").onclick=()=>{const id=curChat;if(!id)return;cd.close();startCall(id)};
$("ringYes").onclick=()=>{clearTimeout(ringTimer);ringD.close();if(ringing)acceptCall(ringing)};
$("ringNo").onclick=async()=>{clearTimeout(ringTimer);ringD.close();if(ringing){callSwap=ringing.swapId;await sig("hangup");callSwap=0}};
setInterval(async()=>{
 if(!user||document.hidden||callBusy||ringD.open)return;
 try{
  const r=await fetch(API+"/api/calls/incoming");if(!r.ok)return;
  const c=(await r.json()).call;
  if(c&&c.offerId!==lastRing){
   lastRing=c.offerId;ringing=c;$("ringName").textContent=c.from+" звонит вам";ringD.showModal();
   clearTimeout(ringTimer);ringTimer=setTimeout(()=>{if(ringD.open)ringD.close()},40000);
  }
 }catch{}
},3000);

/* ===== Нижняя панель на телефоне ===== */
$("tbSearch").onclick=()=>{$("q").scrollIntoView({behavior:"smooth",block:"center"});setTimeout(()=>$("q").focus({preventScroll:true}),500)};
$("tbChat").onclick=()=>openChat(null);
$("tbBell").onclick=e=>{e.stopPropagation();$("bell").click()};
$("tbCab").onclick=()=>openCab("profile");
// пока открыта клавиатура, панель прячется, чтобы не перекрывать поле ввода
addEventListener("focusin",e=>{if(e.target.matches("input,textarea,select"))document.body.classList.add("kb")});
addEventListener("focusout",()=>document.body.classList.remove("kb"));
