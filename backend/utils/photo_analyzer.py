import cv2
import numpy as np
from typing import Dict, List

def analyze_photo(image_path: str) -> Dict:
    """Analyze profile photo for professionalism"""
    try:
        # Read image
        img = cv2.imread(image_path)
        if img is None:
            return {'success': False, 'error': 'Could not read image'}
        
        # Convert to RGB
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        img_gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Calculate scores
        professionalism_score = analyze_professionalism(img_rgb, img_gray)
        lighting_score = analyze_lighting(img_gray)
        background_score = analyze_background(img_rgb)
        composition_score = analyze_composition(img_gray)
        
        overall_score = (professionalism_score + lighting_score + background_score + composition_score) // 4
        
        feedback = generate_feedback(professionalism_score, lighting_score, background_score, composition_score)
        suggestions = generate_suggestions(professionalism_score, lighting_score, background_score, composition_score)
        
        return {
            'success': True,
            'professionalism': professionalism_score,
            'lighting': lighting_score,
            'background': background_score,
            'composition': composition_score,
            'overall': overall_score,
            'feedback': feedback,
            'suggestions': suggestions
        }
    except Exception as e:
        return {
            'success': False,
            'error': f'Error analyzing photo: {str(e)}'
        }

def analyze_professionalism(img_rgb, img_gray) -> int:
    """Analyze professionalism based on color and contrast"""
    # Check for neutral background (using color variance)
    height, width = img_gray.shape
    center_region = img_gray[height//4:3*height//4, width//4:3*width//4]
    
    contrast = np.std(center_region)
    professionalism = min(int((contrast / 50) * 100), 100)
    
    # Add bonus for neutral colors
    hsv = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2HSV)
    neutral_mask = cv2.inRange(hsv, np.array([0, 0, 50]), np.array([180, 50, 200]))
    neutral_ratio = np.sum(neutral_mask) / (height * width)
    
    if neutral_ratio > 0.3:
        professionalism = min(professionalism + 15, 100)
    
    return max(professionalism, 50)

def analyze_lighting(img_gray) -> int:
    """Analyze lighting quality"""
    # Calculate brightness
    brightness = np.mean(img_gray)
    
    # Ideal brightness between 100-200
    if 100 <= brightness <= 200:
        lighting = 95
    elif 80 <= brightness <= 220:
        lighting = 85
    elif 60 <= brightness <= 240:
        lighting = 75
    else:
        lighting = 50
    
    # Check for shadow uniformity
    _, binary = cv2.threshold(img_gray, 127, 255, cv2.THRESH_BINARY)
    contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    if len(contours) > 0:
        # If contours are not too fragmented, lighting is good
        lighting = min(lighting + 5, 100)
    
    return lighting

def analyze_background(img_rgb) -> int:
    """Analyze background simplicity"""
    # Convert to HSV for color analysis
    hsv = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2HSV)
    
    # Count unique colors (lower is better)
    h_channel = hsv[:, :, 0]
    unique_hues = len(np.unique(h_channel))
    
    # Normalize to 0-100 (fewer unique hues = higher score)
    background = max(100 - (unique_hues // 3), 60)
    
    # Check if background is blurred (professional backgrounds are often blurred)
    laplacian = cv2.Laplacian(img_rgb[:, :, 0], cv2.CV_64F)
    blur_score = np.var(laplacian)
    
    if blur_score < 100:  # Blurred background
        background = min(background + 10, 100)
    
    return background

def analyze_composition(img_gray) -> int:
    """Analyze photo composition (face centering, rule of thirds)"""
    height, width = img_gray.shape
    
    # Check for face-like patterns using edge detection
    edges = cv2.Canny(img_gray, 100, 200)
    
    # Check if there's good content in center regions
    center_h = height // 3
    center_w = width // 3
    
    # Rule of thirds regions
    regions = [
        edges[center_h:2*center_h, center_w:2*center_w],
        edges[center_h:2*center_h, :center_w],
        edges[center_h:2*center_h, 2*center_w:],
    ]
    
    edge_counts = [np.sum(r > 0) for r in regions]
    center_edge_ratio = edge_counts[0] / (np.sum(edges > 0) + 1)
    
    composition = int(center_edge_ratio * 100)
    composition = max(min(composition + 20, 100), 50)
    
    return composition

def generate_feedback(prof, light, bg, comp) -> List[str]:
    """Generate positive feedback"""
    feedback = []
    
    if prof >= 80:
        feedback.append("✓ Professional appearance maintained")
    if light >= 85:
        feedback.append("✓ Excellent lighting quality")
    if bg >= 80:
        feedback.append("✓ Clean, simple background")
    if comp >= 80:
        feedback.append("✓ Good photo composition")
    if all(score >= 80 for score in [prof, light, bg, comp]):
        feedback.append("✓ Overall excellent profile photo")
    
    if not feedback:
        feedback.append("✓ Photo is suitable for professional use")
    
    return feedback

def generate_suggestions(prof, light, bg, comp) -> List[str]:
    """Generate improvement suggestions"""
    suggestions = []
    
    if prof < 80:
        suggestions.append("Wear professional attire (business casual or formal)")
    if light < 85:
        suggestions.append("Improve lighting - use natural light or professional lighting setup")
    if bg < 80:
        suggestions.append("Use a clean, neutral background without distractions")
    if comp < 80:
        suggestions.append("Ensure your face takes up about 60-70% of the frame")
    if all(score < 75 for score in [prof, light, bg, comp]):
        suggestions.append("Consider retaking the photo with professional assistance")
    
    if not suggestions:
        suggestions.append("Photo looks great! Consider using it on LinkedIn and other professional profiles")
    
    return suggestions
