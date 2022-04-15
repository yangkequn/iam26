package model

import (
	"context"
	"fmt"

	"github.com/zeromicro/go-zero/core/stores/sqlc"
	"github.com/zeromicro/go-zero/core/stores/sqlx"
)

var _ TraceItemModel = (*customTraceItemModel)(nil)

type (
	// TraceItemModel is an interface to be customized, add more methods here,
	// and implement the added methods in customTraceItemModel.
	TraceItemModel interface {
		traceItemModel
	}

	customTraceItemModel struct {
		*defaultTraceItemModel
	}
)

// NewTraceItemModel returns a model for the database table.
func NewTraceItemModel(conn sqlx.SqlConn) TraceItemModel {
	return &customTraceItemModel{
		defaultTraceItemModel: newTraceItemModel(conn),
	}
}

func (m *defaultTraceItemModel) FindAll(ctx context.Context) ([]*TraceItem, error) {
	query := fmt.Sprintf("select %s from %s ", traceItemRows, m.table)
	var resp []*TraceItem
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
