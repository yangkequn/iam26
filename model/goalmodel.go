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
	goalFieldNames          = builder.RawFieldNames(&Goal{}, true)
	goalRows                = strings.Join(goalFieldNames, ",")
	goalRowsExpectAutoSet   = strings.Join(stringx.Remove(goalFieldNames, "create_time", "update_time"), ",")
	goalRowsWithPlaceHolder = builder.PostgreSqlJoin(stringx.Remove(goalFieldNames, "id", "create_time", "update_time"))
)

type (
	GoalModel interface {
		Insert(ctx context.Context, data *Goal) (sql.Result, error)
		FindOne(ctx context.Context, id int64) (*Goal, error)
		Update(ctx context.Context, data *Goal) error
		Delete(ctx context.Context, id int64) error
	}

	defaultGoalModel struct {
		conn  sqlx.SqlConn
		table string
	}

	Goal struct {
		Id         int64     `db:"id"`
		Name       string    `db:"name"`
		Detail     string    `db:"detail"`
		Popularity int64     `db:"popularity"` // reference number
		CreateTime time.Time `db:"create_time"`
		UpdateTime time.Time `db:"update_time"`
		Author     int64     `db:"author"`
		Risk       string    `db:"risk"`
		Benifites  string    `db:"benifites"`
	}
)

func NewGoalModel(conn sqlx.SqlConn) GoalModel {
	return &defaultGoalModel{
		conn:  conn,
		table: `"public"."goal_item"`,
	}
}

func (m *defaultGoalModel) Insert(ctx context.Context, data *Goal) (sql.Result, error) {
	query := fmt.Sprintf("insert into %s (%s) values ($1, $2, $3, $4, $5, $6, $7)", m.table, goalRowsExpectAutoSet)
	ret, err := m.conn.ExecCtx(ctx, query, data.Id, data.Name, data.Detail, data.Popularity, data.Author, data.Risk, data.Benifites)
	return ret, err
}

func (m *defaultGoalModel) FindOne(ctx context.Context, id int64) (*Goal, error) {
	query := fmt.Sprintf("select %s from %s where id = $1 limit 1", goalRows, m.table)
	var resp Goal
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

func (m *defaultGoalModel) Update(ctx context.Context, data *Goal) error {
	query := fmt.Sprintf("update %s set %s where id = $1", m.table, goalRowsWithPlaceHolder)
	_, err := m.conn.ExecCtx(ctx, query, data.Id, data.Name, data.Detail, data.Popularity, data.Author, data.Risk, data.Benifites)
	return err
}

func (m *defaultGoalModel) Delete(ctx context.Context, id int64) error {
	query := fmt.Sprintf("delete from %s where id = $1", m.table)
	_, err := m.conn.ExecCtx(ctx, query, id)
	return err
}
