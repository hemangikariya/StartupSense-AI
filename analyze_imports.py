import os
import ast
import sys

# Standard library modules in Python 3.10+
stdlib = {
    'abc', 'argparse', 'ast', 'asyncio', 'base64', 'collections', 'contextlib', 'copy', 'csv', 'datetime',
    'decimal', 'email', 'enum', 'functools', 'glob', 'gzip', 'hashlib', 'html', 'http', 'io', 'json', 'logging',
    'math', 'multiprocessing', 'os', 'pathlib', 'pickle', 'pprint', 'queue', 'random', 're', 'select', 'shutil',
    'signal', 'socket', 'sqlite3', 'ssl', 'string', 'struct', 'subprocess', 'sys', 'tempfile', 'threading',
    'time', 'traceback', 'types', 'typing', 'unittest', 'urllib', 'uuid', 'warnings', 'weakref', 'xml', 'zipfile',
    'zlib', 'platform', 'inspect', 'mimetypes'
}

local_dirs = {'backend', 'ai_engine', 'realtime_search', 'reports'}

found_imports = {}

for root, dirs, files in os.walk('.'):
    # Skip venv and node_modules directories
    if 'venv' in root or 'node_modules' in root or '.git' in root:
        continue
    for file in files:
        if file.endswith('.py'):
            filepath = os.path.join(root, file)
            if filepath.endswith('analyze_imports.py'):
                continue
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    tree = ast.parse(f.read(), filename=filepath)
                
                for node in ast.walk(tree):
                    if isinstance(node, ast.Import):
                        for name in node.names:
                            base = name.name.split('.')[0]
                            if base not in stdlib and base not in local_dirs:
                                found_imports.setdefault(base, []).append(filepath)
                    elif isinstance(node, ast.ImportFrom):
                        if node.level == 0 and node.module:
                            base = node.module.split('.')[0]
                            if base not in stdlib and base not in local_dirs:
                                found_imports.setdefault(base, []).append(filepath)
            except Exception as e:
                print(f"Error parsing {filepath}: {e}")

print("=== External Imports Found ===")
for imp, files in sorted(found_imports.items()):
    print(f"{imp}: imported in:")
    for f in sorted(list(set(files))):
        print(f"  - {f}")
