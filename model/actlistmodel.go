package model

import "github.com/zeromicro/go-zero/core/stores/sqlx"

var _ ActListModel = (*customActListModel)(nil)

type (
	// ActListModel is an interface to be customized, add more methods here,
	// and implement the added methods in customActListModel.
	ActListModel interface {
		actListModel
	}

	customActListModel struct {
		*defaultActListModel
	}
)

// NewActListModel returns a model for the database table.
func NewActListModel(conn sqlx.SqlConn) ActListModel {
	return &customActListModel{
		defaultActListModel: newActListModel(conn),
	}
}
