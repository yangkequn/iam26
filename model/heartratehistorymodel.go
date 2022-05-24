package model

import "github.com/zeromicro/go-zero/core/stores/sqlx"

var _ HeartRateHistoryModel = (*customHeartRateHistoryModel)(nil)

type (
	// HeartRateHistoryModel is an interface to be customized, add more methods here,
	// and implement the added methods in customHeartRateHistoryModel.
	HeartRateHistoryModel interface {
		heartRateHistoryModel
	}

	customHeartRateHistoryModel struct {
		*defaultHeartRateHistoryModel
	}
)

// NewHeartRateHistoryModel returns a model for the database table.
func NewHeartRateHistoryModel(conn sqlx.SqlConn) HeartRateHistoryModel {
	return &customHeartRateHistoryModel{
		defaultHeartRateHistoryModel: newHeartRateHistoryModel(conn),
	}
}
