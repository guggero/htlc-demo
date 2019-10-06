function tickChannelElements(elems) {
    elems.selectAll('.channel .path')
        .attr('d', d => `M${d.source.x},${d.source.y} ${d.target.x},${d.target.y}`);
    
    elems.selectAll('.channel .id-spendpathleft')
        .attr('d', d => {
            const delta = _pointDiff(d.source, d.target);
            const leftX = d.source.x + boxWidth;
            const leftY = d.source.y + boxOffsetY;
            const fundingX = d.source.x + delta.x;
            const fundingY = d.source.y + delta.y + outputHeight + 3*gap;
            
            return `M${leftX},${leftY} ${fundingX},${fundingY}`
        });

    elems.selectAll('.channel .id-spendpathright')
        .attr('d', d => {
            const delta = _pointDiff(d.source, d.target);
            const rightX = d.target.x - boxWidth;
            const rightY = d.target.y + boxOffsetY;
            const fundingX = d.source.x + delta.x;
            const fundingY = d.source.y + delta.y + outputHeight + 3*gap;

            return `M${rightX},${rightY} ${fundingX},${fundingY}`
        });
    
    // place text at half the distance between source and target.
    elems.selectAll('.channel .id-text')
        .attr('dx', d => _pointDistance(d.source, d.target) / 2 - channelTextWidth / 2);
    
    // update node IDs in pubkeys.
    elems.selectAll('.channel .id-fundingscript')
        .text(d => '2 <' + d.source.id + '-pubkey> <' + d.target.id + '-pubkey> 2 CHECKMULTISIG');
    
    // update funding output
    elems.selectAll('.channel .id-funding')
        .text(d => d.sourceBalance + d.targetBalance,);
    
    // place funding tx at the same point but below the channel line.
    elems.selectAll('.channel .id-fundingtx')
        .attr('transform', d => {
            const delta = _pointDiff(d.source, d.target);
            const x = d.source.x ;//+ delta.x - (fundingBoxWidth / 2);
            const y = d.source.y ;//+ delta.y;
            const angleRads = Math.atan(delta.y / delta.x);
            const xOffset = fundingBoxWidth / 2;
            const yOffset = gap;
            const diffX = (Math.cos(angleRads) * delta.x) - (Math.cos(angleRads) * xOffset);
            const diffY = (Math.sin(angleRads) * delta.y) + yOffset;
            const degrees = angleRads * (180/Math.PI);
            return `translate(${x + diffX},${y + diffY}) rotate(${degrees})`;
        });
}

function updateChannelElements(root) {
    root.selectAll('.channel .id-text textPath')
        .text(d => `capacity: ${d.sourceBalance + d.targetBalance}, cltv: ${d.cltv}`)
}

function createChannelElements(root, opt) {
    // parent node properties
    root
        .attr('class', 'channel')
        .attr('id', d => d.id);
    
    // channel line
    root.append('path')
        .attr('class', 'path')
        .attr('id', (d) => `${d.id}_path`)
        .style('stroke-width', opt.channels.strokeWidth)
        .style('stroke', opt.channels.color);

    // channel text path
    const text = root.append('text')
        .attr('class', 'id-text info-text')
        .attr('dy', -7);

    text.append('textPath')
        .attr('xlink:href', (d) => `#${d.id}_path`)
        .style('fill', opt.channels.color);
    
    // funding TX
    const funding = root.append('g')
        .attr('class', 'id-fundingtx');
    funding.append('rect')
        .attr('class', 'solid-border')
        .attr('width', fundingBoxWidth)
        .attr('height', outputHeight + 2*gap)
        .attr('fill', '#fff')
        .attr('rx', 3);

    // funding TX output
    funding.append('rect')
        .attr('class', 'dotted-border')
        .attr('x', gap)
        .attr('y', gap)
        .attr('width', fundingBoxWidth - 2*gap)
        .attr('height', outputHeight)
        .attr('fill', '#f6ffbc');

    // funding TX output amount
    _singleOutputAmount(
        funding,
        fundingBoxWidth - 5.5*gap,
        1.5*gap,
        '#f6ffbc',
        'funding'
    );

    // funding output script
    funding.append('text')
        .attr('class', 'id-fundingscript code-text')
        .attr('x', 1.5*gap)
        .attr('y', gap + outputHeight/2 + fontSize/2 - fontOffset);
    
    // spend path left
    root.append('path')
        .attr('class', 'id-spendpathleft')
        .style('stroke-width', 1)
        .style('stroke', 'black');

    // spend path right
    root.append('path')
        .attr('class', 'id-spendpathright')
        .style('stroke-width', 1)
        .style('stroke', 'black');
}
