function createNodeElements(nodeParent, opt) {
    nodeParent
        .attr('class', 'node')
        .attr('id', (data) => data.id)
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
}