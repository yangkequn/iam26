package model

import "github.com/zeromicro/go-zero/core/stores/sqlx"

var _ HeartbeatAudioHeartbeatModel = (*customHeartbeatAudioHeartbeatModel)(nil)

type (
	// HeartbeatAudioHeartbeatModel is an interface to be customized, add more methods here,
	// and implement the added methods in customHeartbeatAudioHeartbeatModel.
	HeartbeatAudioHeartbeatModel interface {
		heartbeatAudioHeartbeatModel
	}

	customHeartbeatAudioHeartbeatModel struct {
		*defaultHeartbeatAudioHeartbeatModel
	}
)

// NewHeartbeatAudioHeartbeatModel returns a model for the database table.
func NewHeartbeatAudioHeartbeatModel(conn sqlx.SqlConn) HeartbeatAudioHeartbeatModel {
	return &customHeartbeatAudioHeartbeatModel{
		defaultHeartbeatAudioHeartbeatModel: newHeartbeatAudioHeartbeatModel(conn),
	}
}
