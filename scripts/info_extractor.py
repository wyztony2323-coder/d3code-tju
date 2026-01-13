import pandas as pd
import json
import os

# 确保输出目录存在
os.makedirs('src/data', exist_ok=True)

def parse_majors(majors_str):
    """解析 '律例:25,矿务:25' 格式的字符串为对象列表"""
    if pd.isna(majors_str):
        return []
    items = str(majors_str).split(',')
    result = []
    for item in items:
        if ':' in item:
            name, val = item.split(':')
            result.append({"n": name.strip(), "v": int(val)})
    return result

def generate_json():
    input_csv = 'data/tju_history_raw.csv'
    output_json = 'src/data/uni_detail.json'
    
    try:
        df = pd.read_csv(input_csv)
        events = []
        
        for _, row in df.iterrows():
            event = {
                "year": int(row['year']),
                "title": row['title'],
                "desc": row['desc'],
                "major_count": int(row['major_count']),
                "student_total": str(row['student_total']),
                "career": row['career'],
                "majors": parse_majors(row['majors']),
                # 预设类型，前端逻辑会根据此生成 mark 或 event
                "raw_type": "key_event" 
            }
            events.append(event)
            
        with open(output_json, 'w', encoding='utf-8') as f:
            json.dump(events, f, ensure_ascii=False, indent=2)
            
        print(f"✅ 成功: 已从 {input_csv} 生成 {output_json}")
        
    except Exception as e:
        print(f"❌ 错误: {e}")

if __name__ == "__main__":
    generate_json()