// Floating AI Bot - shared script
// Reuses the same behavior as products page
(function(){
  const GEMINI_API_KEY = 'AIzaSyDsomUgyOp_rKipDubYPnssGYU3sjJbt88';
  const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

  function $(id){ return document.getElementById(id); }

  function addUserMessage(message) {
    const box = $('chat-messages'); if (!box) return;
    const el = document.createElement('div');
    el.className = 'message user-message';
    el.innerHTML = '<div class="message-content"><p>'+escapeHtml(message)+'</p></div><div class="message-avatar"><i class="fas fa-user"></i></div>';
    box.appendChild(el); box.scrollTop = box.scrollHeight;
  }

  function addBotMessage(message) {
    const box = $('chat-messages'); if (!box) return;
    const el = document.createElement('div');
    el.className = 'message bot-message';
    el.innerHTML = '<div class="message-avatar"><i class="fas fa-robot"></i></div><div class="message-content"><p>'+message+'</p></div>';
    box.appendChild(el); box.scrollTop = box.scrollHeight;
  }

  function escapeHtml(text) { const d = document.createElement('div'); d.textContent = text; return d.innerHTML; }

  async function sendToGemini(message) {
    try {
      const res = await fetch(GEMINI_API_URL+"?key="+GEMINI_API_KEY, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: `You are a helpful AI gaming assistant. The user asked: "${message}". Please provide a concise, helpful response about gaming/PC building.` }]}] })
      });
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't process that just now.";
      addBotMessage(text);
    } catch(e){ console.error(e); addBotMessage('Network error. Please try again later.'); }
  }

  function sendMessage(){
    const input = $('chat-input'); if (!input) return;
    const msg = (input.value||'').trim(); if (!msg) return;
    addUserMessage(msg); input.value=''; sendToGemini(msg);
  }

  function askQuickQuestion(q){ addUserMessage(q); sendToGemini(q); }
  window.askQuickQuestion = askQuickQuestion; // expose

  function setupFloatingBot(){
    const circle = $('ai-bot-circle');
    const popup = $('ai-chat-popup');
    const closeBtn = $('close-chat');
    const sendBtn = $('send-message');
    const input = $('chat-input');
    if (!circle || !popup) return;
    circle.addEventListener('click', ()=>{ popup.classList.add('show'); setTimeout(()=> input && input.focus(), 250); });
    closeBtn && closeBtn.addEventListener('click', ()=> popup.classList.remove('show'));
    sendBtn && sendBtn.addEventListener('click', sendMessage);
    input && input.addEventListener('keypress', (e)=>{ if (e.key==='Enter' && !e.shiftKey){ e.preventDefault(); sendMessage(); }});
  }

  document.addEventListener('DOMContentLoaded', setupFloatingBot);
})();
