//--------------------------------------------------
// Imports
//--------------------------------------------------
const jwt = require('jsonwebtoken');
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const cors = require('cors');
const path = require('path');
const secretyKey = require('./Secret key & Token/secretKey');
const {
  verifyAccessToken,
  verifyRequestToken,
  verifyRequestTokenFromSocket,
} = require('./Secret key & Token/verifyToken');
const queries = require('./queries');

const app = express().use(cors()).use(express.json());

//--------------------------------------------------
// Storage & Filter
//--------------------------------------------------
const storage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, './Images/');
  },
  filename(req, file, callback) {
    callback(null, file.originalname);
  },
});

const filter = (req, file, callback) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    callback(null, true);
  } else {
    callback(null, false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 360 * 360,
  },
  fileFilter: filter,
});

// Define Port
const port = process.env.PORT || 3000;

//--------------------------------------------------
// Middleware functions
//--------------------------------------------------
function verifyDiscountCode(req, res, next) {
  console.log(req.headers);
  const discountCode = req.headers.discountcode;
  if (!discountCode) {
    console.log(`returning next`);
    return next();
  }

  console.log(
    `-----------------------------------------------------------------------`
  );
  console.log(`returning dC ` + discountCode);

  return queries
    .verifyDiscount(discountCode, req.userid)
    .then((response) => {
      console.log(response);
      if (response.rowCount === 0) {
        res.status(404).send('Referral code not found!');
      } else {
        req.discountCode = discountCode;
        return next();
      }
    })
    .catch(next);
}

//--------------------------------------------------
// Default API
//--------------------------------------------------
app.get('/', (req, res) => res.status(200).json({ message: 'Hello World!' }));

//--------------------------------------------------
// Main APIs
//--------------------------------------------------

// Register user
app.post('/register', async (req, res, next) => {
  const { Username } = req.body;
  const { Email } = req.body;
  const { Password } = req.body;

  return queries
    .insertUser(Username, Email, Password)
    .then((response) => {
      res.status(200).send(response);
    })
    .catch((error) => {
      if (
        error ==
        'error: duplicate key value violates unique constraint "user_table_email_key"'
      ) {
        res.json({ message: 'Email has already been taken' });
      } else if (
        error ==
        'error: duplicate key value violates unique constraint "user_table_password_key"'
      ) {
        res.json({ message: 'Password has already been taken' });
      }
    });
});

// Login user
app.post('/login', async (req, res, next) => {
  console.log(req);
  const { Username } = req.body;
  const { Password } = req.body;

  let accessToken = '';

  return queries
    .getUser(Username, Password)
    .then((response) => {
      const payload = {
        userID: response.id,
        role: response.type,
      };
      jwt.sign(
        payload,
        secretyKey,
        { algorithm: 'HS256', expiresIn: '20m' },
        (err, token) => {
          if (err) {
            res.status(500).send('Token Error');
          } else {
            accessToken = token;
            jwt.sign(
              payload,
              'requestToken2299',
              { algorithm: 'HS256', expiresIn: '1d' },
              (err, token) => {
                if (err) {
                } else {
                  res.status(200).send({
                    result: response,
                    accessToken: accessToken,
                    token,
                  });
                }
              }
            );
          }
        }
      );
    })
    .catch((error) => {
      if (
        error == "TypeError: Cannot read properties of undefined (reading 'id')"
      ) {
        res.json({ message: 'Username or Password is Incorrect' });
      }
    });
});

// Check User
app.get('/check/user', verifyRequestToken, async (req, res, next) => {
  const payload = {
    userID: req.userid,
    role: req.role,
  };

  return jwt.sign(
    payload,
    secretyKey,
    { algorithm: 'HS256', expiresIn: '20m' },
    (err, token) => {
      if (err) {
      } else {
        res.status(200).send({
          userID: req.userid,
          role: req.role,
          accessToken: token,
        });
      }
    }
  );
});

// Get access token

// Get user
app.get('/getUser/:Id', verifyAccessToken, async (req, res, next) => {
  const { Id } = req.params;

  // Authorization check
  if (req.role != 'Admin' && req.userid != Id) {
    let errData = {
      msg: 'You are not authorized to perform this operation!',
    };
    // 403 - forbidden
    return res.status(403).send(errData);
  }

  return queries
    .getUserInfo(Id)
    .then((response) => {
      res.status(201).send(response);
    })
    .catch(next);
});

