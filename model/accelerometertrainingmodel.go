package model

import "github.com/zeromicro/go-zero/core/stores/sqlx"

var _ AccelerometerTrainingModel = (*customAccelerometerTrainingModel)(nil)

type (
	// AccelerometerTrainingModel is an interface to be customized, add more methods here,
	// and implement the added methods in customAccelerometerTrainingModel.
	AccelerometerTrainingModel interface {
		accelerometerTrainingModel
	}

	customAccelerometerTrainingModel struct {
		*defaultAccelerometerTrainingModel
	}
)

// NewAccelerometerTrainingModel returns a model for the database table.
func NewAccelerometerTrainingModel(conn sqlx.SqlConn) AccelerometerTrainingModel {
	return &customAccelerometerTrainingModel{
		defaultAccelerometerTrainingModel: newAccelerometerTrainingModel(conn),
	}
}
