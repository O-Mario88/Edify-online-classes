import os
import re

files_to_update = [
    'src/components/marketplace/TeacherMonetizationDashboard.tsx',
    'src/components/academic/ResourceUploadModal.tsx',
    'src/components/dashboard/StudentModals.tsx',
    'src/components/dashboard/ParentModals.tsx',
    'src/components/dashboard/AdminModals.tsx',
    'src/components/dashboard/BulkInviteModal.tsx',
    'src/pages/AITeachingAssistant.tsx',
    'src/pages/ParentDashboard.tsx',
    'src/pages/analytics/InstitutionIntelligence.tsx',
    'src/pages/analytics/PlatformCommandCenter.tsx'
]

for file_path in files_to_update:
    if not os.path.exists(file_path):
        continue
        
    with open(file_path, 'r') as f:
        content = f.read()
        
    original = content
    # Replace import
    content = content.replace("from '../../lib/api';", "from '../../lib/apiClient';")
    content = content.replace("from '../lib/api';", "from '../lib/apiClient';")
    
    # Handle AITeachingAssistant.tsx async await
    content = content.replace("const res = await apiClient.post(", 
                              "const res = await apiClient.post(") # No change to string, just logic
    # Actually it's easier to regex replace `.then(res => {` with `.then(res => { if (res.error) throw res.error;`
    content = content.replace(".then(res => {\n        setMetrics(res.data);", 
                              ".then(res => {\n        if (res.error) throw res.error;\n        setMetrics(res.data);")
                              
    # ParentDashboard.tsx
    content = content.replace("const { data } = await apiClient.get('/analytics/parent-dashboard/');\n        setDashboardData(data);",
                              "const { data, error } = await apiClient.get('/analytics/parent-dashboard/');\n        if (error) throw error;\n        setDashboardData(data as any);")
                              
    with open(file_path, 'w') as f:
        f.write(content)
        
print("Updated API imports!")
