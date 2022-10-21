module.exports = function ({ app, dbConn }) {
  app.post("/login", (req, res) => {
    const { email, password } = req.body;
    if (email && password) {
      const sql =
        "SELECT * FROM user_account WHERE (user_email = ? OR user_username = ?) AND user_password = ?";
      dbConn.query(sql, [email, email, password], function (error, response) {
        if (response && response.length !== 0) {
          res.status(200).jsonp({ ...response[0] });
        } else {
          res
            .status(401)
            .jsonp({ message: "Your username or password is not matched" });
        }
      });
    } else {
      res
        .status(401)
        .jsonp({ message: "Your username or password is not matched" });
    }
  });
};
