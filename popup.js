chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
  const currentTab = tabs[0];
  if (!currentTab || !currentTab.url) return;
  
  const domain = new URL(currentTab.url).hostname;
  document.getElementById('domainDisplay').textContent = domain;

  const rawKey = 'adCodesRaw_' + domain;
  const listKey = 'adList_' + domain;

  chrome.storage.local.get([rawKey, listKey], (res) => {
    if (res[rawKey]) {
      document.getElementById('adCodes').value = res[rawKey];
      document.getElementById('adCountDisplay').textContent = (res[listKey] || []).length + " Ads";
    }
  });

  document.getElementById('adCodes').addEventListener('input', (e) => {
    const ads = e.target.value.split(/[-—–]+\s*next\s*[-—–]+/i).map(s => s.trim()).filter(s => s !== "");
    document.getElementById('adCountDisplay').textContent = ads.length + " Ads";
  });

  document.getElementById('saveBtn').addEventListener('click', () => {
    const rawText = document.getElementById('adCodes').value;
    const ads = rawText.split(/[-—–]+\s*next\s*[-—–]+/i).map(s => s.trim()).filter(s => s !== "");
    
    let dataToSave = {};
    dataToSave[rawKey] = rawText;
    dataToSave[listKey] = ads;

    chrome.storage.local.set(dataToSave, () => {
      alert('Đã lưu (Bản cơ bản)!');
    });
  });

  document.getElementById('clearBtn').addEventListener('click', () => {
    document.getElementById('adCodes').value = '';
    let dataToSave = {};
    dataToSave[rawKey] = '';
    dataToSave[listKey] = [];
    chrome.storage.local.set(dataToSave, () => {
      document.getElementById('adCountDisplay').textContent = "0 Ads";
    });
  });
});