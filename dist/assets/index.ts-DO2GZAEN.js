import{t as et,g as nt}from"./themes-CEUuST2L.js";import{a as I,r as ot,o as rt,i as N,D as it,b as st}from"./storage-CnoYWep3.js";import{B as h,a as v,b as at,c as ct,A as P,d as a,M as X,G as E,D as lt,P as ut,e as ft,f as y}from"./constants-DiZ4HZUH.js";const dt={matches:()=>!0,block:['[id*="sponsor"]','iframe[src*="ads"]'],popupDeny:["ins.adsbygoogle a",'[id*="sponsor" i] a','[class*="banner" i] a[target]','a[href^="javascript:"][target]']},mt=["[data-message-id]",'[aria-roledescription="tin nhắn"]','[role="log"][aria-label]','[role="grid"][aria-label*="cuộc trò chuyện" i]','[role="grid"][aria-label*="conversation" i]'],pt=['div[dir="auto"]','span[dir="auto"]',"img","video","canvas",'[role="img"]'],ht=['[data-scope="date_break"]','[role="toolbar"]'],gt={matches:t=>/(^|\.)(facebook|messenger)\.com$/.test(t),blur:mt.flatMap(t=>pt.map(e=>`${t} ${e}`)),blurExclude:ht,decor:{message:"[data-message-id]",bubble:'[data-message-id] div[role="presentation"]:has(> span[dir="auto"])'}},S=[dt,gt];function bt(t){const e=S.filter(n=>n.matches(t));return{deny:e.flatMap(n=>n.popupDeny??[]).join(", "),allow:e.flatMap(n=>n.popupAllow??[]).join(", ")}}function Tt(t){return S.filter(e=>e.matches(t)).flatMap(e=>e.block??[])}function At(t){return S.filter(e=>e.matches(t)).flatMap(e=>e.blur??[])}function Et(t){var e;return((e=S.find(n=>n.matches(t)&&n.decor))==null?void 0:e.decor)??null}function Ct(t){return S.filter(e=>e.matches(t)).flatMap(e=>e.blurExclude??[]).join(", ")}function A(t){try{return Array.from(document.querySelectorAll(t))}catch{return console.warn("[trg] Selector không hợp lệ:",t),[]}}const St=`
  [${h}] {
    filter: blur(0.32rem) contrast(1.04) saturate(0.9);
    transition: filter 140ms ease;
  }

  /* :has(:hover) để phần tử cha bỏ mờ khi rê chuột vào con đã bị mờ —
     filter của cha vẫn phủ lên con nếu chỉ bỏ mờ mỗi con. */
  [${h}]:hover,
  [${h}]:focus-within,
  [${h}]:has(:hover) {
    filter: none;
  }

  /* Rê chuột vào bất kỳ đâu trong dòng là bỏ mờ cả dòng — không phải trúng
     đúng đoạn chữ mới hiện. */
  [${v}]:hover [${h}] {
    filter: none;
  }
`;let f=null;function vt(){f!=null&&f.isConnected||(f=document.createElement("style"),f.id=ct,f.textContent=St,(document.head??document.documentElement).append(f))}function yt(t){if(!(t instanceof HTMLImageElement))return!1;const{width:e,height:n}=t.getBoundingClientRect(),o=e||t.naturalWidth,r=n||t.naturalHeight;return!o||!r?!1:o<=P&&r<=P}function _t(t,e){if(!e)return!1;try{return t.closest(e)!==null}catch{return!1}}function Lt(t,e=""){var n;if(t.length!==0){vt();for(const o of t)for(const r of A(o))r.hasAttribute(h)||yt(r)||_t(r,e)||(r.setAttribute(h,""),(n=r.closest(at))==null||n.setAttribute(v,""))}}function w(){for(const t of A(`[${h}]`))t.removeAttribute(h);for(const t of A(`[${v}]`))t.removeAttribute(v);f==null||f.remove(),f=null}let s=null,$="";function wt(t){const e=n=>{const o=t[n];return`
  [${a}="${n}"] {
    --trg-frame: ${o.frame};
    --trg-bg: ${o.background};
    --trg-text: ${o.text};
  }

  [${E}] [${a}="${n}"] {
    padding-${n==="in"?"right":"left"}: 44px !important;
  }

  [${E}] [${a}="${n}"]::after {
    ${n==="in"?"right":"left"}: 3px;
    background-image: ${et(o.character)};
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
  [${E}] [${a}] {
    min-height: 42px !important;
  }

  [${E}] [${a}]::after {
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
`}function $t(t){s!=null&&s.isConnected&&$===t.id||(s==null||s.remove(),s=document.createElement("style"),s.id=lt,s.textContent=wt(t),(document.head??document.documentElement).append(s),$=t.id)}function Bt(t,e){const n=e.getBoundingClientRect(),o=t.getBoundingClientRect();return n.width===0||o.width===0?null:n.right-o.right<o.left-n.left?"out":"in"}function xt(t,e,n){n!==t.hasAttribute(e)&&(n?t.setAttribute(e,""):t.removeAttribute(e))}function M(t){const e=t.querySelector(`[${a}]`);return(e==null?void 0:e.getAttribute(a))??null}function kt(t){const e=A(t.message);for(let n=0;n<e.length;n+=1){const o=M(e[n]),r=n+1<e.length?M(e[n+1]):null;xt(e[n],E,o!==null&&o!==r)}}function Rt(t,e){$t(e);for(const n of A(t.bubble)){const o=n.closest(t.message);if(o){if(!n.hasAttribute(a)){const r=Bt(n,o);if(!r)continue;n.setAttribute(a,r)}o.setAttribute(X,"")}}kt(t)}function B(){for(const t of[a,X,E])for(const e of A(`[${t}]`))e.removeAttribute(t);s==null||s.remove(),s=null,$=""}function Dt(t){for(const e of t)for(const n of A(e))n.remove()}let b=null,F=!1;const Ot='a, button, input, select, textarea, summary, label, [role="button"], [role="link"], [onclick]',Ut=.6,It=2e3,Nt=new Set(["com","net","org","edu","gov","co","ac","or","ne","go","info","biz"]);function q(t){const e=t.toLowerCase().split(".");if(e.length<=2)return e.join(".");const n=Nt.has(e[e.length-2])?3:2;return e.slice(-n).join(".")}function C(t,e){if(!e)return null;try{return t.closest(e)}catch{return null}}function Y(t){return t.ctrlKey||t.metaKey||t.shiftKey||t.altKey||t.button!==0}function G(t){const e=t.target.trim().toLowerCase();return e!==""&&e!=="_self"&&e!=="_top"&&e!=="_parent"}function Pt(t){const{width:e,height:n}=t.getBoundingClientRect(),o=e*n;if(o===0)return!1;const r=window.innerWidth*window.innerHeight;if(r>0&&o/r>=Ut)return!0;const i=getComputedStyle(t);return Number(i.opacity)<.1?!0:!((t.textContent??"").trim()!==""||t.querySelector("img, svg, video, picture, canvas")!==null||i.backgroundImage!=="none")&&o>=It}function Mt(t,e){if(C(t,e))return"luật của trang";const n=t.getAttribute("href")??"";if(/^\s*(javascript|data):/i.test(n))return G(t)?"javascript: mở tab mới":null;let o;try{o=new URL(t.href,location.href)}catch{return null}if(o.protocol!=="http:"&&o.protocol!=="https:")return null;const r=q(o.hostname)!==q(location.hostname),i=G(t);return!r&&!i?null:Pt(t)?"lớp phủ bẫy click":r&&i?"liên kết lạ mở tab mới":null}function Q(t){if(!b||!(t instanceof Element)||C(t,b.allow))return null;const e=C(t,"a[href]");return e?Mt(e,b.deny):C(t,b.deny)?"luật của trang":null}function Z(t){var e,n;try{(n=(e=chrome.runtime.sendMessage({type:t}))==null?void 0:e.catch)==null||n.call(e,()=>{})}catch{}}function x(t){!(t instanceof Element)||!C(t,Ot)||Z(y.POPUP_ALLOW_OPEN)}function Ft(t){if(!b)return;if(Y(t)){x(t.target);return}const e=Q(t.target);if(!e){x(t.target);return}t.preventDefault(),t.stopImmediatePropagation(),t.target instanceof Element&&t.target.setAttribute(ut,e),Z(y.POPUP_BLOCKED),jt(e)}function j(t){b&&(t instanceof MouseEvent&&Y(t)||Q(t.target)&&t.stopImmediatePropagation())}let T=null,p=null,k=0,R=0;const qt=`
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
`;function Gt(){if(p!=null&&p.isConnected)return p;T=document.createElement("div"),T.style.cssText="all: initial; position: fixed; inset: 0 auto auto 0;";const t=T.attachShadow({mode:"closed"}),e=document.createElement("style");return e.textContent=qt,p=document.createElement("div"),p.className="box",t.append(e,p),document.documentElement.append(T),p}function jt(t){R+=1;const e=Gt();e.textContent=`Trg đã chặn ${R} liên kết (${t}). Ctrl+click để mở.`,e.setAttribute("data-show",""),clearTimeout(k),k=window.setTimeout(()=>e.removeAttribute("data-show"),ft)}function Kt(){F||(F=!0,document.addEventListener("click",Ft,!0),document.addEventListener("mousedown",j,!0),document.addEventListener("pointerdown",j,!0),document.addEventListener("auxclick",t=>{b&&x(t.target)},!0))}function zt(t){b=t,t||(clearTimeout(k),T==null||T.remove(),T=null,p=null,R=0)}function Ht(t){const e=t.getAttribute("id");return e!==null&&e!==""?e.match(/(?:^\d|:)/)?`[id="${e}"]`:"#"+e:null}function Vt(t){if(!t.hasAttribute("class"))return[];try{return Array.prototype.slice.call(t.classList).filter(n=>/^[a-z_-][a-z\d_-]*$/i.test(n)?n:null)}catch{let n=t.getAttribute("class");return n=n.trim().replace(/\s+/g," "),n.split(" ")}}function Wt(t){return Vt(t).filter(Boolean).map(n=>`.${n}`)}function J(t,e,n,o,r,i,c){if(i===c){t.push(n.slice(0,i).join(""));return}for(let l=o;l<=r&&r-l+1>=c-i;++l)n[i]=e[l],J(t,e,n,l+1,r,i+1,c)}function Xt(t,e){const n=[],o=t.length,r=[];for(var i=1;i<=e;++i)J(n,t,r,0,o-1,0,i);return n}function Yt(t,e=["id","class","length"]){const{attributes:n}=t;return[...n].reduce((r,i)=>(e.indexOf(i.nodeName)>-1||r.push(`[${i.nodeName}="${i.value}"]`),r),[])}function tt(t){let e;return typeof HTMLElement=="object"?e=t instanceof HTMLElement:e=!!t&&typeof t=="object"&&t.nodeType===1&&typeof t.nodeName=="string",e}function Qt(t){let e=0,n,o;const{parentNode:r}=t;if(r){const{childNodes:i}=r,c=i.length;for(n=0;n<c;n++)if(o=i[n],tt(o)&&(e++,o===t))return`:nth-child(${e})`}return null}function Zt(t){return t.tagName.toLowerCase().replace(/:/g,"\\:")}function Jt(t,e){if(!e)return!1;const n=t.ownerDocument.querySelectorAll(e);return n.length===1&&n[0]===t}function te(t){const e=[];let n=t;for(;tt(n);)e.push(n),n=n.parentNode;return e}function ee(t,e,n){const o={Tag:Zt,NthChild:Qt,Attributes:r=>Yt(r,n),Class:Wt,ID:Ht};return e.reduce((r,i)=>(r[i]=o[i](t),r),{})}function D(t,e){const{parentNode:n}=t,o=n.querySelectorAll(e);return o.length===1&&o[0]===t}function K(t,e){return e.find(D.bind(null,t))}function z(t,e,n){let o=Xt(e,3),r=K(t,o);return r||n&&(o=o.map(i=>n+i),r=K(t,o),r)?r:null}function ne(t,e,n,o){let r;const i=ee(t,e,n);o&&o instanceof RegExp&&(i.ID=o.test(i.ID)?null:i.ID,i.Class=i.Class.filter(c=>!o.test(c)));for(let c of e){const{ID:l,Tag:d,Class:m,Attributes:_,NthChild:U}=i;switch(c){case"ID":if(l&&D(t,l))return l;break;case"Tag":if(d&&D(t,d))return d;break;case"Class":if(m&&m.length&&(r=z(t,m,d),r))return r;break;case"Attributes":if(_&&_.length&&(r=z(t,_,d),r))return r;break;case"NthChild":if(U)return U}}return"*"}function H(t,e={}){const{selectorTypes:n=["ID","Class","Tag","NthChild"],attributesToIgnore:o=["id","class","length"],excludeRegex:r=null}=e,i=[],c=te(t);for(let d of c){const m=ne(d,n,o,r);m&&i.push(m)}const l=[];for(let d of i){l.unshift(d);const m=l.join(" > ");if(Jt(t,m))return m}return null}const V={selectorTypes:["ID","Class","Tag","NthChild"]};function oe(t){let e=null;document.addEventListener("contextmenu",n=>{e=n.target},!0),chrome.runtime.onMessage.addListener(n=>{if(e)if(n.type===y.ADD_BLOCK_SELECTOR){const o=e;I("selectors",t,H(o,V)).then(()=>{o.remove()})}else n.type===y.ADD_BLUR_SELECTOR&&I("blurSelectors",t,H(e,V))})}const u=location.hostname,re=Tt(u),ie=At(u),se=Ct(u),W=Et(u),ae=bt(u);let g=it,L=!1;function O(){const t=N(g.enabledDomains,u);if(zt(t&&st(g.popupGuardMap,u)?ae:null),!t){w(),B();return}Dt([...re,...g.selectors[u]??[]]),N(g.blurMap,u)?Lt([...ie,...g.blurSelectors[u]??[]],se):w();const e=nt(g.themeMap[u]);W&&e?Rt(W,e):B()}function ce(){L||(L=!0,requestAnimationFrame(()=>{L=!1,O()}))}async function le(){oe(u),Kt(),g=await ot(),O(),new MutationObserver(ce).observe(document.documentElement,{childList:!0,subtree:!0}),rt(t=>{g=t,w(),B(),O()})}le();
