import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import * as path from "path";
import { runFlow } from "./engine";
import { FlowDefinition } from "./models/FlowDefinition";
import { NodeManifest } from "./core/NodeRegistry";
import { apiContainerPromise } from "./config/cosmosConfig";  

app.http('HttpFlowRunner', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'flow/run',
    handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
        context.log(`HTTP trigger function processed a request to run a flow.`);

        try {
            const flowDefinition = await request.json() as FlowDefinition;

            if (!flowDefinition || !flowDefinition.nodes || !flowDefinition.edges) {
                return {
                    status: 400,
                    jsonBody: { message: "Please pass a valid flow definition in the request body." }
                };
            }

            // // In a real application, you would fetch this from a persistent store like Cosmos DB or Table Storage.
            // const nodeManifest: NodeManifest = {
            //     AddCorrelationId: 'AddCorrelationIdNode',
            //     GetOAuthToken: 'GetOAuthTokenNode',
            // };
            // Fetch the node manifest from Cosmos DB
            context.log("Connecting to Cosmos DB to fetch node manifest...");
            // Wait for the Cosmos DB container to be ready
            const apiContainer = await apiContainerPromise;
            context.log("Fetching node manifest from Cosmos DB...");
            

            const manifestDocs = await apiContainer.items.readAll().fetchAll();
            const nodeManifest: NodeManifest = {};
            manifestDocs.resources.forEach(doc => {
              nodeManifest[doc.id as string] = doc.module;
            });
            
            // Assuming the node manifest is stored in a specific container
            // const nodeManifest: NodeManifest = await apiContainer.items.readAll<NodeManifest>().fetchAll()
            //     .then(result => result.resources[0]) // Assuming the first item is the manifest
            //     .catch(error => {
            //         context.log("Failed to fetch node manifest from Cosmos DB:", error);
            //         throw new Error("Could not retrieve node manifest.");
            //     });
            if (!nodeManifest) {
                return {
                    status: 500,
                    jsonBody: { message: "Node manifest not found in Cosmos DB." }
                };
            }

            // This path points to the location of your compiled node modules.
            // It's configured in local.settings.json for local development and App Settings in Azure.
            const relativeNodeModulePath = process.env.NODE_MODULE_PATH;
            if (!relativeNodeModulePath) {
                throw new Error("NODE_MODULE_PATH environment variable not set.");
            }
            // Resolve the path from the project root (which is the CWD for `func start`) to make it absolute.
            const nodeModuleBasePath = path.join(process.cwd(), relativeNodeModulePath);

            const finalContext = await runFlow(flowDefinition, nodeManifest, nodeModuleBasePath);

            return { jsonBody: finalContext };

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during execution.";
            context.log("Flow execution failed:", error);
            return {
                status: 500,
                jsonBody: { message: "An error occurred during flow execution.", error: errorMessage }
            };
        }
    }
});
