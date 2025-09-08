// Game state management
class TableTennisTracker {
    constructor() {
        this.currentGame = null;
        this.gameHistory = [];
        this.currentSelection = {
            winner: null,
            xWonReason: null,
            yWonReason: null,
            xHit: null,
            yHit: null
        };
        this.initializeEventListeners();
        this.loadGameHistory();
    }

    initializeEventListeners() {
        // Game setup form
        document.getElementById('setup-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.startNewGame();
        });

        // Test mode buttons
        document.getElementById('test-mode-1').addEventListener('click', () => {
            this.startTestMode(1);
        });
        document.getElementById('test-mode-2').addEventListener('click', () => {
            this.startTestMode(2);
        });
        document.getElementById('test-mode-3').addEventListener('click', () => {
            this.startTestMode(3);
        });
        document.getElementById('test-mode-4').addEventListener('click', () => {
            this.startTestMode(4);
        });

        // Winner selection buttons
        document.querySelectorAll('.winner-buttons .option-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectWinner(e.target.dataset.winner);
            });
        });

        // Reason buttons (unified for both X and Y)
        document.querySelectorAll('#reason-section .option-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectReason(e.target.dataset.reason);
            });
        });

        // Hit type buttons
        document.querySelectorAll('.hit-buttons .option-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectHitType(e.target.dataset.hit, e.target.dataset.type);
            });
        });

        // Record point button
        document.getElementById('record-point').addEventListener('click', () => {
            this.recordPoint();
        });

        // Export button
        document.getElementById('export-data').addEventListener('click', () => {
            this.exportToCSV();
        });

        // Navigation buttons
        document.getElementById('view-stats').addEventListener('click', () => {
            this.showStatsPage();
        });

        document.getElementById('back-to-questions').addEventListener('click', () => {
            this.showQuestionsPage();
        });

        // Game controls
        document.getElementById('end-game').addEventListener('click', () => {
            this.endGame();
        });

        document.getElementById('new-game').addEventListener('click', () => {
            this.resetToSetup();
        });
    }

    startNewGame() {
        const opponentId = document.getElementById('opponent-id').value;
        const event = document.getElementById('event').value;
        const gameNumber = parseInt(document.getElementById('game-number').value);

        this.currentGame = {
            id: Date.now(),
            opponentId,
            event,
            gameNumber,
            startTime: new Date(),
            points: [],
            playerScore: 0,
            opponentScore: 0,
            stats: {
                xWon: {
                    attack: 0,
                    lucky: 0,
                    yMissNet: 0,
                    yMissOver: 0,
                    serve: 0,
                    total: 0
                },
                yWon: {
                    attack: 0,
                    lucky: 0,
                    xMissNet: 0,
                    xMissOver: 0,
                    serve: 0,
                    total: 0
                },
                hitTypes: {
                    yFhWhenXWon: 0,
                    yBhWhenXWon: 0,
                    totalXWon: 0
                }
            }
        };

        this.updateGameDisplay();
        this.showQuestionsPage();
        this.updateStats();
    }

    startTestMode(gameNumber) {
        // Set test values
        document.getElementById('opponent-id').value = 'A';
        document.getElementById('event').value = 'U1350';
        document.getElementById('game-number').value = gameNumber.toString();
        
        // Start the game
        this.startNewGame();
        
        // Add test data for specific game
        this.addTestData(gameNumber);
    }

    addTestData(gameNumber) {
        if (!this.currentGame) return;

        // Test data from CSV file
        const testData = {
            1: [
                { winner: 'X', reason: 'attack', xHit: 'FH', yHit: 'BH' },
                { winner: 'X', reason: 'attack', xHit: 'FH', yHit: 'BH' },
                { winner: 'X', reason: 'attack', xHit: 'FH', yHit: 'BH' },
                { winner: 'X', reason: 'attack', xHit: 'FH', yHit: 'BH' },
                { winner: 'X', reason: 'serve', xHit: 'FH', yHit: 'BH' },
                { winner: 'X', reason: 'serve', xHit: 'FH', yHit: 'BH' },
                { winner: 'X', reason: 'serve', xHit: 'FH', yHit: 'BH' },
                { winner: 'X', reason: 'miss-net', xHit: 'BH', yHit: 'FH' },
                { winner: 'X', reason: 'miss-net', xHit: 'BH', yHit: 'FH' },
                { winner: 'X', reason: 'miss-over', xHit: 'BH', yHit: 'FH' },
                { winner: 'Y', reason: 'attack', xHit: 'BH', yHit: 'BH' },
                { winner: 'Y', reason: 'attack', xHit: 'BH', yHit: 'BH' },
                { winner: 'Y', reason: 'attack', xHit: 'BH', yHit: 'BH' },
                { winner: 'Y', reason: 'serve', xHit: 'BH', yHit: 'BH' },
                { winner: 'Y', reason: 'serve', xHit: 'BH', yHit: 'BH' },
                { winner: 'Y', reason: 'miss-net', xHit: 'FH', yHit: 'FH' },
                { winner: 'Y', reason: 'miss-over', xHit: 'FH', yHit: 'FH' },
                { winner: 'Y', reason: 'miss-over', xHit: 'FH', yHit: 'FH' },
                { winner: 'Y', reason: 'lucky', xHit: 'FH', yHit: 'FH' },
                { winner: 'X', reason: 'lucky', xHit: 'FH', yHit: 'FH' }
            ],
            2: [
                { winner: 'Y', reason: 'attack', xHit: 'FH', yHit: 'BH' },
                { winner: 'Y', reason: 'attack', xHit: 'FH', yHit: 'BH' },
                { winner: 'Y', reason: 'attack', xHit: 'FH', yHit: 'BH' },
                { winner: 'Y', reason: 'attack', xHit: 'FH', yHit: 'BH' },
                { winner: 'Y', reason: 'serve', xHit: 'FH', yHit: 'BH' },
                { winner: 'Y', reason: 'serve', xHit: 'FH', yHit: 'BH' },
                { winner: 'Y', reason: 'serve', xHit: 'FH', yHit: 'BH' },
                { winner: 'Y', reason: 'miss-net', xHit: 'BH', yHit: 'FH' },
                { winner: 'Y', reason: 'miss-net', xHit: 'BH', yHit: 'FH' },
                { winner: 'Y', reason: 'miss-over', xHit: 'BH', yHit: 'FH' },
                { winner: 'X', reason: 'attack', xHit: 'BH', yHit: 'BH' },
                { winner: 'X', reason: 'attack', xHit: 'BH', yHit: 'BH' },
                { winner: 'X', reason: 'attack', xHit: 'BH', yHit: 'BH' },
                { winner: 'X', reason: 'serve', xHit: 'BH', yHit: 'BH' },
                { winner: 'X', reason: 'serve', xHit: 'BH', yHit: 'BH' },
                { winner: 'X', reason: 'miss-net', xHit: 'FH', yHit: 'FH' },
                { winner: 'X', reason: 'miss-over', xHit: 'FH', yHit: 'FH' },
                { winner: 'X', reason: 'miss-over', xHit: 'FH', yHit: 'FH' },
                { winner: 'X', reason: 'lucky', xHit: 'FH', yHit: 'FH' },
                { winner: 'X', reason: 'lucky', xHit: 'FH', yHit: 'FH' }
            ],
            3: [
                { winner: 'Y', reason: 'attack', xHit: 'FH', yHit: 'FH' },
                { winner: 'Y', reason: 'attack', xHit: 'FH', yHit: 'FH' },
                { winner: 'Y', reason: 'attack', xHit: 'FH', yHit: 'FH' },
                { winner: 'Y', reason: 'attack', xHit: 'FH', yHit: 'FH' },
                { winner: 'Y', reason: 'serve', xHit: 'FH', yHit: 'FH' },
                { winner: 'Y', reason: 'serve', xHit: 'FH', yHit: 'FH' },
                { winner: 'Y', reason: 'serve', xHit: 'FH', yHit: 'FH' },
                { winner: 'Y', reason: 'miss-net', xHit: 'FH', yHit: 'FH' },
                { winner: 'Y', reason: 'miss-net', xHit: 'FH', yHit: 'FH' },
                { winner: 'Y', reason: 'miss-over', xHit: 'FH', yHit: 'FH' },
                { winner: 'X', reason: 'attack', xHit: 'FH', yHit: 'FH' },
                { winner: 'X', reason: 'attack', xHit: 'FH', yHit: 'FH' },
                { winner: 'X', reason: 'attack', xHit: 'FH', yHit: 'FH' },
                { winner: 'X', reason: 'serve', xHit: 'FH', yHit: 'FH' },
                { winner: 'X', reason: 'serve', xHit: 'FH', yHit: 'FH' },
                { winner: 'X', reason: 'miss-net', xHit: 'FH', yHit: 'FH' },
                { winner: 'X', reason: 'miss-over', xHit: 'FH', yHit: 'FH' },
                { winner: 'X', reason: 'miss-over', xHit: 'FH', yHit: 'FH' },
                { winner: 'X', reason: 'lucky', xHit: 'FH', yHit: 'FH' },
                { winner: 'Y', reason: 'lucky', xHit: 'FH', yHit: 'FH' }
            ],
            4: [
                { winner: 'Y', reason: 'attack', xHit: 'FH', yHit: 'FH' },
                { winner: 'Y', reason: 'attack', xHit: 'FH', yHit: 'FH' },
                { winner: 'Y', reason: 'attack', xHit: 'FH', yHit: 'FH' },
                { winner: 'Y', reason: 'attack', xHit: 'FH', yHit: 'FH' },
                { winner: 'Y', reason: 'serve', xHit: 'FH', yHit: 'FH' },
                { winner: 'Y', reason: 'serve', xHit: 'FH', yHit: 'FH' },
                { winner: 'Y', reason: 'serve', xHit: 'FH', yHit: 'FH' },
                { winner: 'Y', reason: 'miss-net', xHit: 'FH', yHit: 'FH' },
                { winner: 'Y', reason: 'miss-net', xHit: 'FH', yHit: 'FH' },
                { winner: 'Y', reason: 'miss-over', xHit: 'FH', yHit: 'FH' },
                { winner: 'X', reason: 'attack', xHit: 'FH', yHit: 'FH' },
                { winner: 'X', reason: 'attack', xHit: 'FH', yHit: 'FH' },
                { winner: 'X', reason: 'attack', xHit: 'FH', yHit: 'FH' },
                { winner: 'X', reason: 'serve', xHit: 'FH', yHit: 'FH' },
                { winner: 'X', reason: 'serve', xHit: 'FH', yHit: 'FH' },
                { winner: 'X', reason: 'miss-net', xHit: 'FH', yHit: 'FH' },
                { winner: 'X', reason: 'miss-over', xHit: 'FH', yHit: 'FH' },
                { winner: 'X', reason: 'miss-over', xHit: 'FH', yHit: 'FH' },
                { winner: 'X', reason: 'lucky', xHit: 'FH', yHit: 'FH' },
                { winner: 'Y', reason: 'lucky', xHit: 'FH', yHit: 'FH' }
            ]
        };

        const testPoints = testData[gameNumber] || [];
        
        // Add test points to current game
        testPoints.forEach((pointData, index) => {
            const point = {
                id: Date.now() + index,
                winner: pointData.winner,
                xWonReason: pointData.winner === 'X' ? this.convertReason(pointData.reason, 'X') : null,
                yWonReason: pointData.winner === 'Y' ? this.convertReason(pointData.reason, 'Y') : null,
                xHit: pointData.xHit,
                yHit: pointData.yHit,
                timestamp: new Date()
            };

            this.currentGame.points.push(point);

            // Update scores
            if (point.winner === 'X') {
                this.currentGame.playerScore++;
            } else {
                this.currentGame.opponentScore++;
            }

            // Update stats
            this.updateGameStats(point);
        });

        // Update display
        this.updateScoreDisplay();
        this.updateStats();
    }

    selectWinner(winner) {
        // Clear previous selections
        this.currentSelection = {
            winner: winner,
            reason: null,
            xHit: null,
            yHit: null
        };

        // Update button states
        document.querySelectorAll('.winner-buttons .option-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        document.querySelector(`[data-winner="${winner}"]`).classList.add('selected');

        // Reason section is now always visible
    }

    selectReason(reason) {
        this.currentSelection.reason = reason;
        
        // Update button states
        document.querySelectorAll('#reason-section .option-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        document.querySelector(`#reason-section [data-reason="${reason}"]`).classList.add('selected');
        
        // Hit section is now always visible
    }

    selectHitType(player, type) {
        if (player === 'X') {
            this.currentSelection.xHit = type;
        } else {
            this.currentSelection.yHit = type;
        }
        
        // Update button states
        document.querySelectorAll(`[data-hit="${player}"]`).forEach(btn => {
            btn.classList.remove('selected');
        });
        document.querySelector(`[data-hit="${player}"][data-type="${type}"]`).classList.add('selected');
    }


    recordPoint() {
        if (!this.currentGame) return;

        const { winner, reason, xHit, yHit } = this.currentSelection;

        // Validate required fields
        if (!winner || !reason || !xHit || !yHit) {
            alert('Please select all required options');
            return;
        }

        // Convert unified reason to specific format for stats
        const xWonReason = winner === 'X' ? this.convertReason(reason, winner) : null;
        const yWonReason = winner === 'Y' ? this.convertReason(reason, winner) : null;

        // Record the point
        const point = {
            id: Date.now(),
            winner,
            xWonReason,
            yWonReason,
            xHit,
            yHit,
            timestamp: new Date()
        };

        this.currentGame.points.push(point);

        // Update scores
        if (winner === 'X') {
            this.currentGame.playerScore++;
        } else {
            this.currentGame.opponentScore++;
        }

        // Update stats
        this.updateGameStats(point);
        this.updateScoreDisplay();
        this.updateStats();
        this.resetPointForm();

        // Check for game end (optional - you can modify this logic)
        if (this.currentGame.playerScore >= 11 || this.currentGame.opponentScore >= 11) {
            if (Math.abs(this.currentGame.playerScore - this.currentGame.opponentScore) >= 2) {
                this.endGame();
            }
        }
    }

    convertReason(reason, winner) {
        // Convert unified reason to specific format for stats tracking
        if (reason === 'miss-net') {
            return winner === 'X' ? 'x-miss-net' : 'x-miss-net';
        } else if (reason === 'miss-over') {
            return winner === 'X' ? 'x-miss-over' : 'x-miss-over';
        } else {
            return reason;
        }
    }

    updateGameStats(point) {
        const stats = this.currentGame.stats;

        if (point.winner === 'X') {
            stats.xWon.total++;
            stats.hitTypes.totalXWon++;

            // Track why X won
            switch (point.xWonReason) {
                case 'attack':
                    stats.xWon.attack++;
                    break;
                case 'lucky':
                    stats.xWon.lucky++;
                    break;
                case 'y-miss-net':
                    stats.xWon.yMissNet++;
                    break;
                case 'y-miss-over':
                    stats.xWon.yMissOver++;
                    break;
                case 'serve':
                    stats.xWon.serve++;
                    break;
            }

            // Track Y's hit type when X won
            if (point.yHit === 'FH') {
                stats.hitTypes.yFhWhenXWon++;
            } else if (point.yHit === 'BH') {
                stats.hitTypes.yBhWhenXWon++;
            }
        } else {
            stats.yWon.total++;

            // Track why Y won
            switch (point.yWonReason) {
                case 'attack':
                    stats.yWon.attack++;
                    break;
                case 'lucky':
                    stats.yWon.lucky++;
                    break;
                case 'x-miss-net':
                    stats.yWon.xMissNet++;
                    break;
                case 'x-miss-over':
                    stats.yWon.xMissOver++;
                    break;
                case 'serve':
                    stats.yWon.serve++;
                    break;
            }
        }
    }

    updateGameDisplay() {
        document.getElementById('current-opponent').textContent = this.currentGame.opponentId;
        document.getElementById('current-event').textContent = this.currentGame.event;
        document.getElementById('current-game').textContent = this.currentGame.gameNumber;
    }

    updateScoreDisplay() {
        document.getElementById('player-score').textContent = this.currentGame.playerScore;
        document.getElementById('opponent-score').textContent = this.currentGame.opponentScore;
        document.getElementById('live-player-score').textContent = this.currentGame.playerScore;
        document.getElementById('live-opponent-score').textContent = this.currentGame.opponentScore;
    }

    updateStats() {
        if (!this.currentGame) return;

        const stats = this.currentGame.stats;

        // X won percentages
        this.updatePercentage('x-attack-pct', stats.xWon.attack, stats.xWon.total);
        this.updatePercentage('x-lucky-pct', stats.xWon.lucky, stats.xWon.total);
        this.updatePercentage('x-y-miss-net-pct', stats.xWon.yMissNet, stats.xWon.total);
        this.updatePercentage('x-y-miss-over-pct', stats.xWon.yMissOver, stats.xWon.total);
        this.updatePercentage('x-serve-pct', stats.xWon.serve, stats.xWon.total);

        // Y won percentages
        this.updatePercentage('y-attack-pct', stats.yWon.attack, stats.yWon.total);
        this.updatePercentage('y-lucky-pct', stats.yWon.lucky, stats.yWon.total);
        this.updatePercentage('y-x-miss-net-pct', stats.yWon.xMissNet, stats.yWon.total);
        this.updatePercentage('y-x-miss-over-pct', stats.yWon.xMissOver, stats.yWon.total);
        this.updatePercentage('y-serve-pct', stats.yWon.serve, stats.yWon.total);

        // Hit distribution percentages
        this.updatePercentage('y-fh-when-x-won-pct', stats.hitTypes.yFhWhenXWon, stats.hitTypes.totalXWon);
        this.updatePercentage('y-bh-when-x-won-pct', stats.hitTypes.yBhWhenXWon, stats.hitTypes.totalXWon);
    }

    updatePercentage(elementId, numerator, denominator) {
        const element = document.getElementById(elementId);
        if (denominator === 0) {
            element.textContent = '0%';
        } else {
            const percentage = Math.round((numerator / denominator) * 100);
            element.textContent = `${percentage}%`;
        }
    }

    resetPointForm() {
        // Reset selection state
        this.currentSelection = {
            winner: null,
            reason: null,
            xHit: null,
            yHit: null
        };

        // Clear all button selections
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.classList.remove('selected');
        });

        // Sections are now always visible, no need to hide them
    }

    showQuestionsPage() {
        document.getElementById('game-setup').classList.add('hidden');
        document.getElementById('questions-page').classList.remove('hidden');
        document.getElementById('stats-page').classList.add('hidden');
    }

    showStatsPage() {
        document.getElementById('questions-page').classList.add('hidden');
        document.getElementById('stats-page').classList.remove('hidden');
        this.updateStats();
    }

    resetToSetup() {
        document.getElementById('game-setup').classList.remove('hidden');
        document.getElementById('questions-page').classList.add('hidden');
        document.getElementById('stats-page').classList.add('hidden');
        document.getElementById('setup-form').reset();
        this.currentGame = null;
    }

    endGame() {
        if (!this.currentGame) return;

        this.currentGame.endTime = new Date();
        this.currentGame.duration = this.currentGame.endTime - this.currentGame.startTime;
        this.currentGame.winner = this.currentGame.playerScore > this.currentGame.opponentScore ? 'X' : 'Y';

        this.gameHistory.push({...this.currentGame});
        this.saveGameHistory();

        alert(`Game ended! Final score: ${this.currentGame.playerScore} - ${this.currentGame.opponentScore}`);
        this.resetToSetup();
    }

    saveGameHistory() {
        localStorage.setItem('tableTennisHistory', JSON.stringify(this.gameHistory));
    }

    loadGameHistory() {
        const saved = localStorage.getItem('tableTennisHistory');
        if (saved) {
            this.gameHistory = JSON.parse(saved);
        }
    }

    exportToCSV() {
        if (!this.currentGame || this.currentGame.points.length === 0) {
            alert('No game data to export. Please record some points first.');
            return;
        }

        // Generate CSV content
        const csvContent = this.generateCSV();
        
        // Create and download CSV file
        this.downloadCSV(csvContent);
        
        // Show CSV data in popup
        this.showCSVPopup(csvContent);
    }

    generateCSV() {
        const headers = ['Point #', 'Who won', 'Reason', 'X\'s last hit', 'Y\'s last hit'];
        const rows = [headers.join(',')];

        this.currentGame.points.forEach((point, index) => {
            const pointNumber = index + 1;
            const whoWon = point.winner;
            
            // Determine reason based on who won
            let reason = '';
            if (point.winner === 'X') {
                reason = this.formatReason(point.xWonReason);
            } else {
                reason = this.formatReason(point.yWonReason);
            }
            
            const xHit = point.xHit;
            const yHit = point.yHit;
            
            rows.push([pointNumber, whoWon, reason, xHit, yHit].join(','));
        });

        return rows.join('\n');
    }

    formatReason(reason) {
        const reasonMap = {
            'attack': 'attack',
            'lucky': 'lucky',
            'serve': 'serve',
            'miss-net': 'miss net',
            'miss-over': 'miss over',
            'x-miss-net': 'miss net',
            'x-miss-over': 'miss over',
            'y-miss-net': 'Y miss net',
            'y-miss-over': 'Y miss over'
        };
        return reasonMap[reason] || reason;
    }

    downloadCSV(csvContent) {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `table_tennis_${this.currentGame.opponentId}_${this.currentGame.event}_game${this.currentGame.gameNumber}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    showCSVPopup(csvContent) {
        // Create popup window
        const popup = window.open('', 'CSVExport', 'width=800,height=600,scrollbars=yes,resizable=yes');
        
        // Create HTML content for popup
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Table Tennis CSV Export</title>
                <style>
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        margin: 20px;
                        background: #f5f5f5;
                    }
                    .container {
                        background: white;
                        padding: 20px;
                        border-radius: 10px;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    }
                    h1 {
                        color: #667eea;
                        margin-bottom: 20px;
                    }
                    .game-info {
                        background: #f7fafc;
                        padding: 15px;
                        border-radius: 8px;
                        margin-bottom: 20px;
                        border-left: 4px solid #667eea;
                    }
                    .csv-container {
                        background: #f8f9fa;
                        border: 1px solid #e9ecef;
                        border-radius: 8px;
                        padding: 15px;
                        margin-bottom: 20px;
                    }
                    textarea {
                        width: 100%;
                        height: 300px;
                        border: none;
                        background: transparent;
                        font-family: 'Courier New', monospace;
                        font-size: 14px;
                        line-height: 1.4;
                        resize: vertical;
                    }
                    .buttons {
                        text-align: center;
                        margin-top: 20px;
                    }
                    button {
                        background: #667eea;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 6px;
                        cursor: pointer;
                        margin: 0 10px;
                        font-size: 14px;
                    }
                    button:hover {
                        background: #5a67d8;
                    }
                    .copy-success {
                        color: #48bb78;
                        font-weight: bold;
                        margin-left: 10px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>🏓 Table Tennis CSV Export</h1>
                    
                    <div class="game-info">
                        <h3>Game Details</h3>
                        <p><strong>Opponent:</strong> ${this.currentGame.opponentId}</p>
                        <p><strong>Event:</strong> ${this.currentGame.event}</p>
                        <p><strong>Game:</strong> ${this.currentGame.gameNumber}</p>
                        <p><strong>Final Score:</strong> ${this.currentGame.playerScore} - ${this.currentGame.opponentScore}</p>
                        <p><strong>Total Points:</strong> ${this.currentGame.points.length}</p>
                    </div>
                    
                    <div class="csv-container">
                        <h3>CSV Data (Click to select all, then copy)</h3>
                        <textarea readonly id="csvData">${csvContent}</textarea>
                    </div>
                    
                    <div class="buttons">
                        <button onclick="copyToClipboard()">Copy to Clipboard</button>
                        <button onclick="window.close()">Close Window</button>
                        <span id="copyStatus"></span>
                    </div>
                </div>
                
                <script>
                    function copyToClipboard() {
                        const textarea = document.getElementById('csvData');
                        textarea.select();
                        textarea.setSelectionRange(0, 99999); // For mobile devices
                        
                        try {
                            document.execCommand('copy');
                            document.getElementById('copyStatus').innerHTML = '<span class="copy-success">✓ Copied!</span>';
                            setTimeout(() => {
                                document.getElementById('copyStatus').innerHTML = '';
                            }, 2000);
                        } catch (err) {
                            alert('Failed to copy. Please manually select and copy the text.');
                        }
                    }
                    
                    // Auto-select text when popup opens
                    window.onload = function() {
                        document.getElementById('csvData').select();
                    }
                </script>
            </body>
            </html>
        `;
        
        // Write content to popup
        popup.document.write(htmlContent);
        popup.document.close();
        
        // Focus the popup
        popup.focus();
    }
}

// Initialize the tracker when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new TableTennisTracker();
});
