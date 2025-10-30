// Utils génériques & helpers “types de questions”
export const sleep = (ms)=>new Promise(r=>setTimeout(r,ms));
export const byId = (id)=>document.getElementById(id);
export const shuffle = (arr)=>{
  const a = arr.slice();
  for (let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
  return a;
};
export const normalizeStr = (s)=> (s||'').toString().trim().toLowerCase();

export const setEquals = (a,b)=>{
  if(a.size !== b.size) return false;
  for(const v of a){ if(!b.has(v)) return false; }
  return true;
};

export const isMultiSelect = (q)=>
  q?.type === 'mcq' && (Array.isArray(q.answer) || Array.isArray(q.answers));

export const getExpectedIds = (q)=>{
  if(Array.isArray(q.answers)) return q.answers.slice();
  if(Array.isArray(q.answer))  return q.answer.slice();
  return [q.answer]; // mono
};

export const labelForMode = (mode, title)=>{
  const map = {
    practice: `Quiz (${title})`,
    mcq_only: `Quiz QCM (${title})`,
    exam:     `Examen (${title})`,
    error_review: `Révision d’erreurs (${title})`
  };
  return map[mode] || `Quiz (${title})`;
};