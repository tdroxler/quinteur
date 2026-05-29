import { NoteLetter, Accidental, NoteWithAccidental, naturalNotes, noteToFrench } from './types.js';

type Direction = 'ascendante' | 'descendante';
type Quality = 'juste' | 'augmentée' | 'diminuée';

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

export class QuinteurGame {
    private state: GameState = {
        currentQuestion: null,
        correctCount: 0,
        totalCount: 0,
        answered: false
    };
    private streak: number = 0;

    private selectedLetter: NoteLetter | null = null;
    private selectedAccidental: Accidental = '';

    private questionEl: HTMLElement;
    private feedbackEl: HTMLElement;
    private correctCountEl: HTMLElement;
    private totalCountEl: HTMLElement;
    private streakCountEl: HTMLElement;
    private submitBtn: HTMLButtonElement;
    private nextBtn: HTMLButtonElement;
    private noteButtons: NodeListOf<HTMLElement>;
    private accidentalButtons: NodeListOf<HTMLElement>;

    constructor() {
        this.questionEl = document.getElementById('question')!;
        this.feedbackEl = document.getElementById('feedback')!;
        this.correctCountEl = document.getElementById('correct-count')!;
        this.totalCountEl = document.getElementById('total-count')!;
        this.streakCountEl = document.getElementById('streak-count')!;
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
            this.streak++;
            this.streakCountEl.textContent = this.streak.toString();

            // Check if player won (5 correct in a row)
            if (this.streak >= 5) {
                this.feedbackEl.textContent = '🏆 Bravo tu as gagné ! 🏆';
                this.feedbackEl.className = 'feedback correct victory';

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

                this.submitBtn.style.display = 'none';
                this.nextBtn.style.display = 'block';

                // Reset streak for next game
                this.streak = 0;
                this.streakCountEl.textContent = this.streak.toString();
            } else {
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

                this.submitBtn.style.display = 'none';
                this.nextBtn.style.display = 'block';
            }
        } else {
            // Reset streak on error
            this.streak = 0;
            this.streakCountEl.textContent = this.streak.toString();

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

            this.submitBtn.style.display = 'none';
            this.nextBtn.style.display = 'block';
        }
    }
}
