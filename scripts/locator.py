
import langextract
import inspect
import sys

with open("scripts/inspect_source_path.txt", "w", encoding="utf-8") as f:
    sys.stdout = f
    try:
        print(inspect.getsourcefile(langextract.extract))
    except Exception as e:
        print(e)
