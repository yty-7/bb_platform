// Convert database status id to the meaningful string
export function statusConverter(statusId) {
  switch (statusId) {
    case 0:
      return "active";
    case 1:
      return "inactive";
    case 2:
      return "delete";
    default:
      return "";
  }
}

// Convert database mode id to the meaningful string
export function modeConverter(modeId) {
  switch (modeId) {
    case 0:
      return "Training";
    case 1:
      return "Validation";
    case 2:
      return "Inference";
    default:
      return "";
  }
}

// Convert database platform id to the meaningful string
export function platformConverter(platformId) {
  switch (platformId) {
    case 0:
      return "BlackBird";
    case 1:
      return "PMRobot";
    default:
      return "";
  }
}

// Convert database structure id to the meaningful string
export function structureConverter(structureId) {
  switch (structureId) {
    case 0:
      return "Default";
    case 1:
      return "Variant2";
    default:
      return "";
  }
}

// Convert database viz tech id to the meaningful string
export function vizConverter(vizId) {
  try {
    const vizArrayStr = JSON.parse(vizId);
    const vizArray = Array.from(vizArrayStr);
    const vizStrs = vizArray.map((viz) => {
      switch (parseInt(viz)) {
        case 0:
          return "GradCam";
        case 1:
          return "Gradient";
        default:
          return "";
      }
    });
    return vizStrs.join(" ");
  } catch (e) {
    // console.log(e);
    return "";
  }
}

// Convert database annotation format id to the meaningful string
export function annotationConverter(annotationId) {
  switch (annotationId) {
    case 0:
      return "LabelBox";
    case 1:
      return "VIA";
    case 2:
      return "MATLAB";
    default:
      return "";
  }
}

// Convert database pytorch model type id to the meaningful string
export function modelTypeConverter(typeId) {
  switch (typeId) {
    case 0:
      return "SqueezeNet";
    case 1:
      return "GoogleNet";
    case 2:
      return "ResNet";
    case 3:
      return "VGG";
    case 4:
      return "AlexNet";
    default:
      return "";
  }
}

// Convert database metric type id to the meaningful string
export function metricTypeConverter(typeId) {
  switch (typeId) {
    case 0:
      return "Patch";
    case 1:
      return "Pixel1";
    case 2:
      return "Pixel2";
    default:
      return "";
  }
}

// Convert analysis thread status id to the meaningful string
export function threadConverter(typeId) {
  switch (typeId) {
    case "D":
      return "Done";
    case "R":
      return "Running";
    case "F":
      return "Failure";
    default:
      return "";
  }
}

// Check an object {} is empty or not
export function isEmpty(obj) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) return false;
  }
  return true;
}

export function getFilename(filepath) {
  try {
    const filepathStrs = filepath.split("/");
    return filepathStrs[filepathStrs.length - 1];
  } catch (e) {
    return "";
  }
}
