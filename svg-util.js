const boxOffsetY = 80;
const boxOffsetX = 24;
const gap = 8;
const boxWidth = 400;
const outputHeight = 25;
const height = 6*outputHeight + 3*gap;
const heightHtlcRight = height + 8*outputHeight + gap;
const heightHtlcLeft = height + 7*outputHeight + gap;
const fontSize = 14;
const fontOffset = 2;
const lineHeight = outputHeight;
const outputAmountWidth = 4*gap;
const outputAmountHeight = outputHeight - gap;
const channelTextWidth = 120;
const fundingBoxWidth = 450;

function _isArray(obj) {
    return Array.isArray(obj);
}

function _isFunction(obj) {
    return obj && {}.toString.call(obj) === '[object Function]';
}

function _multilineText(elem, lines) {
    lines.forEach((line, index) => {
        elem.append('tspan')
            .attr('x', 1.5*gap)
            .attr('dy', `${index === 0 ? 0 : lineHeight}px`)
            .style('white-space', 'pre')
            .text(line);
    });
}

function _textRight(node, x, y, id) {
    node.append('text')
        .attr('class', 'id-' + id + ' code-text text-right')
        .attr('x', x + outputAmountWidth - 0.5*gap)
        .attr('y', y - 0.5*gap + outputHeight/2 + fontSize/2 - fontOffset);
}

function _singleOutputAmount(node, x, y, color, id) {
    // output color
    node.append('rect')
        .attr('fill', color)
        .attr('x', x)
        .attr('y', y)
        .attr('width', outputAmountWidth)
        .attr('height', outputAmountHeight)
        .attr('rx', 2);

    // output amount text
    _textRight(node, x, y, id);
}

function _combinedOutputAmount(node, x, y, color, id) {
    // output color variable part
    node.append('polygon')
        .attr('fill', color)
        .attr('points', `${x},${y} ${x + outputAmountWidth},${y} ${x},${y + outputAmountHeight}`);

    // output color fixed part (red)
    node.append('polygon')
        .attr('fill', '#f00')
        .attr('points', `${x + outputAmountWidth},${y} ${x + outputAmountWidth},${y + outputAmountHeight} ${x},${y + outputAmountHeight}`);

    // output amount text
    _textRight(node, x, y, id);
}

function _pointDistance(a, b) {
    const dx = Math.abs(b.x - a.x);
    const dy = Math.abs(b.y - a.y);
    return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
}

function _pointDiff(a, b) {
    const dx = (b.x - a.x) / 2;
    const dy = (b.y - a.y) / 2;
    return {
        x: dx,
        y: dy,
    };
}