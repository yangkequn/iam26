package model

import "github.com/zeromicro/go-zero/core/stores/sqlx"

var _ HeartbeatAudioOggModel = (*customHeartbeatAudioOggModel)(nil)

type (
	// HeartbeatAudioOggModel is an interface to be customized, add more methods here,
	// and implement the added methods in customHeartbeatAudioOggModel.
	HeartbeatAudioOggModel interface {
		heartbeatAudioOggModel
	}

	customHeartbeatAudioOggModel struct {
		*defaultHeartbeatAudioOggModel
	}
)

// NewHeartbeatAudioOggModel returns a model for the database table.
func NewHeartbeatAudioOggModel(conn sqlx.SqlConn) HeartbeatAudioOggModel {
	return &customHeartbeatAudioOggModel{
		defaultHeartbeatAudioOggModel: newHeartbeatAudioOggModel(conn),
	}
}
