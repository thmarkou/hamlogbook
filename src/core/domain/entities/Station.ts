import { GridSquare } from '../value-objects/GridSquare';

export interface Station {
  id: string;
  name: string;
  location: GridSquare;
  equipment?: string;
  antenna?: string;
  power?: number; // in watts
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateStationInput {
  name: string;
  location: string; // Grid square
  equipment?: string;
  antenna?: string;
  power?: number;
  isDefault?: boolean;
}

export function createStation(input: CreateStationInput, id: string): Station {
  const now = new Date();
  return {
    id,
    name: input.name,
    location: GridSquare.create(input.location),
    equipment: input.equipment,
    antenna: input.antenna,
    power: input.power,
    isDefault: input.isDefault || false,
    createdAt: now,
    updatedAt: now,
  };
}

