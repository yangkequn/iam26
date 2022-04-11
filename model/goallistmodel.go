package model

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"

	_ "github.com/lib/pq"
	"github.com/zeromicro/go-zero/core/stores/builder"
	"github.com/zeromicro/go-zero/core/stores/sqlc"
	"github.com/zeromicro/go-zero/core/stores/sqlx"
	"github.com/zeromicro/go-zero/core/stringx"
)

var (
	goalListFieldNames          = builder.RawFieldNames(&GoalList{}, true)
	goalListRows                = strings.Join(goalListFieldNames, ",")
	goalListRowsExpectAutoSet   = strings.Join(stringx.Remove(goalListFieldNames, "create_time", "update_time"), ",")
	goalListRowsWithPlaceHolder = builder.PostgreSqlJoin(stringx.Remove(goalListFieldNames, "id", "create_time", "update_time"))
)

type (
	GoalListModel interface {
		Insert(ctx context.Context, data *GoalList) (sql.Result, error)
		FindOne(ctx context.Context, id int64) (*GoalList, error)
		Update(ctx context.Context, data *GoalList) error
		Delete(ctx context.Context, id int64) error
	}

	defaultGoalListModel struct {
		conn  sqlx.SqlConn
		table string
	}

	GoalList struct {
		Id         int64     `db:"id"`   // user id
		List       string    `db:"list"` // goal ids
		CreateTime time.Time `db:"create_time"`
		UpdateTime time.Time `db:"update_time"`
	}
)

func NewGoalListModel(conn sqlx.SqlConn) GoalListModel {
	return &defaultGoalListModel{
		conn:  conn,
		table: `"public"."goal_list"`,
	}
}

func (m *defaultGoalListModel) Insert(ctx context.Context, data *GoalList) (sql.Result, error) {
	query := fmt.Sprintf("insert into %s (%s) values ($1, $2)", m.table, goalListRowsExpectAutoSet)
	ret, err := m.conn.ExecCtx(ctx, query, data.Id, data.List)
	return ret, err
}

func (m *defaultGoalListModel) FindOne(ctx context.Context, id int64) (*GoalList, error) {
	query := fmt.Sprintf("select %s from %s where id = $1 limit 1", goalListRows, m.table)
	var resp GoalList
	err := m.conn.QueryRowCtx(ctx, &resp, query, id)
	switch err {
	case nil:
		return &resp, nil
	case sqlc.ErrNotFound:
		return nil, ErrNotFound
	default:
		return nil, err
	}
}

func (m *defaultGoalListModel) Update(ctx context.Context, data *GoalList) error {
	query := fmt.Sprintf("update %s set %s where id = $1", m.table, goalListRowsWithPlaceHolder)
	_, err := m.conn.ExecCtx(ctx, query, data.Id, data.List)
	return err
}

func (m *defaultGoalListModel) Delete(ctx context.Context, id int64) error {
	query := fmt.Sprintf("delete from %s where id = $1", m.table)
	_, err := m.conn.ExecCtx(ctx, query, id)
	return err
}
