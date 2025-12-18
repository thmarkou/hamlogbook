import { Callsign } from '../value-objects/Callsign';
import { GridSquare } from '../value-objects/GridSquare';

export interface Operator {
  id: string;
  callsign: Callsign;
  name?: string;
  country?: string;
  gridSquare?: GridSquare;
  qth?: string; // Location description
  email?: string;
  cachedAt?: Date; // When this data was fetched from API
}

export interface CreateOperatorInput {
  callsign: string;
  name?: string;
  country?: string;
  gridSquare?: string;
  qth?: string;
  email?: string;
}

export function createOperator(input: CreateOperatorInput, id: string): Operator {
  return {
    id,
    callsign: Callsign.create(input.callsign),
    name: input.name,
    country: input.country,
    gridSquare: input.gridSquare ? GridSquare.create(input.gridSquare) : undefined,
    qth: input.qth,
    email: input.email,
    cachedAt: new Date(),
  };
}

