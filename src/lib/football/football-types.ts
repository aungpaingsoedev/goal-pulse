/**
 * Raw shapes returned by the Sportmonks Football API v3.
 * Fields are intentionally optional / loose where docs vary by include.
 */

export interface SportmonksPagination {
  count?: number;
  per_page?: number;
  current_page?: number;
  next_page?: string | null;
  has_more?: boolean;
}

export interface SportmonksResponse<T> {
  data: T;
  message?: string;
  subscription?: unknown[];
  rate_limit?: {
    resets_in_seconds?: number;
    remaining?: number;
    requested_entity?: string;
  };
  pagination?: SportmonksPagination;
  /** Present on some error payloads */
  errors?: Record<string, unknown> | string[] | string;
}

export interface SportmonksTypeRef {
  id?: number;
  name?: string;
  code?: string;
  developer_name?: string;
  model_type?: string;
  stat_group?: string | null;
}

export interface SportmonksState {
  id: number;
  state?: string;
  name?: string;
  short_name?: string;
  developer_name?: string;
}

export interface SportmonksCountry {
  id?: number;
  name?: string;
  image_path?: string | null;
  extra?: {
    continent?: string;
    sub_region?: string;
    world_region?: string;
    fifa?: string;
    iso?: string;
    iso2?: string;
  };
}

export interface SportmonksSeason {
  id: number;
  sport_id?: number;
  league_id?: number;
  tie_breaker_rule_id?: number | null;
  name?: string;
  finished?: boolean;
  pending?: boolean;
  is_current?: boolean;
  starting_at?: string | null;
  ending_at?: string | null;
  standings_recalculated_at?: string | null;
  games_in_current_week?: boolean;
}

export interface SportmonksLeague {
  id: number;
  sport_id?: number;
  country_id?: number;
  name?: string;
  active?: boolean;
  short_code?: string | null;
  image_path?: string | null;
  type?: string | null;
  sub_type?: string | null;
  last_played_at?: string | null;
  category?: number;
  has_jerseys?: boolean;
  country?: SportmonksCountry;
  currentSeason?: SportmonksSeason | null;
  current_season?: SportmonksSeason | null;
  seasons?: SportmonksSeason[];
}

export interface SportmonksVenue {
  id?: number;
  country_id?: number | null;
  city_id?: number | null;
  name?: string | null;
  address?: string | null;
  zipcode?: string | null;
  latitude?: string | null;
  longitude?: string | null;
  capacity?: number | null;
  image_path?: string | null;
  city_name?: string | null;
  surface?: string | null;
  national_team?: boolean;
}

export interface SportmonksParticipantMeta {
  location?: "home" | "away" | string;
  winner?: boolean | null;
  position?: number | null;
}

export interface SportmonksParticipant {
  id: number;
  sport_id?: number;
  country_id?: number | null;
  venue_id?: number | null;
  gender?: string;
  name: string;
  short_code?: string | null;
  image_path?: string | null;
  founded?: number | null;
  type?: string | null;
  placeholder?: boolean;
  last_played_at?: string | null;
  meta?: SportmonksParticipantMeta;
  country?: SportmonksCountry;
  venue?: SportmonksVenue;
}

export interface SportmonksTeam {
  id: number;
  sport_id?: number;
  country_id?: number | null;
  venue_id?: number | null;
  gender?: string;
  name: string;
  short_code?: string | null;
  image_path?: string | null;
  founded?: number | null;
  type?: string | null;
  placeholder?: boolean;
  last_played_at?: string | null;
  country?: SportmonksCountry;
  venue?: SportmonksVenue;
  players?: SportmonksPlayer[];
}

export interface SportmonksScoreValue {
  goals?: number | null;
  participant?: "home" | "away" | string;
}

export interface SportmonksScore {
  id?: number;
  fixture_id?: number;
  type_id?: number;
  participant_id?: number;
  score?: SportmonksScoreValue;
  description?: string;
  type?: SportmonksTypeRef;
}

export interface SportmonksPeriod {
  id?: number;
  fixture_id?: number;
  type_id?: number;
  started?: number | null;
  ended?: number | null;
  counts_from?: number;
  ticking?: boolean;
  sort_order?: number;
  description?: string;
  time_added?: number | null;
  period_length?: number | null;
  minutes?: number | null;
  seconds?: number | null;
  type?: SportmonksTypeRef;
}

export interface SportmonksEvent {
  id?: number;
  fixture_id?: number;
  period_id?: number | null;
  participant_id?: number | null;
  type_id?: number | null;
  player_id?: number | null;
  related_player_id?: number | null;
  player_name?: string | null;
  related_player_name?: string | null;
  result?: string | null;
  info?: string | null;
  addition?: string | null;
  minute?: number | null;
  extra_minute?: number | null;
  injured?: boolean | null;
  on_bench?: boolean | null;
  coach_id?: number | null;
  sub_type_id?: number | null;
  type?: SportmonksTypeRef;
  period?: SportmonksPeriod;
  player?: SportmonksPlayer | null;
  relatedplayer?: SportmonksPlayer | null;
  relatedPlayer?: SportmonksPlayer | null;
}

export interface SportmonksStatisticData {
  value?: number | string | null;
  [key: string]: unknown;
}

