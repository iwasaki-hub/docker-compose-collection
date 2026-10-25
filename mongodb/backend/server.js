const express = require("express");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 3000;

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb://admin:admin@mongodb:27017/sampledb?authSource=admin";

app.use(express.json());

// データの構造を定義
const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "name は必須です"],
      trim: true,
      maxlength: [100, "name は100文字以内にしてください"],
    },
  },
  {
    timestamps: true,
  },
);

// Mongoose モデル
const Item = mongoose.model("Item", itemSchema);

// トップページ
app.get("/", (req, res) => {
  res.json({
    message: "Express API Server is running!",
    endpoints: {
      health: "GET /health",
      listItems: "GET /api/items",
      createItem: "POST /api/items",
    },
  });
});

// MongoDB 接続確認
app.get("/health", async (req, res) => {
  const connected = mongoose.connection.readyState === 1;

  if (!connected) {
    return res.status(503).json({
      status: "error",
      mongodb: "disconnected",
    });
  }

  try {
    await mongoose.connection.db.admin().command({ ping: 1 });

    res.json({
      status: "ok",
      mongodb: "connected",
    });
  } catch (error) {
    res.status(503).json({
      status: "error",
      mongodb: "unavailable",
    });
  }
});

// データ一覧取得
app.get("/api/items", async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });

    res.json(items);
  } catch (error) {
    console.error("データ取得エラー:", error);

    res.status(500).json({
      error: "データの取得に失敗しました",
    });
  }
});

// データ登録
app.post("/api/items", async (req, res) => {
  try {
    const item = await Item.create({
      name: req.body.name,
    });

    res.status(201).json({
      message: "登録しました",
      item,
    });
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        error: error.message,
      });
    }

    console.error("データ登録エラー:", error);

    res.status(500).json({
      error: "データの登録に失敗しました",
    });
  }
});

// 存在しない API
app.use((req, res) => {
  res.status(404).json({
    error: "指定された API は存在しません",
  });
});

// MongoDB 接続後にサーバー起動
async function startServer() {
  try {
    await mongoose.connect(MONGODB_URI);

    console.log("MongoDB に接続しました");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Express server: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("サーバーの起動に失敗しました:", error);
    process.exit(1);
  }
}

// 終了時の処理
let isShuttingDown = false;

async function shutdown() {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log("サーバーを終了しています...");

  await mongoose.disconnect();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

startServer();
