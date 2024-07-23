let cy = cytoscape({
    container: document.getElementById('cy'),
    elements: [],
    style: [
        {
            selector: 'node',
            style: {
                'background-color': '#666',
                'label': 'data(label)',
                'color': '#fff',
                'text-outline-width': 2,
                'text-outline-color': '#666',
                'text-valign': 'center',
                'text-halign': 'center',
                'font-size': 8,
                'width': 'label',
                'height': 'label',
                'padding': 5
            }
        },
        {
            selector: 'edge',
            style: {
                'curve-style': 'bezier',
                'width': 3,
                'line-color': '#ccc',
                'target-arrow-color': '#ccc',
                'target-arrow-shape': 'triangle',
                'arrow-scale': 2,
                'control-point-step-size': 20
            }
        }
    ],
    layout: {
        name: 'klay',
        nodeDimensionsIncludeLabels: true,
        klay: {
            spacing: 50,
            direction: 'RIGHT',
            edgeRouting: 'ORTHOGONAL'
        }
    }
});

async function query(sourceText, targetTexts) {
    const data = {
        source_sentence: sourceText,
        target_sentences: targetTexts
    };

    try {
        const response = await fetch("http://localhost:8000/similarity/", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error fetching similarity:', error);
        throw error;
    }
}

async function fetchPageRank() {
    const data = {
        nodes: cy.nodes().map(node => ({ id: node.id() })),
        edges: cy.edges().map(edge => ({
            source: edge.source().id(),
            target: edge.target().id(),
            weight: parseFloat(edge.data('weight')) || 1.0
        }))
    };

    console.log(data)

    try {
        const response = await fetch('http://localhost:8002/pagerank/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const results = await response.json();
        return results;
    } catch (error) {
        console.error('Error fetching PageRank:', error);
        throw error;
    }
}

document.getElementById('addNode').addEventListener('click', function() {
    let nodeText = document.getElementById('nodeText').value.trim();
    if (nodeText === "") {
        alert("Please enter text for the node.");
        return;
    }

    let nodeId = `n${cy.elements().length + 1}`;
    if (cy.getElementById(nodeId).length !== 0) {
        alert("A node with this ID already exists. Addition attempt aborted.");
        return;
    }
    let shortLabel = nodeText.length > 15 ? nodeText.substring(0, 12) + '...' : nodeText;
    cy.add({
        group: 'nodes',
        data: { id: nodeId, label: shortLabel, text: nodeText, fullText: nodeText },
        position: { x: Math.random() * 800, y: Math.random() * 600 }
    });
    document.getElementById('nodeText').value = "";
    cy.layout({ name: 'klay' }).run();
});

let selectedNode = null;
cy.on('tap', 'node', function(evt) {
    selectedNode = evt.target;
});

document.getElementById('deleteNode').addEventListener('click', function() {
    if (selectedNode) {
        selectedNode.remove();
        if (linkSource === selectedNode) {
            linkSource = null;
        }
        selectedNode = null;
    } else {
        alert("No nodes selected for deletion.");
    }
});

let linkMode = false;
let linkSource = null;

document.getElementById('linkMode').addEventListener('click', function() {
    linkMode = !linkMode;
    this.textContent = linkMode ? "Deactivate Link Mode" : "Activate Link Mode";
});

cy.on('tap', 'node', function(evt) {
    let node = evt.target;
    if (linkMode) {
        if (linkMode && linkSource && node.id() !== linkSource.id() && cy.getElementById(linkSource.id()).length && cy.getElementById(node.id()).length) {
            const sourceId = linkSource.id();
            const targetId = node.id();
            const sourceText = linkSource.data('text');
            const targetText = node.data('text');

            document.getElementById('loader').style.display = 'block';


            query(sourceText, [targetText]).then(response => {
                document.getElementById('loader').style.display = 'none';

                if (response && response.length > 0) {
                    let similarity = parseFloat(response[0]);
                    cy.add({
                        group: 'edges',
                        data: {
                            id: `e${sourceId}to${targetId}`,
                            source: sourceId,
                            target: targetId,
                            weight: similarity
                        }
                    });
                    cy.layout({ name: 'klay' }).run();
                } else {
                    console.error('No similarity data returned from API');
                }
                linkSource = null;
            }).catch(error => {
                document.getElementById('loader').style.display = 'none';
                console.error('Error fetching similarity:', error);
                linkSource = null;
            });
        } else {
            linkSource = node;
        }
    }
});
cy.on('mouseover', 'node', function(evt) {
    let node = evt.target;
    let tooltipDiv = document.getElementById('tooltip');
    tooltipDiv.innerHTML = `Node ID: ${node.id()}<br>Label: ${node.data('label')}<br>Full Text: ${node.data('fullText')}`;
    tooltipDiv.style.display = 'block';
    tooltipDiv.style.left = evt.renderedPosition.x + 20 + 'px';
    tooltipDiv.style.top = evt.renderedPosition.y + 20 + 'px';
});

cy.on('mouseout', 'node', function() {
    let tooltipDiv = document.getElementById('tooltip');
    tooltipDiv.style.display = 'none';
});

cy.on('mouseout', 'node', function() {
    let tooltipDiv = document.getElementById('tooltip');
    tooltipDiv.style.display = 'none';
});


document.getElementById('calculatePR').addEventListener('click', async function() {
    try {
        const pagerankResults = await fetchPageRank();
        cy.nodes().forEach(node => {
            const prValue = pagerankResults[node.id()];
            node.style({
                'background-color': `hsl(${Math.round(120 * (1 - prValue))}, 70%, 70%)`,
                'width': 20 + 40 * prValue,
                'height': 20 + 40 * prValue,
                'label': `${node.data('label')} (${prValue.toFixed(4)})`
            });
        });
        cy.layout({
            name: 'klay',
            animate: true,
            animationDuration: 500,
            nodeDimensionsIncludeLabels: true,
            klay: {
                spacing: 50,
                direction: 'RIGHT',
                edgeRouting: 'ORTHOGONAL'
            }
        }).run();
    } catch (error) {
        console.error('Failed to calculate PageRank:', error);
    }
});