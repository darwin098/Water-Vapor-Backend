const { query } = require('./database');

module.exports.insertUser = function insertUser(Username, Email, Password) {
  const Query = {
    text: 'INSERT INTO user_table (Username, Email, Password) VALUES ($1, $2, $3)',
    values: [Username, Email, Password],
  };
  return query(Query)
    .then((response) => response)
    .catch((error) => {
      throw error;
    });
};

module.exports.getUser = function getUser(Username, Password) {
  const Query = {
    text: 'SELECT * FROM User_Table WHERE Username = $1  AND Password = $2',
    values: [Username, Password],
  };
  return query(Query)
    .then((response) => response.rows[0])
    .catch((error) => {
      throw error;
    });
};

module.exports.getUserInfo = function getUserInfo(Id) {
  const Query = {
    text: 'SELECT * FROM User_Table WHERE Id = $1',
    values: [Id],
  };
  return query(Query)
    .then((response) => response.rows[0])
    .catch((error) => {
      throw error;
    });
};

module.exports.getUserImage = function getUserImage(Id) {
  const Query = {
    text: 'SELECT profile_pic_url FROM User_Table WHERE Id = $1',
    values: [Id],
  };
  return query(Query)
    .then((response) => response.rows[0].profile_pic_url)
    .catch((error) => {
      throw error;
    });
};

module.exports.updateUser = function updateUser(Id, Username, Email, Password) {
  if (Username !== '') {
    const Query = {
      text: 'UPDATE User_Table SET Username = $1 WHERE Id = $2',
      values: [Username, Id],
    };
    return query(Query).then((response) => {
      if (Email !== '') {
        const Query = {
          text: 'UPDATE User_Table SET Email = $1 WHERE Id = $2',
          values: [Email, Id],
        };
        return query(Query).then(() => {
          if (Password !== '') {
            const Query = {
              text: 'UPDATE User_Table SET Password = $1 WHERE Id = $2',
              values: [Password, Id],
            };
            return query(Query)
              .then((response) => response)
              .catch((error) => {
                throw error;
              });
          } else {
            return response;
          }
        });
      } else if (Password !== '') {
        const Query = {
          text: 'UPDATE User_Table SET Password = $1 WHERE Id = $2',
          values: [Password, Id],
        };
        return query(Query)
          .then((response) => response)
          .catch((error) => {
            throw error;
          });
      } else {
        return response;
      }
    });
  }

  if (Email !== '') {
    const Query = {
      text: 'UPDATE User_Table SET Email = $1 WHERE Id = $2',
      values: [Email, Id],
    };
    return query(Query).then((response) => {
      if (Password !== '') {
        const Query = {
          text: 'UPDATE User_Table SET Password = $1 WHERE Id = $2',
          values: [Password, Id],
        };
        return query(Query)
          .then((response) => response)
          .catch((error) => {
            throw error;
          });
      } else {
        return response;
      }
    });
  }

  if (Password !== '') {
    const Query = {
      text: 'UPDATE User_Table SET Password = $1 WHERE Id = $2',
      values: [Password, Id],
    };
    return query(Query)
      .then((response) => response)
      .catch((error) => {
        throw error;
      });
  }
};

module.exports.updateProfile = function updateProfile(ProfilePicurl, Id) {
  const Query = {
    text: 'UPDATE User_Table SET Profile_Pic_url = $1 WHERE Id = $2',
    values: [ProfilePicurl, Id],
  };
  return query(Query)
    .then((response) => response)
    .catch((error) => {
      throw error;
    });
};

module.exports.getKeyLibrary = function getKeyLibrary(Id) {
  const Query = {
    text: 'SELECT l.key, g.game_name FROM Library_Table l, key_table k, games_table g WHERE userid = $1 and k.key = l.key and g.game_id = k.game_id',
    values: [Id],
  };
  return query(Query)
    .then((response) => response.rows)
    .catch((error) => {
      throw error;
    });
};

module.exports.retrieveTrans = function retrieveGame(productName, Id) {
  const Query = {
    text: 'SELECT Price FROM Library_Table WHERE Product_Name = $1 AND userID = $2',
    values: [productName, Id],
  };
  return query(Query)
    .then((response) => response.rows[0])
    .catch((error) => {
      throw error;
    });
};

module.exports.addFunds = function addFunds(Id, Amount_Retrieved) {
  const Query = {
    text: 'INSERT INTO Funds_Table (UserID, Amount_Retrieved) VALUES ($1, $2)',
    values: [Id, Amount_Retrieved],
  };
  return query(Query)
    .then((response) => response)
    .catch((error) => {
      throw error;
    });
};

