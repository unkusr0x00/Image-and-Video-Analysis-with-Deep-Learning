import sys
import json
import torch
import clip
import numpy as np

device = "cuda" if torch.cuda.is_available() else "cpu"
model, preprocess = clip.load("ViT-B/32", device=device)

# Load precomputed image features
image_features = np.load('image_features.npy', allow_pickle=True).item()

def search_images(text_query, model, image_features):
    text = clip.tokenize([text_query]).to(device)
    with torch.no_grad():
        text_features = model.encode_text(text).cpu().numpy()

    similarities = []
    for image_path, image_feature in image_features.items():
        similarity = np.dot(image_feature, text_features.T)
        similarities.append((image_path, similarity.item()))

    similarities.sort(key=lambda x: x[1], reverse=True)
    return similarities[:5]  # Top 5 Ergebnisse

if __name__ == "__main__":
    query = sys.argv[1]
    results = search_images(query, model, image_features)
    print(json.dumps(results))
