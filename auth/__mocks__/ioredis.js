const RedisMock = require('ioredis-mock')
const Redis = RedisMock.default || RedisMock

module.exports.Redis = Redis    // supports: const { Redis } = require("ioredis")