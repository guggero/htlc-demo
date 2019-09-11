class Simulation {
    constructor(nodes, channels, options) {
        this._opt = options;
        this.container = document.querySelector(options.container.selector);
        this.svg = d3.select(this.container)
            .append('svg')
            .attr('class', 'demo')
            .style('background-color', options.container.backgroundColor);

        this.updateSVGSize();

        this.chart = this.svg.append('g')
            .attr('class', 'chart')
            .attr('transform', 'translate(0, 0) scale(1)');
        this.channelContainer = this.chart.append('g')
            .attr('class', 'channels');
        this.nodeContainer = this.chart.append('g')
            .attr('class', 'nodes');

        this._nodes = nodes;
        this._nodes.forEach((n) => {
            n.x = n.startX;
            n.y = 0;
        });
        this._channels = channels;
        this._channels.forEach((c) => {
            c.source.right = c;
            c.target.left = c;
        });
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

    onUpdate() {
        this.svg.dispatch('change');
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
        const centerY = this.svg.attr('height') / 4;
        this.simulation
            .force('center', d3.forceCenter(centerX, centerY))
            .restart();
    }

    _createSimulation() {
        return d3.forceSimulation(this._nodes)
            .force('charge', d3.forceManyBody().strength(-4000))
            .force('link', d3.forceLink(this._channels).strength(0.001).distance(this.forceDistance))
            .force('y', d3.forceY())
            .alphaTarget(0)
            .on('tick', this._ticked.bind(this));
    }

    _updateNodes() {
        const opt = this._opt;

        this._nodeElements = this.nodeContainer.selectAll('.node')
            .data(this._nodes, (data) => data.id);

        /* remove deleted nodes */
        this._nodeElements.exit()
            .transition()
            .duration(1000)
            .style('opacity', 0)
            .remove();

        /* create new nodes */
        let nodeParent = this._nodeElements.enter().append('g');
        createNodeElements(nodeParent, opt);
        nodeParent.call(this.behaviors.drag);

        this.simulation
            .nodes(this._nodes)
            .alphaTarget(1)
            .restart();

        this._nodeElements = this.nodeContainer
            .selectAll('.node');
    }

    _updateChannels() {
        const opt = this._opt;

        this._channelElements = this.channelContainer.selectAll('.channel')
            .data(this._channels, (d) => d.id);

        /* remove channels that no longer exist */
        this._channelElements.exit()
            .transition()
            .duration(500)
            .style('opacity', 0)
            .remove();

        /* create new svg elements for new channels */
        let channelRoots = this._channelElements.enter().append('g')
            .attr('class', 'channel');
        createChannelElements(channelRoots, opt);
        this._channelElements.merge(channelRoots)
            .attr('id', (d) => d.id);

        /* update this._paths; needed in this._ticked */
        this._channelElements = this.channelContainer
            .selectAll('.channel .path');

        this.simulation
            .force('link')
            .links(this._channels);

        this.simulation
            .alphaTarget(0)
            .restart();
    }

    _ticked() {
        if (this._nodeElements) {
            this._nodeElements.attr('transform', (d) => `translate(${d.x},${d.y})`);
        }

        if (this._channelElements) {
            this._channelElements.attr('d', (d) => `M${d.source.x},${d.source.y} ${d.target.x},${d.target.y}`);
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
