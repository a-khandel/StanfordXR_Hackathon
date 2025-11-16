# diagram_agent.py

from openai import OpenAI
import json
from dotenv import load_dotenv
import os 

load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=OPENAI_API_KEY)

DIAGRAM_AGENT_PROMPT = """
You are a Diagram Control Agent for an immersive 3D XR whiteboard.

Your job is to interpret user speech and convert it into JSON instructions
for manipulating nodes, edges, labels, and diagrams.

Your output MUST ALWAYS be valid JSON following this schema:

{
  "actions": [
    {
      "type": "create_node" | "delete_node" | "rename_node" |
               "create_edge" | "delete_edge" |
               "add_label" | "suggestion",
      "id": "string",
      "from": "string",
      "to": "string",
      "text": "string"
    }
  ]
}

Rules:
- Output JSON only.
- No prose. No explanation.
- Infer the user's intent even if the speech is messy.
- If referencing a node that doesn't exist, create it automatically.
- If unclear, choose the most likely interpretation.
- For questions, respond with a "suggestion" action.

Each create_node MUST include a "node_type" field describing the type of node.
Valid node types:
- "service"
- "database"
- "gateway"
- "queue"
- "user"
- "generic"

Example:
{ "type": "create_node", "id": "Authentication", "node_type": "service" }
"""

def get_diagram_actions(transcript: str):
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": DIAGRAM_AGENT_PROMPT},
            {"role": "user", "content": transcript}
        ],
        response_format={"type": "json_object"}
    )

    content = response.choices[0].message.content

    # CASE 1: content is already a JSON string
    if isinstance(content, str):
        return json.loads(content)

    # CASE 2: content is a list of content parts
    if isinstance(content, list):
        # look for a text field
        for part in content:
            if hasattr(part, "text"):
                return json.loads(part.text)
            if isinstance(part, dict) and "text" in part:
                return json.loads(part["text"])

    # If neither worked
    raise ValueError(f"Unexpected content format: {content}")

