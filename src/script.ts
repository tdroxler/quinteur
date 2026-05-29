type NoteLetter = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B';
type Accidental = '' | '#' | 'b' | '##' | 'bb';
type Direction = 'ascendante' | 'descendante';
type Quality = 'juste' | 'augmentée' | 'diminuée';

interface NoteWithAccidental {
    letter: NoteLetter;
    accidental: Accidental;
}

interface Question {
    note: NoteWithAccidental;
    direction: Direction;
    quality: Quality;
    answer: NoteWithAccidental;
}

interface GameState {
    currentQuestion: Question | null;
    correctCount: number;
    totalCount: number;
    answered: boolean;
}

const naturalNotes: NoteLetter[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

const noteToFrench: Record<string, string> = {
    'C': 'Do',
    'C#': 'Do#',
    'C##': 'Do𝄪',
    'Db': 'Réb',
    'Dbb': 'Ré𝄫',
    'D': 'Ré',
    'D#': 'Ré#',
    'D##': 'Ré𝄪',
    'Eb': 'Mib',
    'Ebb': 'Mi𝄫',
    'E': 'Mi',
    'E#': 'Mi#',
    'E##': 'Mi𝄪',
    'F': 'Fa',
    'F#': 'Fa#',
    'F##': 'Fa𝄪',
    'Fb': 'Fab',
    'Fbb': 'Fa𝄫',
    'G': 'Sol',
    'G#': 'Sol#',
    'G##': 'Sol𝄪',
    'Gb': 'Solb',
    'Gbb': 'Sol𝄫',
    'A': 'La',
    'A#': 'La#',
    'A##': 'La𝄪',
    'Ab': 'Lab',
    'Abb': 'La𝄫',
    'B': 'Si',
    'B#': 'Si#',
    'B##': 'Si𝄪',
    'Bb': 'Sib',
    'Bbb': 'Si𝄫',
    'Cb': 'Dob',
    'Cbb': 'Do𝄫'
};

// Convert note to semitone value (C = 0, C# = 1, etc.)
function noteToSemitone(note: NoteWithAccidental): number {
    const baseValues: Record<NoteLetter, number> = {
        'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11
    };
    let semitone = baseValues[note.letter];
    if (note.accidental === '#') semitone += 1;
    if (note.accidental === 'b') semitone -= 1;
    if (note.accidental === '##') semitone += 2;
    if (note.accidental === 'bb') semitone -= 2;
    return ((semitone % 12) + 12) % 12;
}

// Convert semitone + letter to note with accidental
function semitoneToNote(semitone: number, targetLetter: NoteLetter): NoteWithAccidental {
    const baseValues: Record<NoteLetter, number> = {
        'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11
    };

    semitone = ((semitone % 12) + 12) % 12;
    const baseValue = baseValues[targetLetter];
    const diff = ((semitone - baseValue + 12) % 12);

    if (diff === 0) return { letter: targetLetter, accidental: '' };
    if (diff === 1) return { letter: targetLetter, accidental: '#' };
    if (diff === 2) return { letter: targetLetter, accidental: '##' };
    if (diff === 11) return { letter: targetLetter, accidental: 'b' };
    if (diff === 10) return { letter: targetLetter, accidental: 'bb' };

    // Shouldn't happen for fifths
    return { letter: targetLetter, accidental: '' };
}

function calculateFifth(note: NoteWithAccidental, direction: Direction, quality: Quality): NoteWithAccidental {
    const letterIndex = naturalNotes.indexOf(note.letter);

    // Calculate the target letter (5th interval = 4 steps)
    let targetLetterIndex: number;
    if (direction === 'ascendante') {
        targetLetterIndex = (letterIndex + 4) % 7;
    } else {
        targetLetterIndex = ((letterIndex - 4) + 7) % 7;
    }
    const targetLetter = naturalNotes[targetLetterIndex];

    // Calculate semitones
    let semitones: number;
    if (direction === 'ascendante') {
        if (quality === 'juste') {
            semitones = 7;
        } else if (quality === 'augmentée') {
            semitones = 8;
        } else { // diminuée
            semitones = 6;
        }
    } else { // descendante
        if (quality === 'juste') {
            semitones = -7;
        } else if (quality === 'augmentée') {
            semitones = -8;
        } else { // diminuée
            semitones = -6;
        }
    }

    const startSemitone = noteToSemitone(note);
    const resultSemitone = ((startSemitone + semitones) % 12 + 12) % 12;

    return semitoneToNote(resultSemitone, targetLetter);
}

// Helper to convert note to string representation
function noteToString(note: NoteWithAccidental): string {
    return note.letter + note.accidental;
}

function generateQuestion(): Question {
    const letter = naturalNotes[Math.floor(Math.random() * naturalNotes.length)];
    const accidentalRand = Math.random();
    let accidental: Accidental = '';

    // 70% natural, 15% sharp, 15% flat
    if (accidentalRand > 0.85) {
        accidental = '#';
    } else if (accidentalRand > 0.70) {
        accidental = 'b';
    }

    const note: NoteWithAccidental = { letter, accidental };
    const direction: Direction = Math.random() > 0.5 ? 'ascendante' : 'descendante';
    const qualityRand = Math.random();
    let quality: Quality;

    if (qualityRand < 0.6) {
        quality = 'juste';
    } else if (qualityRand < 0.8) {
        quality = 'augmentée';
    } else {
        quality = 'diminuée';
    }

    const answer = calculateFifth(note, direction, quality);

    return { note, direction, quality, answer };
}

class QuinteurGame {
    private state: GameState = {
        currentQuestion: null,
        correctCount: 0,
        totalCount: 0,
        answered: false
    };

    private selectedLetter: NoteLetter | null = null;
    private selectedAccidental: Accidental = '';

    private questionEl: HTMLElement;
    private feedbackEl: HTMLElement;
    private correctCountEl: HTMLElement;
    private totalCountEl: HTMLElement;
    private submitBtn: HTMLButtonElement;
    private nextBtn: HTMLButtonElement;
    private noteButtons: NodeListOf<HTMLElement>;
    private accidentalButtons: NodeListOf<HTMLElement>;

    constructor() {
        this.questionEl = document.getElementById('question')!;
        this.feedbackEl = document.getElementById('feedback')!;
        this.correctCountEl = document.getElementById('correct-count')!;
        this.totalCountEl = document.getElementById('total-count')!;
        this.submitBtn = document.getElementById('submit-btn') as HTMLButtonElement;
        this.nextBtn = document.getElementById('next-btn') as HTMLButtonElement;
        this.noteButtons = document.querySelectorAll('.note-btn');
        this.accidentalButtons = document.querySelectorAll('.accidental-btn');

        this.setupEventListeners();
        this.newQuestion();
    }

    private setupEventListeners(): void {
        this.noteButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const letter = btn.getAttribute('data-letter') as NoteLetter;
                this.selectNote(letter);
            });
        });

        this.accidentalButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const accidental = btn.getAttribute('data-accidental') as Accidental;
                this.selectAccidental(accidental);
            });
        });

        this.submitBtn.addEventListener('click', () => this.checkAnswer());
        this.nextBtn.addEventListener('click', () => this.newQuestion());
    }

    private selectNote(letter: NoteLetter): void {
        if (this.state.answered) return;

        this.selectedLetter = letter;

        // Update UI
        this.noteButtons.forEach(btn => {
            if (btn.getAttribute('data-letter') === letter) {
                btn.classList.add('selected');
            } else {
                btn.classList.remove('selected');
            }
        });
    }

    private selectAccidental(accidental: Accidental): void {
        if (this.state.answered) return;


        // Toggle: if clicking the same accidental, deselect it
        if (this.selectedAccidental === accidental) {
            this.selectedAccidental = '';
        } else {
            this.selectedAccidental = accidental;
        }


        // Update UI
        this.accidentalButtons.forEach(btn => {
            const btnAccidental = btn.getAttribute('data-accidental');
            if (btnAccidental === this.selectedAccidental) {
                btn.classList.add('selected');
            } else {
                btn.classList.remove('selected');
            }
        });
    }

    private newQuestion(): void {
        this.state.currentQuestion = generateQuestion();
        this.state.answered = false;
        this.selectedLetter = null;
        this.selectedAccidental = '';

        const { note, direction, quality } = this.state.currentQuestion;
        const noteStr = noteToString(note);
        const noteFr = noteToFrench[noteStr];

        this.questionEl.textContent = `Quelle est la quinte ${quality} ${direction} de ${noteFr} ?`;
        this.feedbackEl.textContent = '';
        this.feedbackEl.className = 'feedback';
        this.nextBtn.style.display = 'none';
        this.submitBtn.style.display = 'block';

        // Reset button states
        this.noteButtons.forEach(btn => {
            btn.classList.remove('selected', 'correct', 'incorrect');
        });
        this.accidentalButtons.forEach(btn => {
            btn.classList.remove('selected', 'correct', 'incorrect');
        });
    }

    private checkAnswer(): void {
        if (this.state.answered || !this.state.currentQuestion || this.selectedLetter === null) return;

        this.state.answered = true;
        this.state.totalCount++;
        this.totalCountEl.textContent = this.state.totalCount.toString();

        const { note, direction, quality, answer } = this.state.currentQuestion;
        const noteStr = noteToString(note);
        const answerStr = noteToString(answer);
        const noteFr = noteToFrench[noteStr];
        const answerFr = noteToFrench[answerStr];

        const selectedNote: NoteWithAccidental = {
            letter: this.selectedLetter,
            accidental: this.selectedAccidental
        };
        const selectedStr = noteToString(selectedNote);
        const selectedFr = noteToFrench[selectedStr];

        // Safety check - if note not in lookup, construct it manually
        if (!selectedFr) {
            return; // Skip checking if we have an invalid note
        }

        // Check if the answer is correct (exact match)
        const isCorrect = answer.letter === selectedNote.letter && answer.accidental === selectedNote.accidental;

        if (isCorrect) {
            this.state.correctCount++;
            this.correctCountEl.textContent = this.state.correctCount.toString();
            this.feedbackEl.textContent = `✓ Correct ! La quinte ${quality} ${direction} de ${noteFr} est ${answerFr}`;
            this.feedbackEl.className = 'feedback correct';

            // Highlight correct buttons
            this.noteButtons.forEach(btn => {
                if (btn.getAttribute('data-letter') === answer.letter) {
                    btn.classList.add('correct');
                    btn.classList.remove('selected');
                }
            });
            this.accidentalButtons.forEach(btn => {
                if (btn.getAttribute('data-accidental') === answer.accidental) {
                    btn.classList.add('correct');
                    btn.classList.remove('selected');
                }
            });
        } else {
            this.feedbackEl.textContent = `✗ Incorrect. La quinte ${quality} ${direction} de ${noteFr} est ${answerFr}, pas ${selectedFr}`;
            this.feedbackEl.className = 'feedback incorrect';

            // Highlight incorrect selection
            this.noteButtons.forEach(btn => {
                if (btn.getAttribute('data-letter') === selectedNote.letter) {
                    btn.classList.add('incorrect');
                    btn.classList.remove('selected');
                }
                if (btn.getAttribute('data-letter') === answer.letter) {
                    btn.classList.add('correct');
                }
            });
            this.accidentalButtons.forEach(btn => {
                if (btn.getAttribute('data-accidental') === selectedNote.accidental) {
                    btn.classList.add('incorrect');
                    btn.classList.remove('selected');
                }
                if (btn.getAttribute('data-accidental') === answer.accidental) {
                    btn.classList.add('correct');
                }
            });
        }

        this.submitBtn.style.display = 'none';
        this.nextBtn.style.display = 'block';
    }
}

