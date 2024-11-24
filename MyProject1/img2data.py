import base64
from io import BytesIO

import requests
from keys import OPENAI_API_KEY
from openai import OpenAI
from PIL import Image

client = OpenAI(api_key=OPENAI_API_KEY)


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

    回覆需為 JSON 格式，請直接輸出 JSON 內容，不要輸出任何多餘的文字。\n
    數值請勿回覆區間，只能回覆單一整數或小數。\n
    下列為輸出範例：\n
    {
        "菠菜": {
            "全榖雜糧類": "0",
            "豆蛋魚肉類": "0",
            "乳品類": "0",
            "蔬菜類": "1.5",
            "水果類": "0",
            "油脂與堅果種子類": "0"
        },
        "炸雞腿": {
            "全榖雜糧類": "0",
            "豆蛋魚肉類": "3.5",
            "乳品類": "0",
            "蔬菜類": "0",
            "水果類": "0",
            "油脂與堅果種子類": "2"
        },
        ...
    }
    請務必依照上述格式回覆，否則系統將無法正確判斷結果。
    """

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {OPENAI_API_KEY}",
    }
    payload = {
        "model": "gpt-4o-mini",
        "messages": [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {
                        "type": "image_url",
                        "image_url": {"url": f"{bimage}"},
                    },
                ],
            }
        ],
    }

    response = requests.post(
        "https://api.openai.com/v1/chat/completions", headers=headers, json=payload
    )

    # print(response.json())
    return response.json().get("choices")[0].get("message").get("content")


def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode("utf-8")


def get_nutrition(bimage):
    response = analyze_food(bimage)
    # with open("response.json", "w") as f:
    #     f.write(response)
    # print(response)
    return response


if __name__ == "__main__":
    img_path = "bento.jpg"
    bimage = encode_image(img_path)
    get_nutrition(bimage)
