(function (root) {
  'use strict';
  const YEAR=2026, BASE=2979000;
  function incomeTax(annual) {
    let tax=0,previous=0;
    for(const [ceiling,rate] of [[2400000,.13],[5000000,.15],[20000000,.18],[50000000,.20],[Infinity,.22]]) {
      tax+=Math.max(0,Math.min(annual,ceiling)-previous)*rate;
      if(annual<=ceiling)break;
      previous=ceiling;
    }
    return tax;
  }
  function grossFromNet(monthlyNet) {
    let low=monthlyNet*12,high=monthlyNet*12/.6+1;
    for(let i=0;i<80;i++){const mid=(low+high)/2;if(mid-incomeTax(mid)<monthlyNet*12)low=mid;else high=mid;}
    return (low+high)/24;
  }
  function estimate(v) {
    const gross=v.basis==='net'?grossFromNet(v.salary):v.salary;
    const annual=gross*12;
    const contributions=v.tariff==='custom'?annual*v.customRate/100:Math.min(annual,BASE)*.30+Math.max(0,annual-BASE)*.151;
    const injury=gross*v.injuryRate/100,additional=gross*v.additionalRate/100;
    const ndfl=incomeTax(annual)/12;
    const perEmployee=gross+contributions/12+injury+additional+v.training/12;
    const staff=perEmployee*v.people;
    const cashShare=v.savingType==='cash'?v.share/100:0;
    const avoided=staff*cashShare;
    const upfront=(v.mode==='buy'?v.equipment:0)+v.setup;
    const monthlyMachine=v.running+(v.mode==='rent'?(v.rent||0):0);
    const net=avoided-monthlyMachine;
    const quoteNeeded=v.mode==='rent'&&v.rent===null;
    const payback=net>0?upfront/net:null;
    const positiveMonth=net>0?Math.floor(upfront/net+1e-9)+1:null;
    const manualPeriod=staff*v.months;
    const machinePeriod=upfront+monthlyMachine*v.months+staff*(1-cashShare)*v.months;
    return {year:YEAR,gross,ndfl,takeHome:gross-ndfl,contributions:contributions/12,injury,additional,trainingMonthly:v.training/12,perEmployee,staff,avoided,upfront,monthlyMachine,net,payback,positiveMonth,manualPeriod,machinePeriod,periodEffect:manualPeriod-machinePeriod,quoteNeeded};
  }
  const api={YEAR,BASE,incomeTax,grossFromNet,estimate};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  else root.EquipmentEconomics=api;
})(typeof window!=='undefined'?window:globalThis);
