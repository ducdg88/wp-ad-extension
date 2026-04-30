// Chèn file inject.js vào trang web
const injectScript = document.createElement('script');
injectScript.src = chrome.runtime.getURL('inject.js');
(document.head || document.documentElement).appendChild(injectScript);

window.addEventListener('load', () => {
    // Tạo nút bấm chèn ads
    const btn = document.createElement('button');
    btn.innerHTML = '🎯 Chèn Ads Cơ Bản';
    btn.style.cssText = `
        position: fixed; top: 40px; right: 20px; z-index: 99999;
        background: #4b5563; color: white; border: none; padding: 10px 18px;
        border-radius: 8px; cursor: pointer; font-weight: 600;
    `;
    document.body.appendChild(btn);

    btn.addEventListener('click', () => {
        const domain = window.location.hostname;
        const listKey = 'adList_' + domain;

        chrome.storage.local.get([listKey], (result) => {
            if (!result[listKey] || result[listKey].length === 0) {
                alert(`⚠️ Chưa có mã quảng cáo cho ${domain}`);
                return;
            }
            
            const event = new CustomEvent('START_INSERT_ADS', { 
                detail: result[listKey]
            });
            document.dispatchEvent(event);
        });
    });
});