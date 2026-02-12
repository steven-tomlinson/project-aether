
import langextract
import inspect
import sys

with open("scripts/inspect_output.txt", "w", encoding="utf-8") as f:
    sys.stdout = f
    print("LangExtract Version:", getattr(langextract, "__version__", "Unknown"))
    print("\nTop-level attributes:")
    print(dir(langextract))

    # Try to find the main extraction class
    for name, obj in inspect.getmembers(langextract):
        if inspect.isclass(obj):
            print(f"\nClass: {name} {obj}")
            # Print docstring
            if obj.__doc__:
                print(obj.__doc__)
            # Print methods
            for method_name, method in inspect.getmembers(obj):
                if not method_name.startswith("_"):
                     print(f"  Method: {method_name}")

        if inspect.isfunction(obj):
            print(f"\nFunction: {name}")
            if obj.__doc__:
                print(obj.__doc__)
