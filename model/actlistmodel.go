package model

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/zeromicro/go-zero/core/stores/builder"
	"github.com/zeromicro/go-zero/core/stores/sqlc"
	"github.com/zeromicro/go-zero/core/stores/sqlx"
	"github.com/zeromicro/go-zero/core/stringx"
)

var (
	actListFieldNames          = builder.RawFieldNames(&ActList{}, true)
	actListRows                = strings.Join(actListFieldNames, ",")
	actListRowsExpectAutoSet   = strings.Join(stringx.Remove(actListFieldNames, "create_time", "update_time"), ",")
	actListRowsWithPlaceHolder = builder.PostgreSqlJoin(stringx.Remove(actListFieldNames, "id", "create_time", "update_time"))
)

type (
	ActListModel interface {
		Insert(ctx context.Context, data *ActList) (sql.Result, error)
		FindOne(ctx context.Context, id int64) (*ActList, error)
		Update(ctx context.Context, data *ActList) error
		Delete(ctx context.Context, id int64) error
	}

	defaultActListModel struct {
		conn  sqlx.SqlConn
		table string
	}

	ActList struct {
		Id         int64     `db:"id"`
		List       string    `db:"list"`
		CreateTime time.Time `db:"create_time"`
		UpdateTime time.Time `db:"update_time"`
	}
)

func NewActListModel(conn sqlx.SqlConn) ActListModel {
	return &defaultActListModel{
		conn:  conn,
		table: `"public"."act_list"`,
	}
}

func (m *defaultActListModel) Insert(ctx context.Context, data *ActList) (sql.Result, error) {
	query := fmt.Sprintf("insert into %s (%s) values ($1, $2)", m.table, actListRowsExpectAutoSet)
	ret, err := m.conn.ExecCtx(ctx, query, data.Id, data.List)
	return ret, err
}

func (m *defaultActListModel) FindOne(ctx context.Context, id int64) (*ActList, error) {
	query := fmt.Sprintf("select %s from %s where id = $1 limit 1", actListRows, m.table)
	var resp ActList
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

func (m *defaultActListModel) Update(ctx context.Context, data *ActList) error {
	query := fmt.Sprintf("update %s set %s where id = $1", m.table, actListRowsWithPlaceHolder)
	_, err := m.conn.ExecCtx(ctx, query, data.Id, data.List)
	return err
}

func (m *defaultActListModel) Delete(ctx context.Context, id int64) error {
	query := fmt.Sprintf("delete from %s where id = $1", m.table)
	_, err := m.conn.ExecCtx(ctx, query, id)
	return err
}
