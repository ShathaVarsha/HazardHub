import { OperationsAgentTools, type ToolExecutionResult } from './tools';

export interface AgentMessage {
  id: string;
  sender: 'USER' | 'AGENT';
  timestamp: string;
  content: string;
  toolCalls?: ToolExecutionResult[];
  actionSuggestion?: {
    label: string;
    tab: 'dashboard' | 'labs' | 'inventory' | 'builder' | 'lots' | 'custody';
  };
}

export class AIOperationsAgent {
  /**
   * Processes a natural language prompt, decides which tool(s) to call,
   * executes them, and summarizes the results in conversational operations language.
   */
  public static async processQuery(userPrompt: string): Promise<AgentMessage> {
    const query = userPrompt.toLowerCase();
    const toolCalls: ToolExecutionResult[] = [];
    let responseText = '';
    let actionSuggestion: AgentMessage['actionSuggestion'] = undefined;

    // Intent 1: "Can we create / bundle a pickup lot?"
    if (
      query.includes('pickup') ||
      query.includes('bundle') ||
      query.includes('quota') ||
      query.includes('create') ||
      query.includes('schedule')
    ) {
      const toolRes = await OperationsAgentTools.proposeOptimalLot(150);
      toolCalls.push(toolRes);

      const bundle = toolRes.result;
      if (bundle.isThresholdMet) {
        responseText = `Yes, we can immediately schedule a regional pickup! 

I executed the **QuotaPacker Optimizer**, and we have safely assembled **${bundle.totalVolumeLiters.toFixed(1)} Liters** across **${bundle.participatingLabIds.length} facilities**.

- **Quota Target**: 150.0 L (Exceeded by +${bundle.reserveBufferLiters.toFixed(1)} L as an intentional safety reserve).
- **Urgent Items Included**: ${bundle.urgencyBreakdown.urgentCount} containers expiring within 14 days.
- **ChemiGuard Compliance**: 100% EPA Safe (${bundle.compatibility.checkedCount} pairwise checks verified).
- **Standby Reserve**: Designated ${bundle.standbyReserveItems.length} compatible containers on standby in case of field rejections.`;
        actionSuggestion = { label: 'Open Pickup Builder to Finalize', tab: 'builder' };
      } else {
        responseText = `Currently, the regional pool has only **${bundle.totalVolumeLiters.toFixed(1)} Liters** of compatible waste, which is **${(150 - bundle.totalVolumeLiters).toFixed(1)} Liters** below the required 150 L threshold. Additional labs need to log waste before dispatching a collection truck.`;
        actionSuggestion = { label: 'Log Waste Inventory', tab: 'inventory' };
      }
    }

    // Intent 2: "What is urgent / expiring?"
    else if (
      query.includes('urgent') ||
      query.includes('expir') ||
      query.includes('critical') ||
      query.includes('danger')
    ) {
      const toolRes = await OperationsAgentTools.inspectUrgentWaste(14);
      toolCalls.push(toolRes);

      const urgentItems = toolRes.result as any[];
      if (urgentItems.length > 0) {
        const top3 = urgentItems.slice(0, 3).map((i) => `• **${i.name}** (${i.volumeLiters}L) at ${i.labId} - Expiring in ${i.daysUntilExpiring} days (${i.unCode})`).join('\n');
        responseText = `There are **${urgentItems.length} critical containers** expiring within the next 14 days that require immediate offloading:\n\n${top3}\n\nI recommend bundling these into the primary lot to prevent institutional hoarding in unventilated storage closets.`;
      } else {
        responseText = `All stored containers currently have stable shelf-life beyond the 14-day urgent threshold.`;
      }
      actionSuggestion = { label: 'View Waste Inventory', tab: 'inventory' };
    }

    // Intent 3: Chemical safety / Incompatibility question
    else if (
      query.includes('nitric') ||
      query.includes('acetone') ||
      query.includes('bleach') ||
      query.includes('ammonia') ||
      query.includes('cyanide') ||
      query.includes('acid') ||
      query.includes('safe') ||
      query.includes('incompatib')
    ) {
      if ((query.includes('nitric') && query.includes('acetone')) || query.includes('solvent')) {
        responseText = `⚠️ **CRITICAL SAFETY WARNING (EPA 40 CFR 264 App. V Group 3-A vs 3-B):**
**Nitric Acid 68%** must NEVER be co-loaded or mixed with **Acetone or Organic Solvents**.

- **Consequence**: Violent exothermic oxidation, spontaneous deflagration, and formation of shock-sensitive organic peroxides/nitrates.
- **DOT Mandate (49 CFR 177.848)**: Strict physical vehicle segregation required.
- **Action**: ChemiGuard deterministically blocks these chemicals from sharing the same pickup lot.`;
      } else if (query.includes('bleach') && query.includes('ammonia')) {
        responseText = `⚠️ **TOXIC GAS WARNING:**
**Sodium Hypochlorite (Bleach)** and **Concentrated Ammonia** must NEVER be combined.

- **Consequence**: Rapid generation of chloramine vapors ($NH_2Cl$) and shock-sensitive explosive nitrogen trichloride.
- **Action**: Segregate into separate storage and transport runs.`;
      } else if (query.includes('cyanide')) {
        responseText = `☠️ **LETHAL POISON GAS HAZARD:**
**Cyanides (e.g. Sodium Cyanide)** in the presence of any acid (pH < 7) instantly release **Hydrogen Cyanide Gas ($HCN$)**, which is rapidly fatal upon inhalation. ChemiGuard enforces an absolute block on acid-cyanide co-loading.`;
      } else {
        responseText = `ChemiGuard enforces deterministic compatibility rules under **EPA 40 CFR Part 264 Appendix V**. It checks all pairs in real-time, blocking mineral acids from contacting bases, cyanides, or bleach, and segregating strong oxidizers from flammable solvents.`;
      }
      actionSuggestion = { label: 'Test ChemiGuard in Builder', tab: 'builder' };
    }

    // Intent 4: General status / Overview
    else {
      const toolRes = await OperationsAgentTools.queryReadiness();
      toolCalls.push(toolRes);

      const status = toolRes.result;
      responseText = `I am your **Operations Agent**. Here is the current status of the township hazardous waste cooperative:

- **Combined Pool Volume**: ${status.totalVolume.toFixed(1)} Liters (${status.totalVolume >= 150 ? '✓ Ready for 150L Hauler Dispatch' : 'Below 150L Threshold'}).
- **Participating Labs**: ${status.labCount} local clinics and schools.
- **Critical Urgency**: ${status.urgentCount} container(s) expiring within 14 days.
- **Active Lots**: ${status.lotCount} manifest lot(s) in progress.

How would you like to proceed? You can ask me to auto-bundle a lot, inspect urgent waste, or check chemical compatibility.`;
      actionSuggestion = { label: 'View Dashboard Overview', tab: 'dashboard' };
    }

    return {
      id: `msg-${Date.now()}`,
      sender: 'AGENT',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: responseText,
      toolCalls,
      actionSuggestion,
    };
  }
}
