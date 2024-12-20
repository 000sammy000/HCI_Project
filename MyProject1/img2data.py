import base64
from io import BytesIO

import requests
import json
from keys import OPENAI_API_KEY

from openai import OpenAI
from PIL import Image
from pydantic import BaseModel

client = OpenAI(api_key=OPENAI_API_KEY)


class JsonFormat(BaseModel):
    全榖雜糧類: float
    豆蛋魚肉類: float
    乳品類: float
    蔬菜類: float
    水果類: float
    油脂與堅果種子類: float


def analyze_food(bimage):
    bimage = "data:image/jpeg;base64," + bimage
    # Load image from path
    # with open(img_path, "rb") as f:
    #     img = f.read()

    # image = Image.open(BytesIO(bimage))

    prompt = """
    圖中為一份餐點，請辨識這張圖片中的食材，並分別分析該食材在照片中的食物分類與份量。\n
    食物共分為6大類，分類與份量單位為：\n
    1. 全榖雜糧類，1碗 = 米、大麥等80公克；\n
    2. 豆蛋魚肉類，1份 = 黃豆20公克 = 蛋1顆 = 魚35公克 = 去皮雞胸肉30公克；\n
    3. 乳品類，1杯 = 鮮奶240毫升；\n
    4. 蔬菜類，1碗 = 生菜100公克；\n
    5. 水果類，1份 = 水果100公克 = 香蕉半根；\n
    6. 油脂與堅果種子類，1份 = 油類1茶匙；\n

    回覆需為 JSON 格式，數值請勿回覆區間，只能回覆單一整數或小數。\n
    **如果圖片中有食物，回覆以下 JSON 格式：**\n
    {
        "is_food": true,
        "food_data":[
            {
                "title": "菠菜",
                "categories": {
                "全榖雜糧類": "0",
                "豆蛋魚肉類": "0",
                "乳品類": "0",
                "蔬菜類": "1.5",
                "水果類": "0",
                "油脂與堅果種子類": "0"
                }
            },
            {
                "title": "炸雞腿",
                "categories": {
                "全榖雜糧類": "0",
                "豆蛋魚肉類": "3.5",
                "乳品類": "0",
                "蔬菜類": "0",
                "水果類": "0",
                "油脂與堅果種子類": "2"
                }
            },
        ...
        ]
    }
    **如果圖片中沒有辨識到任何食物，請直接回覆以下 JSON 格式：**\n
    {
        "is_food": false,
        "food_data":[]
    }
    請務必依照上述格式回覆，否則系統將無法正確判斷結果。
    """

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        temperature=0.0,
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {
                        "type": "image_url",
                        "image_url": {"url": bimage},
                    },
                ],
            }
        ],
        response_format={
        "type": "json_schema",
        "json_schema": {
            "name": "food_analysis_schema",
            "schema": {
                "type": "object",
                "properties": {
                    "is_food": {"type": "boolean"},
                    "food_data": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "title": {"type": "string"},
                                "categories": {
                                    "type": "object",
                                    "properties": {
                                        "全榖雜糧類": {"type": "number"},
                                        "豆蛋魚肉類": {"type": "number"},
                                        "乳品類": {"type": "number"},
                                        "蔬菜類": {"type": "number"},
                                        "水果類": {"type": "number"},
                                        "油脂與堅果種子類": {"type": "number"}
                                    },
                                    "additionalProperties": False
                                }
                            },"required": ["title", "categories"]
                        }
                    }
                },
                "required": ["is_food", "food_data"]
            }
        }
    }
    )

    print(response)
    return response.choices[0].message.content


def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode("utf-8")


def get_nutrition(bimage):
    response = analyze_food(bimage)
    # with open("response.json", "w") as f:
    #     f.write(response)
    # print(response)
    # Check if the response contains any food categories  
    print(response)
    response_json = json.loads(response)
    return response_json


if __name__ == "__main__":
    img_path = "steak.jpg"
    bimage = encode_image(img_path)
    get_nutrition(bimage)
