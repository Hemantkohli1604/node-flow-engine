export interface FlowNode {
  id: string;
  type: string;
  data: {
    parameters: Record<string, any>;
  };
}

export interface FlowEdge {
  source: string;
  target: string;
}

export interface FlowDefinition {
  nodes: FlowNode[];
  edges: FlowEdge[];
}