// Checks for user image
app.get('/getUserImages/:Id', verifyAccessToken, async (req, res, next) => {
  try {
    let Id = req.params.Id;

    // Authorization check
    if (req.role != 'Admin' && req.userid != Id) {
      let errData = {
        msg: 'You are not authorized to perform this operation!',
      };
      // 403 - forbidden
      return res.status(403).send(errData);
    }

    return queries
      .getUserImage(Id)
      .then((response) => {
        fs.readFile('./Images/' + response, (err, output) => {
          const ImagePath = path.resolve('Images/' + response);
          if (err) {
            return res.status(500).send('Internal Server Error');
          } else {
            output = output.slice(0, 4).toString('hex');
            if (output == '89504e47') {
              res.setHeader('content-type', 'image/png');
              res.sendFile(ImagePath);
            }
            if (
              output == 'ffd8ffdb' ||
              output == 'ffd8ffe0' ||
              output == 'ffd8ffee' ||
              output == 'ffd8ffe1'
            ) {
              res.setHeader('content-type', 'image/jpeg');
              res.sendFile(ImagePath);
            }
          }
        });
      })
      .catch(next);
  } catch (err) {
    res.json({ message: response });
  }
});

// Get user Image
app.get('/getUserImage/:Id', async (req, res, next) => {
  try {
    let Id = req.params.Id;

    return queries
      .getUserImage(Id)
      .then((response) => {
        fs.readFile('./Images/' + response, (err, output) => {
          const ImagePath = path.resolve('Images/' + response);
          if (err) {
            return res.status(500).send('Internal Server Error');
          } else {
            output = output.slice(0, 4).toString('hex');
            if (output == '89504e47') {
              res.setHeader('content-type', 'image/png');
              res.sendFile(ImagePath);
            }
            if (
              output == 'ffd8ffdb' ||
              output == 'ffd8ffe0' ||
              output == 'ffd8ffee' ||
              output == 'ffd8ffe1'
            ) {
              res.setHeader('content-type', 'image/jpeg');
              res.sendFile(ImagePath);
            }
          }
        });
      })
      .catch(next);
  } catch (err) {
    console.log(err.message);
  }
});

// Get game Image
app.get('/Images/:url', async (req, res, next) => {
  try {
    let url = req.params.url;

    fs.readFile('./Images/' + url, (err, output) => {
      const ImagePath = path.resolve('Images/' + url);
      if (err) {
        return res.status(500).send('Internal Server Error');
      } else {
        output = output.slice(0, 4).toString('hex');
        if (output == '89504e47') {
          res.setHeader('content-type', 'image/png');
          res.sendFile(ImagePath);
        }
        if (
          output == 'ffd8ffdb' ||
          output == 'ffd8ffe0' ||
          output == 'ffd8ffee' ||
          output == 'ffd8ffe1'
        ) {
          res.setHeader('content-type', 'image/jpeg');
          res.sendFile(ImagePath);
        }
      }
    });
  } catch (err) {
    console.log(err.message);
  }
});

// Update user information
app.put('/updateUser/:Id/', verifyAccessToken, async (req, res, next) => {
  const { Id } = req.params;
  const { Username } = req.body;
  const { Email } = req.body;
  const { Password } = req.body;

  // Authorization check
  if (req.userid != Id) {
    let errData = {
      msg: 'You are not authorized to perform this operation!',
    };
    // 403 - forbidden
    return res.status(403).send(errData);
  }

  return queries
    .updateUser(Id, Username, Email, Password)
    .then((response) => {
      res.status(201).send(response);
    })
    .catch((error) => {
      if (
        error ==
        'error: duplicate key value violates unique constraint "user_table_email_key"'
      ) {
        res.json({ message: 'Email has already been taken' });
      } else if (
        error ==
        'error: duplicate key value violates unique constraint "user_table_password_key"'
      ) {
        res.json({ message: 'Password has already been taken' });
      }
    });
});

// Update user profile
app.put(
  '/updateImage/:Id/',
  verifyAccessToken,
  upload.single('picture'),
  async (req, res, next) => {
    const { Id } = req.params;
    const ProfilePicUrl = req.file.originalname;

    console.log(ProfilePicUrl);

    // Authorization check
    if (req.userid != Id) {
      let errData = {
        msg: 'You are not authorized to perform this operation!',
      };
      // 403 - forbidden
      return res.status(403).send(errData);
    }

    return queries
      .updateProfile(ProfilePicUrl, Id)
      .then((response) => {
        res.status(201).send(response);
      })
      .catch(next);
  }
);

