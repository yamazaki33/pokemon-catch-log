// ローカルストレージのキー
const STORAGE_KEY = 'pokemon_catch_logs';

// ログデータの取得
function getLogs() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

// 時間差を時間単位で計算
function calculateHours(startTime, endTime) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end - start;
    return diffMs / (1000 * 60 * 60);
}

// 1時間あたりの捕獲数を計算
function calculateEfficiency(count, hours) {
    if (hours <= 0) return 0;
    return count / hours;
}

// 場所別の効率データを集計
function aggregateByLocation(logs) {
    const locationMap = {};

    logs.forEach(log => {
        const hours = calculateHours(log.startTime, log.endTime);
        const efficiency = calculateEfficiency(log.count, hours);

        if (!locationMap[log.location]) {
            locationMap[log.location] = {
                totalCount: 0,
                totalHours: 0,
                efficiencies: []
            };
        }

        locationMap[log.location].totalCount += log.count;
        locationMap[log.location].totalHours += hours;
        locationMap[log.location].efficiencies.push(efficiency);
    });

    // 平均効率を計算
    return Object.keys(locationMap).map(location => ({
        location,
        totalCount: locationMap[location].totalCount,
        totalHours: locationMap[location].totalHours,
        avgEfficiency: locationMap[location].totalCount / locationMap[location].totalHours
    })).sort((a, b) => b.avgEfficiency - a.avgEfficiency);
}

// ポケモン別の効率データを集計
function aggregateByPokemon(logs) {
    const pokemonMap = {};

    logs.forEach(log => {
        const hours = calculateHours(log.startTime, log.endTime);
        const efficiency = calculateEfficiency(log.count, hours);

        if (!pokemonMap[log.pokemon]) {
            pokemonMap[log.pokemon] = {
                totalCount: 0,
                totalHours: 0,
                efficiencies: []
            };
        }

        pokemonMap[log.pokemon].totalCount += log.count;
        pokemonMap[log.pokemon].totalHours += hours;
        pokemonMap[log.pokemon].efficiencies.push(efficiency);
    });

    // 平均効率を計算
    return Object.keys(pokemonMap).map(pokemon => ({
        pokemon,
        totalCount: pokemonMap[pokemon].totalCount,
        totalHours: pokemonMap[pokemon].totalHours,
        avgEfficiency: pokemonMap[pokemon].totalCount / pokemonMap[pokemon].totalHours
    })).sort((a, b) => b.avgEfficiency - a.avgEfficiency);
}

// ランダムカラーの生成
function generateColors(count) {
    const colors = [
        'rgba(102, 126, 234, 0.8)',
        'rgba(118, 75, 162, 0.8)',
        'rgba(237, 100, 166, 0.8)',
        'rgba(255, 154, 158, 0.8)',
        'rgba(250, 208, 196, 0.8)',
        'rgba(255, 183, 77, 0.8)',
        'rgba(129, 212, 250, 0.8)',
        'rgba(128, 222, 234, 0.8)',
        'rgba(178, 235, 242, 0.8)',
        'rgba(165, 214, 167, 0.8)'
    ];

    if (count <= colors.length) {
        return colors.slice(0, count);
    }

    // 足りない場合はランダム生成
    const extraColors = [];
    for (let i = 0; i < count - colors.length; i++) {
        const r = Math.floor(Math.random() * 200 + 55);
        const g = Math.floor(Math.random() * 200 + 55);
        const b = Math.floor(Math.random() * 200 + 55);
        extraColors.push(`rgba(${r}, ${g}, ${b}, 0.8)`);
    }

    return [...colors, ...extraColors];
}

// 統計カードの表示
function displayStats(logs) {
    const statsGrid = document.getElementById('statsGrid');

    if (logs.length === 0) {
        statsGrid.innerHTML = '<div class="empty-state">📭 データがありません</div>';
        return;
    }

    const totalCatches = logs.reduce((sum, log) => sum + log.count, 0);
    const totalHours = logs.reduce((sum, log) => {
        return sum + calculateHours(log.startTime, log.endTime);
    }, 0);
    const avgEfficiency = totalCatches / totalHours;

    const uniqueLocations = new Set(logs.map(log => log.location)).size;
    const uniquePokemon = new Set(logs.map(log => log.pokemon)).size;

    statsGrid.innerHTML = `
        <div class="stat-card">
            <div class="stat-value">${totalCatches}</div>
            <div class="stat-label">総捕獲数</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${totalHours.toFixed(1)}</div>
            <div class="stat-label">総プレイ時間（時間）</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${avgEfficiency.toFixed(2)}</div>
            <div class="stat-label">全体平均（匹/時間）</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${uniqueLocations}</div>
            <div class="stat-label">場所の種類</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${uniquePokemon}</div>
            <div class="stat-label">ポケモンの種類</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${logs.length}</div>
            <div class="stat-label">ログ件数</div>
        </div>
    `;
}

