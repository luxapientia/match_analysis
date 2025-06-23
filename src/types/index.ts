/** Root level match data mapping */
export interface MatchData {
  [matchId: string]: Match;
}

/** Individual match information */
export interface Match {
  id: string;
  stats_updated_at: string;
  league: League;
  home: Team;
  away: Team;
  favorite: number;
  date: string;
  timer: Timer;
  history: {
    home: HistoryMatch[];
    away: HistoryMatch[];
    h2h: HistoryMatch[];
    summary: {
      [key: string]: any;
    };
  };
  stadium: {
    name: string;
    capacity: string;
    city: string;
    country: string;
  };
  premium: boolean;
  v: number;
  score: [number, number];
  stats: {
    attacks: [number, number];
    dangerous_attacks: [number, number];
    off_target: [number, number];
    on_target: [number, number];
    corners: [number, number];
    goals: [number, number];
    penalties: [number, number];
    redcards: [number, number];
    yellowcards: [number, number];
    possession: [number, number];
    momentum: [number, number];
    xg: [number | null, number | null];
  };
  stats_trend: {
    attacks: { [key: string]: [number, number] };
    dangerous_attacks: { [key: string]: [number, number] };
    off_target: { [key: string]: [number, number] };
    on_target: { [key: string]: [number, number] };
    corners: { [key: string]: [number, number] };
    goals: { [key: string]: [number, number] };
    penalties: { [key: string]: [number, number] };
    redcards: { [key: string]: [number, number] };
    yellowcards: { [key: string]: [number, number] };
    possession: { [key: string]: [number, number] };
    momentum: { [key: string]: [number, number] };
    xg: { [key: string]: [number | null, number | null] };
  };
  odds: {
    [key: string]: Odds;
  };
  odds_trend: {
    [type: string]: {
      [minute: string]: Odds;
    };
  };
  goal_history: {
    team: number;
    min: number;
    score: [number, number];
  }[];
  odds_pm: {
    [key: string]: Odds;
  };
  stats_ht: {
    attacks: [number, number];
    dangerous_attacks: [number, number];
    off_target: [number, number];
    on_target: [number, number];
    corners: [number, number];
    goals: [number, number];
    penalties: [number, number];
    redcards: [number, number];
    substitutions: [number, number];
    yellowcards: [number, number];
    ball_safe: [number, number];
    injuries: [number, number];
  };
  bkc: {
    bfex: Record<string, any>;
  };
  league_table: {
    overall: Record<string, any>;
  };
  season: {
    name: string;
    date_start: string;
    date_end: string;
    round: string;
    max_rounds: string;
  };
  pv: number;
}

/** League information */
export interface League {
  id: string;
  name: string;
  cc: string;
  home_pos: string;
  away_pos: string;
  round: string;
}

/** Team information */
export interface Team {
  id: string;
  name: string;
  cc: string;
  image_id: string;
  avg_player_age: number;
  market_value: number;
  foreigners: number;
  national_team_players: number;
  youth_national_team_players: number;
  form: string[];
  formation: string;
  manager: {
    name: string;
    [key: string]: any;
  };
}

/** Match timer information */
export interface Timer {
  status: number;
  stage: number;
  live: boolean;
  min: number;
  ext: number;
}

/** Historical match information */
export interface HistoryMatch {
  league: League;
  home: Team;
  away: Team;
  time: string;
  score: [number, number];
  score_ht: [number, number];
  stats: {
    corners: [number, number];
    corners_ht: [number, number];
  };
}

export interface Odds {
  suspended: boolean;
  ss: string;
  odd_home: number;
  odd_draw: number;
  odd_away: number;
  odd_over: number;
  odd_under: number;
  handicap: string;
  curr_line: boolean;
}

export interface ScheduleMatch {
  time: string;
  timeUTC: string;
  timeFromNow: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
}

export interface ScheduleData {
  matches: ScheduleMatch[];
  timestamp: number;
}
