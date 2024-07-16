import torch
from transformers import BlipProcessor, BlipForConditionalGeneration
from PIL import Image
import sys

def generate_image_description(image_path):
    # Check if CUDA is available and use it if possible
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    # Load the pre-trained BLIP model and processor
    processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
    model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base").to(device)

    # Open the image file
    image = Image.open(image_path)

    # Process the image
    inputs = processor(images=image, return_tensors="pt").to(device)

    # Generate image description with longer captions
    generation_kwargs = {
        "max_length": 100,  # Increase maximum length of the caption
        "min_length": 20,   # Set minimum length of the caption
        "num_beams": 5,     # Use beam search for better quality
        "early_stopping": True
    }

    with torch.no_grad():
        out = model.generate(**inputs, **generation_kwargs)
    description = processor.decode(out[0], skip_special_tokens=True)

    return description

if __name__ == "__main__":
    image_path = sys.argv[1]
    description = generate_image_description(image_path)
    print(description)

