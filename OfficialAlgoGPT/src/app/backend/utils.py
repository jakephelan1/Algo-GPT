import anthropic
import json
import os
import re
from dotenv import load_dotenv
from typing import Generator

# Load environment variables
load_dotenv()
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")

if not ANTHROPIC_API_KEY:
    raise ValueError("Anthropic API Key is missing! Check your .env file.")

# Initialize Anthropic Claude API client
client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

def get_slides(question: str, solution: str) -> Generator[dict, None, None]:
    """Splits the solution into meaningful chunks and yields slides in real-time."""
    
    prompt = f"""
    You are a code analyst. Given a coding problem and a solution, 
    split the solution into 4-9 meaningful segments, each with an explanation.

    - Problem: {question}
    - Solution: {solution}

    Format response as valid JSON:
    ```json
    {{
        "steps": [
            {{"code": "if not head or left == right:\\n    return head", "explanation": "Base case check"}},
            {{"code": "curr = head\\nprev = None\\npre = None\\nstart = None\\nn = 1", "explanation": "Initialize pointers"}}
        ],
        "sample_input": "arr = [1, 2, 3]",
        "sample_output": "[1, 2, 3]",
        "final_answer": "This function reverses a linked list section."
    }}
    ```
    """

    response = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=2048,
        messages=[{"role": "user", "content": prompt}]
    )

    try:
        raw_response_text = response.content[0].text if isinstance(response.content, list) else response.content
        json_match = re.search(r"```json\s*(\{.*?\})\s*```", raw_response_text, re.DOTALL)

        if json_match:
            raw_response_text = json_match.group(1)  # Extract pure JSON content

        response_data = json.loads(raw_response_text)
        steps = response_data.get("steps", [])
        sample_input = response_data.get("sample_input", "")
        sample_output = response_data.get("sample_output", "")

        for step in steps:
            slide = gpt_generate_slide(question, step["code"], sample_input, sample_output)
            yield json.dumps({'slide': slide}) + "\n"

    except json.JSONDecodeError as e:
        print("❌ JSON Parsing Error:", e, f"\nRaw Response:\n{repr(raw_response_text)}")
        return

def gpt_generate_slide(question: str, segment: str, sample_input: str, sample_output: str) -> str:
    """Generates an HTML slide for a given code segment using Anthropic Claude."""
    
    prompt = f"""You are a code visualizer. Given a LeetCode problem, code segment, and sample input/output, generate a compact HTML slide.

The slide must include:
1. A visualization of the code's functionality
2. A detailed explanation
3. The problem title and sample input
4. The code snippet properly formatted

Guidelines:
- Use HTML with inline CSS for styling
- Generate slides with high contrast-text
- Return a SINGLE LINE of JSON with the HTML properly escaped
- All newlines in the HTML must be escaped as \\n
- Use double quotes for the JSON and single quotes for HTML attributes

Problem: {question}
Code Snippet: {segment}
Sample Input: {sample_input}
Sample Output: {sample_output}

Return format (exactly like this, all in one line):
{{"html_code": "<div style='font-family: Arial'>Your escaped\\nHTML\\ncontent here</div>"}}"""

    response = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=2048,
        messages=[{"role": "user", "content": prompt}]
    )

    try:
        raw_response_text = response.content[0].text if isinstance(response.content, list) else response.content

        # Extract JSON if wrapped in code block
        if raw_response_text.startswith("```"):
            raw_response_text = raw_response_text.split("```")[1].strip()
            if raw_response_text.startswith("json"):
                raw_response_text = raw_response_text[4:].strip()

        # Parse the JSON response
        response_data = json.loads(raw_response_text)
        return response_data.get("html_code", "<p>Error generating slide.</p>")

    except json.JSONDecodeError as e:
        print("❌ JSON Decoding Error in `gpt_generate_slide()`:", e)
        print(f"Raw response:\n{raw_response_text}")
        return "<p>Error generating slide.</p>"
