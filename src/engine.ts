import { ExecutorEngine } from './core/ExecutorEngine';
import { FlowParser } from './core/FlowParser';
import { NodeManifest, NodeRegistry } from './core/NodeRegistry';
import { FlowDefinition } from './models/FlowDefinition';

/**
 * This function represents the core logic of the flow engine.
 * It is decoupled from where the data comes from.
 *
 * @param flowDefinition The flow definition, received from the HTTP request body.
 * @param nodeManifest The node manifest, fetched from a database like Cosmos DB.
 * @param nodeModuleBasePath The path to the node implementation files, from Azure Files.
 */
export async function runFlow(
  flowDefinition: FlowDefinition,
  nodeManifest: NodeManifest,
  nodeModuleBasePath?: string
) {
  console.log('--- Starting Flow Execution ---');

  // 1. Set up the NodeRegistry with the manifest and the path to the node files.
  const nodeRegistry = new NodeRegistry(nodeManifest, nodeModuleBasePath);

  // 2. Parse the flow to get a validated execution plan.
  const flowParser = new FlowParser(flowDefinition);
  const executionOrder = flowParser.getExecutionOrder();

  // 3. Create the engine and run the flow.
  const engine = new ExecutorEngine(nodeRegistry);
  const finalContext = await engine.run(executionOrder);

  console.log('--- Flow Execution Finished ---');
  return finalContext;
}