module.exports.refundWallet = function refundWallet(Price, Id) {
  const Query = {
    text: 'UPDATE User_Table SET Wallet = $1 WHERE Id = $2',
    values: [Price, Id],
  };
  return query(Query)
    .then((response) => response)
    .catch((error) => {
      throw error;
    });
};

module.exports.removeKey = function removeKey(Id, Key) {
  const Query = {
    text: 'DELETE FROM Library_Table WHERE Id = $1 AND Key = $2',
    values: [Id, Key],
  };
  return query(Query)
    .then((response) => response)
    .catch((error) => {
      throw error;
    });
};

module.exports.addWallet = function addWallet(Id, Funds) {
  const Query1 = {
    text: 'SELECT Wallet FROM User_Table WHERE Id = $1',
    values: [Id],
  };
  return query(Query1).then((response) => {
    console.log(response.rows[0].wallet);
    const AMT = parseFloat(response.rows[0].wallet) + parseFloat(Funds);

    const Query2 = {
      text: 'UPDATE User_Table SET Wallet = $1 WHERE Id = $2',
      values: [AMT, Id],
    };
    return query(Query2)
      .then((response2) => response2)
      .catch((error) => {
        throw error;
      });
  });
};

module.exports.ClaimGiftCard = function ClaimGiftCard(Id, Code) {
  const Query1 = {
    text: 'SELECT * FROM GiftCard_Cart_table WHERE Code = $1',
    values: [Code],
  };
  return query(Query1).then((response) => {
    if (response.rowCount > 0) {
      const Query2 = {
        text: 'SELECT Wallet FROM User_Table WHERE Id = $1',
        values: [Id],
      };
      return query(Query2).then((response) => {
        console.log(response.rows[0].wallet);

        const Query3 = {
          text: `UPDATE User_Table SET Wallet = Wallet+(select Quantity*Amount from GiftCard_Cart_table where Code='${Code}') WHERE Id = ${Id}`,
        };
        return query(Query3).then((response) => {
          console.log(response);
          const Query3 = {
            text: 'DELETE FROM GiftCard_Cart_table where code = $1',
            values: [Code],
          };

          return query(Query3)
            .then((response2) => response2)
            .catch((error) => {
              throw error;
            });
        });
      });
    }
  });
};

module.exports.getPromotions = function getPromotions() {
  const Query = {
    text: 'SELECT * FROM promotion_table WHERE End_date > NOW()',
  };
  return query(Query)
    .then((response) => response)
    .catch((error) => {
      throw error;
    });
};

module.exports.editGames = function addGames(
  gameID,
  gameName,
  price,
  gameImgURL = 'defaultGame.jpg',
  description,
  tags
) {
  let Query = `
  UPDATE
    games_table
  SET
    Game_name = '${gameName}',
    Price = ${price},
    Game_img_url = '${gameImgURL}',
    Description = '${description}'
  WHERE
    Game_id = ${gameID};`;

  if (tags) {
    Query += `
    DELETE FROM
      gametags_table
    WHERE 
      Game_name = '${gameName}';
      
    INSERT INTO
      gametags_table
      (Tag_name, Game_name)
    VALUES
    `;
    for (i = 0; i < tags.length; i++) {
      if (i != tags.length - 1)
        Query += `
        ('${tags[i]}', '${gameName}'),
        `;
      else {
        Query += `
        ('${tags[i]}', '${gameName}');
        `;
      }
    }
  }

  console.log(Query);
  return query(Query)
    .then((response) => response)
    .catch((error) => {
      throw error;
    });
};

module.exports.addGames = function addGames(
  gameName,
  price,
  gameImgURL = 'defaultGame.jpg',
  description,
  tags
) {
  let Query = `
  INSERT INTO
    games_table
    (Game_name, Price, Game_img_url, Description)
  VALUES
    ('${gameName}', '${price}', '${gameImgURL}', '${description}')
  RETURNING
    Game_id;
    `;

  if (tags) {
    Query += `
    INSERT INTO
      gametags_table
      (Tag_name, Game_name)
    VALUES 
    `;
    for (i = 0; i < tags.length; i++) {
      if (i != tags.length - 1)
        Query += `
        ('${tags[i]}', '${gameName}'),
      `;
      else {
        Query += `
        ('${tags[i]}', '${gameName}');
        `;
      }
    }
  }
  console.log(Query);
  return query(Query)
    .then((response) => response)
    .catch((error) => {
      throw error;
    });
};

