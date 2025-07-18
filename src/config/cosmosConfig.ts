import { CosmosClient, Container } from '@azure/cosmos';
import https from 'https';
import { DefaultAzureCredential } from '@azure/identity';

const endpoint: string | undefined = process.env.COSMOS_DB_ENDPOINT;
if (!endpoint) {
  throw new Error("COSMOS_DB_ENDPOINT environment variable not set.");
}

let client: CosmosClient;

// Determine the authentication method
if (process.env.NODE_ENV === 'production') {
  console.log('Using Managed Identity for Cosmos DB authentication');
  const credential = new DefaultAzureCredential();
  client = new CosmosClient({ endpoint, aadCredentials: credential });
} else {
  console.log(`Connecting to Cosmos DB at ${endpoint} using key-based authentication`);
  const key: string | undefined = process.env.COSMOS_DB_KEY;
  if (!key) {
    throw new Error("COSMOS_DB_KEY environment variable not set.");
  }
  // Ignore SSL certificate errors for local development
  const agent = new https.Agent({ rejectUnauthorized: false });
  client = new CosmosClient({ endpoint, key, agent });
}

const databaseId: string = process.env.COSMOS_DB_DATABASE_ID || 'MetadataDB';
if (!databaseId) {
  throw new Error("COSMOS_DB_DATABASE_ID environment variable not set.");
}

const apiContainerId: string = process.env.COSMOS_DB_API_CONTAINER_ID || 'MetadataContainer';
if (!apiContainerId) {
  throw new Error("API container ID is not set.");
}

async function createApiDatabaseAndContainer(): Promise<Container> {
  const { database } = await client.databases.createIfNotExists({ id: databaseId });
  const { container } = await database.containers.createIfNotExists({ id: apiContainerId });
  return container;
}

export const apiContainerPromise: Promise<Container> = createApiDatabaseAndContainer();