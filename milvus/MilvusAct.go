package milvus

import (
	"context"
	"fmt"

	"github.com/milvus-io/milvus-sdk-go/v2/entity"
	"github.com/yangkequn/GoTools"
	qmilvus "github.com/yangkequn/q-milvus-driver-for-go"
)

//version 1.0 concates all text together,query it's meaning vector as search vector
// a improved version will recalculate word embedding, and take the everage word embedding as search vector

type Act struct {
	Id         int64     `schema:"in,out" primarykey:"true"`
	Name       string    `schema:""`
	Unit       string    `schema:""`
	Detail     string    `schema:""`
	Popularity int64     `schema:""`
	Vector     []float32 `dim:"384" schema:"in" index:"true"`
	Score      float32   ``
}

//Index: return the name of index, and the index type, used to build index automatically
//index name is also used by search
func (v Act) Index() (indexFieldName string, index entity.Index) {
	index, _ = entity.NewIndexIvfFlat(entity.IP, 256)
	return "Vector", index
}

//BuildSearchVector: return the vector to be Inserted
//If your Vector is precalculated, Just return it
func (v Act) BuildSearchVector(ctx context.Context) (Vector []float32) {
	text := fmt.Sprintf("Name:%s Unit:%s Detail:%s Polularity:%d", v.Name, v.Unit, v.Detail, v.Popularity)
	Vector, _ = GoTools.TextToMeaning(ctx, RedisClient, text)
	return Vector
}

var ActCollection *qmilvus.Collection = qmilvus.Collection{}.Init(milvusAdress, Act{}, "")