// Get Key Library
app.get('/keyLibrary/:Id/', verifyAccessToken, async (req, res, next) => {
  const { Id } = req.params;

  // Authorization check
  if (req.role != 'Admin' && req.userid != Id) {
    let errData = {
      msg: 'You are not authorized to perform this operation!',
    };
    // 403 - forbidden
    return res.status(403).send(errData);
  }

  return queries
    .getKeyLibrary(Id)
    .then((response) => {
      res.status(201).send(response);
    })
    .catch(next);
});

// Refund Key (Retrieve Funds)
app.get('/refundAmount/:Id', verifyAccessToken, async (req, res, next) => {
  const { Id } = req.params;
  const { productName } = req.params;

  // Authorization check
  if (req.role != 'Admin' && req.userid != Id) {
    let errData = {
      msg: 'You are not authorized to perform this operation!',
    };
    // 403 - forbidden
    return res.status(403).send(errData);
  }

  return queries
    .retrieveTrans(productName, Id)
    .then((response) => {
      res.status(201).send(response);
    })
    .catch(next);
});

// Refund Key (Update Wallet)
app.put('/refundWallet/:Id', verifyAccessToken, async (req, res, next) => {
  const { Id } = req.params;
  const { Price } = req.body;

  // Authorization check
  if (req.role != 'Admin' && req.userid != Id) {
    let errData = {
      msg: 'You are not authorized to perform this operation!',
    };
    // 403 - forbidden
    return res.status(403).send(errData);
  }

  return queries
    .refundWallet(Id, Price)
    .then((response) => {
      res.status(201).send(response);
    })
    .catch(next);
});

// Refund Key (Delete Key)
app.delete('/refundGame/:Id', verifyAccessToken, async (req, res, next) => {
  const { Id } = req.params;
  const { Key } = req.body;

  // Authorization check
  if (req.role != 'Admin' && req.userid != Id) {
    let errData = {
      msg: 'You are not authorized to perform this operation!',
    };
    // 403 - forbidden
    return res.status(403).send(errData);
  }

  return queries
    .removeKey(Id, Key)
    .then((response) => {
      res.status(201).send(response);
    })
    .catch(next);
});

// Add Funds (Wallet)
app.post('/addFunds/:Id', verifyAccessToken, async (req, res, next) => {
  const { Id } = req.params;
  const { Amount_Retrieved } = req.body;

  // Authorization check
  // Authorization check
  if (req.role != 'Admin' && req.userid != Id) {
    let errData = {
      msg: 'You are not authorized to perform this operation!',
    };
    // 403 - forbidden
    return res.status(403).send(errData);
  }

  return queries
    .addFunds(Id, Amount_Retrieved)
    .then((response) => {
      res.status(201).send(response);
    })
    .catch((error) => {
      res.json({ message: error.message });
    });
});

// Add Funds (User)
app.put('/addWallet/:Id', verifyAccessToken, async (req, res, next) => {
  const { Id } = req.params;
  const Funds = req.body.Amount_Retrieved;

  // Authorization check
  if (req.role != 'Admin' && req.userid != Id) {
    let errData = {
      msg: 'You are not authorized to perform this operation!',
    };
    // 403 - forbidden
    return res.status(403).send(errData);
  }

  return queries
    .addWallet(Id, Funds)
    .then((response) => {
      res.status(201).send(response);
    })
    .catch((error) => {
      res.json({ message: error.message });
    });
});

// Verify Discount (Done)
app.get('/verifyDiscount/:discountCode', async (req, res, next) => {
  let discountCode = req.params.discountCode;

  return queries
    .verifyDiscount(discountCode)
    .then((response) => {
      if (response.rowCount === 0) {
        res.status(404).send(`Discount code not found!`);
      } else {
        console.log(response);
        res.status(200).send(response);
      }
    })
    .catch(next);
});

// Get Promotions (Done)
app.get('/promotions', (req, res, next) => {
  queries
    .getPromotions()
    .then((response) => {
      res.status(200).json(response.rows);
    })
    .catch(next);
});

