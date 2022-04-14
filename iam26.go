package main

import (
	"flag"
	"fmt"

	"iam26/internal/config"
	"iam26/internal/handler"
	"iam26/internal/svc"

	"github.com/yangkequn/GoTools"
	"github.com/zeromicro/go-zero/core/conf"
	"github.com/zeromicro/go-zero/rest"
)

var configFile = flag.String("f", "etc/iam26-api.yaml", "the config file")

func main() {

	fmt.Print(GoTools.Int64ToString(379280355662387671))
	flag.Parse()

	var c config.Config
	conf.MustLoad(*configFile, &c)

	ctx := svc.NewServiceContext(c)
	server := rest.MustNewServer(c.RestConf)
	defer server.Stop()

	handler.RegisterHandlers(server, ctx)

	fmt.Printf("Starting server at %s:%d...\n", c.Host, c.Port)
	server.Start()
}
