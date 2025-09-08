// Game state management
class TableTennisTracker {
    constructor() {
        this.currentGame = null;
        this.gameHistory = [];
        this.initializeEventListeners();
        this.loadGameHistory();
    }

    initializeEventListeners() {
        // Game setup form
        document.getElementById('setup-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.startNewGame();
        });

        // Point tracking form
        document.getElementById('point-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.recordPoint();
        });

        // Winner selection change
        document.querySelectorAll('input[name="winner"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.toggleReasonSections(e.target.value);
            });
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
        this.showGameTracking();
        this.updateStats();
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

        const formData = new FormData(document.getElementById('point-form'));
        const winner = formData.get('winner');
        const xWonReason = formData.get('x-won-reason');
        const yWonReason = formData.get('y-won-reason');
        const xHit = formData.get('x-hit');
        const yHit = formData.get('y-hit');

        // Validate required fields
        if (!winner || !xHit || !yHit) {
            alert('Please fill in all required fields');
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
        document.getElementById('point-form').reset();
        document.getElementById('x-won-reasons').classList.add('hidden');
        document.getElementById('y-won-reasons').classList.add('hidden');
    }

    showGameTracking() {
        document.getElementById('game-setup').classList.add('hidden');
        document.getElementById('game-tracking').classList.remove('hidden');
    }

    resetToSetup() {
        document.getElementById('game-setup').classList.remove('hidden');
        document.getElementById('game-tracking').classList.add('hidden');
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
