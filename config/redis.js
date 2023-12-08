const { createClient } = require("redis");
const RedisStore = require("connect-redis").default;

const finalRedis = () => {
  // redis@v4
  const redisClient = createClient();
  // {
  //     legacyMode: true,
  //     host: "localhost",
  //     port: 6379,
  //   }
  redisClient
    .connect(console.log("connected to redis server"))
    .catch(console.error);

  // Initialize store.
  const redisStore = new RedisStore({
    client: redisClient,
    prefix: "simple_blog:",
  });

  return redisStore;
};

module.exports.finalRedis = finalRedis;