// Add games
app.post('/addNewGame', verifyAccessToken, async (req, res, next) => {
  if (req.role != 'Admin') {
    let errData = {
      msg: 'you are not authorised to perform this operation',
    };
    // 403 - Forbidden
    res.status(403).type('text').send(errData);
    return;
  }

  console.log(req.body);

  const { gameName } = req.body;
  const { price } = req.body;
  const { gameImgURL } = req.body;
  const { description } = req.body;
  const { tags } = req.body;

  return queries
    .addGames(gameName, price, gameImgURL, description, tags)
    .then((response) => {
      console.log(response);
      res.status(201).send(response);
    })
    .catch((err) => {
      console.log(`HERE--------------------`);
      console.log(err);
      if (err.code === '23505') {
        res.status(500).send({ status: 500, message: err.detail });
      } else {
        return next;
      }
    });
});

// edit games
app.put('/editGame/:gameID', verifyAccessToken, async (req, res, next) => {
  if (req.role != 'Admin') {
    let errData = {
      msg: 'you are not authorised to perform this operation',
    };
    // 403 - Forbidden
    res.status(403).type('text').send(errData);
    return;
  }

  const { gameID } = req.params;
  const { gameName } = req.body;
  const { price } = req.body;
  const { gameImgURL } = req.body;
  const { description } = req.body;
  const { tags } = req.body;

  return queries
    .editGames(gameID, gameName, price, gameImgURL, description, tags)
    .then((response) => {
      res.status(201).send(response.rowCount);
    })
    .catch(next);
});

// Get All Games with sort and filtering implemented(Done)
app.post('/getGames/:sort', (req, res, next) => {
  const { sort } = req.params;
  const { keyword } = req.body;
  const { lastId } = req.body;
  console.log(lastId);

  queries
    .getGames(keyword, sort, lastId)
    .then((response) => {
      console.log(response);
      res.status(200).json(response);
    })
    .catch(next);
});

// Get All Games by oldest(Done)
app.get('/gamesList/oldest', (req, res, next) => {
  queries
    .getAllGamesOldest()
    .then((response) => {
      res.status(200).json(response.rows);
    })
    .catch(next);
});

// Get All Games by name asc(Done)
app.get('/gamesList/name/asc', (req, res, next) => {
  queries
    .getAllGamesNamesAZ()
    .then((response) => {
      res.status(200).json(response.rows);
    })
    .catch(next);
});

// Get All Games by name desc(Done)
app.get('/gamesList/name/desc', (req, res, next) => {
  queries
    .getAllGamesNamesZA()
    .then((response) => {
      res.status(200).json(response.rows);
    })
    .catch(next);
});

// Get All Games by promotions(Done)
app.get('/gamesList/promo', (req, res, next) => {
  queries
    .getAllGamesPromo()
    .then((response) => {
      res.status(200).json(response.rows);
    })
    .catch(next);
});

// Get specific Game promotion(Done)
app.get('/gamesList/promo/:gameID', (req, res, next) => {
  const { gameID } = req.params;
  return queries
    .getGamePromo(gameID)
    .then((response) => {
      res.status(200).json(response.rows);
    })
    .catch(next);
});

// Get All Games by rating asc(Done)
app.get('/gamesList/ratings/asc', (req, res, next) => {
  queries
    .getAllGamesRatingASC()
    .then((response) => {
      res.status(200).json(response.rows);
    })
    .catch(next);
});

// Get All Games by rating desc(Done)
app.get('/gamesList/ratings/desc', (req, res, next) => {
  queries
    .getAllGamesRatingDESC()
    .then((response) => {
      res.status(200).json(response.rows);
    })
    .catch(next);
});

// Get All Games by price asc(Done)
app.get('/gamesList/price/asc', (req, res, next) => {
  queries
    .getAllPriceASC()
    .then((response) => {
      res.status(200).json(response.rows);
    })
    .catch(next);
});

// Get All Games by price desc(Done)
app.get('/gamesList/price/desc', (req, res, next) => {
  queries.getAllPriceDESC();
  // .then((response) => {
  //   res.status(200).json(response.rows);
  // })
  // .catch(next);
});

// Get wallet balance (Done)
app.get('/wallet', (req, res, next) => {
  const { userID } = req.body;

  return queries
    .getWalletBalance(userID)
    .then((response) => {
      res.status(200).json(response.rows);
    })
    .catch(next);
});

