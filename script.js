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

        // Test mode button
        document.getElementById('test-mode').addEventListener('click', () => {
            this.startTestMode();
        });

        // Winner selection buttons
        document.querySelectorAll('.winner-buttons .option-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectWinner(e.target.dataset.winner);
            });
        });

        // X won reason buttons
        document.querySelectorAll('#x-won-reasons .option-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectXWonReason(e.target.dataset.reason);
            });
        });

        // Y won reason buttons
        document.querySelectorAll('#y-won-reasons .option-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectYWonReason(e.target.dataset.reason);
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

    startTestMode() {
        // Set test values
        document.getElementById('opponent-id').value = 'A';
        document.getElementById('event').value = 'U1350';
        document.getElementById('game-number').value = '1';
        
        // Start the game
        this.startNewGame();
    }

    selectWinner(winner) {
        // Clear previous selections
        this.currentSelection = {
            winner: winner,
            xWonReason: null,
            yWonReason: null,
            xHit: null,
            yHit: null
        };

        // Update button states
        document.querySelectorAll('.winner-buttons .option-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        document.querySelector(`[data-winner="${winner}"]`).classList.add('selected');

        // Show appropriate reason section
        this.toggleReasonSections(winner);
    }

    selectXWonReason(reason) {
        this.currentSelection.xWonReason = reason;
        
        // Update button states
        document.querySelectorAll('#x-won-reasons .option-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        document.querySelector(`#x-won-reasons [data-reason="${reason}"]`).classList.add('selected');
    }

    selectYWonReason(reason) {
        this.currentSelection.yWonReason = reason;
        
        // Update button states
        document.querySelectorAll('#y-won-reasons .option-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        document.querySelector(`#y-won-reasons [data-reason="${reason}"]`).classList.add('selected');
    }

    selectHitType(player, type) {
        if (player === 'x') {
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

    toggleReasonSections(winner) {
        const xWonReasons = document.getElementById('x-won-reasons');
        const yWonReasons = document.getElementById('y-won-reasons');

        if (winner === 'X') {
            xWonReasons.classList.remove('hidden');
            yWonReasons.classList.add('hidden');
        } else {
            xWonReasons.classList.add('hidden');
            yWonReasons.classList.remove('hidden');
        }
    }

    recordPoint() {
        if (!this.currentGame) return;

        const { winner, xWonReason, yWonReason, xHit, yHit } = this.currentSelection;

        // Validate required fields
        if (!winner || !xHit || !yHit) {
            alert('Please select all required options');
            return;
        }

        if (winner === 'X' && !xWonReason) {
            alert('Please select why you won the point');
            return;
        }

        if (winner === 'Y' && !yWonReason) {
            alert('Please select why opponent won the point');
            return;
        }

        // Record the point
        const point = {
            id: Date.now(),
            winner,
            xWonReason: winner === 'X' ? xWonReason : null,
            yWonReason: winner === 'Y' ? yWonReason : null,
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
            xWonReason: null,
            yWonReason: null,
            xHit: null,
            yHit: null
        };

        // Clear all button selections
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.classList.remove('selected');
        });

        // Hide reason sections
        document.getElementById('x-won-reasons').classList.add('hidden');
        document.getElementById('y-won-reasons').classList.add('hidden');
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
}

// Initialize the tracker when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new TableTennisTracker();
});
