// 博客部分 服务端
const express = require("express");
//使用路由对象进行挂载
const Router = express.Router();
// 引入模板
const Model = require("./model");
const Blog = Model.getModel("blog");
const User = Model.getModel("user");

// 屏蔽密码和版本号的返回

// 清除所有
// Blog.remove({},function(err,doc){})
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
        function(e, d) {
          // console.log(doc)
          // console.log(d)
          // console.log(doc._doc)
          if (e) {
            return res.json({ code: 1, msg: "后端出错了" });
          }
          // d = Object.assign({}, doc._doc);
          User.findOne({ _id: d.author }, function(er, dc) {
            doc = Object.assign({}, d._doc, {
              avatar: dc.avatar,
              nickname: dc.nickname
            });
            // console.log(2)
            // console.log(doc)
            return res.json({ code: 0, doc });
          });
        }
      );
    } else {
      Blog.findByIdAndUpdate(
        blogId,
        { $push: { like: userid } },
        { new: true },
        function(e, d) {
          if (e) {
            return res.json({ code: 1, msg: "后端出错了" });
          }
          // console.log(d)
          User.findOne({ _id: d.author }, function(er, dc) {
            doc = Object.assign({}, d._doc, {
              avatar: dc.avatar,
              nickname: dc.nickname
            });
            // console.log(doc);
            return res.json({ code: 0, doc });
          });
          // console.log(1);
          // console.log(doc)
        }
      );
    }
  });
});
Router.get("/getuserblog", function(req, res) {
  // 从cookie获取id
  const { userid } = req.cookies;
  if (!userid) {
    return res.json({ code: 1 });
  }
  Blog.find({ author: req.query.id, type: { $ne: "comment" } }, function(
    err,
    doc
  ) {
    if (err) {
      return res.json({ code: 1, msg: "后端出错了" });
    }
    User.findOne({ _id: req.query.id }, function(e, d) {
      // console.log(d);
      // console.log(d.nickname);
      let data = [];

      let v = null;

      doc.map(async v => {
        let rs = null;
        if (v.type === "cite") {
          rs = await Blog.findById(v.source[0]);
          // console.log(rs._doc);
          rv = await User.findById(rs.author);
          // console.log(rv)
          rs = Object.assign({}, rs._doc, {
            nickname: rv.nickname,
            avatar: rv.avatar
          });
          // console.log(rs);
          Blog.findByIdAndUpdate(v._id, { source_info: rs }, (exx, dxx) => {
            if (err) {
              return res.json({ code: 1, msg: "后端出错了" });
            }
            console.log(dxx);
          });
        }
        v = Object.assign({}, v._doc, {
          avatar: d.avatar,
          nickname: d.nickname,
          source_info: rs ? rs : v.source_info
        });
        data.push(v);
        if (data.length === doc.length) {
          return res.json({ code: 0, doc: data });
        }
      });
      // console.log(doc);
    });
    // console.log(doc);
  });
});

Router.get("/getblogcomment", function(req, res) {
  // 从cookie获取id
  const { userid } = req.cookies;
  if (!userid) {
    return res.json({ code: 1 });
  }
  const { source } = req.query;
  // console.log(source)
  Blog.find({ source, type: "comment" }, async function(err, doc) {
    if (err) {
      return res.json({ code: 1, msg: "后端出错了" });
    }
    let data = [];
    // console.log(doc);
    // console.log(doc.length);
    if (doc.length === 0) {
      // console.log(1);
      return res.json({ code: 0, doc: data });
    }
    doc.map(async (v, i) => {
      const resolve = await User.findOne({ _id: v.author });
      v = Object.assign({}, v._doc, {
        avatar: resolve.avatar,
        nickname: resolve.nickname
      });
      // console.log(i);
      data.push(v);
      // console.log(data);
      if (data.length === doc.length) {
        return res.json({ code: 0, doc: data });
      }
    });
  });
});

