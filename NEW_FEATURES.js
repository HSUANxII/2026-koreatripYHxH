/**
 * 🌟 升級版新功能模塊
 * - Kakao Maps 集成
 * - 實時匯率同步
 * - 照片上傳與雲端存儲
 * - 收據 AI 掃描識別
 */

// ============================================
// 📍 1️⃣ KAKAO MAPS 功能
// ============================================

// 加載 Kakao Maps 庫
window.loadKakaoMaps = function() {
    if (window.API_CONFIG?.KAKAO_API_KEY === 'YOUR_KAKAO_API_KEY_HERE') {
        console.warn('⚠️ 請先設置 KAKAO_API_KEY');
        return;
    }
    
    const script = document.createElement('script');
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${window.API_CONFIG.KAKAO_API_KEY}&libraries=services,clusterer,drawing`;
    script.onload = () => {
        console.log('✅ Kakao Maps 已載入');
        window.kakaoMapsReady = true;
    };
    script.onerror = () => {
        console.error('❌ Kakao Maps 加載失敗');
    };
    document.head.appendChild(script);
};

// 顯示地點地圖
window.showPlaceOnMap = function(placeName, address, lat = null, lng = null) {
    // 先檢查 Kakao Maps 是否已準備好
    let mapReady = typeof kakao !== 'undefined' && typeof kakao.maps !== 'undefined';
    
    if (!mapReady) {
        // 加載 Kakao Maps
        if (!window.kakaoMapsLoading) {
            window.kakaoMapsLoading = true;
            const script = document.createElement('script');
            script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${window.API_CONFIG?.KAKAO_API_KEY || ''}&libraries=services`;
            script.onload = () => {
                window.kakaoMapsLoading = false;
                setTimeout(() => {
                    window.showPlaceOnMap(placeName, address, lat, lng);
                }, 500);
            };
            script.onerror = () => {
                window.kakaoMapsLoading = false;
                if(typeof showMsg === 'function') showMsg('❌ 地圖載入失敗，請檢查網路連線');
            };
            document.head.appendChild(script);
        }
        return;
    }
    
    // 確定視窗尺寸
    const isMobile = window.innerWidth < 768;
    const mapHeight = isMobile ? '300px' : '400px';
    const modalWidth = isMobile ? '95vw' : '90vw';
    const maxWidth = isMobile ? '100%' : '600px';
    
    const mapModal = document.createElement('div');
    mapModal.className = 'fixed inset-0 bg-black/60 z-[250] flex items-center justify-center p-3 backdrop-blur-sm';
    mapModal.onclick = (e) => e.target === mapModal && mapModal.remove();
    
    const mapContent = document.createElement('div');
    mapContent.className = 'bg-white rounded-lg w-full overflow-hidden flex flex-col';
    mapContent.style.cssText = `max-width: ${maxWidth}; max-height: 90vh;`;
    
    mapContent.innerHTML = `
        <div class="p-4 border-b border-gray-200 flex justify-between items-center shrink-0">
            <div class="flex-1">
                <h3 class="font-bold text-gray-800 text-base">📍 ${placeName}</h3>
                <p class="text-xs text-gray-500 mt-1">${address}</p>
            </div>
            <button class="text-gray-500 hover:text-gray-700 p-1 ml-2" onclick="this.closest('.fixed').remove()">
                <i class="fas fa-times text-lg"></i>
            </button>
        </div>
        <div id="map-container-${Date.now()}" style="width: 100%; height: ${mapHeight}; background: #f5f5f5;"></div>
        <div class="p-4 space-y-3 overflow-y-auto flex-1 bg-gray-50">
            <p class="text-sm text-gray-700 break-words"><strong>地址:</strong> ${address}</p>
            <button onclick="window.openMapInNewWindow('${placeName.replace(/'/g, "\\'")}', '${address.replace(/'/g, "\\'")}')" class="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded font-bold transition">
                🗺️ 在 Kakao Map 中打開
            </button>
        </div>
    `;
    
    mapModal.appendChild(mapContent);
    document.body.appendChild(mapModal);
    
    // 初始化地圖
    const containerId = 'map-container-' + Date.now();
    setTimeout(() => {
        try {
            const container = document.getElementById(containerId);
            if (!container) {
                console.warn('地圖容器未找到');
                return;
            }
            
            // 設定預設坐標（首爾中心）
            const centerLat = lat || 37.5656;
            const centerLng = lng || 126.9769;
            
            const mapOptions = {
                center: new kakao.maps.LatLng(centerLat, centerLng),
                level: 4,
                draggable: true,
                scrollwheel: true
            };
            
            const map = new kakao.maps.Map(container, mapOptions);
            
            // 嘗試地理編碼
            if (address && typeof kakao.maps.services !== 'undefined' && kakao.maps.services.Geocoder) {
                const geocoder = new kakao.maps.services.Geocoder();
                geocoder.addressSearch(address, function(result, status) {
                    if (status === kakao.maps.services.Status.OK && result.length > 0) {
                        const coords = new kakao.maps.LatLng(result[0].y, result[0].x);
                        map.setCenter(coords);
                        map.setLevel(3);
                        
                        // 添加標記
                        new kakao.maps.Marker({
                            map: map,
                            position: coords,
                            title: placeName
                        });
                        
                        // 信息窗口
                        new kakao.maps.InfoWindow({
                            content: `<div style="padding: 8px; font-size: 12px; font-weight: bold; text-align: center;">${placeName}</div>`,
                            removable: true
                        }).open(map, new kakao.maps.Marker({ position: coords }));
                    } else {
                        // 地址搜索失敗，在首爾中心顯示
                        new kakao.maps.Marker({
                            map: map,
                            position: new kakao.maps.LatLng(centerLat, centerLng),
                            title: placeName
                        });
                    }
                });
            } else {
                // 沒有 Geocoder 服務，直接在預設位置顯示標記
                new kakao.maps.Marker({
                    map: map,
                    position: new kakao.maps.LatLng(centerLat, centerLng),
                    title: placeName
                });
            }
        } catch (error) {
            console.error('地圖初始化錯誤:', error);
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #666;">地圖載入失敗<br>請使用下方按鈕打開 Kakao Map</div>';
            }
        }
    }, 300);
};

