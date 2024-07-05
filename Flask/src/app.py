from flask import Flask, send_from_directory
import os
import random

app = Flask(__name__)

# 假设你的图片存储在 'static/images' 目录下
IMAGE_FOLDER = '../static'

@app.route('/api/random-image')
def random_image():
    # 获取所有图片文件名
    images = [f for f in os.listdir(IMAGE_FOLDER + '/img') if os.path.isfile(os.path.join(IMAGE_FOLDER + '/img', f))]
    # 随机选择一张图片
    selected_image = random.choice(images)
    print(selected_image)
    # 返回图片
    # return send_from_directory(directory=IMAGE_FOLDER, path='img/'+ selected_image)
    return selected_image

@app.route('/api/random-image/<filename>')
def random_imag_dynamic(filename):
    # 获取所有图片文件名
    images = [f for f in os.listdir(IMAGE_FOLDER + '/img') if os.path.isfile(os.path.join(IMAGE_FOLDER + '/img', f))]
    # 随机选择一张图片
    selected_image = random.choice(images)
    print(selected_image)
    # 返回图片
    return send_from_directory(directory=IMAGE_FOLDER, path='img/'+ filename)
                               
if __name__ == '__main__':
    app.run(debug=True)