// Add keys for game (Done)
app.post('/addKeys', async (req, res, next) => {
  const { quantity } = req.body;
  const { gameId } = req.body;

  return queries
    .addKeys(quantity, gameId)
    .then((response) => {
      console.log(response);
      res
        .status(200)
        .send(`${response.length} keys for game id(${gameId}) added!`);
    })
    .catch(next);
});

// Redeem game key (Done)
app.post('/redeemKeys', async (req, res, next) => {
  const { key } = req.body;
  console.log(key);

  return queries
    .redeemKeys(key)
    .then((response) => {
      console.log(response);
      if (response.rowCount === 0) {
        res.status(404).send('Key not found');
      } else {
        res.status(200).json(response);
      }
    })
    .catch(next);
});

// get game name and promotions
app.get('/game/:Game_Name', async (req, res, next) => {
  const gameName = req.params.Game_Name;

  return queries
    .getGameName(gameName)
    .then((response) => {
      res.status(200).send(response);
    })
    .catch(next);
});

// Update user role
app.put('/update/type/:Id', verifyAccessToken, async (req, res, next) => {
  const { Id } = req.params;

  if (req.role != 'Admin') {
    let errData = {
      msg: 'you are not authorised to perform this operation',
    };
    // 403 - Forbidden
    res.status(403).type('text').send(errData);
    return;
  }

  return queries
    .makeAdmin(Id)
    .then((response) => {
      res.status(201).send(response);
    })
    .catch(next);
});

// Disable game key
app.put(
  '/update/DisableStatus/:game_id',
  verifyAccessToken,
  async (req, res, next) => {
    const gameId = req.params.game_id;
    console.log(gameId);

    if (req.role != 'Admin') {
      let errData = {
        msg: 'you are not authorised to perform this operation',
      };
      // 403 - Forbidden
      res.status(403).type('text').send(errData);
      return;
    }

    return queries
      .disableGame(gameId)
      .then((response) => {
        res.status(201).send(response);
      })
      .catch(next);
  }
);

// Enable game key
app.put(
  '/update/EnableStatus/:game_id',
  verifyAccessToken,
  async (req, res, next) => {
    const gameId = req.params.game_id;
    console.log(gameId);

    if (req.role != 'Admin') {
      let errData = {
        msg: 'you are not authorised to perform this operation',
      };
      // 403 - Forbidden
      res.status(403).type('text').send(errData);
      return;
    }

    return queries
      .enableGame(gameId)
      .then((response) => {
        res.status(201).send(response);
      })
      .catch(next);
  }
);

// Search Game
app.get('/search/:keyword', async (req, res, next) => {
  console.log('Working API');
  const { keyword } = req.params;

  console.log(keyword);

  return queries
    .getSearchedGames(keyword)
    .then((response) => {
      res.status(201).send(response);
    })
    .catch(next);
});

// Get Reviews
app.get('/games/:gameID/reviews', async (req, res, next) => {
  console.log('Working API');

  const { gameID } = req.params;

  return queries
    .getReviews(gameID)
    .then((response) => {
      if (response.rowCount === 0) {
        res
          .status(200)
          .send('No reviews for this game yet, please stay tuned!');
      }
      res.status(200).send(response);
    })
    .catch(next);
});

// Add reviews
app.post('/games/:gameID/reviews', async (req, res, next) => {
  console.log('Working API');

  const { gameID } = req.params;
  const { userID } = req.body;
  const { username } = req.body;
  const { profilePicURL } = req.body;
  const { content } = req.body;
  const { gameName } = req.body;

  return queries
    .getReviews(gameID, userID, username, profilePicURL, content, gameName)
    .then((response) => {
      res.status(201).send(response);
    })
    .catch(next);
});

// Get all User
app.get('/User', async (req, res, next) => {
  queries
    .User()
    .then((response) => {
      res.status(201).send(response);
    })
    .catch(next);
});

// Add Game to Wishlist
app.post(
  '/:userID/wishlist/:gameID',
  verifyAccessToken,
  async (req, res, next) => {
    const { userID } = req.params;
    const { gameID } = req.params;

    // Authorization check
    if (req.userid != userID) {
      let errData = {
        msg: 'You are not authorized to perform this operation!',
      };
      // 403 - forbidden
      return res.status(403).send(errData);
    }

    return queries
      .addToWishlist(userID, gameID)
      .then((response) => {
        res.status(200).send(response);
      })
      .catch(next);
  }
);