module.exports.getGames = function getGames(keyword = '', sort, lastId = 0) {
  let order = '';

  switch (sort) {
    case 'newest':
      order = 'Created_On asc';
      break;

    case 'oldest':
      order = 'Created_On asc';
      break;

    case 'nameasc':
      order = 'Game_name asc';
      break;

    case 'namedesc':
      order = 'Game_name desc';
      break;

    case 'ratingsasc':
      order = 'Rating asc';
      break;

    case 'ratingsdesc':
      order = 'Rating desc';
      break;

    case 'priceasc':
      order = 'Price asc';
      break;

    case 'pricedesc':
      order = 'Price desc';
      break;
  }

  console.log(order);

  const getAllRowsQuery = {
    text: `SELECT COUNT(*) FROM games_table WHERE
    Game_name ILIKE '%${keyword}%'`,
  };
  let totalRows;

  const GetDataQuery = {
    text: `
    SELECT 
      sorted_values.*,
      p.Promotion_info,
      p.Discount_percentage,
      p.End_date
    FROM
        (
          SELECT 
              ROW_NUMBER () OVER (order by ${order}) RN,
              G.*
          FROM 
              games_table as G
        ) sorted_values
    LEFT JOIN 
      promotion_table p
    ON
      p.game_id = sorted_values.game_id and
      p.end_date > now()
    WHERE
      Game_name ILIKE '%${keyword}%' and
      RN > ${lastId}
    order by 
      ${order}
    LIMIT 
      5;
    `,
  };
  let data;

  let json;

  return query(getAllRowsQuery)
    .then((response) => {
      totalRows = response.rows[0].count;
    })
    .then(() => {
      return query(GetDataQuery)
        .then((response) => {
          data = response.rows;
          json = { totalRows: totalRows, data: data };
          return json;
        })
        .catch((error) => {
          throw error;
        });
    });
};

module.exports.getAllGamesPromo = function getAllGamesPromo() {
  const Query = {
    text: 'SELECT G.*, P.Discount_percentage, P.Promotion_info, P.End_date FROM games_table as G, promotion_table as P where G.Game_id = P.Game_id and P.End_date > NOW()',
  };
  return query(Query)
    .then((response) => response)
    .catch((error) => {
      throw error;
    });
};

module.exports.getGamePromo = function getGamePromo(gameID) {
  const Query = {
    text: `
    SELECT 
      G.*, 
      P.Discount_percentage, 
      P.Promotion_info, 
      P.End_date
    FROM 
      games_table as G, 
      promotion_table as P 
    WHERE 
      G.Game_id = P.Game_id and 
      P.Game_id = ${gameID} and 
      P.End_date > NOW();
    `,
  };
  return query(Query)
    .then((response) => response)
    .catch((error) => {
      throw error;
    });
};

module.exports.verifyDiscount = function verifyDiscount(discountCode, userid) {
  const Query = {
    text: `
      SELECT * FROM Referral_table where Referral_code = '${discountCode}' AND userid != ${userid};
    `,
  };

  return query(Query)
    .then((response) => response)
    .catch((error) => {
      throw error;
    });
};

module.exports.getWalletBalance = function getWalletBalance(userID) {
  const Query = {
    text: `
    SELECT 
        Wallet
    FROM 
        User_Table 
    WHERE
        ID = ${userID}
    `,
  };
  return query(Query)
    .then((response) => response)
    .catch((error) => {
      throw error;
    });
};

module.exports.addKeys = function addKeys(quantity, gameId) {
  let queryText = '';

  for (let i = 0; i < quantity; i++) {
    queryText += `INSERT INTO key_table (Game_id, Key) VALUES (${gameId}, '${
      Date.now().toString(36) + Math.random().toString(36).substr(2)
    }');`;
  }

  return query({
    text: queryText,
  })
    .then((response) => response)
    .catch((error) => {
      throw error;
    });
};

module.exports.redeemKeys = function redeemKeys(key) {
  const Query = {
    text: `
      UPDATE
          key_table 
      SET 
          Key_availability = 'REDEEMED'
      WHERE
          Key = '${key}' AND
          Key_availability != 'REDEEMED';
    `,
  };
  return query(Query)
    .then((response) => response)
    .catch((error) => {
      throw error;
    });
};

module.exports.makeAdmin = function makeAdmin(Id) {
  const Query = {
    text: `
      UPDATE
        User_Table
      SET 
          type = 'Admin'
      WHERE
          Id = $1
    `,
    values: [Id],
  };
  return query(Query)
    .then((response) => response)
    .catch((error) => {
      throw error;
    });
};

module.exports.disableGame = function disableGame(KeyId) {
  const Query = {
    text: `
      UPDATE
          games_table
      SET 
          Status = 'DISABLED'
      WHERE
          game_id = $1
    `,
    values: [KeyId],
  };
  return query(Query)
    .then((response) => response)
    .catch((error) => {
      throw error;
    });
};

