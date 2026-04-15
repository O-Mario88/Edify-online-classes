import json
import os

SUBJECTS = [
    {
        "id": "ug-primary-math",
        "name": "Mathematics",
        "file": "uganda-primary-math-curriculum.json",
        "topics": {
            "P4": ["Set Concepts", "Whole Numbers", "Operations on Whole Numbers", "Fractions", "Length, Mass, Capacity", "Lines, Angles & Geometric Figures", "Data Handling"],
            "P5": ["Advanced Set Concepts", "Whole Numbers & Place Values", "Operations & Word Problems", "Fractions & Decimals", "Measurements (Time, Money, Distance)", "Geometry & Shapes", "Data & Graphs"],
            "P6": ["Set Theory", "Whole Numbers to Millions", "Fractions, Decimals & Percentages", "Integers", "Measurements & Rates", "Geometry", "Algebraic Expressions"],
            "P7": ["Sets", "Whole Numbers & Operations", "Fractions, Decimals, Percentages & Ratios", "Integers", "Measurement", "Geometry", "Data Handling & Probability", "Algebra"]
        }
    },
    {
        "id": "ug-primary-english",
        "name": "English Language",
        "file": "uganda-primary-english-curriculum.json",
        "topics": {
            "P4": ["Describing People", "Weather and Time", "Health and Hygiene", "Our School and Community", "Animals and their Environment", "Transport and Travel", "Creative Writing"],
            "P5": ["School Rules and Regulations", "Occupations", "Accidents and Safety", "Communication", "Culture and Customs", "Environmental Protection", "Leisure and Hobbies"],
            "P6": ["Debating", "Family and Relationships", "Rights and Responsibilities", "Banking and Financial Literacy", "National Symbols", "Technology and Media", "Creative Writing Workshop"],
            "P7": ["Exam Preparation Techniques", "Describing Events", "Children's Rights", "Elections and Democracy", "Global Environment", "Health and Diseases", "Letter Writing"]
        }
    },
    {
        "id": "ug-primary-science",
        "name": "Integrated Science",
        "file": "uganda-primary-science-curriculum.json",
        "topics": {
            "P4": ["Our Environment", "Plants", "Animals", "The Human Body", "Matter and Materials", "Energy (Light and Sound)", "Sanitation and Hygiene"],
            "P5": ["Keeping Poultry", "Crop Growing", "The Human Body (Digestive System)", "Matter and Energy", "Immunisation", "Primary Health Care", "The Environment"],
            "P6": ["Sound Energy", "The Circulatory System", "Respiratory System", "Reproductive System in Animals", "Science in Human Activities", "Keeping Cattle", "Alcohol and Drugs"],
            "P7": ["The Human Muscular and Skeletal System", "Electricity and Magnetism", "Light Energy", "Excretory System", "Interdependence in Nature", "Resources in the Environment", "Sanitation"]
        }
    },
    {
        "id": "ug-primary-sst",
        "name": "Social Studies",
        "file": "uganda-primary-sst-curriculum.json",
        "topics": {
            "P4": ["Our District", "Physical Features of our District", "Vegetation of our District", "People in our District", "Leaders in our District", "How we meet our needs in our District", "Keeping Peace in our District"],
            "P5": ["Uganda: Location and Size", "Physical Features of Uganda", "Climate of Uganda", "Vegetation of Uganda", "The People of pre-colonial Uganda", "Foreign Influence in Uganda", "Uganda's Economy"],
            "P6": ["East Africa: Location, Size and Relief", "Climate of East Africa", "Vegetation of East Africa", "People of East Africa", "Resources and Economic Activities in East Africa", "Early History of East Africa", "Post Independence East Africa"],
            "P7": ["Location, Size and Relief of Africa", "Climate and Vegetation of Africa", "The People of Africa", "Foreign Influence in Africa", "Nationalism and Independence in Africa", "Economy of Africa", "World Organizations"]
        }
    }
]

def generate():
    # Because script will run inside edify_backend/
    output_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'public', 'data'))
    os.makedirs(output_dir, exist_ok=True)
    
    for subj in SUBJECTS:
        subject_data = {
            "subjects": [
                {
                    "id": subj["id"],
                    "name": subj["name"],
                    "country": "Uganda",
                    "level": "Primary",
                    "classLevels": ["P4", "P5", "P6", "P7"],
                    "category": "Core",
                    "active": True,
                    "topics": []
                }
            ]
        }
        
        topic_list = subject_data["subjects"][0]["topics"]
        
        for class_level in ["P4", "P5", "P6", "P7"]:
            topics = subj["topics"][class_level]
            for i, topic_name in enumerate(topics):
                topic_list.append({
                    "id": f"{subj['id']}-{class_level.lower()}-{i+1}",
                    "subjectId": subj["id"],
                    "classLevel": class_level,
                    "name": topic_name,
                    "order": i + 1,
                    "levelGroup": "Upper Primary"
                })
        
        out_path = os.path.join(output_dir, subj["file"])
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(subject_data, f, indent=2)
            
        print(f"Generated {out_path}")

if __name__ == "__main__":
    generate()
