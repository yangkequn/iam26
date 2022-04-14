package model

import "github.com/zeromicro/go-zero/core/stores/sqlx"

var _ GoalModel = (*customGoalModel)(nil)

type (
	// GoalModel is an interface to be customized, add more methods here,
	// and implement the added methods in customGoalModel.
	GoalModel interface {
		goalModel
	}

	customGoalModel struct {
		*defaultGoalModel
	}
)

// NewGoalModel returns a model for the database table.
func NewGoalModel(conn sqlx.SqlConn) GoalModel {
	return &customGoalModel{
		defaultGoalModel: newGoalModel(conn),
	}
}