module.exports.enableGame = function enableGame(KeyId) {
  const Query = {
    text: `
      UPDATE
          games_table
      SET 
          Status = 'ENABLED'
      WHERE
          game_id = $1
    `,
    values: [KeyId],
  };
  return query(Query)
    .then((response) => response)
    .catch((error) => {
      throw error;
    });
};

module.exports.getGameName = function getGameName(gameName) {
  const Query = {
    text: `
    SELECT
        G.*,
        P.Discount_percentage
    FROM  
        games_table G
        left join promotion_table P
    ON
        G.game_id = P.game_id
    WHERE
      G.game_name = $1;
    `,
    values: [gameName],
  };
  return query(Query)
    .then((response) => response)
    .catch((error) => {
      throw error;
    });
};

module.exports.getSearchedGames = function getSearchedGames(keyword) {
  const Query = {
    text: `
      SELECT
        *
      FROM
        games_table
      WHERE
        Game_name LIKE '%${keyword}%'
    `,
  };
  return query(Query)
    .then((response) => response)
    .catch((error) => {
      throw error;
    });
};

module.exports.User = function User() {
  const Query = {
    text: `
        SELECT 
            Id,
            Username,
            Type
        FROM
            User_Table
      `,
  };
  return query(Query)
    .then((response) => response)
    .catch((error) => {
      throw error;
    });
};

module.exports.getReviews = function getReviews(keyword) {
  const Query = {
    text: `
      SELECT
        Username, Profile_Pic_url, Content, Created_On
      FROM
        reviews_table
      WHERE
        Game_name = $1
    `,
    values: [keyword],
  };
  return query(Query)
    .then((response) => response)
    .catch((error) => {
      throw error;
    });
};

module.exports.getAllGame = function getAllGame() {
  const Query = {
    text: `
      SELECT 
          game_id,
          game_name,
          category,
          description,
          rating,
          price,
          status
      FROM
          games_table
    `,
  };
  return query(Query)
    .then((response) => response)
    .catch((error) => {
      throw error;
    });
};

module.exports.addToWishlist = function addToWishlist(userID, gameID) {
  const Query = {
    text: 'INSERT INTO wishlist_table (userid, game_id) VALUES ($1, $2)',
    values: [userID, gameID],
  };
  return query(Query)
    .then((response) => response)
    .catch((error) => {
      throw error;
    });
};

module.exports.removeWishlistGame = function removeKey(userID, gameID) {
  const Query = {
    text: 'DELETE FROM wishlist_table WHERE userid = $1 AND game_id = $2',
    values: [userID, gameID],
  };
  return query(Query)
    .then((response) => response)
    .catch((error) => {
      throw error;
    });
};

module.exports.getUserWishlist = function getUserWishlist(userID) {
  const Query = {
    text: `
      SELECT 
          w.userid, w.game_id, g.game_name, g.price, p.discount_percentage, 
          ROUND(((g.price / 100) * (100 - p.discount_percentage)) :: NUMERIC, 2) AS discounted_price, 
          g.game_img_url
      FROM 
          wishlist_table AS w 
          INNER JOIN games_table AS g 
            on g.game_id = w.game_id
          left join (select * from promotion_table where end_date > NOW()) AS p
            on p.game_id = w.game_id
      WHERE
          g.game_id = w.game_id AND w.userid = ${userID}
    `,
  };
  return query(Query)
    .then((response) => response)
    .catch((error) => {
      throw error;
    });
};

module.exports.getGameWishlist = function getGameWishlist(userID, gameID) {
  const Query = {
    text: `
    SELECT 
      *
    FROM 
      wishlist_table AS w,
      games_table AS g
    WHERE
      g.game_id = w.game_id AND
      w.userid = ${userID} AND g.game_id = ${gameID}
    `,
  };
  return query(Query)
    .then((response) => response)
    .catch((error) => {
      throw error;
    });
};

module.exports.addReviews = function addReviews(
  userID,
  username,
  profilePicURL,
  content,
  gameName
) {
  const Query = {
    text: `
      INSERT INTO
        reviews_table
        (Review_id, User_id, Username, Profile_Pic_url, Content, Game_Name, Created_On)
      VALUES
        ($1, $2, $3, $4, $5)
    `,
    values: [userID, username, profilePicURL, content, gameName],
  };
  return query(Query)
    .then((response) => response)
    .catch((error) => {
      throw error;
    });
};

