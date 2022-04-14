package main

import (
	"flag"
	"fmt"

	"iam26/internal/config"
	"iam26/internal/handler"
	"iam26/internal/svc"

	"github.com/zeromicro/go-zero/core/conf"
	"github.com/zeromicro/go-zero/rest"
)

var configFile = flag.String("f", "etc/iam26-api.yaml", "the config file")

func main() {

	var c config.Config
	conf.MustLoad(*configFile, &c)

	ctx := svc.NewServiceContext(c)
	server := rest.MustNewServer(c.RestConf)
	defer server.Stop()

	// list, err := ctx.TraceItemModel.FindAll(context.Background())
	// if err == nil {
	// 	for _, v := range list {
	// 		id64, _ := strconv.ParseInt(v.Id, 10, 64)
	// 		v.Id = GoTools.Int64ToString(id64)
	// 		id64, _ = strconv.ParseInt(v.MeasureId, 10, 64)
	// 		v.MeasureId = GoTools.Int64ToString(id64)
	// 		_, err = ctx.TraceItemModel.Insert(context.Background(), v)
	// 		fmt.Println(v.Id)
	// 	}
	// }
	handler.RegisterHandlers(server, ctx)

	fmt.Printf("Starting server at %s:%d...\n", c.Host, c.Port)
	server.Start()
}
