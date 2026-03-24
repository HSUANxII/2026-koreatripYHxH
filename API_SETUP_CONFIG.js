/**
 * 🌟 2026 韓國旅遊應用 - API 配置檔
 * 請在此填寫您的 API 密鑰
 */

window.API_CONFIG = {
    // ============================================
    // 地圖功能 | Kakao Maps
    // ============================================
    KAKAO_API_KEY: '8614c04c19b7b90e0111af2c68e0c758',
    // 獲取方式: https://developers.kakao.com → 我的應用 → JavaScript Key
    
    // ============================================
    // 實時匯率 | Open Exchange Rates
    // ============================================
    EXCHANGE_RATE_API_KEY: 'c348be7204bc4fae86e8b842d3d0cda4',
    // 獲取方式: https://openexchangerates.org → API Key
    // 所有貨幣: https://openexchangerates.org/api/currencies.json
    
    // ============================================
    // AI 識別與翻譯 | Google Gemini
    // ============================================
    GEMINI_API_KEY: 'AIzaSyDhgEdbMmU5kKTPVbhSHIicSqFgCqmT8ME',
    // 獲取方式: https://ai.google.dev → Get API Key
    // 用途: 翻譯、商品識別、分類
    
    // ============================================
    // Google Vision API (OCR - 可選)
    // ============================================
    GOOGLE_VISION_API_KEY: 'YOUR_GOOGLE_VISION_API_KEY_HERE',
    // 用途: 文字識別 (若要增強準確度)
    
    // ============================================
    // Firebase 配置 (已有配置，無需修改)
    // ============================================
    // Firebase 基本設置已在主 HTML 中配置
    
    // ============================================
    // 功能開關
    // ============================================
    enableKakaoMaps: true,
    enableRealtimeExchangeRate: true,
    enablePhotoUpload: true,
    enableReceiptAI: true,
    enableAdvancedOCR: false, // 若要用 Google Vision，改為 true
};

// ============================================
// 🔧 快速測試函數
// ============================================
window.testAPIs = async function() {
    console.log('🧪 開始測試所有 API...');
    
    // 測試 Kakao Maps
    if (window.API_CONFIG.enableKakaoMaps && window.API_CONFIG.KAKAO_API_KEY !== 'YOUR_KAKAO_API_KEY_HERE') {
        try {
            const script = document.createElement('script');
            script.src = 'https://dapi.kakao.com/v2/maps/sdk.js?appkey=' + window.API_CONFIG.KAKAO_API_KEY;
            script.onload = () => console.log('✅ Kakao Maps 載入成功');
            script.onerror = () => console.warn('❌ Kakao Maps 載入失敗');
            document.head.appendChild(script);
        } catch (e) {
            console.error('❌ Kakao Maps 錯誤:', e);
        }
    }
    
    // 測試 Open Exchange Rates
    if (window.API_CONFIG.enableRealtimeExchangeRate && window.API_CONFIG.EXCHANGE_RATE_API_KEY !== 'YOUR_EXCHANGE_RATE_API_KEY_HERE') {
        try {
            const response = await fetch(`https://openexchangerates.org/api/latest.json?app_id=${window.API_CONFIG.EXCHANGE_RATE_API_KEY}&symbols=KRW,JPY,THB,USD`);
            if (response.ok) {
                console.log('✅ Open Exchange Rates 連接成功');
            } else {
                console.warn('❌ 匯率 API 連接失敗');
            }
        } catch (e) {
            console.error('❌ 匯率 API 錯誤:', e);
        }
    }
    
    // 測試 Gemini API
    if (window.API_CONFIG.enableReceiptAI && window.API_CONFIG.GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE') {
        try {
            const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + window.API_CONFIG.GEMINI_API_KEY, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: '你好' }]
                    }]
                })
            });
            if (response.ok) {
                console.log('✅ Gemini API 連接成功');
            } else {
                console.warn('❌ Gemini API 連接失敗');
            }
        } catch (e) {
            console.error('❌ Gemini API 錯誤:', e);
        }
    }
    
    console.log('🧪 API 測試完成！請檢查上面的結果。');
};

// 頁面載入時自動運行（開發時取消註解）
// window.addEventListener('DOMContentLoaded', window.testAPIs);
