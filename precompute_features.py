import torch
import clip
from PIL import Image
import os
import numpy as np

# Set the device to GPU if available, otherwise use CPU
device = "cuda" if torch.cuda.is_available() else "cpu"

# Load the CLIP model and preprocessing pipeline
model, preprocess = clip.load("ViT-B/32", device=device)

# Configuration
base_folder = "keyframes"
subfolders = [f"{i:05d}" for i in range(100, 200)]  # Subfolders from 00100 to 00199
image_paths = []

# Collect paths of all .jpg images in the subfolders
for subfolder in subfolders:
    folder_path = os.path.join(base_folder, subfolder)
    for filename in os.listdir(folder_path):
        if filename.endswith('.jpg'):
            image_paths.append(os.path.join(folder_path, filename))

def preprocess_images(image_paths):
    """
    Preprocess images for CLIP model.

    Args:
        image_paths (list): List of paths to image files.

    Returns:
        list: List of tuples containing image paths and preprocessed images.
    """
    images = []
    for image_path in image_paths:
        image = Image.open(image_path)
        image = preprocess(image).unsqueeze(0).to(device)
        images.append((image_path, image))
    return images

# Preprocess all images
images = preprocess_images(image_paths)

# Extract and save image features using the CLIP model
image_features = {}
with torch.no_grad():
    for image_path, image in images:
        image_features[image_path] = model.encode_image(image).cpu().numpy()

# Save the image features to a .npy file
np.save('image_features.npy', image_features)