// 在新窗口中打開 Kakao Map
window.openMapInNewWindow = function(placeName, address) {
    const kakaoMapUrl = `https://map.kakao.com/link/search/${encodeURIComponent(address)}`;
    window.open(kakaoMapUrl, '_blank');
};

// ============================================
// 💱 2️⃣ 實時匯率同步功能
// ============================================

window.exchangeRateCache = {};
window.lastExchangeRateUpdate = 0;

// 獲取實時匯率
window.fetchExchangeRates = async function() {
    if (window.API_CONFIG?.EXCHANGE_RATE_API_KEY === 'YOUR_EXCHANGE_RATE_API_KEY_HERE') {
        console.warn('⚠️ 請先設置 EXCHANGE_RATE_API_KEY');
        return null;
    }
    
    const now = Date.now();
    // 緩存 30 分鐘內的結果（避免過度請求）
    if (window.exchangeRateCache.data && now - window.lastExchangeRateUpdate < 30 * 60 * 1000) {
        return window.exchangeRateCache.data;
    }
    
    try {
        const response = await fetch(
            `https://openexchangerates.org/api/latest.json?app_id=${window.API_CONFIG.EXCHANGE_RATE_API_KEY}&base=USD&symbols=KRW,JPY,THB,VND,EUR,HKD,CNY,SGD,INR`
        );
        
        if (!response.ok) throw new Error('匯率 API 響應錯誤');
        
        const data = await response.json();
        window.exchangeRateCache.data = data.rates;
        window.lastExchangeRateUpdate = now;
        
        console.log('✅ 匯率已更新:', data.rates);
        return data.rates;
    } catch (error) {
        console.error('❌ 獲取匯率失敗:', error);
        showMsg('無法獲取最新匯率，請檢查網路連線');
        return null;
    }
};

