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
	measureFieldNames          = builder.RawFieldNames(&Measure{}, true)
	measureRows                = strings.Join(measureFieldNames, ",")
	measureRowsExpectAutoSet   = strings.Join(stringx.Remove(measureFieldNames, "create_time", "update_time"), ",")
	measureRowsWithPlaceHolder = builder.PostgreSqlJoin(stringx.Remove(measureFieldNames, "id", "create_time", "update_time"))
)

type (
	measureModel interface {
		Insert(ctx context.Context, data *Measure) (sql.Result, error)
		FindOne(ctx context.Context, id int64) (*Measure, error)
		Update(ctx context.Context, data *Measure) error
		Delete(ctx context.Context, id int64) error
	}

	defaultMeasureModel struct {
		conn  sqlx.SqlConn
		table string
	}

	Measure struct {
		Id         int64     `db:"id"`
		Name       string    `db:"name"`
		Unit       string    `db:"unit"`
		Detail     string    `db:"detail"`
		Meaning    string    `db:"meaning"`
		CreateTime time.Time `db:"create_time"`
		UpdateTime time.Time `db:"update_time"`
		UseCounter int64     `db:"use_counter"`
		Author     string    `db:"author"`
	}
)

func newMeasureModel(conn sqlx.SqlConn) *defaultMeasureModel {
	return &defaultMeasureModel{
		conn:  conn,
		table: `"public"."measure"`,
	}
}

func (m *defaultMeasureModel) Insert(ctx context.Context, data *Measure) (sql.Result, error) {
	query := fmt.Sprintf("insert into %s (%s) values ($1, $2, $3, $4, $5, $6, $7)", m.table, measureRowsExpectAutoSet)
	ret, err := m.conn.ExecCtx(ctx, query, data.Id, data.Name, data.Unit, data.Detail, data.Meaning, data.UseCounter, data.Author)
	return ret, err
}

func (m *defaultMeasureModel) FindOne(ctx context.Context, id int64) (*Measure, error) {
	query := fmt.Sprintf("select %s from %s where id = $1 limit 1", measureRows, m.table)
	var resp Measure
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

func (m *defaultMeasureModel) Update(ctx context.Context, data *Measure) error {
	query := fmt.Sprintf("update %s set %s where id = $1", m.table, measureRowsWithPlaceHolder)
	_, err := m.conn.ExecCtx(ctx, query, data.Id, data.Name, data.Unit, data.Detail, data.Meaning, data.UseCounter, data.Author)
	return err
}

func (m *defaultMeasureModel) Delete(ctx context.Context, id int64) error {
	query := fmt.Sprintf("delete from %s where id = $1", m.table)
	_, err := m.conn.ExecCtx(ctx, query, id)
	return err
}

func (m *defaultMeasureModel) tableName() string {
	return m.table
}