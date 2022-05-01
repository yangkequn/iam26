package model

import (
	"context"
	"fmt"

	"github.com/zeromicro/go-zero/core/stores/sqlc"
	"github.com/zeromicro/go-zero/core/stores/sqlx"
)

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

func (m *defaultMeasureAccelerometerModel) FindAll(ctx context.Context) ([]*MeasureAccelerometer, error) {
	query := fmt.Sprintf("select %s from %s ", measureAccelerometerRows, m.table)
	var resp []*MeasureAccelerometer
	err := m.conn.QueryRowsCtx(ctx, &resp, query)
	switch err {
	case nil:
		return resp, nil
	case sqlc.ErrNotFound:
		return nil, ErrNotFound
	default:
		return nil, err
	}
}