// Remove game from wishlist
app.delete(
  '/wishlist/delete/:gameID/:userID',
  verifyAccessToken,
  async (req, res, next) => {
    const { userID } = req.params;
    const { gameID } = req.params;

    // Authorization check
    if (req.userid != userID) {
      let errData = {
        msg: 'You are not authorized to perform this operation!',
      };
      // 403 - forbidden
      return res.status(403).send(errData);
    }

    console.log(userID);
    console.log(gameID);
    return queries
      .removeWishlistGame(userID, gameID)
      .then((response) => {
        res.status(201).send(response);
      })
      .catch(next);
  }
);

// Show user's wishlist
app.get('/wishlist/:userID', verifyAccessToken, async (req, res, next) => {
  const { userID } = req.params;
  if (req.role != 'Admin' && req.userid != userID) {
    let errData = {
      msg: 'you are not authorised to perform this operation',
    };
    // 403 Forbidden
    res.status(403).send(errData);
    return;
  }

  return queries
    .getUserWishlist(userID)
    .then((response) => {
      res.status(201).send(response);
    })
    .catch(next);
});

// Show specific game in user's wishlist
app.get(
  '/wishlist/:userID/:gameID',
  verifyAccessToken,
  async (req, res, next) => {
    try {
      let userID = req.params.userID;
      let gameID = req.params.gameID;

      // Authorization check
      if (req.userid != userID) {
        let errData = {
          msg: 'You are not authorized to perform this operation!',
        };
        // 403 - forbidden
        return res.status(403).send(errData);
      }

      return queries
        .getGameWishlist(userID, gameID)
        .then((response) => {
          console.log(response);
          res.status(201).send(response);
        })
        .catch(next);
    } catch (err) {
      console.log(err.message);
    }
  }
);

// Add Game to Cart
app.post('/:userID/cart/:gameID', verifyAccessToken, async (req, res, next) => {
  const { userID } = req.params;
  const { gameID } = req.params;

  // Authorization check
  if (req.userid != userID) {
    let errData = {
      msg: 'You are not authorized to perform this operation!',
    };
    // 403 - forbidden
    return res.status(403).send(errData);
  }

  return queries
    .addToCart(userID, gameID)
    .then((response) => {
      res.status(200).send(response);
    })
    .catch(next);
});

// Remove game from cart
app.delete(
  '/cart/delete/:gameID/:userID',
  verifyAccessToken,
  async (req, res, next) => {
    const { userID } = req.params;
    const { gameID } = req.params;

    // Authorization check
    if (req.userid != userID) {
      let errData = {
        msg: 'You are not authorized to perform this operation!',
      };
      // 403 - forbidden
      return res.status(403).send(errData);
    }

    return queries
      .removeCartGame(userID, gameID)
      .then((response) => {
        res.status(201).send(response);
      })
      .catch(next);
  }
);

// Show user's cart
app.get('/cart/:userID', verifyAccessToken, async (req, res, next) => {
  const { userID } = req.params;

  console.log(userID);
  console.log(req.role);
  console.log(req.userid);

  // Authorization check
  if (req.role != 'Admin' && req.userid != userID) {
    let errData = {
      msg: 'You are not authorized to perform this operation!',
    };
    // 403 - forbidden
    return res.status(403).send(errData);
  }

  return queries
    .getUserCart(userID)
    .then((response) => {
      res.status(201).send(response);
    })
    .catch(next);
});

// Purchase games in cart
app.put(
  '/cart/purchase/:userID',
  verifyAccessToken,
  verifyDiscountCode,
  async (req, res, next) => {
    const { userID } = req.params;
    const discountCode = req.discountCode;

    // Authorization check
    if (req.userid != userID) {
      let errData = {
        msg: 'You are not authorized to perform this operation!',
      };
      // 403 - forbidden
      return res.status(403).send(errData);
    }
    console.log(`here-------------------------------`);
    console.log(discountCode);
    console.log(`here-------------------------------`);

    return queries
      .purchaseCart(userID, discountCode)
      .then((response) => {
        console.log(`---------- queries response ----------`);
        console.log(response);
        res.status(200).json({ message: `success` });
      })
      .catch(next);
  }
);

// Show all Adverts
app.get('/advert', async (req, res, next) => {
  queries
    .getAllAdvert()
    .then((response) => {
      console.log(response);
      res.status(201).send(response);
    })
    .catch(next);
});

