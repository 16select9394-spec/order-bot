const express = require("express");
const line = require("@line/bot-sdk");
const axios = require("axios");

const app = express();

const config = {
  channelAccessToken: "Cbt1J8I6X3pOROsSNJ+xoilxnMdjeaXbo4h+uoEavwYfSqZoh6F+m9/U4UVqaTzUbuCoJTtmdC6qPpdPsQDNegJrTp0/9id1BhUf5Qdo8B6EMFCsgAutkePqYZe+7RUnakCtCvRuVVXOoAi5iBg0IAdB04t89/1O/w1cDnyilFU=",
  channelSecret: "35550c61f3000a0f4c8af1768b0d99a1",
};

const client = new line.Client(config);

const GAS_URL = "你的AppsScript網址";

app.post("/webhook", line.middleware(config), async (req, res) => {

  const events = req.body.events;

  for (const event of events) {

    if (event.type !== "message") continue;
    if (event.message.type !== "text") continue;

    const msg = event.message.text;

    // ===== 綁定 =====
    if (msg.startsWith("綁定")) {

      const phone = msg.replace("綁定", "").trim();

      try {

        await axios.get(
          `${GAS_URL}?action=bind&phone=${encodeURIComponent(phone)}&userId=${encodeURIComponent(event.source.userId)}`
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

    // ===== 查詢 =====
    if (msg === "查詢") {

      try {

        // 先找綁定電話
        const phoneRes = await axios.get(
          `${GAS_URL}?action=getPhone&userId=${encodeURIComponent(event.source.userId)}`
        );

        const phone = phoneRes.data;

        if (!phone) {

          await client.replyMessage(
            event.replyToken,
            {
              type: "text",
              text: "請先輸入：\n綁定 你的電話",
            }
          );

          continue;
        }

        // 查訂單
        const response = await axios.get(
          `${GAS_URL}?phone=${phone}`
        );

        const data = response.data;

        if (data.length === 0) {

          await client.replyMessage(
            event.replyToken,
            {
              type: "text",
              text: "查無訂單",
            }
          );

          continue;
        }

        let text = "";

        data.forEach(item => {

          text +=
`【${item.sheet}】

姓名：${item.name}

商品：${item.product}

數量：${item.qty}

是否預購：${item.preorder}

預購發貨日期：${item.preorderDate || "無"}

目前狀態：${item.status}

寄送方式：${item.shipping || "未安排"}

貨運單號：${item.tracking || "尚未出貨"}

-------------------\n`;
        });

        await client.replyMessage(
          event.replyToken,
          {
            type: "text",
            text,
          }
        );

      } catch (error) {

        console.log(error);

        await client.replyMessage(
          event.replyToken,
          {
            type: "text",
            text: "查詢失敗",
          }
        );
      }
    }
  }

  res.sendStatus(200);
});

app.get("/", (req, res) => {
  res.send("Order bot running");
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running on ${port}`);
});