// 用户部分服务

const express = require("express");
// MD5
const utils = require("utility");

//使用路由对象进行挂载
const Router = express.Router();

// 引入模板
const Model = require("./model");
const User = Model.getModel("user");

// 屏蔽密码和版本号的返回
const _filter = { password: 0, __v: 0, username: 0 };

// User.remove({}, function(err, doc) {});
Router.get("/list", function(req, res) {
  // const { type } = req.query;
  User.find({}, function(err, doc) {
    return res.json(doc);
  });
});
Router.post("/login", function(req, res) {
  // console.log(req.body)
  const { username, password } = req.body;
  User.findOne({ username, password: md5Pwd(password) }, _filter, function(
    err,
    doc
  ) {
    if (!doc) {
      return res.json({ code: 1, msg: "用户名或密码错误" });
    }
    // 设置cookie
    res.cookie("userid", doc._id);
    // console.log(doc);
    doc = Object.assign({}, doc._doc, {
      id: doc._id,
      _id: ""
    });
    return res.json({ code: 0, data: doc });
  });
});
// 注册要用post
Router.post("/register", function(req, res) {
  // console.log(req.body)
  const { username, password, nickname } = req.body;
  User.findOne({ username: username }, function(err, doc) {
    if (doc) {
      return res.json({ code: 1, msg: "用户名重复", doc });
    }
    const userModel = new User({
      username,
      password: md5Pwd(password),
      nickname
    });
    userModel.save(function(e, d) {
      if (e) {
        return res.json({ code: 1, msg: "后端出错了" });
      }
      const { user, nickname, _id } = d;
      // 设置cookie
      res.cookie("userid", _id);
      return res.json({ code: 0, data: { nickname } });
    });
  });
});
Router.get("/info", function(req, res) {
  // 从cookie获取id
  const { userid } = req.cookies;
  if (!userid) {
    return res.json({ code: 1 });
  }
  User.findOne({ _id: userid }, _filter, function(err, doc) {
    if (err) {
      return res.json({ code: 1, msg: "后端出错了" });
    }
    // console.log(doc)
    doc = Object.assign({}, doc._doc, {
      id: doc._id,
      _id: ""
    });
    // console.log(doc)
    return res.json({ code: 0, doc });
  });
});
Router.post("/update", function(req, res) {
  //从cookie获取id
  const userid = req.cookies.userid;
  if (!userid) {
    return res.json({ code: 1 });
  }
  const body = req.body;
  User.findByIdAndUpdate(userid, body, function(err, doc) {
    // console.log(body)
    // console.log(doc)
    const data = Object.assign(
      {},
      {
        username: doc.username
      },
      body
    );
    // console.log(data)
    return res.json({ code: 0, data });
  });
});
//MD5加盐增强密码
const md5Pwd = password => {
  const salt = "Save you from anything:xki*&(YHhjd%^Ysa9267&*^&*";
  return utils.md5(utils.md5(salt + password + salt));
};

module.exports = Router;
