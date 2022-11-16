// create database
module.exports.CREATE_DATABASE = `
DROP TABLE IF EXISTS User_Table CASCADE;
DROP TABLE IF EXISTS games_table CASCADE;
DROP TABLE IF EXISTS tags_table CASCADE;
DROP TABLE IF EXISTS gametags_table CASCADE;
DROP TABLE IF EXISTS Wishlist_Table CASCADE;
DROP TABLE IF EXISTS cart_table CASCADE;
DROP TABLE IF EXISTS Funds_Table CASCADE;
DROP TABLE IF EXISTS promotion_table CASCADE;
DROP TABLE IF EXISTS discount_table CASCADE;
DROP TABLE IF EXISTS key_table CASCADE;
DROP TABLE IF EXISTS Library_Table CASCADE;
DROP TABLE IF EXISTS Transaction_Table CASCADE;
DROP TABLE IF EXISTS reviews_table CASCADE;
DROP TABLE IF EXISTS otp_table CASCADE;
DROP TABLE IF EXISTS advert_table CASCADE;
DROP TABLE IF EXISTS giftcard_table CASCADE;
DROP TABLE IF EXISTS GiftCard_Cart_table CASCADE;
DROP TABLE IF EXISTS Referral_table CASCADE;

CREATE TABLE User_Table (
    Id SERIAL primary key,
    Username VARCHAR not null,
    Email VARCHAR unique not null,
    Password VARCHAR unique not null,
    Profile_Pic_url VARCHAR null DEFAULT 'Avatar.jpg',
    Created_On DATE not null DEFAULT CURRENT_TIMESTAMP,
    Type VARCHAR not null DEFAULT 'Customer',
    Wallet NUMERIC(7, 2) DEFAULT 0.00
);

CREATE TABLE games_table (
    Game_id SERIAL primary key,
    Game_name VARCHAR unique not null,
    Category VARCHAR,
    Description VARCHAR not null,
    Rating INT,
    Price NUMERIC(7, 2) not null DEFAULT 0.00,
    Status varchar not null DEFAULT 'ENABLED',
    Game_img_url VARCHAR not null DEFAULT 'defaultGame.jpg',
    Game_img_url_1 VARCHAR not null DEFAULT 'defaultGame.jpg',
    Game_img_url_2 VARCHAR not null DEFAULT 'defaultGame.jpg',
    Game_img_url_3 VARCHAR not null DEFAULT 'defaultGame.jpg',
    Created_On DATE not null DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tags_table (
    Tag_name VARCHAR primary key
);

CREATE TABLE gametags_table (
    Gametag_id SERIAL primary key,
    Tag_name VARCHAR,
    Game_name VARCHAR,
    CONSTRAINT Tag_name FOREIGN KEY(Tag_name) REFERENCES tags_table(Tag_name) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT Game_name FOREIGN KEY(Game_name) REFERENCES games_table(Game_name) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Wishlist_Table (
    Id SERIAL primary key,
    userid INT not null,
    game_id INT not null,
    CONSTRAINT fk_user_id FOREIGN KEY(userid) REFERENCES user_table(Id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_game_id FOREIGN KEY(Game_id) REFERENCES games_table(Game_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE cart_table (
    Id SERIAL primary key,
    userid INT not null,
    game_id INT not null,
    quantity INT not null DEFAULT 1,
    CONSTRAINT fk_user_id FOREIGN KEY(userid) REFERENCES user_table(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_game_id FOREIGN KEY(Game_id) REFERENCES games_table(Game_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Funds_Table (
    Id SERIAL primary key,
    userID INT not null,
    Amount_Retrieved FLOAT not null,
    Created_On DATE not null DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE promotion_table (
    Id SERIAL primary key,
    Promotion_info VARCHAR not null,
    Game_id INT not null,
    Discount_percentage FLOAT not null,
    End_date DATE not null,
    CONSTRAINT fk_game_id FOREIGN KEY(Game_id) REFERENCES games_table(Game_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE discount_table (
    Discount_id SERIAL primary key,
    Discount_percentage FLOAT not null,
    Discount_code varchar not null,
    End_date DATE not null
);

CREATE TABLE key_table (
    Key_id SERIAL primary key,
    Game_id INT not null,
    Key varchar not null UNIQUE,
    Key_availability varchar not null DEFAULT 'NOT REDEEMED',
    Created_On DATE not null DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT key_unique UNIQUE (Key),
    CONSTRAINT fk_game_id FOREIGN KEY(Game_id) REFERENCES games_table(Game_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Library_Table (
    Id SERIAL primary key,
    userID INT not null,
    Key VARCHAR unique not null,
    Added_on DATE not null DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_key FOREIGN KEY(Key) REFERENCES key_table(Key) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_user_id FOREIGN KEY(userID) REFERENCES user_table(Id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Transaction_Table (
    Id SERIAL primary key,
    userID INT not null,
    Total_Cost INT not null,
    Created_On DATE not null DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_id FOREIGN KEY(userID) REFERENCES user_table(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE reviews_table(
    Review_id SERIAL primary key,
    User_id INT not null,
    Username VARCHAR not null,
    Profile_Pic_url VARCHAR null DEFAULT 'Avatar.jpg',
    Content VARCHAR not null,
    game_id int not null,
    Created_On DATE not null DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE otp_table(
    Id SERIAL primary key,
    otp SERIAL NOT NULL,
    userID INT NOT NULL,
    CONSTRAINT fk_user_id FOREIGN KEY(userID) REFERENCES user_table(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE advert_table(
    Id SERIAL primary key,
    game_id INT unique not null,
    advert_text VARCHAR not null DEFAULT 'Get this game!',
    CONSTRAINT fk_game_id FOREIGN KEY(game_id) REFERENCES games_table(Game_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE giftcard_table (
    giftcard_id SERIAL primary key,
    giftcard_img_url VARCHAR not null DEFAULT 'gift_card.png',
    Amount INT []
);

-- CREATE TABLE messages_table (
--     Msg_id SERIAL primary key,
--     userID INT not null,
--     Admin_id INT not null,
--     Content VARCHAR not null,
--     Created_On DATE not null DEFAULT CURRENT_TIMESTAMP,
--     CONSTRAINT fk_user_id FOREIGN KEY(userID) REFERENCES user_table(id) ON DELETE CASCADE ON UPDATE CASCADE,
--     CONSTRAINT fk_user_id FOREIGN KEY(Admin_id) REFERENCES user_table(id) ON DELETE CASCADE ON UPDATE CASCADE
-- );

CREATE TABLE Referral_table (
    Referral_id SERIAL primary key,
    userID INT not null,
    Referral_code varchar not null,
    Discount_percentage FLOAT not null,
    CONSTRAINT fk_user_id FOREIGN KEY(userID) REFERENCES user_table(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE GiftCard_Cart_table (
    GiftCard_Cart SERIAL primary key,
    Code VARCHAR not null,
    Amount INT not null,
    BuyerUserID INT not null,
    UserID INT not null, 
    Quantity INT not null,
    FromBuyUser VARCHAR not null,
    Message VARCHAR not null,
    giftcard INT DEFAULT 1,
    CONSTRAINT fk_giftcard FOREIGN KEY(giftcard) REFERENCES giftcard_table(giftcard_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_user_id FOREIGN KEY(UserID) REFERENCES user_table(id) ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO User_Table(Username, Email, Type, Password)
VALUES
    ('User1', 'User1@gmail.com', 'Admin', '123');

INSERT INTO User_Table(Username, Email, Password)
VALUES
    ('User2', 'User2@gmail.com', '1234'),
    ('User3', 'User3@gmail.com', '12345'),
    ('User4', 'User4@gmail.com', '123456'),
    ('User5', 'User5@gmail.com', '1234567'),
    ('User6', 'User6@gmail.com', '12345678');

INSERT INTO games_table(Game_name, Price, description, rating, Game_img_url)
VALUES
    ('Counter Strike: Source', 19.99, 'DOORs STUCK!!! DOORs STUCKKK!!!', 4, 'CounterStrikeSource.jpg'),
    ('Rocket League', 9.99,  'Car and rockets go baam', 5, 'RocketLeague.jpg'),
    ('Fortnite', 29.99, 'COD lobby', 2, 'fortnite.jpg'),
    ('Metal Gear Solid V', 59.99, 'Meme origins', null, 'MetalGearSolidV.jpg'),
    ('Genshin Impact', 19.99, 'A fun game(?)', 4, 'Genshin.jpg'),
    ('Half-Life: Alyx', 9.99,  'Whoaa cool VR game!', 5, 'HalfLifeAlyx.jpg'),
    ('Phasmophobia', 29.99, 'Cool ghost hunting game!!', 2, 'Phasmophobia.jpg'),
    ('Stray', 59.99, 'New V-tuber trend!', null, 'Stray.jpg'),
    ('ELDEN RING', 19.99, 'Love challenges, you maidenless NEET?', 4, 'EldenRing.jpg'),
    ('Sea of Thieves', 9.99,  'Sea of thieves nu-', 5, 'SeaOfThieves.jpg'),
    ('Titanfall 2', 29.99, 'A disaster', 2, 'Titanfall2.jpg'),
    ('Resident Evil 2', 59.99, 'Definitely not resident sleeper', null, 'ResidentEvil2.jpg'),
    ('Left 4 Dead 2', 19.99, 'Bad grammer maybe...', 4, 'Left4Dead2.jpg'),
    ('Monster Hunter Rice', 9.99,  'Do you like cooking monsters?', 5, 'MonsterHunterRise.jpg'),
    ('Terraria', 29.99, 'Unity 2D minecraft much?', 2, 'Terraria.jpg'),
    ('Inside the Backrooms', 59.99, 'Scary game with walls', null, 'Backrooms.jpg'),
    ('Final Fantasy VI', 19.99, 'Italy would love this', 4, 'FinalFantasyVI.jpg'),
    ('Geometry Dash', 9.99,  '2017 vibez', 5, 'GeoDash.jpg'),
    ('PAYDAY 2', 29.99, 'You like money?', 2, 'Payday2.jpg'),
    ('Vampire Survivors', 59.99, 'Fun 2D survival game', null, 'VampireSurvivors.jpg'),
    ('Holocure', 19.99, 'Vampire survivors, but hololive', 4, 'Holocure.jpeg'),
    ('Holo Error', 9.99,  'Hololive horror game, no doubt it will be good', 5, 'HoloError.jpg'),
    ('Valorant', 29.99, 'If you like this u cringe', 2, 'Valorant.jpg'),
    ('Apex Legends', 59.99, 'Best FPS', null, 'ApexLegends.jpg'),
    ('Cyberpunk 2077', 119.99,'In 2077 What makes someone a criminal? Getting C-', 3, 'Cyberpunk2077.jpg');

INSERT INTO tags_table(Tag_name)
VALUES
    ('FPS'),
    ('Indie'),
    ('Battle Royale'),
    ('Story'),
    ('Adventure'),
    ('Gacha'),
    ('2D'),
    ('2D Platformer'),
    ('Sci-fi'),
    ('Anime'),
    ('Exploration'),
    ('Tactical'),
    ('Shooter'),
    ('Team-based'),
    ('Strategy'),
    ('Pixel Graphics'),
    ('Casual'),
    ('Horror');

INSERT INTO gametags_table(Tag_name, Game_name)
VALUES
    ('FPS', 'Counter Strike: Source'),
    ('Shooter', 'Counter Strike: Source'),
    ('Tactical', 'Counter Strike: Source'),
    ('Team-based', 'Counter Strike: Source'),
    ('Strategy', 'Counter Strike: Source'),
    ('Strategy', 'Rocket League'),
    ('Battle Royale', 'Fortnite'),
    ('FPS', 'Fortnite'),
    ('Tactical', 'Fortnite'),
    ('Shooter', 'Fortnite'),
    ('Team-based', 'Fortnite'),
    ('Sci-fi', 'Metal Gear Solid V'),
    ('Story', 'Metal Gear Solid V'),
    ('Exploration', 'Metal Gear Solid V'),
    ('Anime', 'Metal Gear Solid V'),
    ('Story', 'Genshin Impact'),
    ('Adventure', 'Genshin Impact'),
    ('Exploration', 'Genshin Impact'),
    ('Anime', 'Genshin Impact'),
    ('Gacha', 'Genshin Impact'),
    ('Casual', 'Genshin Impact'),
    ('Sci-fi', 'Half-Life: Alyx'),
    ('Exploration', 'Half-Life: Alyx'),
    ('Story', 'Half-Life: Alyx'),
    ('Adventure', 'Half-Life: Alyx'),
    ('Horror', 'Phasmophobia'),
    ('Exploration', 'Phasmophobia'),
    ('Casual', 'Phasmophobia'),
    ('Team-based', 'Phasmophobia'),
    ('Indie', 'Stray'),
    ('Story', 'Stray'),
    ('Adventure', 'Stray'),
    ('Sci-fi', 'Stray'),
    ('Exploration', 'Stray'),
    ('Anime', 'ELDEN RING'),
    ('Exploration', 'ELDEN RING'),
    ('Strategy', 'ELDEN RING'),
    ('Story', 'ELDEN RING'),
    ('Adventure', 'ELDEN RING'),
    ('Adventure', 'Sea of Thieves'),
    ('Exploration', 'Sea of Thieves'),
    ('Casual', 'Sea of Thieves'),
    ('Team-based', 'Sea of Thieves'),
    ('FPS', 'Titanfall 2'),
    ('Shooter', 'Titanfall 2'),
    ('Team-based', 'Titanfall 2'),
    ('Strategy', 'Titanfall 2'),
    ('Sci-fi', 'Titanfall 2'),
    ('Story', 'Resident Evil 2'),
    ('Adventure', 'Resident Evil 2'),
    ('Sci-fi', 'Resident Evil 2'),
    ('Horror', 'Resident Evil 2'),
    ('Exploration', 'Resident Evil 2'),
    ('Shooter', 'Resident Evil 2'),
    ('FPS', 'Left 4 Dead 2'),
    ('Tactical', 'Left 4 Dead 2'),
    ('Shooter', 'Left 4 Dead 2'),
    ('Team-based', 'Left 4 Dead 2'),
    ('Strategy', 'Left 4 Dead 2'),
    ('Indie', 'Monster Hunter Rice'),
    ('Battle Royale', 'Monster Hunter Rice'),
    ('Horror', 'Monster Hunter Rice'),
    ('Pixel Graphics', 'Monster Hunter Rice'),
    ('Team-based', 'Monster Hunter Rice'),
    ('Shooter', 'Monster Hunter Rice'),
    ('2D', 'Terraria'),
    ('2D Platformer', 'Terraria'),
    ('Adventure', 'Terraria'),
    ('Indie', 'Terraria'),
    ('Pixel Graphics', 'Terraria'),
    ('Indie', 'Inside the Backrooms'),
    ('Story', 'Inside the Backrooms'),
    ('Exploration', 'Inside the Backrooms'),
    ('Horror', 'Inside the Backrooms'),
    ('Story', 'Final Fantasy VI'),
    ('Anime', 'Final Fantasy VI'),
    ('Adventure', 'Final Fantasy VI'),
    ('Sci-fi', 'Final Fantasy VI'),
    ('Exploration', 'Final Fantasy VI'),
    ('Casual', 'Final Fantasy VI'),
    ('Indie', 'Geometry Dash'),
    ('2D', 'Geometry Dash'),
    ('Casual', 'Geometry Dash'),
    ('FPS', 'PAYDAY 2'),
    ('Tactical', 'PAYDAY 2'),
    ('Shooter', 'PAYDAY 2'),
    ('Team-based', 'PAYDAY 2'),
    ('Strategy', 'PAYDAY 2'),
    ('Indie', 'Vampire Survivors'),
    ('2D', 'Vampire Survivors'),
    ('Pixel Graphics', 'Vampire Survivors'),
    ('Casual', 'Vampire Survivors'),
    ('Indie', 'Holocure'),
    ('Gacha', 'Holocure'),
    ('Anime', 'Holocure'),
    ('2D', 'Holocure'),
    ('Casual', 'Holocure'),
    ('Story', 'Holo Error'),
    ('Anime', 'Holo Error'),
    ('Exploration', 'Holo Error'),
    ('Horror', 'Holo Error'),
    ('FPS', 'Valorant'),
    ('Tactical', 'Valorant'),
    ('Shooter', 'Valorant'),
    ('Team-based', 'Valorant'),
    ('Strategy', 'Valorant'),
    ('FPS', 'Apex Legends'),
    ('Battle Royale', 'Apex Legends'),
    ('Sci-fi', 'Apex Legends'),
    ('Tactical', 'Apex Legends'),
    ('Team-based', 'Apex Legends'),
    ('Shooter', 'Apex Legends'),
    ('Strategy', 'Apex Legends'),
    ('Story', 'Cyberpunk 2077'),
    ('Adventure', 'Cyberpunk 2077'),
    ('Sci-fi', 'Cyberpunk 2077'),
    ('Exploration', 'Cyberpunk 2077'),
    ('Casual', 'Cyberpunk 2077');

INSERT INTO promotion_table(Promotion_info, Game_id, Discount_percentage, End_date)
VALUES
    ('Get this game for 10% off due to its 1st year anniversary!', 1, 10, '2023-12-20'),
    ('Get this game for 20% off due to its 2nd year anniversary!', 2, 20, '2023-06-12'),
    ('Get this game for 5% off due to its 3rd year anniversary!', 3, 5, '2023-06-20'),
    ('Get this game for 25% off due to its 2nd year anniversary!', 4, 25, '2023-07-12'),
    ('Get this game for 30% off due to its 3rd year anniversary!', 5, 30, '2023-01-10');

INSERT INTO discount_table(Discount_percentage, Discount_code, End_date)
VALUES
    (10, 'JHOnuvuvbHB', '2022-12-20'),
    (5, 'isadf99H5', '2022-12-20'),
    (2.5, 'LOMjasyr', '2022-12-20'),
    (50, '9jkasbdvbTF', '2022-12-20');

INSERT INTO key_table(game_id,key)
VALUES
    (1, 'key1'),
    (1, 'key11'),
    (1, 'key12'),
    (1, 'key13'),
    (1, 'key14'),
    (1, 'key15'),
    (2, 'key2'),
    (3, 'key3'),
    (4, 'key4'),
    (5, 'key5'),
    (1, 'key6'),
    (2, 'key7'),
    (3, 'key8'),
    (4, 'key9'),
    (5, 'key10');
    
INSERT INTO wishlist_table(userid, game_id)
VALUES
    (1, 1),
    (1, 2),
    (1, 5),
    (2, 3),
    (2, 4),
    (3, 4),
    (4, 1),
    (4, 3),
    (5, 1);

INSERT INTO cart_table(userid, game_id, quantity)
VALUES
    (1, 1, 1),
    (1, 2, 1),
    (1, 5, 1),
    (2, 3, 1),
    (2, 4, 1),
    (3, 4, 1),
    (4, 1, 1),
    (4, 3, 1),
    (5, 1, 1);

-- INSERT INTO reviews_table(user_id, Username, profile_pic_url, content, game_id)
-- VALUES
--     (1, "User1", "abc.com/test.jpg", "A very good game", 1),
--     (2, "User2", "abc.com/test.jpg", "A very good game", 1),
--     (3, "User3", "abc.com/test.jpg", "A very good game", 1);

INSERT INTO Library_Table(userID, Key, Added_on)
VALUES
    (1, 'key4', '2022-07-30'),
    (1, 'key5', '2022-07-30'),
    (1, 'key6', '2022-07-30'),
    (1, 'key7', '2022-07-30'),
    (1, 'key8', '2022-07-30'),
    (1, 'key9', '2022-07-30'),
    (1, 'key10', '2022-07-31'),
    (2, 'key11', '2022-07-31'),
    (2, 'key12', '2022-07-31'),
    (2, 'key13', '2022-07-31'),
    (2, 'key14', '2022-07-31');

INSERT INTO giftcard_table(Amount) 
VALUES ('{10, 20, 30, 40, 50}');

INSERT INTO advert_table(game_id, advert_text)
VALUES
    (1, 'Better than Valorant!'),
    (2, 'Cars and Balls!'),
    (4, 'Gears made out of metal!'),
    (6, 'Finally out!');
`;
