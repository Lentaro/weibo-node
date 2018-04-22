const express = require("express");
// 接受post参数
const bodyParser = require("body-parser");
// 解析cookie
const cookieParser = require("cookie-parser");
//新建APP
const app = express();
// 引入user
const userRouter = require("./user");

const blogRouter = require("./blog");

app.use(cookieParser());

app.use(bodyParser.json());

// 将对user的访问转到userRouter
app.use("/user", userRouter);

app.use("/blog", blogRouter);

app.get("/", function(req, res) {
  res.send("OK");
});

app.listen(9093, function() {
  console.log("OK");
});
