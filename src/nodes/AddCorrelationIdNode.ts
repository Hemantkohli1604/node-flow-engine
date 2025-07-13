import { ExecutionContext } from '../core/ExecutionContext';
import { NodeExecutor } from '../core/NodeExecutor';

export class AddCorrelationIdNode implements NodeExecutor {
  async execute(params: Record<string, any>, context: ExecutionContext): Promise<void> {
    const id = 'CID-' + Math.random().toString(36).slice(2);
    context.variables.correlationId = id;
    context.log(`Node [AddCorrelationId]: Set correlation ID to ${id}`);
  }
}
