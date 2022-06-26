package model

import "github.com/zeromicro/go-zero/core/stores/sqlx"

var _ HeartbeatAudioUserModel = (*customHeartbeatAudioUserModel)(nil)

type (
	// HeartbeatAudioUserModel is an interface to be customized, add more methods here,
	// and implement the added methods in customHeartbeatAudioUserModel.
	HeartbeatAudioUserModel interface {
		heartbeatAudioUserModel
	}

	customHeartbeatAudioUserModel struct {
		*defaultHeartbeatAudioUserModel
	}
)

// NewHeartbeatAudioUserModel returns a model for the database table.
func NewHeartbeatAudioUserModel(conn sqlx.SqlConn) HeartbeatAudioUserModel {
	return &customHeartbeatAudioUserModel{
		defaultHeartbeatAudioUserModel: newHeartbeatAudioUserModel(conn),
	}
}
