const d3 = window.d3;
const colorScheme = d3.scaleOrdinal(d3.schemeCategory10);

const nodes = [{
    id: 'alice',
    color: colorScheme(0),
    startX: 0
}, {
    id: 'bob',
    color: colorScheme(1),
    startX: 100
}, {
    id: 'carol',
    color: colorScheme(2),
    startX: 200
}];

let channels = [{
    sourceBalance: 4,
    targetBalance: 6,
    cltv: 144,
    source: nodes[0],
    target: nodes[1],
    id: 'channel-0',
    highlighted: false,
    hasHtlc: false,
    htlcAmount: 0,
}, {
    sourceBalance: 2,
    targetBalance: 2,
    cltv: 144,
    source: nodes[1],
    target: nodes[2],
    id: 'channel-1',
    highlighted: false,
    hasHtlc: false,
    htlcAmount: 0,
}];

const simulation = new Simulation(nodes, channels, {
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
        strokeWidth: '3px',
        strokeColor: null
    }
});

$(document).ready(() => {
   $('#show-htlc').on('click', () => {
       const checked = $('#show-htlc').prop('checked');
       channels = channels.map(c => {
           c.hasHtlc = checked;
           c.htlcAmount = checked ? 1 : 0;
           return c;
       });
       simulation.onDataUpdate(nodes, channels);
   }) 
});