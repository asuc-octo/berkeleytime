import json
import pathlib

from google import genai

MODEL = "gemini-2.5-flash-lite"
AUGMENTED_DIR = pathlib.Path(__file__).parent / "augmented_outputs"
VERIFIED_DIR = pathlib.Path(__file__).parent / "verified_outputs"


def extract_text(response) -> str:
    """Concatenate all text segments from the Gemini response."""
    chunks = []
    for candidate in response.candidates:
        if not candidate.content:
            continue
        for part in candidate.content.parts:
            if hasattr(part, "text"):
                chunks.append(part.text)
    return "\n".join(chunks).strip()


def build_prompt(query: str, results: list[dict]) -> str:
    lines = [
        "You are evaluating whether course search results are reasonable.",
        f"Search query: {query}",
        "",
        "For each result below, decide if it is reasonable based on the query.",
        "Respond strictly in the format:",
        "[SUBJECT] [COURSE NUMBER], Reasonable/Not reasonable",
        "",
        "Results:",
    ]

    for item in results:
        result = item.get("result", {})
        course = item.get("course") or {}
        subject = result.get("subject")
        number = result.get("courseNumber")
        title = course.get("title") or course.get("subject")
        description = (course.get("description") or "").strip()

        lines.append(f"- {subject} {number}: {title or 'N/A'}")
        if description:
            lines.append(f"  Description: {description}")

    return "\n".join(lines)


def verify_file(client: genai.Client, path: pathlib.Path):
    with path.open("r", encoding="utf-8") as file:
        payload = json.load(file)

    query = payload.get("query", "")
    results = payload.get("results", [])

    prompt = build_prompt(query, results)

    response = client.models.generate_content(
        model=MODEL,
        contents=prompt,
    )

    output_text = extract_text(response)
    output_path = VERIFIED_DIR / path.name
    output_path.write_text(output_text or "", encoding="utf-8")


def main():
    VERIFIED_DIR.mkdir(exist_ok=True)
    client = genai.Client()

    for path in sorted(AUGMENTED_DIR.glob("*.txt")):
        verified_path = VERIFIED_DIR / path.name
        if verified_path.exists():
            continue
        verify_file(client, path)


if __name__ == "__main__":
    main()