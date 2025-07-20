from PIL import Image
from io import BytesIO
import numpy as np
import cv2
import rembg

def apply_evanesco(image: Image.Image) -> Image.Image:
    buf = BytesIO()
    image.save(buf, format='PNG')
    img_data = buf.getvalue()
    output_data = rembg.remove(img_data)
    return Image.open(BytesIO(output_data)).convert("RGB")

def apply_pictorifica(image: Image.Image) -> Image.Image:
    img = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    inv = 255 - gray
    blur = cv2.GaussianBlur(inv, (21, 21), 0)
    sketch = cv2.divide(gray, 255 - blur, scale=256)
    sketch_rgb = cv2.cvtColor(sketch, cv2.COLOR_GRAY2RGB)
    return Image.fromarray(sketch_rgb)

def apply_lumos(image: Image.Image) -> Image.Image:
    img = np.array(image)
    glow = cv2.GaussianBlur(img, (0, 0), sigmaX=15, sigmaY=15)
    result = cv2.addWeighted(img, 1.0, glow, 0.6, 0)
    return Image.fromarray(result)

def apply_serpensortia(image: Image.Image) -> Image.Image:
    green_overlay = Image.new('RGB', image.size, (0, 100, 0))
    return Image.blend(image, green_overlay, alpha=0.3)

def apply_spell(spell: str, image: Image.Image) -> Image.Image:
    spell = spell.lower()
    if spell == 'evanesco':
        return apply_evanesco(image)
    elif spell == 'pictorifica':
        return apply_pictorifica(image)
    elif spell == 'lumos':
        return apply_lumos(image)
    elif spell == 'serpensortia':
        return apply_serpensortia(image)
    else:
        raise ValueError(f"Unknown spell: {spell}")
