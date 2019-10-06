const scriptCommitment = [
    'IF',
    '  <revocation-pubkey>',
    'ELSE',
    '  CHECKSEQUENCE \u231b',
    '  <local-pubkey>'
];

const scriptReceiver = [
    'IF',
    '  <revocation-pubkey>',
    'ELSE',
    '  IF hash(<preimage>)',
    '    <sendr-pubkey>',
    '  ELSE',
    '    <recvr-pubkey>'
];

const scriptSender = [
    'IF',
    '  <revocation-pubkey>',
    'ELSE',
    '  IF hash(<preimage>)',
    '     <recvr-pubkey>',
    '  ELSE',
    '    CHECKLOCKTIME \u23f1',
    '    <sendr-pubkey>'
];

function tickNodeElements(elems) {
    elems.attr('transform', d => `translate(${d.x},${d.y})`);
}

function updateNodeElements(root) {
    // ID text
    root.selectAll('.node .id-id')
        .text(d => d.id);
    
    updateTxs(root, 'left');
    updateTxs(root, 'right');
}

function updateTxs(root, side) {
    const isLeft = side === 'left';
    const heightHtlc = isLeft ? heightHtlcLeft : heightHtlcRight;
    
    // height of TX box
    root.selectAll('.node .id-txbox-' + side)
        .attr('height', d => d[side].hasHtlc ? heightHtlc : height);

    // nodelay output value
    root.selectAll('.node .' + side + ' .id-nodelay')
        .text(d => isLeft
            ? d.left.sourceBalance - d.left.htlcAmount
            : d.right.targetBalance - d.right.htlcAmount
        );

    // revocation output value
    root.selectAll('.node .' + side + ' .id-revocation')
        .text(d => isLeft
            ? d.left.targetBalance
            : d.right.sourceBalance - d.right.htlcAmount
        );

    // delay output value
    root.selectAll('.node .' + side + ' .id-delay')
        .text(d => isLeft
            ? d.left.targetBalance
            : d.right.sourceBalance - d.right.htlcAmount
        );

    // HTLC visibility
    root.selectAll('.node .id-htlc-' + side)
        .attr('visibility', d => d[side].hasHtlc ? 'visible' : 'hidden');
    
    // HTLC value
    root.selectAll('.node .id-htlc-' + side + ' .id-htlc-amt')
        .text(d => d[side].htlcAmount);
}

function createNodeElements(root, opt) {
    // parent node properties
    root
        .attr('class', 'node')
        .attr('id', d => d.id)
        .style('stroke', opt.nodes.strokeColor)
        .style('stroke-width', opt.nodes.strokeWidth);

    // circle
    root.append('circle')
        .attr('fill', d => d.color)
        .attr('r', opt.nodes.radius);

    // ID text
    root.append('text')
        .attr('class', 'id-id info-text text-bold text-large text-middle')
        .attr('fill', opt.container.backgroundColor)
        .attr('y', 5);

    // left commitment TX
    const left = root
        .filter(d => !!d.left)
        .append('g')
        .attr('class', 'left')
        .attr('transform', `translate(${-boxWidth - boxOffsetX},${boxOffsetY})`);
    drawTxBox(left, true);

    // right commitment TX
    const right = root
        .filter(d => !!d.right)
        .append('g')
        .attr('class', 'right')
        .attr('transform', `translate(${boxOffsetX}, ${boxOffsetY})`);
    drawTxBox(right, false);
}

function drawTxBox(node, isLeft) {
    // TX box
    node.append('rect')
        .attr('class', 'id-txbox' + (isLeft ? '-left' : '-right') + ' solid-border')
        .attr('width', boxWidth)
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
        d => isLeft ? d.left.source.color : d.right.target.color,
        'nodelay'
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
    _multilineText(multiline, scriptCommitment);

    _combinedOutputAmount(
        node,
        boxWidth - 5.5*gap,
        1.5*gap + outputHeight + lineHeight + gap,
        d => isLeft ? d.left.source.color : d.right.target.color,
        'revocation'
    );

    // delayed output amount
    _singleOutputAmount(
        node,
        boxWidth - 5.5*gap,
        1.5*gap + outputHeight + 4*lineHeight + gap,
        d => isLeft ? d.left.target.color : d.right.source.color,
        'delay'
    );
    
    // HTLC only if there is one
    const htlcY = delayTxY + 5*lineHeight + gap;
    const htlc = node
        .append('g')
        .attr('class', 'id-htlc' + (isLeft ? '-left' : '-right'))
        .attr('transform', `translate(0, ${htlcY})`);
    drawHtlc(htlc, isLeft);
}

function drawHtlc(node, isReceiver) {
    // htlc output box
    node.append('rect')
        .attr('class', 'dotted-border')
        .attr('x', gap)
        .attr('y', gap)
        .attr('width', boxWidth - 2*gap)
        .attr('height', isReceiver ? 7*outputHeight : 8*outputHeight)
        .attr('fill', '#bdffb7');
    
    // delay output text
    const multiline = node.append('text')
        .attr('class', 'code-text')
        .attr('x', 1.5*gap)
        .attr('y', gap + outputHeight/2 + fontSize/2 - fontOffset);
    _multilineText(multiline, isReceiver ? scriptReceiver : scriptSender);

    // revocation output amount
    _combinedOutputAmount(
        node,
        boxWidth - 5.5*gap,
        1.5*gap + lineHeight,
        d => isReceiver ? d.left.source.color : d.right.target.color,
        'htlc-amt'
    );

    // htlc claim output amount
    _singleOutputAmount(
        node,
        boxWidth - 5.5*gap,
        1.5*gap + 4*lineHeight,
        d => isReceiver ? d.left.source.color : d.right.target.color,
        'htlc-amt'
    );
    
    if (isReceiver) {
        // timeout output amount
        _singleOutputAmount(
            node,
            boxWidth - 5.5*gap,
            1.5*gap + 6*lineHeight,
            d => d.left.target.color,
            'htlc-amt'
        );
    } else {
        // timeout output amount
        _singleOutputAmount(
            node,
            boxWidth - 5.5*gap,
            1.5*gap + 7*lineHeight,
            d => d.right.source.color,
            'htlc-amt'
        );
    }
}