// Show one Advert
app.get('/advert/:gameID', async (req, res, next) => {
  const { gameID } = req.params;

  console.log(gameID);

  queries
    .getOneAdvert(gameID)
    .then((response) => {
      console.log(response);
      res.status(201).send(response);
    })
    .catch(next);
});

// Add Advert
app.post('/advert/add', verifyAccessToken, async (req, res, next) => {
  const game_id = req.body.Game_ID;
  const advert_text = req.body.Advert_Text;

  // Authorization check
  if (req.role != 'Admin') {
    let errData = {
      msg: 'You are not authorized to perform this operation!',
    };
    // 403 - forbidden
    return res.status(403).send(errData);
  }

  return queries
    .addAdvert(game_id, advert_text)
    .then((response) => {
      res.status(200).send(response);
    })
    .catch(next);
});

// Remove all Advert
app.delete('/advert/delete', verifyAccessToken, async (req, res, next) => {
  // Authorization check
  if (req.role != 'Admin') {
    let errData = {
      msg: 'You are not authorized to perform this operation!',
    };
    // 403 - forbidden
    return res.status(403).send(errData);
  }

  return queries
    .removeAllAdvert()
    .then((response) => {
      res.status(201).send(response);
    })
    .catch(next);
});

// Remove one Advert
app.delete(
  '/advert/delete/:gameID',
  verifyAccessToken,
  async (req, res, next) => {
    const { gameID } = req.params;

    // Authorization check
    if (req.role != 'Admin') {
      let errData = {
        msg: 'You are not authorized to perform this operation!',
      };
      // 403 - forbidden
      return res.status(403).send(errData);
    }

    return queries
      .removeOneAdvert(gameID)
      .then((response) => {
        res.status(201).send(response);
      })
      .catch(next);
  }
);

// Edit Advert
app.put('/advert/edit/:gameID', verifyAccessToken, async (req, res, next) => {
  const { gameID } = req.params;
  const advert_text = req.body.Advert_Text;

  // Authorization check
  if (req.role != 'Admin') {
    let errData = {
      msg: 'You are not authorized to perform this operation!',
    };
    // 403 - forbidden
    return res.status(403).send(errData);
  }

  return queries
    .updateAdvert(advert_text, gameID)
    .then((response) => {
      console.log(`---------- queries response ----------`);
      console.log(response);
      res.status(200).send(response);
    })
    .catch(next);
});

// get all game key
app.get('/getAllGame', async (req, res, next) => {
  queries
    .getAllGame()
    .then((response) => {
      console.log(response);
      res.status(201).send(response);
    })
    .catch(next);
});

// Add games key
app.post('/addGame', verifyAccessToken, async (req, res, next) => {
  const GameName = req.body.GameName;
  const GameCategory = req.body.GameCategory;
  const GameDescription = req.body.GameDescription;
  const GameRating = req.body.GameRating;
  const GamePrice = req.body.GamePrice;

  if (req.role != 'Admin') {
    let errData = {
      msg: 'you are not authorised to perform this operation',
    };
    // 403 - Forbidden
    res.status(403).type('text').send(errData);
    return;
  }

  return queries
    .addingGames(GameName, GameCategory, GameDescription, GameRating, GamePrice)
    .then((response) => {
      res.status(201).send(response);
    })
    .catch(next);
});

// get gift card
app.get('/giftcard', async (req, res, next) => {
  queries
    .getAllGiftCard()
    .then((response) => {
      res.status(201).send(response);
    })
    .catch(next);
});

app.get('/GetAllReferral', async (req, res, next) => {
  queries
    .getAllReferralcode()
    .then((response) => {
      res.status(201).send(response);
    })
    .catch(next);
});

// get Referralcode
app.get('/Referralcodes', verifyAccessToken, async (req, res, next) => {
  return queries
    .getReferralcode(req.userid)
    .then((response) => {
      res.status(201).send(response);
    })
    .catch(next);
});

app.get('/Referral/:Code', verifyAccessToken, async (req, res, next) => {
  const { Code } = req.params;
  return queries
    .verifyDiscount(Code, req.userid)
    .then((response) => {
      res.status(201).send(response.rows);
    })
    .catch(next);
});

// Add Referralcode
app.post('/Referralcode', async (req, res, next) => {
  const userID = req.body.userID;
  const code = req.body.Code;
  return queries
    .generateReferralcode(userID, code)
    .then((response) => {
      res.status(201).send(response);
    })
    .catch(next);
});

