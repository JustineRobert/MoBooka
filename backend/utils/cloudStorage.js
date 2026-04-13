const path = require('path');
const fs = require('fs');

const uploadFile = async ({ file, folder }) => {
  const uploadsDir = path.join(__dirname, '..', 'uploads', folder);
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  const fileName = `${Date.now()}-${file.originalname}`;
  const filePath = path.join(uploadsDir, fileName);
  fs.writeFileSync(filePath, file.buffer);
  return `/uploads/${folder}/${fileName}`;
};

module.exports = { uploadFile };
