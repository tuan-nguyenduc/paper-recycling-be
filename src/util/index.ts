import * as fs from "fs";

export const validateImage = (file: any) => {
  // Array of allowed files
  const array_of_allowed_files = ['png', 'jpeg', 'jpg', 'gif'];
  const array_of_allowed_file_types = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
  // Allowed file size in mb
  const allowed_file_size = 5;
  // Get the extension of the uploaded file
  const file_extension = file.originalname.slice(
    ((file.originalname.lastIndexOf('.') - 1) >>> 0) + 2
  );
  // Check if the uploaded file is allowed
  if (!array_of_allowed_files.includes(file_extension) || !array_of_allowed_file_types.includes(file.mimetype)) {
    //delete file
    fs.unlinkSync(file.path)
    throw Error('Invalid file');
  }

  if ((file.size / (1024 * 1024)) > allowed_file_size) {
    //delete file
    fs.unlinkSync(file.path)
    throw Error('File too large');
  }
  return true;
}

export const fromWeightToPaperPoint = (weight: number) => {
  return weight * 1000;
}