// 自動填充匯率到記帳欄位
window.autoFillExchangeRate = async function() {
    const rates = await window.fetchExchangeRates();
    if (!rates) return;
    
    const targetCurrency = window.currentTargetCurrency || 'KRW';
    const rateInput = document.querySelector('input[id*="rate"], input[placeholder*="匯率"]');
    
    if (rateInput && rates[targetCurrency]) {
        // 若基礎貨幣是 KRW，直接輸入
        if (targetCurrency === 'KRW') {
            rateInput.value = Math.round(rates[targetCurrency] * 100) / 100;
        } else {
            // 其他貨幣：計算相對於 USD 的匯率
            rateInput.value = Math.round(rates[targetCurrency] * 100) / 100;
        }
        
        console.log(`✅ 已自動填充 ${targetCurrency} 匯率: ${rateInput.value}`);
    }
};

// 定期更新匯率（每 30 分鐘）
setInterval(window.fetchExchangeRates, 30 * 60 * 1000);

// ============================================
// 📸 3️⃣ 照片上傳與雲端存儲
// ============================================

window.uploadPhotoToCloud = async function(file, folderName = 'trip-photos') {
    if (!window.db) {
        showMsg('❌ Firebase 未初始化，無法上傳');
        return null;
    }
    
    try {
        // 上傳到 Firebase Storage
        const { ref, uploadBytes, getDownloadURL } = 
            await import('https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js');
        
        const { getStorage } = 
            await import('https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js');
        
        const storage = getStorage();
        const timestamp = Date.now();
        const fileName = `${folderName}/${window.currentUser?.uid || 'guest'}/${timestamp}_${file.name}`;
        const storageRef = ref(storage, fileName);
        
        // 顯示上傳進度
        showMsg('正在上傳照片...');
        
        await uploadBytes(storageRef, file);
        const downloadUrl = await getDownloadURL(storageRef);
        
        console.log('✅ 照片已上傳:', downloadUrl);
        return downloadUrl;
    } catch (error) {
        console.error('❌ 照片上傳失敗:', error);
        showMsg('照片上傳失敗，請重試');
        return null;
    }
};

