// 博客部分 服务端
const express = require("express");
//使用路由对象进行挂载
const Router = express.Router();
// 引入模板
const Model = require("./model");
const Blog = Model.getModel("blog");

Router.get("/list", function(req, res) {
  // console.log(req.query)
  Blog.find({}, function(err, doc) {
    return res.json(doc);
  });
});
Router.post("/like", function(req, res) {
  // console.log(req.body);
  const { blogId } = req.body;
  // 从cookie获取id
  const { userid } = req.cookies;
  if (!userid) {
    return res.json({ code: 1 });
  }
  Blog.findById(blogId, function(err, doc) {
    if (err) {
      return res.json({ code: 1, msg: "后端出错了" });
    }
    // console.log(doc);
    const target = doc.like.indexOf(userid);
    // console.log(target);
    if (target !== -1) {
      // console.log(target);
      // console.log(doc.like.splice(target, 1));
      doc.like.splice(target, 1);
      Blog.findByIdAndUpdate(
        blogId,
        { like: doc.like },
        { new: true, strict: true },
        function(err, doc) {
          // console.log(doc)
          if (err) {
            return res.json({ code: 1, msg: "后端出错了" });
          }
          doc = Object.assign({}, doc._doc);
          return res.json({ code: 0, doc });
        }
      );
    } else {
      Blog.findByIdAndUpdate(
        blogId,
        { $push: { like: userid } },
        { new: true },
        function(err, doc) {
          if (err) {
            return res.json({ code: 1, msg: "后端出错了" });
          }
          doc = Object.assign({}, doc._doc);
          return res.json({ code: 0, doc });
        }
      );
    }
  });
});
Router.get("/getuserblog", function(req, res) {
  // console.log(req.query);
  // 从cookie获取id
  const { userid } = req.cookies;
  if (!userid) {
    return res.json({ code: 1 });
  }
  Blog.find({ author: req.query.id }, function(err, doc) {
    if (err) {
      return res.json({ code: 1, msg: "后端出错了" });
    }
    return res.json({ code: 0, doc });
  });
});

Router.post("/sendblog", function(req, res) {
  const { value, mentions, avatar, nickname } = req.body;
  // 从cookie获取id
  const { userid } = req.cookies;
  if (!userid) {
    return res.json({ code: 1 });
  }
  const blogModel = new Blog({
    value,
    mentions,
    avatar,
    author: userid,
    nickname,
    create_time: new Date().getTime()
  });
  blogModel.save(function(e, d) {
    // console.log(d);
    if (e) {
      return res.json({ code: 1, msg: "后端出错了" });
    }
    const { value, mentions, author } = d;
    return res.json({ code: 0, data: d });
  });
});

module.exports = Router;
