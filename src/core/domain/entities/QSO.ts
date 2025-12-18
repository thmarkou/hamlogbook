import { Callsign } from '../value-objects/Callsign';
import { Band, BandName } from '../value-objects/Band';
import { Mode, ModeName } from '../value-objects/Mode';
import { RST } from '../value-objects/RST';
import { GridSquare } from '../value-objects/GridSquare';

export type QSOSource = 'manual' | 'dx-cluster' | 'cat-control';

export interface QSOMetadata {
  source: QSOSource;
  synced: boolean;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContestInfo {
  contestName: string;
  exchangeSent?: string;
  exchangeReceived?: string;
  serialNumber?: number;
}

export interface QSO {
  id: string;
  timestamp: Date; // UTC
  callsign: Callsign;
  band: BandName;
  mode: ModeName;
  rstSent: RST;
  rstReceived: RST;
  frequency?: number; // in MHz
  gridSquare?: GridSquare;
  operator?: string; // Operator callsign if different from station
  station?: string; // Station identifier
  notes?: string;
  qslSent?: boolean;
  qslReceived?: boolean;
  contestInfo?: ContestInfo;
  metadata: QSOMetadata;
}

export interface CreateQSOInput {
  callsign: string;
  band: BandName;
  mode: ModeName;
  rstSent: { readability: number; strength: number; tone?: number };
  rstReceived: { readability: number; strength: number; tone?: number };
  frequency?: number;
  gridSquare?: string;
  operator?: string;
  station?: string;
  notes?: string;
  contestInfo?: ContestInfo;
  timestamp?: Date;
}

export function createQSO(input: CreateQSOInput, id: string): QSO {
  const now = new Date();
  return {
    id,
    timestamp: input.timestamp || now,
    callsign: Callsign.create(input.callsign),
    band: input.band,
    mode: input.mode,
    rstSent: RST.create(
      input.rstSent.readability,
      input.rstSent.strength,
      input.rstSent.tone
    ),
    rstReceived: RST.create(
      input.rstReceived.readability,
      input.rstReceived.strength,
      input.rstReceived.tone
    ),
    frequency: input.frequency,
    gridSquare: input.gridSquare ? GridSquare.create(input.gridSquare) : undefined,
    operator: input.operator,
    station: input.station,
    notes: input.notes,
    qslSent: false,
    qslReceived: false,
    contestInfo: input.contestInfo,
    metadata: {
      source: 'manual',
      synced: false,
      version: 1,
      createdAt: now,
      updatedAt: now,
    },
  };
}

