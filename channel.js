function createChannelElements(channelRoots, opt) {
    // channel line
    channelRoots.append('path')
        .attr('class', 'path')
        .attr('id', (d) => `${d.id}_path`)
        .style('stroke-width', opt.channels.strokeWidth)
        .style('stroke', opt.channels.color);

    // channel text path
    const text = channelRoots.append('text')
        .attr('class', 'info-text')
        .attr('dx', 150)
        .attr('dy', -7);
    
    text.append('textPath')
        .attr('xlink:href', (d) => `#${d.id}_path`)
        .style('fill', opt.channels.color)
        .text((d) => `capacity: ${d.capacity}, cltv: ${d.cltv}`);
}
