import sys
import json
import torch
import clip
import numpy as np

# Set device to GPU if available, otherwise use CPU
device = "cuda" if torch.cuda.is_available() else "cpu"

# Load the CLIP model and preprocessing pipeline
model, preprocess = clip.load("ViT-B/32", device=device)

# Load precomputed image features from a .npy file
image_features = np.load('image_features.npy', allow_pickle=True).item()

def search_images(text_query, model, image_features):
    """
    Search for images that best match a text query using CLIP.

    Args:
        text_query (str): The text query to search for.
        model (clip.model): The CLIP model used for encoding.
        image_features (dict): Precomputed image features.

    Returns:
        list: A list of tuples containing image paths and their similarity scores, sorted by similarity.
    """
    # Tokenize and encode the text query using CLIP
    text = clip.tokenize([text_query]).to(device)
    with torch.no_grad():
        text_features = model.encode_text(text).cpu().numpy()

    similarities = []
    for image_path, image_feature in image_features.items():
        similarity = np.dot(image_feature, text_features.T)
        similarities.append((image_path, similarity.item()))

    # Sort similarities in descending order and return the top 5 results
    similarities.sort(key=lambda x: x[1], reverse=True)
    return similarities[:5]

if __name__ == "__main__":
    # Get the search query from command line arguments
    query = sys.argv[1]
    results = search_images(query, model, image_features)
    print(json.dumps(results))
