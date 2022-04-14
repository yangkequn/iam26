package model

import "github.com/zeromicro/go-zero/core/stores/sqlx"

var _ MeasureIndexHistoryModel = (*customMeasureIndexHistoryModel)(nil)

type (
	// MeasureIndexHistoryModel is an interface to be customized, add more methods here,
	// and implement the added methods in customMeasureIndexHistoryModel.
	MeasureIndexHistoryModel interface {
		measureIndexHistoryModel
	}

	customMeasureIndexHistoryModel struct {
		*defaultMeasureIndexHistoryModel
	}
)

// NewMeasureIndexHistoryModel returns a model for the database table.
func NewMeasureIndexHistoryModel(conn sqlx.SqlConn) MeasureIndexHistoryModel {
	return &customMeasureIndexHistoryModel{
		defaultMeasureIndexHistoryModel: newMeasureIndexHistoryModel(conn),
	}
}
