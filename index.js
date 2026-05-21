
const express = require("express");
const line = require("@line/bot-sdk");
const axios = require("axios");

const app = express();

const config = {
  channelAccessToken: "Cbt1J8I6X3pOROsSNJ+xoilxnMdjeaXbo4h+uoEavwYfSqZoh6F+m9/U4UVqaTzUbuCoJTtmdC6qPpdPsQDNegJrTp0/9id1BhUf5Qdo8B6EMFCsgAutkePqYZe+7RUnakCtCvRuVVXOoAi5iBg0IAdB04t89/1O/w1cDnyilFU=",
  channelSecret: "35550c61f3000a0f4c8af1768b0d99a1",
};

const client = new line.messagingApi.MessagingApiClient({
  channelAccessToken: config.channelAccessToken,
});

const GAS_URL = "你的GAS網址";

app.post("/webhook", line.middleware(config), async (req, res) => {

  const events = req.body.events;

  for (const event of events) {

    if (event.type !== "message") continue;
    if (event.message.type !== "text") continue;

    const msg = event.message.text.trim();

    // =========================
    // 綁定電話
    // =========================
    if (msg.startsWith("綁定")) {

      const phone = msg.replace("綁定", "").trim();

      try {

        await axios.get(
          `${GAS_URL}?action=bind&phone=${encodeURIComponent(phone)}&userId=${encodeURIComponent(event.source.userId)}`
        );

        await client.replyMessage({
          replyToken: event.replyToken,
          messages: [
            {
              type: "text",
              text: "綁定成功✨\n之後直接輸入「查詢」即可"
            }
          ]
        });

      } catch (error) {

        console.log(error);

        await client.replyMessage({
          replyToken: event.replyToken,
          messages: [
            {
              type: "text",
              text: "綁定失敗"
            }
          ]
        });
      }

      continue;
    }

    // =========================
    // 查詢訂單
    // =========================
    if (msg === "查詢") {

      try {

        // 先取得綁定電話
        const phoneRes = await axios.get(
          `${GAS_URL}?action=getPhone&userId=${encodeURIComponent(event.source.userId)}`
        );

        const phone = phoneRes.data;

        if (!phone) {

          await client.replyMessage({
            replyToken: event.replyToken,
            messages: [
              {
                type: "text",
                text: "請先輸入：\n綁定 你的電話"
              }
            ]
          });

          continue;
        }

        // 查詢訂單
        const response = await axios.get(
          `${GAS_URL}?phone=${encodeURIComponent(phone)}`
        );

        const data = response.data;

        if (!data || data.length === 0) {

          await client.replyMessage({
            replyToken: event.replyToken,
            messages: [
              {
                type: "text",
                text: "查無訂單"
              }
            ]
          });

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

-------------------

`;
        });

        await client.replyMessage({
          replyToken: event.replyToken,
          messages: [
            {
              type: "text",
              text
            }
          ]
        });

      } catch (error) {

        console.log(error);

        await client.replyMessage({
          replyToken: event.replyToken,
          messages: [
            {
              type: "text",
              text: "查詢失敗"
            }
          ]
        });
      }

      continue;
    }

    // =========================
    // 預設訊息
    // =========================
    await client.replyMessage({
      replyToken: event.replyToken,
      messages: [
        {
          type: "text",
          text: "請輸入：\n綁定 你的電話\n或直接輸入：查詢"
        }
      ]
    });
  }

  res.sendStatus(200);
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running on ${port}`);
});