app.get('/getClaimGiftCard', async (req, res, next) => {
  return queries
    .getClaimGift()
    .then((response) => {
      res.status(201).send(response);
    })
    .catch(next);
});

// Get GiftCard orders
app.get('/getGiftCardfromcart/:userID', async (req, res, next) => {
  const { userID } = req.params;
  return queries
    .getgiftcardfromcart(userID)
    .then((response) => {
      res.status(201).send(response);
    })
    .catch(next);
});

app.get(
  '/SentGiftCardToUser/:userid',
  verifyAccessToken,
  async (req, res, next) => {
    return queries
      .SentGiftCardToUser(req.userid)
      .then((response) => {
        res.status(201).send(response);
      })
      .catch(next);
  }
);

app.put('/ClaimGiftCard', verifyAccessToken, async (req, res, next) => {
  const Code = req.body.Code;

  return queries
    .ClaimGiftCard(req.userid, Code)
    .then((response) => {
      res.status(201).send(response);
    })
    .catch(next);
});

app.post(
  '/UserPurchasedGiftCard',
  verifyAccessToken,
  async (req, res, next) => {
    const Amount = req.body.Amount;
    const BuyerUserID = req.body.BuyerUserID;
    const UserID = req.body.UserID;
    const Quantity = req.body.Quantity;
    const Message = req.body.Message;
    const FromBuyUser = req.body.FromBuyUser;
    return queries
      .UserPurchasedGiftCard(
        req.userid,
        Amount,
        BuyerUserID,
        UserID,
        Quantity,
        Message,
        FromBuyUser
      )
      .then((response) => {
        if (response === false) {
          res.status(403).json({ message: 'You have insufficient balance!' });
        } else {
          res.status(201).send(response);
        }
      })
      .catch(next);
  }
);

// Get all username
app.get('/getUsername/:userID', async (req, res, next) => {
  const { userID } = req.params;
  return queries
    .getUsername(userID)
    .then((response) => {
      res.status(201).send(response);
    })
    .catch(next);
});

// Get all game tags
app.get('/gameTags', (req, res, next) => {
  queries
    .getAllGameTags()
    .then((response) => {
      res.status(200).send(response.rows);
    })
    .catch(next);
});

app.get('/data/:game_name', (req, res, next) => {
  const game_name = req.params.game_name;

  queries
    .getGameData(game_name)
    .then((response) => {
      res.status(200).send(response);
    })
    .catch(next);
});

//--------------------------------------------------
// Data analysis
//--------------------------------------------------
app.get('/data/:Game_Name', async (req, res, next) => {
  const gameName = req.params.Game_Name;

  return queries
    .getGameData(gameName)
    .then((response) => {
      res.status(200).send(response);
    })
    .catch(next);
});

//--------------------------------------------------
// 404 Handler
//--------------------------------------------------
app.use((req, res) => {
  res
    .status(404)
    .json({ error: `Unable to access ${req.method} ${req.originalUrl}` });
});

//--------------------------------------------------
// Error Handler
//--------------------------------------------------
app.use((err, req, res) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err });
});

//--------------------------------------------------
// To show app is running
//--------------------------------------------------
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

//--------------------------------------------------
// Socket.io implementation (CANCELLED)
//--------------------------------------------------
// const io = require('socket.io')(5000, {
//   cors: {
//     origin: 'http://localhost:3001',
//   },
// });

// io.on('connection', async (socket) => {
//   const { userid, role } = await verifyRequestTokenFromSocket(
//     socket.handshake.auth.token
//   );

//   socket.join(userid);

//   socket.on('send-message', ({ recipient, text }) => {
//     // console.log(recipient);
//     let recipients = [1, parseInt(recipient)];
//     console.log(recipients);

//     recipients.forEach((recipient) => {
//       console.log(recipient);
//       console.log(text);
//       console.log(userid);
//       console.log(role);

//       if (role !== 'Admin') {
//         if (recipient !== userid && recipient === 1) {
//           socket.broadcast.to(recipient).emit('receive-message', {
//             sender: userid,
//             text,
//           });
//         }
//       } else {
//         if (recipient !== userid) {
//           socket.broadcast.to(recipient).emit('receive-message', {
//             sender: userid,
//             text,
//           });
//         }
//       }
//     });
//   });
// });
