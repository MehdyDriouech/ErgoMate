// Minuterie “examen” indépendante du state
export function startTimer(seconds, onTick, onEnd){
  let remain = seconds;
  onTick?.(remain);
  const id = setInterval(()=>{
    remain -= 1;
    onTick?.(remain);
    if(remain <= 0){
      clearInterval(id);
      onEnd?.();
    }
  }, 1000);
  return { id };
}

export function clearTimer(handle){
  if(handle?.id){ clearInterval(handle.id); }
}