const input=document.getElementById('videoUrl');
const button=document.getElementById('checkBtn');
const status=document.getElementById('status');
const year=document.getElementById('year');

if(year) year.textContent=new Date().getFullYear();

function showStatus(message,type=''){
  status.className='panel-status'+(type?' '+type:'');
  const text=status.querySelector('span:last-child');
  if(text) text.textContent=message;
}

function validTikTokUrl(value){
  try{
    const url=new URL(value);
    return url.protocol==='https:' && /(^|\\.)tiktok\\.com$/i.test(url.hostname);
  }catch{
    return false;
  }
}

button.addEventListener('click',()=>{
  const value=input.value.trim();
  if(!value){
    showStatus('أدخل رابط الفيديو أولاً.','error');
    input.focus();
    return;
  }
  if(!validTikTokUrl(value)){
    showStatus('الرابط غير صحيح. أدخل رابطاً كاملاً من نطاق TikTok.','error');
    input.focus();
    return;
  }
  showStatus('تم فحص شكل الرابط. محرك التنزيل غير متصل بعد؛ استخدم خيار الحفظ الرسمي داخل TikTok عند توفره.','success');
});

input.addEventListener('keydown',event=>{
  if(event.key==='Enter') button.click();
});

input.addEventListener('input',()=>{
  if(status.classList.contains('error')){
    showStatus('استخدم رابط فيديو تملكه أو لديك تصريح بتنزيله.');
  }
});
