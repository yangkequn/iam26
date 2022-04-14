package model

import "github.com/zeromicro/go-zero/core/stores/sqlx"

var _ GoalListModel = (*customGoalListModel)(nil)

type (
	// GoalListModel is an interface to be customized, add more methods here,
	// and implement the added methods in customGoalListModel.
	GoalListModel interface {
		goalListModel
	}

	customGoalListModel struct {
		*defaultGoalListModel
	}
)

// NewGoalListModel returns a model for the database table.
func NewGoalListModel(conn sqlx.SqlConn) GoalListModel {
	return &customGoalListModel{
		defaultGoalListModel: newGoalListModel(conn),
	}
}
