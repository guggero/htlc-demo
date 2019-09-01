const d3 = window.d3;
const colorScheme = d3.scaleOrdinal(d3.schemeCategory10);

const nodes = [{
    id: 'node-0',
    balance: '12',
    color: colorScheme(0),
    startX: 0,
    startY: 0
}, {
    id: 'node-1',
    balance: '34',
    color: colorScheme(1),
    startX: 100,
    startY: 0
}, {
    id: 'node-2',
    balance: '34',
    color: colorScheme(2),
    startX: 200,
    startY: 0
}];

const channels = [{
    sourceBalance: 0,
    targetBalance: 1,
    source: nodes[0],
    target: nodes[1],
    id: 'channel-0',
    highlighted: false
}, {
    sourceBalance: 0,
    targetBalance: 1,
    source: nodes[1],
    target: nodes[2],
    id: 'channel-1',
    highlighted: false
}];

new Simulation(nodes, channels, {
    colorScheme,

    debug: false,

    container: {
        selector: '#container',
        backgroundColor: '#eee'
    },

    nodes: {
        radius: 30,
        color: null,
        strokeWidth: 3,
        strokeColor: null,
        text: 'id'
    },

    channels: {
        color: 'gray',
        colorHighlighted: null,
        strokeWidth: 'auto',
        strokeColor: null
    }
});
