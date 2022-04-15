package model

import (
	"context"
	"fmt"

	"github.com/zeromicro/go-zero/core/stores/sqlc"
	"github.com/zeromicro/go-zero/core/stores/sqlx"
)

var _ MeasureModel = (*customMeasureModel)(nil)

type (
	// MeasureModel is an interface to be customized, add more methods here,
	// and implement the added methods in customMeasureModel.
	MeasureModel interface {
		measureModel
	}

	customMeasureModel struct {
		*defaultMeasureModel
	}
)

// NewMeasureModel returns a model for the database table.
func NewMeasureModel(conn sqlx.SqlConn) MeasureModel {
	return &customMeasureModel{
		defaultMeasureModel: newMeasureModel(conn),
	}
}

func (m *defaultMeasureModel) FindAll(ctx context.Context) ([]*Measure, error) {
	query := fmt.Sprintf("select %s from %s ", measureRows, m.table)
	var resp []*Measure
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
