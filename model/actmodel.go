package model

import "github.com/zeromicro/go-zero/core/stores/sqlx"

var _ ActModel = (*customActModel)(nil)

type (
	// ActModel is an interface to be customized, add more methods here,
	// and implement the added methods in customActModel.
	ActModel interface {
		actModel
	}

	customActModel struct {
		*defaultActModel
	}
)

// NewActModel returns a model for the database table.
func NewActModel(conn sqlx.SqlConn) ActModel {
	return &customActModel{
		defaultActModel: newActModel(conn),
	}
}
