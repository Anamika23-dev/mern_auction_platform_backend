import cron from "node-cron";
import { Auction } from "../models/auctionSchema.js";
import { User } from "../models/userSchema.js";
import { Bid } from "../models/bidSchema.js";
import { sendEmail } from "../utils/sendEmail.js";
import { calculateCommission } from "../controllers/commissionController.js";

export const endedAuctionCron = () => {
  cron.schedule("*/1 * * * *", async () => {
    console.log("Cron for ended auction running...");
    const now = new Date();

    try {
      const endedAuctions = await Auction.find({
        endTime: { $lt: now },
        commissionCalculated: false,
      });

      for (const auction of endedAuctions) {
        const highestBidder = await Bid.findOne({
          auctionItem: auction._id,
          amount: auction.currentBid,
        });

        if (highestBidder) {
          const commissionAmount = await calculateCommission(auction._id);
          const auctioneer = await User.findById(auction.createdBy);
          const bidder = await User.findById(highestBidder.bidder.id);

          // Update auction info
          auction.highestBidder = bidder._id;
          auction.commissionCalculated = true;
          await auction.save();

          // Update auctioneer unpaid commission
          await User.findByIdAndUpdate(
            auctioneer._id,
            { $inc: { unpaidCommission: commissionAmount } },
            { new: true }
          );

          // Update bidder stats
          await User.findByIdAndUpdate(
            bidder._id,
            {
              $inc: {
                moneySpent: highestBidder.amount,
                auctionsWon: 1,
              },
            },
            { new: true }
          );

          // Send email
          const subject = `🎉 Congratulations! You won the auction for ${auction.title}`;
          const message = `Dear ${bidder.userName},\n\nCongratulations! You have won the auction for **${auction.title}**.\n\n📞 Contact the auctioneer at: ${auctioneer.email}\n\n💰 Please make payment using one of the following methods:\n\n1. **Bank Transfer**:\n- Account Name: ${auctioneer.paymentMethods?.bankTransfer?.bankAccountName || "N/A"}\n- Account Number: ${auctioneer.paymentMethods?.bankTransfer?.bankAccountNumber || "N/A"}\n- Bank: ${auctioneer.paymentMethods?.bankTransfer?.bankName || "N/A"}\n\n2. **Easypaisa**: ${auctioneer.paymentMethods?.easypaisa?.easypaisaAccountNumber || "N/A"}\n\n3. **PayPal**: ${auctioneer.paymentMethods?.paypal?.paypalEmail || "N/A"}\n\n4. **Cash on Delivery (COD)**:\n- Pay 20% upfront via any method above.\n- 80% due at delivery.\n\nIf you want to inspect your auction item, email: ${auctioneer.email}\n\n⏳ Please complete the payment as soon as possible.\n\nThank you for bidding!\n\nBest,\nZeeshu Auction Team`;

          console.log("📨 SENDING EMAIL TO HIGHEST BIDDER");
          await sendEmail({ email: bidder.email, subject, message });
          console.log("✅ EMAIL SENT SUCCESSFULLY TO:", bidder.email);
        } else {
          // No bids, just mark auction as processed
          auction.commissionCalculated = true;
          await auction.save();
        }
      }
    } catch (error) {
      console.error("❌ Error in ended auction cron job:", error);
    }
  });
};
