from google import genai
from google.genai import types as genai_types
import re
import json
from typing import Any
from config import GEMINI_API_KEY, GEMINI_MODEL_NAME

gemini_client = genai.Client(api_key=GEMINI_API_KEY)

def extract_json(raw: str) -> Any:
    raw = raw.strip()
    if raw.startswith("```"):
        raw = re.sub(r"^```(?:json)?", "", raw).rstrip("`").strip()
    start = None
    for i, ch in enumerate(raw):
        if ch in "{[":
            start = i
            break
    if start is None:
        raise ValueError("No JSON found in LLM output")
    depth = 0
    end = None
    open_ch = raw[start]
    close_ch = "}" if open_ch == "{" else "]"
    in_str = False
    esc = False
    for i in range(start, len(raw)):
        c = raw[i]
        if esc:
            esc = False
            continue
        if c == "\\":
            esc = True
            continue
        if c == '"':
            in_str = not in_str
            continue
        if in_str:
            continue
        if c == open_ch:
            depth += 1
        elif c == close_ch:
            depth -= 1
            if depth == 0:
                end = i + 1
                break
    if end is None:
        raise ValueError("Unbalanced JSON in LLM output")
    return json.loads(raw[start:end])

async def gemini_json(system: str, user_prompt: str) -> Any:
    response = await gemini_client.aio.models.generate_content(
        model=GEMINI_MODEL_NAME,
        contents=user_prompt,
        config=genai_types.GenerateContentConfig(system_instruction=system),
    )
    return extract_json(response.text)

async def gemini_text(system: str, user_prompt: str) -> str:
    response = await gemini_client.aio.models.generate_content(
        model=GEMINI_MODEL_NAME,
        contents=user_prompt,
        config=genai_types.GenerateContentConfig(system_instruction=system),
    )
    return response.text
