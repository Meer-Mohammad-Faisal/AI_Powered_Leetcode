const { createClient } = require('redis');

const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASS,
    socket: {
        host: 'redis-18704.c212.ap-south-1-1.ec2.redns.redis-cloud.com',
        port: 18704
    }
});

module.exports = redisClient;