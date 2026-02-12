
import langextract
import sys

with open("scripts/inspect_extract_help.txt", "w", encoding="utf-8") as f:
    sys.stdout = f
    help(langextract.extract)