// 上傳照片 UI
window.openPhotoUploadModal = function(callback = null) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/60 z-[300] flex items-center justify-center p-4 backdrop-blur-sm';
    modal.onclick = (e) => e.target === modal && modal.remove();
    
    modal.innerHTML = `
        <div class="bg-white rounded-xl w-full max-w-sm shadow-2xl p-6">
            <h3 class="text-xl font-bold mb-4">📸 上傳照片</h3>
            <div class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition" id="photo-drop-zone">
                <p class="text-gray-600">點擊或拖拽圖片</p>
                <input type="file" id="photo-input" accept="image/*" class="hidden">
            </div>
            <div id="upload-status" class="mt-4 hidden">
                <div class="h-2 bg-gray-200 rounded overflow-hidden">
                    <div id="upload-progress" class="h-full bg-blue-500 transition-all" style="width: 0%"></div>
                </div>
                <p id="upload-text" class="text-sm text-gray-600 mt-2">上傳中...</p>
            </div>
            <div class="flex gap-2 mt-4">
                <button onclick="this.closest('.fixed').remove()" class="flex-1 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">取消</button>
                <button id="upload-confirm" class="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">上傳</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    let selectedFile = null;
    const dropZone = document.getElementById('photo-drop-zone');
    const photoInput = document.getElementById('photo-input');
    
    dropZone.onclick = () => photoInput.click();
    
    photoInput.onchange = (e) => {
        selectedFile = e.target.files[0];
        dropZone.innerHTML = `✅ ${selectedFile.name}`;
    };
    
    dropZone.ondragover = (e) => {
        e.preventDefault();
        dropZone.style.backgroundColor = '#f3f4f6';
    };
    
    dropZone.ondragleave = () => {
        dropZone.style.backgroundColor = 'transparent';
    };
    
    dropZone.ondrop = (e) => {
        e.preventDefault();
        selectedFile = e.dataTransfer.files[0];
        dropZone.innerHTML = `✅ ${selectedFile.name}`;
    };
    
    document.getElementById('upload-confirm').onclick = async () => {
        if (!selectedFile) {
            showMsg('請先選擇照片');
            return;
        }
        
        const uploadStatus = document.getElementById('upload-status');
        uploadStatus.classList.remove('hidden');
        
        const url = await window.uploadPhotoToCloud(selectedFile);
        
        if (url) {
            showMsg('✅ 照片已上傳');
            modal.remove();
            if (callback) callback(url);
        }
    };
};

// ============================================
// 🧾 4️⃣ 收據 AI 掃描識別（核心功能！）
// ============================================

window.receiptAIState = {
    imageBase64: null,
    extractedData: null,
    isProcessing: false
};

// 掃描收據
window.openReceiptScanner = function() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/60 z-[350] flex items-center justify-center p-4 backdrop-blur-sm';
    modal.onclick = (e) => e.target === modal && modal.remove();
    
    const receiptInputId = 'receipt-input-' + Date.now();
    const receiptButtonId = 'receipt-upload-btn-' + Date.now();
    
    modal.innerHTML = `
        <div class="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div class="p-4 border-b border-gray-200 shrink-0">
                <h3 class="text-lg font-bold">🧾 掃描收據</h3>
            </div>
            <div class="p-6 space-y-4 overflow-y-auto flex-1">
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p class="text-sm text-blue-700">💡 提示: 上傳清晰的收據照片，AI將自動識別商品、價格並翻譯內容</p>
                </div>
                
                <div id="receipt-preview-${receiptInputId}" class="hidden bg-gray-50 rounded-lg p-4">
                    <img id="receipt-img-${receiptInputId}" src="" class="w-full max-h-64 object-contain mb-2" alt="收據預覽">
                    <p id="receipt-filename-${receiptInputId}" class="text-xs text-gray-600"></p>
                </div>
                
                <input type="file" id="${receiptInputId}" accept="image/*" class="hidden">
                <button id="${receiptButtonId}" class="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium">
                    📷 上傳收據照片
                </button>
                
                <div id="receipt-processing-${receiptInputId}" class="hidden bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p class="text-sm font-medium mb-2">AI 正在識別中...</p>
                    <div class="w-full h-2 bg-yellow-200 rounded overflow-hidden">
                        <div class="h-full bg-yellow-500 animate-pulse" style="width: 100%;"></div>
                    </div>
                </div>
                
                <div id="receipt-result-${receiptInputId}" class="hidden space-y-3">
                    <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 class="font-bold text-green-800 mb-2">✅ 識別結果</h4>
                        <div id="result-content-${receiptInputId}" class="space-y-2 text-sm"></div>
                    </div>
                </div>
            </div>
            
            <div class="flex gap-2 p-4 border-t border-gray-200 shrink-0">
                <button onclick="this.closest('.fixed').remove()" class="flex-1 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 font-bold">取消</button>
                <button id="receipt-confirm-${receiptInputId}" class="flex-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 font-bold" style="display: none;">
                    ✅ 導入記帳
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // ★ 重新綁定元素（在 appendChild 之後）
    const receiptInput = document.getElementById(receiptInputId);
    const receiptButton = document.getElementById(receiptButtonId);
    const receiptPreview = document.getElementById('receipt-preview-' + receiptInputId);
    const receiptImg = document.getElementById('receipt-img-' + receiptInputId);
    const receiptFilename = document.getElementById('receipt-filename-' + receiptInputId);
    const receiptConfirm = document.getElementById('receipt-confirm-' + receiptInputId);
    
    // 綁定按鈕點擊事件
    receiptButton.onclick = (e) => {
        e.preventDefault();
        receiptInput.click();
    };
    
    // 綁定文件選擇事件
    receiptInput.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        // 顯示預覽
        const reader = new FileReader();
        reader.onload = (event) => {
            receiptImg.src = event.target.result;
            receiptFilename.textContent = file.name;
            receiptPreview.classList.remove('hidden');
            
            // 轉換為 Base64
            window.receiptAIState.imageBase64 = event.target.result;
            
            // 自動開始識別
            window.identifyReceiptAI(modal, receiptInputId);
        };
        reader.readAsDataURL(file);
    };
    
    // 綁定導入記帳按鈕
    receiptConfirm.onclick = () => {
        window.importReceiptToExpense(modal);
    };
};

