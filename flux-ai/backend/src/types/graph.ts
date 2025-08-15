export type NodeType = 'trigger' | 'brain' | 'memory' | 'api' | 'compute' | 'storage' | 'output' | 'custom';

export interface WorkflowNode {
  id: string;
  type: NodeType;
  data: Record<string, any>;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
}

export interface WorkflowGraph {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}