// 場所別グラフの作成
function createLocationChart(logs) {
    const locationData = aggregateByLocation(logs);

    if (locationData.length === 0) return;

    const ctx = document.getElementById('locationChart').getContext('2d');
    const colors = generateColors(locationData.length);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: locationData.map(d => d.location),
            datasets: [{
                label: '1時間あたりの平均捕獲数',
                data: locationData.map(d => d.avgEfficiency.toFixed(2)),
                backgroundColor: colors,
                borderColor: colors.map(c => c.replace('0.8', '1')),
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        afterLabel: function(context) {
                            const index = context.dataIndex;
                            const data = locationData[index];
                            return [
                                `総捕獲数: ${data.totalCount}匹`,
                                `総時間: ${data.totalHours.toFixed(1)}時間`
                            ];
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '匹 / 時間'
                    }
                }
            }
        }
    });
}

// ポケモン別グラフの作成
function createPokemonChart(logs) {
    const pokemonData = aggregateByPokemon(logs);

    if (pokemonData.length === 0) return;

    const ctx = document.getElementById('pokemonChart').getContext('2d');
    const colors = generateColors(pokemonData.length);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: pokemonData.map(d => d.pokemon),
            datasets: [{
                label: '1時間あたりの平均捕獲数',
                data: pokemonData.map(d => d.avgEfficiency.toFixed(2)),
                backgroundColor: colors,
                borderColor: colors.map(c => c.replace('0.8', '1')),
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        afterLabel: function(context) {
                            const index = context.dataIndex;
                            const data = pokemonData[index];
                            return [
                                `総捕獲数: ${data.totalCount}匹`,
                                `総時間: ${data.totalHours.toFixed(1)}時間`
                            ];
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '匹 / 時間'
                    }
                }
            }
        }
    });
}

// 時系列グラフの作成
function createTimelineChart(logs) {
    if (logs.length === 0) return;

    // 新しい順にソートして最新20件を取得
    const sortedLogs = [...logs].sort((a, b) =>
        new Date(a.startTime) - new Date(b.startTime)
    ).slice(-20);

    const ctx = document.getElementById('timelineChart').getContext('2d');

    const data = sortedLogs.map(log => {
        const hours = calculateHours(log.startTime, log.endTime);
        return {
            x: new Date(log.startTime).toLocaleDateString('ja-JP', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
            y: calculateEfficiency(log.count, hours),
            location: log.location,
            pokemon: log.pokemon,
            count: log.count,
            hours: hours
        };
    });

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(d => d.x),
            datasets: [{
                label: '1時間あたりの捕獲数',
                data: data.map(d => d.y.toFixed(2)),
                borderColor: 'rgba(102, 126, 234, 1)',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.3,
                pointRadius: 5,
                pointHoverRadius: 7,
                pointBackgroundColor: 'rgba(102, 126, 234, 1)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    callbacks: {
                        title: function(context) {
                            const index = context[0].dataIndex;
                            return data[index].x;
                        },
                        afterLabel: function(context) {
                            const index = context.dataIndex;
                            const d = data[index];
                            return [
                                `場所: ${d.location}`,
                                `ポケモン: ${d.pokemon}`,
                                `捕獲数: ${d.count}匹`,
                                `時間: ${d.hours.toFixed(1)}時間`
                            ];
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '匹 / 時間'
                    }
                },
                x: {
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            }
        }
    });
}

// 場所別総捕獲数（円グラフ）
function createTotalCatchChart(logs) {
    const locationData = aggregateByLocation(logs);

    if (locationData.length === 0) return;

    const ctx = document.getElementById('totalCatchChart').getContext('2d');
    const colors = generateColors(locationData.length);

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: locationData.map(d => d.location),
            datasets: [{
                label: '総捕獲数',
                data: locationData.map(d => d.totalCount),
                backgroundColor: colors,
                borderColor: '#fff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right'
                },
                tooltip: {
                    callbacks: {
                        afterLabel: function(context) {
                            const index = context.dataIndex;
                            const data = locationData[index];
                            return [
                                `総時間: ${data.totalHours.toFixed(1)}時間`,
                                `平均: ${data.avgEfficiency.toFixed(2)}匹/時間`
                            ];
                        }
                    }
                }
            }
        }
    });
}

// ページ読み込み時の処理
document.addEventListener('DOMContentLoaded', () => {
    const logs = getLogs();

    if (logs.length === 0) {
        document.querySelector('main').innerHTML = `
            <div class="empty-state" style="padding: 60px 20px;">
                <h2>📭 データがありません</h2>
                <p style="margin-top: 20px; color: #666;">
                    <a href="index.html" style="color: #667eea; text-decoration: none; font-weight: bold;">
                        ログ入力ページ
                    </a>
                    からデータを追加してください
                </p>
            </div>
        `;
        return;
    }

    displayStats(logs);
    createLocationChart(logs);
    createPokemonChart(logs);
    createTimelineChart(logs);
    createTotalCatchChart(logs);
});
