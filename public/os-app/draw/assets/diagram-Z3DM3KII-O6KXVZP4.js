import{a as E}from"./chunk-DCXYYDAR.js";import{a as F}from"./chunk-3QQEXXQG.js";import{a as A}from"./chunk-GXYTIXIR.js";import"./chunk-BSFKN5IF.js";import"./chunk-4Y6J524W.js";import"./chunk-3PDAGPRW.js";import"./chunk-GGQQS6BO.js";import"./chunk-AH5KZX7P.js";import"./chunk-55LMWXVU.js";import"./chunk-LOVMN6WZ.js";import"./chunk-76KW3Z5O.js";import"./chunk-ACR32MDI.js";import"./chunk-ZSR2PCKR.js";import"./chunk-526N37OO.js";import"./chunk-G3JAOB5R.js";import"./chunk-ZUXXP6I2.js";import"./chunk-D23XNXP6.js";import{o as w}from"./chunk-I2QHZARP.js";import"./chunk-R7FDEOLU.js";import{O as $,T as B,U as C,V as S,W as D,X as T,Y as P,Z as z,k as x,u as y}from"./chunk-AQ6RRIRX.js";import{b as u}from"./chunk-FDE2M6LY.js";import"./chunk-FW5R7HBF.js";import"./chunk-GOGWADVE.js";import{a as h}from"./chunk-7ERA57BK.js";import{e as v}from"./chunk-YZVWLA53.js";v();var M=x.packet,b,W=(b=class{constructor(){this.packet=[],this.setAccTitle=C,this.getAccTitle=S,this.setDiagramTitle=P,this.getDiagramTitle=z,this.getAccDescription=T,this.setAccDescription=D}getConfig(){let t=w({...M,...y().packet});return t.showBits&&(t.paddingY+=10),t}getPacket(){return this.packet}pushWord(t){t.length>0&&this.packet.push(t)}clear(){B(),this.packet=[]}},h(b,"PacketDB"),b),Y=1e4,I=h((e,t)=>{F(e,t);let a=-1,o=[],n=1,{bitsPerRow:l}=t.getConfig();for(let{start:r,end:i,bits:c,label:d}of e.blocks){if(r!==void 0&&i!==void 0&&i<r)throw new Error(`Packet block ${r} - ${i} is invalid. End must be greater than start.`);if(r??(r=a+1),r!==a+1)throw new Error(`Packet block ${r} - ${i??r} is not contiguous. It should start from ${a+1}.`);if(c===0)throw new Error(`Packet block ${r} is invalid. Cannot have a zero bit field.`);for(i??(i=r+(c??1)-1),c??(c=i-r+1),a=i,u.debug(`Packet block ${r} - ${a} with label ${d}`);o.length<=l+1&&t.getPacket().length<Y;){let[p,s]=O({start:r,end:i,bits:c,label:d},n,l);if(o.push(p),p.end+1===n*l&&(t.pushWord(o),o=[],n++),!s)break;({start:r,end:i,bits:c,label:d}=s)}}t.pushWord(o)},"populate"),O=h((e,t,a)=>{if(e.start===void 0)throw new Error("start should have been set during first phase");if(e.end===void 0)throw new Error("end should have been set during first phase");if(e.start>e.end)throw new Error(`Block start ${e.start} is greater than block end ${e.end}.`);if(e.end+1<=t*a)return[e,void 0];let o=t*a-1,n=t*a;return[{start:e.start,end:o,label:e.label,bits:o-e.start},{start:n,end:e.end,label:e.label,bits:e.end-n}]},"getNextFittingBlock"),_={parser:{yy:void 0},parse:h(async e=>{let t=await A("packet",e),a=_.parser?.yy;if(!(a instanceof W))throw new Error("parser.parser?.yy was not a PacketDB. This is due to a bug within Mermaid, please report this issue at https://github.com/mermaid-js/mermaid/issues.");u.debug(t),I(t,a)},"parse")},j=h((e,t,a,o)=>{let n=o.db,l=n.getConfig(),{rowHeight:r,paddingY:i,bitWidth:c,bitsPerRow:d}=l,p=n.getPacket(),s=n.getDiagramTitle(),f=r+i,g=f*(p.length+1)-(s?0:r),k=c*d+2,m=E(t);m.attr("viewBox",`0 0 ${k} ${g}`),$(m,g,k,l.useMaxWidth);for(let[N,L]of p.entries())G(m,L,N,l);m.append("text").text(s).attr("x",k/2).attr("y",g-f/2).attr("dominant-baseline","middle").attr("text-anchor","middle").attr("class","packetTitle")},"draw"),G=h((e,t,a,{rowHeight:o,paddingX:n,paddingY:l,bitWidth:r,bitsPerRow:i,showBits:c})=>{let d=e.append("g"),p=a*(o+l)+l;for(let s of t){let f=s.start%i*r+1,g=(s.end-s.start+1)*r-n;if(d.append("rect").attr("x",f).attr("y",p).attr("width",g).attr("height",o).attr("class","packetBlock"),d.append("text").attr("x",f+g/2).attr("y",p+o/2).attr("class","packetLabel").attr("dominant-baseline","middle").attr("text-anchor","middle").text(s.label),!c)continue;let k=s.end===s.start,m=p-2;d.append("text").attr("x",f+(k?g/2:0)).attr("y",m).attr("class","packetByte start").attr("dominant-baseline","auto").attr("text-anchor",k?"middle":"start").text(s.start),k||d.append("text").attr("x",f+g).attr("y",m).attr("class","packetByte end").attr("dominant-baseline","auto").attr("text-anchor","end").text(s.end)}},"drawWord"),H={draw:j},K={byteFontSize:"10px",startByteColor:"black",endByteColor:"black",labelColor:"black",labelFontSize:"12px",titleColor:"black",titleFontSize:"14px",blockStrokeColor:"black",blockStrokeWidth:"1",blockFillColor:"#efefef"},R=h(({packet:e}={})=>{let t=w(K,e);return`
	.packetByte {
		font-size: ${t.byteFontSize};
	}
	.packetByte.start {
		fill: ${t.startByteColor};
	}
	.packetByte.end {
		fill: ${t.endByteColor};
	}
	.packetLabel {
		fill: ${t.labelColor};
		font-size: ${t.labelFontSize};
	}
	.packetTitle {
		fill: ${t.titleColor};
		font-size: ${t.titleFontSize};
	}
	.packetBlock {
		stroke: ${t.blockStrokeColor};
		stroke-width: ${t.blockStrokeWidth};
		fill: ${t.blockFillColor};
	}
	`},"styles"),et={parser:_,get db(){return new W},renderer:H,styles:R};export{et as diagram};