export interface SportmonksStatistic {
  id?: number;
  fixture_id?: number;
  type_id?: number;
  participant_id?: number;
  data?: SportmonksStatisticData | number | string | null;
  location?: "home" | "away" | string;
  type?: SportmonksTypeRef;
}

export interface SportmonksLineupPlayer {
  id?: number;
  sport_id?: number;
  country_id?: number | null;
  nationality_id?: number | null;
  city_id?: number | null;
  position_id?: number | null;
  detailed_position_id?: number | null;
  type_id?: number | null;
  common_name?: string | null;
  firstname?: string | null;
  lastname?: string | null;
  name?: string | null;
  display_name?: string | null;
  image_path?: string | null;
  height?: number | string | null;
  weight?: number | string | null;
  date_of_birth?: string | null;
  gender?: string | null;
}

export interface SportmonksLineup {
  id?: number;
  sport_id?: number;
  fixture_id?: number;
  player_id?: number;
  team_id?: number;
  position_id?: number | null;
  formation_position?: number | null;
  type_id?: number | null;
  jersey_number?: number | null;
  player_name?: string | null;
  player?: SportmonksLineupPlayer | null;
  type?: SportmonksTypeRef;
  position?: SportmonksTypeRef;
  detailedposition?: SportmonksTypeRef;
}

export interface SportmonksTvStation {
  id: number;
  name?: string;
  url?: string | null;
  image_path?: string | null;
  type?: string | null;
  related_id?: number | null;
}

/** Fixture ↔ TV station pivot when using include=tvStations.tvstation */
export interface SportmonksFixtureTvStation {
  id?: number;
  fixture_id?: number;
  tvstation_id?: number;
  country_id?: number | null;
  tvstation?: SportmonksTvStation;
  /** Some payloads flatten the station onto the pivot */
  name?: string;
  url?: string | null;
  image_path?: string | null;
}

export interface SportmonksPlayer {
  id: number;
  sport_id?: number;
  country_id?: number | null;
  nationality_id?: number | null;
  city_id?: number | null;
  position_id?: number | null;
  detailed_position_id?: number | null;
  type_id?: number | null;
  common_name?: string | null;
  firstname?: string | null;
  lastname?: string | null;
  name?: string | null;
  display_name?: string | null;
  image_path?: string | null;
  height?: number | string | null;
  weight?: number | string | null;
  date_of_birth?: string | null;
  gender?: string | null;
  country?: SportmonksCountry;
  nationality?: SportmonksCountry;
  position?: SportmonksTypeRef;
  teams?: Array<{
    id?: number;
    name?: string;
    image_path?: string | null;
    meta?: { jersey_number?: number | null };
  }>;
}

export interface SportmonksStandingDetail {
  id?: number;
  standing_type?: string;
  standing_id?: number;
  type_id?: number;
  value?: number | string | null;
  type?: SportmonksTypeRef;
}

export interface SportmonksStandingForm {
  id?: number;
  standing_type?: string;
  standing_id?: number;
  form?: string;
  sort_order?: number;
}

export interface SportmonksStanding {
  id: number;
  participant_id?: number;
  sport_id?: number;
  league_id?: number;
  season_id?: number;
  stage_id?: number | null;
  group_id?: number | null;
  round_id?: number | null;
  standing_rule_id?: number | null;
  position?: number;
  result?: string | null;
  points?: number;
  participant?: SportmonksParticipant | SportmonksTeam;
  details?: SportmonksStandingDetail[];
  form?: SportmonksStandingForm[] | string | null;
  rule?: {
    id?: number;
    model_type?: string;
    model_id?: number;
    type_id?: number;
    position?: number;
    type?: SportmonksTypeRef;
  };
}

export interface SportmonksTopscorer {
  id?: number;
  season_id?: number;
  player_id?: number;
  type_id?: number;
  position?: number;
  total?: number;
  participant_id?: number | null;
  player?: SportmonksPlayer;
  participant?: SportmonksTeam | SportmonksParticipant;
  type?: SportmonksTypeRef;
}

export interface SportmonksFixture {
  id: number;
  sport_id?: number;
  league_id?: number;
  season_id?: number;
  stage_id?: number | null;
  group_id?: number | null;
  aggregate_id?: number | null;
  round_id?: number | null;
  state_id?: number;
  venue_id?: number | null;
  name?: string;
  starting_at?: string;
  result_info?: string | null;
  leg?: string | null;
  details?: string | null;
  length?: number | null;
  placeholder?: boolean;
  has_odds?: boolean;
  starting_at_timestamp?: number;
  participants?: SportmonksParticipant[];
  scores?: SportmonksScore[];
  league?: SportmonksLeague;
  state?: SportmonksState;
  events?: SportmonksEvent[];
  periods?: SportmonksPeriod[];
  statistics?: SportmonksStatistic[];
  lineups?: SportmonksLineup[];
  venue?: SportmonksVenue;
  tvStations?: SportmonksFixtureTvStation[];
  referees?: Array<{
    id?: number;
    fixture_id?: number;
    referee_id?: number;
    type_id?: number;
    referee?: {
      id?: number;
      name?: string | null;
      common_name?: string | null;
      image_path?: string | null;
    };
  }>;
  round?: {
    id?: number;
    name?: string;
    finished?: boolean;
    is_current?: boolean;
  };
  season?: SportmonksSeason;
}
