package main

import (
	"context"
	"flag"
	"fmt"
	"strconv"

	"iam26/internal/config"
	"iam26/internal/handler"
	"iam26/internal/svc"

	"github.com/go-redis/redis/v8"
	"github.com/yangkequn/Tool"
	"github.com/zeromicro/go-zero/core/conf"
	"github.com/zeromicro/go-zero/rest"
)

var configFile = flag.String("f", "etc/iam26-api.yaml", "the config file")

func UpgradeTable(ctx *svc.ServiceContext) {
	list, err := ctx.MeasureModel.FindAll(context.Background())
	if err == nil {
		for _, v := range list {
			id64, _ := strconv.ParseInt(v.Id, 10, 64)
			v.Id = Tool.Int64ToString(id64)
			_, err = ctx.MeasureModel.Insert(context.Background(), v)
			fmt.Println(v.Id)
		}
	}
}
func ExportAllAccelerometerToRedis(ctx *svc.ServiceContext) {
	RedisClient := redis.NewClient(&redis.Options{
		Addr:     "docker.vm:6379", // use default Addr
		Password: "",               // no password set
		DB:       14,               // use default DB
	})
	keys, err := RedisClient.Keys(context.Background(), "*").Result()
	for _, k := range keys {
		RedisClient.Del(context.Background(), k)
	}
	list, err := ctx.MeasureAccelerometerModel.FindAll(context.Background())
	if err == nil {
		for _, v := range list {
			RedisClient.RPush(context.Background(), "data_raw:"+v.Id, v.Data)
			RedisClient.RPush(context.Background(), "data_raw:"+v.Id, v.Time)

		}
	}
}

func main() {

	var c config.Config
	conf.MustLoad(*configFile, &c)

	ctx := svc.NewServiceContext(c)
	server := rest.MustNewServer(c.RestConf)
	defer server.Stop()
	handler.RegisterHandlers(server, ctx)

	//ExportAllAccelerometerToRedis(ctx)

	fmt.Printf("Starting server at %s:%d...\n", c.Host, c.Port)
	server.Start()
}
