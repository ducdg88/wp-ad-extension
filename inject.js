document.addEventListener('START_INSERT_ADS', (e) => {
    const data = e.detail;
    const adList = Array.isArray(data) ? data : data.adList;
    const numAds = adList.length;

    if (numAds === 0) return;

    function getAdsToInsert(count) {
        let selectedAds = [];
        for (let i = 0; i < count; i++) {
            selectedAds.push(adList[i % adList.length]);
        }
        return selectedAds.map(ad => ad ? ad.trim() : '');
    }

    // --- XỬ LÝ GUTENBERG (BLOCK EDITOR) ---
    const isGutenberg = window.wp && window.wp.data && window.wp.data.select('core/block-editor');
    if (isGutenberg) {
        const getBlocks = window.wp.data.select('core/block-editor').getBlocks;
        const insertBlocks = window.wp.data.dispatch('core/block-editor').insertBlocks;
        const createBlock = window.wp.blocks && window.wp.blocks.createBlock;

        if (getBlocks && insertBlocks && createBlock) {
            const allBlocks = getBlocks();
            if (allBlocks.length > 0) {
                let validBlockIndexes = [];
                allBlocks.forEach((block, index) => {
                    if (block.name === 'core/paragraph') {
                        validBlockIndexes.push(index);
                    }
                });

                if (validBlockIndexes.length > 0) {
                    const numParagraphs = validBlockIndexes.length;
                    const maxAdsToInsert = Math.min(numAds, numParagraphs);
                    const selectedAdsToInject = getAdsToInsert(maxAdsToInsert);
                    let adsInserted = 0;

                    for (let i = maxAdsToInsert - 1; i >= 0; i--) {
                        const pIndex = Math.floor((i + 1) * numParagraphs / maxAdsToInsert) - 1;
                        const insertAt = validBlockIndexes[pIndex] + 1;

                        const adBlock = createBlock('core/html', { content: selectedAdsToInject[i] });
                        insertBlocks(adBlock, insertAt);
                        adsInserted++;
                    }

                    alert(`✅ (V1.0) Đã chèn ${adsInserted} quảng cáo.`);
                    return;
                }
            }
        }
    }

    // --- XỬ LÝ CLASSIC EDITOR (TINYMCE / TEXT) ---
    const hasTinyMCE = typeof window.tinymce !== 'undefined' && window.tinymce.activeEditor && !window.tinymce.activeEditor.isHidden();
    const textEditor = document.getElementById('content');
    const isTextEditor = textEditor && textEditor.style.display !== 'none';

    if (!hasTinyMCE && !isTextEditor) {
        alert("Không tìm thấy trình soạn thảo!");
        return;
    }

    let rawContent = "";
    if (hasTinyMCE) rawContent = window.tinymce.activeEditor.getContent();
    else if (isTextEditor) rawContent = textEditor.value;

    let pMatches = [...rawContent.matchAll(/<\/p>|\n{2,}/gi)];
    if (pMatches.length === 0) pMatches = [...rawContent.matchAll(/\n/g)];

    if (pMatches.length === 0) {
        const fallBackAdsToInject = getAdsToInsert(numAds);
        let newHtml = rawContent + fallBackAdsToInject.join('');
        if (hasTinyMCE) window.tinymce.activeEditor.setContent(newHtml);
        else if (isTextEditor) textEditor.value = newHtml;
        alert(`✅ (V1.0) Đã chèn quảng cáo vào cuối bài.`);
        return;
    }

    const numParagraphs = pMatches.length;
    const maxAdsToInsert = Math.min(numAds, numParagraphs);
    const selectedAdsToInject = getAdsToInsert(maxAdsToInsert);
    let adsInserted = 0;

    let indexesToInsert = [];
    for (let i = 0; i < maxAdsToInsert; i++) {
        indexesToInsert.push(Math.floor((i + 1) * numParagraphs / maxAdsToInsert) - 1);
    }

    let newContent = rawContent;
    for (let i = maxAdsToInsert - 1; i >= 0; i--) {
        const match = pMatches[indexesToInsert[i]];
        const insertPos = match.index + match[0].length;
        newContent = newContent.substring(0, insertPos) + '\n' + selectedAdsToInject[i] + '\n' + newContent.substring(insertPos);
        adsInserted++;
    }

    if (hasTinyMCE) window.tinymce.activeEditor.setContent(newContent);
    else if (isTextEditor) textEditor.value = newContent;

    alert(`✅ (V1.0) Đã chèn ${adsInserted} quảng cáo.`);
});