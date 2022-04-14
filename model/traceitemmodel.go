package model

import "github.com/zeromicro/go-zero/core/stores/sqlx"

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
