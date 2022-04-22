package model

import "github.com/zeromicro/go-zero/core/stores/sqlx"

var _ MeasureAccelerometerModel = (*customMeasureAccelerometerModel)(nil)

type (
	// MeasureAccelerometerModel is an interface to be customized, add more methods here,
	// and implement the added methods in customMeasureAccelerometerModel.
	MeasureAccelerometerModel interface {
		measureAccelerometerModel
	}

	customMeasureAccelerometerModel struct {
		*defaultMeasureAccelerometerModel
	}
)

// NewMeasureAccelerometerModel returns a model for the database table.
func NewMeasureAccelerometerModel(conn sqlx.SqlConn) MeasureAccelerometerModel {
	return &customMeasureAccelerometerModel{
		defaultMeasureAccelerometerModel: newMeasureAccelerometerModel(conn),
	}
}
