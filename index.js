const express = require("express");
const app = express();

const helmet = require("helmet");

const RLimit = require("express-rate-limit");

const rate_limiter = RLimit({
  windowMs: 30 * 3600 * 1000, //  30 минут
  max: 10, // максимально количество запросов
});

const LoremIpsum = require("lorem-ipsum").LoremIpsum;

const lorem = new LoremIpsum({
  sentencesPerParagraph: {
    max: 16,
    min: 4,
  },
  wordsPerSentence: {
    max: 16,
    min: 4,
  },
});

app.use(rate_limiter);
app.use(helmet());
app.use(express.json());

app.post("/api/news", async (request, response) => {
  let news = {};
  if (!isNaN(+request.query["howmany"])) {
    const max_news = +request.query["howmany"] % 16;
    news = news_gen(max_news);
  } else {
    news = news_gen();
  }

  response.json(news);
  delete news;
});

app.post("/api/users", async (request, response) => {
  let users = {};
  if (!isNaN(+request.query["howmany"])) {
    const max_users = +request.query["howmany"] % 16;
    users = user_gen(max_users);
  } else {
    users = user_gen();
  }
  response.json(users);
  delete users;
});

function randint(a, b) {
  return Math.round(Math.random() * (b - a) + a);
}

function getCurrentDate() {
  const time = new Date();
  return `${time.getFullYear()}.${time.getMonth()}.${time.getDate()} ${time.getHours()}:${
    time.getMinutes() < 10 ? "0" + time.getMinutes() : time.getMinutes()
  }`;
}

function getRandomBytes(n) {
  let string = "";
  for (let i = 0; i < n; i++) {
    string += String.fromCharCode(randint(33, 126));
  }
  return string;
}

function news_gen(how_many = 1) {
  let news = {};
  for (let i = 0; i < how_many; i++) {
    news[i] = {
      title: lorem.generateWords(randint(2, 12)),
      date: getCurrentDate(),
      content: lorem.generateSentences(randint(1, 5)),
    };
  }
  return news;
}

function user_gen(how_many = 1) {
  let users = {};
  for (let i = 0; i < how_many; i++) {
    users[i] = {
      custom_id: getRandomBytes(32),
      username: lorem.generateWords(1),
      rating: randint(0, 100),
      description: lorem.generateSentences(2),
    };
  }
  return users;
}
app.listen(3000);
