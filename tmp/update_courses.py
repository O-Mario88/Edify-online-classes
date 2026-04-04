import json
import uuid

def create_lesson(title, ltype):
    return {
        "id": str(uuid.uuid4())[:8],
        "title": title,
        "type": ltype,
        "duration": "45 min"
    }

def generate_a_level_subject(class_id, term_id, subject_id, subject_name, code, papers):
    topics = []
    
    for i, paper in enumerate(papers):
        subtopics = []
        for j in range(1, 3):
            subtopics.append({
                "id": f"{class_id}-{subject_id}-{term_id}-t{i}-sub{j}",
                "name": f"Module {j}: Core Concepts",
                "lessons": [
                    create_lesson(f"Video Lesson: {paper} Concepts", "video"),
                    create_lesson(f"Guided Notes: {paper}", "notes"),
                    create_lesson("Past Paper Review exercise", "exercise")
                ]
            })

        topics.append({
            "id": f"{class_id}-{subject_id}-{term_id}-t{i}",
            "name": f"{paper} Preparation",
            "description": f"Focus strictly on UNEB {code} {paper}",
            "subtopics": subtopics
        })

    return {
        "id": f"{class_id}-{subject_id}",
        "name": subject_name,
        "teacherId": "sys-auto",
        "description": f"Advanced {subject_name} ({code}) syllabus for {class_id}",
        "topics": topics
    }

def main():
    file_path = "public/data/courses.json"
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    # All 12 configured subjects in subjectConfig.ts
    subjects_config = [
        {"id": "gp-a", "name": "General Paper", "code": "S101", "papers": ["Paper 1"]},
        {"id": "submath-a", "name": "Subsidiary Mathematics", "code": "S475", "papers": ["Paper 1"]},
        {"id": "subict-a", "name": "Subsidiary ICT", "code": "S850", "papers": ["Paper 1"]},
        {"id": "phy-a", "name": "Physics", "code": "P510", "papers": ["Paper 1 (Mechanics)", "Paper 2 (Heat/Modern Physics)", "Paper 3 (Practical)"]},
        {"id": "che-a", "name": "Chemistry", "code": "P525", "papers": ["Paper 1 (Physical)", "Paper 2 (Inorganic/Organic)", "Paper 3 (Practical)"]},
        {"id": "math-a", "name": "Mathematics", "code": "P425", "papers": ["Paper 1 (Pure Math)", "Paper 2 (Applied Math)"]},
        {"id": "bio-a", "name": "Biology", "code": "P530", "papers": ["Paper 1 (Theory)", "Paper 2 (Essay)", "Paper 3 (Practical)"]},
        {"id": "econ-a", "name": "Economics", "code": "P220", "papers": ["Paper 1 (Microeconomics)", "Paper 2 (Macroeconomics)"]},
        {"id": "geog-a", "name": "Geography", "code": "P250", "papers": ["Paper 1 (Physical)", "Paper 2 (Human)"]},
        {"id": "lit-a", "name": "Literature", "code": "P310", "papers": ["Paper 1 (Prose)", "Paper 2 (Poetry)", "Paper 3 (Plays)"]},
        {"id": "hist-a", "name": "History", "code": "P210", "papers": ["Paper 1 (African History)", "Paper 2 (European History)"]},
        {"id": "ent-a", "name": "Entrepreneurship", "code": "P320", "papers": ["Paper 1", "Paper 2", "Paper 3"]}
    ]

    # Find S5 and S6
    for level in data.get("levels", []):
        if level.get("id") == "a-level":
            for cls in level.get("classes", []):
                class_id = cls["id"]
                if class_id in ["senior-5", "senior-6"]:
                    for term_idx, term in enumerate(cls.get("terms", [])):
                        term_id = term["id"]
                        
                        term["subjects"] = []
                        for sub_config in subjects_config:
                            subject_payload = generate_a_level_subject(
                                class_id, 
                                term_id, 
                                sub_config["id"], 
                                sub_config["name"], 
                                sub_config["code"], 
                                sub_config["papers"]
                            )
                            term["subjects"].append(subject_payload)

    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

    print("Updated public/data/courses.json for S5 and S6 with all 12 A-level subjects")

if __name__ == "__main__":
    main()
