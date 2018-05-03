//模型

// 链接mongoo
const mongoose = require("mongoose");
const DB_URL = "mongodb://localhost:27017/weibo";
mongoose.connect(DB_URL);
//显示信息
mongoose.connection.on("connected", function() {
  console.log("mongo ready");
});

const models = {
  user: {
    username: { type: String, require: true },
    password: { type: String, require: true },
    nickname: { type: String, require: true },
    avatar: { type: String },
    desc: { type: String },
    sex: { type: String },
    birthday: { type: Date },
    follow: { type: Array },
    blogNum: { type: Number },
    fans: { type: Array },
    create_time: { type: Number, default: new Date().getTime() }
  },
  blog: {
    value: { type: String, require: true },
    author: { type: String, require: true },
    source: { type: Array },
    source_info: { type: Object },
    cited: { type: Array },
    cited_num: { type: Number },
    comment: { type: Array },
    comment_num: { type: Number },
    mentions: { type: Array },
    create_time: { type: Number, default: new Date().getTime() },
    like: { type: Array },
    type: { type: String }
  }
};

for (let m in models) {
  mongoose.model(m, new mongoose.Schema(models[m]));
}

module.exports = {
  getModel: function(name) {
    return mongoose.model(name);
  }
};
