import { NodeExecutor } from './NodeExecutor';

// A type for our manifest. The key is the nodeType, the value is the module specifier.
export type NodeManifest = Record<string, string>;

/**
 * NodeRegistry
 * Manages and dynamically loads pluggable node logic from a manifest.
 */
export class NodeRegistry {
  private readonly executors = new Map<string, NodeExecutor>();
  private readonly nodeModuleBasePath: string;

  constructor(
    private manifest: NodeManifest,
    // The base path can be configured via an environment variable in a real environment.
    nodeModuleBasePath: string = '../nodes/'
  ) {
    this.nodeModuleBasePath = nodeModuleBasePath;
  }

  /**
   * Retrieves an executor for a given node type.
   * If the executor is not yet instantiated, it dynamically imports the
   * module, creates an instance, and caches it.
   */
  public async get(nodeType: string): Promise<NodeExecutor> {
    // Return from cache if available
    if (this.executors.has(nodeType)) {
      return this.executors.get(nodeType)!;
    }

    // Look up the module name in the manifest
    const moduleName = this.manifest[nodeType];
    if (!moduleName) {
      throw new Error(`Node type "${nodeType}" is not defined in the node manifest.`);
    }

    try {
      // Dynamically import the module from the configured base path.
      const modulePath = `${this.nodeModuleBasePath}${moduleName}`;
      const module = await import(modulePath);

      // Convention: The exported class name is the node type + "Node".
      const className = `${nodeType}Node`;
      const ExecutorClass = module[className];

      if (!ExecutorClass) {
        throw new Error(`Could not find exported class "${className}" in module "${moduleName}".`);
      }

      const instance: NodeExecutor = new ExecutorClass();
      this.executors.set(nodeType, instance); // Cache the instance
      return instance;
    } catch (error) {
      console.error(`Failed to load node executor for type "${nodeType}" from module "${moduleName}"`);
      throw error; // Re-throw to halt execution
    }
  }
}