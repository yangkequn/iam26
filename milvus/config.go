package milvus

import "github.com/go-redis/redis/v8"

var milvusAdress string = "milvus.vm:19530"

var RedisClient = redis.NewClient(&redis.Options{
	Addr:     "docker.vm:6379", // use default Addr
	Password: "",               // no password set
	DB:       0,                // use default DB
})
