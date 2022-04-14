// Code generated by goctl. DO NOT EDIT!

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
	measureIndexFieldNames          = builder.RawFieldNames(&MeasureIndex{}, true)
	measureIndexRows                = strings.Join(measureIndexFieldNames, ",")
	measureIndexRowsExpectAutoSet   = strings.Join(stringx.Remove(measureIndexFieldNames, "create_time", "update_time"), ",")
	measureIndexRowsWithPlaceHolder = builder.PostgreSqlJoin(stringx.Remove(measureIndexFieldNames, "id", "create_time", "update_time"))
)

type (
	measureIndexModel interface {
		Insert(ctx context.Context, data *MeasureIndex) (sql.Result, error)
		FindOne(ctx context.Context, id string) (*MeasureIndex, error)
		Update(ctx context.Context, data *MeasureIndex) error
		Delete(ctx context.Context, id string) error
	}

	defaultMeasureIndexModel struct {
		conn  sqlx.SqlConn
		table string
	}

	MeasureIndex struct {
		Id         string    `db:"id"`
		Type       string    `db:"type"`
		CreateTime time.Time `db:"create_time"`
		UpdateTime time.Time `db:"update_time"`
		Data       string    `db:"data"`      // use float 32 array
		TimeSpan   float64   `db:"time_span"` // unit: minutes
	}
)

func newMeasureIndexModel(conn sqlx.SqlConn) *defaultMeasureIndexModel {
	return &defaultMeasureIndexModel{
		conn:  conn,
		table: `"public"."measure_index"`,
	}
}

func (m *defaultMeasureIndexModel) Insert(ctx context.Context, data *MeasureIndex) (sql.Result, error) {
	query := fmt.Sprintf("insert into %s (%s) values ($1, $2, $3, $4)", m.table, measureIndexRowsExpectAutoSet)
	ret, err := m.conn.ExecCtx(ctx, query, data.Id, data.Type, data.Data, data.TimeSpan)
	return ret, err
}

func (m *defaultMeasureIndexModel) FindOne(ctx context.Context, id string) (*MeasureIndex, error) {
	query := fmt.Sprintf("select %s from %s where id = $1 limit 1", measureIndexRows, m.table)
	var resp MeasureIndex
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

func (m *defaultMeasureIndexModel) Update(ctx context.Context, data *MeasureIndex) error {
	query := fmt.Sprintf("update %s set %s where id = $1", m.table, measureIndexRowsWithPlaceHolder)
	_, err := m.conn.ExecCtx(ctx, query, data.Id, data.Type, data.Data, data.TimeSpan)
	return err
}

func (m *defaultMeasureIndexModel) Delete(ctx context.Context, id string) error {
	query := fmt.Sprintf("delete from %s where id = $1", m.table)
	_, err := m.conn.ExecCtx(ctx, query, id)
	return err
}

func (m *defaultMeasureIndexModel) tableName() string {
	return m.table
}
