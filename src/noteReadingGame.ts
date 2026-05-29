import { NoteLetter, noteToFrench } from './types.js';

type Clef = 'G' | 'F';

interface NotePosition {
    note: NoteLetter;
    octave: number;
    yPosition: number; // Position on staff (middle line = 0)
}

interface NoteQuestion {
    clef: Clef;
    position: NotePosition;
}

export class NoteReadingGame {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private currentQuestion: NoteQuestion | null = null;
    private streak: number = 0;
    private timer: number = 5;
    private timerInterval: number | null = null;
    private answered: boolean = false;

    private streakCountEl: HTMLElement;
    private timerDisplayEl: HTMLElement;
    private feedbackEl: HTMLElement;
    private noteButtons: NodeListOf<HTMLElement>;

    constructor() {
        this.canvas = document.getElementById('staff-canvas') as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d')!;
        this.streakCountEl = document.getElementById('notes-streak-count')!;
        this.timerDisplayEl = document.getElementById('timer-display')!;
        this.feedbackEl = document.getElementById('notes-feedback')!;
        this.noteButtons = document.querySelectorAll('.note-btn-simple');

        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        this.noteButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                if (this.answered) return;
                const note = btn.getAttribute('data-note') as NoteLetter;
                this.checkAnswer(note);
            });
        });
    }

    start(): void {
        this.newQuestion();
    }

    stop(): void {
        if (this.timerInterval !== null) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    private newQuestion(): void {
        this.stop();
        this.answered = false;
        this.timer = 5;
        this.currentQuestion = this.generateQuestion();
        this.drawStaff();
        this.timerDisplayEl.textContent = this.timer.toString();
        this.timerDisplayEl.classList.remove('warning');
        this.feedbackEl.textContent = '';
        this.feedbackEl.className = 'feedback';

        // Reset button states
        this.noteButtons.forEach(btn => {
            btn.classList.remove('correct', 'incorrect');
        });

        // Start timer
        this.timerInterval = window.setInterval(() => {
            this.timer--;
            this.timerDisplayEl.textContent = this.timer.toString();

            if (this.timer <= 2) {
                this.timerDisplayEl.classList.add('warning');
            }

            if (this.timer <= 0) {
                this.timeUp();
            }
        }, 1000);
    }

    private generateQuestion(): NoteQuestion {
        const clef: Clef = Math.random() > 0.5 ? 'G' : 'F';

        // Define range of notes for each clef
        const positions: NotePosition[] = [];

        if (clef === 'G') {
            // G clef (Treble): C4 to B5
            // Staff lines from bottom to top: E4, G4, B4, D5, F5
            // yPosition: -4=bottom line, -3=space, -2=2nd line (G4), -1=space, 0=middle line, 1=space, 2=top line
            positions.push(
                { note: 'C', octave: 4, yPosition: -6 },   // C4 (ledger line below)
                { note: 'D', octave: 4, yPosition: -5 },   // D4 (space below)
                { note: 'E', octave: 4, yPosition: -4 },   // E4 (bottom line)
                { note: 'F', octave: 4, yPosition: -3 },   // F4 (space)
                { note: 'G', octave: 4, yPosition: -2 },   // G4 (2nd line - where clef curls)
                { note: 'A', octave: 4, yPosition: -1 },   // A4 (space)
                { note: 'B', octave: 4, yPosition: 0 },    // B4 (middle line)
                { note: 'C', octave: 5, yPosition: 1 },    // C5 (space)
                { note: 'D', octave: 5, yPosition: 2 },    // D5 (4th line)
                { note: 'E', octave: 5, yPosition: 3 },    // E5 (space)
                { note: 'F', octave: 5, yPosition: 4 },    // F5 (top line)
                { note: 'G', octave: 5, yPosition: 5 },    // G5 (space above)
                { note: 'A', octave: 5, yPosition: 6 },    // A5 (ledger line above)
                { note: 'B', octave: 5, yPosition: 7 }     // B5 (space above ledger)
            );
        } else {
            // F clef (Bass): E2 to C4
            // Staff lines from bottom to top: G2, B2, D3, F3, A3
            // yPosition: -4=bottom line, -3=space, -2=2nd line, -1=space, 0=middle line, 1=space, 2=top line
            positions.push(
                { note: 'E', octave: 2, yPosition: -6 },   // E2 (ledger line below)
                { note: 'F', octave: 2, yPosition: -5 },   // F2 (space below)
                { note: 'G', octave: 2, yPosition: -4 },   // G2 (bottom line)
                { note: 'A', octave: 2, yPosition: -3 },   // A2 (space)
                { note: 'B', octave: 2, yPosition: -2 },   // B2 (2nd line)
                { note: 'C', octave: 3, yPosition: -1 },   // C3 (space)
                { note: 'D', octave: 3, yPosition: 0 },    // D3 (middle line)
                { note: 'E', octave: 3, yPosition: 1 },    // E3 (space)
                { note: 'F', octave: 3, yPosition: 2 },    // F3 (4th line - where clef dots are)
                { note: 'G', octave: 3, yPosition: 3 },    // G3 (space)
                { note: 'A', octave: 3, yPosition: 4 },    // A3 (top line)
                { note: 'B', octave: 3, yPosition: 5 },    // B3 (space above)
                { note: 'C', octave: 4, yPosition: 6 },    // C4 (ledger line above)
                { note: 'D', octave: 4, yPosition: 7 }     // D4 (space above ledger)
            );
        }

        const position = positions[Math.floor(Math.random() * positions.length)];
        return { clef, position };
    }

    private drawStaff(): void {
        if (!this.currentQuestion) return;

        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;

        // Clear canvas
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height);

        // Staff lines - top to bottom
        const staffY = height / 2;
        const lineSpacing = 20;
        const staffLeft = 100;
        const staffRight = width - 100;
        const clefExtension = 80; // Extend lines to the left for clef

        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;

        // Draw 5 staff lines (yPosition: 4=top line, 0=middle, -4=bottom line)
        for (let i = 4; i >= -4; i -= 2) {
            const y = staffY - i * (lineSpacing / 2);
            ctx.beginPath();
            ctx.moveTo(staffLeft - clefExtension, y);
            ctx.lineTo(staffRight, y);
            ctx.stroke();
        }

        // Draw clef
        ctx.font = 'bold 80px serif';
        ctx.fillStyle = '#000';
        if (this.currentQuestion.clef === 'G') {
            // G clef wraps around the G line (2nd line from bottom = yPosition -2)
            // The clef center should be at the G line
            const gLineY = staffY - (-2) * (lineSpacing / 2);
            ctx.fillText('𝄞', staffLeft - 60, gLineY + 15);
        } else {
            // F clef dots straddle the F line (4th line from bottom = yPosition 2)
            // The clef center should be at the F line
            const fLineY = staffY - 2 * (lineSpacing / 2);
            ctx.fillText('𝄢', staffLeft - 60, fLineY + 45);
        }

        // Draw note
        const noteX = width / 2;
        const yPos = this.currentQuestion.position.yPosition;
        // Convert yPosition to pixel position (positive yPos = higher on staff)
        const noteY = staffY - yPos * (lineSpacing / 2);

        // Draw ledger lines if needed
        // Below staff (yPos < -4)
        if (yPos <= -5) {
            // Draw ledger lines for positions -6, -8, -10, etc.
            const startLine = -6;
            const endLine = Math.floor(yPos / 2) * 2; // Round down to nearest even number
            for (let i = startLine; i >= endLine; i -= 2) {
                const y = staffY - i * (lineSpacing / 2);
                ctx.beginPath();
                ctx.moveTo(noteX - 20, y);
                ctx.lineTo(noteX + 20, y);
                ctx.stroke();
            }
        }
        // Above staff (yPos > 4)
        if (yPos >= 5) {
            // Draw ledger lines for positions 6, 8, 10, etc.
            const startLine = 6;
            const endLine = Math.ceil(yPos / 2) * 2; // Round up to nearest even number
            for (let i = startLine; i <= endLine; i += 2) {
                const y = staffY - i * (lineSpacing / 2);
                ctx.beginPath();
                ctx.moveTo(noteX - 20, y);
                ctx.lineTo(noteX + 20, y);
                ctx.stroke();
            }
        }

        // Draw note head (filled circle)
        ctx.beginPath();
        ctx.ellipse(noteX, noteY, 12, 9, -0.3, 0, 2 * Math.PI);
        ctx.fillStyle = '#000';
        ctx.fill();

        // Draw stem
        ctx.lineWidth = 2;
        ctx.beginPath();
        if (yPos >= 0) {
            // Stem down for notes on or above middle line
            ctx.moveTo(noteX - 10, noteY);
            ctx.lineTo(noteX - 10, noteY + 35);
        } else {
            // Stem up for notes below middle line
            ctx.moveTo(noteX + 10, noteY);
            ctx.lineTo(noteX + 10, noteY - 35);
        }
        ctx.stroke();
    }

    private checkAnswer(selectedNote: NoteLetter): void {
        if (this.answered || !this.currentQuestion) return;

        this.answered = true;
        this.stop();

        const correctNote = this.currentQuestion.position.note;
        const isCorrect = selectedNote === correctNote;

        if (isCorrect) {
            this.streak++;
            this.streakCountEl.textContent = this.streak.toString();

            // Check if player won (10 correct in a row)
            if (this.streak >= 10) {
                this.feedbackEl.textContent = '🏆 Bravo tu as gagné ! 🏆';
                this.feedbackEl.className = 'feedback correct victory';

                // Highlight correct button
                this.noteButtons.forEach(btn => {
                    if (btn.getAttribute('data-note') === correctNote) {
                        btn.classList.add('correct');
                    }
                });

                // Reset and start new game after 3 seconds
                setTimeout(() => {
                    this.resetGame();
                }, 3000);
            } else {
                this.feedbackEl.textContent = '✓ Correct !';
                this.feedbackEl.className = 'feedback correct';

                // Highlight correct button
                this.noteButtons.forEach(btn => {
                    if (btn.getAttribute('data-note') === correctNote) {
                        btn.classList.add('correct');
                    }
                });

                // Next question after 2 seconds
                setTimeout(() => {
                    this.newQuestion();
                }, 2000);
            }
        } else {
            // Reset streak on error
            this.streak = 0;
            this.streakCountEl.textContent = this.streak.toString();

            const correctNoteFr = noteToFrench[correctNote];
            const selectedNoteFr = noteToFrench[selectedNote];
            this.feedbackEl.textContent = `✗ Incorrect. C'était ${correctNoteFr}, pas ${selectedNoteFr}`;
            this.feedbackEl.className = 'feedback incorrect';

            // Highlight buttons
            this.noteButtons.forEach(btn => {
                const note = btn.getAttribute('data-note');
                if (note === selectedNote) {
                    btn.classList.add('incorrect');
                }
                if (note === correctNote) {
                    btn.classList.add('correct');
                }
            });

            // Next question after 2 seconds
            setTimeout(() => {
                this.newQuestion();
            }, 2000);
        }
    }

    private timeUp(): void {
        if (this.answered || !this.currentQuestion) return;

        this.answered = true;
        this.stop();

        // Reset streak on timeout
        this.streak = 0;
        this.streakCountEl.textContent = this.streak.toString();

        const correctNote = this.currentQuestion.position.note;
        const correctNoteFr = noteToFrench[correctNote];

        this.feedbackEl.textContent = `⏱ Temps écoulé ! C'était ${correctNoteFr}`;
        this.feedbackEl.className = 'feedback incorrect';

        // Highlight correct button
        this.noteButtons.forEach(btn => {
            if (btn.getAttribute('data-note') === correctNote) {
                btn.classList.add('correct');
            }
        });

        // Next question after 2 seconds
        setTimeout(() => {
            this.newQuestion();
        }, 2000);
    }

    private resetGame(): void {
        this.streak = 0;
        this.streakCountEl.textContent = this.streak.toString();
        this.newQuestion();
    }
}
