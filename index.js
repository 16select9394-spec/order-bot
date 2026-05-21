
const express = require("express");
const line = require("@line/bot-sdk");
const axios = require("axios");

const app = express();

const config = {
  channelAccessToken: "Cbt1J8I6X3pOROsSNJ+xoilxnMdjeaXbo4h+uoEavwYfSqZoh6F+m9/U4UVqaTzUbuCoJTtmdC6qPpdPsQDNegJrTp0/9id1BhUf5Qdo8B6EMFCsgAutkePqYZe+7RUnakCtCvRuVVXOoAi5iBg0IAdB04t89/1O/w1cDnyilFU=",
  channelSecret: "35550c61f3000a0f4c8af1768b0d99a1",
};

const client = new line.Client(config);

const GAS_URL = "https://script.google.com/macros/s/AKfycbw01qHBxBKjHwtQAgMu9ILnonNJHo_HYHSA0JcJTmz9jkFL2mjLJs7oiDHOLFmF2BrC/exec";

app.post("/webhook", line.middleware(config), async (req, res) => {

  const events = req.body.events;

  for (const event of events) {

    if (event.type !== "message") continue;
    if (event.message.type !== "text") continue;

    const msg = event.message.text;
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
        text: "綁定成功✨\n之後直接輸入「查詢」即可",
      }
    );

  } catch (error) {

    console.log(error);

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
    if (msg.startsWith("查詢")) {

      const phone = msg.replace("查詢", "").trim();

      try {

        const response = await axios.get(`${GAS_URL}?phone=${phone}`);

        const data = response.data;

        if (data.length === 0) {

          await client.replyMessage(event.replyToken, {
            type: "text",
            text: "查無進行中訂單",
          });

          continue;
        }

        let replyText = `找到 ${data.length} 筆進行中訂單\n`;

        data.forEach(order => {

          replyText += `
────────

【${order.sheet}】

商品：
${order.product}

數量：
${order.qty}

是否預購：
${order.preorder}

預購發貨日期：
${order.preorderDate || "無"}

目前狀態：
${order.status}

寄送方式：
${order.shipping || "未安排"}

店到店貨運單號：
${order.tracking || "尚未出貨"}
`;
        });

        await client.replyMessage(event.replyToken, {
          type: "text",
          text: replyText,
        });

      } catch (error) {

        console.log(error);

        await client.replyMessage(event.replyToken, {
          type: "text",
          text: "查詢失敗",
        });
      }
    }
  }

  res.sendStatus(200);
});

app.get("/", (req, res) => {
  res.send("Order bot running");
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Order Bot is running");
});