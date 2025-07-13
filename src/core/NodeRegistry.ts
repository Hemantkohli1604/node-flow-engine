import { NodeExecutor } from './NodeExecutor';

/**
 * NodeRegistry
 * Manages pluggable node logic.
 */
export class NodeRegistry {
  private readonly nodeExecutors = new Map<string, NodeExecutor>();

  public register(nodeType: string, executor: NodeExecutor): void {
    if (this.nodeExecutors.has(nodeType)) {
      console.warn(`Overwriting already registered node type: "${nodeType}"`);
    }
    this.nodeExecutors.set(nodeType, executor);
  }

  public get(nodeType: string): NodeExecutor {
    const executor = this.nodeExecutors.get(nodeType);
    if (!executor) {
      throw new Error(`No executor registered for node type: "${nodeType}"`);
    }
    return executor;
  }
}
