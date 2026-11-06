import { AgentRole } from '../types';

export abstract class BaseAgent {
  public role: AgentRole;
  public name: string;
  public systemPrompt: string;

  constructor(role: AgentRole, name: string, systemPrompt: string) {
    this.role = role;
    this.name = name;
    this.systemPrompt = systemPrompt;
  }
}
