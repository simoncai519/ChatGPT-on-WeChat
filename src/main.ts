import QRCode from "qrcode";
import { WechatyBuilder } from "wechaty";
import { ChatGPTBot } from "./chatgpt.js";

export let chatHistory: {[name: string]: [string]} = {};

// Wechaty instance
const weChatBot = WechatyBuilder.build({
  name: "my-wechat-bot",
});
// ChatGPTBot instance
const chatGPTBot = new ChatGPTBot();

async function main() {
  weChatBot
    // scan QR code for login
    .on("scan", async (qrcode, status) => {
      const url = `https://wechaty.js.org/qrcode/${encodeURIComponent(qrcode)}`;
      console.log(`💡 Scan QR Code to login: ${status}\n${url}`);
      console.log(
        await QRCode.toString(qrcode, { type: "terminal", small: true })
      );
    })
    // login to WeChat desktop account
    .on("login", async (user: any) => {
      console.log(`✅ User ${user} has logged in`);
      chatGPTBot.setBotName(user.name());
      await chatGPTBot.startGPTBot();
      // setInterval(sendScheduledMessage, 60000); // Send a message every 60 seconds (1 minute)
    })
    // message handler
    .on("message", async (message: any) => {
      try {
        console.log(`📨 ${message}`);
        // handle message for customized task handlers
        await chatGPTBot.onCustimzedTask(message);
        // handle message for chatGPT bot
        await chatGPTBot.onMessage(message);
      } catch (e) {
        console.error(`❌ ${e}`);
      }
    // send message on a fixed schedule
    
    });

  try {
    await weChatBot.start();
  } catch (e) {
    console.error(`❌ Your Bot failed to start: ${e}`);
    console.log(
      "🤔 Can you login WeChat in browser? The bot works on the desktop WeChat"
    );
  }
}

// Function to send a scheduled message
async function sendScheduledMessage() {
  // Replace 'YOUR_MESSAGE' with the message you want to send
  const message = '陪我聊天';

  // Replace 'CONTACT_NAME' with the name of the contact you want to send the message to
  const contact = await weChatBot.Contact.find({ name: '蔡文光' });
  

  if (contact) {
    try {
      await contact.say(message);
      console.log(`Scheduled message sent to ${contact.name()}`);
      chatHistory[contact.name()].push("我："+message);
    } catch (e) {
      console.error(`Failed to send scheduled message to ${contact.name()}: ${e}`);
    }
  } else {
    console.error('Contact not found');
  }
}

main();
