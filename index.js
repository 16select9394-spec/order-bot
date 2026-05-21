const express = require("express");
const line = require("@line/bot-sdk");
const axios = require("axios");

const app = express();

const config = {
  channelAccessToken:
    "kAKDXeAko7i9UGGDyij2zXJbucqiHekiPhQCc4mfMx21itxfo8Sj6OERrtySQrxFbuCoJTtmdC6qPpdPsQDNegJrTp0/9id1BhUf5Qdo8B5fI0ouYPkyBeFmFynG0R0aCfZyyus5CQE1EpB/rfCD8gdB04t89/1O/w1cDnyilFU=",

  channelSecret:
    "35550c61f3000a0f4c8af1768b0d99a1",
};

const client = new line.Client(config);

const GAS_URL =
  "https://script.google.com/macros/s/AKfycbw01qHBxBKjHwtQAgMu9ILnonNJHo_HYHSA0JcJTmz9jkFL2mjLJs7oiDHOLFmF2BrC/exec";

app.post(
  "/webhook",
  line.middleware(config),
  async (req, res) => {

    try {

      const events = req.body.events;

      for (const event of events) {

        if (event.type !== "message") continue;
        if (event.message.type !== "text") continue;

        const msg = event.message.text.trim();

// =====================
// 綁定
// =====================

if (msg.startsWith("綁定")) {

  const phone =
    msg.replace("綁定", "").trim();

  try {

    await axios.get(
      `${GAS_URL}?action=bind&phone=${phone}&userId=${event.source.userId}`
    );

    await client.replyMessage(
      event.replyToken,
      {
        type: "text",
        text: "綁定成功✨",
      }
    );

  } catch (err) {

    console.log(err);

    await client.replyMessage(
      event.replyToken,
      {
        type: "text",
        text: "綁定失敗",
      }
    );
  }

  continue;
}


    // =====================
// 查詢已綁定電話
// =====================

if (msg === "查詢") {

  try {

    const bindRes = await axios.get(
      `${GAS_URL}?action=getPhone&userId=${event.source.userId}`
    );

    const data = bindRes.data;

    if (!data.phone) {

      await client.replyMessage(
        event.replyToken,
        {
          type: "text",
          text: "請先輸入：綁定 你的電話",
        }
      );

      continue;
    }

    const result = await axios.get(
      `${GAS_URL}?phone=${data.phone}`
    );

    await client.replyMessage(
      event.replyToken,
      {
        type: "text",
        text: result.data,
      }
    );

  } catch (err) {

    console.log(err);

    await client.replyMessage(
      event.replyToken,
      {
        type: "text",
        text: "查詢失敗",
      }
    );
  }

  continue;
}

// =====================
// 直接查電話
// =====================

if (msg.startsWith("查詢 ")) {

  const phone =
    msg.replace("查詢", "").trim();

  try {

    const result = await axios.get(
      `${GAS_URL}?phone=${phone}`
    );

    await client.replyMessage(
      event.replyToken,
      {
        type: "text",
        text: result.data,
      }
    );

  } catch (err) {

    console.log(err);

    await client.replyMessage(
      event.replyToken,
      {
        type: "text",
        text: "查詢失敗",
      }
    );
  }

  continue;
}
      res.status(200).end();

    } catch (err) {

      console.log(err);
      res.status(500).end();
    }
  }
);

app.get("/", (req, res) => {
  res.send("bot running");
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`running ${port}`);
});