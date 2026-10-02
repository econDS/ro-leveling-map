// Local SVG chart: works offline and reads the same calculator as the map table.
const LEVEL_CHART_METRICS = {finalPerKill:'EXP ที่ได้ / ตัว', expPerMillionHp:'EXP ต่อ HP 1 ล้าน'};
const levelChartState = {metric:'finalPerKill', start:null, end:null, level:null};
let levelChartController = null;
function disposeLevelChart() {
  levelChartController?.destroy();
  levelChartController = null;
}
function levelChartMarkup() {
  return `<section class="level-chart" aria-labelledby="levelChartTitle">
    <div class="level-chart-heading"><div><span class="level-chart-eyebrow">วางแผนเลเวล</span><h3 id="levelChartTitle">จังหวะไหน แมพไหนคุ้ม</h3></div><span class="level-chart-context">ใช้บัฟและกิจกรรมที่ตั้งอยู่</span></div>
    <p class="level-chart-intro">เทียบแนวโน้มของแมพที่เลือก แล้วดูค่าที่เลเวลที่คุณสนใจ</p>
    <div class="level-chart-controls">
      <div class="level-chart-metric-field"><label for="levelChartMetric">ค่าที่เทียบ</label><select id="levelChartMetric">${Object.entries(LEVEL_CHART_METRICS).map(([key,label])=>`<option value="${key}">${label}</option>`).join('')}</select></div>
      <div class="level-chart-range-field"><span class="level-chart-field-label">ช่วงเลเวล</span><div class="level-chart-range-inputs"><label for="levelChartStart" class="visually-hidden">ตั้งแต่ Lv</label><span>Lv</span><input id="levelChartStart" type="number" min="1" max="260" step="1"><span aria-hidden="true">—</span><label for="levelChartEnd" class="visually-hidden">ถึง Lv</label><input id="levelChartEnd" type="number" min="1" max="260" step="1"></div></div>
    </div>
    <div class="level-chart-legend" role="group" aria-label="เส้นของแมพที่เลือก"></div>
    <div class="level-chart-plot"></div>
    <div class="level-chart-slider"><label for="levelChartLevel"><span>เลเวลที่ดู <small>เลื่อนแถบหรือชี้บนกราฟ</small></span><output id="levelChartLevelLabel"></output></label><input id="levelChartLevel" type="range" min="1" max="260" step="1"></div>
    <div class="level-chart-readout" aria-live="polite" aria-atomic="true"></div>
    <details class="level-chart-notes"><summary>วิธีอ่านกราฟและเงื่อนไข</summary>
    <p class="field-help">เส้นสูงกว่า = ได้มากกว่าตามค่าที่เลือก · กดชื่อแมพเหนือกราฟเพื่อซ่อนหรือแสดงเส้น</p>
    <p class="field-help level-chart-note"></p>
    <p class="field-help">ค่าเฉลี่ยถ่วงตามจำนวนเกิดของมอนทั้งแมพ · กิจกรรมที่เลือกใช้คงเดิมตลอดกราฟ · กราฟนี้ไม่ได้ประมาณ EXP ต่อชั่วโมง</p>
    </details>
  </section>`;
}
function mountLevelChart(container, maps, c) {
  const metricInput=container.querySelector('#levelChartMetric'), startInput=container.querySelector('#levelChartStart'), endInput=container.querySelector('#levelChartEnd');
  const slider=container.querySelector('#levelChartLevel'), label=container.querySelector('#levelChartLevelLabel');
  const plot=container.querySelector('.level-chart-plot'), readout=container.querySelector('.level-chart-readout'), legend=container.querySelector('.level-chart-legend');
  const note=container.querySelector('.level-chart-note');
  const clamp=value=>Math.max(1,Math.min(260,Math.floor(Number(value)||1)));
  const monsterLevels=maps.flatMap(map=>(map.monsters||[]).filter(m=>m.amount>0).map(m=>m.level)).filter(Number.isFinite);
  let start=levelChartState.start??clamp(Math.min(c.level-20,...monsterLevels.map(v=>v-15)));
  let end=levelChartState.end??clamp(Math.max(c.level+20,...monsterLevels.map(v=>v+25)));
  let level=clamp(levelChartState.level??c.level), metric=levelChartState.metric;
  let visible=new Set(maps.map(m=>m.code)), curves=[], svg=null, guide=null, markers=[], hit=null, layout=null, guideLabel=null, guideBadge=null;
  let frame=0, dead=false;
  const dash=['','7 4','2 4'];
  const buttons=maps.map((map,index)=>{
    const button=document.createElement('button');button.type='button';button.className='level-chart-key';button.setAttribute('aria-pressed','true');
    button.innerHTML=`<svg viewBox="0 0 24 8" width="24" height="8" aria-hidden="true"><path d="M0 4H24" class="level-chart-line series-${index}"${dash[index]?` stroke-dasharray="${dash[index]}"`:''}></path></svg><span>${escapeHtml(map.name)} <small>${escapeHtml(map.code)}</small></span>`;
    button.addEventListener('click',()=>{
      if(visible.has(map.code)&&visible.size===1)return;
      visible.has(map.code)?visible.delete(map.code):visible.add(map.code);draw();
    });legend.append(button);return button;
  });
  function syncRange() {
    if(start>end)[start,end]=[end,start];
    level=Math.max(start,Math.min(end,level));
    startInput.value=start;endInput.value=end;metricInput.value=metric;
    slider.min=start;slider.max=end;slider.value=level;slider.disabled=start===end;
    Object.assign(levelChartState,{start,end,level,metric});
    curves=maps.map(map=>mapLevelCurve(map,c,start,end));
    note.textContent=c.lock?'เส้นเว้นว่างก่อนถึงเลเวลขั้นต่ำที่บันทึกไว้ · เงื่อนไขเควส/การเดินทางดูในรายละเอียดแมพ':'ปิดตัวกรองเลเวลเข้าแมพอยู่: กราฟแสดง EXP แม้ยังไม่ถึงเลเวลขั้นต่ำที่บันทึกไว้';
    draw();
  }
  function valuesAt(selected) {
    return maps.map((map,index)=>({map,index,point:curves[index][selected-start]})).filter(item=>visible.has(item.map.code));
  }
  function selectLevel(value) {
    level=Math.max(start,Math.min(end,clamp(value)));levelChartState.level=level;slider.value=level;label.textContent=`Lv ${level}`;
    const values=valuesAt(level), valid=values.filter(v=>Number.isFinite(v.point?.[metric]));
    const best=valid.length>1?Math.max(...valid.map(v=>v.point[metric])):null;
    const tied=best!==null&&valid.filter(v=>Math.abs(v.point[metric]-best)<=Math.max(1,best)*1e-10).length>1;
    readout.innerHTML=values.map(({map,index,point})=>{
      const available=Number.isFinite(point?.[metric]), top=best!==null&&available&&Math.abs(point[metric]-best)<=Math.max(1,best)*1e-10;
      return `<div class="level-chart-value${top?' is-best':''}${available?'':' is-locked'}"><div class="level-chart-value-head">${mapThumb(map,'level-chart-map-thumb')}<div class="level-chart-map-name"><span><i class="level-chart-dot series-${index}" aria-hidden="true"></i>${escapeHtml(map.name)}</span><small>${escapeHtml(map.code)}</small></div>${top?`<span class="level-chart-best">★ ${tied?'สูงสุดเท่ากัน':'ค่าสูงสุด'}</span>`:''}</div><div class="level-chart-number"><strong>${available?fullExp(point[metric]):'ยังเข้าไม่ได้'}</strong><span>${available?LEVEL_CHART_METRICS[metric]:`ต้อง Lv ${point?.min??map.min}+`}</span></div><div class="level-chart-value-foot">${available?`<span>ตัวคูณเลเวล <b>${yieldFmt(point.yieldPct)}</b></span><span>ตี ~<b>${fmt(point.hitsPerKill,1)}</b> ครั้ง/ตัว</span>`:'<span>ดูเงื่อนไขการเข้าในรายละเอียดแมพ</span>'}</div></div>`;
    }).join('');
    if(layout&&guide){const x=layout.x(level);guide.setAttribute('x1',x);guide.setAttribute('x2',x);
      const badgeX=Math.max(layout.left,Math.min(layout.right-56,x-28));guideBadge.setAttribute('x',badgeX);guideLabel.setAttribute('x',badgeX+28);guideLabel.textContent=`Lv ${level}`;
      markers.forEach((marker,index)=>{const point=curves[index][level-start],value=point?.[metric];marker.style.display=visible.has(maps[index].code)&&Number.isFinite(value)?'':'none';marker.setAttribute('cx',x);marker.setAttribute('cy',Number.isFinite(value)?layout.y(value):layout.top);});
    }
  }
  function element(name,attrs={},text=null) {
    const node=document.createElementNS('http://www.w3.org/2000/svg',name);
    Object.entries(attrs).forEach(([key,value])=>node.setAttribute(key,String(value)));
    if(text!==null)node.textContent=text;return node;
  }
  function draw() {
    if(dead)return;const width=plot.getBoundingClientRect().width;if(width<1)return;
    plot.replaceChildren();const height=320,left=66,right=16,top=40,bottom=height-46;
    const max=Math.max(0,...curves.flatMap((points,index)=>visible.has(maps[index].code)?points.map(p=>p[metric]??0):[]));
    const rough=max>0?max/4:1,base=10**Math.floor(Math.log10(rough)),step=([1,2,2.5,5,10].find(v=>v*base>=rough)||10)*base;
    const ceiling=max>0?Math.ceil(max/step)*step:1,x=value=>start===end?(left+width-right)/2:left+5+(value-start)/(end-start)*(width-left-right-10),y=value=>bottom-5-value/ceiling*(bottom-top-10);
    layout={x,y,top,left,right:width-right};svg=element('svg',{viewBox:`0 0 ${width} ${height}`,role:'img','aria-labelledby':'levelChartSvgTitle levelChartSvgDescription'});
    svg.append(element('title',{id:'levelChartSvgTitle'},`${LEVEL_CHART_METRICS[metric]} ตามเลเวล ${start} ถึง ${end}`),element('desc',{id:'levelChartSvgDescription'},'เปรียบเทียบแมพที่เลือก โดยคำนวณตามเลเวลรายจำนวนเต็ม เส้นขาดเมื่อยังไม่ถึงเลเวลเข้าแมพ ใช้แถบเลเวลด้านล่างเพื่อดูค่ารายแมพ'));
    svg.append(element('text',{x:left,y:14,class:'level-chart-axis-title'},LEVEL_CHART_METRICS[metric]));
    svg.append(element('rect',{x:left,y:top,width:Math.max(0,width-left-right),height:bottom-top,fill:'none',class:'level-chart-frame'}));
    for(let value=0;value<=ceiling+step/100;value+=step){
      const yy=y(value);svg.append(element('line',{x1:left,x2:width-right,y1:yy,y2:yy,class:'level-chart-grid'}));
      svg.append(element('text',{x:left-8,y:yy+4,'text-anchor':'end',class:'level-chart-tick'},value===0?'0':compact(value)));
    }
    const count=width<460?3:6,ticks=[...new Set(Array.from({length:start===end?1:count},(_,i)=>start===end?start:Math.round(start+i*(end-start)/(count-1))))];
    ticks.forEach(value=>svg.append(element('text',{x:x(value),y:bottom+22,'text-anchor':value===start&&start!==end?'start':value===end&&start!==end?'end':'middle',class:'level-chart-tick'},String(value))));
    svg.append(element('text',{x:(left+width-right)/2,y:height-7,'text-anchor':'middle',class:'level-chart-axis-title'},'เลเวลผู้เล่น (Lv)'));
    let available=false;
    curves.forEach((points,index)=>{
      const shown=visible.has(maps[index].code);buttons[index].setAttribute('aria-pressed',String(shown));buttons[index].setAttribute('aria-disabled',String(shown&&visible.size===1));
      if(!shown)return;let path='',previous=null;
      for(const point of points){if(!Number.isFinite(point[metric])){previous=null;continue;}available=true;
        // EXP changes at integer levels; steps avoid implying intermediate levels.
        path+=previous?`H${x(point.level)}V${y(point[metric])}`:`M${x(point.level)} ${y(point[metric])}`;previous=point;
      }
      if(path)svg.append(element('path',{d:path,class:`level-chart-line series-${index}`,'stroke-dasharray':dash[index]}));
    });
    if(!available)svg.append(element('text',{x:(left+width-right)/2,y:(top+bottom)/2,'text-anchor':'middle',class:'level-chart-empty'},'ยังไม่มีแมพที่เข้าได้ในช่วงนี้'));
    guide=element('line',{y1:top+1,y2:bottom-1,class:'level-chart-guide'});svg.append(guide);
    guideBadge=element('rect',{y:19,width:56,height:23,rx:7,class:'level-chart-guide-badge'});guideLabel=element('text',{y:35,'text-anchor':'middle',class:'level-chart-guide-label'});svg.append(guideBadge,guideLabel);
    markers=maps.map((_,index)=>{const marker=element('circle',{r:5,class:`level-chart-marker series-${index}`});svg.append(marker);return marker;});
    hit=element('rect',{x:left,y:top,width:Math.max(0,width-left-right),height:bottom-top,fill:'transparent',class:'level-chart-hit','aria-hidden':'true'});
    const inspect=event=>{const bounds=svg.getBoundingClientRect(),px=(event.clientX-bounds.left)*width/bounds.width;selectLevel(start===end?start:Math.round(start+(px-left-5)/(width-left-right-10)*(end-start)));};
    hit.addEventListener('pointermove',event=>{if(event.pointerType==='mouse'||event.buttons)inspect(event);});
    hit.addEventListener('pointerdown',event=>{inspect(event);if(event.pointerType!=='mouse')hit.setPointerCapture(event.pointerId);});
    svg.append(hit);plot.append(svg);selectLevel(level);
  }
  metricInput.addEventListener('change',()=>{metric=metricInput.value;levelChartState.metric=metric;draw();});
  startInput.addEventListener('change',()=>{start=clamp(startInput.value);if(start>end)end=start;syncRange();});
  endInput.addEventListener('change',()=>{end=clamp(endInput.value);if(end<start)start=end;syncRange();});
  slider.addEventListener('input',()=>selectLevel(slider.value));
  const observer='ResizeObserver' in window?new ResizeObserver(()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(draw);}):null;
  observer?.observe(plot);
  syncRange();
  return {redraw:draw,destroy(){dead=true;observer?.disconnect();cancelAnimationFrame(frame);}};
}
