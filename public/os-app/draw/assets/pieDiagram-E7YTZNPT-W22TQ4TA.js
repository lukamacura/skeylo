import{a as rt}from"./chunk-DCXYYDAR.js";import{a as ot}from"./chunk-3QQEXXQG.js";import{a as lt}from"./chunk-GXYTIXIR.js";import"./chunk-BSFKN5IF.js";import"./chunk-4Y6J524W.js";import"./chunk-3PDAGPRW.js";import"./chunk-GGQQS6BO.js";import"./chunk-AH5KZX7P.js";import"./chunk-55LMWXVU.js";import"./chunk-LOVMN6WZ.js";import"./chunk-76KW3Z5O.js";import"./chunk-ACR32MDI.js";import"./chunk-ZSR2PCKR.js";import"./chunk-526N37OO.js";import"./chunk-G3JAOB5R.js";import"./chunk-ZUXXP6I2.js";import"./chunk-D23XNXP6.js";import{n as it,o as nt}from"./chunk-I2QHZARP.js";import"./chunk-R7FDEOLU.js";import{O as X,T as Z,U as j,V as q,W as J,X as K,Y as Q,Z as Y,_ as tt,k as V}from"./chunk-AQ6RRIRX.js";import{F as L,I as at,b as T,m as et}from"./chunk-FDE2M6LY.js";import"./chunk-FW5R7HBF.js";import"./chunk-GOGWADVE.js";import{a as l}from"./chunk-7ERA57BK.js";import{e as U}from"./chunk-YZVWLA53.js";U();var st=V.pie,O={sections:new Map,showData:!1,config:st},b=O.sections,F=O.showData,xt=structuredClone(st),wt=l(()=>structuredClone(xt),"getConfig"),Ct=l(()=>{b=new Map,F=O.showData,Z()},"clear"),$t=l(({label:t,value:a})=>{if(a<0)throw new Error(`"${t}" has invalid value: ${a}. Negative values are not allowed in pie charts. All slice values must be >= 0.`);b.has(t)||(b.set(t,a),T.debug(`added new section: ${t}, with value: ${a}`))},"addSection"),Dt=l(()=>b,"getSections"),yt=l(t=>{F=t},"setShowData"),Tt=l(()=>F,"getShowData"),ct={getConfig:wt,clear:Ct,setDiagramTitle:Q,getDiagramTitle:Y,setAccTitle:j,getAccTitle:q,setAccDescription:J,getAccDescription:K,addSection:$t,getSections:Dt,setShowData:yt,getShowData:Tt},bt=l((t,a)=>{ot(t,a),a.setShowData(t.showData),t.sections.map(a.addSection)},"populateDb"),At={parse:l(async t=>{let a=await lt("pie",t);T.debug(a),bt(a,ct)},"parse")},_t=l(t=>`
  .pieCircle{
    stroke: ${t.pieStrokeColor};
    stroke-width : ${t.pieStrokeWidth};
    opacity : ${t.pieOpacity};
  }
  .pieCircle.highlighted{
    scale: 1.05;
    opacity: 1;
  }
  .pieCircle.highlightedOnHover:hover{
    transition-duration: 250ms;
    scale: 1.05;
    opacity: 1;
  }
  .pieOuterCircle{
    stroke: ${t.pieOuterStrokeColor};
    stroke-width: ${t.pieOuterStrokeWidth};
    fill: none;
  }
  .pieTitleText {
    text-anchor: middle;
    font-size: ${t.pieTitleTextSize};
    fill: ${t.pieTitleTextColor};
    font-family: ${t.fontFamily};
  }
  .slice {
    font-family: ${t.fontFamily};
    fill: ${t.pieSectionTextColor};
    font-size:${t.pieSectionTextSize};
    // fill: white;
  }
  .legend text {
    fill: ${t.pieLegendTextColor};
    font-family: ${t.fontFamily};
    font-size: ${t.pieLegendTextSize};
  }
`,"getStyles"),kt=_t,zt=l(t=>{let a=[...t.values()].reduce((o,m)=>o+m,0),H=[...t.entries()].map(([o,m])=>({label:o,value:m})).filter(o=>o.value/a*100>=1);return at().value(o=>o.value).sort(null)(H)},"createPieArcs"),Et=l((t,a,H,M)=>{T.debug(`rendering pie chart
`+t);let o=M.db,m=tt(),h=nt(o.getConfig(),m.pie),P=40,i=18,c=4,S=450,x=S,A=rt(a),$=A.append("g");$.attr("transform","translate("+x/2+","+S/2+")");let{themeVariables:n}=m,[_]=it(n.pieOuterStrokeWidth);_??(_=2);let dt=h.legendPosition,W=h.textPosition,gt=h.donutHole>0&&h.donutHole<=.9?h.donutHole:0,f=Math.min(x,S)/2-P,pt=L().innerRadius(gt*f).outerRadius(f),ht=L().innerRadius(f*W).outerRadius(f*W),w=$.append("g");w.append("circle").attr("cx",0).attr("cy",0).attr("r",f+_/2).attr("class","pieOuterCircle");let D=o.getSections(),ft=zt(D),ut=[n.pie1,n.pie2,n.pie3,n.pie4,n.pie5,n.pie6,n.pie7,n.pie8,n.pie9,n.pie10,n.pie11,n.pie12],k=0;D.forEach(e=>{k+=e});let G=ft.filter(e=>(e.data.value/k*100).toFixed(0)!=="0"),z=et(ut).domain([...D.keys()]);w.selectAll("mySlices").data(G).enter().append("path").attr("d",pt).attr("fill",e=>z(e.data.label)).attr("class",e=>{let r="pieCircle";return h.highlightSlice==="hover"?r+=" highlightedOnHover":h.highlightSlice===e.data.label&&(r+=" highlighted"),r}),w.selectAll("mySlices").data(G).enter().append("text").text(e=>(e.data.value/k*100).toFixed(0)+"%").attr("transform",e=>"translate("+ht.centroid(e)+")").style("text-anchor","middle").attr("class","slice");let mt=$.append("text").text(o.getDiagramTitle()).attr("x",0).attr("y",-(S-50)/2).attr("class","pieTitleText"),C=[...D.entries()].map(([e,r])=>({label:e,value:r})),u=$.selectAll(".legend").data(C).enter().append("g").attr("class","legend");u.append("rect").attr("width",i).attr("height",i).style("fill",e=>z(e.label)).style("stroke",e=>z(e.label)),u.append("text").attr("x",i+c).attr("y",i-c).text(e=>o.getShowData()?`${e.label} [${e.value}]`:e.label);let v=Math.max(...u.selectAll("text").nodes().map(e=>e?.getBoundingClientRect().width??0)),y=S,E=x+P,s=i+c,R=C.length*s;switch(dt){case"center":u.attr("transform",(e,r)=>{let d=s*C.length/2,g=-v/2-(i+c),p=r*s-d;return"translate("+g+","+p+")"});break;case"top":y+=R,u.attr("transform",(e,r)=>{let d=f,g=-v/2-(i+c),p=r*s-d;return`translate(${g}, ${p})`}),w.attr("transform",()=>`translate(0, ${R+s})`);break;case"bottom":y+=R,u.attr("transform",(e,r)=>{let d=-f-s,g=-v/2-(i+c),p=r*s-d;return"translate("+g+","+p+")"});break;case"left":E+=i+c+v,u.attr("transform",(e,r)=>{let d=s*C.length/2,g=-f-(i+c),p=r*s-d;return"translate("+g+","+p+")"}),w.attr("transform",()=>`translate(${v+i+c}, 0)`);break;default:E+=i+c+v,u.attr("transform",(e,r)=>{let d=s*C.length/2,g=12*i,p=r*s-d;return"translate("+g+","+p+")"});break}let B=mt.node()?.getBoundingClientRect().width??0,vt=x/2-B/2,St=x/2+B/2,N=Math.min(0,vt),I=Math.max(E,St)-N;A.attr("viewBox",`${N} 0 ${I} ${y}`),X(A,y,I,h.useMaxWidth)},"draw"),Rt={draw:Et},It={parser:At,db:ct,renderer:Rt,styles:kt};export{It as diagram};