module.exports.addToCart = function addToCart(userID, gameID) {
  const Query = {
    text: `
      SELECT
        *
      FROM
        cart_table as c, 
        games_table as g
      WHERE
        g.game_id = c.game_id AND c.game_id = ${gameID} AND c.userid = ${userID}
    `,
  };
  return query(Query).then((response) => {
    if (response.rowCount === 0) {
      const Query2 = {
        text: `INSERT INTO cart_table (userid, game_id) VALUES (${userID}, ${gameID})`,
      };
      return query(Query2)
        .then((response2) => response2)
        .catch((error) => {
          throw error;
        });
    }

    const Query3 = {
      text: `UPDATE cart_table
               SET    quantity = quantity + 1
               WHERE  game_id = ${gameID} AND userid = ${userID}
        `,
    };
    return query(Query3)
      .then((response3) => response3)
      .catch((error) => {
        throw error;
      });
  });
};

module.exports.removeCartGame = function removeKey(userID, gameID) {
  const Query = {
    text: `
      SELECT
        *
      FROM
        cart_table as c, 
        games_table as g
      WHERE
        g.game_id = c.game_id AND c.game_id = ${gameID} AND c.userid = ${userID}
    `,
  };
  return query(Query).then((response) => {
    if (response.rowCount === 0) {
      const Query2 = {
        text: 'DELETE FROM cart_table WHERE userid = $1 AND game_id = $2',
        values: [userID, gameID],
      };
      return query(Query2)
        .then((response2) => response2)
        .catch((error) => {
          throw error;
        });
    }

    const Query3 = {
      text: `UPDATE cart_table
               SET    quantity = quantity - 1
               WHERE  game_id = ${gameID} AND userid = ${userID};

            DELETE FROM cart_table
            WHERE quantity <= 0;
        `,
    };
    return query(Query3)
      .then((response3) => response3)
      .catch((error) => {
        throw error;
      });
  });
};

module.exports.getUserCart = function getUserCart(userID) {
  const Query = {
    text: `
    SELECT 
          c.userid, c.game_id, g.game_name, g.price, p.discount_percentage, 
          ROUND(((g.price / 100) * (100 - p.discount_percentage)) :: NUMERIC, 2) AS discounted_price, 
          c.quantity, g.game_img_url
    FROM 
        cart_table AS c 
        INNER JOIN games_table AS g 
          on g.game_id = c.game_id
        left join (select * from promotion_table where end_date > NOW()) AS p
          on p.game_id = c.game_id
    WHERE
        c.userid = ${userID}
    `,
  };
  return query(Query)
    .then((response) => response)
    .catch((error) => {
      throw error;
    });
};

module.exports.addWallet = function addWallet(Id, Funds) {
  const Query1 = {
    text: 'SELECT Wallet FROM User_Table WHERE Id = $1',
    values: [Id],
  };
  return query(Query1).then((response) => {
    console.log(response.rows[0].wallet);
    const AMT = parseFloat(response.rows[0].wallet) + parseFloat(Funds);

    const Query2 = {
      text: 'UPDATE User_Table SET Wallet = $1 WHERE Id = $2',
      values: [AMT, Id],
    };
    return query(Query2)
      .then((response2) => response2)
      .catch((error) => {
        throw error;
      });
  });
};

