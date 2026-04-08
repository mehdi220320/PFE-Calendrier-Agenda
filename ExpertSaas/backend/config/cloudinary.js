const {v2: cloudinary} = require("cloudinary");
const streamifier = require("streamifier");
const uploadToCloudinary = (fileBuffer) => {
    const folder_name = process.env.CLOUDINARY_FOLDER_NAME || "AGENDA";

    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: folder_name, resource_type: "auto" },
            (error, result) => {
                if (result) resolve(result);
                else reject(error);
            }
        );

        streamifier.createReadStream(fileBuffer).pipe(stream);
    });
};
module.exports = uploadToCloudinary;