import { ExecutorEngine } from './core/ExecutionEngine';
import { FlowParser } from './core/FlowParser';
import { NodeRegistry } from './core/NodeRegistry';
import { FlowDefinition } from './models/FlowDefinition';
import { AddCorrelationIdNode } from './nodes/AddCorrelationIdNode';
import { GetOAuthTokenNode } from './nodes/GetOAuthTokenNode';

async function main() {
  // 1. Define the flow structure
  const flowDefinition: FlowDefinition = {
    nodes: [
      {
        id: '1',
        type: 'AddCorrelationId',
        data: { parameters: { header: 'X-Correlation-ID' } },
      },
      {
        id: '2',
        type: 'GetOAuthToken',
        data: { parameters: { tokenUrl: 'https://auth.example.com/token' } },
      },
    ],
    edges: [{ source: '1', target: '2' }],
  };

  // 2. Set up the NodeRegistry with available node types
  const nodeRegistry = new NodeRegistry();
  nodeRegistry.register('AddCorrelationId', new AddCorrelationIdNode());
  nodeRegistry.register('GetOAuthToken', new GetOAuthTokenNode());

  // 3. Parse the flow to get a validated execution plan
  const flowParser = new FlowParser(flowDefinition);
  const executionOrder = flowParser.getExecutionOrder();

  // 4. Create the engine and run the flow
  const engine = new ExecutorEngine(nodeRegistry);
  console.log('--- Starting Flow Execution ---');
  const finalContext = await engine.run(executionOrder);
  console.log('--- Flow Execution Finished ---');

  // 5. Inspect the final state
  console.log('\nFinal Execution Context:');
  console.log(JSON.stringify(finalContext, null, 2));
}

main().catch(error => {
  console.error('Flow execution failed:', error);
});