import json
import glob
import os

def process_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    changed = False
    
    if "subjects" not in data:
        return
        
    for subject in data["subjects"]:
        if "S5-S6" in subject.get("classLevels", []):
            subject["classLevels"].remove("S5-S6")
            if "S5" not in subject["classLevels"]:
                subject["classLevels"].extend(["S5", "S6"])
            changed = True
            
        def process_topics(topics):
            nonlocal changed
            # Find topics assigned to S5-S6
            s56_topics = [t for t in topics if t.get("classLevel") == "S5-S6"]
            if not s56_topics:
                return topics
            
            new_topics = []
            half = len(s56_topics) // 2 + len(s56_topics) % 2
            s5_topics = s56_topics[:half]
            s6_topics = s56_topics[half:]
            
            for t in topics:
                if t in s5_topics:
                    t["classLevel"] = "S5"
                    if "s56" in t.get("id", ""):
                        t["id"] = t["id"].replace("s56", "s5")
                    new_topics.append(t)
                elif t in s6_topics:
                    t["classLevel"] = "S6"
                    if "s56" in t.get("id", ""):
                        t["id"] = t["id"].replace("s56", "s6")
                    # Also update order of s6 topics so it restarts or continues? It currently continues, it's fine.
                    new_topics.append(t)
                else:
                    new_topics.append(t)
                    
            changed = True
            return new_topics

        if "topics" in subject:
            subject["topics"] = process_topics(subject["topics"])
        
        if "papers" in subject:
            for paper in subject["papers"]:
                if "topics" in paper:
                    paper["topics"] = process_topics(paper["topics"])
                
    if changed:
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
        print(f"Updated {file_path}")

def main():
    files = glob.glob('/Users/omario/Desktop/Notebook LM/edify online school/public/data/uganda-*-curriculum.json')
    for f in files:
        process_file(f)

if __name__ == '__main__':
    main()
