export type NoteLetter = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B';
export type Accidental = '' | '#' | 'b' | '##' | 'bb';

export interface NoteWithAccidental {
    letter: NoteLetter;
    accidental: Accidental;
}

export const naturalNotes: NoteLetter[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

export const noteToFrench: Record<string, string> = {
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