module.exports.purchaseCart = function purchaseCart(userID, discountCode) {
  // Store gameIds and quantities from cart table
  const getGamesQuery = {
    text: `SELECT * FROM cart_table WHERE userid = ${userID};`,
  };
  let userInfo;

  const getUserQuery = {
    text: `SELECT * FROM user_table WHERE id = ${userID};`,
  };
  let cartInfo;

  // Store game keys from game key table
  let getGameKeysQuery = ``;
  let addGameKeysQuery = ``;
  let gamekeys = [];

  console.log(discountCode);

  // Decrease user wallet balance
  const decreaseWalletQuery = discountCode
    ? {
        text: `
    UPDATE
      user_table
    SET
      wallet =
        wallet - (SELECT
          (
            (SUM(((g.price / 100) * (100 - COALESCE((SELECT Discount_percentage FROM promotion_table WHERE End_date > NOW() AND game_id = g.game_id), 0))) / 100) *
            (SELECT (100 - COALESCE(discount_percentage, 0))
            FROM
            referral_table
            WHERE
            referral_code = '${discountCode}' LIMIT 1)
            ))
        FROM
          cart_table as c,
          user_table as u,
          games_table as g
        WHERE
          u.id = ${userID} AND
          c.userid = u.id AND
          c.game_id = g.game_id)
    WHERE
      id = ${userID} AND
      wallet > (SELECT
        (
          (SUM(((g.price / 100) * (100 - COALESCE((SELECT Discount_percentage FROM promotion_table WHERE End_date > NOW() AND game_id = g.game_id), 0))) / 100) *
          (SELECT (100 - COALESCE(discount_percentage, 0))
          FROM
          referral_table
          WHERE
          referral_code = '${discountCode}' LIMIT 1)
          ))
      FROM
        cart_table as c,
        user_table as u,
        games_table as g
      WHERE
        u.id = ${userID} AND
        c.userid = u.id AND
        c.game_id = g.game_id);
  `,
      }
    : {
        text: `
    UPDATE user_table
    SET    wallet = wallet - (SELECT SUM(g.price)
                              FROM cart_table as c, user_table as u, games_table as g
                              WHERE u.id = ${userID} AND c.userid = u.id AND
                              c.game_id = g.game_id)
    WHERE id = ${userID} AND wallet > (SELECT SUM(g.price)
                                      FROM cart_table as c, user_table as u, games_table as g
                                      WHERE u.id = ${userID} AND c.userid = u.id AND
                                      c.game_id = g.game_id)
  `,
      };

  console.log(decreaseWalletQuery.text);

  let newquery = ``;

  const deleteCartQuery = `
      DELETE FROM cart_table WHERE userid = ${userID} 
  `;

  return query(getUserQuery)
    .then((response5) => {
      userInfo = response5.rows;
      console.log(`---------- userInfo ----------`);
      console.log(userInfo);
    })
    .then(() => {
      return query(getGamesQuery)
        .then((response) => {
          cartInfo = response.rows;
          console.log(`---------- cartInfo ----------`);
          console.log(cartInfo);
        })
        .then(() => {
          for (i = 0; i < cartInfo.length; i++) {
            getGameKeysQuery += `SELECT key from key_table where Game_id = ${cartInfo[i].game_id} AND Key_availability = 'NOT REDEEMED' LIMIT ${cartInfo[i].quantity};`;
          }

          const characters =
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
          const charactersLength = characters.length;
          function makeId(length) {
            let result = '';
            for (let i = 0; i < length; i++) {
              result += characters.charAt(
                Math.floor(Math.random() * charactersLength)
              );
            }
            return result;
          }

          for (i = 0; i < cartInfo.length; i++) {
            let key = '';

            key = makeId(10);
            addGameKeysQuery += `
          INSERT INTO key_table(Game_id, Key) VALUES (${cartInfo[i].game_id}, '${key}');
          INSERT INTO library_table(userID, Key) VALUES (${cartInfo[i].userid}, '${key}');
        `;
            console.log(
              '---------------------------------------------------------------'
            );
            console.log(addGameKeysQuery);
          }
          console.log(addGameKeysQuery);

          return query(addGameKeysQuery)
            .then((response1) => {
              console.log(`---------- response1 ----------`);
              console.log(response1);
            })
            .then(() => {
              query(decreaseWalletQuery).then((response2) => {
                console.log(`---------- response2 ----------`);
                console.log(response2);
              });
            })
            .then(() => {
              query(deleteCartQuery).then((response3) => {
                console.log(`---------- response3 ----------`);
                console.log(response3);
              });
            })
            .catch((error) => {
              throw error;
            });
        });
    });

  // return query(getGamesQuery)
  //   .then((response) => {
  //     cartInfo = response.rows;
  //     console.log(`---------- cartInfo ----------`);
  //     console.log(cartInfo);
  //   })
  //   .then(() => {
  //     for (i = 0; i < cartInfo.length; i++) {
  //       getGameKeysQuery += `SELECT key from key_table where Game_id = ${cartInfo[i].game_id} AND Key_availability = 'NOT REDEEMED' LIMIT ${cartInfo[i].quantity};`;
  //     }

  //     const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  //     const charactersLength = characters.length;
  //     function makeId(length) {
  //         let result = '';
  //         for (let i = 0; i < length; i++) {
  //             result += characters.charAt(Math.floor(Math.random() * charactersLength));
  //         }
  //         return result;
  //     }

  //     for (i = 0; i < cartInfo.length; i++) {
  //       addGameKeysQuery += `INSERT INTO key_table(Game_id, Key) VALUES (${cartInfo[i].game_id}, '${makeId(6)}'); `;
  //       console.log('---------------------------------------------------------------')
  //       console.log(addGameKeysQuery);
  //     }
  //     console.log(addGameKeysQuery);

  //     return query(addGameKeysQuery).then((response2) => {
  //       console.log(`---------- response2 ----------`);
  //       console.log(response2.rows);
  //       if (response2.rowCount !== 0) {
  //         for (k = 0; k < response2.rows.length; k++) {
  //           gamekeys.push(response2.rows[k].key);
  //         }
  //         console.log(gamekeys);

  //         for (z = 0; z < gamekeys.length; z++) {
  //           newquery += `UPDATE key_table SET status = 'DISABLED' WHERE key = '${gamekeys[z]}'; INSERT INTO library_table(userID, key) VALUES (${userID}, '${gamekeys[z]}');`;
  //         }
  //         console.log(newquery);

  //         return query(newquery)
  //           .then((response3) => {
  //             console.log(`---------- response3 ----------`);
  //             console.log(response3);
  //           })
  //           .then(() => {
  //             query(decreaseWalletQuery).then((response4) => {
  //               console.log(`---------- response4 ----------`);
  //               console.log(response4);
  //             });
  //           })
  //           .then(() => {
  //             query(deleteCartQuery).then((response5) => {
  //               console.log(`---------- response5 ----------`);
  //               console.log(response5);
  //             });
  //           });
  //       }

  //       return response2;
  //     });
  //   })
  //   .catch((error) => {
  //     throw error;
  //   });
};

