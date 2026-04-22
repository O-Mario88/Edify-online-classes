import os
import glob

def run_analysis():
    src_dir = "./src"
    backend_dir = "./edify_backend/apps"
    
    js_ts_files = glob.glob(f"{src_dir}/**/*.ts", recursive=True) + glob.glob(f"{src_dir}/**/*.tsx", recursive=True)
    py_files = glob.glob(f"{backend_dir}/**/*.py", recursive=True)
    
    all_files = js_ts_files + py_files
    
    todos = 0
    fixmes = 0
    mocks = 0
    under_construction = 0
    
    unconnected_frontend_components = 0
    
    for f in all_files:
        try:
            with open(f, 'r', encoding='utf-8') as file:
                content = file.read()
                todos += content.count('TODO')
                fixmes += content.count('FIXME')
                mocks += content.count('mock') + content.count('Mock')
                under_construction += content.count('under construction')
                
                if f.endswith('.tsx') and 'apiClient' not in content and 'fetch(' not in content and 'contentApi' not in content:
                    unconnected_frontend_components += 1
        except Exception:
            pass

    print(f"Total TS/TSX files: {len(js_ts_files)}")
    print(f"Total Python files: {len(py_files)}")
    print(f"TODOs: {todos}")
    print(f"FIXMEs: {fixmes}")
    print(f"Mock references: {mocks}")
    print(f"'under construction' messages: {under_construction}")
    print(f"Frontend .tsx files without obvious API client usage: {unconnected_frontend_components}")

if __name__ == '__main__':
    run_analysis()
