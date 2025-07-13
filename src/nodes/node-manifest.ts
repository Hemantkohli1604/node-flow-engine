/**
 * Node Manifest
 * This file acts as a registry for all available node types and points to their
 * implementation modules. In a real-world scenario, this could be fetched
 * from a remote service or generated at build time.
 *
 * The key is the `type` string used in the flow definition.
 * The value is the module name (without extension).
 */
import { NodeManifest } from '../core/NodeRegistry';

export const nodeManifest: NodeManifest = {
  AddCorrelationId: 'AddCorrelationIdNode',
  GetOAuthToken: 'GetOAuthTokenNode',
};