module.exports.getAllAdvert = function getAllAdvert() {
  const Query = {
    text: `
    SELECT
      ad.game_id, g.game_name, ad.advert_text, g.game_img_url
    FROM
      advert_table as ad,
      games_table as g
    WHERE
      ad.game_id = g.game_id
    `,
  };
  return query(Query)
    .then((response) => response)
    .catch((error) => {
      throw error;
    });
};

module.exports.getOneAdvert = function getOneAdvert(game_id) {
  const Query = {
    text: `
    SELECT
      ad.game_id, g.game_name, ad.advert_text, g.game_img_url
    FROM
      advert_table as ad,
      games_table as g
    WHERE
      ad.game_id = g.game_id AND ad.game_id = ${game_id}
    `,
  };
  return query(Query)
    .then((response) => response)
    .catch((error) => {
      throw error;
    });
};

module.exports.addAdvert = function addAdvert(game_id, advert_text) {
  const Query = {
    text: 'INSERT INTO advert_table (game_id, advert_text) VALUES ($1, $2)',
    values: [game_id, advert_text],
  };
  return query(Query)
    .then((response) => response)
    .catch((error) => {
      throw error;
    });
};

module.exports.removeAllAdvert = function removeAllAdvert() {
  const Query = {
    text: 'DELETE FROM advert_table',
  };
  return query(Query)
    .then((response) => response)
    .catch((error) => {
      throw error;
    });
};

module.exports.removeOneAdvert = function removeOneAdvert(game_id) {
  const Query = {
    text: `DELETE FROM advert_table WHERE game_id = ${game_id}`,
  };
  return query(Query)
    .then((response) => response)
    .catch((error) => {
      throw error;
    });
};

module.exports.updateAdvert = function updateAdvert(advert_text, game_id) {
  const Query = {
    text: 'UPDATE advert_table SET advert_text = $1 WHERE game_id = $2',
    values: [advert_text, game_id],
  };
  return query(Query)
    .then((response) => response)
    .catch((error) => {
      throw error;
    });
};

module.exports.addingGames = function addingGames(
  game_name,
  category,
  description,
  rating,
  price
) {
  const Query = {
    text: `INSERT INTO
            games_table
            (game_name, category, description, rating, price)
          VALUES
            ($1, $2, $3, $4, $5)
    `,
    values: [game_name, category, description, rating, price],
  };
  return query(Query)
    .then((response) => response)
    .catch((error) => {
      throw error;
    });
};

module.exports.SentGiftCardToUser = function SentGiftCardToUser(userid) {
  const Query = {
    text: ` select G.quantity, G.Message, G.FromBuyUser, G.UserID, G.code, G.amount, GI.giftcard_img_url, (select Username from User_Table where Id = (select BuyerUserID from GiftCard_Cart_table where Code = G.code)) "BuyerUserName" from GiftCard_Cart_table G, User_Table U, giftcard_table GI 
        where G.UserID = U.id  AND BuyerUserID != ${userid} AND G.UserID = ${userid}
    `,
  };
  return query(Query)
    .then((response) => response)
    .catch((error) => {
      throw error;
    });
};

