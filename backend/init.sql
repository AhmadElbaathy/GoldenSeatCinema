CREATE TABLE IF NOT EXISTS movies (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    image VARCHAR(255),
    genre VARCHAR(100),
    rating NUMERIC(2, 1),
    duration VARCHAR(50),
    description TEXT
);

CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    user_name VARCHAR(100),
    movie_title VARCHAR(255),
    seat_number VARCHAR(10),
    show_time VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed some initial data
INSERT INTO movies (title, image, genre, rating, duration, description) VALUES
('Inception', '/inception.jpeg', 'Sci-Fi / Thriller', 4.8, '2h 15m', 'A thief who steals corporate secrets through the use of dream-sharing technology.'),
('The Dark Knight Rises', '/The_Dark_Knight.jpg', 'Action / Drama', 4.9, '2h 45m', 'Eight years after the Jokers reign of anarchy, Batman returns.'),
('Interstellar', '/intersteller.jpeg', 'Adventure / Sci-Fi', 4.7, '2h 49m', 'A team of explorers travel through a wormhole in space.'),
('Cyberpunk: Edgerunners', '/cyberpunkEdgerunners.jpeg', 'Anime / Action', 4.6, '1h 55m', 'A street kid strives to become a mercenary outlaw.');