import pathlib
import requests

BASE_URL = "http://localhost:8080/api/semantic-search/courses"
OUTPUT_DIR = pathlib.Path(__file__).parent / "outputs"
PROMPTS_FILE = pathlib.Path(__file__).parent / "prompts.txt"


def main():
    OUTPUT_DIR.mkdir(exist_ok=True)

    with PROMPTS_FILE.open("r", encoding="utf-8") as prompts:
        for idx, line in enumerate(prompts, start=1):
            query = line.strip()
            if not query:
                continue

            params = {
                "query": query,
                "year": 2026,
                "semester": "Spring",
                "threshold": 0.45,
            }

            response = requests.get(BASE_URL, params=params, timeout=30)
            response.raise_for_status()

            output_file = OUTPUT_DIR / f"{idx}.txt"
            output_file.write_text(response.text, encoding="utf-8")


if __name__ == "__main__":
    main()

