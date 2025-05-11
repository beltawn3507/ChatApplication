import { v2 as cloudinary } from 'cloudinary';

import { config } from 'dotenv';

config();

console.log('CLOUDINARY_API_KEY exists:', !!process.env.CLOUDINARY_API_KEY);

cloudinary.config({
    cloud_name:"dh0m3sxjv",
    api_key:"666418353289922",
    api_secret:"0QoAIHbVfrYjrPwgUir1bC-yljo",
});

export default cloudinary