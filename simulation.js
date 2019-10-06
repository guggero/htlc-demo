class Simulation {
    constructor(nodes, channels, options) {
        this._opt = options;
        this.container = document.querySelector(options.container.selector);
        this.svg = d3.select(this.container)
            .append('svg')
            .attr('class', 'demo')
            .style('background-color', options.container.backgroundColor);

        this._updateSVGSize();

        this.chart = this.svg.append('g')
            .attr('class', 'chart')
            .attr('transform', 'translate(0, 0) scale(1)');
        this.channelContainer = this.chart.append('g').attr('class', 'channels');
        this.nodeContainer = this.chart.append('g').attr('class', 'nodes');

        this.behaviors = this._createBehaviors();
        this.svg.call(this.behaviors.zoom);

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
        
        this.onDataUpdate(nodes, channels);

        this.simulation = this._createSimulation();
        
        this._updateSimulationCenter();
        
        window.addEventListener('resize', this._onResize.bind(this));
    }

    onDataUpdate(nodes, channels) {
        this._updateNodes();
        this._updateChannels();
    }
    
    _onResize() {
        this._updateSVGSize();
        this._updateSimulationCenter();
        this._createBehaviors();
    }

    _updateSVGSize() {
        this.width = +this.container.clientWidth;
        this.height = +this.container.clientHeight;
        this.forceDistance = (this.width + this.height) * .1;
        this.svg
            .attr('width', this.width)
            .attr('height', this.height)
    }

    _updateSimulationCenter() {
        const centerX = this.svg.attr('width') / 2;
        const centerY = 100;
        this.simulation
            .force('center', d3.forceCenter(centerX, centerY))
            .restart();
    }

    _createBehaviors() {
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

        const nodes = this.nodeContainer.selectAll('.node')
            .data(this._nodes);

        /* remove deleted nodes */
        nodes.exit()
            .transition()
            .duration(1000)
            .style('opacity', 0)
            .remove();

        /* create new nodes */
        const enter = nodes.enter().append('g');
        createNodeElements(enter, opt);
        enter.call(this.behaviors.drag);

        this._nodeElements = enter.merge(nodes);
        updateNodeElements(this._nodeElements, opt);
    }

    _updateChannels() {
        const opt = this._opt;

        const channels = this.channelContainer.selectAll('.channel')
            .data(this._channels);

        /* remove channels that no longer exist */
        channels.exit()
            .transition()
            .duration(500)
            .style('opacity', 0)
            .remove();

        /* create new channels */
        let enter = channels.enter().append('g');
        createChannelElements(enter, opt);

        this._channelElements = enter.merge(channels);
        updateChannelElements(this._channelElements, opt);
    }

    _ticked() {
        if (this._nodeElements) {
            tickNodeElements(this._nodeElements);
        }

        if (this._channelElements) {
            tickChannelElements(this._channelElements);
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
