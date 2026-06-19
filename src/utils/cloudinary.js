import cloudinary from "../config/cloudinary.config.js";

// Root folder per project (prevents mixing between projects)
const PROJECT_ROOT = process.env.CLOUDINARY_PROJECT_FOLDER || "default-project";

/**
 * Build structured folder path
 * Example:
 * default-project/packages/makkah
 */
const buildFolder = (folder = "") => {
  return folder ? `${PROJECT_ROOT}/${folder}` : PROJECT_ROOT;
};

/**
 * Upload file to Cloudinary with project isolation
 */
export const uploadToCloudinary = async (filePath, folder = "", options = {}) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: buildFolder(folder),
      resource_type: "image",
      ...options,
    });

    return {
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Delete single image
 */
export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);

    return {
      success: true,
      result,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Delete entire folder (project-safe)
 */
export const deleteCloudinaryFolder = async (folder) => {
  try {
    const fullPath = buildFolder(folder);

    await cloudinary.api.delete_resources_by_prefix(fullPath);
    await cloudinary.api.delete_folder(fullPath);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};