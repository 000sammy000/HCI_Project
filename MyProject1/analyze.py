from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
from keys import OPENAI_API_KEY
import json

client = OpenAI(api_key=OPENAI_API_KEY)

def analyze_nutrients(food_entries):
    """
    Use GPT to analyze food entries, determine missing nutrients, and suggest solutions.
    """
    try:
        # Format the input data for GPT
        prompt = """
        食物共分為6大類，分類與份量單位為：
        1. 全榖雜糧類，1份 = 米、大麥等80公克；
        2. 豆蛋魚肉類，1份 = 黃豆20公克 = 蛋1顆 = 魚35公克 = 去皮雞胸肉30公克；
        3. 乳品類，1份 = 鮮奶240毫升；
        4. 蔬菜類，1份 = 生菜100公克；
        5. 水果類，1份 = 水果100公克 = 香蕉半根；
        6. 油脂與堅果種子類，1份 = 油類1茶匙；
        
        JSON檔裡為今天的食物內容與營養素份量，請依據檔案分析今天還缺乏哪些營養素。解釋得出結論的理由，
        並建議可以解決這些缺乏問題的具體食材或食品(台灣)。
        回覆請用JSON格式，以下為輸出範例:
        {       
            "lack_nutrients": [
                {
                    "nutrition": "纖維",
                    "reason": "飲食中缺少生鮮或輕烹煮的蔬菜和水果，這是纖維的主要來源。",
                    "solution": [
                        "深色葉菜（如小白菜、菠菜、羽衣甘藍）",
                        "高纖水果（如芭樂、蘋果、梨子）",
                        "全穀類（如糙米、燕麥、大麥）"
                    ]
                },
                {
                    "nutrition": "鉀",
                    "reason": "鉀有助於平衡鈉的攝取，但餐點（特別是速食與便當）鈉含量較高。",
                    "solution": [
                        "地瓜",
                        "香蕉",
                        "酪梨",
                        "柳丁或柳橙汁"
                    ]
                },
                ...
            ]
        }
        請務必依照上述格式回覆，否則系統將無法正確判斷結果。
        """
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            temperature=0.0,
            messages=[
                {
                    "role": "user",
                    "content": f"{prompt}\n\n食物條目:\n{json.dumps(food_entries, ensure_ascii=False)}",
                }
            ],
            response_format={
                "type": "json_schema",
                "json_schema": {
                    "name": "nutrient_analysis_schema",
                    "schema": {
                        "type": "object",
                        "properties": {
                            "lack_nutrient": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "nutrition": {"type": "string"},
                                        "reason": {"type": "string"},
                                        "solution": {
                                            "type": "array",
                                            "items": {"type": "string"}
                                        }
                                    },
                                    "required": ["nutrition", "reason", "solution"]
                                }
                            }
                        },
                        "required": ["lack_nutrient"]
                    }
                }
            }
        )


        # Parse and return the GPT response
        analysis = response.choices[0].message.content.strip()
        return analysis
    
    except Exception as e:
        print(f"Error during GPT analysis: {e}")
        return {"error": str(e)}

def analyze_food_entries():
    try:
        # Get food entries from request
        data = request.get_json()
        if not data or 'foodEntries' not in data:
            return jsonify({"error": "Invalid data format. 'foodEntries' is required."}), 400

        food_entries = data['foodEntries']

        # Analyze the food entries
        analysis = analyze_nutrients(food_entries)

        # Return the analysis as JSON
        #print(analysis)
        return analysis
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500
