package svc

import (
	"iam26/internal/config"

	md "iam26/model"

	"github.com/go-redis/redis/v8"
	"github.com/zeromicro/go-zero/core/stores/sqlx"
)

type ServiceContext struct {
	Config           config.Config
	UserModel        md.UserModel
	ActModel         md.ActModel
	ActListModel     md.ActListModel
	MeasureModel     md.MeasureModel
	MeasureListModel md.MeasureListModel
	GoalModel        md.GoalModel
	GoalListModel    md.GoalListModel
	TraceListModel   md.TraceListModel
	TraceItemModel   md.TraceItemModel
	RedisClient      *redis.Client
}

func NewServiceContext(c config.Config) *ServiceContext {
	redisOptions := &redis.Options{
		Addr:     c.Redis.Addr,     // use default Addr
		Password: c.Redis.Password, // no password set
		DB:       c.Redis.DB,       // use default DB
	}
	connPostGres := sqlx.NewSqlConn("postgres", c.DBPostgresql.Connection)
	return &ServiceContext{
		Config:           c,
		RedisClient:      redis.NewClient(redisOptions),
		UserModel:        md.NewUserModel(connPostGres),
		ActModel:         md.NewActModel(connPostGres),
		ActListModel:     md.NewActListModel(connPostGres),
		MeasureModel:     md.NewMeasureModel(connPostGres),
		MeasureListModel: md.NewMeasureListModel(connPostGres),
		TraceListModel:   md.NewTraceListModel(connPostGres),
		TraceItemModel:   md.NewTraceItemModel(connPostGres),
		GoalModel:        md.NewGoalModel(connPostGres),
		GoalListModel:    md.NewGoalListModel(connPostGres),
	}
}
