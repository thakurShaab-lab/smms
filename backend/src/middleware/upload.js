import multer from 'multer';
import { env } from '../config/env.js';
import { BadRequestError } from '../utils/errors.js';

const storage = multer.memoryStorage();

function fileFilterFactory(allowedTypes) {
  return function fileFilter(req, file, callback) {
    if (!allowedTypes.includes(file.mimetype)) {
      callback(new BadRequestError(`Unsupported file type: ${file.mimetype}`));
      return;
    }
    callback(null, true);
  };
}

const maxSizeBytes = env.uploads.maxUploadSizeMb * 1024 * 1024;

const allAllowedTypes = [
  ...env.uploads.allowedImageTypes,
  ...env.uploads.allowedVideoTypes,
  ...env.uploads.allowedDocumentTypes,
  ...env.uploads.allowedAudioTypes
];

export const uploadMedia = multer({
  storage,
  limits: { fileSize: maxSizeBytes },
  fileFilter: fileFilterFactory(allAllowedTypes)
});

export const uploadFaceImage = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: fileFilterFactory(env.uploads.allowedImageTypes)
});

export const uploadVoiceSample = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: fileFilterFactory(env.uploads.allowedAudioTypes)
});
