import app from "./app.js";
import dotenv from "dotenv";
dotenv.config();
import cloudinary from "cloudinary";
import {connection }from './database/connection.js';
cloudinary.v2.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET ,
});
const port = process.env.PORT || 5000;
app.listen(port,() => {
   console.log(`Server listening on port ${port}`);
  
  });
  


  
