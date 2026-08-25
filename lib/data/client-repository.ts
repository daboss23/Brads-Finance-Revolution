// One client list for the whole platform: real records (encrypted store)
// merged with the demo seed clients. Server-side only.

import { CLIENTS, type Client } from "@/lib/data";
import {
  listRealClients,
  getRealClient,
  toClient,
} from "@/lib/clients/real-client-store";

export async function listAllClients(): Promise<Client[]> {
  const real = await listRealClients();
  return [...real.map(toClient), ...CLIENTS];
}

export async function findClient(clientId: string): Promise<Client | null> {
  const real = await getRealClient(clientId);
  if (real) return toClient(real);
  return CLIENTS.find((client) => client.id === clientId) ?? null;
}

// Kept for existing callers of the mock repository shape.
export type ClientRepository = {
  listClients(): Client[];
  getClient(clientId: string): Client | null;
};

export const mockClientRepository: ClientRepository = {
  listClients() {
    return CLIENTS;
  },
  getClient(clientId) {
    return CLIENTS.find((client) => client.id === clientId) ?? null;
  },
};
