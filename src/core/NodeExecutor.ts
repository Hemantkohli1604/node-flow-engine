import { ExecutionContext } from './ExecutionContext';

export interface NodeExecutor {
  /**
   * Executes the logic for a specific node type.
   */
  execute(params: Record<string, any>, context: ExecutionContext): Promise<void>;
}
