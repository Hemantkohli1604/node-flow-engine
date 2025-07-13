import { FlowNode } from '../models/FlowDefinition';
import { ExecutionContext } from './ExecutionContext';
import { NodeRegistry } from './NodeRegistry';

/**
 * ExecutorEngine
 * Resolves order and executes nodes sequentially.
 */
export class ExecutorEngine {
  constructor(private nodeRegistry: NodeRegistry) {}

  public async run(
    executionOrder: FlowNode[],
    initialContext?: Record<string, any>
  ): Promise<ExecutionContext> {
    const context = new ExecutionContext();
    context.variables = { ...initialContext };

    for (const node of executionOrder) {
      const executor = this.nodeRegistry.get(node.type);
      await executor.execute(node.data.parameters, context);
    }
    return context;
  }
}
