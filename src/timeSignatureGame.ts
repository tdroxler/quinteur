interface TimeSignature {
    display: string;
    beatsPerMeasure: number;
    beatUnit: string;
    type: 'binaire' | 'ternaire';
}

interface TimeSignatureQuestion {
    signature: TimeSignature;
}

export class TimeSignatureGame {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private currentQuestion: TimeSignatureQuestion | null = null;
    private streak: number = 0;
    private answered: boolean = false;

    private streakCountEl: HTMLElement;
    private feedbackEl: HTMLElement;
    private beatsButtons: NodeListOf<HTMLElement>;
    private unitButtons: NodeListOf<HTMLElement>;
    private typeButtons: NodeListOf<HTMLElement>;
    private submitBtn: HTMLButtonElement;
    private nextBtn: HTMLButtonElement;

    private selectedBeats: number | null = null;
    private selectedUnit: string | null = null;
    private selectedType: 'binaire' | 'ternaire' | null = null;

    private timeSignatures: TimeSignature[] = [
        { display: '1/4', beatsPerMeasure: 1, beatUnit: 'noire', type: 'binaire' },
        { display: '2/4', beatsPerMeasure: 2, beatUnit: 'noire', type: 'binaire' },
        { display: '3/4', beatsPerMeasure: 3, beatUnit: 'noire', type: 'binaire' },
        { display: '4/4', beatsPerMeasure: 4, beatUnit: 'noire', type: 'binaire' },
        { display: 'C', beatsPerMeasure: 4, beatUnit: 'noire', type: 'binaire' },
        { display: '2/2', beatsPerMeasure: 2, beatUnit: 'blanche', type: 'binaire' },
        { display: '3/2', beatsPerMeasure: 3, beatUnit: 'blanche', type: 'binaire' },
        { display: '3/8', beatsPerMeasure: 3, beatUnit: 'croche', type: 'binaire' },
        { display: '3/8', beatsPerMeasure: 1, beatUnit: 'noire pointée', type: 'ternaire' },
        { display: '6/8', beatsPerMeasure: 2, beatUnit: 'noire pointée', type: 'ternaire' },
        { display: '9/8', beatsPerMeasure: 3, beatUnit: 'noire pointée', type: 'ternaire' },
        { display: '12/8', beatsPerMeasure: 4, beatUnit: 'noire pointée', type: 'ternaire' }
    ];

