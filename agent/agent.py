"""
HazardHub Autonomous AI Operations Agent
Pure Python equivalent to src/agent/agent.ts
Interprets natural language commands from lab technicians and logistics coordinators,
decides which deterministic tools to invoke, and formulates compliant operational directives.
"""

from dataclasses import dataclass
from datetime import datetime
from typing import List, Optional, Dict, Any

from storage.state import StateManager
from agent.tools import OperationsAgentTools, ToolExecutionResult


@dataclass
class AgentMessage:
    id: str
    sender: str  # 'USER' | 'AGENT'
    timestamp: str
    content: str
    tool_calls: Optional[List[ToolExecutionResult]] = None
    action_suggestion: Optional[Dict[str, str]] = None


class AIOperationsAgent:
    """
    Autonomous operational agent with natural language tool routing.
    """

    @classmethod
    def process_query(cls, user_prompt: str, state: StateManager) -> AgentMessage:
        query = user_prompt.lower()
        tool_calls: List[ToolExecutionResult] = []
        response_text = ""
        action_suggestion: Optional[Dict[str, str]] = None

        # Intent 1: "Can we create / bundle a pickup lot?"
        if any(w in query for w in ['pickup', 'bundle', 'quota', 'create', 'schedule', 'optimize']):
            tool_res = OperationsAgentTools.propose_optimal_lot(state, 150.0)
            tool_calls.append(tool_res)
            bundle = tool_res.result

            if bundle.is_threshold_met:
                response_text = (
                    f"Yes, we can immediately schedule a regional pickup!\n\n"
                    f"I executed the **QuotaPacker Optimizer**, and we have safely assembled "
                    f"**{bundle.total_volume_liters:.1f} Liters** across **{len(bundle.participating_lab_ids)} facilities**.\n\n"
                    f"- **Quota Target**: 150.0 L (Exceeded by +{bundle.reserve_buffer_liters:.1f} L as an intentional safety reserve).\n"
                    f"- **Urgent Items Included**: {bundle.urgency_breakdown['urgent_count']} containers expiring within 14 days.\n"
                    f"- **ChemiGuard Compliance**: 100% EPA Safe ({bundle.compatibility.checked_count} pairwise checks verified).\n"
                    f"- **Standby Reserve**: Designated {len(bundle.standby_reserve_items)} compatible containers on standby in case of field rejections."
                )
                action_suggestion = {'label': 'Open Pickup Builder to Finalize', 'tab': 'Pickup Builder'}
            else:
                shortage = 150.0 - bundle.total_volume_liters
                response_text = (
                    f"Currently, the regional pool has only **{bundle.total_volume_liters:.1f} Liters** "
                    f"of compatible waste, which is **{shortage:.1f} Liters** below the required 150 L threshold. "
                    f"Additional labs need to log waste before dispatching a collection truck."
                )
                action_suggestion = {'label': 'Log Waste Inventory', 'tab': 'Waste Inventory'}

        # Intent 2: "What is urgent / expiring?"
        elif any(w in query for w in ['urgent', 'expir', 'critical', 'danger']):
            tool_res = OperationsAgentTools.inspect_urgent_waste(state, 14)
            tool_calls.append(tool_res)
            urgent_items = tool_res.result

            if urgent_items:
                top3 = "\n".join(
                    f"• **{i['name']}** ({i['volume_liters']}L) at {i['lab_id']} - Expiring in {i['days_until_expiring']} days ({i['un_code']})"
                    for i in urgent_items[:3]
                )
                response_text = (
                    f"There are **{len(urgent_items)} critical containers** expiring within the next 14 days "
                    f"that require immediate offloading:\n\n{top3}\n\n"
                    f"I recommend bundling these into the primary lot to prevent institutional hoarding in unventilated storage closets."
                )
            else:
                response_text = "All stored containers currently have stable shelf-life beyond the 14-day urgent threshold."
            action_suggestion = {'label': 'View Waste Inventory', 'tab': 'Waste Inventory'}

        # Intent 3: Chemical safety / Incompatibility question
        elif any(w in query for w in ['nitric', 'acetone', 'bleach', 'ammonia', 'cyanide', 'acid', 'safe', 'incompatib']):
            if ('nitric' in query and 'acetone' in query) or ('nitric' in query and 'solvent' in query):
                response_text = (
                    "⚠️ **CRITICAL SAFETY WARNING (EPA 40 CFR 264 App. V Group 3-A vs 3-B):**\n"
                    "**Nitric Acid 68%** must NEVER be co-loaded or mixed with **Acetone or Organic Solvents**.\n\n"
                    "- **Consequence**: Violent exothermic oxidation, spontaneous deflagration, and formation of shock-sensitive organic peroxides/nitrates.\n"
                    "- **DOT Mandate (49 CFR 177.848)**: Strict physical vehicle segregation required.\n"
                    "- **Action**: ChemiGuard deterministically blocks these chemicals from sharing the same pickup lot."
                )
            elif 'bleach' in query and 'ammonia' in query:
                response_text = (
                    "⚠️ **TOXIC GAS WARNING:**\n"
                    "**Sodium Hypochlorite (Bleach)** and **Concentrated Ammonia** must NEVER be combined.\n\n"
                    "- **Consequence**: Rapid generation of chloramine vapors ($NH_2Cl$) and shock-sensitive explosive nitrogen trichloride.\n"
                    "- **Action**: Segregate into separate storage and transport runs."
                )
            elif 'cyanide' in query:
                response_text = (
                    "☠️ **LETHAL POISON GAS HAZARD:**\n"
                    "**Cyanides (e.g. Sodium Cyanide)** in the presence of any acid (pH < 7) instantly release "
                    "**Hydrogen Cyanide Gas ($HCN$)**, which is rapidly fatal upon inhalation. "
                    "ChemiGuard enforces an absolute block on acid-cyanide co-loading."
                )
            else:
                response_text = (
                    "ChemiGuard enforces deterministic compatibility rules under **EPA 40 CFR Part 264 Appendix V**. "
                    "It checks all pairs in real-time, blocking mineral acids from contacting bases, cyanides, or bleach, "
                    "and segregating strong oxidizers from flammable solvents."
                )
            action_suggestion = {'label': 'Test ChemiGuard in Builder', 'tab': 'Pickup Builder'}

        # Intent 4: General status / Overview
        else:
            tool_res = OperationsAgentTools.query_readiness(state)
            tool_calls.append(tool_res)
            status = tool_res.result
            tot = status['total_volume']
            ready_txt = '✓ Ready for 150L Hauler Dispatch' if tot >= 150 else 'Below 150L Threshold'

            response_text = (
                f"I am your **Operations Agent**. Here is the current status of the township hazardous waste cooperative:\n\n"
                f"- **Combined Pool Volume**: {tot:.1f} Liters ({ready_txt}).\n"
                f"- **Participating Labs**: {status['lab_count']} local clinics and schools.\n"
                f"- **Critical Urgency**: {status['urgent_count']} container(s) expiring within 14 days.\n"
                f"- **Active Lots**: {status['lot_count']} manifest lot(s) in progress.\n\n"
                f"How would you like to proceed? You can ask me to auto-bundle a lot, inspect urgent waste, or check chemical compatibility."
            )
            action_suggestion = {'label': 'View Dashboard Overview', 'tab': 'Dashboard'}

        now_str = datetime.now().strftime('%H:%M')
        return AgentMessage(
            id=f"msg-{int(datetime.now().timestamp() * 1000)}",
            sender='AGENT',
            timestamp=now_str,
            content=response_text,
            tool_calls=tool_calls,
            action_suggestion=action_suggestion,
        )
