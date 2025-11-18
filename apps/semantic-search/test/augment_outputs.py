import json
import pathlib
from typing import List, Dict, Any

import requests

OUTPUTS_DIR = pathlib.Path(__file__).parent / "outputs"
AUGMENTED_DIR = pathlib.Path(__file__).parent / "augmented_outputs"
GRAPHQL_URL = "http://localhost:8080/api/graphql"

GRAPHQL_QUERY = """
query Course($subject: String!, $number: CourseNumber!) {
  course(subject: $subject, number: $number) {
    subject
    number
    title
    description
  }
}
"""


def fetch_course(subject: str, number: str) -> Dict[str, Any]:
  response = requests.post(
    GRAPHQL_URL,
    json={
      "query": GRAPHQL_QUERY,
      "variables": {
        "subject": subject,
        "number": number,
      },
    },
    timeout=30,
  )
  response.raise_for_status()
  data = response.json()
  if "errors" in data:
    raise RuntimeError(f"GraphQL errors: {data['errors']}")

  return data.get("data", {}).get("course")


def process_file(path: pathlib.Path):
  with path.open("r", encoding="utf-8") as file:
    payload = json.load(file)

  query = payload.get("query")

  results: List[Dict[str, Any]] = payload.get("results", [])
  top_results = sorted(results, key=lambda x: x.get("score", 0), reverse=True)[:10]

  augmented_data = []
  for result in top_results:
    subject = result.get("subject")
    number = result.get("courseNumber")
    if not subject or not number:
      continue

    course_data = fetch_course(subject, number)
    augmented_data.append({
      "result": result,
      "course": course_data,
    })

  output = {
    "query": query,
    "results": augmented_data,
  }

  output_path = AUGMENTED_DIR / path.name
  with output_path.open("w", encoding="utf-8") as out_file:
    json.dump(output, out_file, indent=2)


def main():
  AUGMENTED_DIR.mkdir(exist_ok=True)

  for path in OUTPUTS_DIR.glob("*.txt"):
    process_file(path)


if __name__ == "__main__":
  main()

