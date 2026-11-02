(function(){
  'use strict';
  const form=document.getElementById('roi-form');
  const math=window.EquipmentEconomics;
  if(!form||!math)return;
  const money=v=>new Intl.NumberFormat('ru-RU',{style:'currency',currency:'RUB',maximumFractionDigits:0}).format(v);
  const number=v=>new Intl.NumberFormat('ru-RU',{maximumFractionDigits:1}).format(v);
  const put=(id,text)=>{document.getElementById(id).textContent=text;};
  const modes=[...document.querySelectorAll('[data-calc-mode]')];
  let mode='buy',last=null;
  function sync(){
    const rent=mode==='rent';
    document.getElementById('purchase-field').hidden=rent;form.elements.equipment.disabled=rent;
    document.getElementById('rent-field').hidden=!rent;form.elements.rent.disabled=!rent;
    const custom=form.elements.tariff.value==='custom';document.getElementById('custom-rate-field').hidden=!custom;form.elements.customRate.disabled=!custom;
    modes.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.calcMode===mode)));
  }
  function inputs(){
    const v={mode};
    ['salary','people','training','share','months','equipment','setup','running','customRate','injuryRate','additionalRate'].forEach(k=>{v[k]=Number(form.elements[k].value);});
    ['basis','savingType','tariff'].forEach(k=>{v[k]=form.elements[k].value;});
    v.rent=form.elements.rent.value.trim()===''?null:Number(form.elements.rent.value);return v;
  }
  function clearEffect(){['net-saving','year-effect','manual-period','machine-period'].forEach(id=>put(id,'Не рассчитано'));}
  function calculate(){
    sync();
    if(!form.checkValidity()){
      put('payback','Проверьте данные');put('calc-summary','Заполните обязательные поля корректными неотрицательными суммами.');clearEffect();['staff-cost','avoided-cost','gross-cost','ndfl-cost','takehome-cost','insurance-cost','injury-cost','training-cost'].forEach(id=>put(id,'Нет данных'));last=null;return;
    }
    const v=inputs(),r=math.estimate(v);last={v,r};
    put('payback-label',mode==='buy'?'Простой срок окупаемости покупки':'Экономика аренды');
    put('effect-label','Эффект за '+v.months+' мес. после разовых затрат');
    put('staff-cost',money(r.staff));put('avoided-cost',money(r.avoided));
    put('gross-cost',money(r.gross));put('ndfl-cost',money(r.ndfl));put('takehome-cost',money(r.takeHome));put('insurance-cost',money(r.contributions));put('injury-cost',money(r.injury+r.additional));put('training-cost',money(r.trainingMonthly));
    put('calc-status','Расчет по вашим вводным, правилам и ценам 2026 года. Значения по умолчанию - пример. Денежный эффект требует реального снижения расходов или отказа от найма.');
    if(r.quoteNeeded){put('payback','Укажите аренду');put('calc-summary','Стоимость аренды согласуется отдельно. Введите ежемесячный платеж, чтобы сравнить варианты.');clearEffect();return;}
    put('net-saving',money(r.net));put('year-effect',money(r.periodEffect));put('manual-period',money(r.manualPeriod));put('machine-period',money(r.machinePeriod));
    if(v.savingType==='time'){
      put('payback','Только время');put('calc-summary','Зарплата продолжает выплачиваться, поэтому денежную экономию на ней не считаем. Дополнительный выпуск и его прибыль нужно оценить отдельно.');
    } else if(r.net<=0){
      put('payback',mode==='buy'?'Не окупается':'Расходы выше');put('calc-summary','При этих вводных оборудование не дает положительной ежемесячной денежной экономии.');
    } else if(mode==='rent'){
      put('payback',money(r.net)+'/мес.');put('calc-summary',r.upfront>0?'После разовых затрат положительный накопленный эффект начинается с '+r.positiveMonth+'-го месяца.':'При этих вводных экономия положительна с первого месяца аренды.');
    } else {
      put('payback',r.upfront>0?'≈ '+number(r.payback)+' мес.':'Без вложений');put('calc-summary','При этих вводных накопленная экономия становится положительной с '+r.positiveMonth+'-го месяца. Ежемесячный эффект возникает после начала работы оборудования.');
    }
  }
  modes.forEach(b=>b.addEventListener('click',()=>{mode=b.dataset.calcMode;calculate();}));
  form.addEventListener('input',calculate);form.addEventListener('change',calculate);
  form.addEventListener('invalid',e=>{const details=e.target.closest('details');if(details)details.open=true;},true);
  form.addEventListener('submit',e=>{e.preventDefault();calculate();if(form.reportValidity())document.getElementById('calc-result').focus();});
  document.getElementById('example').addEventListener('click',()=>{form.reset();mode='buy';calculate();});
  document.querySelectorAll('[data-rental]').forEach(a=>a.addEventListener('click',()=>{const details=document.querySelector('#request-form [name="details"]');if(!details.value.trim())details.value='Интересует оборудование в аренду на пробу. Просим уточнить доступный комплект, срок и стоимость.';}));
  document.getElementById('discuss-calculation').addEventListener('click',()=>{if(!last||last.r.quoteNeeded)return;const details=document.querySelector('#request-form [name="details"]');if(!details.value.trim())details.value='Расчет: '+(mode==='buy'?'покупка':'аренда')+', сотрудников '+last.v.people+', затраты на работников '+money(last.r.staff)+'/мес., расчетный денежный эффект '+money(last.r.net)+'/мес. Нужно проверить применимость к нашей операции.';});
  calculate();
})();
