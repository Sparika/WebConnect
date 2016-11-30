var config = {}

config.node = {}
config.node.host = "localhost"
config.node.port = process.env.NODE_PORT || 8080
config.redis = {}
config.redis.host = process.env.REDIS_PORT_6379_TCP_ADDR || "localhost"
config.redis.port = process.env.REDIS_PORT_6379_TCP_PORT || 6379


module.exports = config
