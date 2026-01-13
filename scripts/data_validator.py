import pandas as pd

def validate_tju_data(file_path):
    print(f"🔍 正在验证数据: {file_path}")
    df = pd.read_csv(file_path)
    
    # 1. 检查必要列
    required_columns = ['year', 'title', 'majors']
    for col in required_columns:
        if col not in df.columns:
            print(f"❌ 错误: 缺少必要列 '{col}'")
            return
            
    # 2. 检查年份逻辑
    if not df['year'].is_monotonic_increasing:
        print("⚠️ 警告: 年份未按顺序排列，建议重新排序以获得最佳3D效果")
        
    # 3. 检查专业格式 (名称:数值)
    for index, row in df.iterrows():
        majors = str(row['majors']).split(',')
        for m in majors:
            if ':' not in m:
                 print(f"⚠️ 格式警告: 第 {index+1} 行专业格式错误 -> '{m}'")

    print("✅ 验证完成，数据基本可用。")

if __name__ == "__main__":
    validate_tju_data('data/tju_history_raw.csv')