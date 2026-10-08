import type { QuestionSet, Question } from '@/types';

function q(
  id: string,
  setId: string,
  text: string,
  options: string[],
  correctOptionIndex: number,
  timeLimitSeconds = 15,
  imageUrl?: string,
): Question {
  return { id, setId, text, imageUrl, options, correctOptionIndex, timeLimitSeconds };
}

export const SAMPLE_SETS: QuestionSet[] = [
  {
    id: 'set-quant-1',
    title: 'Quantitative Aptitude — Speed & Accuracy',
    topic: 'Quant',
    difficulty: 'Medium',
    createdById: 'host-1',
    questions: [
      q('q1', 'set-quant-1', 'A train 150m long passes a pole in 6 seconds. What is its speed in km/h?',
        ['72 km/h', '90 km/h', '60 km/h', '108 km/h'], 1),
      q('q2', 'set-quant-1', 'If the ratio of two numbers is 3:5 and their sum is 144, what is the larger number?',
        ['54', '72', '90', '96'], 2),
      q('q3', 'set-quant-1', 'A shopkeeper marks goods 40% above cost and gives a 10% discount. What is his profit %?',
        ['26%', '30%', '28%', '24%'], 0),
      q('q4', 'set-quant-1', 'A can do a job in 12 days, B in 18 days. Working together, how many days will they take?',
        ['7.2 days', '6.5 days', '5.4 days', '8.1 days'], 0),
      q('q5', 'set-quant-1', 'What is the next number: 2, 6, 12, 20, 30, ?',
        ['40', '42', '44', '46'], 1),
    ],
  },
  {
    id: 'set-logical-1',
    title: 'Logical Reasoning — Pattern Recognition',
    topic: 'Logical',
    difficulty: 'Hard',
    createdById: 'host-1',
    questions: [
      q('q6', 'set-logical-1', 'Complete the series: BD, FH, JL, NP, ?',
        ['PR', 'RT', 'QS', 'SU'], 1),
      q('q7', 'set-logical-1', 'If PAPER = QCTGT, then BOARD = ?',
        ['CPDSE', 'CPCSE', 'CPDTE', 'CQDSE'], 0),
      q('q8', 'set-logical-1', 'Pointing to a man, a woman said, "His mother is the only daughter of my mother." How is the woman related to the man?',
        ['Mother', 'Aunt', 'Sister', 'Grandmother'], 0),
      q('q9', 'set-logical-1', 'In a row of 25 students, Amit is 12th from the left. What is his position from the right?',
        ['13th', '14th', '15th', '16th'], 1),
      q('q10', 'set-logical-1', 'If all cats are dogs, and some dogs are pets, which conclusion follows?',
        ['All cats are pets', 'Some cats are pets', 'No cats are pets', 'Cannot be determined'], 3),
    ],
  },
  {
    id: 'set-verbal-1',
    title: 'Verbal Ability — Comprehension & Vocabulary',
    topic: 'Verbal',
    difficulty: 'Easy',
    createdById: 'host-1',
    questions: [
      q('q11', 'set-verbal-1', 'Choose the synonym of "Ephemeral":',
        ['Eternal', 'Short-lived', 'Powerful', 'Mysterious'], 1),
      q('q12', 'set-verbal-1', 'Fill in: "Despite the warning, he remained ____ about the risks."',
        ['oblivious', 'cognizant', 'vigilant', 'apprehensive'], 0),
      q('q13', 'set-verbal-1', 'Choose the correctly spelled word:',
        ['Accomodation', 'Acommodation', 'Accommodation', 'Acomodation'], 2),
      q('q14', 'set-verbal-1', 'What is the antonym of "Lucid"?',
        ['Clear', 'Confused', 'Bright', 'Transparent'], 1),
      q('q15', 'set-verbal-1', 'Identify the figure of speech: "The wind whispered through the trees."',
        ['Simile', 'Metaphor', 'Personification', 'Hyperbole'], 2),
    ],
  },
  {
    id: 'set-di-1',
    title: 'Data Interpretation — Charts & Tables',
    topic: 'DI',
    difficulty: 'Medium',
    createdById: 'host-1',
    questions: [
      q('q16', 'set-di-1', 'A company\'s sales: Q1=40, Q2=60, Q3=80, Q4=120 (in millions). Avg quarterly sales?',
        ['70M', '75M', '80M', '85M'], 1),
      q('q17', 'set-di-1', 'If revenue grows 20% annually from 100M, what is revenue after 2 years?',
        ['120M', '140M', '144M', '150M'], 2),
      q('q18', 'set-di-1', 'In a pie chart, a sector covers 72°. What percentage does it represent?',
        ['18%', '20%', '22%', '25%'], 1),
      q('q19', 'set-di-1', 'A dataset: 5,10,15,20,25. What is the median?',
        ['10', '15', '20', '12'], 1),
      q('q20', 'set-di-1', 'If expenditure is 80% of income, savings ratio is:',
        ['1:4', '1:5', '2:8', '1:3'], 0),
    ],
  },
];

export const SAMPLE_COLLEGES = [
  { id: 'col-1', name: 'IIT Bombay', code: 'IITB' },
  { id: 'col-2', name: 'BITS Pilani', code: 'BITS' },
  { id: 'col-3', name: 'NIT Trichy', code: 'NITT' },
  { id: 'col-4', name: 'VIT Vellore', code: 'VITV' },
  { id: 'col-5', name: 'SRM Chennai', code: 'SRMC' },
];

export const DEFAULT_SET = SAMPLE_SETS[0];

export function getSetById(id: string): QuestionSet | undefined {
  return SAMPLE_SETS.find(s => s.id === id);
}
