import{t as ct,g as ut}from"./themes-CEUuST2L.js";import{h as lt,m as ft,b as F,a as q,r as dt,o as ht,i as G,D as mt,c as pt}from"./storage-CDFuoDun.js";import{B as g,a as _,b as gt,c as bt,A as K,d as a,M as J,G as C,D as Tt,e as A,P as At,f as Et}from"./constants-ByHFNZov.js";const Ct={matches:()=>!0,block:['[id*="sponsor"]','iframe[src*="ads"]'],popupDeny:["ins.adsbygoogle a",'[id*="sponsor" i] a','[class*="banner" i] a[target]','a[href^="javascript:"][target]']},St=["[data-message-id]",'[aria-roledescription="tin nhắn"]','[role="log"][aria-label]','[role="grid"][aria-label*="cuộc trò chuyện" i]','[role="grid"][aria-label*="conversation" i]'],yt=['div[dir="auto"]','span[dir="auto"]',"img","video","canvas",'[role="img"]'],Lt=['[data-scope="date_break"]','[role="toolbar"]'],_t={matches:t=>/(^|\.)(facebook|messenger)\.com$/.test(t),blur:St.flatMap(t=>yt.map(e=>`${t} ${e}`)),blurExclude:Lt,decor:{message:"[data-message-id]",bubble:'[data-message-id] div[role="presentation"]:has(> span[dir="auto"])'}},L=[Ct,_t];function vt(t){const e=L.filter(n=>n.matches(t));return{deny:e.flatMap(n=>n.popupDeny??[]).join(", "),allow:e.flatMap(n=>n.popupAllow??[]).join(", ")}}function wt(t){return L.filter(e=>e.matches(t)).flatMap(e=>e.block??[])}function Bt(t){return L.filter(e=>e.matches(t)).flatMap(e=>e.blur??[])}function $t(t){var e;return((e=L.find(n=>n.matches(t)&&n.decor))==null?void 0:e.decor)??null}function kt(t){return L.filter(e=>e.matches(t)).flatMap(e=>e.blurExclude??[]).join(", ")}function E(t){try{return Array.from(document.querySelectorAll(t))}catch{return console.warn("[trg] Selector không hợp lệ:",t),[]}}const xt=`
  [${g}] {
    filter: blur(0.32rem) contrast(1.04) saturate(0.9);
    transition: filter 140ms ease;
  }

  /* :has(:hover) để phần tử cha bỏ mờ khi rê chuột vào con đã bị mờ —
     filter của cha vẫn phủ lên con nếu chỉ bỏ mờ mỗi con. */
  [${g}]:hover,
  [${g}]:focus-within,
  [${g}]:has(:hover) {
    filter: none;
  }

  /* Rê chuột vào bất kỳ đâu trong dòng là bỏ mờ cả dòng — không phải trúng
     đúng đoạn chữ mới hiện. */
  [${_}]:hover [${g}] {
    filter: none;
  }
`;let f=null;function Dt(){f!=null&&f.isConnected||(f=document.createElement("style"),f.id=bt,f.textContent=xt,(document.head??document.documentElement).append(f))}function Ot(t){if(!(t instanceof HTMLImageElement))return!1;const{width:e,height:n}=t.getBoundingClientRect(),r=e||t.naturalWidth,o=n||t.naturalHeight;return!r||!o?!1:r<=K&&o<=K}function Rt(t,e){if(!e)return!1;try{return t.closest(e)!==null}catch{return!1}}function Pt(t,e=""){var n;if(t.length!==0){Dt();for(const r of t)for(const o of E(r))o.hasAttribute(g)||Ot(o)||Rt(o,e)||(o.setAttribute(g,""),(n=o.closest(gt))==null||n.setAttribute(_,""))}}function B(){for(const t of E(`[${g}]`))t.removeAttribute(g);for(const t of E(`[${_}]`))t.removeAttribute(_);f==null||f.remove(),f=null}let s=null,$="";function Ut(t){const e=n=>{const r=t[n];return`
  [${a}="${n}"] {
    --trg-frame: ${r.frame};
    --trg-bg: ${r.background};
    --trg-text: ${r.text};
  }

  [${C}] [${a}="${n}"] {
    padding-${n==="in"?"right":"left"}: 44px !important;
  }

  [${C}] [${a}="${n}"]::after {
    ${n==="in"?"right":"left"}: 3px;
    background-image: ${ct(r.character)};
  }`};return`
  [${a}] {
    position: relative;
    border: 2.5px solid var(--trg-frame) !important;
    border-radius: 16px !important;
    background: var(--trg-bg) !important;
    color: var(--trg-text) !important;
    box-shadow: 0 2px 0 var(--trg-frame);
  }

  /* Facebook đặt màu chữ ở thẻ con nên phải ép thừa kế xuống. */
  [${a}] span,
  [${a}] div {
    color: inherit !important;
  }

  /* Nhân vật ngồi HẲN TRONG lòng bong bóng. Cho nó ló ra ngoài thì phải ép
     overflow:visible lên các lớp bọc của Facebook, mà một trong số đó dùng
     overflow để cắt lớp nền bong bóng theo bo góc — mở ra là nền tràn thành
     vệt ngang hết màn hình. */
  [${C}] [${a}] {
    min-height: 42px !important;
  }

  [${C}] [${a}]::after {
    content: "";
    position: absolute;
    bottom: 2px;
    width: 38px;
    height: 38px;
    background-repeat: no-repeat;
    background-size: contain;
    pointer-events: none;
  }
${e("in")}
${e("out")}
`}function It(t){s!=null&&s.isConnected&&$===t.id||(s==null||s.remove(),s=document.createElement("style"),s.id=Tt,s.textContent=Ut(t),(document.head??document.documentElement).append(s),$=t.id)}function Nt(t,e){const n=e.getBoundingClientRect(),r=t.getBoundingClientRect();return n.width===0||r.width===0?null:n.right-r.right<r.left-n.left?"out":"in"}function Mt(t,e,n){n!==t.hasAttribute(e)&&(n?t.setAttribute(e,""):t.removeAttribute(e))}function j(t){const e=t.querySelector(`[${a}]`);return(e==null?void 0:e.getAttribute(a))??null}function Ft(t){const e=E(t.message);for(let n=0;n<e.length;n+=1){const r=j(e[n]),o=n+1<e.length?j(e[n+1]):null;Mt(e[n],C,r!==null&&r!==o)}}function qt(t,e){It(e);for(const n of E(t.bubble)){const r=n.closest(t.message);if(r){if(!n.hasAttribute(a)){const o=Nt(n,r);if(!o)continue;n.setAttribute(a,o)}r.setAttribute(J,"")}}Ft(t)}function k(){for(const t of[a,J,C])for(const e of E(`[${t}]`))e.removeAttribute(t);s==null||s.remove(),s=null,$=""}function Gt(t){for(const e of t)for(const n of E(e))n.remove()}let b=null,y=[],H=!1;function tt(){return b!==null||y.length>0}function et(t){const e=lt(t,location.href);return e!==""&&ft(y,e)}const Kt='a, button, input, select, textarea, summary, label, [role="button"], [role="link"], [onclick]',jt=.6,Ht=2e3;function S(t,e){if(!e)return null;try{return t.closest(e)}catch{return null}}function nt(t){return t.ctrlKey||t.metaKey||t.shiftKey||t.altKey||t.button!==0}function z(t){const e=t.target.trim().toLowerCase();return e!==""&&e!=="_self"&&e!=="_top"&&e!=="_parent"}function zt(t){const{width:e,height:n}=t.getBoundingClientRect(),r=e*n;if(r===0)return!1;const o=window.innerWidth*window.innerHeight;if(o>0&&r/o>=jt)return!0;const i=getComputedStyle(t);return Number(i.opacity)<.1?!0:!((t.textContent??"").trim()!==""||t.querySelector("img, svg, video, picture, canvas")!==null||i.backgroundImage!=="none")&&r>=Ht}function Qt(t,e){if(S(t,e))return"luật của trang";const n=t.getAttribute("href")??"";if(/^\s*(javascript|data):/i.test(n))return z(t)?"javascript: mở tab mới":null;let r;try{r=new URL(t.href,location.href)}catch{return null}if(r.protocol!=="http:"&&r.protocol!=="https:")return null;const o=F(r.hostname)!==F(location.hostname),i=z(t);return!o&&!i?null:zt(t)?"lớp phủ bẫy click":o&&i?"liên kết lạ mở tab mới":null}function rt(t){if(!(t instanceof Element))return null;const e=S(t,"a[href]");return e&&et(e.href)?"domain bị chặn":!b||S(t,b.allow)?null:e?Qt(e,b.deny):S(t,b.deny)?"luật của trang":null}function I(t){var e,n;try{(n=(e=chrome.runtime.sendMessage({type:t}))==null?void 0:e.catch)==null||n.call(e,()=>{})}catch{}}function ot(t){if(!(t instanceof Element))return!1;const e=S(t,"a[href]");return e!==null&&et(e.href)}function x(t){!(t instanceof Element)||!S(t,Kt)||I(A.POPUP_ALLOW_OPEN)}function Vt(t){if(!tt())return;if(nt(t)&&!ot(t.target)){x(t.target);return}const e=rt(t.target);if(!e){x(t.target);return}t.preventDefault(),t.stopImmediatePropagation(),t.target instanceof Element&&t.target.setAttribute(At,e),I(A.POPUP_BLOCKED),it(e)}function Q(t){tt()&&(t instanceof MouseEvent&&nt(t)&&!ot(t.target)||rt(t.target)&&t.stopImmediatePropagation())}let D="";function N(){const t=`${b!==null}|${y.join(",")}`;t!==D&&(D=t,window.postMessage({type:A.BLOCKLIST_PUSH,domains:y,guard:b!==null},"*"))}function Wt(t){if(t.source!==window)return;const e=t.data;if(e){if(e.type===A.BLOCKLIST_REQUEST){D="",N();return}e.type===A.POPUP_BLOCKED&&(I(A.POPUP_BLOCKED),it(typeof e.reason=="string"?e.reason:"bị chặn"))}}let T=null,m=null,O=0,R=0;const Yt=`
  .box {
    position: fixed;
    bottom: 16px;
    left: 16px;
    z-index: 2147483647;
    max-width: 320px;
    padding: 10px 14px;
    border-radius: 10px;
    background: #111827;
    color: #f9fafb;
    font: 500 13px/1.45 system-ui, sans-serif;
    box-shadow: 0 8px 24px rgb(0 0 0 / 0.35);
    opacity: 0;
    transform: translateY(8px);
    transition: opacity 160ms ease, transform 160ms ease;
    pointer-events: none;
  }

  .box[data-show] {
    opacity: 1;
    transform: none;
  }
`;function Xt(){if(m!=null&&m.isConnected)return m;T=document.createElement("div"),T.style.cssText="all: initial; position: fixed; inset: 0 auto auto 0;";const t=T.attachShadow({mode:"closed"}),e=document.createElement("style");return e.textContent=Yt,m=document.createElement("div"),m.className="box",t.append(e,m),document.documentElement.append(T),m}function it(t){R+=1;const e=Xt();e.textContent=`Trg đã chặn ${R} liên kết (${t}). Ctrl+click để mở.`,e.setAttribute("data-show",""),clearTimeout(O),O=window.setTimeout(()=>e.removeAttribute("data-show"),Et)}function Zt(){H||(H=!0,window.addEventListener("message",Wt,!0),document.addEventListener("click",Vt,!0),document.addEventListener("mousedown",Q,!0),document.addEventListener("pointerdown",Q,!0),document.addEventListener("auxclick",t=>{b&&x(t.target)},!0))}function Jt(t){b=t,N(),t||(clearTimeout(O),T==null||T.remove(),T=null,m=null,R=0)}function te(t){y=t,N()}function ee(t){const e=t.getAttribute("id");return e!==null&&e!==""?e.match(/(?:^\d|:)/)?`[id="${e}"]`:"#"+e:null}function ne(t){if(!t.hasAttribute("class"))return[];try{return Array.prototype.slice.call(t.classList).filter(n=>/^[a-z_-][a-z\d_-]*$/i.test(n)?n:null)}catch{let n=t.getAttribute("class");return n=n.trim().replace(/\s+/g," "),n.split(" ")}}function re(t){return ne(t).filter(Boolean).map(n=>`.${n}`)}function st(t,e,n,r,o,i,c){if(i===c){t.push(n.slice(0,i).join(""));return}for(let u=r;u<=o&&o-u+1>=c-i;++u)n[i]=e[u],st(t,e,n,u+1,o,i+1,c)}function oe(t,e){const n=[],r=t.length,o=[];for(var i=1;i<=e;++i)st(n,t,o,0,r-1,0,i);return n}function ie(t,e=["id","class","length"]){const{attributes:n}=t;return[...n].reduce((o,i)=>(e.indexOf(i.nodeName)>-1||o.push(`[${i.nodeName}="${i.value}"]`),o),[])}function at(t){let e;return typeof HTMLElement=="object"?e=t instanceof HTMLElement:e=!!t&&typeof t=="object"&&t.nodeType===1&&typeof t.nodeName=="string",e}function se(t){let e=0,n,r;const{parentNode:o}=t;if(o){const{childNodes:i}=o,c=i.length;for(n=0;n<c;n++)if(r=i[n],at(r)&&(e++,r===t))return`:nth-child(${e})`}return null}function ae(t){return t.tagName.toLowerCase().replace(/:/g,"\\:")}function ce(t,e){if(!e)return!1;const n=t.ownerDocument.querySelectorAll(e);return n.length===1&&n[0]===t}function ue(t){const e=[];let n=t;for(;at(n);)e.push(n),n=n.parentNode;return e}function le(t,e,n){const r={Tag:ae,NthChild:se,Attributes:o=>ie(o,n),Class:re,ID:ee};return e.reduce((o,i)=>(o[i]=r[i](t),o),{})}function P(t,e){const{parentNode:n}=t,r=n.querySelectorAll(e);return r.length===1&&r[0]===t}function V(t,e){return e.find(P.bind(null,t))}function W(t,e,n){let r=oe(e,3),o=V(t,r);return o||n&&(r=r.map(i=>n+i),o=V(t,r),o)?o:null}function fe(t,e,n,r){let o;const i=le(t,e,n);r&&r instanceof RegExp&&(i.ID=r.test(i.ID)?null:i.ID,i.Class=i.Class.filter(c=>!r.test(c)));for(let c of e){const{ID:u,Tag:d,Class:h,Attributes:v,NthChild:M}=i;switch(c){case"ID":if(u&&P(t,u))return u;break;case"Tag":if(d&&P(t,d))return d;break;case"Class":if(h&&h.length&&(o=W(t,h,d),o))return o;break;case"Attributes":if(v&&v.length&&(o=W(t,v,d),o))return o;break;case"NthChild":if(M)return M}}return"*"}function Y(t,e={}){const{selectorTypes:n=["ID","Class","Tag","NthChild"],attributesToIgnore:r=["id","class","length"],excludeRegex:o=null}=e,i=[],c=ue(t);for(let d of c){const h=fe(d,n,r,o);h&&i.push(h)}const u=[];for(let d of i){u.unshift(d);const h=u.join(" > ");if(ce(t,h))return h}return null}const X={selectorTypes:["ID","Class","Tag","NthChild"]};function de(t){let e=null;document.addEventListener("contextmenu",n=>{e=n.target},!0),chrome.runtime.onMessage.addListener(n=>{if(e)if(n.type===A.ADD_BLOCK_SELECTOR){const r=e;q("selectors",t,Y(r,X)).then(()=>{r.remove()})}else n.type===A.ADD_BLUR_SELECTOR&&q("blurSelectors",t,Y(e,X))})}const l=location.hostname,he=wt(l),me=Bt(l),pe=kt(l),Z=$t(l),ge=vt(l);let p=mt,w=!1;function U(){const t=G(p.enabledDomains,l);if(te(p.blockedDomains),Jt(t&&pt(p.popupGuardMap,l)?ge:null),!t){B(),k();return}Gt([...he,...p.selectors[l]??[]]),G(p.blurMap,l)?Pt([...me,...p.blurSelectors[l]??[]],pe):B();const e=ut(p.themeMap[l]);Z&&e?qt(Z,e):k()}function be(){w||(w=!0,requestAnimationFrame(()=>{w=!1,U()}))}async function Te(){de(l),Zt(),p=await dt(),U(),new MutationObserver(be).observe(document.documentElement,{childList:!0,subtree:!0}),ht(t=>{p=t,B(),k(),U()})}Te();
