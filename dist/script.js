import { QuinteurGame } from './quinteurGame.js';
import { NoteReadingGame } from './noteReadingGame.js';
import { TimeSignatureGame } from './timeSignatureGame.js';
// Initialize games
new QuinteurGame();
const noteReadingGame = new NoteReadingGame();
const timeSignatureGame = new TimeSignatureGame();
// Tab switching
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
        // Start/stop games based on active tab
        if (targetTab === 'notes') {
            noteReadingGame.start();
            timeSignatureGame.stop();
        }
        else if (targetTab === 'time-signatures') {
            noteReadingGame.stop();
            timeSignatureGame.start();
        }
        else {
            noteReadingGame.stop();
            timeSignatureGame.stop();
        }
    });
});
