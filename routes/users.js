module.exports = function ({ app, dbConn, upload }) {
  app.post("/users/create", upload.single("avatar"), (req, res, next) => {
    const { userUuid, fullname, username, email, password } = req.body;

    if (email && password && fullname && username) {
      const findAccountByEmail =
        "SELECT * FROM user_account WHERE user_email = ? OR user_username = ?";

      dbConn.query(
        findAccountByEmail,
        [email, username],
        function (error, account) {
          if (account && account.length !== 0) {
            res
              .status(400)
              .jsonp({
                message:
                  "The email or username are already used for different account",
              });
          } else {
            const characters =
              "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
            let token = "";
            for (let i = 0; i < 25; i++) {
              token +=
                characters[Math.floor(Math.random() * characters.length)];
            }

            const users = [
              [userUuid, email, password, fullname, username, token],
            ];
            const registerUserSql =
              "INSERT INTO user_account (id, user_email, user_password, user_full_name, user_username, user_verification_code) VALUES ?";
            dbConn.query(
              registerUserSql,
              [users],
              function (error, insertedUser) {
                if (insertedUser) {
                  const nodemailer = require("nodemailer");
                  const transporter = nodemailer.createTransport({
                    host: "smtp.gmail.com",
                    port: 587,
                    auth: {
                      user: "drinkinwater1000@gmail.com",
                      pass: "zfitifjwvzozwjmv",
                    },
                  });

                  transporter
                    .sendMail({
                      from: '"Your Name" <drinkinwater1000@gmail.com>', // sender address
                      to: `${email}`, // list of receivers
                      subject: "Verify your jugggle account", // Subject line
                      text: "Verify your account by accessing this link bellow.\nhttp://localhost:3000/verify/${token}", // plain text body
                      html: `Verify your account by accessing this link bellow.</br>http://localhost:3000/verify/${token}`, // html body
                    })
                    .then((info) => {
                      console.log({ info });
                    })
                    .catch(console.error);
                  res.status(200).jsonp({ insertId: insertedUser.insertId });
                } else {
                  res.status(400).jsonp({
                    message: "Cannot create your account, please try again",
                  });
                }
              }
            );
          }
        }
      );
    } else {
      return res.status(400).jsonp({ message: "Please input required fields" });
    }
  });

  app.post("/users/update", upload.single("avatar"), (req, res, next) => {
    const { userUuid, fullname, username, bio } = req.body;

    if (fullname && username) {
      const searchQuery =
        "SELECT * FROM user_account WHERE user_username = ? AND id <> ?";

      dbConn.query(
        searchQuery,
        [username, userUuid],
        function (error, account) {
          if (account && account.length !== 0) {
            res.status(400).jsonp({ message: "username isn't available" });
          } else {
            const updateQuery =
              "UPDATE user_account SET user_username = ?, user_full_name = ?, user_bio = ? WHERE id = ?";
            dbConn.query(
              updateQuery,
              [username, fullname, bio, userUuid],
              function (err, result) {
                if (err) {
                  res
                    .status(400)
                    .jsonp({ message: "System error. Please try again" });
                } else {
                  res.status(200).jsonp({ message: "profile updated" });
                }
              }
            );
            // res.status(200).jsonp({ message: "test" });
            // const users = [
            //   [userUuid, email, password, fullname, username, token],
            // ];
            // const registerUserSql =
            //   "INSERT INTO user_account (id, user_email, user_password, user_full_name, user_username, user_verification_code) VALUES ?";
            // dbConn.query(
            //   registerUserSql,
            //   [users],
            //   function (error, insertedUser) {
            //     if (insertedUser) {
            //       const nodemailer = require("nodemailer");
            //       const transporter = nodemailer.createTransport({
            //         host: "smtp.gmail.com",
            //         port: 587,
            //         auth: {
            //           user: "drinkinwater1000@gmail.com",
            //           pass: "zfitifjwvzozwjmv",
            //         },
            //       });
            //       transporter
            //         .sendMail({
            //           from: '"Your Name" <drinkinwater1000@gmail.com>', // sender address
            //           to: `${email}`, // list of receivers
            //           subject: "Verify your jugggle account", // Subject line
            //           text: "Verify your account by accessing this link bellow.\nhttp://localhost:3000/verify/${token}", // plain text body
            //           html: `Verify your account by accessing this link bellow.</br>http://localhost:3000/verify/${token}`, // html body
            //         })
            //         .then((info) => {
            //           console.log({ info });
            //         })
            //         .catch(console.error);
            //       res.status(200).jsonp({ insertId: insertedUser.insertId });
            //     } else {
            //       res.status(400).jsonp({
            //         message: "Cannot create your account, please try again",
            //       });
            //     }
            //   }
            // );
          }
        }
      );
    } else {
      return res.status(400).jsonp({ message: "Please input required fields" });
    }
  });

  app.post("/users/updateImage", upload.single("avatar"), (req, res, next) => {
    const file = req.file;
    console.log(file);
    if (!file) {
      res.status(400).jsonp({
        message: "Please upload your avatar",
      });
    } else {
      const avatar = `/${file.filename}`;
      const { userUuid } = req.body;

      const registerUserSql =
        "UPDATE user_account SET user_avatar = ? WHERE id = ?";
      dbConn.query(
        registerUserSql,
        [avatar, userUuid],
        function (error, insertedUser) {
          if (insertedUser) {
            res.status(200).jsonp({ avatar });
          } else {
            res.status(400).jsonp({
              message: "Cannot create your account, please try again",
            });
          }
        }
      );
    }
  });

  app.post("/users/followers", (req, res) => {
    const { numberOfFollowers, id } = req.body;
    const updateNumberOfFollowersSql =
      "UPDATE user_account SET user_number_of_followers = ? WHERE id = ?";
    dbConn.query(
      updateNumberOfFollowersSql,
      [numberOfFollowers, id],
      function (err, updatedUser) {
        if (err) {
          res
            .status(200)
            .jsonp({ message: "The system error. Please try again" });
        } else if (updatedUser) {
          res.status(200).jsonp({ id });
        }
      }
    );
  });

  app.post("/users/posts", (req, res) => {
    const { numberOfPosts, id } = req.body;
    const updateNumberOfPostsSql =
      "UPDATE user_account SET user_number_of_posts = ? WHERE id = ?";
    dbConn.query(
      updateNumberOfPostsSql,
      [numberOfPosts, id],
      function (err, updatedUser) {
        if (err) {
          res
            .status(200)
            .jsonp({ message: "The system error. Please try again" });
        } else if (updatedUser) {
          res.status(200).jsonp({ id });
        }
      }
    );
  });

  app.get("/users/:id", (req, res) => {
    const userId = req.params.id;
    if (!userId) {
      res
        .status(200)
        .jsonp({ message: "Cannot load user information, please try again" });
    }
    const getUserSql = "SELECT * FROM user_account WHERE id = ?";
    dbConn.query(getUserSql, [userId], function (error, response) {
      if (response && response.length) {
        res.status(200).jsonp(response);
      } else {
        res
          .status(200)
          .jsonp({ message: "Cannot load user information, please try again" });
      }
    });
  });

  app.get("/users/profile/:username", (req, res) => {
    const userUsername = req.params.username;
    if (!userUsername) {
      res
        .status(200)
        .jsonp({ message: "Cannot load user information, please try again" });
    }
    const getUserSql = "SELECT * FROM user_account WHERE user_username = ?";
    dbConn.query(getUserSql, [userUsername], function (error, response) {
      if (response && response.length) {
        res.status(200).jsonp(response);
      } else {
        res
          .status(200)
          .jsonp({ message: "Cannot load user information, please try again" });
      }
    });
  });

  app.post("/users/resend_mail", (req, res) => {
    const { email } = req.body;

    if (!email) {
      return res.status(400).jsonp({ message: "email not found in form" });
    }

    const findAccountByEmail =
      "SELECT * FROM user_account WHERE user_email = ?";

    dbConn.query(findAccountByEmail, [email], function (error, account) {
      if (!account || account.length === 0) {
        res
          .status(400)
          .jsonp({ message: "The email not yet registered in the system" });
      } else {
        const characters =
          "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
        let token = "";
        for (let i = 0; i < 25; i++) {
          token += characters[Math.floor(Math.random() * characters.length)];
        }

        const updateQuery =
          "UPDATE user_account SET user_verification_code = ? WHERE user_email = ?";
        dbConn.query(
          updateQuery,
          [token, email],
          function (error, updatedUser) {
            if (error) {
              res
                .status(400)
                .jsonp({ message: "The system error. Please try again" });
            } else if (updatedUser) {
              const nodemailer = require("nodemailer");
              const transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 587,
                auth: {
                  user: "drinkinwater1000@gmail.com",
                  pass: "zfitifjwvzozwjmv",
                },
              });

              transporter
                .sendMail({
                  from: '"Your Name" <drinkinwater1000@gmail.com>', // sender address
                  to: `${email}`, // list of receivers
                  subject: "Verify your jugggle account", // Subject line
                  text: "Verify your account by accessing this link bellow.\nhttp://localhost:3000/verify/${token}", // plain text body
                  html: `Verify your account by accessing this link bellow.</br>http://localhost:3000/verify/${token}`, // html body
                })
                .then((info) => {
                  console.log({ info });
                })
                .catch(console.error);
              res.status(200).jsonp({ email });
            }
          }
        );
      }
    });
  });

  app.post("/users/verify", (req, res) => {
    const { email, verification_code } = req.body;
    if (email && verification_code) {
      const sql =
        "SELECT * FROM user_account WHERE user_email = ? AND user_verification_code = ?";
      dbConn.query(sql, [email, verification_code], function (error, response) {
        if (response && response.length !== 0) {
          const updateQuery =
            "UPDATE user_account SET user_is_verified = 1 WHERE user_email = ?";
          dbConn.query(updateQuery, [email], function (err, updatedUser) {
            if (error) {
              res
                .status(400)
                .jsonp({ message: "The system error. Please try again" });
            } else if (updatedUser) {
              const resp = { ...response[0] };
              resp.user_is_verified = 1;
              res.status(200).jsonp({ ...resp });
            }
          });
        } else {
          res
            .status(401)
            .jsonp({ message: "Your verification code is invalid" });
        }
      });
    } else {
      res.status(400).jsonp({ message: "insufficient info" });
    }
  });
};
