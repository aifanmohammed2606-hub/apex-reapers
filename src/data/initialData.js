export const ROLES = ['Jungle', 'Gold', 'Exp', 'Mid', 'Roam'];
export const FORMATS = ['BO1', 'BO3', 'BO5'];
export const STATUSES = ['Upcoming', 'Ongoing', 'Completed'];
export const TYPES = ['5vs5', '3vs3'];

export const initialPlayers = [
  { id: 'player_1', name: 'ShadowBlade', role: 'Jungle', secondaryRole: 'Exp', available: true, tournamentsPlayed: [], createdAt: new Date('2024-01-01').toISOString(), updatedAt: new Date('2024-01-01').toISOString() },
  { id: 'player_2', name: 'PhantomGold', role: 'Gold', secondaryRole: 'Mid', available: true, tournamentsPlayed: [], createdAt: new Date('2024-01-01').toISOString(), updatedAt: new Date('2024-01-01').toISOString() },
  { id: 'player_3', name: 'ReaperX', role: 'Exp', secondaryRole: 'Gold', available: true, tournamentsPlayed: [], createdAt: new Date('2024-01-01').toISOString(), updatedAt: new Date('2024-01-01').toISOString() },
  { id: 'player_4', name: 'VoidMage', role: 'Mid', secondaryRole: 'Roam', available: true, tournamentsPlayed: [], createdAt: new Date('2024-01-01').toISOString(), updatedAt: new Date('2024-01-01').toISOString() },
  { id: 'player_5', name: 'IronShield', role: 'Roam', secondaryRole: 'Jungle', available: true, tournamentsPlayed: [], createdAt: new Date('2024-01-01').toISOString(), updatedAt: new Date('2024-01-01').toISOString() },
];

export const initialTournaments = [
  {
    id: 'tournament_1',
    name: 'Shadow Cup Season 1',
    date: '2025-05-15',
    time: '18:00',
    format: 'BO3',
    type: '5vs5',
    prizePool: '₱5,000',
    status: 'Upcoming',
    availablePlayers: ['player_1', 'player_2', 'player_3', 'player_4', 'player_5'],
    lineup: { Jungle: '', Gold: '', Exp: '', Mid: '', Roam: '' },
    substitutes: [],
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
  },
];