    constructor() {
        this.canvas = document.getElementById('time-signature-canvas') as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d')!;
        this.streakCountEl = document.getElementById('time-streak-count')!;
        this.feedbackEl = document.getElementById('time-feedback')!;
        this.beatsButtons = document.querySelectorAll('.beats-btn');
        this.unitButtons = document.querySelectorAll('.unit-btn');
        this.typeButtons = document.querySelectorAll('.type-btn');
        this.submitBtn = document.getElementById('time-submit-btn') as HTMLButtonElement;
        this.nextBtn = document.getElementById('time-next-btn') as HTMLButtonElement;

        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        this.beatsButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                if (this.answered) return;
                const beats = parseInt(btn.getAttribute('data-beats')!);
                this.selectBeats(beats);
            });
        });

        this.unitButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                if (this.answered) return;
                const unit = btn.getAttribute('data-unit')!;
                this.selectUnit(unit);
            });
        });

        this.typeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                if (this.answered) return;
                const type = btn.getAttribute('data-type')! as 'binaire' | 'ternaire';
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

    private selectBeats(beats: number): void {
        this.selectedBeats = beats;
        this.beatsButtons.forEach(btn => {
            if (parseInt(btn.getAttribute('data-beats')!) === beats) {
                btn.classList.add('selected');
            } else {
                btn.classList.remove('selected');
            }
        });
    }

    private selectUnit(unit: string): void {
        this.selectedUnit = unit;
        this.unitButtons.forEach(btn => {
            if (btn.getAttribute('data-unit') === unit) {
                btn.classList.add('selected');
            } else {
                btn.classList.remove('selected');
            }
        });
    }

    private selectType(type: 'binaire' | 'ternaire'): void {
        this.selectedType = type;
        this.typeButtons.forEach(btn => {
            if (btn.getAttribute('data-type') === type) {
                btn.classList.add('selected');
            } else {
                btn.classList.remove('selected');
            }
        });
    }

    start(): void {
        this.newQuestion();
    }

    stop(): void {
        // No timer to stop
    }

    private newQuestion(): void {
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

    private generateQuestion(): TimeSignatureQuestion {
        const signature = this.timeSignatures[Math.floor(Math.random() * this.timeSignatures.length)];
        return { signature };
    }

    private getValidAnswers(display: string): TimeSignature[] {
        return this.timeSignatures.filter(signature => signature.display === display);
    }

    private matchesSelectedAnswer(signature: TimeSignature): boolean {
        return this.selectedBeats === signature.beatsPerMeasure &&
               this.selectedUnit === signature.beatUnit &&
               this.selectedType === signature.type;
    }

    private formatAnswer(signature: TimeSignature): string {
        return `${signature.beatsPerMeasure} temps par mesure (${signature.type}), unité de temps : ${signature.beatUnit}`;
    }

    private formatAnswers(signatures: TimeSignature[]): string {
        return signatures.map(signature => this.formatAnswer(signature)).join(' ou ');
    }

    private highlightCorrectAnswers(signatures: TimeSignature[]): void {
        const correctBeats = new Set(signatures.map(signature => signature.beatsPerMeasure));
        const correctUnits = new Set(signatures.map(signature => signature.beatUnit));
        const correctTypes = new Set(signatures.map(signature => signature.type));

        this.beatsButtons.forEach(btn => {
            if (correctBeats.has(parseInt(btn.getAttribute('data-beats')!))) {
                btn.classList.add('correct');
            }
        });
        this.unitButtons.forEach(btn => {
            if (correctUnits.has(btn.getAttribute('data-unit')!)) {
                btn.classList.add('correct');
            }
        });
        this.typeButtons.forEach(btn => {
            if (correctTypes.has(btn.getAttribute('data-type')! as 'binaire' | 'ternaire')) {
                btn.classList.add('correct');
            }
        });
    }

    private highlightIncorrectAnswer(signatures: TimeSignature[]): void {
        const correctBeats = new Set(signatures.map(signature => signature.beatsPerMeasure));
        const correctUnits = new Set(signatures.map(signature => signature.beatUnit));
        const correctTypes = new Set(signatures.map(signature => signature.type));
        const hasMultipleAnswers = signatures.length > 1;

        this.beatsButtons.forEach(btn => {
            const beats = parseInt(btn.getAttribute('data-beats')!);
            if (hasMultipleAnswers && beats === this.selectedBeats) {
                btn.classList.add('incorrect');
            } else if (correctBeats.has(beats)) {
                btn.classList.add('correct');
            } else if (beats === this.selectedBeats) {
                btn.classList.add('incorrect');
            }
        });
        this.unitButtons.forEach(btn => {
            const unit = btn.getAttribute('data-unit')!;
            if (hasMultipleAnswers && unit === this.selectedUnit) {
                btn.classList.add('incorrect');
            } else if (correctUnits.has(unit)) {
                btn.classList.add('correct');
            } else if (unit === this.selectedUnit) {
                btn.classList.add('incorrect');
            }
        });
        this.typeButtons.forEach(btn => {
            const type = btn.getAttribute('data-type')! as 'binaire' | 'ternaire';
            if (hasMultipleAnswers && type === this.selectedType) {
                btn.classList.add('incorrect');
            } else if (correctTypes.has(type)) {
                btn.classList.add('correct');
            } else if (type === this.selectedType) {
                btn.classList.add('incorrect');
            }
        });
    }

    private drawTimeSignature(): void {
        if (!this.currentQuestion) return;

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
        } else {
            // Draw fraction-style time signature
            const parts = signature.split('/');
            const top = parts[0];
            const bottom = parts[1];

            ctx.fillText(top, width / 2, staffY - lineSpacing);
            ctx.fillText(bottom, width / 2, staffY + lineSpacing);
        }
    }

    private checkAnswer(): void {
        if (this.answered || !this.currentQuestion) return;

        this.answered = true;

        const correctAnswers = this.getValidAnswers(this.currentQuestion.signature.display);
        const matchedAnswer = correctAnswers.find(signature => this.matchesSelectedAnswer(signature));

        if (matchedAnswer) {
            this.streak++;
            this.streakCountEl.textContent = this.streak.toString();

            // Check if player won (10 correct in a row)
            if (this.streak >= 10) {
                this.feedbackEl.textContent = '🏆 Bravo tu as gagné ! 🏆';
                this.feedbackEl.className = 'feedback correct victory';

                this.highlightCorrectAnswers([matchedAnswer]);

                this.submitBtn.style.display = 'none';
                this.nextBtn.style.display = 'block';

                // Reset streak
                this.streak = 0;
                this.streakCountEl.textContent = this.streak.toString();
            } else {
                this.feedbackEl.textContent = '✓ Correct !';
                this.feedbackEl.className = 'feedback correct';

                this.highlightCorrectAnswers([matchedAnswer]);

                this.submitBtn.style.display = 'none';
                this.nextBtn.style.display = 'block';
            }
        } else {
            // Reset streak on error
            this.streak = 0;
            this.streakCountEl.textContent = this.streak.toString();

            this.feedbackEl.textContent = `✗ Incorrect. C'était ${this.formatAnswers(correctAnswers)}`;
            this.feedbackEl.className = 'feedback incorrect';

            this.highlightIncorrectAnswer(correctAnswers);

            this.submitBtn.style.display = 'none';
            this.nextBtn.style.display = 'block';
        }
    }

    private resetGame(): void {
        this.streak = 0;
        this.streakCountEl.textContent = this.streak.toString();
        this.newQuestion();
    }
}
