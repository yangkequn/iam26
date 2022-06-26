package logic

import (
	"context"

	"iam26/internal/svc"
	"iam26/internal/types"
	"iam26/model"

	"github.com/yangkequn/Tool"
	"github.com/zeromicro/go-zero/core/logx"
)

type HeartbeatAudioPutLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewHeartbeatAudioPutLogic(ctx context.Context, svcCtx *svc.ServiceContext) *HeartbeatAudioPutLogic {
	return &HeartbeatAudioPutLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *HeartbeatAudioPutLogic) HeartbeatAudioPut(req *types.HeartbeatAudio) (err error) {
	var (
		uid                string
		heartbeatAudioUser *model.HeartbeatAudioUser
		id                 string = Tool.RandomBase64ID()
	)
	// get user id from context
	if uid, err = Tool.UserIdFromContext(l.ctx); err != nil {
		return err
	}
	// get user model from db
	if heartbeatAudioUser, err = l.svcCtx.HeartbeatAudioUserModel.FindOne(l.ctx, uid); err != nil {
		//if record not exist, create a new one
		if NoRowsInResultSet(err) {
			//create new
			heartbeatAudioUser = &model.HeartbeatAudioUser{
				Id:   uid,
				List: "",
			}
			_, err = l.svcCtx.HeartbeatAudioUserModel.Insert(l.ctx, heartbeatAudioUser)
		}
		if err != nil {
			return err
		}
	}

	//create model to hold ogg audio, and insert into db
	heartbeatAudio := &model.HeartbeatAudioOgg{
		Id:   id,
		Data: req.Audio,
	}
	_, err = l.svcCtx.HeartbeatAudioOggModel.Insert(l.ctx, heartbeatAudio)
	if err != nil {
		return err
	}

	//create model to hold heartbeat string, and insert into db
	heartbeat := &model.HeartbeatAudioHeartbeat{
		Id:   id,
		Data: req.Heartbeat,
	}
	_, err = l.svcCtx.HeartbeatAudioHeartbeatModel.Insert(l.ctx, heartbeat)
	if err != nil {
		return err
	}
	//add heartbeatAudio and  heartbeat to user model's list
	heartbeatAudioUser.List += id + ","
	err = l.svcCtx.HeartbeatAudioUserModel.Update(l.ctx, heartbeatAudioUser)
	return err
}
