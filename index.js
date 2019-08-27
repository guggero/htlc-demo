const d3 = window.d3;

class Demo {
    constructor() {
        this.container = document.querySelector('#container');
        this.svg = d3.select(this.container)
            .append('svg')
            .attr('class', 'demo')
            .style('background-color', 'grey');

        this.updateSVGSize();

        this.chart = this.svg.append('g')
            .attr('class', 'chart')
            .attr('transform', 'translate(0, 0) scale(1)');

        this._nodes = [];
        this._channels = [];
        this.simulation = this._createSimulation();
        this.behaviors = this.createBehaviors();
        this.svg.call(this.behaviors.zoom);

        window.addEventListener("resize", this.onResize.bind(this));
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
        this.createBehaviors();
    }

    createBehaviors() {
        return {
            zoom: d3.zoom()
                .scaleExtent([0.1, 5, 4])
                .on("zoom", () => this.chart.attr("transform", d3.event.transform)),

            drag: d3.drag()
                .on("start", this._onDragStart.bind(this))
                .on("drag", this._onDragged.bind(this))
                .on("end", this._onDragendEnd.bind(this))
        }
    }

    _createSimulation() {
        return d3.forceSimulation(this._nodes)
            .force("charge", d3.forceManyBody().strength(-3000))
            .force("link", d3.forceLink(this._channels).strength(0.005).distance(this.forceDistance))
            .force("x", d3.forceX())
            .force("y", d3.forceY())
            .alphaTarget(0)
            .on("tick", this._ticked.bind(this));
    }

    _ticked() {

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

new Demo();