Router.get("/getblogcite", function(req, res) {
  // 从cookie获取id
  const { userid } = req.cookies;
  if (!userid) {
    return res.json({ code: 1 });
  }
  const { cite } = req.query;
  // console.log(cite);
  Blog.find({ source: { $all: [cite] }, type: "cite" }, async function(
    err,
    doc
  ) {
    if (err) {
      return res.json({ code: 1, msg: "后端出错了" });
    }
    let data = [];
    if (doc.length === 0) {
      // console.log(1);
      return res.json({ code: 0, doc: data });
    }
    doc.map(async (v, i) => {
      const resolve = await User.findOne({ _id: v.author });
      v = Object.assign({}, v._doc, {
        avatar: resolve.avatar,
        nickname: resolve.nickname
      });
      // console.log(i);
      data.push(v);
      // console.log(data);
      if (data.length === doc.length) {
        return res.json({ code: 0, doc: data });
      }
    });
  });
});

Router.post("/sendblog", async function(req, res) {
  // console.log(req.body);
  const { value, mentions, type, source } = req.body;
  // console.log(type);
  // console.log(source);
  // 从cookie获取id
  const { userid } = req.cookies;
  if (!userid) {
    return res.json({ code: 1 });
  }
  let source_res;
  if (type === "cite") {
    source_res = await Blog.findById(source[0]);
    // console.log(source_res);
    const source_author = await User.findById(source_res.author);
    // console.log(source_author);
    source_res = Object.assign({}, source_res._doc, {
      nickname: source_author.nickname,
      avatar: source_author.avatar
    });
  }
  // console.log(source);
  const blogModel = new Blog({
    value,
    mentions,
    author: userid,
    type,
    source,
    source_info: source_res,
    create_time: new Date().getTime()
  });
  blogModel.save(function(e, d) {
    if (e) {
      return res.json({ code: 1, msg: "后端出错了" });
    }
    // console.log(d._id);
    // console.log(d);
    if (source && type === "comment") {
      // console.log(source);
      Blog.findByIdAndUpdate(
        source,
        { $push: { comment: d._id }, $inc: { comment_num: 1 } },
        { new: true },
        function(err, doc) {
          // console.log(doc);
          if (err) {
            return res.json({ code: 1, msg: "后端出错了" });
          }
          User.findOne({ _id: doc.author }, function(er, dc) {
            doc = Object.assign({}, doc._doc, {
              avatar: dc.avatar,
              nickname: dc.nickname
            });
            // console.log(doc);
            User.findOne({ _id: d.author }, function(x, dx) {
              d = Object.assign({}, d._doc, {
                avatar: dx.avatar,
                nickname: dx.nickname
              });
              // console.log(d);
              return res.json({ code: 0, type, source: doc, data: d });
            });
          });
        }
      );
    } else if (source && type === "cite") {
      source.forEach((v, i) => {
        // console.log(v);
        Blog.findByIdAndUpdate(
          v,
          {
            $push: { cited: d._id },
            $inc: { cited_num: 1 }
          },
          { new: true },
          function(err, doc) {
            if (err) {
              return res.json({ code: 1, msg: "后端出错了" });
            }
            if (i === 0) {
              // console.log(d);
              // console.log(d.source[d.source.length - 1]);
              Blog.findOne({ _id: d.source[d.source.length - 1] }, function(
                er,
                dc
              ) {
                // console.log(dc);
                User.findById(dc.author, function(xxx, dxx) {
                  doc = Object.assign({}, dc._doc, {
                    avatar: dxx.avatar,
                    nickname: dxx.nickname
                  });
                  // console.log(doc);
                  User.findOne({ _id: d.author }, function(x, dx) {
                    d = Object.assign({}, d._doc, {
                      avatar: dx.avatar,
                      nickname: dx.nickname
                    });
                    // console.log({ code: 0, type, source: doc, data: d });
                    return res.json({ code: 0, type, source: doc, data: d });
                  });
                });
              });
            }
          }
        );
      });
    } else {
      // const { value, mentions, author } = d;
      // console.log(d);
      User.findOne({ _id: d.author }, function(err, doc) {
        d = Object.assign({}, d._doc, {
          avatar: doc.avatar,
          nickname: doc.nickname
        });
        // console.log(d);
        return res.json({ code: 0, type: type, data: d });
      });
    }
  });
});

module.exports = Router;
