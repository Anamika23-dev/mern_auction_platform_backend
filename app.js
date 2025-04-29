import {config} from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import fileupload from "express-fileupload";
import { connection } from "./database/connection.js";
import { errorMiddleware} from "./middlewares/error.js";
import userRouter from "./router/userRoutes.js";
import auctionItemRouter from "./router/auctionItemRoutes.js";
import bidRouter from "./router/bidRoutes.js";
import commissionRouter from "./router/commissionRouter.js";
import superAdminRouter from "./router/superAdminRoutes.js";
import { endedAuctionCron } from "./automation/endedAuctionCron.js";
import { verifyCommissionCron } from "./automation/verifyCommissionCron.js";

//import dotenv from "dotenv"; // If using ES modules

//dotenv.config();
const app = express();
config({
    path:"./config/config.env",
});
app.use(cors({
    origin:[process.env.FRONTEND_URL],
    methods:["POST","GET","PUT","DELETE"],
    credentials:true,

}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(
    fileupload
    
  ({
        useTempFiles:true,
        tempFileDir:"/temp/",
    })
);
app.use("/api/v1/user",userRouter);
app.use("/api/v1/auctionitem", auctionItemRouter);
app.use("/api/v1/bid", bidRouter);
app.use("/api/v1/commission", commissionRouter);
app.use("/api/v1/superAdmin", superAdminRouter);


endedAuctionCron();
verifyCommissionCron();
connection();

const sendEmail = async () => {
    const subject = 'Test Email';
    const message = 'This is a test email message.';
    const recipientEmail = 'recipient@example.com'; // Replace with a valid recipient email
  
    try {
      console.log('Sending test email...');
      await sendEmail({ email: recipientEmail, subject, message });
      console.log('Test email sent successfully!');
    } catch (error) {
      console.error('Error sending test email:', error);
    }
  };
  


app.use(errorMiddleware);
export default app;

