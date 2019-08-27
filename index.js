const d3 = window.d3;

class Demo {
    constructor(options) {
        this._opt = options;
        this.container = document.querySelector('#container');
        this.svg = d3.select(this.container)
            .append('svg')
            .attr('class', 'demo')
            .style('background-color', '#eee');

        this.updateSVGSize();

        this.chart = this.svg.append('g')
            .attr('class', 'chart')
            .attr('transform', 'translate(0, 0) scale(1)');
        this.channelContainer = this.chart.append("g").attr("class", "channels");
        this.nodeContainer = this.chart.append('g').attr('class', 'nodes');

        this._nodes = [{
            id: 'node-0',
            balance: '12',
            color: options.colorScheme(0)
        }, {
            id: 'node-1',
            balance: '34',
            color: options.colorScheme(1)
        }, {
            id: 'node-2',
            balance: '34',
            color: options.colorScheme(2)
        }];
        this._channels = [{
            sourceBalance: 0,
            targetBalance: 1,
            source: this._nodes[0],
            target: this._nodes[1],
            id: 'channel-0',
            highlighted: false
        }, {
            sourceBalance: 0,
            targetBalance: 1,
            source: this._nodes[1],
            target: this._nodes[2],
            id: 'channel-1',
            highlighted: false
        }];
        this.simulation = this._createSimulation();

        this.updateSimulationCenter();

        this.behaviors = this.createBehaviors();
        this.svg.call(this.behaviors.zoom);

        this._updateNodes();
        this._updateChannels();

        window.addEventListener('resize', this.onResize.bind(this));
    }

    updateSVGSize() {
        this.width = +this.container.clientWidth;
        this.height = +this.container.clientHeight;
        this.forceDistance = (this.width + this.height) * .1;
        this.svg
            .attr('width', this.width)
            .attr('height', this.height)
    }

    onResize() {
        this.updateSVGSize();
        this.updateSimulationCenter();
        this.createBehaviors();
    }

    createBehaviors() {
        return {
            zoom: d3.zoom()
                .scaleExtent([0.1, 5, 4])
                .on('zoom', () => this.chart.attr('transform', d3.event.transform)),

            drag: d3.drag()
                .on('start', this._onDragStart.bind(this))
                .on('drag', this._onDragged.bind(this))
                .on('end', this._onDragendEnd.bind(this))
        }
    }

    updateSimulationCenter() {
        const centerX = this.svg.attr('width') / 2;
        const centerY = this.svg.attr('height') / 2;
        this.simulation
            .force('center', d3.forceCenter(centerX, centerY))
            .restart();
    }

    _createSimulation() {
        return d3.forceSimulation(this._nodes)
            .force('charge', d3.forceManyBody().strength(-3000))
            .force('link', d3.forceLink(this._channels).strength(0.005).distance(this.forceDistance))
            .force('x', d3.forceX())
            .force('y', d3.forceY())
            .alphaTarget(0)
            .on('tick', this._ticked.bind(this));
    }

    _updateNodes() {
        const opt = this._opt;

        console.log('_updateNodes: ', this._nodes);

        this._nodeElements = this.nodeContainer
            .selectAll('.node')
            .data(this._nodes, (data) => data.id);

        /* remove deleted nodes */
        this._nodeElements
            .exit()
            .transition()
            .duration(1000)
            .style('opacity', 0)
            .remove();

        /* create new nodes */
        let nodeParent = this._nodeElements.enter().append('g')
            .attr('class', 'node')
            .attr('id', (data) => data.id)
            .attr('balance', (data) => data.balance)
            .style('stroke', opt.nodes.strokeColor)
            .style('stroke-width', opt.nodes.strokeWidth);

        nodeParent.append('circle')
            .attr('class', 'node-circle')
            .attr('fill', (data) => data.color)
            .attr('r', opt.nodes.radius)
            .style('cursor', 'pointer');

        nodeParent.append('text')
            .style('stroke-width', 0.5)
            .attr('class', 'node-text-id')
            .attr('stroke', opt.container.backgroundColor)
            .attr('fill', opt.container.backgroundColor)
            .attr('font-family', 'sans-serif')
            .attr('font-size', '15px')
            .attr('y', '0px')
            .attr('text-anchor', 'middle')
            .attr('pointer-events', 'none')
            .text((d) => d.id);

        nodeParent.append('text')
            .style('stroke-width', 0.5)
            .attr('class', 'node-text-balance')
            .attr('stroke', opt.container.backgroundColor)
            .attr('fill', opt.container.backgroundColor)
            .attr('font-family', 'sans-serif')
            .attr('font-size', '12px')
            .attr('y', '15px')
            .attr('text-anchor', 'middle')
            .attr('pointer-events', 'none')
            .text((d) => d.balance);

        nodeParent.call(this.behaviors.drag);

        /* update existing nodes */
        this._nodeElements
            .attr('balance', (d) => d.balance)
            .selectAll('.node-text-balance')
            .text((d) => d.balance);

        this.simulation
            .nodes(this._nodes)
            .alphaTarget(1)
            .restart();

        this._nodeElements = this.nodeContainer
            .selectAll('.node');

        return this._nodeElements;
    }

