package svc

import (
	"iam26/internal/config"

	md "iam26/model"

	"github.com/go-redis/redis/v8"
	"github.com/zeromicro/go-zero/core/stores/sqlx"
)

type ServiceContext struct {
	Config            config.Config
	ActModel          md.ActModel
	ActListModel      md.ActListModel
	MeasureModel      md.MeasureModel
	MeasureListModel  md.MeasureListModel
	MeasureIndexModel md.MeasureIndexModel

	HeartbeatAudioUserModel      md.HeartbeatAudioUserModel
	HeartbeatAudioOggModel       md.HeartbeatAudioOggModel
	HeartbeatAudioHeartbeatModel md.HeartbeatAudioHeartbeatModel

	AccelerometerTrainingModel md.AccelerometerTrainingModel
	MeasureAccelerometerModel  md.MeasureAccelerometerModel
	HeartRateHistory           md.HeartRateHistoryModel
	GoalModel                  md.GoalModel
	GoalListModel              md.GoalListModel
	TraceListModel             md.TraceListModel
	TraceItemModel             md.TraceItemModel
	RedisClient                *redis.Client
	UserModel                  md.UserModel
}

func NewServiceContext(c config.Config) *ServiceContext {
	redisOptions := &redis.Options{
		Addr:     c.Redis.Addr,     // use default Addr
		Password: c.Redis.Password, // no password set
		DB:       c.Redis.DB,       // use default DB
	}
	connPostGres := sqlx.NewSqlConn("postgres", c.DBPostgresql.Connection)
	return &ServiceContext{
		Config:                       c,
		RedisClient:                  redis.NewClient(redisOptions),
		ActModel:                     md.NewActModel(connPostGres),
		ActListModel:                 md.NewActListModel(connPostGres),
		MeasureModel:                 md.NewMeasureModel(connPostGres),
		MeasureListModel:             md.NewMeasureListModel(connPostGres),
		MeasureIndexModel:            md.NewMeasureIndexModel(connPostGres),
		MeasureAccelerometerModel:    md.NewMeasureAccelerometerModel(connPostGres),
		HeartbeatAudioUserModel:      md.NewHeartbeatAudioUserModel(connPostGres),
		HeartbeatAudioOggModel:       md.NewHeartbeatAudioOggModel(connPostGres),
		HeartbeatAudioHeartbeatModel: md.NewHeartbeatAudioHeartbeatModel(connPostGres),
		AccelerometerTrainingModel:   md.NewAccelerometerTrainingModel(connPostGres),
		TraceListModel:               md.NewTraceListModel(connPostGres),
		TraceItemModel:               md.NewTraceItemModel(connPostGres),
		GoalModel:                    md.NewGoalModel(connPostGres),
		GoalListModel:                md.NewGoalListModel(connPostGres),
		UserModel:                    md.NewUserModel(connPostGres),
		HeartRateHistory:             md.NewHeartRateHistoryModel(connPostGres),
	}
}
