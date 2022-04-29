# Image dimensions
CHANNELS = 3
IMG_WIDTH = 224
IMG_HEIGHT = 224
INPUT_SIZE = (IMG_WIDTH, IMG_HEIGHT)

# Image extension
IMG_EXT = '.jpg'
IMG_ORI_EXT = '.tif'

# Meta CSV cols
META_COL_NAMES = ['id', 'filename', 'patch_id', 'class_id', 'subset']

# Label to class mapping
LABEL_CLASS_MAP = {'Clear': 0, 'Infected': 1}
