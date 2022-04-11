package logic

import (
	"context"
	"iam26/internal/svc"
	"iam26/model"
)

func InitializeAfterSignUp(ctx context.Context, svcCtx *svc.ServiceContext, user *model.User) error {

	// if no Trace record, create new one,and insert into db
	if _, err := svcCtx.TraceListModel.FindOne(ctx, user.Id); err != nil {
		traceList := &model.TraceList{
			Id: user.Id,
		}
		svcCtx.TraceListModel.Insert(ctx, traceList)
	}
	return nil
}

// remove user accout from db, and delete trace record from db
func DeleteUser(ctx context.Context, svcCtx *svc.ServiceContext, user *model.User) error {
	// delete user record
	err := svcCtx.UserModel.Delete(ctx, user.Id)
	if err != nil {
		return err
	}
	// delete trace record
	err = svcCtx.TraceListModel.Delete(ctx, user.Id)
	if err != nil {
		return err
	}
	return nil
}
