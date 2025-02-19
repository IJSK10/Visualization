export const columnTypeMap: { [key: string]: boolean } = {

    'Publisher' : true,
    'Developer' : true,
    'Metascore' : false,
    'Meta Status' : true,
    '# of Critic Reviews' : false,
    'Userscore' : false,
    'Userscore Status' : true,
    'Genre' : true,
    'Rating' : true,
    'Year' : false,
    'Number of Platforms' : true,
    'Rank' : false,
    'Positive %' : false,
    'Mixed %' : false,
    'Negative %' : false,
    'Month' : true,
    'NA_Sales' : false,
    'Global_Sales' : false,
    'User_Count' : false
};

export const columnxAxis: { [key: string]: string } = {
    'Publisher' : "Top 20 Game Publishers",
    'Developer' : "Top 20 Game developers",
    'Metascore' : "Metascore of games",
    'Meta Status' : "Review given by metacritic",
    '# of Critic Reviews' : "No of Critic Reviews",
    'Userscore' : "Rating of game players",
    'Userscore Status' : "Review given by players",
    'User Positive' : "No of Positive reviews",
    'User Mixed' : "No of Mixed reviews",
    'User Negative' : "No of Negative reviews",
    'Genres' : "Game genres",
    'Rating' : "Game Rating",
    'Year' : "Year released",
    'Number of Platforms' : "No of platforms game released",
    'Rank' : "Ranking of the game in the year released",
    'Positive %' : "Percentage of Positive reviews",
    'Mixed %' : "Percentage of Mixed reviews",
    'Negative %' : "Percentage of Negative reviews",
    'Month' : "Month Released",
    'NA_Sales' : "Sales in America in millions",
    'Global_Sales' : "Sales in All over the world in millions",
    'User_Count' : "Number of players"
};