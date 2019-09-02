const gap = 8;
const width = 250;
const outputHeight = 25;
const height = 6*outputHeight + 3*gap;
const heightHtlc = height + 5*outputHeight + gap;
const fontSize = 14;
const fontOffset = 2;

function multilineText(elem, lines) {
    lines.forEach((line, index) => {
        elem.append('tspan')
            .attr('x', 1.5*gap)
            .attr('dy', `${index === 0 ? 0 : 1.7}em`)
            .style('white-space', 'pre')
            .text(line);
    });
}

function createNodeElements(nodeParent, opt) {
    // parent node properties
    nodeParent
        .attr('class', 'node')
        .attr('id', (d) => d.id)
        .style('cursor', 'pointer')
        .style('stroke', opt.nodes.strokeColor)
        .style('stroke-width', opt.nodes.strokeWidth);

    // circle
    nodeParent.append('circle')
        .attr('fill', (d) => d.color)
        .attr('r', opt.nodes.radius);

    // ID text
    nodeParent.append('text')
        .attr('stroke', opt.container.backgroundColor)
        .attr('stroke-width', 0.5)
        .attr('fill', opt.container.backgroundColor)
        .attr('font-family', 'sans-serif')
        .attr('font-size', 15)
        .attr('y', 5)
        .attr('text-anchor', 'middle')
        .attr('pointer-events', 'none')
        .text((d) => d.id);

    // left commitment TX
    const left = nodeParent
        .filter((d) => !!d.left)
        .append('g')
        .attr('transform', 'translate(-262,30)');
    fillTxBox(left, true);

    // right commitment TX
    const right = nodeParent
        .filter((d) => !!d.right)
        .append('g')
        .attr('transform', 'translate(12, 30)');
    fillTxBox(right, false);
}

function fillTxBox(node, isLeft) {
    // TX box
    node.append('rect')
        .attr('width', width)
        .attr('height', height)
        .attr('fill', '#fff')
        .attr('fill-opacity', 0.8)
        .attr('stroke', 'black')
        .attr('stroke-width', 2)
        .attr('stroke-opacity', 0.8)
        .attr('rx', 3);

    // nodelay output box
    node.append('rect')
        .attr('x', gap)
        .attr('y', gap)
        .attr('width', width - 2*gap)
        .attr('height', outputHeight)
        .attr('stroke', '#8DDCFE')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '3,5')
        .attr('fill', '#D0FEEA')
        .attr('fill-opacity', 0.8);

    // nodelay output color
    node.append('rect')
        .attr('fill', (d) => isLeft ? d.left.source.color : d.right.target.color)
        .attr('x', width - 5.5*gap)
        .attr('y', 1.5*gap)
        .attr('width', 4*gap)
        .attr('height', outputHeight - gap)
        .attr('rx', 2);

    // nodelay output amount text
    node.append('text')
        .attr('x', width - 2*gap)
        .attr('y', gap + outputHeight/2 + fontSize/2 - fontOffset)
        .attr('fill', 'black')
        .attr('font-family', 'sans-serif')
        .attr('font-size', fontSize)
        .attr('text-anchor', 'end')
        .attr('pointer-events', 'none')
        .text((d) => isLeft ? d.left.sourceBalance : d.right.targetBalance);

    // nodelay output text
    node.append('text')
        .attr('x', 1.5*gap)
        .attr('y', gap + outputHeight/2 + fontSize/2 - fontOffset)
        .attr('fill', 'black')
        .attr('font-family', 'sans-serif')
        .attr('font-size', fontSize)
        .attr('text-anchor', 'start')
        .attr('pointer-events', 'none')
        .text(() => 'remotepubkey');

    const delayTxY = gap + outputHeight;

    // delay output
    const delay = node.append('g')
        .attr('transform', `translate(0,${delayTxY})`);

    // delay output box
    delay.append('rect')
        .attr('x', gap)
        .attr('y', gap)
        .attr('width', width - 2*gap)
        .attr('height', 5*outputHeight)
        .attr('stroke', '#8DDCFE')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '3,5')
        .attr('fill', '#FEE8F8')
        .attr('fill-opacity', 0.8);

    // delay output text
    const multiline = delay.append('text')
        .attr('x', 1.5*gap)
        .attr('y', gap + outputHeight/2 + fontSize/2 - fontOffset)
        .attr('fill', 'black')
        .attr('font-family', 'sans-serif')
        .attr('font-size', fontSize)
        .attr('text-anchor', 'start')
        .attr('pointer-events', 'none');
    multilineText(multiline, ['IF', '    revocationpubkey', 'ELSE', '    CSV', '    local_delayedpubkey'])
}
