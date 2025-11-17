// ローカルストレージのキー
const STORAGE_KEY = 'pokemon_catch_logs';

// ログデータの取得
function getLogs() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

// ログデータの保存
function saveLogs(logs) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
}

// 時間差を時間単位で計算
function calculateHours(startTime, endTime) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end - start;
    return diffMs / (1000 * 60 * 60); // ミリ秒を時間に変換
}

// 1時間あたりの捕獲数を計算
function calculateEfficiency(count, hours) {
    if (hours <= 0) return 0;
    return (count / hours).toFixed(2);
}

// 日時のフォーマット
function formatDateTime(dateTimeStr) {
    const date = new Date(dateTimeStr);
    return date.toLocaleString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// ログの表示
function displayLogs() {
    const logs = getLogs();
    const logsList = document.getElementById('logsList');

    if (logs.length === 0) {
        logsList.innerHTML = '<div class="empty-state">まだログがありません</div>';
        return;
    }

    // 新しい順に並べ替え
    logs.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

    logsList.innerHTML = logs.map((log, index) => {
        const hours = calculateHours(log.startTime, log.endTime);
        const efficiency = calculateEfficiency(log.count, hours);

        return `
            <div class="log-item">
                <div class="log-header">
                    <div class="log-title">📍 ${log.location} - ${log.pokemon}</div>
                    <div class="log-efficiency">${efficiency}匹/時間</div>
                </div>
                <div class="log-details">
                    <div class="log-detail"><strong>捕獲数:</strong> ${log.count}匹</div>
                    <div class="log-detail"><strong>時間:</strong> ${hours.toFixed(1)}時間</div>
                    <div class="log-detail"><strong>開始:</strong> ${formatDateTime(log.startTime)}</div>
                    <div class="log-detail"><strong>終了:</strong> ${formatDateTime(log.endTime)}</div>
                </div>
                ${log.memo ? `<div class="log-memo">📝 ${log.memo}</div>` : ''}
                <button class="btn-delete" onclick="deleteLog(${index})">🗑️ 削除</button>
            </div>
        `;
    }).join('');
}

// ログの追加
function addLog(logData) {
    const logs = getLogs();
    logs.push({
        ...logData,
        id: Date.now(),
        createdAt: new Date().toISOString()
    });
    saveLogs(logs);
    displayLogs();
}

// ログの削除
function deleteLog(index) {
    if (!confirm('このログを削除しますか？')) return;

    const logs = getLogs();
    logs.splice(index, 1);
    saveLogs(logs);
    displayLogs();
}

// 全ログの削除
function clearAllLogs() {
    if (!confirm('すべてのログを削除しますか？この操作は取り消せません。')) return;

    localStorage.removeItem(STORAGE_KEY);
    displayLogs();
}

// フォーム送信処理
document.getElementById('catchForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = {
        location: document.getElementById('location').value.trim(),
        pokemon: document.getElementById('pokemon').value.trim(),
        startTime: document.getElementById('startTime').value,
        endTime: document.getElementById('endTime').value,
        count: parseInt(document.getElementById('count').value),
        memo: document.getElementById('memo').value.trim()
    };

    // バリデーション
    const startDate = new Date(formData.startTime);
    const endDate = new Date(formData.endTime);

    if (endDate <= startDate) {
        alert('終了時刻は開始時刻より後にしてください');
        return;
    }

    if (formData.count <= 0) {
        alert('捕獲数は1以上にしてください');
        return;
    }

    addLog(formData);
    e.target.reset();
    alert('✅ ログを追加しました！');
});

// 全削除ボタン
document.getElementById('clearAll').addEventListener('click', clearAllLogs);

// ページ読み込み時にログを表示
document.addEventListener('DOMContentLoaded', () => {
    displayLogs();

    // 現在時刻を開始時刻にセット
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    document.getElementById('startTime').value = now.toISOString().slice(0, 16);
    document.getElementById('endTime').value = now.toISOString().slice(0, 16);
});
