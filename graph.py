from fastapi import FastAPI
from pydantic import BaseModel
import graph_tool.all as gt
from typing import List, Dict
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class Edge(BaseModel):
    source: str
    target: str
    weight: float


class GraphData(BaseModel):
    nodes: List[Dict[str, str]]
    edges: List[Edge]


@app.post("/pagerank/")
def calculate_pagerank(data: GraphData):
    g = gt.Graph(directed=True)
    vertex_map = {}
    index_to_id = {}

    for node in data.nodes:
        v = g.add_vertex()
        vertex_map[node['id']] = v
        index_to_id[int(v)] = node['id']

    weight_prop = g.new_edge_property("double")
    for edge in data.edges:
        e = g.add_edge(vertex_map[edge.source], vertex_map[edge.target])
        weight_prop[e] = edge.weight

    pr = gt.pagerank(g, weight=weight_prop)
    return {index_to_id[int(v)]: pr[v] for v in g.vertices()}
