# Interactive Graph Visualizer with Text Similarity Analysis

## Description

This project, Interactive Graph Visualizer with Text Similarity Analysis, combines the power of Cytoscape.js for interactive graph visualization with advanced text similarity calculations provided by the Hugging Face API. It's designed to help users visually explore and manipulate graphs while dynamically calculating and displaying the semantic similarity and semantic pagerank between nodes based on their text attributes.

The application is perfect for researchers, data scientists, SEO or anyone interested in graph theory and natural language processing (NLP). It provides a user-friendly interface to add, edit, or delete nodes and edges and see the impact of text similarity on graph dynamics in real time.

## DEMO

- note: on the demo the huggingface api may take some time to respond on the first call. Because of the model loading, if you don't see your link after loading, try again to make your link it should work.

Link : http://labs.vido.fr/semantic-pr/

## Key Features:

- Interactive Graph Management: Users can interactively manage graph nodes and edges. They can add new nodes and define edges with simple clicks and user inputs.
- Text Similarity Integration: Integrates with the Hugging Face API to compute text similarities, transforming textual node descriptions into quantifiable data that affects the graph's structure.
- Dynamic Visualization: Utilizes Cytoscape.js for rendering the graph, which updates in real-time as users work with node and edge properties.
- PageRank Calculation: Implements a custom solution to calculate PageRank, considering edge weights derived from text similarity scores, allowing for an insightful analysis of node importance based on textual relationships.

## Installation

To get started with this project, you need to install some dependencies needed to run the application locally on your machine. The project is based on JavaScript and uses npm libraries for some features. As well as two uvicorn servers with python

### Prerequisites
Before you start the installation, make sure that you have the following tools installed on your system:

- PHP: to run a web server and access the html + js files
- Python3: to run the text similarity api and pagerank calculation.
- Conda: to run Graph-tool in a conda python environment

### Installation des Dépendances

1. Clone the Git Repository:
```bash
git clone https://github.com/drogbadvc/semantic-pr-interactive.git
```
2. Navigate to the project folder :
```bash
cd semantic-pr-interactive 
```

3. Install the Project Dependencies:

```bash
pip install -r requirements.txt
```

- Installing graph-tool with conda : 
https://graph-tool.skewed.de/installation.html

### Launch APi + web server

#### run the text similarity api with uvicorn : 

```bash
uvicorn api_sim:app --reload
```

#### run the api with graph-tool for calculating semantic pagerank : 

```bash
uvicorn graph:app --reload --port 8002
```

#### run the web server with PHP

To access the html file and graphical display directly via the http://localhost:8081 address

```bash
php -S 127.0.0.1:8081
```

### Usage

#### Video :
[![IMAGE ALT TEXT HERE](https://img.youtube.com/vi/xAPdOWllT5E/0.jpg)](https://www.youtube.com/watch?v=xAPdOWllT5E)

