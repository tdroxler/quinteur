export class TimeSignatureGame {
    constructor() {
        this.currentQuestion = null;
        this.streak = 0;
        this.answered = false;
        this.selectedBeats = null;
        this.selectedUnit = null;
        this.selectedType = null;
        this.timeSignatures = [
            { display: '1/4', beatsPerMeasure: 1, beatUnit: 'noire', type: 'binaire' },
            { display: '2/4', beatsPerMeasure: 2, beatUnit: 'noire', type: 'binaire' },
            { display: '3/4', beatsPerMeasure: 3, beatUnit: 'noire', type: 'binaire' },
            { display: '4/4', beatsPerMeasure: 4, beatUnit: 'noire', type: 'binaire' },
            { display: 'C', beatsPerMeasure: 4, beatUnit: 'noire', type: 'binaire' },
            { display: '2/2', beatsPerMeasure: 2, beatUnit: 'blanche', type: 'binaire' },
            { display: '3/2', beatsPerMeasure: 3, beatUnit: 'blanche', type: 'binaire' },
            { display: '3/8', beatsPerMeasure: 3, beatUnit: 'croche', type: 'binaire' },
            { display: '6/8', beatsPerMeasure: 2, beatUnit: 'noire pointée', type: 'ternaire' },
            { display: '9/8', beatsPerMeasure: 3, beatUnit: 'noire pointée', type: 'ternaire' },
            { display: '12/8', beatsPerMeasure: 4, beatUnit: 'noire pointée', type: 'ternaire' }
        ];
        this.canvas = document.getElementById('time-signature-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.streakCountEl = document.getElementById('time-streak-count');
        this.feedbackEl = document.getElementById('time-feedback');
        this.beatsButtons = document.querySelectorAll('.beats-btn');
        this.unitButtons = document.querySelectorAll('.unit-btn');
        this.typeButtons = document.querySelectorAll('.type-btn');
        this.submitBtn = document.getElementById('time-submit-btn');
        this.nextBtn = document.getElementById('time-next-btn');
        this.setupEventListeners();
    }
    setupEventListeners() {
        this.beatsButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                if (this.answered)
                    return;
                const beats = parseInt(btn.getAttribute('data-beats'));
                this.selectBeats(beats);
            });
        });
        this.unitButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                if (this.answered)
                    return;
                const unit = btn.getAttribute('data-unit');
                this.selectUnit(unit);
            });
        });
        this.typeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                if (this.answered)
                    return;
                const type = btn.getAttribute('data-type');
                this.selectType(type);
            });
        });
        this.submitBtn.addEventListener('click', () => {
            if (!this.answered && this.selectedBeats !== null && this.selectedUnit !== null && this.selectedType !== null) {
                this.checkAnswer();
            }
        });
        this.nextBtn.addEventListener('click', () => this.newQuestion());
    }
    selectBeats(beats) {
        this.selectedBeats = beats;
        this.beatsButtons.forEach(btn => {
            if (parseInt(btn.getAttribute('data-beats')) === beats) {
                btn.classList.add('selected');
            }
            else {
                btn.classList.remove('selected');
            }
        });
    }
    selectUnit(unit) {
        this.selectedUnit = unit;
        this.unitButtons.forEach(btn => {
            if (btn.getAttribute('data-unit') === unit) {
                btn.classList.add('selected');
            }
            else {
                btn.classList.remove('selected');
            }
        });
    }
    selectType(type) {
        this.selectedType = type;
        this.typeButtons.forEach(btn => {
            if (btn.getAttribute('data-type') === type) {
                btn.classList.add('selected');
            }
            else {
                btn.classList.remove('selected');
            }
        });
    }
    start() {
        this.newQuestion();
    }
    stop() {
        // No timer to stop
    }
    newQuestion() {
        this.stop();
        this.answered = false;
        this.selectedBeats = null;
        this.selectedUnit = null;
        this.selectedType = null;
        this.currentQuestion = this.generateQuestion();
        this.drawTimeSignature();
        this.feedbackEl.textContent = '';
        this.feedbackEl.className = 'feedback';
        this.submitBtn.style.display = 'block';
        this.nextBtn.style.display = 'none';
        // Reset button states
        this.beatsButtons.forEach(btn => {
            btn.classList.remove('selected', 'correct', 'incorrect');
        });
        this.unitButtons.forEach(btn => {
            btn.classList.remove('selected', 'correct', 'incorrect');
        });
        this.typeButtons.forEach(btn => {
            btn.classList.remove('selected', 'correct', 'incorrect');
        });
    }
    generateQuestion() {
        const signature = this.timeSignatures[Math.floor(Math.random() * this.timeSignatures.length)];
        return { signature };
    }
    drawTimeSignature() {
        if (!this.currentQuestion)
            return;
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        // Clear canvas
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height);
        // Draw staff lines
        const staffY = height / 2;
        const lineSpacing = 20;
        const staffLeft = 50;
        const staffRight = width - 50;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        // Draw 5 staff lines
        for (let i = 2; i >= -2; i--) {
            const y = staffY - i * lineSpacing;
            ctx.beginPath();
            ctx.moveTo(staffLeft, y);
            ctx.lineTo(staffRight, y);
            ctx.stroke();
        }
        // Draw time signature
        ctx.font = 'bold 60px serif';
        ctx.fillStyle = '#000';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const signature = this.currentQuestion.signature.display;
        if (signature === 'C') {
            // Draw C symbol for common time manually
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 5;
            ctx.beginPath();
            const centerX = width / 2;
            const radius = 35;
            // Draw C shape (arc from 45° to 315°)
            ctx.arc(centerX, staffY, radius, Math.PI * 0.25, Math.PI * 1.75, false);
            ctx.stroke();
        }
        else {
            // Draw fraction-style time signature
            const parts = signature.split('/');
            const top = parts[0];
            const bottom = parts[1];
            ctx.fillText(top, width / 2, staffY - lineSpacing);
            ctx.fillText(bottom, width / 2, staffY + lineSpacing);
        }
    }
    checkAnswer() {
        if (this.answered || !this.currentQuestion)
            return;
        this.answered = true;
        const correct = this.currentQuestion.signature;
        const isCorrect = this.selectedBeats === correct.beatsPerMeasure &&
            this.selectedUnit === correct.beatUnit &&
            this.selectedType === correct.type;
        if (isCorrect) {
            this.streak++;
            this.streakCountEl.textContent = this.streak.toString();
            // Check if player won (10 correct in a row)
            if (this.streak >= 10) {
                this.feedbackEl.textContent = '🏆 Bravo tu as gagné ! 🏆';
                this.feedbackEl.className = 'feedback correct victory';
                // Highlight correct buttons
                this.beatsButtons.forEach(btn => {
                    if (parseInt(btn.getAttribute('data-beats')) === correct.beatsPerMeasure) {
                        btn.classList.add('correct');
                    }
                });
                this.unitButtons.forEach(btn => {
                    if (btn.getAttribute('data-unit') === correct.beatUnit) {
                        btn.classList.add('correct');
                    }
                });
                this.typeButtons.forEach(btn => {
                    if (btn.getAttribute('data-type') === correct.type) {
                        btn.classList.add('correct');
                    }
                });
                this.submitBtn.style.display = 'none';
                this.nextBtn.style.display = 'block';
                // Reset streak
                this.streak = 0;
                this.streakCountEl.textContent = this.streak.toString();
            }
            else {
                this.feedbackEl.textContent = '✓ Correct !';
                this.feedbackEl.className = 'feedback correct';
                // Highlight correct buttons
                this.beatsButtons.forEach(btn => {
                    if (parseInt(btn.getAttribute('data-beats')) === correct.beatsPerMeasure) {
                        btn.classList.add('correct');
                    }
                });
                this.unitButtons.forEach(btn => {
                    if (btn.getAttribute('data-unit') === correct.beatUnit) {
                        btn.classList.add('correct');
                    }
                });
                this.typeButtons.forEach(btn => {
                    if (btn.getAttribute('data-type') === correct.type) {
                        btn.classList.add('correct');
                    }
                });
                this.submitBtn.style.display = 'none';
                this.nextBtn.style.display = 'block';
            }
        }
        else {
            // Reset streak on error
            this.streak = 0;
            this.streakCountEl.textContent = this.streak.toString();
            this.feedbackEl.textContent = `✗ Incorrect. C'était ${correct.beatsPerMeasure} temps par mesure (${correct.type}), unité de temps : ${correct.beatUnit}`;
            this.feedbackEl.className = 'feedback incorrect';
            // Highlight buttons - show correct answers in green, incorrect selections in red (only if they don't match correct)
            this.beatsButtons.forEach(btn => {
                const beats = parseInt(btn.getAttribute('data-beats'));
                if (beats === correct.beatsPerMeasure) {
                    btn.classList.add('correct');
                }
                else if (beats === this.selectedBeats) {
                    btn.classList.add('incorrect');
                }
            });
            this.unitButtons.forEach(btn => {
                const unit = btn.getAttribute('data-unit');
                if (unit === correct.beatUnit) {
                    btn.classList.add('correct');
                }
                else if (unit === this.selectedUnit) {
                    btn.classList.add('incorrect');
                }
            });
            this.typeButtons.forEach(btn => {
                const type = btn.getAttribute('data-type');
                if (type === correct.type) {
                    btn.classList.add('correct');
                }
                else if (type === this.selectedType) {
                    btn.classList.add('incorrect');
                }
            });
            this.submitBtn.style.display = 'none';
            this.nextBtn.style.display = 'block';
        }
    }
    resetGame() {
        this.streak = 0;
        this.streakCountEl.textContent = this.streak.toString();
        this.newQuestion();
    }
}
