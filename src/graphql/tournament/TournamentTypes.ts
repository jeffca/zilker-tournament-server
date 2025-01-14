import { gql } from 'apollo-server';
import { DocumentNode } from 'graphql';
import { Match, MatchWithUserInfo } from '../match/MatchTypes';

export enum TournamentStatus {
  created = 'created',
  active = 'active',
  completed = 'completed'
}

export enum EPairingAlgorithm {
  Swiss = 'swiss',
  Rating = 'rating'
}

export type Standing = {
  _id: string;
  userId: string;
  position: number;
  score: number;
  win: number;
  loss: number;
  draw: number;
  bye: number;
};

export type Round = {
  _id: string;
  completed: boolean;
  matches: Match[];
};

export type RoundWithUserInfo = {
  _id: string;
  completed: boolean;
  matches: MatchWithUserInfo[];
};

export type RoundPreview = {
  _id: string;
  completed: boolean;
  matches: string[];
};

interface IConfig {
  totalRounds: number;
  performanceWeight: number;
  maxPunchDown: number;
}

export type Tournament = {
  _id: string;
  name: string;
  date: Date;
  status: TournamentStatus;
  players: string[];
  rounds: RoundPreview[];
  tiebreakSeed: number;
  config: IConfig;
  standings: Standing[];
  pairingAlgorithm: string;
  isDeleted: boolean;
};

const TournamentType: DocumentNode = gql`
  scalar Date

  type JoinTournamentResult {
    tournamentId: String!
  }

  type TournamentUpdateResult {
    tournament: Tournament!
    newRound: Boolean!
  }

  enum MatchResult {
    whiteWon
    blackWon
    draw
    didNotStart
  }

  enum TournamentStatus {
    created
    active
    completed
  }

  enum PairingAlgorithm {
    swiss
    rating
  }

  type Config {
    totalRounds: Int!
    performanceWeight: Int!
    maxPunchDown: Int!
  }

  type Standing {
    _id: ID!
    userId: String!
    position: Int!
    score: Float!
    win: Int!
    loss: Int!
    draw: Int!
    bye: Int!
  }

  type RoundPreview {
    _id: ID!
    completed: Boolean!
    matches: [String!]!
  }

  type Tournament {
    _id: String!
    name: String!
    date: Date!
    status: TournamentStatus!
    players: [String!]!
    rounds: [RoundPreview!]!
    config: Config!
    standings: [Standing!]!
    isDeleted: Boolean!
    pairingAlgorithm: PairingAlgorithm!
    location: String
  }
`;

export default TournamentType;
