package model

import "github.com/zeromicro/go-zero/core/stores/sqlx"

var _ MeasureListModel = (*customMeasureListModel)(nil)

type (
	// MeasureListModel is an interface to be customized, add more methods here,
	// and implement the added methods in customMeasureListModel.
	MeasureListModel interface {
		measureListModel
	}

	customMeasureListModel struct {
		*defaultMeasureListModel
	}
)

// NewMeasureListModel returns a model for the database table.
func NewMeasureListModel(conn sqlx.SqlConn) MeasureListModel {
	return &customMeasureListModel{
		defaultMeasureListModel: newMeasureListModel(conn),
	}
}
