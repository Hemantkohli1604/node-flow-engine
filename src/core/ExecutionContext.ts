/**
 * ExecutionContext
 * Shares state across nodes during interpretation.
 */
export class ExecutionContext {
  public variables: Record<string, any> = {};
  public logs: string[] = [];

  public log(message: string) {
    const timestamp = new Date().toISOString();
    this.logs.push(`[${timestamp}] ${message}`);
    console.log(`[${timestamp}] ${message}`);
  }
}
