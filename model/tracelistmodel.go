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
	traceListFieldNames          = builder.RawFieldNames(&TraceList{}, true)
	traceListRows                = strings.Join(traceListFieldNames, ",")
	traceListRowsExpectAutoSet   = strings.Join(stringx.Remove(traceListFieldNames, "create_time", "update_time"), ",")
	traceListRowsWithPlaceHolder = builder.PostgreSqlJoin(stringx.Remove(traceListFieldNames, "id", "create_time", "update_time"))
)

type (
	TraceListModel interface {
		Insert(ctx context.Context, data *TraceList) (sql.Result, error)
		FindOne(ctx context.Context, id int64) (*TraceList, error)
		Update(ctx context.Context, data *TraceList) error
		Delete(ctx context.Context, id int64) error
	}

	defaultTraceListModel struct {
		conn  sqlx.SqlConn
		table string
	}

	TraceList struct {
		Id         int64     `db:"id"`   // user id
		List       string    `db:"list"` // list of {type、id、value and time},where type denotes is measure or act
		CreateTime time.Time `db:"create_time"`
		UpdateTime time.Time `db:"update_time"`
	}
)

func NewTraceListModel(conn sqlx.SqlConn) TraceListModel {
	return &defaultTraceListModel{
		conn:  conn,
		table: `"public"."trace_list"`,
	}
}

func (m *defaultTraceListModel) Insert(ctx context.Context, data *TraceList) (sql.Result, error) {
	query := fmt.Sprintf("insert into %s (%s) values ($1, $2)", m.table, traceListRowsExpectAutoSet)
	ret, err := m.conn.ExecCtx(ctx, query, data.Id, data.List)
	return ret, err
}

func (m *defaultTraceListModel) FindOne(ctx context.Context, id int64) (*TraceList, error) {
	query := fmt.Sprintf("select %s from %s where id = $1 limit 1", traceListRows, m.table)
	var resp TraceList
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

func (m *defaultTraceListModel) Update(ctx context.Context, data *TraceList) error {
	query := fmt.Sprintf("update %s set %s where id = $1", m.table, traceListRowsWithPlaceHolder)
	_, err := m.conn.ExecCtx(ctx, query, data.Id, data.List)
	return err
}

func (m *defaultTraceListModel) Delete(ctx context.Context, id int64) error {
	query := fmt.Sprintf("delete from %s where id = $1", m.table)
	_, err := m.conn.ExecCtx(ctx, query, id)
	return err
}
