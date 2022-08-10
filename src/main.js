class DijkstraGrid {
  constructor(container, rows, cols) {
    this.container = container;
    this.rows = rows;
    this.cols = cols;
    this.nodes = new Map();
    this.network = new Map();
    this.edges = new Map();
    this.originButton = document.createElement('button')
    this.originButton.classList.add('origin');
    this.isSetOrigin = false;
    this.targetButton = document.createElement('button');
    this.isSetTarget = false;
    this.targetButton.classList.add('target');
  }

  getNeighborKeys = (key) => {
    const [ row, col ] = this.getRowCol(key);
    const neighbors = [
      [row - 1, col], // top
      [row, col - 1], // left
      [row, col + 1], // right
      [row + 1, col], // bottom
    ]
    return neighbors.filter(([row, col]) => {
      return (0 <= row) && (row < this.rows) && (0 <= col) && (col < this.cols);
    });
  }

  getLiNodeParent = (node) => {
    let copyNode = node;
    while (copyNode.tagName !== 'LI' || copyNode.tagName !== 'UL') {
      copyNode = copyNode.parentNode;
    }
    if (node.tagName === 'UL') return null;
    return copyNode;
  }

  addEdge = (originKey, targetKey, weight = 1) => {
    if (!this.edges.has(originKey)) {
      this.edges.set(originKey, new Map());
    } 
    const pathsFromOrigin = this.edges.get(originKey);
    pathsFromOrigin.set(targetKey, weight)
  }

  removeEdge = (originKey, targetKey) => {
    const edgesFromOrigin = this.edges.get(originKey);
    if (edgesFromOrigin) edgesFromOrigin.delete(targetKey);
  }


  removeNodes = function () {
    this.nodes.clear();
    this.container.textContent = '';
  }

  getKey = function (row = 0, col = 0) {
    return `${row}-${col}`;
  }

  getRowCol = function (coordString = '0,0') {
    const arr = coordString.split('-');
    return [parseInt(arr[0]), parseInt(arr[1])];
  }

  createBlock = function(key) {
    // creates block and adds key
    const block = document.createElement('li');
    block['data-key'] = key;
    return block;
  }

  createNode = function(row, col, node) {
    // create, map, and append
    const key = this.getKey(row, col);
    const currNode = this.createBlock(key);
    this.mapNode(key, node)
    this.container.appendChild(currNode);
    if (row === 0 && col === 0) currNode.appendChild(this.originButton);
    if (row === 0 && col === 39) currNode.appendChild(this.targetButton);
  }

  mapNode = function(row, col, node) {
    const key = this.getKey(row, col);
    this.nodes.set(key, node)
  }

  populateNodes = function () {
    this.removeNodes();
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        this.createNode(r, c);
      }
    }
  }

  toggleSelected = (ele) => {
    ele.classList.toggle('selected');
  }

  isInNetwork = (key) => {
    return this.network.has(key);
  }

  addNodeToNetwork = (node, originKey = node['data-key']) => {
    this.network.set(originKey, node);
    const neighbors = this.getNeighborKeys(originKey);
    for (const [row, col] of neighbors) {
      const neighborKey = this.getKey(row, col);
      if (this.isInNetwork(neighborKey)) {
        this.addEdge(originKey, neighborKey);
        this.addEdge(neighborKey, originKey);
      }
    }
  }

  removeNodeFromNetwork = (node, originKey = node['data-key']) => {
    const neighbors = this.getNeighborKeys(originKey);
    for (const [row, col] of neighbors) {
      const neighborKey = this.getKey(row, col);
      if (this.isInNetwork(neighborKey)) {
        this.removeEdge(neighborKey, originKey);
      }
    }
    this.edges.delete(originKey)
    this.network.delete(originKey);
  }

  gridClickListener = (e) => {
    e.preventDefault();
    const nodeEle = e.target;
    if (nodeEle.tagName !== 'LI') return;

    if (nodeEle.classList.contains('selected')) { // deselect, remove edges and node
      this.removeNodeFromNetwork(nodeEle);
    } else { // select, add node and edges
      this.addNodeToNetwork(nodeEle);
    }
    this.toggleSelected(nodeEle);
    console.log('network:', this.network)
    console.log('edges:', this.edges)
  }

  listenerMouseDown = (isOrigin = true) => (e) => {
    if (isOrigin) {
      this.isSetOrigin = true;
    } else {
      this.isSetTarget = true;
    }
  }
  listenerMouseUp = (isOrigin = true) => (e) => {
    if (isOrigin) {
      this.isSetOrigin = false;
    } else {
      this.isSetTarget = false;
    }
  }

  gridHoverListener = (e) => {
    if (e.target.tagName !== 'LI') return;
    if (this.isSetOrigin) {
      e.target.appendChild(this.originButton);
    } else if (this.isSetTarget) {
      e.target.appendChild(this.targetButton)
    }
  }

  addGridListeners = function () {
    this.container.addEventListener('click', this.gridClickListener);
    this.container.addEventListener('mouseover', this.gridHoverListener);
    this.originButton.addEventListener('mousedown', this.listenerMouseDown(true));
    this.originButton.addEventListener('mouseup', this.listenerMouseUp(true));
    this.targetButton.addEventListener('mousedown', this.listenerMouseDown(false));
    this.targetButton.addEventListener('mouseup', this.listenerMouseUp(false));
  }
}

const container = document.querySelector('ul.dijkstra_grid');
const board = new DijkstraGrid(container, 32, 40);
board.populateNodes();
board.addGridListeners();