// Initialize the game
new QuinteurGame();

// Note Reading Exercise
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

class NoteReadingGame {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private currentQuestion: NoteQuestion | null = null;
    private correctCount: number = 0;
    private totalCount: number = 0;
    private timer: number = 5;
    private timerInterval: number | null = null;
    private answered: boolean = false;

    private correctCountEl: HTMLElement;
    private totalCountEl: HTMLElement;
    private timerDisplayEl: HTMLElement;
    private feedbackEl: HTMLElement;
    private noteButtons: NodeListOf<HTMLElement>;

    constructor() {
        this.canvas = document.getElementById('staff-canvas') as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d')!;
        this.correctCountEl = document.getElementById('notes-correct-count')!;
        this.totalCountEl = document.getElementById('notes-total-count')!;
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
        this.totalCount++;
        this.totalCountEl.textContent = this.totalCount.toString();

        const correctNote = this.currentQuestion.position.note;
        const isCorrect = selectedNote === correctNote;

        if (isCorrect) {
            this.correctCount++;
            this.correctCountEl.textContent = this.correctCount.toString();
            this.feedbackEl.textContent = '✓ Correct !';
            this.feedbackEl.className = 'feedback correct';

            // Highlight correct button
            this.noteButtons.forEach(btn => {
                if (btn.getAttribute('data-note') === correctNote) {
                    btn.classList.add('correct');
                }
            });
        } else {
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
        }

        // Next question after 2 seconds
        setTimeout(() => {
            this.newQuestion();
        }, 2000);
    }

    private timeUp(): void {
        if (this.answered || !this.currentQuestion) return;

        this.answered = true;
        this.stop();
        this.totalCount++;
        this.totalCountEl.textContent = this.totalCount.toString();

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
}

// Tab switching
const noteReadingGame = new NoteReadingGame();

const tabButtons = document.querySelectorAll('.tab-btn');
const exercises = document.querySelectorAll('.exercise-content');

tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');

        // Update active tab button
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Update active exercise
        exercises.forEach(ex => ex.classList.remove('active'));
        const targetExercise = document.getElementById(`${targetTab}-exercise`);
        if (targetExercise) {
            targetExercise.classList.add('active');
        }

        // Start/stop note reading game based on active tab
        if (targetTab === 'notes') {
            noteReadingGame.start();
        } else {
            noteReadingGame.stop();
        }
    });
});
