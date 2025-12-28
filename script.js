document.addEventListener('DOMContentLoaded', function() {
    const config = {
        coefficients: {
            hoursStudied: 2.8524,
            previousScores: 1.0184,
            sleepHours: 0.4806,
            papersPracticed: 0.1938,
            extracurricular: 0.6129,
            intercept: -34.07
        },
        errorMargin: 2.04
    };

    const inputs = {
        hours: document.getElementById('hoursStudied'),
        scores: document.getElementById('previousScores'),
        sleep: document.getElementById('sleepHours'),
        papers: document.getElementById('papersPracticed'),
        extra: document.getElementById('extraActivities')
    };

    const displays = {
        hours: document.getElementById('hoursVal'),
        scores: document.getElementById('scoresVal'),
        sleep: document.getElementById('sleepVal'),
        papers: document.getElementById('papersVal'),
        score: document.getElementById('scoreValue'),
        successCircle: document.getElementById('successCircle'),
        successText: document.getElementById('successPctText'),
        historyList: document.getElementById('historyList')
    };

    // --- Charts Initialization ---
    let radarCtx = document.getElementById('impactChart').getContext('2d');
    let impactRadar = new Chart(radarCtx, {
        type: 'radar',
        data: {
            labels: ['Studying', 'Academic Base', 'Recovery', 'Persistence', 'Extras'],
            datasets: [{
                label: 'Student Profile',
                data: [0, 0, 0, 0, 0],
                backgroundColor: 'rgba(99, 110, 250, 0.2)',
                borderColor: '#636efa',
                pointBackgroundColor: '#636efa',
                borderWidth: 2
            }]
        },
        options: {
            scales: { r: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, angleLines: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { display: false }, suggestedMin: 0, suggestedMax: 100 } },
            plugins: { legend: { display: false } }
        }
    });

    let contribCtx = document.getElementById('contributionChart').getContext('2d');
    let contribBar = new Chart(contribCtx, {
        type: 'bar',
        data: {
            labels: ['Hours', 'Past', 'Sleep', 'Papers'],
            datasets: [{
                label: 'Points Added',
                data: [0, 0, 0, 0],
                backgroundColor: ['#636efa', '#a855f7', '#3b82f6', '#10b981'],
                borderRadius: 4
            }]
        },
        options: {
            indexAxis: 'y',
            scales: { x: { display: false }, y: { grid: { display: false }, ticks: { color: '#94a3b8' } } },
            plugins: { legend: { display: false } }
        }
    });

    function update() {
        const h = parseFloat(inputs.hours.value);
        const s = parseFloat(inputs.scores.value);
        const sl = parseFloat(inputs.sleep.value);
        const p = parseFloat(inputs.papers.value);
        const e = inputs.extra.checked ? 1 : 0;

        displays.hours.innerText = `${h}h`;
        displays.scores.innerText = `${s}%`;
        displays.sleep.innerText = `${sl}h`;
        displays.papers.innerText = p;

        // Model Calculation
        let pred = config.coefficients.intercept + 
                   (h * config.coefficients.hoursStudied) + 
                   (s * config.coefficients.previousScores) + 
                   (sl * config.coefficients.sleepHours) + 
                   (p * config.coefficients.papersPracticed) + 
                   (e * config.coefficients.extracurricular);

        pred = Math.max(0, Math.min(100, pred));
        displays.score.innerText = Math.round(pred);

        // Success Probability (High Distinction > 85%)
        let prob = Math.round(Math.max(0, Math.min(100, (pred / 85) * 100)));
        if (pred >= 85) prob = 100;
        displays.successCircle.style.strokeDasharray = `${prob}, 100`;
        displays.successText.textContent = `${prob}%`;

        // Update Radar
        impactRadar.data.datasets[0].data = [(h/10)*100, s, (sl/10)*100, (p/10)*100, e*100];
        impactRadar.update('none');

        // Update Contribution
        contribBar.data.datasets[0].data = [
            h * config.coefficients.hoursStudied,
            s * config.coefficients.previousScores,
            sl * config.coefficients.sleepHours,
            p * config.coefficients.papersPracticed
        ];
        contribBar.update('none');
    }

    // --- History Logic ---
    let history = [];
    document.getElementById('savePrediction').addEventListener('click', () => {
        const item = {
            score: displays.score.innerText,
            date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        history.unshift(item);
        if (history.length > 5) history.pop();
        renderHistory();
    });

    function renderHistory() {
        displays.historyList.innerHTML = history.map(h => `
            <div class="history-item">
                <span class="h-date">${h.date}</span>
                <span class="h-score">${h.score}%</span>
            </div>
        `).join('') || '<p class="empty-msg">No snapshots saved yet.</p>';
    }

    // --- Listeners ---
    Object.values(inputs).forEach(input => {
        input.addEventListener('input', update);
    });

    update();
});
