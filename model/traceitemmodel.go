package model

import (
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
	traceItemFieldNames          = builder.RawFieldNames(&TraceItem{}, true)
	traceItemRows                = strings.Join(traceItemFieldNames, ",")
	traceItemRowsExpectAutoSet   = strings.Join(stringx.Remove(traceItemFieldNames, "create_time", "update_time"), ",")
	traceItemRowsWithPlaceHolder = builder.PostgreSqlJoin(stringx.Remove(traceItemFieldNames, "id", "create_time", "update_time"))
)

type (
	TraceItemModel interface {
		Insert(data *TraceItem) (sql.Result, error)
		FindOne(id int64) (*TraceItem, error)
		Update(data *TraceItem) error
		Delete(id int64) error
	}

	defaultTraceItemModel struct {
		conn  sqlx.SqlConn
		table string
	}

	TraceItem struct {
		Id         int64     `db:"id"`
		UserId     int64     `db:"user_id"`
		ActId      int64     `db:"act_id"`
		MeasureId  int64     `db:"measure_id"`
		Value      float64   `db:"value"`       // act value or measured value
		CreateTime time.Time `db:"create_time"` // create time
		Memo       string    `db:"memo"`        // annotation
		Time       time.Time `db:"time"`
		UpdateTime time.Time `db:"update_time"`
	}
)

func NewTraceItemModel(conn sqlx.SqlConn) TraceItemModel {
	return &defaultTraceItemModel{
		conn:  conn,
		table: `"public"."trace_item"`,
	}
}

func (m *defaultTraceItemModel) Insert(data *TraceItem) (sql.Result, error) {
	query := fmt.Sprintf("insert into %s (%s) values ($1, $2, $3, $4, $5, $6, $7)", m.table, traceItemRowsExpectAutoSet)
	ret, err := m.conn.Exec(query, data.Id, data.UserId, data.ActId, data.MeasureId, data.Value, data.Memo, data.Time)
	return ret, err
}

func (m *defaultTraceItemModel) FindOne(id int64) (*TraceItem, error) {
	query := fmt.Sprintf("select %s from %s where id = $1 limit 1", traceItemRows, m.table)
	var resp TraceItem
	err := m.conn.QueryRow(&resp, query, id)
	switch err {
	case nil:
		return &resp, nil
	case sqlc.ErrNotFound:
		return nil, ErrNotFound
	default:
		return nil, err
	}
}

func (m *defaultTraceItemModel) Update(data *TraceItem) error {
	query := fmt.Sprintf("update %s set %s where id = $1", m.table, traceItemRowsWithPlaceHolder)
	_, err := m.conn.Exec(query, data.Id, data.UserId, data.ActId, data.MeasureId, data.Value, data.Memo, data.Time)
	return err
}

func (m *defaultTraceItemModel) Delete(id int64) error {
	query := fmt.Sprintf("delete from %s where id = $1", m.table)
	_, err := m.conn.Exec(query, id)
	return err
}
