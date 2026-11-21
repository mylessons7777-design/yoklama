// Ortak yardımcılar: sunucuya istek, telefon kimliği, konum.
async function api(govde) {
  if (!window.YOKLAMA_API && typeof YOKLAMA_API === 'undefined') throw new Error('ayar.js yüklenmedi');
  // Content-Type verilmez: tarayıcı text/plain gönderir, Apps Script ön kontrol (CORS) istemez.
  const r = await fetch(YOKLAMA_API, { method: 'POST', body: JSON.stringify(govde), redirect: 'follow' });
  if (!r.ok) throw new Error('Sunucu yanıtı: ' + r.status);
  return r.json();
}

function cihazId() {
  let id = null;
  try { id = localStorage.getItem('yoklama_cihaz'); } catch (e) {}
  if (!id) {
    const m = document.cookie.match(/yoklama_cihaz=([\w-]+)/);
    id = m ? m[1] : (crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2) + Date.now());
    try { localStorage.setItem('yoklama_cihaz', id); } catch (e) {}
    document.cookie = 'yoklama_cihaz=' + id + ';max-age=31536000;path=/;SameSite=Lax;Secure';
  }
  return id;
}

function konumAl(zamanAsimi) {
  return new Promise(res => {
    if (!navigator.geolocation) return res({ hata: 'tarayıcı konum vermiyor' });
    navigator.geolocation.getCurrentPosition(
      p => res({ lat: p.coords.latitude, lon: p.coords.longitude, acc: p.coords.accuracy }),
      e => res({ hata: e.code === 1 ? 'konum izni verilmedi' : e.code === 3 ? 'konum zaman aşımı' : 'konum alınamadı' }),
      { enableHighAccuracy: true, timeout: zamanAsimi || 15000, maximumAge: 0 });
  });
}