    _updateChannels() {
        const opt = this._opt;

        /* update beads of each channel */
        this._channels = this._channels.map((ch) => {
            const balance = ch.sourceBalance + ch.targetBalance;
            let index = -1;
            ch.beads = [];
            ch.beads.push(...Array.from(new Array(ch.sourceBalance), (x) => {
                index++;
                return {
                    state: 0,
                    index: index,
                    //id: `bead_${ch.id}_source_${index}x${ch.sourceBalance}`
                    id: `bead_${ch.id}_source_${index}x${balance}`
                }
            }));
            ch.beads.push(...Array.from(new Array(ch.targetBalance), (x) => {
                index++;
                return {
                    state: 1,
                    index: index,
                    //id: `bead_${ch.id}_target_${index}x${ch.targetBalance}`
                    id: `bead_${ch.id}_target_${index}x${balance}`
                }
            }));
            return ch;
        });

        console.log('_updateChannels: ', this._channels);

        this._channelElements = this.channelContainer.selectAll('.channel').data(this._channels, (d) => d.id);

        /* remove channels that no longer exist */
        this._channelElements.exit()
            .transition()
            .duration(500)
            .style('opacity', 0)
            .remove();

        /* create new svg elements for new channels */
        let channelRoots = this._channelElements.enter().append('g')
            .attr('class', 'channel');

        this._channelElements.merge(channelRoots)
            .attr('id', (d) => d.id)
            .attr('source-balance', (d) => d.sourceBalance)
            .attr('target-balance', (d) => d.targetBalance)
            .attr('source-id', (d) => d.source.id)
            .attr('target-id', (d) => d.target.id)
            .attr('highlighted', (d) => d.hightlighted);

        channelRoots
            .append('path')
            .attr('class', 'path')
            .attr('id', (d) => `${d.id}_path`)
            .style('stroke-width', (d) => opt.channels.strokeWidth === 'auto' ? (d.sourceBalance + d.targetBalance) * 2 : opt.channels.strokeWidth)
            .style('stroke', opt.channels.color)
            .style('fill', 'none');

        if (this._opt.channels.showBalance) {
            channelRoots
                .append('text')
                .attr('class', 'channel-text')
                .attr('font-family', 'Verdana')
                .attr('font-size', '12')
                .attr('dx', 150) //TODO: place this dynamic between the beads on the path
                .attr('dy', -7)
                .style('pointer-events', 'none')
                .append('textPath')
                .attr('xlink:href', (d) => `#${d.id}_path`)
                .attr('class', 'channel-text-path')
                .style('stroke-width', 1)
                .style('stroke', opt.channels.color)
                .style('fill', 'none')
                .text((d) => `${d.sourceBalance}:${d.targetBalance}`)
        }

        /* update this._paths; needed in this._ticked */
        this._paths = this.channelContainer.selectAll('.channel .path');

        this.simulation
            .force('link')
            .links(this._channels);

        this.simulation
            .alphaTarget(0)
            .restart();

        return this._channelElements;
    }

    _ticked() {
        if (this._nodeElements) {
            this._nodeElements.attr('transform', (data) => `translate(${data.x},${data.y})`);
        }

        if (this._paths) {
            this._paths.attr('d', (d) => `M${d.source.x},${d.source.y} ${d.target.x},${d.target.y}`);
        }
    }

    _onDragStart(d) {
        if (!d3.event.active) {
            this.simulation
                .alphaTarget(0.1)
                .restart();
        }
        d.fx = d.x;
        d.fy = d.y;
    }

    _onDragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    _onDragendEnd(d) {
        if (!d3.event.active) {
            this.simulation
                .alphaTarget(0);
        }
        d.fx = null;
        d.fy = null;
    }
}

new Demo({
    colorScheme: d3.scaleOrdinal(d3.schemeCategory10),

    debug: false,

    container: {
        selector: '#beadnet',
        backgroundColor: '#FFF'
    },

    nodes: {
        radius: 30,
        color: null,
        strokeWidth: 3,
        strokeColor: null,

        /* ["id", "balance"] */
        text: 'id'
    },

    channels: {
        color: 'gray',
        colorHighlighted: null,

        /* Number or "auto" */
        strokeWidth: 'auto',
        strokeColor: null,

        /* show channel balance as text path */
        showBalance: false
    },

    beads: {
        radius: 10,
        spacing: -0.5,
        strokeWidth: 2,
        strokeColor: null,

        showIndex: true
    },

    presentation: false,
});
