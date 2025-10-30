// Historique & “banque d’erreurs” (LocalStorage)
const HKEY = 'ergoquiz.history';
const EKEY = 'ergoquiz.errors';

export function saveHistory(entry){
  const prev = JSON.parse(localStorage.getItem(HKEY) || '[]');
  prev.unshift(entry);
  localStorage.setItem(HKEY, JSON.stringify(prev.slice(0,20)));
}
export function loadHistory(){
  return JSON.parse(localStorage.getItem(HKEY) || '[]');
}

// Banque d’erreurs : { [themeId]: { [qid]: count } }
export function loadErrorBank(){
  return JSON.parse(localStorage.getItem(EKEY) || '{}');
}
export function saveErrorBank(bank){
  localStorage.setItem(EKEY, JSON.stringify(bank));
}
export function getErrorCount(themeId, qid){
  const bank = loadErrorBank();
  return bank?.[themeId]?.[qid] || 0;
}
export function incError(themeId, qid){
  const bank = loadErrorBank();
  bank[themeId] = bank[themeId] || {};
  bank[themeId][qid] = (bank[themeId][qid] || 0) + 1;
  saveErrorBank(bank);
}
export function decError(themeId, qid, amount=1){
  const bank = loadErrorBank();
  if(!bank[themeId] || !bank[themeId][qid]) return;
  bank[themeId][qid] = Math.max(0, bank[themeId][qid] - amount);
  if(bank[themeId][qid] === 0) delete bank[themeId][qid];
  if(Object.keys(bank[themeId]).length===0) delete bank[themeId];
  saveErrorBank(bank);
}
export function getThemeErrorTotal(themeId){
  const map = loadErrorBank()?.[themeId] || {};
  return Object.values(map).reduce((a,b)=>a+b,0);
}