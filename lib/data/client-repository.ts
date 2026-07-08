import { CLIENTS, type Client } from "@/lib/data";

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