module.exports.UserPurchasedGiftCard = function UserPurchasedGiftCard(
  userID,
  Amount,
  BuyerUserID,
  UserID,
  Quantity,
  Message,
  FromBuyUser
) {
  let checkBalQuery = `select wallet from user_table WHERE id = ${BuyerUserID};`;
  return query(checkBalQuery).then((response) => {
    console.log(response.rows[0].wallet);
    if (response.rows[0].wallet >= Amount * Quantity) {
      function generatecode(length) {
        var result = '';
        var characters =
          'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
          result += characters.charAt(
            Math.floor(Math.random() * charactersLength)
          );
        }
        return result;
      }

      let Query = `insert into 
            GiftCard_Cart_table(Code, Amount, BuyerUserID, UserID, Quantity, Message, FromBuyUser) 
              values('${generatecode(
                10
              )}', ${Amount}, ${BuyerUserID}, ${UserID}, ${Quantity}, '${Message}', '${FromBuyUser}');
      
            UPDATE user_table
            SET    wallet = wallet - (SELECT (Amount * Quantity) "total"
                                      FROM GiftCard_Cart_table
                                      WHERE BuyerUserID = ${BuyerUserID})
            WHERE id = ${BuyerUserID} AND wallet > (SELECT (Amount * Quantity) "total"
                                              FROM GiftCard_Cart_table
                                              WHERE BuyerUserID = ${BuyerUserID});
          `;
      return query(Query)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          throw error;
        });
    } else {
      return false;
    }
  });
};

module.exports.getClaimGift = function getClaimGift() {
  const Query = {
    text: `SELECT * FROM GiftCard_Cart_table
    `,
  };
  return query(Query)
    .then((response) => response)
    .catch((error) => {
      throw error;
    });
};

module.exports.getAllGiftCard = function getAllGiftCard() {
  const Query = {
    text: `select * from giftcard_table
    `,
  };
  return query(Query)
    .then((response) => response)
    .catch((error) => {
      throw error;
    });
};

module.exports.getgiftcard = function getgiftcard() {
  const Query = {
    text: `SELECT * FROM GiftCard_Cart_table
    `,
  };
  return query(Query)
    .then((response) => response)
    .catch((error) => {
      throw error;
    });
};

module.exports.getUsername = function getUsername(userid) {
  const Query = {
    text: `SELECT id, Username FROM User_Table WHERE id != ${userid} 
    `,
  };
  return query(Query)
    .then((response) => response)
    .catch((error) => {
      throw error;
    });
};

module.exports.Referralcode = function Referralcode(Referral_code, userid) {
  const Query = {
    text: `SELECT * FROM Referral_table where Referral_code = '${Referral_code}' AND userid != ${userid};
    `,
  };
  return query(Query)
    .then((response) => {
      // if (response.rowCount > 0) {
      //   const Query = {
      //     text: `
      //     UPDATE Referral_table SET Discount_percentage/100 *   where userid = 1
      //   `,
      //   };
      //   return query(Query)
      //     .then((response) => response)
      //     .catch((error) => {
      //       throw error;
      //     });
      // } else {
      return response;
      // }
    })
    .catch((error) => {
      throw error;
    });
};

module.exports.getReferralcode = function getReferralcode(userid) {
  const Query = {
    text: `SELECT * FROM Referral_table where userid = ${userid};
    `,
  };
  return query(Query)
    .then((response) => {
      if (response.rowCount === 0) {
        function generatecode(length) {
          var result = '';
          var characters =
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
          var charactersLength = characters.length;
          for (var i = 0; i < length; i++) {
            result += characters.charAt(
              Math.floor(Math.random() * charactersLength)
            );
          }
          return result;
        }
        const Query = {
          text: `
        INSERT INTO referral_table(userID, Referral_code, Discount_percentage) 
        VALUES('${userid}', '${generatecode(5)}', 10) RETURNING Referral_code;
        `,
        };
        return query(Query)
          .then((response) => response)
          .catch((error) => {
            throw error;
          });
      } else {
        return response;
      }
    })
    .catch((error) => {
      throw error;
    });
};

module.exports.generateReferralcode = function generateReferralcode(userID) {
  function generatecode(length) {
    var result = '';
    var characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
  const Query = {
    text: `
    INSERT INTO referral_table(userID, Referral_code) VALUES('${userID}', '${generatecode(
      5
    )}')
    `,
  };
  return query(Query)
    .then((response) => response)
    .catch((error) => {
      throw error;
    });
};

module.exports.getAllReferralcode = function getAllReferralcode() {
  const Query = {
    text: `SELECT * FROM Referral_table
    `,
  };
  return query(Query)
    .then((response) => response)
    .catch((error) => {
      throw error;
    });
};

module.exports.getAllGameTags = function getAllGameTags() {
  const Query = {
    text: `SELECT * FROM tags_table`,
  };

  return query(Query)
    .then((response) => response)
    .catch((error) => {
      throw error;
    });
};

module.exports.getGameData = function getGameData(game_name) {
  const Query = {
    text: `SELECT COUNT(l.userID), l.added_on FROM library_table AS l, key_table AS k, games_table AS g WHERE k.key = l.key AND g.game_id = k.game_id AND g.game_name = $1 GROUP BY l.added_on`,
    values: [game_name],
  };

  return query(Query)
    .then((response) => response)
    .catch((error) => {
      throw error;
    });
};
