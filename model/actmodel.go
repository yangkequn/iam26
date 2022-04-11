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
	actFieldNames          = builder.RawFieldNames(&Act{}, true)
	actRows                = strings.Join(actFieldNames, ",")
	actRowsExpectAutoSet   = strings.Join(stringx.Remove(actFieldNames, "create_time", "update_time"), ",")
	actRowsWithPlaceHolder = builder.PostgreSqlJoin(stringx.Remove(actFieldNames, "id", "create_time", "update_time"))
)

type (
	ActModel interface {
		Insert(data *Act) (sql.Result, error)
		FindOne(id int64) (*Act, error)
		Update(data *Act) error
		Delete(id int64) error
	}

	defaultActModel struct {
		conn  sqlx.SqlConn
		table string
	}

	Act struct {
		Id         int64     `db:"id"`
		Name       string    `db:"name"`
		Unit       string    `db:"unit"`
		Detail     string    `db:"detail"`
		Meaning    string    `db:"meaning"`
		CreateTime time.Time `db:"create_time"`
		UpateTime  time.Time `db:"upate_time"`
		Author     int64     `db:"author"`
		Popularity int64     `db:"use_counter"`
	}
)

func NewActModel(conn sqlx.SqlConn) ActModel {
	return &defaultActModel{
		conn:  conn,
		table: `"public"."act"`,
	}
}

func (m *defaultActModel) Insert(data *Act) (sql.Result, error) {
	query := fmt.Sprintf("insert into %s (%s) values ($1, $2, $3, $4, $5, $6, $7, $8)", m.table, actRowsExpectAutoSet)
	ret, err := m.conn.Exec(query, data.Id, data.Name, data.Unit, data.Detail, data.Meaning, data.UpateTime, data.Author, data.Popularity)
	return ret, err
}

func (m *defaultActModel) FindOne(id int64) (*Act, error) {
	query := fmt.Sprintf("select %s from %s where id = $1 limit 1", actRows, m.table)
	var resp Act
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

func (m *defaultActModel) Update(data *Act) error {
	query := fmt.Sprintf("update %s set %s where id = $1", m.table, actRowsWithPlaceHolder)
	_, err := m.conn.Exec(query, data.Id, data.Name, data.Unit, data.Detail, data.Meaning, data.UpateTime, data.Author, data.Popularity)
	return err
}

func (m *defaultActModel) Delete(id int64) error {
	query := fmt.Sprintf("delete from %s where id = $1", m.table)
	_, err := m.conn.Exec(query, id)
	return err
}
