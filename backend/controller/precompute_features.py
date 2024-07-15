import torch
import clip
from PIL import Image
import os
import numpy as np

device = "cuda" if torch.cuda.is_available() else "cpu"
model, preprocess = clip.load("ViT-B/32", device=device)

base_folder = "keyframes"
subfolders = [f"{i:05d}" for i in range(100, 200)]
image_paths = []

for subfolder in subfolders:
    folder_path = os.path.join(base_folder, subfolder)
    for filename in os.listdir(folder_path):
        if filename.endswith('.jpg'):
            image_paths.append(os.path.join(folder_path, filename))

def preprocess_images(image_paths):
    images = []
    for image_path in image_paths:
        image = Image.open(image_path)
        image = preprocess(image).unsqueeze(0).to(device)
        images.append((image_path, image))
    return images

images = preprocess_images(image_paths)

image_features = {}
with torch.no_grad():
    for image_path, image in images:
        image_features[image_path] = model.encode_image(image).cpu().numpy()

np.save('image_features.npy', image_features)
