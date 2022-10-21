module.exports = function ({ app, dbConn, upload }) {
  app.post("/posts", upload.single("post_image"), (req, res) => {
    const file = req.file;
    if (!file) {
      res.status(400).jsonp({
        message: "Please upload your post image",
      });
    } else {
      const postContent = `/${file.filename}`;
      const postCategory =
        req.file && req.file.mimetype.includes("image") ? 1 : 2;
      const postCreatedDate = new Date();
      const postCaption = req.body.post_caption;
      const postCreatedBy = req.body.post_created_by;
      if (postCreatedBy) {
        const createdPost = [
          [
            postContent,
            postCaption,
            postCategory,
            postCreatedDate,
            postCreatedBy,
          ],
        ];
        const createPostSql =
          "INSERT INTO post (post_content, post_caption, post_category, post_created_date, post_created_by) VALUES ?";
        dbConn.query(
          createPostSql,
          [createdPost],
          function (error, insertedPost) {
            if (insertedPost) {
              res.status(200).jsonp({
                id: insertedPost.insertId,
                post_content: postContent,
                post_caption: postCaption,
                post_category: postCategory,
                post_created_date: postCreatedDate,
                post_created_by: postCreatedBy,
              });
            } else {
              res.status(400).jsonp({
                message: "Cannot upload your post, please try again",
              });
            }
          }
        );
      } else {
        res
          .status(400)
          .jsonp({ message: "Cannot upload your post, please try again" });
      }
    }
  });

  app.get("/posts", (req, res) => {
    const { posts_page } = req.query;
    const offset = Number(posts_page) * 5;

    const getPostsSql =
      "SELECT a.*, b.user_username, b.user_avatar FROM post a left join user_account b on a.post_created_by = b.id ORDER BY post_created_date DESC LIMIT ?, 5";
    dbConn.query(getPostsSql, [offset], function (error, posts) {
      if (posts) {
        res.status(200).jsonp(posts);
      } else {
        res
          .status(200)
          .jsonp({ message: "Cannot get your posts, please try again" });
      }
    });
  });

  app.get("/posts/user/:username", (req, res) => {
    const user_username = req.params.username;
    const { posts_page } = req.query;
    const offset = Number(posts_page) * 5;

    const getPostsSql =
      "SELECT a.*, b.user_username, b.user_avatar FROM post a left join user_account b on a.post_created_by = b.id WHERE b.user_username like ? ORDER BY post_created_date DESC LIMIT ?, 5";
    dbConn.query(getPostsSql, [user_username, offset], function (error, posts) {
      if (posts) {
        res.status(200).jsonp(posts);
      } else {
        res
          .status(200)
          .jsonp({ message: "Cannot get your posts, please try again" });
      }
    });
  });

  app.get("/posts/user/like/:username", (req, res) => {
    const user_username = req.params.username;
    const { posts_page } = req.query;
    const offset = Number(posts_page) * 5;

    const getPostsSql =
      "SELECT c.*, b.user_username, b.user_avatar FROM post_reaction a LEFT JOIN user_account b ON a.user_id = b.id LEFT JOIN post c ON a.post_id = c.id WHERE b.user_username LIKE ? order BY c.post_created_date DESC LIMIT ?, 5";
    dbConn.query(getPostsSql, [user_username, offset], function (error, posts) {
      if (posts) {
        res.status(200).jsonp(posts);
      } else {
        res
          .status(200)
          .jsonp({ message: "Cannot get your posts, please try again" });
      }
    });
  });

  app.get("/posts/:id", (req, res) => {
    const id = req.params.id;
    const getPostSql =
      "SELECT post.id, post_content, post_caption, post_category, post_created_date, post_created_by, post_number_of_reactions, user_account.user_avatar, user_account.user_full_name, user_account.user_number_of_followers FROM post INNER JOIN user_account ON post.post_created_by = user_account.id WHERE post.id = ?";
    if (!id) {
      res
        .status(200)
        .jsonp({ message: "Cannot load the post detail, please try again" });
    }
    dbConn.query(getPostSql, [id], function (error, response) {
      if (response && response.length) {
        res.status(200).jsonp(response);
      } else {
        res.status(200).jsonp({ message: "Not found" });
      }
    });
  });

  app.post("/posts/delete", (req, res) => {
    const { postId, userId } = req.body;
    if (!postId || !userId) {
      res.status(400).jsonp({
        message: "Cannot delete the post, please try again",
      });
    }
    const deletePostQuery =
      "DELETE FROM post WHERE id = ? AND post_created_by = ?";
    dbConn.query(deletePostQuery, [postId, userId], function (error, response) {
      if (!error) {
        res.status(200).jsonp(response);
      } else {
        res.status(400).jsonp({ message: "Not found" });
      }
    });
  });

  app.post("/posts/update", (req, res) => {
    const { postId, userId, post_caption } = req.body;
    if (!postId || !userId || !post_caption) {
      res.status(400).jsonp({
        message: "Cannot update the post, please try again",
      });
    }
    const deletePostQuery =
      "UPDATE post SET post_caption = ? WHERE id = ? AND post_created_by = ?";
    dbConn.query(
      deletePostQuery,
      [post_caption, postId, userId],
      function (error, response) {
        if (!error) {
          res.status(200).jsonp(response);
        } else {
          res.status(400).jsonp({ message: "Not found" });
        }
      }
    );
  });

  app.post("/posts/reactions", (req, res) => {
    const { numberOfReactions, id } = req.body;
    const updateNumberOfReactionsSql =
      "UPDATE post SET post_number_of_reactions = ? WHERE id = ?";
    dbConn.query(
      updateNumberOfReactionsSql,
      [numberOfReactions, id],
      function (err, updatedPost) {
        if (err) {
          res
            .status(200)
            .jsonp({ message: "The system error. Please try again" });
        } else if (updatedPost) {
          res.status(200).jsonp({ id });
        }
      }
    );
  });

  app.post("/posts/comments", (req, res) => {
    const { post_id, user_id, comment_content } = req.body;
    const commentCreatedDate = new Date();

    if (!post_id || !user_id || !comment_content) {
      return res.status(400).jsonp({ message: "Please input required fields" });
    }

    const comment = [[post_id, user_id, comment_content, commentCreatedDate]];

    const insertQuery =
      "INSERT INTO post_comment (post_id, user_id, comment_content, comment_created_date) values ?";

    dbConn.query(insertQuery, [comment], function (err, insertedComment) {
      if (err) {
        res
          .status(400)
          .jsonp({ message: "The system error. Please try again" });
      } else if (insertedComment) {
        res.status(200).jsonp({
          id: insertedComment.id,
          post_id: insertedComment.post_id,
          user_id: insertedComment.user_id,
          comment_content: insertedComment.comment_content,
          comment_created_date: insertedComment.comment_created_date,
        });
      }
    });
  });

  app.get("/posts/comments/:id", (req, res) => {
    const id = req.params.id;
    const { comment_page } = req.query;
    const offset = Number(comment_page) * 5;

    if (!id) {
      res.status(400).jsonp({ message: "Please input required fields" });
    }

    const getPostsSql =
      "SELECT a.*, b.user_username, b.user_avatar FROM post_comment a LEFT JOIN user_account b ON a.user_id = b.id WHERE a.post_id = ? ORDER BY a.comment_created_date DESC LIMIT ?, 5";
    dbConn.query(getPostsSql, [id, offset], function (error, comments) {
      if (comments) {
        res.status(200).jsonp(comments);
      } else {
        res
          .status(200)
          .jsonp({ message: "Cannot get your posts, please try again" });
      }
    });
  });
};
