// One client list for the whole platform: real records (encrypted store)
// merged with the demo seed clients. Server-side only.

import { CLIENTS, type Client } from "@/lib/data";
import {
  listRealClients,
  getRealClient,
  toClient,
} from "@/lib/clients/real-client-store";
import {
  listXplanClients,
  getXplanClient,
  isXplanId,
} from "@/lib/xplan/source";

export async function listAllClients(): Promise<Client[]> {
  const real = await listRealClients();
  // Returns [] unless XPLAN credentials are present, so this is a no-op today.
  const xplan = await listXplanClients();
  return [...real.map(toClient), ...xplan.map((r) => r.client), ...CLIENTS];
}

export async function findClient(clientId: string): Promise<Client | null> {
  const real = await getRealClient(clientId);
  if (real) return toClient(real);
  if (isXplanId(clientId)) {
    const record = await getXplanClient(clientId);
    if (record) return record.client;
  }
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
