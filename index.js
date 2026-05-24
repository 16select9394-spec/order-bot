const express = require("express");
const line = require("@line/bot-sdk");
const axios = require("axios");

const app = express();

const config = {
  channelAccessToken: "JvBORLammhghSsrk1xJnuChZ+7xRplqpK2D0vujNMNvfintLD7paRjprVWJxD7CJNKhx4T2Xj0uOjeYgovzBAaR9LfdEtDFzJLq9b5OWId5jWs+wVNdrZH5vSD7Li+AEgkNti7CaPZWgEmxbFBlqegdB04t89/1O/w1cDnyilFU=",
  channelSecret: "b438e4a8a038be4b3785482501defe45",
};

const client = new line.Client(config);

const GAS_URL = "https://script.google.com/macros/s/AKfycbw01qHBxBKjHwtQAgMu9ILnonNJHo_HYHSA0JcJTmz9jkFL2mjLJs7oiDHOLFmF2BrC/exec";

app.post("/webhook", line.middleware(config), async (req, res) => {

  try {

    const events = req.body.events;

    for (const event of events) {

      if (event.type !== "message") continue;
      if (event.message.type !== "text") continue;

      const msg = event.message.text.trim();

if (msg === "更多功能") {

  await client.replyMessage(
    event.replyToken,
    {
      type: "image",
      originalContentUrl: "https://你的圖片網址.png",
      previewImageUrl: "https://你的圖片網址.png"
    }
  );

  continue;
}

      // =========================
      // 綁定
      // =========================

      if (msg.startsWith("綁定")) {

        const phone = msg.replace("綁定", "").trim();

        try {

          await axios.get(
            `${GAS_URL}?action=bind&phone=${phone}&userId=${event.source.userId}`
          );

          await client.replyMessage(
            event.replyToken,
            {
              type: "text",
              text: "綁定成功✨可以開始查詢囉"
            }
          );

        } catch (err) {

          console.log(err);

          await client.replyMessage(
            event.replyToken,
            {
              type: "text",
              text: "綁定失敗"
            }
          );
        }

        continue;
      }

      // =========================
      // 查詢
      // =========================

      if (msg === "查詢") {

        try {

          // 先取得綁定電話
          const bindResult = await axios.get(
            `${GAS_URL}?action=getPhone&userId=${event.source.userId}`
          );

          const phone = bindResult.data.phone;

          // 沒綁定
          if (!phone) {

            await client.replyMessage(
              event.replyToken,
              {
                type: "text",
                text: "請先輸入：綁定 09xxxxxxxx"
              }
            );

            continue;
          }

          // 查詢資料
          const result = await axios.get(
            `${GAS_URL}?phone=${phone}`
          );

          await client.replyMessage(
            event.replyToken,
            {
              type: "text",
              text: result.data
            }
          );

        } catch (err) {

          console.log(err);

          await client.replyMessage(
            event.replyToken,
            {
              type: "text",
              text: "查詢失敗"
            }
          );
        }

        continue;
      }
    }

    res.status(200).end();

  } catch (err) {

    console.log(err);

    res.status(500).end();
  }
});

app.get("/", (req, res) => {
  res.send("bot running");
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`running ${port}`);
});