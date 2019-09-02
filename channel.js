function createChannelElements(channelRoots, opt) {
    channelRoots.append('path')
        .attr('class', 'path')
        .attr('id', (d) => `${d.id}_path`)
        .style('stroke-width', opt.channels.strokeWidth)
        .style('stroke', opt.channels.color)
        .style('fill', 'none');

    channelRoots.append('text')
        .attr('class', 'channel-text')
        .attr('font-family', 'Verdana')
        .attr('font-size', '12')
        .attr('dx', 150)
        .attr('dy', -7)
        .style('pointer-events', 'none')
        .append('textPath')
        .attr('xlink:href', (d) => `#${d.id}_path`)
        .attr('class', 'channel-text-path')
        .style('stroke-width', 1)
        .style('stroke', opt.channels.color)
        .style('fill', 'none')
        .text((d) => `capacity: ${d.capacity}, cltv: ${d.cltv}`);
}