// 使用 Gemini API 識別收據
window.identifyReceiptAI = async function(modal, idPrefix) {
    if (window.receiptAIState.isProcessing) return;
    if (!window.receiptAIState.imageBase64) {
        if(typeof showMsg === 'function') showMsg('❌ 請先上傳收據照片');
        return;
    }
    
    if (window.API_CONFIG?.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
        if(typeof showMsg === 'function') showMsg('❌ 請先設置 Gemini API Key');
        return;
    }
    
    window.receiptAIState.isProcessing = true;
    
    const processingDiv = modal.querySelector('#receipt-processing-' + idPrefix);
    if(processingDiv) processingDiv.classList.remove('hidden');
    
    try {
        // 調用 Gemini API
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${window.API_CONFIG.GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            {
                                inlineData: {
                                    mimeType: 'image/jpeg',
                                    data: window.receiptAIState.imageBase64.split(',')[1]
                                }
                            },
                            {
                                text: `請分析此收據圖片，並以繁體中文返回結構化 JSON 數據。

必須返回以下格式（返回純 JSON，不要任何其他文字）:
{
    "storeName": "商店名稱",
    "location": "地點/城市",
    "date": "日期（YYYY-MM-DD格式）",
    "time": "時間（HH:MM格式）",
    "items": [
        {
            "name": "商品名稱（翻譯成繁體中文）",
            "quantity": 數量,
            "unitPrice": 單價,
            "totalPrice": 總價
        }
    ],
    "subtotal": 小計,
    "tax": 稅金,
    "totalAmount": 總金額,
    "currency": "貨幣符號/代碼",
    "totalInKRW": "若可能，轉換為韓元的概估金額或原收據金額",
    "category": "消費類別（選項: 餐飲, 購物, 交通, 住宿, 門票, 美妝, 咖啡, 便利商店, 其他）",
    "notes": "其他備註或特殊項目"
}

如果識別失敗或不是收據，返回: {"error": "無法識別為有效收據"}`
                            }
                        ]
                    }]
                })
            }
        );
        
        if (!response.ok) {
            throw new Error(`API 返回錯誤: ${response.status}`);
        }
        
        const data = await response.json();
        const jsonText = data.candidates[0].content.parts[0].text;
        
        // 解析 JSON（支援可能的額外文字）
        const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('無法從回應中提取 JSON');
        
        const receiptData = JSON.parse(jsonMatch[0]);
        
        if (receiptData.error) {
            if(typeof showMsg === 'function') showMsg('❌ AI 無法識別此收據，請確保拍照清晰');
            if(processingDiv) processingDiv.classList.add('hidden');
            window.receiptAIState.isProcessing = false;
            return;
        }
        
        window.receiptAIState.extractedData = receiptData;
        
        // 顯示結果
        if(processingDiv) processingDiv.classList.add('hidden');
        const resultDiv = modal.querySelector('#receipt-result-' + idPrefix);
        const resultContent = modal.querySelector('#result-content-' + idPrefix);
        
        let itemsHTML = receiptData.items.map(item => 
            `<div class="flex justify-between text-xs">
                <span>${item.name} x${item.quantity}</span>
                <strong>${item.totalPrice}</strong>
            </div>`
        ).join('');
        
        resultContent.innerHTML = `
            <div><strong>商店:</strong> ${receiptData.storeName}</div>
            <div><strong>地點:</strong> ${receiptData.location}</div>
            <div><strong>日期:</strong> ${receiptData.date} ${receiptData.time}</div>
            <div><strong>分類:</strong> ${receiptData.category}</div>
            <div class="border-t border-green-200 pt-2 mt-2">
                <strong>商品列表:</strong>
                ${itemsHTML}
            </div>
            <div class="border-t border-green-200 pt-2 mt-2 font-bold">
                <div class="flex justify-between"><span>總金額:</span> <span>${receiptData.totalAmount} ${receiptData.currency}</span></div>
            </div>
            ${receiptData.notes ? `<div><strong>備註:</strong> ${receiptData.notes}</div>` : ''}
        `;
        
        if(resultDiv) resultDiv.classList.remove('hidden');
        const confirmBtn = modal.querySelector('#receipt-confirm-' + idPrefix);
        if(confirmBtn) confirmBtn.style.display = 'block';
        
        console.log('✅ 收據識別完成:', receiptData);
        
    } catch (error) {
        console.error('❌ Gemini API 錯誤:', error);
        if(typeof showMsg === 'function') showMsg('❌ AI 識別失敗: ' + error.message);
        if(processingDiv) processingDiv.classList.add('hidden');
    }
    
    window.receiptAIState.isProcessing = false;
};

