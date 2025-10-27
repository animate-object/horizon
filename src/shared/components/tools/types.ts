import { ToolDefinition, Toolset } from "@/shared/lib/datastore";

export interface EnhancedToolset extends Toolset {
  tools: Pick<ToolDefinition, "id" | "name">[];
}
