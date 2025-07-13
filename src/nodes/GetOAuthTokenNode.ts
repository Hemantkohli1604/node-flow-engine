import { ExecutionContext } from '../core/ExecutionContext';
import { NodeExecutor } from '../core/NodeExecutor';

export class GetOAuthTokenNode implements NodeExecutor {
  async execute(params: Record<string, any>, context: ExecutionContext): Promise<void> {
    const url = params.tokenUrl;
    // In a real scenario, you would make an HTTP request here.
    const token = `fake-token-for-${url}-using-${context.variables.correlationId || 'none'}`;
    context.variables.oauthToken = token;
    context.log(`Node [GetOAuthToken]: Retrieved token from ${url}`);
  }
}