// 將識別結果導入記帳記錄
window.importReceiptToExpense = async function(modal) {
    const data = window.receiptAIState.extractedData;
    if (!data) {
        showMsg('❌ 沒有有效的識別結果');
        return;
    }
    
    // 關閉 Modal
    modal.remove();
    
    // 打開記帳編輯器，預填數據
    const importModal = document.createElement('div');
    importModal.className = 'fixed inset-0 bg-black/60 z-[360] flex items-center justify-center p-4 backdrop-blur-sm';
    importModal.innerHTML = `
        <div class="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[80vh] overflow-y-auto">
            <div class="p-4 border-b border-gray-200 sticky top-0 bg-white">
                <h3 class="text-lg font-bold">✅ 確認記帳數據</h3>
            </div>
            
            <div class="p-6 space-y-4">
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p class="text-xs text-blue-700">編輯下面的數據，確認無誤後點擊存檔</p>
                </div>
                
                <div>
                    <label class="text-xs font-bold text-gray-700 block mb-1">商店名稱</label>
                    <input type="text" id="import-store" value="${data.storeName}" class="w-full px-3 py-2 border border-gray-300 rounded text-sm">
                </div>
                
                <div class="grid grid-cols-2 gap-2">
                    <div>
                        <label class="text-xs font-bold text-gray-700 block mb-1">日期</label>
                        <input type="date" id="import-date" value="${data.date}" class="w-full px-3 py-2 border border-gray-300 rounded text-sm">
                    </div>
                    <div>
                        <label class="text-xs font-bold text-gray-700 block mb-1">時間</label>
                        <input type="time" id="import-time" value="${data.time}" class="w-full px-3 py-2 border border-gray-300 rounded text-sm">
                    </div>
                </div>
                
                <div>
                    <label class="text-xs font-bold text-gray-700 block mb-1">消費類別</label>
                    <select id="import-category" class="w-full px-3 py-2 border border-gray-300 rounded text-sm">
                        <option value="${data.category}" selected>${data.category}</option>
                        <option value="food">🍽️ 餐飲</option>
                        <option value="convenience">🏪 便利商店</option>
                        <option value="supermarket">🛒 超市</option>
                        <option value="cosmetics">💄 藥妝</option>
                        <option value="shop">🛍️ 購物</option>
                        <option value="traffic">🚌 交通</option>
                        <option value="ticket">🎫 門票</option>
                        <option value="stay">🛏️ 住宿</option>
                        <option value="coffee">☕ 咖啡</option>
                        <option value="other">🧾 其他</option>
                    </select>
                </div>
                
                <div class="grid grid-cols-2 gap-2">
                    <div>
                        <label class="text-xs font-bold text-gray-700 block mb-1">貨幣</label>
                        <select id="import-currency" class="w-full px-3 py-2 border border-gray-300 rounded text-sm">
                            <option value="KRW" ${data.currency.includes('₩') || data.currency === 'KRW' ? 'selected' : ''}>KRW (₩)</option>
                            <option value="USD">USD ($)</option>
                            <option value="JPY">JPY (¥)</option>
                            <option value="TWD">TWD (NT$)</option>
                        </select>
                    </div>
                    <div>
                        <label class="text-xs font-bold text-gray-700 block mb-1">總金額</label>
                        <input type="number" id="import-amount" value="${data.totalAmount}" class="w-full px-3 py-2 border border-gray-300 rounded text-sm" step="0.01">
                    </div>
                </div>
                
                <div>
                    <label class="text-xs font-bold text-gray-700 block mb-1">匯率（金額轉台幣的匯率）</label>
                    <input type="number" id="import-rate" value="41" class="w-full px-3 py-2 border border-gray-300 rounded text-sm" step="0.01" placeholder="例: 41">
                </div>
                
                <div>
                    <label class="text-xs font-bold text-gray-700 block mb-1">代墊人</label>
                    <select id="import-payer" class="w-full px-3 py-2 border border-gray-300 rounded text-sm">
                        ${(window.travelMembers || []).map(m => `<option value="${m}">${m}</option>`).join('')}
                    </select>
                </div>
                
                <div>
                    <label class="text-xs font-bold text-gray-700 block mb-1 flex items-center gap-2">
                        <input type="checkbox" id="import-split-all" checked>
                        分攤給所有人
                    </label>
                </div>
                
                <div class="bg-gray-50 rounded-lg p-3 max-h-32 overflow-y-auto">
                    <p class="text-xs font-bold text-gray-700 mb-2">商品明細：</p>
                    ${data.items.map(item => `
                        <div class="text-xs text-gray-600 mb-1">
                            • ${item.name} (${item.quantity}x) = ${item.totalPrice}
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="flex gap-2 p-4 border-t border-gray-200 sticky bottom-0 bg-white">
                <button onclick="this.closest('.fixed').remove()" class="flex-1 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">取消</button>
                <button id="confirm-import" class="flex-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">✅ 存檔</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(importModal);
    
    document.getElementById('confirm-import').onclick = async () => {
        const expenseData = {
            id: 'exp_' + Date.now(),
            title: document.getElementById('import-store').value,
            category: document.getElementById('import-category').value,
            currency: document.getElementById('import-currency').value,
            krw: parseFloat(document.getElementById('import-amount').value) || 0,
            rate: parseFloat(document.getElementById('import-rate').value) || 41,
            twd: 0,
            payer: document.getElementById('import-payer').value,
            splitMembers: document.getElementById('import-split-all').checked ? 
                (window.travelMembers || []) : [],
            date: document.getElementById('import-date').value,
            time: document.getElementById('import-time').value,
            rawDate: new Date(document.getElementById('import-date').value + 'T' + document.getElementById('import-time').value).getTime()
        };
        
        // 計算台幣金額
        expenseData.twd = Math.round(expenseData.krw / expenseData.rate * 100) / 100;
        
        // 添加到費用列表
        if (!window.expenses) window.expenses = [];
        window.expenses.push(expenseData);
        
        // 保存到雲端
        await window.saveGlobalState({ expenses: window.expenses });
        
        // 重新渲染記帳頁面
        if (window.renderExpenses) window.renderExpenses();
        
        importModal.remove();
        showMsg('✅ 記帳已自動導入並存檔！');
    };
};

// ============================================
// 🚀 初始化所有新功能
// ============================================

window.initializeNewFeatures = function() {
    console.log('🌟 正在初始化升級功能...');
    
    // 加載 Kakao Maps
    if (window.API_CONFIG?.enableKakaoMaps) {
        window.loadKakaoMaps();
    }
    
    // 定期更新匯率
    if (window.API_CONFIG?.enableRealtimeExchangeRate) {
        window.fetchExchangeRates();
    }
    
    console.log('✅ 所有新功能已初始化！');
};

// 頁面完全載入後初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.initializeNewFeatures);
} else {
    window.initializeNewFeatures();
}
