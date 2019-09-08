function createNodeElements(nodeParent, opt) {
    // parent node properties
    nodeParent
        .attr('class', 'node')
        .attr('id', (d) => d.id)
        .style('stroke', opt.nodes.strokeColor)
        .style('stroke-width', opt.nodes.strokeWidth);

    // circle
    nodeParent.append('circle')
        .attr('fill', (d) => d.color)
        .attr('r', opt.nodes.radius);

    // ID text
    nodeParent.append('text')
        .attr('class', 'info-text text-bold text-large text-middle')
        .attr('fill', opt.container.backgroundColor)
        .attr('y', 5)
        .text((d) => d.id);

    // left commitment TX
    const left = nodeParent
        .filter((d) => !!d.left)
        .append('g')
        .attr('transform', `translate(${-boxWidth - boxOffsetX},${boxOffsetY})`);
    drawTxBox(left, true);

    // right commitment TX
    const right = nodeParent
        .filter((d) => !!d.right)
        .append('g')
        .attr('transform', `translate(${boxOffsetX}, ${boxOffsetY})`);
    drawTxBox(right, false);
}

function drawTxBox(node, isLeft) {
    // TX box
    node.append('rect')
        .attr('class', 'solid-border')
        .attr('width', boxWidth)
        .attr('height', (d) => d.hasHtlc ? heightHtlc : height)
        .attr('fill', '#fff')
        .attr('rx', 3);

    // nodelay output box
    node.append('rect')
        .attr('class', 'dotted-border')
        .attr('x', gap)
        .attr('y', gap)
        .attr('width', boxWidth - 2*gap)
        .attr('height', outputHeight)
        .attr('fill', '#D0FEEA');

    // nodelay output amount
    _singleOutputAmount(
        node,
        boxWidth - 5.5*gap,
        1.5*gap,
        (d) => isLeft ? d.left.source.color : d.right.target.color,
        (d) => isLeft ? d.left.sourceBalance : d.right.targetBalance
    );

    // nodelay output script
    node.append('text')
        .attr('class', 'code-text')
        .attr('x', 1.5*gap)
        .attr('y', gap + outputHeight/2 + fontSize/2 - fontOffset)
        .text(() => '<remote-pubkey>');

    const delayTxY = gap + outputHeight;

    // delay output
    const delay = node.append('g')
        .attr('transform', `translate(0,${delayTxY})`);

    // delay output box
    delay.append('rect')
        .attr('class', 'dotted-border')
        .attr('x', gap)
        .attr('y', gap)
        .attr('width', boxWidth - 2*gap)
        .attr('height', 5*outputHeight)
        .attr('fill', '#FEE8F8');

    // delay output text
    const multiline = delay.append('text')
        .attr('class', 'code-text')
        .attr('x', 1.5*gap)
        .attr('y', gap + outputHeight/2 + fontSize/2 - fontOffset);
    _multilineText(multiline, ['IF', '  <revocation-pubkey>', 'ELSE', '  CHECKSEQUENCE \u23F1', '  <local-pubkey>']);

    _combinedOutputAmount(
        node,
        boxWidth - 5.5*gap,
        1.5*gap + outputHeight + lineHeight + gap,
        (d) => isLeft ? d.left.source.color : d.right.target.color,
        (d) => isLeft ? d.left.targetBalance : d.right.sourceBalance
    );

    // delayed output amount
    _singleOutputAmount(
        node,
        boxWidth - 5.5*gap,
        1.5*gap + outputHeight + 4*lineHeight + gap,
        (d) => isLeft ? d.left.target.color : d.right.source.color,
        (d) => isLeft ? d.left.targetBalance : d.right.sourceBalance
    );
    
    // HTLC only if there is one
    const htlcY = delayTxY + 5*lineHeight + gap;
    const htlc = node
        .filter((d) => d.hasHtlc)
        .append('g')
        .attr('transform', `translate(0, ${htlcY})`);
    drawHtlc(htlc, isLeft);
}

function drawHtlc(node, isLeft) {
    // htlc output box
    node.append('rect')
        .attr('class', 'dotted-border')
        .attr('x', gap)
        .attr('y', gap)
        .attr('width', boxWidth - 2*gap)
        .attr('height', 5*outputHeight)
        .attr('fill', '#bdffb7')
}
