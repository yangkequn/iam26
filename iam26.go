package main

import (
	"context"
	"flag"
	"fmt"
	"strconv"

	"iam26/internal/config"
	"iam26/internal/handler"
	"iam26/internal/svc"

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

func main() {

	var c config.Config
	conf.MustLoad(*configFile, &c)

	ctx := svc.NewServiceContext(c)
	server := rest.MustNewServer(c.RestConf)
	defer server.Stop()

	handler.RegisterHandlers(server, ctx)

	fmt.Printf("Starting server at %s:%d...\n", c.Host, c.Port)
	server.Start()
}
