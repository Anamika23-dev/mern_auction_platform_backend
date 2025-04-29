import mongoose from "mongoose";

export const connection =async () => {
  try{

  
 await  mongoose
    .connect(process.env.MONGO_URI, {
      dbName: "MERN_AUCTION_PLATFORM",
    });
    
      console.log("Connected to database.");
    }
    catch(err){
      console.log(`Some error occured while connecting to database: ${err}`);
    }
};
