import { FlowDefinition, FlowNode } from '../models/FlowDefinition';

/**
 * FlowParser
 * Reads a flow definition and builds a traversable node/edge graph.
 */
export class FlowParser {
  private readonly orderedNodes: FlowNode[];

  constructor(private flow: FlowDefinition) {
    this.validate();
    this.orderedNodes = this.resolveExecutionOrder();
  }

  public getExecutionOrder(): FlowNode[] {
    return this.orderedNodes;
  }

  private validate(): void {
    if (!this.flow || !this.flow.nodes || !this.flow.edges) {
      throw new Error('Invalid flow definition: "nodes" and "edges" are required.');
    }
    // Further validation (e.g., for cycles) could be added here.
  }

  /**
   * Performs a topological sort to determine the execution order of nodes.
   */
  private resolveExecutionOrder(): FlowNode[] {
    const graph = new Map<string, string[]>();
    const inDegree = new Map<string, number>();
    const { nodes, edges } = this.flow;

    nodes.forEach(n => {
      graph.set(n.id, []);
      inDegree.set(n.id, 0);
    });

    edges.forEach(({ source, target }) => {
      graph.get(source)?.push(target);
      inDegree.set(target, (inDegree.get(target) ?? 0) + 1);
    });

    const queue = nodes.filter(n => inDegree.get(n.id) === 0);
    const result: FlowNode[] = [];

    while (queue.length > 0) {
      const current = queue.shift()!;
      result.push(current);
      graph.get(current.id)?.forEach(neighborId => {
        inDegree.set(neighborId, (inDegree.get(neighborId) ?? 1) - 1);
        if (inDegree.get(neighborId) === 0) {
          queue.push(nodes.find(n => n.id === neighborId)!);
        }
      });
    }

    if (result.length !== nodes.length) {
      throw new Error('Cycle detected in the flow graph.');
    }

    return result;
  }
}