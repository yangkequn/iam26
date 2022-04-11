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
	measureListFieldNames          = builder.RawFieldNames(&MeasureList{}, true)
	measureListRows                = strings.Join(measureListFieldNames, ",")
	measureListRowsExpectAutoSet   = strings.Join(stringx.Remove(measureListFieldNames, "create_time", "update_time"), ",")
	measureListRowsWithPlaceHolder = builder.PostgreSqlJoin(stringx.Remove(measureListFieldNames, "id", "create_time", "update_time"))
)

type (
	MeasureListModel interface {
		Insert(ctx context.Context, data *MeasureList) (sql.Result, error)
		FindOne(ctx context.Context, id int64) (*MeasureList, error)
		Update(ctx context.Context, data *MeasureList) error
		Delete(ctx context.Context, id int64) error
	}

	defaultMeasureListModel struct {
		conn  sqlx.SqlConn
		table string
	}

	MeasureList struct {
		Id         int64     `db:"id"`
		List       string    `db:"list"`
		CreateTime time.Time `db:"create_time"`
		UpdateTime time.Time `db:"update_time"`
	}
)

func NewMeasureListModel(conn sqlx.SqlConn) MeasureListModel {
	return &defaultMeasureListModel{
		conn:  conn,
		table: `"public"."measure_list"`,
	}
}

func (m *defaultMeasureListModel) Insert(ctx context.Context, data *MeasureList) (sql.Result, error) {
	query := fmt.Sprintf("insert into %s (%s) values ($1, $2)", m.table, measureListRowsExpectAutoSet)
	ret, err := m.conn.ExecCtx(ctx, query, data.Id, data.List)
	return ret, err
}

func (m *defaultMeasureListModel) FindOne(ctx context.Context, id int64) (*MeasureList, error) {
	query := fmt.Sprintf("select %s from %s where id = $1 limit 1", measureListRows, m.table)
	var resp MeasureList
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

func (m *defaultMeasureListModel) Update(ctx context.Context, data *MeasureList) error {
	query := fmt.Sprintf("update %s set %s where id = $1", m.table, measureListRowsWithPlaceHolder)
	_, err := m.conn.ExecCtx(ctx, query, data.Id, data.List)
	return err
}

func (m *defaultMeasureListModel) Delete(ctx context.Context, id int64) error {
	query := fmt.Sprintf("delete from %s where id = $1", m.table)
	_, err := m.conn.ExecCtx(ctx, query, id)
	return err
}
