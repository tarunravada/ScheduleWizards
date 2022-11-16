import pickle
import os
import cv2
import matplotlib.pyplot as plt

def load_img_resp(path, file_name):
    img_file = os.path.join(path, 'images', file_name)
    resp_file = os.path.join(path,'resp', f'{os.path.splitext(file_name)[0]}_resp.pkl')
    resp = pickle.load(open(resp_file, 'rb'))
    img = cv2.imread(img_file)
    return img, resp

def show_img(img, size):
    plt.figure(figsize=(size,size))
    plt.axis('off')
    plt.imshow(img[...,::-1])