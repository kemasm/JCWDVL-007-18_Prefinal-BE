module.exports = function ({ app, dbConn }) {
  app.post("/reactions/get", (req, res) => {
    const { post_id, user_id } = req.body;
    if (!post_id || !user_id) {
      res.status(200).jsonp({ message: "Not found" });
    }
    const getReactionSql =
      "SELECT * FROM post_reaction WHERE post_id = ? AND user_id = ?";
    dbConn.query(
      getReactionSql,
      [post_id, user_id],
      function (error, response) {
        if (response && response.length) {
          res.status(200).jsonp({ ...response[0] });
        } else {
          res.status(200).jsonp({ message: "Not found" });
        }
      }
    );
  });

  app.get("/reactions/get/:post_id/:user_id", (req, res) => {
    const post_id = req.params.post_id;
    const user_id = req.params.user_id;
    if (!post_id || !user_id) {
      res.status(400).jsonp({ message: "Not found" });
    }
    const getReactionSql = `select * 
      from (
        SELECT COUNT(*) as like_count FROM post_reaction WHERE post_id = ?
      ) as a
      join (
        select count(*) as is_like from post_reaction WHERE post_id = ? and user_id = ?
      ) as b`;
    dbConn.query(
      getReactionSql,
      [post_id, post_id, user_id],
      function (error, response) {
        if (response && response.length) {
          res.status(200).jsonp({ ...response[0] });
        } else {
          res.status(400).jsonp({ message: "Not found" });
        }
      }
    );
  });

  app.post("/reactions/create", (req, res) => {
    const { postId, userId } = req.body;
    if (!postId || !userId) {
      res.status(200).jsonp({
        message: "Cannot create the post reaction, please try again",
      });
    }
    const reactions = [[postId, userId]];
    const insertReactionSql =
      "INSERT INTO post_reaction (post_id, user_id) VALUES ?";
    dbConn.query(
      insertReactionSql,
      [reactions],
      function (error, insertedReaction) {
        if (insertedReaction) {
          res.status(200).jsonp({
            insertId: insertedReaction.insertId,
            post_id: postId,
            user_id: userId,
          });
        } else {
          res.status(200).jsonp({
            message: "Cannot create the post reaction, please try again",
          });
        }
      }
    );

    const updatePostReactionSql =
      "UPDATE post SET post_number_of_reactions = post_number_of_reactions + 1 WHERE id = ?";
    dbConn.query(updatePostReactionSql, [postId]);
  });

  app.post("/reactions/delete", (req, res) => {
    const { postId, userId } = req.body;
    if (!postId || !userId) {
      res.status(200).jsonp({
        message: "Cannot create the post reaction, please try again",
      });
    }

    const deleteReactionsSql =
      "DELETE FROM post_reaction WHERE post_id = ? AND user_id = ?";
    dbConn.query(
      deleteReactionsSql,
      [postId, userId],
      function (error, response) {
        if (response && response.affectedRows) {
          res.status(200).jsonp({ postId, userId });
        } else {
          res.status(200).jsonp({
            message: "Cannot delete the post reaction, please try again",
          });
        }
      }
    );

    const updatePostReactionSql =
      "UPDATE post SET post_number_of_reactions = post_number_of_reactions - 1 WHERE id = ?";
    dbConn.query(updatePostReactionSql, [postId]);
  });
};
