package model

import "github.com/zeromicro/go-zero/core/stores/sqlx"

var _ TraceListModel = (*customTraceListModel)(nil)

type (
	// TraceListModel is an interface to be customized, add more methods here,
	// and implement the added methods in customTraceListModel.
	TraceListModel interface {
		traceListModel
	}

	customTraceListModel struct {
		*defaultTraceListModel
	}
)

// NewTraceListModel returns a model for the database table.
func NewTraceListModel(conn sqlx.SqlConn) TraceListModel {
	return &customTraceListModel{
		defaultTraceListModel: newTraceListModel(conn),
	}
}
