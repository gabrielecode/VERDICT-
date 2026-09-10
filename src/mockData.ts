import { Decision } from './types';

export const MOCK_DECISIONS: Decision[] = [
  {
    id: 'dec-1',
    title: 'Nuovo logo aziendale per il rebranding 2026',
    description: 'Siamo giunti alla fase finale di selezione per il rebranding dell\'identità aziendale. Abbiamo tre direzioni creative preparate dallo studio di design. Per favore, votate la vostra preferita considerando i nostri valori di innovazione, trasparenza e impatto.',
    type: 'single',
    category: 'Design',
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 36).toISOString(), // 36 hours from now
    audience: 'public',
    creator: {
      name: 'Gabriele Rossi',
      role: 'Creative Director',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces&q=80'
    },
    options: [
      { id: 'opt-1a', text: 'Opzione A: Monogramma Geometrico (Minimalista, moderno, focalizzato sulla tecnologia)', votes: 34 },
      { id: 'opt-1b', text: 'Opzione B: Logo Tipografico Serif (Elegante, solido, esprime tradizione e fiducia)', votes: 48 },
      { id: 'opt-1c', text: 'Opzione C: Simbolo Organico e Fluido (Dinamico, esprime adattabilità e sostenibilità)', votes: 12 }
    ],
    participants: [
      { name: 'Laura Bianchi', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces&q=80' },
      { name: 'Marco Valeri', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces&q=80' },
      { name: 'Elena Neri', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces&q=80' },
      { name: 'Stefano Verdi', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=faces&q=80' }
    ],
    comments: [
      {
        id: 'c-1',
        author: 'Laura Bianchi',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces&q=80',
        role: 'HR Manager',
        text: 'L\'Opzione B ha un aspetto incredibilmente raffinato ed istituzionale. Penso che trasmetta un grande senso di stabilità e serietà ai nostri clienti.',
        timestamp: '2026-06-25T14:32:00.000Z'
      },
      {
        id: 'c-2',
        author: 'Marco Valeri',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces&q=80',
        role: 'UI Designer',
        text: 'Voto assolutamente l\'Opzione A. È infinitamente più scalabile sui dispositivi digitali e l\'icona si adatta perfettamente alle icone delle app ed alle favicon moderne.',
        timestamp: '2026-06-25T15:10:00.000Z'
      },
      {
        id: 'c-3',
        author: 'Elena Neri',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces&q=80',
        role: 'Product Manager',
        text: 'Sono d\'accordo con Marco. L\'Opzione A rappresenta meglio la direzione futura dell\'azienda. L\'Opzione B sembra un po\' troppo retrograda per un brand Tech.',
        timestamp: '2026-06-25T16:45:00.000Z'
      }
    ],
    createdAt: '2026-06-25T10:00:00.000Z'
  },
  {
    id: 'dec-2',
    title: 'Adottare la settimana lavorativa corta (4 giorni)?',
    description: 'Vogliamo raccogliere il parere del team in merito all\'introduzione sperimentale della settimana lavorativa di 4 giorni (a parità di stipendio, con rimodulazione dell\'orario giornaliero a 9 ore, per un totale di 36 ore settimanali anziché 40).',
    type: 'yes_no',
    category: 'Cultura',
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 3.5).toISOString(), // 3.5 hours from now (Closing soon!)
    audience: 'public',
    creator: {
      name: 'Laura Bianchi',
      role: 'HR Manager',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces&q=80'
    },
    options: [
      { id: 'opt-2y', text: 'Sì, assolutamente favorevole (Preferisco 4 giorni intensi e 3 di riposo)', votes: 82 },
      { id: 'opt-2n', text: 'No, contrario (Temo che 9 ore al giorno siano troppo stancanti)', votes: 11 }
    ],
    participants: [
      { name: 'Gabriele Rossi', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces&q=80' },
      { name: 'Elena Neri', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces&q=80' },
      { name: 'Stefano Verdi', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=faces&q=80' }
    ],
    comments: [
      {
        id: 'c-4',
        author: 'Stefano Verdi',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=faces&q=80',
        role: 'Senior Developer',
        text: 'Tre giorni interi di stacco mentale cambierebbero radicalmente il livello di burnout nel nostro settore. Favorevolissimo a fare un test di 3 mesi!',
        timestamp: '2026-06-26T01:12:00.000Z'
      }
    ],
    createdAt: '2026-06-24T09:00:00.000Z'
  },
  {
    id: 'dec-3',
    title: 'Valutazione del nuovo layout della Dashboard di Verdict',
    description: 'Come giudicate l\'interfaccia utente proposta per la nuova dashboard? Fate riferimento ai mockup condivisi su Figma per quanto riguarda la densità informativa, i contrasti e l\'accessibilità generale.',
    type: 'rating',
    category: 'Design',
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 12).toISOString(), // 12 days from now
    audience: 'restricted',
    creator: {
      name: 'Marco Valeri',
      role: 'UI Designer',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces&q=80'
    },
    options: [
      { id: '1', text: '1 Stella', votes: 1 },
      { id: '2', text: '2 Stelle', votes: 2 },
      { id: '3', text: '3 Stelle', votes: 8 },
      { id: '4', text: '4 Stelle', votes: 24 },
      { id: '5', text: '5 Stelle', votes: 45 }
    ],
    participants: [
      { name: 'Gabriele Rossi', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces&q=80' },
      { name: 'Laura Bianchi', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces&q=80' },
      { name: 'Elena Neri', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces&q=80' }
    ],
    comments: [
      {
        id: 'c-5',
        author: 'Elena Neri',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces&q=80',
        role: 'Product Manager',
        text: 'Il layout è estremamente pulito e l\'uso dei micro-stati rende l\'interazione piacevole. Unica nota: forse dovremmo aumentare leggermente la dimensione del testo dei dettagli sui dispositivi mobili.',
        timestamp: '2026-06-25T18:30:00.000Z'
      }
    ],
    createdAt: '2026-06-25T08:00:00.000Z'
  },
  {
    id: 'dec-4',
    title: 'Scelta della destinazione per il Team Building Estivo',
    description: 'Sondaggio concluso per decidere dove trascorreremo i nostri tre giorni di team building a Luglio. Ciascuno poteva esprimere preferenze multiple.',
    type: 'multiple',
    category: 'Team',
    deadline: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // Expired 24 hours ago
    audience: 'public',
    creator: {
      name: 'Elena Neri',
      role: 'Product Manager',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces&q=80'
    },
    options: [
      { id: 'opt-4a', text: 'Ibiza, Spagna (Spiaggia, relax e vita notturna)', votes: 22 },
      { id: 'opt-4b', text: 'Chamonix, Alpi Francesi (Trekking, aria fresca e attività outdoor)', votes: 15 },
      { id: 'opt-4c', text: 'Costiera Amalfitana, Italia (Cultura, panorami mozzafiato e ottimo cibo)', votes: 31 }
    ],
    participants: [
      { name: 'Gabriele Rossi', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces&q=80' },
      { name: 'Laura Bianchi', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces&q=80' },
      { name: 'Marco Valeri', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces&q=80' },
      { name: 'Stefano Verdi', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=faces&q=80' }
    ],
    comments: [
      {
        id: 'c-6',
        author: 'Gabriele Rossi',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces&q=80',
        role: 'Creative Director',
        text: 'La Costiera Amalfitana stravince! Preparo la macchina fotografica. Grazie a tutti per aver votato!',
        timestamp: '2026-06-25T19:00:00.000Z'
      }
    ],
    createdAt: '2026-06-20T08:00:00.000Z'
  }
];
